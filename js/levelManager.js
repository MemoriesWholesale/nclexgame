class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.levelDefinitions = {};
    }
    
    // Clear all level-specific content arrays to prevent carryover between levels
    clearLevelContent(platforms, npcs, enemies, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups) {
        if (platforms) platforms.length = 0;
        if (npcs) npcs.length = 0;
        if (enemies) enemies.length = 0;
        if (chests) chests.length = 0;
        if (hazards) hazards.length = 0;
        if (pits) pits.length = 0;
        if (powerups) powerups.length = 0;
        if (medications) medications.length = 0;
        if (interactionZones) interactionZones.length = 0;
        if (hiddenPlatforms) hiddenPlatforms.length = 0;
        if (projectiles) projectiles.length = 0;
        if (pickups) pickups.length = 0;
    }
    
    async loadLevel(levelId) {
        console.log('Attempting to load level:', levelId);
        
        try {
            let module;
            
            // Try different import paths to see which works
            const levelPath = `./levels/level_${levelId}.js`;
            console.log('Import path:', levelPath);
            
            switch(levelId) {
                case 0:
                    // Try the import
                    try {
                        module = await import('./levels/level_0.js');
                        console.log('Successfully imported level_0.js:', module);
                    } catch (e) {
                        console.error('Failed to import level_0.js:', e);
                        
                        // Try alternative path
                        try {
                            module = await import('../js/levels/level_0.js');
                            console.log('Successfully imported with alternative path');
                        } catch (e2) {
                            console.error('Alternative path also failed:', e2);
                            throw e;
                        }
                    }
                    break;
                    
                    case 1:
                        try {
                            module = await import('./levels/level_1.js');
                            console.log('Successfully imported level_1.js:', module);
                        } catch (e) {
                            console.error('Failed to import level_1.js:', e);
                            throw e;
                        }
                        break;                
                    case 2:
                        try {
                            module = await import('./levels/level_2.js');
                            console.log('Successfully imported level_2.js:', module);
                        } catch (e) {
                            console.error('Failed to import level_2.js:', e);                                throw e;
                            }
                            break;
                    case 3:
                            module = await import('./levels/level_3.js');
                            break;
                case 4:
                            module = await import('./levels/level_4.js');
                            break;
                case 5:
                case 6:
                case 7:
                    // For now, return a placeholder for other levels
                    console.log('Using placeholder for level', levelId);
                    this.currentLevel = {
                        id: levelId,
                        name: `Level ${levelId}`,
                        color: '#87CEEB',
                        questionFile: levelData[levelId].file,
                        worldLength: 10800,
                        playerStart: { x: 100, y: 'ground-0' },
                        platforms: [],
                        npcs: [],
                        hazards: [],
                        items: []
                    };
                    return this.currentLevel;
                    
                default:
                    throw new Error('Invalid level ID: ' + levelId);
            }
            
            if (module && module.default) {
                this.currentLevel = module.default;
                console.log('Level loaded successfully:', this.currentLevel);
                return this.currentLevel;
            } else {
                throw new Error('Module loaded but no default export found');
            }
            
        } catch (error) {
            console.error('Error loading level:', error);
            console.error('Error details:', {
                levelId,
                currentLocation: window.location.href,
                error: error.message
            });
            
            // Return null instead of throwing
            return null;
        }
    }
    
    // Helper to parse relative positions
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
    
    spawnLevelContent(worldX, canvas, platforms, npcs, enemies, chests, hazards) {
        if (!this.currentLevel) return;
        
        const level = this.currentLevel;
        const visibleLeft = -worldX - 200;
        const visibleRight = -worldX + canvas.width + 200;
        
        // Spawn platforms
        level.platforms?.forEach(plat => {
            // Check if already spawned
            if (platforms.some(p => p.id === plat.id)) return;
            
            // Check if in visible range
            if (plat.x > visibleLeft && plat.x < visibleRight) {
                const newPlatform = {
                    ...plat,
                    worldX: plat.x,
                    y: this.parsePosition(plat.y, canvas),
                    activated: plat.activated !== false
                };

                if (plat.type === 'elevator' && plat.startY && plat.endY) {
                    newPlatform.startY = this.parsePosition(plat.startY, canvas);
                    newPlatform.endY = this.parsePosition(plat.endY, canvas);
                }
                
                // **FIX**: Initialize orbiting platforms
                if (plat.type === 'orbiting' && plat.orbit) {
                    newPlatform.orbit.centerY = this.parsePosition(plat.orbit.centerY, canvas);
                    newPlatform.orbit.currentAngle = plat.orbit.startAngle || 0;
                }

                platforms.push(newPlatform);
            }
        });
        
        // Spawn NPCs
        level.npcs?.forEach(npc => {
            // Check if already spawned
            if (npcs.some(n => n.id === npc.id)) return;
            
            // Check if in visible range
            if (npc.x > visibleLeft && npc.x < visibleRight) {
                npcs.push({
                    ...npc,
                    worldX: npc.x,
                    y: this.parsePosition(npc.y, canvas),
                    width: npc.width || 40,
                    height: npc.height || 60,
                    interactionId: npc.id, // Use unique NPC id for tracking
                    isLeaving: false
                });
            }
        });
        
        // Spawn chests
        level.items?.forEach(item => {
            if (item.type !== 'chest') return;
            
            // Check if already spawned
            if (chests.some(c => c.worldX === item.x)) return;
            
            // Check if in visible range
            if (item.x > visibleLeft && item.x < visibleRight) {
                let yPos = this.parsePosition(item.y, canvas);
                
                // Handle relative positioning to platforms
                if (typeof item.y === 'string' && item.y.includes('-top')) {
                    const platId = item.y.replace('-top', '');
                    const platform = platforms.find(p => p.id === platId);
                    if (platform) {
                        yPos = platform.y;
                    }
                }
                
                chests.push({
                    worldX: item.x,
                    y: yPos,
                    width: 50,
                    height: 25,
                    id: `chest_${item.x}`,
                    state: 'closed',
                    contains: item.contains,
                    subtype: item.subtype, // For medications
                    weaponId: item.weaponId, // For weapon upgrades
                    requiresQuestion: item.requiresQuestion !== false
                });
            }
        });

        level.hazards?.forEach(haz => {
            // Check if already spawned
            if (hazards.some(h => h.id === haz.id)) return;
            
            // Check if in visible range
            if (haz.x > visibleLeft && haz.x < visibleRight) {
                const newHazard = {
                    ...haz,
                    worldX: haz.x,
                    y: this.parsePosition(haz.y, canvas)
                };
                hazards.push(newHazard);
            }
        });
        
        // Spawn enemy waves when triggered
        level.enemyWaves?.forEach(wave => {
            // Check if already triggered
            if (wave.triggered) return;
            
            // Check if player has reached trigger point
            const playerWorldX = -worldX + canvas.width / 2;
            if (playerWorldX >= wave.triggerX) {
                wave.triggered = true;
                
                wave.enemies.forEach(enemyDef => {
                    enemies.push({
                        worldX: enemyDef.x,
                        y: this.parsePosition(enemyDef.y, canvas),
                        vy: 0,
                        width: enemyDef.width || 40,
                        height: enemyDef.height || 40,
                        vx: 0,
                        hp: enemyDef.hp || 1,
                        type: enemyDef.type || 'basic',
                        falling: false
                    });
                });
            }
        });
    }
    
    // Get level-specific data
    getLevelData() {
        return this.currentLevel || null;
    }
    
    // Check if boss should spawn
    shouldSpawnBoss(worldX, canvas) {
        if (!this.currentLevel || !this.currentLevel.boss) return false;
        
        const playerWorldX = -worldX + canvas.width / 2;
        return playerWorldX >= this.currentLevel.boss.triggerX;
    }
    
    // Get boss configuration
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
}

// Export the class
export default LevelManager;