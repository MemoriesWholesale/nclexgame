/**
 * Boss system - Handles boss sprite rendering, animations, and behaviors
 */
export class Boss {
    constructor(levelId, x, y, bossData, bossAnimations) {
        this.levelId = levelId;
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 120;
        this.vx = -2;
        this.facing = -1; // -1 for left, 1 for right
        
        // Boss data from constants
        this.name = bossData.name;
        this.type = bossData.type;
        this.maxHp = bossData.maxHp;
        this.hp = this.maxHp;
        this.attackPattern = bossData.attackPattern;
        
        // Animation properties
        this.animations = bossAnimations[`level_${levelId}`];
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 8; // Frames per animation frame
        
        // Sprite loading
        this.sprite = new Image();
        this.sprite.src = `assets/bosses/level_${levelId}_boss.png`;
        this.spriteLoaded = false;
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        };
        
        // Attack properties
        this.attackTimer = 0;
        this.attackCooldown = 180; // 3 seconds at 60fps
        this.isAttacking = false;
        this.attackDuration = 60; // 1 second attack animation
        
        // State properties
        this.hurtTimer = 0;
        this.isDying = false;
        this.deathTimer = 0;
        this.deathDuration = 240; // 4 seconds death animation
    }
    
    /**
     * Update boss behavior, animations, and attacks
     */
    update(player, canvas) {
        if (this.isDying) {
            this.updateDeath();
            return;
        }
        
        if (this.hp <= 0 && !this.isDying) {
            this.startDeath();
            return;
        }
        
        // Update hurt state
        if (this.hurtTimer > 0) {
            this.hurtTimer--;
            this.currentAnimation = 'hurt';
        } else {
            // Normal behavior
            this.updateMovement(canvas);
            this.updateAttack(player);
        }
        
        this.updateAnimation();
    }
    
    /**
     * Update boss movement patterns
     */
    updateMovement(canvas) {
        // Basic horizontal movement
        this.x += this.vx;
        
        // Bounce off screen edges
        if (this.x <= 100 || this.x >= canvas.width - 100 - this.width) {
            this.vx = -this.vx;
            this.facing = this.vx > 0 ? 1 : -1;
        }
    }
    
    /**
     * Update attack behavior
     */
    updateAttack(player) {
        if (this.isAttacking) {
            this.attackTimer--;
            this.currentAnimation = 'attack';
            
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.attackTimer = this.attackCooldown;
            }
        } else {
            this.attackTimer--;
            this.currentAnimation = 'idle';
            
            // Start attack if timer reached and player is in range
            if (this.attackTimer <= 0 && this.isPlayerInRange(player)) {
                this.startAttack(player);
            }
        }
    }
    
    /**
     * Check if player is in attack range
     */
    isPlayerInRange(player) {
        const distance = Math.abs(player.x - this.x);
        return distance < 300; // Attack range
    }
    
    /**
     * Start attack sequence
     */
    startAttack(player) {
        this.isAttacking = true;
        this.attackTimer = this.attackDuration;
        this.currentAnimation = 'attack';
        this.animationFrame = 0; // Reset attack animation
        
        // Execute attack based on pattern
        this.executeAttackPattern(player);
    }
    
    /**
     * Execute specific attack pattern
     */
    executeAttackPattern(player) {
        switch (this.attackPattern) {
            case 'swipe':
                // Simple melee attack - damage handled in collision
                break;
            case 'projectile':
                // Spawn projectile attack
                this.spawnProjectile(player);
                break;
            case 'area_damage':
                // Area of effect attack
                this.createAreaAttack();
                break;
            case 'charge':
                // Charge toward player
                this.chargeAtPlayer(player);
                break;
            case 'confusion':
                // Confuse player controls
                this.confusePlayer(player);
                break;
            case 'environmental':
                // Modify environment
                this.environmentalAttack();
                break;
            case 'multi_phase':
                // Multi-phase attack based on health
                this.multiPhaseAttack(player);
                break;
            case 'debuff':
                // Apply debuff to player
                this.debuffPlayer(player);
                break;
        }
    }
    
    /**
     * Spawn projectile attack
     */
    spawnProjectile(player) {
        // This will be handled by the main game loop
        this.pendingProjectile = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            targetX: player.x + player.width / 2,
            targetY: player.y + player.height / 2,
            speed: 5
        };
    }
    
    /**
     * Create area damage attack
     */
    createAreaAttack() {
        this.pendingAreaAttack = {
            x: this.x - 100,
            y: this.y,
            width: this.width + 200,
            height: this.height,
            duration: 60 // 1 second
        };
    }
    
    /**
     * Charge at player
     */
    chargeAtPlayer(player) {
        const direction = player.x > this.x ? 1 : -1;
        this.vx = direction * 8; // Faster movement during charge
        this.chargeTimer = 30; // Charge for 0.5 seconds
    }
    
    /**
     * Confuse player controls
     */
    confusePlayer(player) {
        player.invertedControls = true;
        // Effect will wear off after time
        setTimeout(() => {
            player.invertedControls = false;
        }, 3000);
    }
    
    /**
     * Environmental attack
     */
    environmentalAttack() {
        // Shake screen or create environmental hazards
        this.screenShake = 30;
    }
    
    /**
     * Multi-phase attack based on health percentage
     */
    multiPhaseAttack(player) {
        const healthPercent = this.hp / this.maxHp;
        
        if (healthPercent > 0.7) {
            this.spawnProjectile(player);
        } else if (healthPercent > 0.3) {
            this.createAreaAttack();
        } else {
            this.chargeAtPlayer(player);
        }
    }
    
    /**
     * Apply debuff to player
     */
    debuffPlayer(player) {
        player.speedMultiplier *= 0.5;
        player.jumpMultiplier *= 0.7;
        
        // Remove debuff after time
        setTimeout(() => {
            player.speedMultiplier = Math.min(player.speedMultiplier * 2, 1);
            player.jumpMultiplier = Math.min(player.jumpMultiplier / 0.7, 1);
        }, 5000);
    }
    
    /**
     * Start death sequence
     */
    startDeath() {
        this.isDying = true;
        this.deathTimer = this.deathDuration;
        this.currentAnimation = 'death';
        this.animationFrame = 0;
        this.vx = 0; // Stop movement
    }
    
    /**
     * Update death animation
     */
    updateDeath() {
        this.deathTimer--;
        this.currentAnimation = 'death';
        
        if (this.deathTimer <= 0) {
            this.isDestroyed = true;
        }
    }
    
    /**
     * Take damage and trigger hurt animation
     */
    takeDamage(damage = 1) {
        if (this.hurtTimer > 0 || this.isDying) return false;
        
        this.hp -= damage;
        this.hurtTimer = 20; // Brief hurt state
        
        return true; // Successfully took damage
    }
    
    /**
     * Update sprite animation
     */
    updateAnimation() {
        this.animationTimer++;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            
            const anim = this.animations[this.currentAnimation];
            if (anim) {
                this.animationFrame++;
                
                if (this.animationFrame >= anim.frames) {
                    if (this.currentAnimation === 'death' && this.isDying) {
                        // Stay on last frame of death animation
                        this.animationFrame = anim.frames - 1;
                    } else {
                        this.animationFrame = 0;
                    }
                }
            }
        }
    }
    
    /**
     * Render the boss with sprite animation
     */
    render(ctx) {
        if (!this.spriteLoaded) {
            // Fallback rendering - colored rectangle
            ctx.fillStyle = '#4B0082';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        
        const anim = this.animations[this.currentAnimation];
        if (!anim) return;
        
        // Calculate source position based on row/column layout
        const startCol = anim.startCol || 0;
        const currentCol = startCol + this.animationFrame;
        const sourceX = currentCol * anim.frameWidth;
        const sourceY = anim.row * anim.frameHeight;
        
        ctx.save();
        
        // Flip sprite based on facing direction
        if (this.facing < 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.sprite,
                sourceX, sourceY, anim.frameWidth, anim.frameHeight,
                -this.x - this.width, this.y, this.width, this.height
            );
        } else {
            ctx.drawImage(
                this.sprite,
                sourceX, sourceY, anim.frameWidth, anim.frameHeight,
                this.x, this.y, this.width, this.height
            );
        }
        
        ctx.restore();
        
        // Hurt flash effect
        if (this.hurtTimer > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    /**
     * Get collision bounds
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Check collision with another object
     */
    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}