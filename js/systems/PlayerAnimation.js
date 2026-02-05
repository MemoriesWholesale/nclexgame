/**
 * PlayerAnimation - Handles player sprite animations and rendering
 * Includes invincibility flashing and hit feedback effects
 */
export class PlayerAnimation {
    constructor(player) {
        this.player = player;
        this.state = 'idle';
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.ANIMATION_SPEED = 12; // Frames per animation frame (slower = better performance)

        // Invincibility flash effect
        this.invincibilityFlashTimer = 0;
        this.invincibilityFlashRate = 4; // Toggle visibility every N frames

        // Hit flash effect (brief white flash on damage)
        this.hitFlashTimer = 0;
        this.hitFlashDuration = 8;

        // Landing squash/stretch
        this.squashAmount = 0;
        this.squashDecay = 0.15;
    }

    /**
     * Trigger hit flash effect
     */
    triggerHitFlash() {
        this.hitFlashTimer = this.hitFlashDuration;
    }

    /**
     * Trigger landing squash effect
     */
    triggerLandingSquash(impactVelocity) {
        // Squash amount based on fall speed (capped)
        this.squashAmount = Math.min(0.3, Math.abs(impactVelocity) * 0.015);
    }
    
    /**
     * Update animation state based on player conditions
     */
    updateState(spriteAnimations, deltaTime = 1) {
        this.updateShootTimer(deltaTime);
        this.determineAnimationState();
        this.updateAnimationFrame(spriteAnimations, deltaTime);
    }
    
    /**
     * Render the player sprite
     */
    render(ctx, playerSprite, spriteLoaded, spriteAnimations, armorData, overrideX = null) {
        if (this.player.dead) return;

        // Handle invincibility flash - don't render every few frames
        if (this.player.invincible) {
            this.invincibilityFlashTimer++;
            if (Math.floor(this.invincibilityFlashTimer / this.invincibilityFlashRate) % 2 === 0) {
                // Skip rendering on alternating intervals for flash effect
                return;
            }
        } else {
            this.invincibilityFlashTimer = 0;
        }

        const drawX = overrideX !== null ? overrideX : this.player.x;

        // Apply hit flash effect (white tint)
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer--;
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
        }

        // Update squash effect
        if (this.squashAmount > 0) {
            this.squashAmount *= (1 - this.squashDecay);
            if (this.squashAmount < 0.01) this.squashAmount = 0;
        }

        if (spriteLoaded) {
            this.renderSprite(ctx, playerSprite, spriteAnimations, drawX);
        } else {
            this.renderFallback(ctx, armorData, drawX);
        }

