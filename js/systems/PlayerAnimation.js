/**
 * PlayerAnimation - Handles player sprite animations and rendering
 */
export class PlayerAnimation {
    constructor(player) {
        this.player = player;
        this.state = 'idle';
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.ANIMATION_SPEED = 8; // Frames per animation frame
    }
    
    /**
     * Update animation state based on player conditions
     */
    updateState(spriteAnimations) {
        this.updateShootTimer();
        this.determineAnimationState();
        this.updateAnimationFrame(spriteAnimations);
    }
    
    /**
     * Render the player sprite
     */
    render(ctx, playerSprite, spriteLoaded, spriteAnimations, armorData, overrideX = null) {
        if (this.player.dead) return;
        
        const drawX = overrideX !== null ? overrideX : this.player.x;
        
        if (spriteLoaded) {
            this.renderSprite(ctx, playerSprite, spriteAnimations, drawX);
        } else {
            this.renderFallback(ctx, armorData, drawX);
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
    updateShootTimer() {
        if (this.player.shootTimer > 0) {
            this.player.shootTimer--;
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
    
    updateAnimationFrame(spriteAnimations) {
        const currentAnimation = spriteAnimations[this.state];
        this.animationTimer++;
        
        if (this.animationTimer > this.ANIMATION_SPEED) {
            this.currentFrame = (this.currentFrame + 1) % currentAnimation.frames;
            this.animationTimer = 0;
        }
        
        if (this.currentFrame >= currentAnimation.frames) {
            this.currentFrame = 0;
        }
    }
    
    renderSprite(ctx, playerSprite, spriteAnimations, drawX) {
        const currentAnimation = spriteAnimations[this.state];
        const sX = (currentAnimation.startFrame + this.currentFrame) * currentAnimation.width;
        const sY = currentAnimation.y;
        const sWidth = currentAnimation.width;
        const sHeight = currentAnimation.height;
        
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
    }
}