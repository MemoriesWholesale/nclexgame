import { PlayerMedication } from './systems/PlayerMedication.js';
import { PlayerPhysics } from './systems/PlayerPhysics.js';
import { PlayerAnimation } from './systems/PlayerAnimation.js';
import { PlayerInput } from './systems/PlayerInput.js';

export class Player {
    constructor(canvas) {
        // Core properties
        this.canvas = canvas;
        this.x = 100;
        this.y = 0;
        this.width = 50;
        this.height = 92;
        
        // Movement state
        this.vx = 0;
        this.vy = 0;
        this.baseSpeed = 5;
        this.baseJumpPower = 15;
        this.speedMultiplier = 1;
        this.jumpMultiplier = 1;
        this.facing = 1;
        
        // Player state
        this.grounded = false;
        this.crouching = false;
        this.onPlatform = null;
        this.canJump = false;
        this.lives = 3;
        this.dead = false;
        this.isRespawning = false;
        
        // Ability flags
        this.sizeScale = 1;
        this.invincible = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.canGlide = false;
        this.isGliding = false;
        this.hiddenPlatformsVisible = false;
        this.bulletTime = false;
        
        // Special effects (from level zones)
        this.invertedControls = false;
        this.hasTwin = false;
        this.twinX = 0;
        this.shadowTwin = {
            active: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            grounded: false,
            facing: 1,
            actionTimer: 0,
            currentAction: 'idle',
            actionDuration: 0
        };
        this.evilTwin = {
            active: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            grounded: false,
            facing: 1,
            actionTimer: 0,
            currentAction: 'pursuit',
            actionDuration: 0,
            fireTimer: 0,
            lastPlayerX: 0,
            aggressionLevel: 1.0
        };
        this.gravityFlipped = false;
        this.tunnelVision = 0;
        this.depressionFog = 0;
        this.preventedEffects = new Set();
        
        // Armor system
        this.armors = [0];
        this.currentArmorIndex = 0;
        
        // Weapon system
        this.currentWeapon = 1;
        
        // Animation properties
        this.isShooting = false;
        this.shootTimer = 0;
        
        // Initialize subsystems
        this.medication = new PlayerMedication(this);
        this.physics = new PlayerPhysics(this);
        this.animation = new PlayerAnimation(this);
        this.input = new PlayerInput(this);
    }
    
    /**
     * Handle player input for movement
     */
    handleInput(keys, onSpill) {
        this.input.handleInput(keys, onSpill);
        this.physics.applySpillPhysics(onSpill);
    }
    
    /**
     * Update player state and animation
     */
    updateState(spriteAnimations) {
        this.animation.updateState(spriteAnimations);
    }
    
    /**
     * Update player physics and position
     */
    updatePhysics(groundY, platforms, pits, worldX) {
        this.physics.update(groundY, platforms, pits, worldX);
    }
    
    /**
     * Check if player should die from falling
     */
    checkFallDeath() {
        return (this.y > this.canvas.height + 50 && !this.dead);
    }
    
    /**
     * Handle player death
     */
    die() {
        this.lives--;
        this.dead = true;
    }
    
    /**
     * Respawn the player (preserves lives, weapon, and armor)
     */
    respawn(groundY) {
        this.dead = false;
        this.isRespawning = false;
        this.x = 100;
        this.y = groundY - this.height;
        this.vx = 0;
        this.vy = 0;

        // Reset temporary zone effects
        this.invertedControls = false;
        this.hasTwin = false;
        this.twinX = 0;
        this.shadowTwin.active = false;
        this.evilTwin.active = false;
        this.gravityFlipped = false;
        this.tunnelVision = 0;
        this.depressionFog = 0;
        this.speedMultiplier = 1;

        // Clear medication effects on respawn
        this.medication.clearAll();
        
        // Note: Weapon, armor, and lives are preserved during respawn
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
        const enemyTop = enemy.y - enemy.height;
        const enemyBottom = enemy.y;

        if (!this.dead && this.x < screenX + enemy.width &&
            this.x + this.width > screenX &&
            this.y < enemyBottom &&
            this.y + this.height > enemyTop) {

            this.die(); // Use consistent die() method
            return true;
        }
        return false;
    }
    
    // Check collision with boss
    checkBossCollision(boss) {
        if (boss && !this.dead && 
            this.x < boss.x + boss.width && this.x + this.width > boss.x && 
            this.y < boss.y + boss.height && this.y + this.height > boss.y) {
            
            // Boss instantly kills player (set lives to 1 so die() reduces it to 0)
            this.lives = 1;
            this.die();
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
    
    /**
     * Apply medication effect
     */
    applyMedication(medType) {
        return this.medication.applyMedication(medType);
    }

    /**
     * Update medication effects
     */
    updateMedications() {
        this.medication.update();
    }
    
    /**
     * Get active medications for UI display
     */
    get activeMedications() {
        return this.medication.activeMedications;
    }

    /**
     * Handle shooting
     */
    startShooting() {
        this.animation.startShooting();
    }
    
    /**
     * Switch armor
     */
    switchArmor() {
        this.currentArmorIndex = (this.currentArmorIndex + 1) % this.armors.length;
    }
    
    /**
     * Get weapon spawn position for projectiles
     */
    getWeaponSpawnPos() {
        const weaponYOffset = this.crouching ? 20 : 0;
        return {
            x: this.x + (this.facing > 0 ? this.width : -30),
            y: this.y + this.height / 2 + weaponYOffset,
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2 + weaponYOffset
        };
    }
    
    /**
     * Render the player
     */
    render(ctx, playerSprite, spriteLoaded, spriteAnimations, armorData, overrideX = null) {
        this.animation.render(ctx, playerSprite, spriteLoaded, spriteAnimations, armorData, overrideX);
    }
    
    /**
     * Reset player to initial state
     */
    reset(groundY, preservePersistentState = false) {
        // Store persistent state if preserving
        let savedLives, savedArmors, savedArmorIndex, savedWeapon;
        if (preservePersistentState) {
            savedLives = this.lives;
            savedArmors = [...this.armors];
            savedArmorIndex = this.currentArmorIndex;
            savedWeapon = this.currentWeapon;
        }

        // Reset position and movement
        this.x = 100;
        this.y = groundY - this.height;
        this.vx = 0;
        this.vy = 0;
        
        // Reset player state
        this.lives = preservePersistentState ? savedLives : 3;
        this.dead = false;
        this.isRespawning = false;
        this.crouching = false;
        this.grounded = true;
        this.onPlatform = null;
        
        // Reset abilities and effects
        this.speedMultiplier = 1;
        this.jumpMultiplier = 1;
        this.sizeScale = 1;
        this.width = 50;
        this.height = 92;

        // Clear zone effects and preventions
        this.invertedControls = false;
        this.hasTwin = false;
        this.twinX = 0;
        this.shadowTwin.active = false;
        this.evilTwin.active = false;
        this.gravityFlipped = false;
        this.tunnelVision = 0;
        this.depressionFog = 0;
        this.preventedEffects.clear();
        
        // Restore persistent state if preserving
        if (preservePersistentState) {
            this.armors = savedArmors;
            this.currentArmorIndex = savedArmorIndex;
            this.currentWeapon = savedWeapon;
        } else {
            // Reset armor and weapon to initial state
            this.armors = [0];
            this.currentArmorIndex = 0;
            this.currentWeapon = 1;
        }
        
        // Clear subsystem state
        this.medication.clearAll();
        this.animation.reset();
    }
}