/**
 * GameActions - Handles game actions like level selection, interactions, and combat
 */
export class GameActions {
    constructor(gameState, player, levelManager, quiz, enemyManager) {
        this.gameState = gameState;
        this.player = player;
        this.levelManager = levelManager;
        this.quiz = quiz;
        this.enemyManager = enemyManager;
    }
    
    /**
     * Select and start a level
     */
    async selectLevel(levelIndex) {
        this.gameState.selectedLevel = levelIndex;
        await this.startGame();
    }
    
    /**
     * Start the game with the selected level
     */
    async startGame() {
        // Clear level content and reset state
        this.levelManager.clearLevelContent(
            this.gameState.platforms, this.gameState.npcs, this.gameState.chests,
            this.gameState.hazards, this.gameState.pits, this.gameState.powerups,
            this.gameState.medications, this.gameState.interactionZones,
            this.gameState.hiddenPlatforms, this.gameState.projectiles, this.gameState.pickups
        );
        
        this.gameState.current = 'playing';
        this.gameState.groundY = this.gameState.canvas?.height - 100 || 500;
        this.player.reset(this.gameState.groundY);
        this.gameState.resetForNewLevel();
        this.enemyManager.clear();
        this.quiz.clearCurrentQuestion();
        
        if (this.gameState.selectedLevel !== -1) {
            try {
                await this.levelManager.loadLevel(this.gameState.selectedLevel);
                const levelDef = this.levelManager.getLevelData();
                
                if (!levelDef) {
                    throw new Error("Failed to load level definition");
                }
                
                this.gameState.testLevelEndX = levelDef.worldLength || 10800;
                
                // Set up gate
                this.gameState.gate = {
                    worldX: this.gameState.testLevelEndX,
                    width: 60,
                    height: 150,
                    hp: 5,
                    maxHp: 5
                };
                
                // Position player
                this.player.x = levelDef.playerStart.x || 100;
                const startY = this.levelManager.parsePosition(levelDef.playerStart.y, this.gameState.canvas);
                this.player.y = startY - this.player.height;
                
                // Load level-specific content
                await this.loadLevelContent(levelDef);
                
                // Load quiz questions
                const questionFile = levelDef.questionFile || this.gameState.levelData[this.gameState.selectedLevel].file;
                await this.quiz.loadQuestions(questionFile);
                
            } catch (error) {
                console.error("Could not load level:", error);
                this.handleLevelLoadError();
            }
        }
    }
    
    /**
     * Load level-specific content like pits, zones, etc.
     */
    async loadLevelContent(levelDef) {
        // Load pits from hazards
        if (levelDef.hazards) {
            levelDef.hazards.forEach(hazard => {
                if (hazard.type === 'pit') {
                    this.gameState.pits.push({
                        worldX: hazard.x,
                        width: hazard.width
                    });
                }
            });
        }
        
        // Load special zones for specific levels
        if (this.gameState.selectedLevel === 1) {
            if (levelDef.interactionZones) {
                this.gameState.interactionZones.push(...levelDef.interactionZones);
            }
            if (levelDef.hiddenPlatforms) {
                this.gameState.hiddenPlatforms.push(...levelDef.hiddenPlatforms);
            }
        }
    }
    
    /**
     * Handle level load error
     */
    handleLevelLoadError() {
        alert("Error: Could not load level data. Please ensure all files are present.");
        this.returnToLevelSelect();
    }
    
    /**
     * Return to level select menu
     */
    returnToLevelSelect() {
        // Clear all level content
        this.levelManager.clearLevelContent(
            this.gameState.platforms, this.gameState.npcs, this.gameState.chests,
            this.gameState.hazards, this.gameState.pits, this.gameState.powerups,
            this.gameState.medications, this.gameState.interactionZones,
            this.gameState.hiddenPlatforms, this.gameState.projectiles, this.gameState.pickups
        );
        
        this.enemyManager.clear();
        this.gameState.boss = null;
        this.gameState.armorPickup = null;
        this.gameState.current = 'menu';
        this.gameState.selectedLevel = -1;
    }
    
    /**
     * Handle player interaction (E key)
     */
    handleInteraction() {
        // Check NPC interactions
        for (const npc of this.gameState.npcs) {
            if (this.isPlayerNearObject(npc) && !npc.isLeaving) {
                this.askQuestion(npc.activates, npc.interactionId);
                return;
            }
        }
        
        // Check chest interactions
        for (const chest of this.gameState.chests) {
            if (chest.state === 'closed' && this.isPlayerNearObject(chest)) {
                this.askQuestion(chest.id, chest.id);
                return;
            }
        }
    }
    
    /**
     * Check if player is near an interactive object
     */
    isPlayerNearObject(obj) {
        const screenX = obj.worldX + this.gameState.worldX;
        return this.player.x < screenX + obj.width && 
               this.player.x + this.player.width > screenX && 
               this.player.y < obj.y + obj.height && 
               this.player.y + this.player.height > obj.y;
    }
    
    /**
     * Ask a quiz question
     */
    askQuestion(interactionId, originalId) {
        this.quiz.askQuestion(interactionId, originalId);
        this.gameState.current = 'quiz';
    }
    
    /**
     * Handle quiz click interactions
     */
    handleQuizClick(mouseX, mouseY) {
        const currentQuestion = this.quiz.getCurrentQuestion();
        if (!currentQuestion) return;
        
        if (currentQuestion.answered) {
            this.handleQuizAnswer(currentQuestion);
        } else {
            const clickedAnswer = this.quiz.checkAnswerClick(mouseX, mouseY);
            if (clickedAnswer) {
                this.quiz.selectAnswer(clickedAnswer);
            }
        }
    }
    
