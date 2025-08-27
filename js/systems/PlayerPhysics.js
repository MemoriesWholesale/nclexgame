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
    update(groundY, platforms, pits, worldX, terrainSystem = null, deltaTime = 1) {
        this.applyGravity(terrainSystem, worldX, deltaTime);
        this.updateHorizontalMovement(terrainSystem, worldX, deltaTime);
        this.updateMovingPlatforms(platforms, deltaTime);
        this.updateVerticalPosition(deltaTime);
        this.handlePlatformCollisions(platforms, worldX, groundY);
        this.handleGroundCollision(groundY, pits, worldX, terrainSystem);
        this.updateJumpState(groundY);
    }
    
    /**
     * Handle spill physics when player is on a slippery surface
     */
    applySpillPhysics(onSpill, deltaTime = 1) {
        if (onSpill && this.player.grounded) {
            this.player.vx *= Math.pow(this.SPILL_ACCELERATION, deltaTime);
            if (Math.abs(this.player.vx) < this.MIN_SPILL_VELOCITY) {
                this.player.vx = this.player.facing * this.MIN_SPILL_VELOCITY;
            }
        }
    }
    
    // Private methods
    applyGravity(terrainSystem = null, worldX = 0, deltaTime = 1) {
        if (terrainSystem && this.player.grounded) {
            // Apply terrain-modified gravity
            const playerWorldX = this.player.x - worldX;
            const gravityMod = terrainSystem.getGravityModifier(playerWorldX);

            // Apply slope sliding
            this.player.vx += gravityMod.x * deltaTime;
            this.player.vy += this.GRAVITY * gravityMod.y * deltaTime;
        } else {
            // Standard gravity
            this.player.vy += this.GRAVITY * deltaTime;
        }
    }
    
    updateHorizontalMovement(terrainSystem = null, worldX = 0, deltaTime = 1) {
        if (terrainSystem && this.player.grounded) {
            // Apply terrain speed modifier
            const playerWorldX = this.player.x - worldX;
            const speedMod = terrainSystem.getSpeedModifier(playerWorldX, this.player.vx);
            this.player.x += this.player.vx * speedMod * deltaTime;
        } else {
            // Standard movement
            this.player.x += this.player.vx * deltaTime;
        }
    }
    
    updateVerticalPosition(deltaTime = 1) {
        this.player.y += this.player.vy * deltaTime;
    }
    
    updateMovingPlatforms(platforms, deltaTime = 1) {
        const currentPlatform = this.player.onPlatform;

        for (const platform of platforms) {
            if (!platform.activated) continue;

            const prevY = platform.y;
            const prevX = platform.worldX || platform.x;

            // Update platform movement regardless of player position
            this.updatePlatformMovement(platform, deltaTime);

            // Move player with platform only if they're standing on it
            if (currentPlatform === platform) {
                this.movePlayerWithPlatform(platform, prevX, prevY);
            }
        }
    }
    
    updatePlatformMovement(platform, deltaTime) {
        switch (platform.type) {
            case 'elevator':
                this.updateElevatorPlatform(platform, deltaTime);
                break;
            case 'moving':
                this.updateMovingPlatform(platform, deltaTime);
                break;
            case 'orbiting':
                this.updateOrbitingPlatform(platform, deltaTime);
                break;
            case 'malfunctioning':
                this.updateMalfunctioningPlatform(platform, deltaTime);
                break;
        }
    }
    
    updateElevatorPlatform(platform, deltaTime) {
        platform.y += platform.speed * deltaTime;
        if ((platform.speed < 0 && platform.y <= platform.endY) ||
            (platform.speed > 0 && platform.y >= platform.endY)) {
            platform.y = platform.endY;
            [platform.startY, platform.endY] = [platform.endY, platform.startY];
            platform.speed = -platform.speed;
        }
    }
    
    updateMovingPlatform(platform, deltaTime) {
        if (!platform.movement) return;

        if (platform.movement.horizontal) {
            platform.worldX += platform.movement.speed * deltaTime;
            if ((platform.movement.speed > 0 && platform.worldX >= platform.movement.endX) ||
                (platform.movement.speed < 0 && platform.worldX <= platform.movement.startX)) {
                platform.movement.speed = -platform.movement.speed;
            }
        } else if (platform.movement.vertical) {
            platform.y += platform.movement.speed * deltaTime;
            if ((platform.movement.speed > 0 && platform.y >= platform.movement.endY) ||
                (platform.movement.speed < 0 && platform.y <= platform.movement.startY)) {
                platform.movement.speed = -platform.movement.speed;
            }
        }
    }
    
    updateOrbitingPlatform(platform, deltaTime) {
        if (!platform.orbit) return;
        platform.orbit.currentAngle += platform.orbit.speed * deltaTime;
        platform.worldX = platform.orbit.centerX + Math.cos(platform.orbit.currentAngle) * platform.orbit.radiusX;
        platform.y = platform.orbit.centerY + Math.sin(platform.orbit.currentAngle) * platform.orbit.radiusY;
    }
    
    updateMalfunctioningPlatform(platform, deltaTime) {
        if (!platform.isActiveMalfunction) return;

        if (!platform.malfunctionStartTime) {
            platform.malfunctionStartTime = Date.now();
        }

        const elapsed = Date.now() - platform.malfunctionStartTime;
        const oscillation = Math.sin(elapsed * 0.01) * platform.malfunctionSpeed;

        if (platform.axis === 'horizontal') {
            if (!platform.originalX) platform.originalX = platform.worldX;
            platform.worldX = platform.originalX + oscillation * deltaTime;
        } else if (platform.axis === 'vertical') {
            if (!platform.originalY) platform.originalY = platform.y;
            platform.y = platform.originalY + oscillation * deltaTime;
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
        // All platforms must be activated to be solid (collision-enabled)
        if (!platform.activated) return false;
        
        // Additional checks for special platform types
        if (platform.type === 'disappearing') {
            return platform.visible !== false; // Must be visible to be solid
        }
        
        return true; // All other activated platforms are solid
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
    
    handleGroundCollision(groundY, pits, worldX, terrainSystem = null) {
        const playerCenterX = this.player.x + this.player.width / 2 - worldX;
        let onGround = true;
        
        // Check for pits (still override terrain)
        for (const pit of pits) {
            if (playerCenterX > pit.worldX && playerCenterX < pit.worldX + pit.width) {
                onGround = false;
                break;
            }
        }
        
        if (onGround) {
            let targetGroundY = groundY;
            
            // Use terrain height if terrain system is available
            if (terrainSystem) {
                const playerWorldX = this.player.x + this.player.width / 2 - worldX;
                targetGroundY = terrainSystem.getTerrainHeight(playerWorldX);
            }
            
            if (this.player.y + this.player.height > targetGroundY) {
                this.player.y = targetGroundY - this.player.height;
                this.player.vy = 0;
                this.player.grounded = true;
                
                // Align player with terrain angle for visual effect
                if (terrainSystem) {
                    const playerWorldX = this.player.x + this.player.width / 2 - worldX;
                    this.player.terrainAngle = terrainSystem.getTerrainAngle(playerWorldX);
                }
            }
        }
    }
    
    updateJumpState(groundY) {
        // Player can jump if grounded and on a valid surface
        this.player.canJump = this.player.grounded && 
                              (this.player.onPlatform || 
                               this.player.y + this.player.height <= groundY + 5); // Use actual ground level with small tolerance
    }
}