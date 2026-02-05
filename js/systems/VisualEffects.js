/**
 * VisualEffects - Handles screen shake, hit flash, damage numbers, and particle effects
 * Improves game feel and player feedback
 */
export class VisualEffects {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        // Screen flash
        this.flashColor = null;
        this.flashAlpha = 0;
        this.flashDuration = 0;

        // Damage numbers
        this.damageNumbers = [];

        // Particles
        this.particles = [];

        // Hit markers
        this.hitMarkers = [];

        // Screen tint (for low health, effects, etc.)
        this.screenTint = null;
        this.screenTintAlpha = 0;
    }

    /**
     * Trigger screen shake effect
     * @param {number} intensity - Shake intensity (pixels)
     * @param {number} duration - Duration in frames
     */
    screenShake(intensity = 5, duration = 10) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    /**
     * Trigger screen flash effect
     * @param {string} color - Flash color (CSS color)
     * @param {number} duration - Duration in frames
     * @param {number} alpha - Initial alpha (0-1)
     */
    screenFlash(color = '#ffffff', duration = 15, alpha = 0.5) {
        this.flashColor = color;
        this.flashDuration = duration;
        this.flashAlpha = alpha;
    }

    /**
     * Set persistent screen tint (for low health, effects)
     * @param {string} color - Tint color
     * @param {number} alpha - Tint alpha
     */
    setScreenTint(color, alpha) {
        this.screenTint = color;
        this.screenTintAlpha = alpha;
    }

    /**
     * Clear screen tint
     */
    clearScreenTint() {
        this.screenTint = null;
        this.screenTintAlpha = 0;
    }

    /**
     * Spawn a floating damage number
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string|number} value - Text/number to display
     * @param {string} color - Text color
     * @param {number} size - Font size
     */
    spawnDamageNumber(x, y, value, color = '#ff4444', size = 24) {
        this.damageNumbers.push({
            x,
            y,
            value: String(value),
            color,
            size,
            vy: -3,
            alpha: 1,
            lifetime: 60
        });
    }

    /**
     * Spawn a hit marker at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - 'hit', 'crit', 'heal'
     */
    spawnHitMarker(x, y, type = 'hit') {
        const colors = {
            hit: '#ffffff',
            crit: '#ffff00',
            heal: '#00ff00',
            block: '#4444ff'
        };

        this.hitMarkers.push({
            x,
            y,
            color: colors[type] || colors.hit,
            radius: 5,
            maxRadius: type === 'crit' ? 40 : 25,
            alpha: 1,
            lifetime: 15
        });
    }

    /**
     * Spawn particles at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} options - Particle options
     */
    spawnParticles(x, y, options = {}) {
        const {
            count = 8,
            color = '#ffffff',
            speed = 3,
            size = 4,
            lifetime = 30,
            spread = Math.PI * 2,
            direction = 0,
            gravity = 0.1
        } = options;

        for (let i = 0; i < count; i++) {
            const angle = direction - spread / 2 + Math.random() * spread;
            const velocity = speed * (0.5 + Math.random() * 0.5);

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color,
                size: size * (0.5 + Math.random() * 0.5),
                alpha: 1,
                lifetime,
                maxLifetime: lifetime,
                gravity
            });
        }
    }

    /**
     * Spawn explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Primary color
     */
    spawnExplosion(x, y, color = '#ff6600') {
        this.screenShake(8, 15);
        this.spawnParticles(x, y, {
            count: 20,
            color,
            speed: 6,
            size: 6,
            lifetime: 40,
            gravity: 0.15
        });
        this.spawnHitMarker(x, y, 'crit');
    }

    /**
     * Player hit effect
     * @param {number} x - Player X
     * @param {number} y - Player Y
     */
    playerHitEffect(x, y) {
        this.screenShake(10, 12);
        this.screenFlash('#ff0000', 10, 0.3);
        this.spawnParticles(x, y, {
            count: 12,
            color: '#ff4444',
            speed: 4,
            size: 5,
            lifetime: 25
        });
    }

    /**
     * Enemy hit effect
     * @param {number} x - Enemy X
     * @param {number} y - Enemy Y
     * @param {number} damage - Damage dealt
     */
    enemyHitEffect(x, y, damage = 1) {
        this.screenShake(3, 5);
        this.spawnDamageNumber(x, y - 20, damage, '#ffffff', 20 + damage * 2);
        this.spawnHitMarker(x, y, 'hit');
        this.spawnParticles(x, y, {
            count: 6,
            color: '#ffaa00',
            speed: 3,
            size: 4,
            lifetime: 20
        });
    }

    /**
     * Boss hit effect
     * @param {number} x - Boss X
     * @param {number} y - Boss Y
     * @param {number} damage - Damage dealt
     */
    bossHitEffect(x, y, damage = 1) {
        this.screenShake(6, 8);
        this.spawnDamageNumber(x, y - 30, damage, '#ffff00', 32);
        this.spawnHitMarker(x, y, 'crit');
        this.spawnParticles(x, y, {
            count: 15,
            color: '#ffdd00',
            speed: 5,
            size: 5,
            lifetime: 30
        });
    }

    /**
     * Pickup effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - 'weapon', 'health', 'powerup'
     */
    pickupEffect(x, y, type = 'weapon') {
        const colors = {
            weapon: '#00ffff',
            health: '#ff69b4',
            powerup: '#ffff00',
            armor: '#8844ff'
        };

        this.spawnParticles(x, y, {
            count: 10,
            color: colors[type] || colors.weapon,
            speed: 2,
            size: 4,
            lifetime: 25,
            gravity: -0.05
        });
    }

    /**
     * Update all effects
     */
    update(deltaTime = 1) {
        // Update screen shake
        if (this.shakeDuration > 0) {
            this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeDuration -= deltaTime;
            this.shakeIntensity *= 0.9;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }

        // Update screen flash
        if (this.flashDuration > 0) {
            this.flashDuration -= deltaTime;
            this.flashAlpha *= 0.85;
        }

        // Update damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const num = this.damageNumbers[i];
            num.y += num.vy * deltaTime;
            num.vy += 0.05 * deltaTime;
            num.alpha -= (1 / num.lifetime) * deltaTime;
            num.lifetime -= deltaTime;

            if (num.lifetime <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }

        // Update hit markers
        for (let i = this.hitMarkers.length - 1; i >= 0; i--) {
            const marker = this.hitMarkers[i];
            marker.radius += (marker.maxRadius - marker.radius) * 0.3;
            marker.alpha -= (1 / marker.lifetime) * deltaTime;
            marker.lifetime -= deltaTime;

            if (marker.lifetime <= 0) {
                this.hitMarkers.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += p.gravity * deltaTime;
            p.alpha = p.lifetime / p.maxLifetime;
            p.lifetime -= deltaTime;

            if (p.lifetime <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Apply screen shake offset to context
     */
    applyShake() {
        if (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0) {
            this.ctx.save();
            this.ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
        }
    }

    /**
     * Restore context after shake
     */
    restoreShake() {
        if (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0) {
            this.ctx.restore();
        }
    }

    /**
     * Render all visual effects
     */
    render() {
        // Render particles
        for (const p of this.particles) {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Render hit markers
        for (const marker of this.hitMarkers) {
            this.ctx.globalAlpha = marker.alpha * 0.6;
            this.ctx.strokeStyle = marker.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(marker.x, marker.y, marker.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Render damage numbers
        this.ctx.textAlign = 'center';
        for (const num of this.damageNumbers) {
            this.ctx.globalAlpha = num.alpha;
            this.ctx.fillStyle = num.color;
            this.ctx.font = `bold ${num.size}px Arial`;
            this.ctx.fillText(num.value, num.x, num.y);

            // Add outline for visibility
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeText(num.value, num.x, num.y);
            this.ctx.fillText(num.value, num.x, num.y);
        }

        this.ctx.globalAlpha = 1;
    }

    /**
     * Render screen overlay effects (flash, tint)
     */
    renderOverlay() {
        // Screen tint
        if (this.screenTint && this.screenTintAlpha > 0) {
            this.ctx.fillStyle = this.screenTint;
            this.ctx.globalAlpha = this.screenTintAlpha;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
        }

        // Screen flash
        if (this.flashDuration > 0 && this.flashAlpha > 0) {
            this.ctx.fillStyle = this.flashColor;
            this.ctx.globalAlpha = this.flashAlpha;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
        }
    }

    /**
     * Clear all effects
     */
    clear() {
        this.damageNumbers = [];
        this.particles = [];
        this.hitMarkers = [];
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.flashDuration = 0;
        this.screenTint = null;
        this.screenTintAlpha = 0;
    }
}
