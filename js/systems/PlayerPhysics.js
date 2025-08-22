/**
 * PlayerPhysics - Handles all physics calculations and platform interactions
 */
export class PlayerPhysics {
    constructor(player) {
        this.player = player;
        this.GRAVITY = 0.8;
        this.FRICTION = 0.8;
        this.SPILL_ACCELERATION = 1.05;
        this.MIN_SPILL_VELOCITY = 2;
    }
    
    /**
     * Update player physics including gravity, movement, and platform collisions
     */
    update(groundY, platforms, pits, worldX) {
        this.applyGravity();
        this.updateHorizontalMovement();
        this.updateMovingPlatforms(platforms);
        this.updateVerticalPosition();
        this.handlePlatformCollisions(platforms, worldX, groundY);
        this.handleGroundCollision(groundY, pits, worldX);
        this.updateJumpState();
    }
    
    /**
     * Handle spill physics when player is on a slippery surface
     */
    applySpillPhysics(onSpill) {
        if (onSpill && this.player.grounded) {
            this.player.vx *= this.SPILL_ACCELERATION;
            if (Math.abs(this.player.vx) < this.MIN_SPILL_VELOCITY) {
                this.player.vx = this.player.facing * this.MIN_SPILL_VELOCITY;
            }
        }
    }
    
    // Private methods
    applyGravity() {
        this.player.vy += this.GRAVITY;
    }
    
    updateHorizontalMovement() {
        this.player.x += this.player.vx;
    }
    
    updateVerticalPosition() {
        this.player.y += this.player.vy;
    }
    
    updateMovingPlatforms(platforms) {
        const currentPlatform = this.player.onPlatform;
        if (!currentPlatform) return;
        
        for (const platform of platforms) {
            if (platform !== currentPlatform || !platform.activated) continue;
            
            const prevY = platform.y;
            const prevX = platform.worldX || platform.x;
            
            this.updatePlatformMovement(platform);
            
            // Move player with platform if they're standing on it
            if (currentPlatform === platform) {
                this.movePlayerWithPlatform(platform, prevX, prevY);
            }
        }
    }
    
    updatePlatformMovement(platform) {
        switch (platform.type) {
            case 'elevator':
                this.updateElevatorPlatform(platform);
                break;
            case 'moving':
                this.updateMovingPlatform(platform);
                break;
            case 'orbiting':
                this.updateOrbitingPlatform(platform);
                break;
            case 'malfunctioning':
                this.updateMalfunctioningPlatform(platform);
                break;
        }
    }
    
    updateElevatorPlatform(platform) {
        platform.y += platform.speed;
        if ((platform.speed < 0 && platform.y <= platform.endY) || 
            (platform.speed > 0 && platform.y >= platform.endY)) {
            platform.y = platform.endY;
            [platform.startY, platform.endY] = [platform.endY, platform.startY];
            platform.speed = -platform.speed;
        }
    }
    
    updateMovingPlatform(platform) {
        if (!platform.movement) return;
        
        if (platform.movement.horizontal) {
            platform.worldX += platform.movement.speed;
            if ((platform.movement.speed > 0 && platform.worldX >= platform.movement.endX) ||
                (platform.movement.speed < 0 && platform.worldX <= platform.movement.startX)) {
                platform.movement.speed = -platform.movement.speed;
            }
        } else if (platform.movement.vertical) {
            platform.y += platform.movement.speed;
            if ((platform.speed < 0 && platform.y <= platform.endY) ||
                (platform.speed > 0 && platform.y >= platform.endY)) {
                platform.y = platform.endY;
                [platform.startY, platform.endY] = [platform.endY, platform.startY];
                platform.speed = -platform.speed;
            }
        }
    }
    
    updateOrbitingPlatform(platform) {
        if (!platform.orbit) return;
        platform.orbit.currentAngle += platform.orbit.speed;
        platform.worldX = platform.orbit.centerX + Math.cos(platform.orbit.currentAngle) * platform.orbit.radiusX;
        platform.y = platform.orbit.centerY + Math.sin(platform.orbit.currentAngle) * platform.orbit.radiusY;
    }
    
