/**
 * GameRenderer - Handles all rendering operations for the game
 */
export class GameRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }
    
    /**
     * Clear the canvas and set background color
     */
    clearCanvas(backgroundColor = '#333') {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Render the main menu
     */
    renderMenu(levelData) {
        this.clearCanvas();
        
        // Title
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Select a Level', this.canvas.width / 2, 100);
        
        // Level buttons
        this.renderLevelButtons(levelData);
    }
    
    /**
     * Render level selection buttons
     */
    renderLevelButtons(levelData) {
        const buttonsPerRow = 4;
        const buttonWidth = 150;
        const buttonHeight = 80;
        const startX = (this.canvas.width - (buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * 20)) / 2;
        const startY = this.canvas.height * 0.3;
        
        for (let i = 0; i < levelData.length; i++) {
            const level = levelData[i];
            const row = Math.floor(i / buttonsPerRow);
            const col = i % buttonsPerRow;
            const x = startX + col * (buttonWidth + 20);
            const y = startY + row * (buttonHeight + 20);
            
            // Button background
            this.ctx.fillStyle = level.color;
            this.ctx.fillRect(x, y, buttonWidth, buttonHeight);
            
            // Button border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, buttonWidth, buttonHeight);
            
            // Button text
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            
            const words = level.name.split(' ');
            if (words.length > 1) {
                this.ctx.fillText(words[0], x + buttonWidth / 2, y + buttonHeight / 2);
                this.ctx.fillText(words[1], x + buttonWidth / 2, y + buttonWidth / 2 + 20);
            } else {
                this.ctx.fillText(level.name, x + buttonWidth / 2, y + buttonHeight / 2 + 8);
            }
        }
    }
    
    /**
     * Render the pause menu overlay
     */
    renderPauseMenu(selectedOption = 0) {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const panelWidth = Math.min(450, this.canvas.width * 0.85);
        const panelHeight = 320;
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;

        // Panel background with rounded corners
        this.ctx.fillStyle = 'rgba(40, 40, 50, 0.95)';
        this.roundRect(panelX, panelY, panelWidth, panelHeight, 15);
        this.ctx.fill();

        // Panel border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Title
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, panelY + 50);

        // Menu options
        const options = [
            { text: 'Resume', key: 'ENTER', color: '#4CAF50' },
            { text: 'Restart Level', key: 'R', color: '#FF9800' },
            { text: 'Level Select', key: 'ESC', color: '#2196F3' }
        ];

        const buttonWidth = panelWidth - 60;
        const buttonHeight = 50;
        const startY = panelY + 80;
        const spacing = 65;

        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            const y = startY + i * spacing;
            const isSelected = i === selectedOption;

            // Button background
            this.ctx.fillStyle = isSelected ? opt.color : 'rgba(60, 60, 70, 0.8)';
            this.roundRect(panelX + 30, y, buttonWidth, buttonHeight, 8);
            this.ctx.fill();

            // Selection indicator
            if (isSelected) {
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }

            // Button text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 22px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(opt.text, this.canvas.width / 2 - 30, y + buttonHeight / 2 + 7);

            // Keyboard shortcut hint
            this.ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`[${opt.key}]`, panelX + panelWidth - 45, y + buttonHeight / 2 + 5);
        }

        // Help text at bottom
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Use UP/DOWN to navigate, ENTER to select', this.canvas.width / 2, panelY + panelHeight - 20);
    }

    /**
     * Helper method for rounded rectangles
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    /**
     * Render the ground and environment
     */
    renderEnvironment(groundY, pits, worldX) {
        // Render ground sections (avoiding pits)
        this.ctx.fillStyle = '#654321';
        let currentDrawX = 0;
        const sortedPits = [...pits].sort((a, b) => (a.worldX + worldX) - (b.worldX + worldX));
        
        for (const pit of sortedPits) {
            const pitScreenX = pit.worldX + worldX;
            if (pitScreenX > currentDrawX) {
                this.ctx.fillRect(currentDrawX, groundY, pitScreenX - currentDrawX, this.canvas.height - groundY);
            }
            currentDrawX = pitScreenX + pit.width;
        }
        
        if (currentDrawX < this.canvas.width) {
            this.ctx.fillRect(currentDrawX, groundY, this.canvas.width - currentDrawX, this.canvas.height - groundY);
        }
        
        // Render ground texture
        this.renderGroundTexture(groundY, pits, worldX);
    }
    
    /**
     * Render ground texture lines
     */
    renderGroundTexture(groundY, pits, worldX) {
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        
        for (let x = (worldX % 40); x < this.canvas.width; x += 40) {
            let inPit = pits.some(pit => {
                const pitScreenX = pit.worldX + worldX;
                return x > pitScreenX && x < pitScreenX + pit.width;
            });
            
            if (!inPit) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, groundY);
                this.ctx.lineTo(x, groundY - 10);
                this.ctx.stroke();
            }
        }
    }
    
    /**
     * Render platforms with their various types and states
     */
    renderPlatforms(platforms, worldX) {
        for (const platform of platforms) {
            const screenX = platform.worldX + worldX;
            if (screenX <= -platform.width || screenX >= this.canvas.width) continue;
            
            this.ctx.globalAlpha = platform.activated ? 1.0 : 0.3;
            this.renderPlatform(platform, screenX);
            this.ctx.globalAlpha = 1.0;
        }
    }
    
    /**
     * Render individual platform with type-specific styling
     */
    renderPlatform(platform, screenX) {
        // Set platform color based on type
        switch (platform.type) {
            case 'malfunctioning':
                this.ctx.fillStyle = platform.isActiveMalfunction ? '#FF4444' : '#FF8888';
                break;
            case 'alarm':
                if (platform.alarmTriggered) {
                    const flash = Math.floor(Date.now() / 200) % 2;
                    this.ctx.fillStyle = flash ? '#FFFF00' : '#FF0000';
                } else {
                    this.ctx.fillStyle = '#FFAA00';
                }
                break;
            case 'falling':
                this.ctx.fillStyle = '#8B4513';
                break;
            default:
                this.ctx.fillStyle = '#808080';
                break;
        }
        
        // Draw platform
        this.ctx.fillRect(screenX, platform.y, platform.width, platform.height);
        
        // Add platform type indicators
        if (platform.type === 'malfunctioning') {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('!', screenX + platform.width / 2, platform.y - 5);
        } else if (platform.type === 'alarm') {
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚠', screenX + platform.width / 2, platform.y - 5);
        }
    }
    
    /**
     * Render game UI (lives, weapon, armor info)
     */
    renderUI(player, weaponNames, currentWeapon, armorData) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 10, 220, 105);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'left';
        
        const currentArmorId = player.armors[player.currentArmorIndex];
        const currentArmorName = armorData[currentArmorId].name;
        
        this.ctx.fillText(`Armor: ${currentArmorName}`, 20, 35);
        this.ctx.fillText(`Weapon: ${weaponNames[currentWeapon - 1]}`, 20, 60);
        this.ctx.fillText(`Lives: ${player.lives}`, 20, 85);
    }
    
    /**
     * Render death screen overlay
     */
    renderDeathScreen(player) {
        if (!player.dead) return;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, this.canvas.height / 2 - 50, this.canvas.width, 100);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        
        if (player.lives > 0) {
            this.ctx.fillText('YOU DIED! Respawning...', this.canvas.width / 2, this.canvas.height / 2);
        } else {
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    /**
     * Render debug spatial axes for development
     */
    renderDebugAxes(player, worldX, groundY) {
        const axisColor = 'rgba(255, 255, 255, 0.8)';
        const tickColor = 'rgba(255, 255, 255, 0.6)';
        const textColor = 'rgba(255, 255, 255, 0.9)';
        
        this.ctx.save();
        this.ctx.strokeStyle = axisColor;
        this.ctx.fillStyle = textColor;
        this.ctx.font = '12px monospace';
        this.ctx.lineWidth = 1;
        
        // X-axis (world coordinates)
        const xAxisY = this.canvas.height - 40;
        this.ctx.beginPath();
        this.ctx.moveTo(0, xAxisY);
        this.ctx.lineTo(this.canvas.width, xAxisY);
        this.ctx.stroke();
        
        // X-axis ticks
        const playerWorldX = player.x - worldX;
        const tickInterval = 200;
        const startWorldX = Math.floor((-worldX - 100) / tickInterval) * tickInterval;
        
        for (let worldX_pos = startWorldX; worldX_pos <= -worldX + this.canvas.width + 100; worldX_pos += tickInterval) {
            const screenX = worldX_pos + worldX;
            if (screenX >= 0 && screenX <= this.canvas.width) {
                this.ctx.strokeStyle = tickColor;
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, xAxisY - 5);
                this.ctx.lineTo(screenX, xAxisY + 5);
                this.ctx.stroke();
                
                this.ctx.fillStyle = textColor;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(worldX_pos.toString(), screenX, xAxisY + 18);
            }
        }
        
        // Player position indicator
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        const playerY = groundY - player.y - player.height;
        this.ctx.fillText(`Player: (${Math.round(playerWorldX)}, ${Math.round(playerY)})`, this.canvas.width - 200, 20);
        
        this.ctx.restore();
    }
}