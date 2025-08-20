export class Player {
    constructor(canvas) {
        // Position and size
        this.x = 100;
        this.y = 0;
        this.width = 50;
        this.height = 92; // Adjusted for new sprite aspect ratio
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpPower = 15;
        
        // State
        this.grounded = false;
        this.facing = 1;
        this.lives = 3;
        this.dead = false;
        this.crouching = false;
        this.onPlatform = null;
        
        // Armor system
        this.armors = [0];
        this.currentArmorIndex = 0;
        
        // Animation
        this.state = 'idle';
        this.currentFrame = 0;
        this.animationTimer = 0;
        
        // Shooting
        this.isShooting = false;
        this.shootTimer = 0;
        
        // Canvas reference for bounds checking
        this.canvas = canvas;
    }
    
    // Handle player input for movement
    handleInput(keys) {
        if (this.dead) {
            this.vx = 0;
            this.crouching = false;
            return;
        }
        
        // Horizontal movement
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.vx = -this.speed;
            this.facing = -1;
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.vx = this.speed;
            this.facing = 1;
        } else {
            this.vx *= 0.8;
        }
        
        // Jumping
        if ((keys['ArrowUp'] || keys['w'] || keys['W']) && this.grounded) {
            this.vy = -this.jumpPower;
            this.grounded = false;
            this.onPlatform = null;
        }
        
        // Crouching
        this.crouching = (keys['ArrowDown'] || keys['s'] || keys['S']) && this.grounded;
    }
    
    // Update player state and animation
    updateState(spriteAnimations) {
        // Update shoot timer
        if (this.shootTimer > 0) {
            this.shootTimer--;
        } else {
            this.isShooting = false;
        }
        
        // Determine animation state
        if (this.isShooting) {
            if (this.crouching) {
                this.state = 'crouchShoot';
            } else if (!this.grounded) {
                this.state = 'jumpShoot';
            } else if (Math.abs(this.vx) > 0.1) {
                this.state = 'walkShoot';
            } else {
                this.state = 'idleShoot';
            }
        } else if (this.crouching) {
            this.state = 'crouch';
        } else if (!this.grounded) {
            this.state = this.vy < 0 ? 'jumpUp' : 'jumpDown';
        } else if (Math.abs(this.vx) > 0.1) {
            this.state = 'walk';
        } else {
            this.state = 'idle';
        }
        
        // Update animation frame
        const currentAnimation = spriteAnimations[this.state];
        this.animationTimer++;
        if (this.animationTimer > 8) {
            this.currentFrame = (this.currentFrame + 1) % currentAnimation.frames;
            this.animationTimer = 0;
        }
        if (this.currentFrame >= currentAnimation.frames) {
            this.currentFrame = 0;
        }
    }
    
    // Update player physics and position
    updatePhysics(groundY, platforms, pits, worldX) {
        // Apply gravity
        this.vy += 0.8;
        this.x += this.vx;
        
        // Handle moving platforms (elevators, moving, orbiting)
        for (const p of platforms) {
            if (p.activated) {
                if (p.type === 'elevator') {
                    p.y += p.speed;
                    if ((p.speed < 0 && p.y <= p.endY) || (p.speed > 0 && p.y >= p.endY)) {
                        p.y = p.endY;
                        // To make it go back and forth, swap start and end
                        [p.startY, p.endY] = [p.endY, p.startY]; 
                        p.speed = -p.speed;
                    }
                }
                if (p.type === 'moving' && p.movement) {
                    if (p.movement.horizontal) {
                        p.worldX += p.movement.speed;
                        if ((p.movement.speed > 0 && p.worldX >= p.movement.endX) || (p.movement.speed < 0 && p.worldX <= p.movement.startX)) {
                            p.movement.speed = -p.movement.speed;
                        }
                    } else if (p.movement.vertical) {
                        p.y += p.movement.speed;
                         if ((p.speed < 0 && p.y <= p.endY) || (p.speed > 0 && p.y >= p.endY)) {
                            p.y = p.endY;
                            [p.startY, p.endY] = [p.endY, p.startY]; 
                            p.speed = -p.speed;
                        }
                    }
                }
                // **FIX**: Added logic for orbiting platforms
                if (p.type === 'orbiting' && p.orbit) {
                    p.orbit.currentAngle += p.orbit.speed;
                    p.worldX = p.orbit.centerX + Math.cos(p.orbit.currentAngle) * p.orbit.radiusX;
                    p.y = p.orbit.centerY + Math.sin(p.orbit.currentAngle) * p.orbit.radiusY;
                }
            }
        }
        
        // Platform collision detection
        const prevY = this.y;
        this.y += this.vy;
        this.grounded = false;
        this.onPlatform = null;
        
        // Check platform collisions
        for (const p of platforms) {
            const screenX = p.worldX + worldX;
            if (p.activated || p.type === 'ledge' || p.type === 'static' || (p.type === 'disappearing' && p.visible)) {
                if (this.x + this.width > screenX && this.x < screenX + p.width && 
                    prevY + this.height <= p.y && this.y + this.height >= p.y) {
                    this.y = p.y - this.height;
                    this.vy = 0;
                    this.grounded = true;
                    this.onPlatform = p;
                }
            }
        }
        
        // Ground collision
        let onGround = true;
        const playerCenterX = this.x + this.width / 2 - worldX;
        for (const pit of pits) {
            if (playerCenterX > pit.worldX && playerCenterX < pit.worldX + pit.width) {
                onGround = false;
                break;
            }
        }
        
        if (onGround && this.y + this.height > groundY) {
            this.y = groundY - this.height;
            this.vy = 0;
            this.grounded = true;
        }
    }
    
    // Check if player should die from falling
    checkFallDeath() {
        return (this.y > this.canvas.height + 50 && !this.dead);
    }
    
    // Handle player death
    die() {
        this.lives--;
        this.dead = true;
    }
    
    // Respawn the player
    respawn(groundY) {
        this.dead = false;
        this.x = 100;
        this.y = groundY - this.height;
    }
    
    // Handle screen boundaries and world scrolling
    updateScreenPosition(worldX, screenLocked, testLevelEndX, gate) {
        let worldDelta = 0;
        
        if (!screenLocked) {
            if (this.x < 50) this.x = 50;
            if (this.x > this.canvas.width / 2 && !this.dead && (-worldX < testLevelEndX - this.canvas.width / 2)) {
                worldDelta = this.x - this.canvas.width / 2;
                this.x = this.canvas.width / 2;
            }
        } else {
            if (this.x < 50) this.x = 50;
            if (this.x > this.canvas.width - 50 - this.width) {
                this.x = this.canvas.width - 50 - this.width;
            }
        }
        
        // Gate collision
        if (gate && gate.hp > 0) {
            const gateScreenX = gate.worldX + worldX;
            if (this.x + this.width > gateScreenX) {
                this.x = gateScreenX - this.width;
            }
        }
        
        return worldDelta;
    }
    
    // Check collision with enemies
    checkEnemyCollision(enemy, screenX) {
        if (!this.dead && this.x < screenX + enemy.width && 
            this.x + this.width > screenX && 
            this.y < enemy.y + enemy.height && 
            this.y + this.height > enemy.y) {
            
            this.lives--;
            this.dead = true;
            return true;
        }
        return false;
    }
    
    // Check collision with boss
    checkBossCollision(boss) {
        if (boss && !this.dead && 
            this.x < boss.x + boss.width && this.x + this.width > boss.x && 
            this.y < boss.y + boss.height && this.y + this.height > boss.y) {
            
            this.lives = 0;
            this.dead = true;
            return true;
        }
        return false;
    }
    
    // Check collision with pickup
    checkPickupCollision(pickup, screenX) {
        if (!this.dead && this.x < screenX + 30 && this.x + this.width > screenX && 
            this.y < pickup.y + 30 && this.y + this.height > pickup.y) {
            return pickup.weaponId;
        }
        return null;
    }
    
    // Check collision with armor pickup
    checkArmorPickupCollision(armorPickup) {
        if (armorPickup && !this.dead && 
            this.x < armorPickup.x + armorPickup.width && 
            this.x + this.width > armorPickup.x && 
            this.y < armorPickup.y + armorPickup.height && 
            this.y + this.height > armorPickup.y) {
            
            if (!this.armors.includes(armorPickup.armorId)) {
                this.armors.push(armorPickup.armorId);
            }
            this.currentArmorIndex = this.armors.indexOf(armorPickup.armorId);
            return true;
        }
        return false;
    }
    
    // Check collision with powerup
    checkPowerupCollision(powerup, screenX) {
        if (this.x < screenX + 20 && this.x + this.width > screenX &&
            this.y < powerup.y + 20 && this.y + this.height > powerup.y) {
            
            if (powerup.type === 'life') {
                this.lives++;
            }
            return powerup.type;
        }
        return null;
    }
    
    // Handle shooting
    startShooting() {
        this.isShooting = true;
        this.shootTimer = 15;
    }
    
    // Switch armor
    switchArmor() {
        this.currentArmorIndex = (this.currentArmorIndex + 1) % this.armors.length;
    }
    
    // Get weapon spawn position for projectiles
    getWeaponSpawnPos() {
        const weaponYOffset = this.crouching ? 20 : 0;
        return {
            x: this.x + (this.facing > 0 ? this.width : -30),
            y: this.y + this.height / 2 + weaponYOffset,
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2 + weaponYOffset
        };
    }
    
    // Render the player
    render(ctx, playerSprite, spriteLoaded, spriteAnimations, armorData) {
        if (this.dead) return;
        
        if (spriteLoaded) {
            const currentAnimation = spriteAnimations[this.state];
            const sX = (currentAnimation.startFrame + this.currentFrame) * currentAnimation.width;
            const sY = currentAnimation.y;
            const sWidth = currentAnimation.width;
            const sHeight = currentAnimation.height;
            
            ctx.save();
            
            let drawX = this.x;
            if (this.facing === -1) {
                ctx.scale(-1, 1);
                drawX = -this.x - this.width;
            }
            
            const yPos = this.crouching ? this.y + (this.height - (this.width * sHeight / sWidth)) : this.y;

            ctx.drawImage(
                playerSprite,
                sX, sY,
                sWidth, sHeight,
                drawX, yPos,
                this.width, this.height
            );
            
            ctx.restore();
        } else {
            // Fallback rendering without sprite
            ctx.fillStyle = armorData[this.armors[this.currentArmorIndex]].color;
            const height = this.crouching ? this.height / 2 : this.height;
            const yPos = this.crouching ? this.y + this.height / 2 : this.y;
            ctx.fillRect(this.x, yPos, this.width, height);
        }
    }
    
    // Utility method to get current world X (for collision calculations)
    // This will need to be passed in from game.js
    getWorldX() {
        return 0; // This will be overridden by game logic
    }
    
    // Reset player to initial state
    reset(groundY) {
        this.x = 100;
        this.y = groundY - this.height;
        this.vx = 0;
        this.vy = 0;
        this.lives = 3;
        this.dead = false;
        this.crouching = false;
        this.grounded = true;
        this.onPlatform = null;
        this.state = 'idle';
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.isShooting = false;
        this.shootTimer = 0;
    }
}