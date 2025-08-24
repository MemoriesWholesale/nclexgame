import { Enemy } from './enemy.js';
import { MIN_SPAWN_DISTANCE, LEVEL_DATA } from './constants.js';

class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.levelDefinitions = {};
        
        // Level metadata for fallback cases
        this.levelData = LEVEL_DATA;
    }

    // Clear all level-specific content arrays to prevent carryover between levels
    clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups) {
        // Reset dynamic states before clearing arrays to ensure clean state
        if (platforms && platforms.length > 0) this.resetPlatformStates(platforms);
        if (hazards && hazards.length > 0) this.resetHazardStates(hazards);
        
        // Clear all content arrays
        if (platforms) platforms.length = 0;
        if (npcs) npcs.length = 0;
        if (chests) chests.length = 0;
        if (hazards) hazards.length = 0;
        if (pits) pits.length = 0;
        if (powerups) powerups.length = 0;
        if (medications) medications.length = 0;
        if (interactionZones) interactionZones.length = 0;
        if (hiddenPlatforms) hiddenPlatforms.length = 0;
        if (projectiles) projectiles.length = 0;
        if (pickups) pickups.length = 0;
        
        // Reset the current level to prevent any references to old level data
        this.currentLevel = null;
    }

    // Reset enemy wave trigger states to ensure they can spawn again in fresh level loads
    resetEnemyWaveStates() {
        if (!this.currentLevel || !this.currentLevel.enemyWaves) return;
        
        this.currentLevel.enemyWaves.forEach(wave => {
            wave.triggered = false;
        });
    }
    updatePlatformStates(platforms, worldX, player, canvas) {
        const now = Date.now();
        
        platforms.forEach(platform => {
            // Handle rhythmic platforms (Level 6 - cardiac)
            if (platform.type === 'rhythmic' && platform.activated) {
                const beatPhase = ((now + (platform.offset || 0)) % platform.beatInterval) / platform.beatInterval;
                
                if (platform.irregular) {
                    // Atrial fibrillation - irregular rhythm
                    platform.visible = Math.random() > 0.3;
                } else {
                    // Normal sinus rhythm - regular beats
                    platform.visible = beatPhase < 0.6; // Visible 60% of cycle
                }
                
                // Platform only solid when visible
                platform.activated = platform.visible;
            }

            // Handle breathing platforms (Level 6 - respiratory)
            if (platform.type === 'breathing' && platform.activated) {
                const breathPhase = ((now + (platform.offset || 0)) % 3000) / 3000; // 3 second breath cycle
                const expansion = Math.sin(breathPhase * Math.PI * 2) * 0.5 + 0.5;
                
                platform.width = platform.minWidth + (platform.maxWidth - platform.minWidth) * expansion;
                // Recenter platform as it expands
                const widthDiff = platform.width - platform.minWidth;
                platform.worldX = platform.originalX - widthDiff / 2;
                if (!platform.originalX) platform.originalX = platform.worldX;
            }

            // Handle oxygen-dependent platforms (Level 6)
            if (platform.type === 'oxygen_dependent' && platform.activated) {
                // Get current O2 from respiratory zone if player is in it
                let currentO2 = platform.currentO2 || 95;
                
                // Platform fades if O2 too low
                if (currentO2 < platform.minO2) {
                    platform.opacity = Math.max(0, (currentO2 - 80) / (platform.minO2 - 80));
                    platform.activated = platform.opacity > 0.3;
                } else {
                    platform.opacity = 1;
                }
            }

            // Handle fluid-sensitive platforms (Level 6)
            if (platform.type === 'fluid_sensitive' && platform.activated) {
                if (platform.sinks) {
                    // Platform sinks based on fluid level
                    const sinkAmount = (platform.currentFluid - 50) * 0.5;
                    platform.y = platform.originalY + sinkAmount;
                    if (!platform.originalY) platform.originalY = platform.y;
                }
            }

            // Handle tilting platforms (Level 5 - positioning)
            if (platform.type === 'tilting' && platform.activated) {
                // Gradually tilt toward target angle
                const angleDiff = platform.targetAngle - platform.currentAngle;
                platform.currentAngle += angleDiff * 0.02;
                
                // Apply tilt physics to player if on platform
                if (player.onPlatform === platform) {
                    player.vx += Math.sin(platform.currentAngle * Math.PI / 180) * 0.3;
                }
            }

            // Handle temperature platforms (Level 5)
            if (platform.type === 'temperature' && platform.activated) {
                // Create visual effect based on temperature
                if (platform.temp === 'hot') {
                    platform.heatWave = Math.sin(now * 0.01) * 5;
                } else if (platform.temp === 'cold') {
                    platform.frostLevel = Math.sin(now * 0.005) * 0.3 + 0.7;
                }
            }

            // Handle noise-sensitive platforms (Level 5 - sleep)
            if (platform.type === 'noise_sensitive' && platform.activated) {
                // Check for nearby noise sources
                let totalNoise = 0;
                platforms.forEach(other => {
                    if (other.type === 'noisy' && other.activated) {
                        const distance = Math.abs(platform.worldX - other.worldX);
                        if (distance < 500) {
                            totalNoise += other.noiseLevel * (1 - distance / 500);
                        }
                    }
                });
                
                if (totalNoise > platform.maxNoise && platform.breaksIfLoud) {
                    platform.breaking = true;
                    platform.breakTimer = (platform.breakTimer || 0) + 1;
                    if (platform.breakTimer > 60) {
                        platform.activated = false;
                        setTimeout(() => {
                            platform.activated = true;
                            platform.breaking = false;
                            platform.breakTimer = 0;
                        }, 3000);
                    }
                }
            }

            // Handle pulsing pain platforms (Level 5)
            if (platform.type === 'pulsing' && platform.activated) {
                const pulsePhase = ((now + (platform.offset || 0)) % platform.pulseRate) / platform.pulseRate;
                const safePhase = platform.safeWindow / platform.pulseRate;
                
                platform.isPainful = pulsePhase > safePhase;
                platform.painIntensity = platform.isPainful ? platform.painLevel : 0;
                
                // Visual pulsing effect
                platform.pulseScale = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.1;
            }

            // Handle milestone platforms (Level 7 - infant)
            if (platform.type === 'milestone' && platform.activated) {
                if (platform.skill === 'rolling' && platform.rotates) {
                    platform.rotation = (platform.rotation || 0) + 0.02;
                }
                if (platform.skill === 'sitting' && !platform.stable) {
                    platform.wobble = Math.sin(now * 0.003) * 5;
                }
                if (platform.skill === 'standing' && platform.wobbly) {
                    platform.sway = Math.sin(now * 0.004) * 3;
                }
            }

            // Handle growth spurt platforms (Level 7 - childhood)
            if (platform.type === 'growth_spurt' && platform.activated) {
                if (platform.height < platform.maxHeight) {
                    platform.height += platform.growthRate * 0.1;
                    platform.y = platform.originalY - (platform.height - 20);
                    if (!platform.originalY) platform.originalY = platform.y;
                }
            }

            // Handle bubble protection platforms (Level 7 - prenatal)
            if (platform.type === 'bubble' && platform.activated) {
                platform.protection -= platform.degradeRate * 0.1;
                if (platform.protection <= 0) {
                    platform.protection = 0;
                    platform.vulnerable = true;
                }
                
                // Bubble visual effect
                platform.bubbleSize = 1 + Math.sin(now * 0.002) * 0.05;
            }

            // Handle balance platforms (Level 7 - adult wellness)
            if (platform.type === 'balance' && platform.activated) {
                // Apply energy drain/restore effects to player
                if (player.onPlatform === platform) {
                    if (!player.energy) player.energy = 100;
                    
                    if (platform.drains === 'energy') {
                        player.energy = Math.max(0, player.energy - 0.5);
                    } else if (platform.restores === 'energy') {
                        player.energy = Math.min(100, player.energy + 1);
                    }
                    
                    // Affect player movement based on energy
                    player.speedMultiplier = 0.5 + (player.energy / 200);
                }
            }

            // Handle reflex test platforms (Level 6 - neurologic)
            if (platform.type === 'reflex_test' && platform.activated) {
                // Player must jump within response time when landing
                if (player.onPlatform === platform) {
                    if (!platform.testStartTime) {
                        platform.testStartTime = now;
                        platform.testing = true;
                    }
                    
                    if (platform.testing && now - platform.testStartTime > platform.responseTime) {
                        if (platform.disappearsOnFail && !player.hasJumped) {
                            platform.activated = false;
                            setTimeout(() => {
                                platform.activated = true;
                                platform.testStartTime = null;
                                platform.testing = false;
                            }, 2000);
                        }
                    }
                }
            }

            // Handle organ system platforms (Level 6 - multi-organ failure)
            if (platform.type === 'organ_system' && platform.activated) {
                if (!platform.failureStartTime) {
                    platform.failureStartTime = now;
                }
                
                const elapsed = now - platform.failureStartTime;
                if (elapsed > platform.failureTime) {
                    platform.failing = true;
                    platform.opacity = Math.max(0, 1 - (elapsed - platform.failureTime) / 1000);
                    platform.activated = platform.opacity > 0.1;
                }
            }

            // Handle pH-sensitive platforms (Level 6 - metabolic)
            if (platform.type === 'pH_sensitive' && platform.activated) {
                const pHDiff = Math.abs(platform.currentPH - platform.idealPH);
                if (pHDiff > 0.1) {
                    platform.damaging = true;
                    platform.damageAmount = platform.damageRate * pHDiff * 10;
                } else {
                    platform.damaging = false;
                }
                
                // Visual indication of pH
                if (platform.currentPH < 7.35) {
                    platform.color = '#FF6B6B'; // Acidic - red
                } else if (platform.currentPH > 7.45) {
                    platform.color = '#6B6BFF'; // Alkalotic - blue  
                } else {
                    platform.color = '#6BFF6B'; // Normal - green
                }
            }
        });
    }
    // Reset all dynamic platform states that can accumulate during gameplay
    resetPlatformStates(platforms) {
        platforms.forEach(platform => {
            // Reset alarm platform states
            if (platform.type === 'alarm') {
                platform.alarmTriggered = false;
                platform.alarmTime = null;
                platform.enemiesSpawned = false;
            }
            
            // Reset malfunctioning platform states
            if (platform.type === 'malfunctioning') {
                platform.isActiveMalfunction = false;
                platform.lastMalfunctionTime = 0;
            }
            
            // Reset any orbiting platform positions
            if (platform.type === 'orbiting' && platform.orbit) {
                platform.orbit.currentAngle = platform.orbit.startAngle || 0;
            }
        });
    }

    // Reset all dynamic hazard states that can accumulate during gameplay
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
                            module = await import('./levels/level_5.js');
                            break;
                    case 6:
                            module = await import('./levels/level_6.js');
                            break;
                    case 7:
                            module = await import('./levels/level_7.js');
                            break;
                    // For now, return a placeholder for other levels
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
                    return this.currentLevel;

                default:
                    throw new Error('Invalid level ID: ' + levelId);
            }

            if (module && module.default) {
                this.currentLevel = JSON.parse(JSON.stringify(module.default));
                // Reset all enemy wave triggers to ensure fresh level state
                this.resetEnemyWaveStates();
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

    initializeLevelZones(level) {
        // Level 5: Comfort Zones
        if (level.comfortZones) {
            level.comfortZones.forEach(zone => {
                // Initialize comfort zone states
                if (zone.type === 'temperature') {
                    zone.playerTemp = 98.6; // Normal body temp
                }
                if (zone.type === 'hygiene') {
                    zone.cleanlinessLevel = 0;
                    zone.hygieneSequence = [];
                }
                if (zone.type === 'nutrition') {
                    zone.hungerLevel = 100;
                    zone.lastFeedTime = 0;
                }
                if (zone.type === 'sleep') {
                    zone.currentNoise = zone.noiseLevel;
                }
            });
        }

        // Level 6: Vital Zones
        if (level.vitalZones) {
            level.vitalZones.forEach(zone => {
                // Initialize vital sign states
                if (zone.type === 'cardiac') {
                    zone.currentHR = zone.heartRate;
                    zone.rhythmStable = true;
                }
                if (zone.type === 'respiratory') {
                    zone.currentResp = zone.respRate;
                    zone.currentO2 = zone.o2Sat;
                }
                if (zone.type === 'renal') {
                    zone.currentBalance = zone.fluidBalance;
                    zone.currentOutput = zone.urineOutput;
                }
                if (zone.type === 'metabolic') {
                    zone.currentSugar = zone.bloodSugar;
                    zone.currentPH = zone.pH;
                }
            });
        }

        // Level 7: Lifecycle Zones
        if (level.lifecycleZones) {
            level.lifecycleZones.forEach(zone => {
                // Initialize lifecycle states
                zone.milestonesCompleted = [];
                zone.preventionMeasures = [];
                zone.healthStatus = 100;
            });
        }
    }

    applyZoneEffects(player, worldX, canvas) {
        const level = this.currentLevel;
        if (!level) return;
        
        const playerWorldX = player.x - worldX;
        
        // Level 5: Comfort Zones
        if (level.comfortZones) {
            for (const zone of level.comfortZones) {
                if (playerWorldX >= zone.startX && playerWorldX <= zone.endX) {
                    switch(zone.type) {
                        case 'temperature':
                            // Player temp drifts from ideal
                            const tempDiff = zone.idealTemp - zone.currentTemp;
                            zone.currentTemp += tempDiff * 0.01;
                            
                            // Damage if too hot or cold
                            if (Math.abs(zone.currentTemp - zone.idealTemp) > 10) {
                                player.comfortDamage = true;
                            }
                            break;
                            
                        case 'hygiene':
                            // Cleanliness decreases over time
                            zone.cleanlinessLevel = Math.max(0, zone.cleanlinessLevel - 0.5);
                            if (zone.cleanlinessLevel < 30) {
                                player.speedMultiplier *= 0.8; // Slow when dirty
                            }
                            break;
                            
                        case 'nutrition':
                            // Hunger increases
                            zone.hungerLevel = Math.max(0, zone.hungerLevel - 0.3);
                            if (zone.hungerLevel < 30) {
                                player.jumpMultiplier *= 0.8; // Weak when hungry
                            }
                            break;
                            
                        case 'sleep':
                            // Fatigue if too noisy
                            if (zone.currentNoise > zone.maxNoise) {
                                player.fatigue = (player.fatigue || 0) + 0.5;
                                if (player.fatigue > 50) {
                                    player.speedMultiplier *= 0.7;
                                }
                            }
                            break;
                    }
                }
            }
        }
        
        // Level 6: Vital Zones
        if (level.vitalZones) {
            for (const zone of level.vitalZones) {
                if (playerWorldX >= zone.startX && playerWorldX <= zone.endX) {
                    switch(zone.type) {
                        case 'cardiac':
                            // Heart rate changes
                            if (zone.arrhythmiaRisk && Math.random() < 0.01) {
                                zone.rhythmStable = false;
                                player.irregularMovement = true;
                            }
                            break;
                            
                        case 'respiratory':
                            // O2 decreases without proper breathing
                            zone.currentO2 = Math.max(80, zone.currentO2 - 0.2);
                            if (zone.currentO2 < 90) {
                                player.speedMultiplier *= (zone.currentO2 / 100);
                            }
                            break;
                            
                        case 'renal':
                            // Fluid balance affects jump
                            if (Math.abs(zone.currentBalance) > 500) {
                                player.jumpMultiplier *= 0.8;
                            }
                            break;
                            
                        case 'neurologic':
                            // ICP affects vision
                            if (zone.icpLevel > 20) {
                                player.visionBlur = (zone.icpLevel - 20) / 10;
                            }
                            break;
                            
                        case 'metabolic':
                            // pH imbalance causes damage
                            if (zone.currentPH < 7.35 || zone.currentPH > 7.45) {
                                player.metabolicDamage = true;
                            }
                            break;
                            
                        case 'shock':
                            // Poor perfusion affects everything
                            if (zone.perfusion < 60) {
                                const perfusionRatio = zone.perfusion / 100;
                                player.speedMultiplier *= perfusionRatio;
                                player.jumpMultiplier *= perfusionRatio;
                            }
                            break;
                    }
                }
            }
        }
        
        // Level 7: Lifecycle Zones
        if (level.lifecycleZones) {
            for (const zone of level.lifecycleZones) {
                if (playerWorldX >= zone.startX && playerWorldX <= zone.endX) {
                    // Apply stage-specific mechanics
                    switch(zone.stage) {
                        case 'infant':
                            if (zone.mechanics === 'crawling') {
                                player.maxHeight = 60; // Can't stand fully
                                player.crawling = true;
                            }
                            break;
                            
                        case 'toddler':
                            if (zone.mechanics === 'exploration') {
                                player.curiosity = true; // Drawn to hazards
                                player.speedMultiplier *= 1.2; // Fast but unsteady
                            }
                            break;
                            
                        case 'adolescent':
                            if (zone.mechanics === 'risk_taking') {
                                player.invincibilityFrames = 30; // Feel invincible
                                player.riskTaking = true;
                            }
                            break;
                            
                        case 'older_adult':
                            if (zone.mechanics === 'adaptation') {
                                player.speedMultiplier *= 0.7; // Slower movement
                                player.fallRisk = true; // Higher fall damage
                            }
                            break;
                    }
                }
            }
        }
    }


    spawnLevelContent(worldX, canvas, platforms, npcs, chests, hazards, enemyManager) {
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
                let yPos = this.parsePosition(npc.y, canvas);

                // Handle relative positioning to platforms
                if (typeof npc.y === 'string' && npc.y.includes('-top')) {
                    const platId = npc.y.replace('-top', '');
                    const platform = platforms.find(p => p.id === platId);
                    if (platform) {
                        // Position NPC on top of platform (like player positioning)
                        const npcHeight = npc.height || 60;
                        yPos = platform.y - npcHeight;
                    }
                }

                npcs.push({
                    ...npc,
                    worldX: npc.x,
                    y: yPos,
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

            // Create consistent chest ID
            const chestId = `chest_${item.x}`;

            // Check if already spawned using proper ID
            if (chests.some(c => c.id === chestId)) return;

            // Check if in visible range
            if (item.x > visibleLeft && item.x < visibleRight) {
                let yPos = this.parsePosition(item.y, canvas);

                // Handle relative positioning to platforms
                if (typeof item.y === 'string' && item.y.includes('-top')) {
                    const platId = item.y.replace('-top', '');
                    const platform = platforms.find(p => p.id === platId);
                    if (platform) {
                        // Position chest on top of platform
                        yPos = platform.y;
                    }
                }

                chests.push({
                    worldX: item.x,
                    y: yPos,
                    width: 50,
                    height: 25,
                    id: chestId,
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
                    let spawnX = enemyDef.x;
                    if (Math.abs(spawnX - playerWorldX) < MIN_SPAWN_DISTANCE) {
                        spawnX = playerWorldX + Math.sign(spawnX - playerWorldX || 1) * MIN_SPAWN_DISTANCE;
                    }
                    const newEnemy = new Enemy(
                        spawnX,
                        this.parsePosition(enemyDef.y, canvas)
                    );
                    newEnemy.hp = enemyDef.hp || 1;
                    enemyManager.enemies.push(newEnemy);
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