        // Draw hit flash overlay
        if (this.hitFlashTimer > 0) {
            ctx.restore();
            // Draw white overlay on player
            const flashAlpha = this.hitFlashTimer / this.hitFlashDuration * 0.6;
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(drawX, this.player.y, this.player.width, this.player.height);
        }
    }
    
    /**
     * Start shooting animation
     */
    startShooting() {
        this.player.isShooting = true;
        this.player.shootTimer = 15;
    }
    
    // Private methods
    updateShootTimer(deltaTime = 1) {
        if (this.player.shootTimer > 0) {
            this.player.shootTimer -= deltaTime;
        } else {
            this.player.isShooting = false;
        }
    }
    
    determineAnimationState() {
        if (this.player.isShooting) {
            this.state = this.getShootingState();
        } else if (this.player.crouching) {
            this.state = 'crouch';
        } else if (!this.player.grounded) {
            this.state = this.player.vy < 0 ? 'jumpUp' : 'jumpDown';
        } else if (Math.abs(this.player.vx) > 0.1) {
            this.state = 'walk';
        } else {
            this.state = 'idle';
        }
    }
    
    getShootingState() {
        if (this.player.crouching) return 'crouchShoot';
        if (!this.player.grounded) return 'jumpShoot';
        if (Math.abs(this.player.vx) > 0.1) return 'walkShoot';
        return 'idleShoot';
    }
    
    updateAnimationFrame(spriteAnimations, deltaTime = 1) {
        const currentAnimation = spriteAnimations[this.state];
        this.animationTimer += deltaTime;

        if (this.animationTimer > this.ANIMATION_SPEED) {
            this.currentFrame = (this.currentFrame + 1) % currentAnimation.frames;
            this.animationTimer = 0;
        }

        if (this.currentFrame >= currentAnimation.frames) {
            this.currentFrame = 0;
        }
    }
    
    calculateSpriteCoordinates(currentAnimation) {
        let sX, sY, sWidth, sHeight;
        
        if (currentAnimation.row !== undefined) {
            // New row/column format
            if (currentAnimation.customFrames) {
                // Handle custom frame sequences that span multiple rows
                const frameIndex = currentAnimation.customFrames[this.currentFrame];
                const col = frameIndex % 6; // 6 columns per row
                const row = Math.floor(frameIndex / 6);
                // Perfect integer pixel boundaries
                sX = col * 80; // 480px ÷ 6 columns = 80px per frame
                sY = row * 120; // 600px ÷ 5 rows = 120px per frame
            } else {
                // Standard row/column calculation
                const currentCol = currentAnimation.startCol + this.currentFrame;
                sX = currentCol * 80;
                sY = currentAnimation.row * 120;
            }
            sWidth = currentAnimation.frameWidth;
            sHeight = currentAnimation.frameHeight;
            
            // Reduce width by 5px for jumping frames to avoid spillover
            if (this.state.includes('jump') || this.state.includes('Jump')) {
                sWidth -= 5;
            }
            
            // Special adjustment for jumpShoot frame - extend 5px left for back of head
            if (this.state === 'jumpShoot') {
                sX -= 5; // Extend source 5px left for back of head
                sWidth += 5; // Increase width by 5px to capture back of head
                // Don't modify sY or sHeight to avoid artifacts from frame above
            }
            
            // Special adjustment for jump-down frames - patch heel from adjacent area
            if (this.state === 'jumpDown' || this.state === 'jumpMoveDown') {
                // Don't modify the main frame, we'll add a patch in the render function
            }
        } else {
            // Legacy format
            sX = (currentAnimation.startFrame + this.currentFrame) * currentAnimation.width;
            sY = currentAnimation.y;
            sWidth = currentAnimation.width;
            sHeight = currentAnimation.height;
        }
        
        this.cachedSpriteCoords = { sX, sY, sWidth, sHeight };
    }
    
    renderSprite(ctx, playerSprite, spriteAnimations, drawX) {
        const currentAnimation = spriteAnimations[this.state];
        
        // Cache sprite coordinates to reduce per-frame calculations
        if (!this.cachedSpriteCoords || this.lastState !== this.state || this.lastFrame !== this.currentFrame) {
            this.calculateSpriteCoordinates(currentAnimation);
            this.lastState = this.state;
            this.lastFrame = this.currentFrame;
        }
        
        const { sX, sY, sWidth, sHeight } = this.cachedSpriteCoords;
        
        ctx.save();
        
        let renderX = drawX;
        if (this.player.facing === -1) {
            ctx.scale(-1, 1);
            renderX = -drawX - this.player.width;
        }
        
        const yPos = this.player.crouching 
            ? this.player.y + (this.player.height - (this.player.width * sHeight / sWidth))
            : this.player.y;
        
        ctx.drawImage(
            playerSprite,
            sX, sY, sWidth, sHeight,
            renderX, yPos, this.player.width, this.player.height
        );
        
        // Add heel patch for jump-down frames
        if (this.state === 'jumpDown' || this.state === 'jumpMoveDown') {
            // Draw a small 5x5 patch from a nearby frame area for the heel
            const heelPatchX = sX - 5; // Get patch from left of current frame
            const heelPatchY = sY + sHeight - 5; // Bottom area
            const heelRenderX = this.player.facing === -1 ? renderX + this.player.width - 5 : renderX - 5;
            const heelRenderY = yPos + this.player.height - 5;
            
            ctx.drawImage(
                playerSprite,
                heelPatchX, heelPatchY, 5, 5,
                heelRenderX, heelRenderY, 5, 5
            );
        }
        
        ctx.restore();
    }
    
    renderFallback(ctx, armorData, drawX) {
        const armorId = this.player.armors[this.player.currentArmorIndex];
        ctx.fillStyle = armorData[armorId].color;
        
        const height = this.player.crouching ? this.player.height / 2 : this.player.height;
        const yPos = this.player.crouching ? this.player.y + this.player.height / 2 : this.player.y;
        
        ctx.fillRect(drawX, yPos, this.player.width, height);
    }
    
    /**
     * Reset animation state
     */
    reset() {
        this.state = 'idle';
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.player.isShooting = false;
        this.player.shootTimer = 0;
        this.invincibilityFlashTimer = 0;
        this.hitFlashTimer = 0;
        this.squashAmount = 0;
    }
}