// Quiz/question logic goes here

export class Quiz {
    constructor() {
        this.questionBank = [];
        this.availableQuestions = [];
        this.currentQuestion = null;
    }
    
    // Load questions from JSON file
    async loadQuestions(filepath) {
        try {
            const response = await fetch(filepath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.questionBank = await response.json();
            this.availableQuestions = [...this.questionBank];
            return true;
        } catch (error) {
            console.error("Could not load question file:", error);
            return false;
        }
    }
    
    // Shuffle array using Fisher-Yates algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Get a random question and prepare it for display
    askQuestion(interactionId, originalInteractionId = null) {
        if (this.availableQuestions.length === 0) {
            this.availableQuestions = [...this.questionBank];
        }

        const qIndex = Math.floor(Math.random() * this.availableQuestions.length);
        const questionData = this.availableQuestions.splice(qIndex, 1)[0];

        const correctAnswer = questionData.answers[0];
        let shuffledAnswers = [...questionData.answers];
        this.shuffleArray(shuffledAnswers);

        this.currentQuestion = {
            q: questionData.q,
            correctAnswer: correctAnswer,
            shuffledAnswers: shuffledAnswers.map(ans => ({ text: ans })),
            answered: false,
            isCorrect: false,
            playerAnswer: null,
            interactionId: interactionId,
            originalInteractionId: originalInteractionId
        };

        return this.currentQuestion;
    }
    
    // Handle answer selection
    selectAnswer(answer) {
        if (!this.currentQuestion || this.currentQuestion.answered) return false;
        
        this.currentQuestion.answered = true;
        this.currentQuestion.playerAnswer = answer.text;
        this.currentQuestion.isCorrect = (answer.text === this.currentQuestion.correctAnswer);
        
        return true;
    }
    
    // Check if mouse click is on an answer
    checkAnswerClick(mouseX, mouseY) {
        if (!this.currentQuestion || this.currentQuestion.answered) return null;
        
        for (const answer of this.currentQuestion.shuffledAnswers) {
            if (mouseX >= answer.x && mouseX <= answer.x + answer.width &&
                mouseY >= answer.y && mouseY <= answer.y + answer.height) {
                return answer;
            }
        }
        return null;
    }
    
    // Draw the quiz interface
    drawQuiz(ctx, canvas) {
        if (!this.currentQuestion) return;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const boxWidth = canvas.width * 0.8;
        const boxHeight = canvas.height * 0.7;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = (canvas.height - boxHeight) / 2;
        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        const questionText = this.currentQuestion.q;
        const textX = canvas.width / 2;
        let textY = boxY + 40;
        const maxWidth = boxWidth - 40;
        const words = questionText.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                ctx.fillText(line, textX, textY);
                line = words[n] + ' ';
                textY += 25;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, textX, textY);

        textY += 60;
        const answerLetters = ['A', 'B', 'C', 'D'];
        const answerBoxWidth = boxWidth - 80;
        const answerBoxHeight = 50;
        
        this.currentQuestion.shuffledAnswers.forEach((answer, index) => {
            const ansX = boxX + 40;
            const ansY = textY + (index * (answerBoxHeight + 15));
            answer.x = ansX;
            answer.y = ansY;
            answer.width = answerBoxWidth;
            answer.height = answerBoxHeight;
            ctx.strokeStyle = '#888';
            ctx.fillStyle = '#333';
            if (this.currentQuestion.answered) {
                if (answer.text === this.currentQuestion.correctAnswer) {
                    ctx.fillStyle = '#006400';
                } else if (answer.text === this.currentQuestion.playerAnswer) {
                    ctx.fillStyle = '#8B0000';
                }
            }
            ctx.fillRect(ansX, ansY, answerBoxWidth, answerBoxHeight);
            ctx.strokeRect(ansX, ansY, answerBoxWidth, answerBoxHeight);
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${answerLetters[index]}. ${answer.text}`, ansX + 15, ansY + 30);
        });
        
        if (this.currentQuestion.answered) {
            ctx.fillStyle = this.currentQuestion.isCorrect ? '#90EE90' : '#F08080';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            const resultText = this.currentQuestion.isCorrect ? 'Correct!' : 'Incorrect';
            ctx.fillText(resultText, canvas.width / 2, boxY + boxHeight - 60);
            ctx.fillStyle = 'white';
            ctx.font = '18px Arial';
            ctx.fillText("Click anywhere to continue...", canvas.width / 2, boxY + boxHeight - 30);
        }
    }
    
    // Get current question
    getCurrentQuestion() {
        return this.currentQuestion;
    }
    
    // Clear current question
    clearCurrentQuestion() {
        this.currentQuestion = null;
    }
    
    // Check if quiz is ready (has questions loaded)
    isReady() {
        return this.questionBank.length > 0;
    }
}