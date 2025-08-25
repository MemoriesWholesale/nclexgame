/**
 * ItemSpawner - Manages item drops from enemies and fixed spawn points
 */
export class ItemSpawner {
    constructor() {
        // Drop rates for different enemy types (percentage)
        this.dropRates = {
            basic: 25,      // 25% chance for basic enemies
            elite: 50,      // 50% chance for elite enemies  
            boss: 100       // 100% chance for bosses
        };
        
        // Available items that can drop
        this.dropTable = {
            weapons: [2, 3, 4, 5, 6, 7, 8], // Weapon IDs (excluding basic pill)
            powerups: ['life', 'speed_boost', 'jump_boost'],
            medications: ['epinephrine', 'morphine', 'insulin'],
            rare: ['armor_repair', 'invincibility']
        };
        
        // Fixed spawn points loaded from level data
        this.fixedSpawnPoints = [];
        this.spawnedFixedItems = new Set(); // Track which fixed items have been spawned
    }
    
    /**
     * Initialize fixed spawn points for a level
     */
    initializeLevel(levelData) {
        this.fixedSpawnPoints = levelData.fixedItemSpawns || [];
        this.spawnedFixedItems.clear();
    }
    
    /**
     * Handle enemy death and potentially drop items
     */
    handleEnemyDeath(enemy, worldX, enemyType = 'basic') {
        const dropChance = Math.random() * 100;
        const dropRate = this.dropRates[enemyType] || this.dropRates.basic;
        
        if (dropChance <= dropRate) {
            return this.generateEnemyDrop(enemy, worldX, enemyType);
        }
        
        return null; // No drop
    }
    
    /**
     * Generate item drop from enemy
     */
    generateEnemyDrop(enemy, worldX, enemyType) {
        const dropType = this.selectDropType(enemyType);
        const itemData = this.selectItemFromCategory(dropType, enemyType);
        
        return {
            type: dropType,
            worldX: enemy.worldX,
            y: enemy.y - 20, // Spawn slightly above enemy
            vy: -3, // Initial upward velocity
            vx: (Math.random() - 0.5) * 4, // Random horizontal velocity
            ...itemData,
            isEnemyDrop: true,
            despawnTimer: 600 // 10 seconds at 60fps
        };
    }
    
    /**
     * Select what type of item should drop
     */
    selectDropType(enemyType) {
        const rand = Math.random();
        
        switch (enemyType) {
            case 'boss':
                return rand < 0.6 ? 'weapons' : 'rare';
            case 'elite':
                if (rand < 0.4) return 'weapons';
                if (rand < 0.7) return 'powerups';
                if (rand < 0.9) return 'medications';
                return 'rare';
            case 'basic':
            default:
                if (rand < 0.5) return 'weapons';
                if (rand < 0.8) return 'powerups';
                return 'medications';
        }
    }
    
    /**
     * Select specific item from category
     */
    selectItemFromCategory(category, enemyType) {
        const items = this.dropTable[category];
        if (!items || items.length === 0) return null;
        
        const selectedItem = items[Math.floor(Math.random() * items.length)];
        
        switch (category) {
            case 'weapons':
                return {
                    subtype: 'weapon',
                    weaponId: selectedItem,
                    width: 30,
                    height: 30
                };
            case 'powerups':
                return {
                    subtype: 'powerup',
                    powerupType: selectedItem,
                    width: 25,
                    height: 25
                };
            case 'medications':
                return {
                    subtype: 'medication',
                    medicationType: selectedItem,
                    width: 30,
                    height: 30
                };
            case 'rare':
                return {
                    subtype: 'rare',
                    rareType: selectedItem,
                    width: 35,
                    height: 35
                };
            default:
                return null;
        }
    }
    
