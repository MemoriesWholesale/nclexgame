/**
 * EnhancedHUD - Improved HUD with boss health bars, cooldown indicators,
 * charge meters, combo counters, and more visual feedback
 */
export class EnhancedHUD {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        // Combo system
        this.combo = 0;
        this.comboTimer = 0;
        this.comboDecayTime = 180; // 3 seconds at 60fps
        this.maxCombo = 0;
        this.comboScale = 1;

        // Score system
        this.score = 0;
        this.displayScore = 0;
        this.scorePopups = [];

        // Low health warning
        this.lowHealthPulse = 0;
        this.lowHealthThreshold = 1;

        // Notification system
        this.notifications = [];
    }

    /**
     * Render the main HUD panel with player info
     */
    renderPlayerHUD(player, weaponNames, weaponColors, currentWeapon, armorData, fireCooldowns, fireTimer) {
        const hudX = 10;
        const hudY = 10;
        const hudWidth = 250;
        const hudHeight = 130;

        // HUD background with gradient
        const gradient = this.ctx.createLinearGradient(hudX, hudY, hudX, hudY + hudHeight);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        this.ctx.fillStyle = gradient;
        this.roundRect(hudX, hudY, hudWidth, hudHeight, 10);

        // Border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Lives with heart icons
        this.renderLives(player.lives, hudX + 15, hudY + 25);

        // Current weapon with icon and cooldown
        this.renderWeaponInfo(
            weaponNames[currentWeapon - 1],
            weaponColors[currentWeapon - 1],
            fireCooldowns[currentWeapon - 1],
            fireTimer,
            hudX + 15,
            hudY + 55
        );

        // Armor info
        const currentArmorId = player.armors[player.currentArmorIndex];
        const currentArmor = armorData[currentArmorId];
        this.renderArmorInfo(currentArmor, hudX + 15, hudY + 85);

        // Charge meter if charging
        if (player.chargeArmor) {
            this.renderChargeMeter(player, hudX + 15, hudY + 110);
        }

        // Shield armor indicator
        if (player.shieldArmor) {
            this.renderShieldIndicator(hudX + hudWidth - 40, hudY + 15);
        }
    }

    /**
     * Render lives with heart icons
     */
    renderLives(lives, x, y) {
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';

        // Draw heart icons
        for (let i = 0; i < Math.min(lives, 5); i++) {
            this.drawHeart(x + i * 25, y - 8, 10, '#ff4444');
        }

        // Show +N if more than 5 lives
        if (lives > 5) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(`+${lives - 5}`, x + 130, y);
        }

        // Low health pulse effect
        if (lives <= this.lowHealthThreshold) {
            this.lowHealthPulse += 0.1;
            const pulse = Math.abs(Math.sin(this.lowHealthPulse));
            this.ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.3})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Draw a heart shape
     */
    drawHeart(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + size / 4);
        this.ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
        this.ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
        this.ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
        this.ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
        this.ctx.fill();
    }

    /**
     * Render weapon info with cooldown bar
     */
    renderWeaponInfo(weaponName, weaponColor, cooldown, fireTimer, x, y) {
        // Weapon icon (colored circle)
        this.ctx.fillStyle = weaponColor;
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Weapon name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(weaponName, x + 25, y + 5);

        // Cooldown bar
        const barWidth = 80;
        const barHeight = 6;
        const barX = x + 110;
        const barY = y - 3;

        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Cooldown progress
        const progress = Math.max(0, 1 - fireTimer / cooldown);
        const readyColor = progress >= 1 ? '#00ff00' : weaponColor;
        this.ctx.fillStyle = readyColor;
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Ready indicator
        if (progress >= 1) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.fillText('READY', barX + barWidth + 5, barY + 6);
        }
    }

    /**
     * Render armor info
     */
    renderArmorInfo(armor, x, y) {
        // Armor color indicator
        this.ctx.fillStyle = armor.color;
        this.ctx.fillRect(x, y - 10, 16, 16);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y - 10, 16, 16);

        // Armor name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(armor.name, x + 22, y + 2);
    }

    /**
     * Render charge meter for charge armor
     */
    renderChargeMeter(player, x, y) {
        const barWidth = 120;
        const barHeight = 10;

        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Charge progress
        const progress = player.isCharging ? Math.min(player.chargeTimer / player.chargeRequired, 1) : 0;

        // Color based on charge level
        let chargeColor;
        if (progress < 0.5) {
            chargeColor = '#ffff00';
        } else if (progress < 1) {
            chargeColor = '#ff8800';
        } else {
            chargeColor = '#ff0000';
            // Pulse effect when fully charged
            const pulse = Math.abs(Math.sin(Date.now() / 100));
            this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.3})`;
            this.ctx.fillRect(x, y, barWidth, barHeight);
        }

        this.ctx.fillStyle = chargeColor;
        this.ctx.fillRect(x, y, barWidth * progress, barHeight);

        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('CHARGE', x, y - 2);

        // "RELEASE!" text when fully charged
        if (progress >= 1) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('RELEASE!', x + barWidth + 5, y + 9);
        }
    }

    /**
     * Render shield armor indicator
     */
    renderShieldIndicator(x, y) {
        // Shield icon
        this.ctx.fillStyle = '#4488ff';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 12, y);
        this.ctx.lineTo(x + 24, y + 5);
        this.ctx.lineTo(x + 24, y + 18);
        this.ctx.lineTo(x + 12, y + 25);
        this.ctx.lineTo(x, y + 18);
        this.ctx.lineTo(x, y + 5);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    /**
     * Render boss health bar
     */
    renderBossHealthBar(boss, bossData) {
        if (!boss || boss.hp <= 0) return;

        const barWidth = 400;
        const barHeight = 25;
        const x = (this.canvas.width - barWidth) / 2;
        const y = 30;

        // Background panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.roundRect(x - 10, y - 25, barWidth + 20, barHeight + 45, 8);

        // Boss name
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(bossData.name, this.canvas.width / 2, y - 5);

        // Health bar background
        this.ctx.fillStyle = 'rgba(80, 0, 0, 0.8)';
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Health bar
        const healthPercent = boss.hp / bossData.maxHp;
        const gradient = this.ctx.createLinearGradient(x, y, x + barWidth * healthPercent, y);

        if (healthPercent > 0.5) {
            gradient.addColorStop(0, '#00ff00');
            gradient.addColorStop(1, '#88ff00');
        } else if (healthPercent > 0.25) {
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(1, '#ff8800');
        } else {
            gradient.addColorStop(0, '#ff4400');
            gradient.addColorStop(1, '#ff0000');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

        // Health bar border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, barHeight);

        // Health text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${boss.hp} / ${bossData.maxHp}`, this.canvas.width / 2, y + 18);

        // Phase indicator (if boss has phases)
        if (boss.phase !== undefined) {
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Phase ${boss.phase + 1}`, this.canvas.width / 2, y + barHeight + 15);
        }
    }

    /**
     * Render combo counter
     */
    renderComboCounter() {
        if (this.combo < 2) return;

        const x = this.canvas.width - 120;
        const y = 80;

        // Scale animation
        this.comboScale = Math.max(1, this.comboScale * 0.95);
        const scale = this.comboScale;

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(scale, scale);

        // Combo text
        this.ctx.fillStyle = this.getComboColor();
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.combo}x`, 0, 0);

        // "COMBO" label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('COMBO', 0, 20);

        // Decay bar
        const barWidth = 60;
        const progress = this.comboTimer / this.comboDecayTime;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(-barWidth / 2, 30, barWidth, 4);
        this.ctx.fillStyle = this.getComboColor();
        this.ctx.fillRect(-barWidth / 2, 30, barWidth * progress, 4);

        this.ctx.restore();
    }

    /**
     * Get combo color based on combo count
     */
    getComboColor() {
        if (this.combo >= 20) return '#ff00ff';
        if (this.combo >= 10) return '#ff4400';
        if (this.combo >= 5) return '#ffaa00';
        return '#ffffff';
    }

    /**
     * Add to combo
     */
    addCombo(amount = 1) {
        this.combo += amount;
        this.comboTimer = this.comboDecayTime;
        this.comboScale = 1.3;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
    }

    /**
     * Reset combo
     */
    resetCombo() {
        this.combo = 0;
        this.comboTimer = 0;
    }

    /**
     * Render score display
     */
    renderScore() {
        const x = this.canvas.width - 20;
        const y = 30;

        // Animate score counting up
        if (this.displayScore < this.score) {
            this.displayScore += Math.ceil((this.score - this.displayScore) * 0.1);
        }

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${this.displayScore}`, x, y);

        // Score label
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('SCORE', x, y + 15);

        // Render score popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const popup = this.scorePopups[i];
            this.ctx.fillStyle = `rgba(255, 255, 0, ${popup.alpha})`;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(`+${popup.value}`, popup.x, popup.y);
            popup.y -= 1;
            popup.alpha -= 0.02;
            if (popup.alpha <= 0) {
                this.scorePopups.splice(i, 1);
            }
        }
    }

    /**
     * Add score
     */
    addScore(amount, x = null, y = null) {
        this.score += amount;
        if (x !== null && y !== null) {
            this.scorePopups.push({ x, y, value: amount, alpha: 1 });
        }
    }

    /**
     * Render notifications
     */
    renderNotifications() {
        const x = this.canvas.width / 2;
        let y = 120;

        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notif = this.notifications[i];

            this.ctx.globalAlpha = notif.alpha;
            this.ctx.fillStyle = notif.color;
            this.ctx.font = `bold ${notif.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(notif.text, x, y);

            notif.timer -= 1;
            if (notif.timer < 30) {
                notif.alpha -= 0.03;
            }
            if (notif.timer <= 0) {
                this.notifications.splice(i, 1);
            }

            y += 30;
        }

        this.ctx.globalAlpha = 1;
    }

    /**
     * Show notification
     */
    showNotification(text, color = '#ffffff', duration = 120, size = 24) {
        this.notifications.push({
            text,
            color,
            alpha: 1,
            timer: duration,
            size
        });
    }

    /**
     * Update HUD state
     */
    update(deltaTime = 1) {
        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }

    /**
     * Helper: draw rounded rectangle
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
        this.ctx.fill();
    }

    /**
     * Reset HUD state
     */
    reset() {
        this.combo = 0;
        this.comboTimer = 0;
        this.score = 0;
        this.displayScore = 0;
        this.scorePopups = [];
        this.notifications = [];
        this.lowHealthPulse = 0;
    }
}
