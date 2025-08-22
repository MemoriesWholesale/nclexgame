/**
 * GameEvents - Handles all keyboard and mouse event processing
 */
export class GameEvents {
    constructor(gameState, player, canvas, levelData, gameActions) {
        this.gameState = gameState;
        this.player = player;
        this.canvas = canvas;
        this.levelData = levelData;
        this.gameActions = gameActions;
        this.keys = {};
        this.canFire = true;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.setupKeyboardEvents();
        this.setupMouseEvents();
    }
    
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.handleKeyUp(e);
        });
    }
    
    setupMouseEvents() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.handleMouseClick(mouseX, mouseY);
        });
    }
    
    handleKeyDown(e) {
        const currentState = this.gameState.current;
        
        // Game state transitions
        if (e.key === 'Enter') {
            if (currentState === 'playing') {
                this.gameState.current = 'paused';
            } else if (currentState === 'paused') {
                this.gameState.current = 'playing';
            }
            return;
        }
        
        // Player actions (only when playing and alive)
        if (currentState === 'playing' && !this.player.dead) {
            this.handlePlayerKeyDown(e);
        }
    }
    
    handlePlayerKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'q':
                this.player.switchArmor();
                break;
            case 'e':
                this.gameActions.handleInteraction();
                break;
            case ' ':
                if (this.canFire) {
                    this.gameActions.fireWeapon();
                    this.player.startShooting();
                    this.canFire = false;
                }
                break;
        }
    }
    
    handleKeyUp(e) {
        if (e.key === ' ') {
            this.canFire = true;
        }
    }
    
    handleMouseClick(mouseX, mouseY) {
        const currentState = this.gameState.current;
        
        switch (currentState) {
            case 'menu':
                this.handleMenuClick(mouseX, mouseY);
                break;
            case 'paused':
                this.handlePauseMenuClick(mouseX, mouseY);
                break;
            case 'quiz':
                this.handleQuizClick(mouseX, mouseY);
                break;
        }
    }
    
    handleMenuClick(mouseX, mouseY) {
        const buttonsPerRow = 4;
        const buttonWidth = 150;
        const buttonHeight = 80;
        const startX = (this.canvas.width - (buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * 20)) / 2;
        const startY = this.canvas.height * 0.3;
        
        for (let i = 0; i < this.levelData.length; i++) {
            const row = Math.floor(i / buttonsPerRow);
            const col = i % buttonsPerRow;
            const btnX = startX + col * (buttonWidth + 20);
            const btnY = startY + row * (buttonHeight + 20);
            
            if (this.isPointInRect(mouseX, mouseY, btnX, btnY, buttonWidth, buttonHeight)) {
                this.gameActions.selectLevel(i);
                break;
            }
        }
    }
    
    handlePauseMenuClick(mouseX, mouseY) {
        const panelWidth = Math.min(400, this.canvas.width * 0.8);
        const panelHeight = 200;
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        const buttonWidth = panelWidth - 60;
        const buttonHeight = 50;
        
        const resumeX = panelX + 30;
        const resumeY = panelY + 60;
        const selectX = resumeX;
        const selectY = resumeY + buttonHeight + 20;
        
        if (this.isPointInRect(mouseX, mouseY, resumeX, resumeY, buttonWidth, buttonHeight)) {
            this.gameState.current = 'playing';
        } else if (this.isPointInRect(mouseX, mouseY, selectX, selectY, buttonWidth, buttonHeight)) {
            this.gameActions.returnToLevelSelect();
        }
    }
    
    handleQuizClick(mouseX, mouseY) {
        this.gameActions.handleQuizClick(mouseX, mouseY);
    }
    
    isPointInRect(x, y, rectX, rectY, width, height) {
        return x >= rectX && x <= rectX + width && y >= rectY && y <= rectY + height;
    }
    
    getKeys() {
        return this.keys;
    }
}