    /**
     * Check and spawn fixed items based on player progress
     */
    checkFixedSpawnPoints(playerWorldX, worldX, canvas) {
        const spawnedItems = [];
        
        for (const spawnPoint of this.fixedSpawnPoints) {
            // Skip if already spawned
            if (this.spawnedFixedItems.has(spawnPoint.id)) continue;
            
            // Check if player has reached the trigger point
            if (playerWorldX >= spawnPoint.triggerX) {
                const item = this.createFixedSpawnItem(spawnPoint, canvas);
                if (item) {
                    spawnedItems.push(item);
                    this.spawnedFixedItems.add(spawnPoint.id);
                }
            }
        }
        
        return spawnedItems;
    }
    
    /**
     * Create item from fixed spawn point
     */
    createFixedSpawnItem(spawnPoint, canvas) {
        const yPos = this.parsePosition(spawnPoint.y, canvas);
        
        return {
            id: spawnPoint.id,
            type: spawnPoint.itemType,
            subtype: spawnPoint.subtype,
            worldX: spawnPoint.x,
            y: yPos,
            width: spawnPoint.width || 30,
            height: spawnPoint.height || 30,
            vy: 0,
            vx: 0,
            weaponId: spawnPoint.weaponId,
            powerupType: spawnPoint.powerupType,
            medicationType: spawnPoint.medicationType,
            rareType: spawnPoint.rareType,
            isFixedSpawn: true,
            despawnTimer: spawnPoint.persistent ? -1 : 1800, // 30 seconds or persistent
            glowEffect: spawnPoint.rare || false
        };
    }
    
    /**
     * Update item physics and timers
     */
    updateItem(item, groundY, platforms) {
        // Apply gravity if not on ground
        if (item.y + item.height < groundY) {
            item.vy += 0.4;
            item.y += item.vy;
            
            if (item.vx) {
                item.worldX += item.vx;
                item.vx *= 0.98; // Air resistance
            }
        } else {
            // Ground collision
            item.y = groundY - item.height;
            item.vy = 0;
            if (item.vx) {
                item.vx *= 0.8; // Ground friction
                if (Math.abs(item.vx) < 0.1) item.vx = 0;
            }
        }
        
        // Check platform collisions
        this.checkPlatformCollisions(item, platforms);
        
        // Update despawn timer
        if (item.despawnTimer > 0) {
            item.despawnTimer--;
            return item.despawnTimer > 0;
        } else if (item.despawnTimer === 0) {
            return false; // Should despawn
        }
        
        return true; // Persistent item
    }
    
    /**
     * Check collisions with platforms
     */
    checkPlatformCollisions(item, platforms) {
        for (const platform of platforms) {
            if (!platform.activated) continue;
            
            const itemBottom = item.y + item.height;
            const itemTop = item.y;
            const itemLeft = item.worldX;
            const itemRight = item.worldX + item.width;
            
            const platformTop = platform.y;
            const platformBottom = platform.y + (platform.height || 20);
            const platformLeft = platform.worldX || platform.x;
            const platformRight = platformLeft + platform.width;
            
            // Check if item is falling onto platform
            if (item.vy > 0 && 
                itemBottom >= platformTop && itemBottom <= platformTop + 10 &&
                itemRight > platformLeft && itemLeft < platformRight) {
                
                item.y = platformTop - item.height;
                item.vy = 0;
                break;
            }
        }
    }
    
    /**
     * Parse position string to number
     */
    parsePosition(pos, canvas) {
        const groundY = canvas.height - 100;
        
        if (typeof pos === 'number') return pos;
        if (typeof pos === 'string' && pos.startsWith('ground')) {
            const match = pos.match(/ground-(\d+)/);
            if (match) {
                const offset = parseInt(match[1]);
                return groundY - offset;
            }
            return groundY;
        }
        return pos;
    }
    
    /**
     * Reset for new level
     */
    reset() {
        this.fixedSpawnPoints = [];
        this.spawnedFixedItems.clear();
    }
    
    /**
     * Get drop statistics for debugging
     */
    getDropStats() {
        return {
            dropRates: this.dropRates,
            fixedSpawns: this.fixedSpawnPoints.length,
            spawnedFixed: this.spawnedFixedItems.size
        };
    }
}