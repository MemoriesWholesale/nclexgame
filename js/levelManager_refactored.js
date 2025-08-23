/**
 * LevelManager - Refactored for better modularity and maintainability
 */
import { Enemy } from './enemy.js';
import { LevelPlatforms } from './systems/LevelPlatforms.js';
import { LevelZones } from './systems/LevelZones.js';
import { LevelPathValidator } from './systems/LevelPathValidator.js';
import { MIN_SPAWN_DISTANCE, LEVEL_DATA } from './constants.js';

class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.levelDefinitions = {};
        
        // Level metadata for fallback cases
        this.levelData = LEVEL_DATA;
        
        // Initialize subsystems
        this.platforms = new LevelPlatforms(this);
        this.zones = new LevelZones(this);
        this.pathValidator = new LevelPathValidator();
    }
    
    /**
     * Clear all level-specific content arrays to prevent carryover between levels
     */
    clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups) {
        // Reset dynamic states before clearing arrays
        if (platforms && platforms.length > 0) {
            this.platforms.resetStates(platforms);
        }
        if (hazards && hazards.length > 0) {
            this.resetHazardStates(hazards);
        }
        
        // Clear all content arrays
        this.clearArrays([platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups]);
        
        // Reset the current level to prevent any references to old level data
        this.currentLevel = null;
    }
    
    /**
     * Reset enemy wave trigger states to ensure they can spawn again in fresh level loads
     */
    resetEnemyWaveStates() {
        if (!this.currentLevel || !this.currentLevel.enemyWaves) return;
        
        this.currentLevel.enemyWaves.forEach(wave => {
            wave.triggered = false;
        });
    }
    
    /**
     * Update platform states (delegated to platform system)
     */
    updatePlatformStates(platforms, worldX, player, canvas) {
        this.platforms.updateStates(platforms, worldX, player, canvas);
    }
    
    /**
     * Reset all dynamic hazard states that can accumulate during gameplay
     */
    resetHazardStates(hazards) {
        hazards.forEach(hazard => {
            // Reset falling object hazard instances
            if (hazard.type === 'falling_object') {
                hazard.instances = [];
                hazard.lastSpawned = false;
            }
            
            // Reset rushing hazard position and direction
            if (hazard.type === 'rushing_hazard') {
                hazard.currentX = hazard.worldX;
                hazard.direction = hazard.speed > 0 ? 1 : -1;
            }
            
            // Reset any timing states
            if (hazard.timing) {
                delete hazard.lastTriggerTime;
            }
        });
    }
    
    /**
     * Load a level by ID
     */
    async loadLevel(levelId) {
        console.log('Attempting to load level:', levelId);
        
        try {
            const module = await this.importLevelModule(levelId);
            
            if (module && module.default) {
                this.currentLevel = JSON.parse(JSON.stringify(module.default));
                this.resetEnemyWaveStates();
                this.zones.initializeZones(this.currentLevel);
                
                // Validate level accessibility (development mode only)
                this.validateLevelAccessibility();
                
                console.log('Level loaded successfully:', this.currentLevel);
                return this.currentLevel;
            } else {
                throw new Error('Module loaded but no default export found');
            }
            
        } catch (error) {
            return this.handleLevelLoadError(error, levelId);
        }
    }
    
    /**
     * Import level module based on level ID
     */
    async importLevelModule(levelId) {
        // Use dynamic imports for better modularity
        const levelImports = {
            0: () => import('./levels/level_0.js'),
            1: () => import('./levels/level_1.js'),
            2: () => import('./levels/level_2.js'),
            3: () => import('./levels/level_3.js'),
            4: () => import('./levels/level_4.js'),
            5: () => import('./levels/level_5.js'),
            6: () => import('./levels/level_6.js'),
            7: () => import('./levels/level_7.js')
        };
        
        if (levelImports[levelId]) {
            return await levelImports[levelId]();
        } else {
            // Return placeholder for unsupported levels
            return this.createPlaceholderLevel(levelId);
        }
    }
    
    /**
     * Create placeholder level for unsupported level IDs
     */
    createPlaceholderLevel(levelId) {
        console.log('Using placeholder for level', levelId);
        this.currentLevel = {
            id: levelId,
            name: `Level ${levelId}`,
            color: '#87CEEB',
            questionFile: this.levelData[levelId].file,
            worldLength: 10800,
            playerStart: { x: 100, y: 'ground-0' },
            platforms: [],
            npcs: [],
            hazards: [],
            items: [],
            enemyWaves: []
        };
        this.resetEnemyWaveStates();
        return { default: this.currentLevel };
    }
    
    /**
     * Handle level load errors
     */
    handleLevelLoadError(error, levelId) {
        console.error('Error loading level:', error);
        console.error('Error details:', {
            levelId,
            currentLocation: window.location.href,
            error: error.message
        });
        
        return null;
    }
    
    /**
     * Helper to parse relative positions
     */
    parsePosition(pos, canvas) {
        const groundY = canvas.height - 100;
        
        if (typeof pos === 'number') return pos;
        
        // Parse "ground-120" format (ground minus 120 pixels up)
        if (typeof pos === 'string' && pos.startsWith('ground')) {
            const match = pos.match(/ground-(\d+)/);
            if (match) {
                const offset = parseInt(match[1]);
                return groundY - offset;
            }
            return groundY;
        }
        
        // Parse "center" format
        if (pos === 'center-x') return canvas.width / 2;
        if (pos === 'center-y') return canvas.height / 2;
        
        // Parse percentage format "50%"
        if (typeof pos === 'string' && pos.endsWith('%')) {
            const percent = parseInt(pos) / 100;
            return canvas.height * percent;
        }
        
        return pos;
    }
    
    /**
     * Initialize level zones (delegated to zones system)
     */
    initializeLevelZones(level) {
        this.zones.initializeZones(level);
    }
    
    /**
     * Apply zone effects to player (delegated to zones system)
     */
    applyZoneEffects(player, worldX, canvas) {
        this.zones.applyEffects(player, worldX, canvas);
    }
    
    /**
     * Spawn level content (platforms, NPCs, chests, hazards, enemies)
     */
    spawnLevelContent(worldX, canvas, platforms, npcs, chests, hazards, enemyManager) {
        if (!this.currentLevel) return;
        
        const level = this.currentLevel;
        const visibleBounds = this.getVisibleBounds(worldX, canvas);
        
        // Spawn different types of content
        this.spawnPlatforms(level, visibleBounds, platforms, canvas);
        this.spawnNPCs(level, visibleBounds, npcs, canvas);
        this.spawnChests(level, visibleBounds, chests, platforms, canvas);
        this.spawnHazards(level, visibleBounds, hazards, canvas);
        this.spawnEnemyWaves(level, worldX, canvas, enemyManager);
    }
    
    /**
     * Get visible bounds for content spawning
     */
    getVisibleBounds(worldX, canvas) {
        return {
            left: -worldX - 200,
            right: -worldX + canvas.width + 200
        };
    }
    
    /**
     * Spawn platforms in visible area
     */
    spawnPlatforms(level, visibleBounds, platforms, canvas) {
        level.platforms?.forEach(plat => {
            if (platforms.some(p => p.id === plat.id)) return;
            if (!this.isInVisibleArea(plat.x, visibleBounds)) return;
            
            const newPlatform = this.createPlatform(plat, canvas);
            platforms.push(newPlatform);
        });
    }
    
    /**
     * Spawn NPCs in visible area
     */
    spawnNPCs(level, visibleBounds, npcs, canvas) {
        level.npcs?.forEach(npc => {
            if (npcs.some(n => n.id === npc.id)) return;
            if (!this.isInVisibleArea(npc.x, visibleBounds)) return;
            
            const newNPC = this.createNPC(npc, canvas);
            npcs.push(newNPC);
        });
    }
    
    /**
     * Spawn chests in visible area
     */
    spawnChests(level, visibleBounds, chests, platforms, canvas) {
        level.items?.forEach(item => {
            if (item.type !== 'chest') return;
            
            const chestId = `chest_${item.x}`;
            if (chests.some(c => c.id === chestId)) return;
            if (!this.isInVisibleArea(item.x, visibleBounds)) return;
            
            const newChest = this.createChest(item, platforms, canvas, chestId);
            chests.push(newChest);
        });
    }
    
    /**
     * Spawn hazards in visible area
     */
    spawnHazards(level, visibleBounds, hazards, canvas) {
        level.hazards?.forEach(haz => {
            if (hazards.some(h => h.id === haz.id)) return;
            if (!this.isInVisibleArea(haz.x, visibleBounds)) return;
            
            const newHazard = this.createHazard(haz, canvas);
            hazards.push(newHazard);
        });
    }
    
    /**
     * Spawn enemy waves when triggered
     */
    spawnEnemyWaves(level, worldX, canvas, enemyManager) {
        level.enemyWaves?.forEach(wave => {
            if (wave.triggered) return;
            
            const playerWorldX = -worldX + canvas.width / 2;
            if (playerWorldX >= wave.triggerX) {
                wave.triggered = true;
                this.spawnEnemiesFromWave(wave, playerWorldX, canvas, enemyManager);
            }
        });
    }
    
    // Helper methods for content creation
    createPlatform(plat, canvas) {
        const newPlatform = {
            ...plat,
            worldX: plat.x,
            y: this.parsePosition(plat.y, canvas),
            activated: plat.activated !== false
        };
        
        // Handle special platform types
        if (plat.type === 'elevator' && plat.startY && plat.endY) {
            newPlatform.startY = this.parsePosition(plat.startY, canvas);
            newPlatform.endY = this.parsePosition(plat.endY, canvas);
        }
        
        if (plat.type === 'orbiting' && plat.orbit) {
            newPlatform.orbit.centerY = this.parsePosition(plat.orbit.centerY, canvas);
            newPlatform.orbit.currentAngle = plat.orbit.startAngle || 0;
        }
        
        return newPlatform;
    }
    
    createNPC(npc, canvas) {
        return {
            ...npc,
            worldX: npc.x,
            y: this.parsePosition(npc.y, canvas),
            width: npc.width || 40,
            height: npc.height || 60,
            interactionId: npc.id,
            isLeaving: false
        };
    }
    
    createChest(item, platforms, canvas, chestId) {
        let yPos = this.parsePosition(item.y, canvas);
        
        // Handle relative positioning to platforms
        if (typeof item.y === 'string' && item.y.includes('-top')) {
            const platId = item.y.replace('-top', '');
            const platform = platforms.find(p => p.id === platId);
            if (platform) {
                yPos = platform.y;
            }
        }
        
        return {
            worldX: item.x,
            y: yPos,
            width: 50,
            height: 25,
            id: chestId,
            state: 'closed',
            contains: item.contains,
            subtype: item.subtype,
            weaponId: item.weaponId,
            requiresQuestion: item.requiresQuestion !== false
        };
    }
    
    createHazard(haz, canvas) {
        return {
            ...haz,
            worldX: haz.x,
            y: this.parsePosition(haz.y, canvas)
        };
    }
    
    spawnEnemiesFromWave(wave, playerWorldX, canvas, enemyManager) {
        wave.enemies.forEach(enemyDef => {
            let spawnX = enemyDef.x;
            if (Math.abs(spawnX - playerWorldX) < MIN_SPAWN_DISTANCE) {
                spawnX = playerWorldX + Math.sign(spawnX - playerWorldX || 1) * MIN_SPAWN_DISTANCE;
            }
            
            const newEnemy = new Enemy(spawnX, this.parsePosition(enemyDef.y, canvas));
            newEnemy.hp = enemyDef.hp || 1;
            enemyManager.enemies.push(newEnemy);
        });
    }
    
    /**
     * Check if position is in visible area
     */
    isInVisibleArea(x, visibleBounds) {
        return x > visibleBounds.left && x < visibleBounds.right;
    }
    
    /**
     * Get level-specific data
     */
    getLevelData() {
        return this.currentLevel || null;
    }
    
    /**
     * Check if boss should spawn
     */
    shouldSpawnBoss(worldX, canvas) {
        if (!this.currentLevel || !this.currentLevel.boss) return false;
        const playerWorldX = -worldX + canvas.width / 2;
        return playerWorldX >= this.currentLevel.boss.triggerX;
    }
    
    /**
     * Get boss configuration
     */
    getBossConfig(canvas) {
        if (!this.currentLevel || !this.currentLevel.boss) return null;
        
        const boss = this.currentLevel.boss;
        return {
            x: canvas.width - 200,
            y: this.parsePosition(boss.y, canvas) - 120,
            width: 80,
            height: 120,
            vx: -2,
            hp: boss.hp || 10,
            maxHp: boss.hp || 10,
            type: boss.type,
            phases: boss.phases
        };
    }
    
    /**
     * Validate level accessibility for game design compliance
     */
    validateLevelAccessibility() {
        if (!this.currentLevel) return;
        
        // Create a mock canvas for validation (typical game canvas dimensions)
        const mockCanvas = { width: 1024, height: 768 };
        
        const validation = this.pathValidator.validateLevel(this.currentLevel, mockCanvas);
        
        if (!validation.isValid) {
            console.warn(`⚠️ Level ${this.currentLevel.id} has accessibility issues:`);
            validation.issues.forEach(issue => {
                console.warn(`  • ${issue}`);
            });
        }
        
        if (validation.recommendations.length > 0) {
            console.log(`💡 Level ${this.currentLevel.id} recommendations:`);
            validation.recommendations.forEach(rec => {
                console.log(`  • ${rec}`);
            });
        }
        
        if (validation.isValid && validation.recommendations.length === 0) {
            console.log(`✅ Level ${this.currentLevel.id} accessibility validation passed`);
        }
    }
    
    /**
     * Generate detailed validation report for a level
     */
    generateValidationReport(canvas = { width: 1024, height: 768 }) {
        if (!this.currentLevel) return 'No level loaded';
        return this.pathValidator.generateReport(this.currentLevel, canvas);
    }
    
    /**
     * Utility method to clear multiple arrays
     */
    clearArrays(arrays) {
        arrays.forEach(arr => {
            if (arr && arr.length !== undefined) {
                arr.length = 0;
            }
        });
    }
}

// Export the class
export default LevelManager;