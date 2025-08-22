/**
 * GameState - Manages game state transitions and current game mode
 */
export class GameState {
    constructor() {
        this.current = 'menu';
        this.selectedLevel = -1;
        this.worldX = 0;
        this.screenLocked = false;
        
        // Game objects
        this.boss = null;
        this.gate = null;
        this.armorPickup = null;
        
        // Game arrays
        this.projectiles = [];
        this.platforms = [];
        this.npcs = [];
        this.pickups = [];
        this.pits = [];
        this.chests = [];
        this.powerups = [];
        this.medications = [];
        this.interactionZones = [];
        this.hiddenPlatforms = [];
        this.hazards = [];
        
        // Game timers
        this.pickupSpawnTimer = 0;
        this.medicationSpawnTimer = 0;
        this.fireTimer = 0;
        
        // Weapon system
        this.currentWeapon = 1;
        this.weaponNames = ['Pill', 'Syringe', 'Stethoscope', 'Bandage', 'Shears', 'Hammer', 'BP Monitor', 'Bottle'];
        this.weaponColors = ['#ffffff', '#00bfff', '#32cd32', '#ffa500', '#ff69b4', '#9370db', '#20b2aa', '#ff4500'];
        this.fireCooldowns = [10, 5, 20, 25, 30, 40, 25, 45];
        
        // Level settings
        this.testLevelEndX = 10800;
        this.groundY = 0;
    }
    
    /**
     * Reset game state for a new level
     */
    resetForNewLevel() {
        this.worldX = 0;
        this.screenLocked = false;
        this.boss = null;
        this.gate = null;
        this.armorPickup = null;
        this.currentWeapon = 1;
        
        // Clear all arrays
        this.projectiles.length = 0;
        this.platforms.length = 0;
        this.npcs.length = 0;
        this.pickups.length = 0;
        this.pits.length = 0;
        this.chests.length = 0;
        this.powerups.length = 0;
        this.medications.length = 0;
        this.interactionZones.length = 0;
        this.hiddenPlatforms.length = 0;
        this.hazards.length = 0;
        
        // Reset timers
        this.pickupSpawnTimer = 0;
        this.medicationSpawnTimer = 0;
        this.fireTimer = 0;
    }
    
    /**
     * Update game timers
     */
    updateTimers() {
        if (this.fireTimer > 0) this.fireTimer--;
        this.pickupSpawnTimer++;
    }
    
    /**
     * Check if can fire weapon
     */
    canFireWeapon() {
        return this.fireTimer <= 0;
    }
    
    /**
     * Set weapon fire cooldown
     */
    setFireCooldown() {
        this.fireTimer = this.fireCooldowns[this.currentWeapon - 1];
    }
    
    /**
     * Should spawn pickup
     */
    shouldSpawnPickup() {
        return this.pickupSpawnTimer > 450;
    }
    
    /**
     * Reset pickup spawn timer
     */
    resetPickupTimer() {
        this.pickupSpawnTimer = 0;
    }
}