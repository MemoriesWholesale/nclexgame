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
    renderPauseMenu() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const panelWidth = Math.min(400, this.canvas.width * 0.8);
        const panelHeight = 200;
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // Panel background
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Title
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, panelY + 40);
        
        // Buttons
        const buttonWidth = panelWidth - 60;
        const buttonHeight = 50;
        const resumeX = panelX + 30;
        const resumeY = panelY + 60;
        
        // Resume button
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(resumeX, resumeY, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Resume', this.canvas.width / 2, resumeY + buttonHeight / 2 + 8);
        
        // Level select button
        const selectY = resumeY + buttonHeight + 20;
        this.ctx.fillStyle = '#f44336';
        this.ctx.fillRect(resumeX, selectY, buttonWidth, buttonHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Level Select', this.canvas.width / 2, selectY + buttonHeight / 2 + 8);
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