    updateMalfunctioningPlatform(platform) {
        if (!platform.isActiveMalfunction) return;
        
        if (!platform.malfunctionStartTime) {
            platform.malfunctionStartTime = Date.now();
        }
        
        const elapsed = Date.now() - platform.malfunctionStartTime;
        const oscillation = Math.sin(elapsed * 0.01) * platform.malfunctionSpeed;
        
        if (platform.axis === 'horizontal') {
            if (!platform.originalX) platform.originalX = platform.worldX;
            platform.worldX = platform.originalX + oscillation;
        } else if (platform.axis === 'vertical') {
            if (!platform.originalY) platform.originalY = platform.y;
            platform.y = platform.originalY + oscillation;
        }
        
        // Stop malfunction after 3 seconds
        if (elapsed > 3000) {
            this.resetMalfunctioningPlatform(platform);
        }
    }
    
    resetMalfunctioningPlatform(platform) {
        platform.isActiveMalfunction = false;
        platform.malfunctionStartTime = null;
        if (platform.originalX) {
            platform.worldX = platform.originalX;
            platform.originalX = null;
        }
        if (platform.originalY) {
            platform.y = platform.originalY;
            platform.originalY = null;
        }
    }
    
    movePlayerWithPlatform(platform, prevX, prevY) {
        const movementX = (platform.worldX || platform.x) - prevX;
        const movementY = platform.y - prevY;
        
        this.player.x += movementX;
        this.player.y += movementY;
    }
    
    handlePlatformCollisions(platforms, worldX, groundY) {
        const prevY = this.player.y - this.player.vy; // Y before this frame's movement
        this.player.grounded = false;
        this.player.onPlatform = null;
        
        for (const platform of platforms) {
            if (!this.isPlatformSolid(platform)) continue;
            
            const screenX = platform.worldX + worldX;
            if (this.checkPlatformCollision(screenX, platform, prevY)) {
                this.landOnPlatform(platform);
                this.triggerPlatformEffects(platform);
            }
        }
    }
    
    isPlatformSolid(platform) {
        return platform.activated || 
               platform.type === 'ledge' || 
               platform.type === 'static' || 
               platform.type === 'malfunctioning' || 
               platform.type === 'alarm' || 
               (platform.type === 'disappearing' && platform.visible);
    }
    
    checkPlatformCollision(screenX, platform, prevY) {
        return this.player.x + this.player.width > screenX && 
               this.player.x < screenX + platform.width && 
               prevY + this.player.height <= platform.y && 
               this.player.y + this.player.height >= platform.y;
    }
    
    landOnPlatform(platform) {
        this.player.y = platform.y - this.player.height;
        this.player.vy = 0;
        this.player.grounded = true;
        this.player.onPlatform = platform;
    }
    
    triggerPlatformEffects(platform) {
        if (platform.type === 'malfunctioning' && !platform.isActiveMalfunction) {
            platform.isActiveMalfunction = true;
        }
        if (platform.type === 'alarm' && !platform.alarmTriggered) {
            platform.alarmTriggered = true;
            platform.alarmTime = Date.now();
        }
    }
    
    handleGroundCollision(groundY, pits, worldX) {
        const playerCenterX = this.player.x + this.player.width / 2 - worldX;
        let onGround = true;
        
        for (const pit of pits) {
            if (playerCenterX > pit.worldX && playerCenterX < pit.worldX + pit.width) {
                onGround = false;
                break;
            }
        }
        
        if (onGround && this.player.y + this.player.height > groundY) {
            this.player.y = groundY - this.player.height;
            this.player.vy = 0;
            this.player.grounded = true;
        }
    }
    
    updateJumpState() {
        // Player can jump if grounded and on a valid surface
        this.player.canJump = this.player.grounded && 
                              (this.player.onPlatform || 
                               this.player.y + this.player.height <= this.player.canvas.height - 95);
    }
}