    /**
     * Handle quiz answer results
     */
    handleQuizAnswer(currentQuestion) {
        if (currentQuestion.isCorrect) {
            this.handleCorrectAnswer(currentQuestion);
        } else {
            this.handleIncorrectAnswer(currentQuestion);
        }
        
        this.quiz.clearCurrentQuestion();
        this.gameState.current = 'playing';
    }
    
    /**
     * Handle correct quiz answer
     */
    handleCorrectAnswer(currentQuestion) {
        // Activate platforms if any are specified
        if (currentQuestion.interactionId) {
            const activationIds = currentQuestion.interactionId.split(',');
            activationIds.forEach(id => {
                const targetPlatform = this.gameState.platforms.find(p => p.id === id);
                if (targetPlatform) {
                    targetPlatform.activated = true;
                }
            });
        }

        // Handle chest rewards
        this.handleChestReward(currentQuestion);

        // Handle NPC medication rewards
        this.handleNPCReward(currentQuestion);
    }
    
    /**
     * Handle incorrect quiz answer
     */
    handleIncorrectAnswer(currentQuestion) {
        const interactingNpc = this.gameState.npcs.find(n => n.interactionId === currentQuestion.originalInteractionId);
        if (interactingNpc) {
            interactingNpc.isLeaving = true;
        }
    }
    
    /**
     * Handle chest reward opening
     */
    handleChestReward(currentQuestion) {
        const targetChest = this.gameState.chests.find(c => c.id === currentQuestion.interactionId);
        if (!targetChest) return;
        
        targetChest.state = 'open';
        
        const rewardX = targetChest.worldX + targetChest.width / 2 - 15;
        const rewardY = targetChest.y - 30;
        
        switch (targetChest.contains) {
            case 'medication':
                this.gameState.medications.push({
                    worldX: rewardX,
                    y: rewardY,
                    type: targetChest.subtype,
                    width: 30,
                    height: 30
                });
                break;
            case 'extra_life':
                this.gameState.powerups.push({
                    worldX: rewardX,
                    y: rewardY,
                    vy: -5,
                    type: 'life'
                });
                break;
            case 'weapon_upgrade':
                this.gameState.powerups.push({
                    worldX: rewardX,
                    y: rewardY,
                    vy: -5,
                    type: 'weapon',
                    weaponId: targetChest.weaponId
                });
                break;
        }
    }
    
    /**
     * Handle NPC medication reward
     */
    handleNPCReward(currentQuestion) {
        const interactingNpc = this.gameState.npcs.find(n => n.interactionId === currentQuestion.originalInteractionId);
        if (interactingNpc && interactingNpc.givesItem) {
            this.gameState.medications.push({
                worldX: interactingNpc.worldX + interactingNpc.width / 2 - 15,
                y: interactingNpc.y - 30,
                type: interactingNpc.givesItem,
                width: 30,
                height: 30
            });
            interactingNpc.isLeaving = true;
        }
    }
    
    /**
     * Fire the current weapon
     */
    fireWeapon() {
        if (!this.gameState.canFireWeapon()) return;
        
        // Handle special weapon restrictions
        if (this.gameState.currentWeapon === 3 || this.gameState.currentWeapon === 7) {
            const hasExistingProjectile = this.gameState.projectiles.some(proj => proj.type === this.gameState.currentWeapon);
            if (hasExistingProjectile) return;
        }
        
        this.gameState.setFireCooldown();
        this.createProjectile();
    }
    
    /**
     * Create projectile based on current weapon
     */
    createProjectile() {
        const weaponPos = this.player.getWeaponSpawnPos();
        const weaponYOffset = this.player.crouching ? 20 : 0;
        const currentWeapon = this.gameState.currentWeapon;
        
        const projectileConfigs = {
            1: { x: this.player.x + (this.player.facing > 0 ? this.player.width : -20), y: this.player.y + this.player.height / 2 - 5 + weaponYOffset, vx: this.player.facing * 8, vy: -8, width: 20, height: 10, type: 1 },
            2: { x: weaponPos.x, y: weaponPos.y - 3 + weaponYOffset, vx: this.player.facing * 15, vy: 0, width: 30, height: 6, type: 2 },
            3: { centerX: weaponPos.centerX, centerY: weaponPos.centerY + weaponYOffset, radius: 120, angle: 0, rotSpeed: 0.2, type: 3 },
            4: { x: weaponPos.x, y: weaponPos.y - 5 + weaponYOffset, vx: this.player.facing * 6, vy: -10, width: 30, height: 10, wavePhase: 0, type: 4 },
            5: { x: this.player.x + (this.player.facing > 0 ? this.player.width : -40), y: weaponPos.y - 12 + weaponYOffset, vx: this.player.facing * 9, vy: 0, width: 40, height: 4, gap: 4, type: 5 },
            6: { x: weaponPos.x, y: weaponPos.y - 15 + weaponYOffset, vx: this.player.facing * 5, vy: 0, size: 30, angle: 0, rotSpeed: 0.15 * this.player.facing, type: 6 },
            7: { centerX: this.player.x + this.player.width / 2, centerY: this.player.y + this.player.height / 2 + weaponYOffset, radius: 150, angle: 0, rotSpeed: 0.12, direction: 1, type: 7 },
            8: { x: this.player.x + (this.player.facing > 0 ? this.player.width : -30), y: this.player.y + this.player.height / 2 - 7 + weaponYOffset, vx: this.player.facing * 8, vy: -18, width: 30, height: 15, lastDropX: this.player.x + (this.player.facing > 0 ? this.player.width : -30), dropsLeft: 5, type: 8 }
        };
        
        const config = projectileConfigs[currentWeapon];
        if (config) {
            this.gameState.projectiles.push(config);
        }
    }
}