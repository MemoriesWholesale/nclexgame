import { Player } from './player.js';
import LevelManager from './levelManager.js';
import { Quiz } from './quiz.js';
import { Enemy, EnemyManager } from './enemy.js';
import { Boss } from './systems/Boss.js';
import { ItemSpawner } from './systems/ItemSpawner.js';
import { PlayerPersistence } from './systems/PlayerPersistence.js';
import {
    MIN_SPAWN_DISTANCE,
    LEVEL_DATA,
    SPRITE_ANIMATIONS,
    BOSS_ANIMATIONS,
    BOSS_DATA,
    ARMOR_DATA,
    WEAPON_NAMES,
    WEAPON_COLORS,
    FIRE_COOLDOWNS
} from './constants.js';

        const levelManager = new LevelManager();
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        const playerSprite = new Image();
        playerSprite.src = 'assets/nurse_sprites.png';
        let spriteLoaded = false;
        playerSprite.onload = () => {
            spriteLoaded = true;
        };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let gameState = 'menu';
        let selectedLevel = -1;

        // Create player instance
        const player = new Player(canvas);
        
        // Create player persistence system
        const playerPersistence = new PlayerPersistence();

        // Create quiz instance
        const quiz = new Quiz();

        // Create enemy manager and item spawner
        const enemyManager = new EnemyManager();
        let itemSpawner;
        try {
            itemSpawner = new ItemSpawner();
        } catch (error) {
            console.error('Error creating ItemSpawner:', error);
            itemSpawner = {
                initializeLevel: () => {},
                checkFixedSpawnPoints: () => [],
                updateItem: () => true,
                handleEnemyDeath: () => null,
                reset: () => {}
            };
        }

        let worldX = 0;
        let groundY = 0;
        let testLevelEndX = 10800;

        let gate = null;
        let boss = null;
        let screenLocked = false;
        let armorPickup = null;

        const projectiles = [];
        const platforms = [];
        const npcs = [];
        const pickups = [];
        const pits = [];
        const chests = [];
        const powerups = [];
        const medications = [];
        const interactionZones = [];
        const hiddenPlatforms = [];
        let medicationSpawnTimer = 0;

        const hazards = [];

        // Performance tuning constants
        const SPAWN_CHECK_DISTANCE = 200; // pixels between spawn checks
        let lastSpawnX = null;
        const DEBUG_DRAW_AXES = true;

        let fireTimer = 0;

        const keys = {};
        let canFire = true;

        document.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            if (e.key === 'Enter' && gameState === 'playing') gameState = 'paused';
            else if (e.key === 'Enter' && gameState === 'paused') gameState = 'playing';

            if ((e.key === 'q' || e.key === 'Q') && gameState === 'playing' && !player.dead) {
                player.switchArmor();
            }

            if ((e.key === 'e' || e.key === 'E') && gameState === 'playing' && !player.dead) {
                handleInteraction();
            }

            if (e.key === ' ' && canFire) {
                if (gameState === 'playing' && !player.dead) {
                    fireWeapon();
                    player.startShooting();
                }
                canFire = false;
            }
        });

        document.addEventListener('keyup', (e) => {
            keys[e.key] = false;
            if (e.key === ' ') {
                canFire = true;
            }
        });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (gameState === 'menu') {
                const buttonsPerRow = 4;
                const buttonWidth = 150;
                const buttonHeight = 80;
                const startX = (canvas.width - (buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * 20)) / 2;
                const startY = canvas.height * 0.3;

                for (let i = 0; i < LEVEL_DATA.length; i++) {
                    const row = Math.floor(i / buttonsPerRow);
                    const col = i % buttonsPerRow;
                    const btnX = startX + col * (buttonWidth + 20);
                    const btnY = startY + row * (buttonHeight + 20);

                    if (mouseX >= btnX && mouseX <= btnX + buttonWidth && mouseY >= btnY && mouseY <= btnY + buttonHeight) {
                        selectedLevel = i;
                        // Check if persistence system has saved data (indicates level change)
                        const hasSavedState = playerPersistence.getState().lives !== 3 || 
                                            playerPersistence.getState().currentWeapon !== 1 ||
                                            playerPersistence.getState().armors.length > 1;
                        startGame(hasSavedState);
                        break;
                    }
                }
            } else if (gameState === 'paused') {
                const panelWidth = Math.min(400, canvas.width * 0.8);
                const panelHeight = 200;
                const panelX = (canvas.width - panelWidth) / 2;
                const panelY = (canvas.height - panelHeight) / 2;
                const buttonWidth = panelWidth - 60;
                const buttonHeight = 50;
                const resumeX = panelX + 30;
                const resumeY = panelY + 60;
                const selectX = resumeX;
                const selectY = resumeY + buttonHeight + 20;

                if (mouseX >= resumeX && mouseX <= resumeX + buttonWidth && mouseY >= resumeY && mouseY <= resumeY + buttonHeight) gameState = 'playing';
                if (mouseX >= selectX && mouseX <= selectX + buttonWidth && mouseY >= selectY && mouseY <= selectY + buttonHeight) {
                    // Save current player state before returning to level select
                    playerPersistence.saveState(player, player.currentWeapon);
                    
                    // Clear all level content when returning to level select menu
                    levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);
                    enemyManager.clear();
                    itemSpawner.reset();
                    boss = null;
                    armorPickup = null;
                    gameState = 'menu';
                    selectedLevel = -1;
                }
            } else if (gameState === 'quiz' && quiz.getCurrentQuestion()) {
                const currentQuestion = quiz.getCurrentQuestion();
                if (currentQuestion.answered) {
                    if (currentQuestion.isCorrect) {
                        if (currentQuestion.interactionId) {
                            const activationIds = currentQuestion.interactionId.split(',');
                            activationIds.forEach(id => {
                                const targetPlatform = platforms.find(p => p.id === id);
                                if (targetPlatform) {
                                    targetPlatform.activated = true;
                                }
                            });
                        }

                        // Handle chest opening
                        const targetChest = chests.find(c => c.id === currentQuestion.interactionId);
                        if (targetChest) {
                            targetChest.state = 'open';

                            // Create appropriate reward based on chest contents
                            if (targetChest.contains === 'medication') {
                                // Spawn medication
                                medications.push({
                                    worldX: targetChest.worldX + targetChest.width / 2 - 15,
                                    y: targetChest.y - 30,
                                    type: targetChest.subtype,
                                    width: 30,
                                    height: 30
                                });
                            } else if (targetChest.contains === 'extra_life') {
                                // Spawn life powerup
                                powerups.push({
                                    worldX: targetChest.worldX + targetChest.width / 2 - 10,
                                    y: targetChest.y - 30,
                                    vy: -5,
                                    type: 'life'
                                });
                            } else if (targetChest.contains === 'weapon_upgrade') {
                                // Handle weapon upgrade
                                powerups.push({
                                    worldX: targetChest.worldX + targetChest.width / 2 - 10,
                                    y: targetChest.y - 30,
                                    vy: -5,
                                    type: 'weapon',
                                    weaponId: targetChest.weaponId
                                });
                            }
                        }

                        // Handle NPC medication rewards
                        const interactingNpc = npcs.find(n => n.interactionId === currentQuestion.originalInteractionId);
                        if (interactingNpc && interactingNpc.givesItem) {
                            // Spawn medication from NPC
                            medications.push({
                                worldX: interactingNpc.worldX + interactingNpc.width / 2 - 15,
                                y: interactingNpc.y - 30,
                                type: interactingNpc.givesItem,
                                width: 30,
                                height: 30
                            });
                            interactingNpc.isLeaving = true;
                        }

                        // Handle NPC effect prevention rewards
                        if (interactingNpc && interactingNpc.preventsEffect) {
                            player.preventedEffects.add(interactingNpc.preventsEffect);
                            interactingNpc.isLeaving = true;
                        }

                    } else {
                        const interactingNpc = npcs.find(n => n.interactionId === currentQuestion.originalInteractionId);
                        if(interactingNpc) interactingNpc.isLeaving = true;
                    }

                    quiz.clearCurrentQuestion();
                    gameState = 'playing';
                } else {
                    const clickedAnswer = quiz.checkAnswerClick(mouseX, mouseY);
                    if (clickedAnswer) {
                        quiz.selectAnswer(clickedAnswer);
                    }
                }
            }
        });

        async function startGame(isLevelChange = false) {
            // **FIX**: Clear all level content arrays right at the start.
            levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);
            itemSpawner.reset();

            gameState = 'playing';
            const groundY = canvas.height - 100;
            
            // Use persistence for level changes, fresh start otherwise
            if (isLevelChange) {
                // Level change - restore from persistence system
                player.reset(groundY, false); // Reset to clean state first
                playerPersistence.restoreState(player); // Then restore persistent data
            } else {
                // Fresh start - reset persistence and player
                playerPersistence.resetToInitial();
                player.reset(groundY, false); // Don't preserve state
            }
            
            worldX = 0;
            enemyManager.clear();
            screenLocked = false;
            boss = null;
            armorPickup = null;
            quiz.clearCurrentQuestion();
            canFire = true;

            // Reset all timers to ensure fresh level start
            medicationSpawnTimer = 0;
            fireTimer = 0;

            if (selectedLevel !== -1) {
                try {
                    await levelManager.loadLevel(selectedLevel);
                    const levelDef = levelManager.getLevelData();

                    if (!levelDef) {
                        throw new Error("Failed to load level definition");
                    }

                    testLevelEndX = levelDef.worldLength || 10800;
                    
                    // Initialize item spawner with level data
                    try {
                        itemSpawner.initializeLevel(levelDef);
                    } catch (error) {
                        console.error('Error initializing ItemSpawner with level data:', error);
                    }

                    // Set gate with correct level end position
                    gate = {
                        worldX: testLevelEndX,
                        width: 60,
                        height: 150,
                        hp: 5,
                        maxHp: 5
                    };
                    player.x = levelDef.playerStart.x || 100;
                    const startY = levelManager.parsePosition(levelDef.playerStart.y, canvas);
                    player.y = startY - player.height;

                    gate = {
                        worldX: testLevelEndX,
                        width: 60,
                        height: 150,
                        hp: 5,
                        maxHp: 5
                    };

                    if (levelDef.hazards) {
                        levelDef.hazards.forEach(hazard => {
                            if (hazard.type === 'pit') {
                                pits.push({
                                    worldX: hazard.x,
                                    width: hazard.width
                                });
                            }
                        });
                    }

                    // Load special zones for level 1 after level data is available
                    if (selectedLevel === 1) {
                        if (levelDef.interactionZones) {
                            interactionZones.push(...levelDef.interactionZones);
                        }
                        if (levelDef.hiddenPlatforms) {
                            hiddenPlatforms.push(...levelDef.hiddenPlatforms);
                        }
                    }

                    const response = await fetch(levelDef.questionFile || LEVEL_DATA[selectedLevel].file);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    await quiz.loadQuestions(levelDef.questionFile || LEVEL_DATA[selectedLevel].file);

                    // **FIX**: Initial spawn of level content to prevent delay
                    levelManager.spawnLevelContent(worldX, canvas, platforms, npcs, chests, hazards, enemyManager);
                    lastSpawnX = worldX;

                } catch (error) {
                    console.error("Could not load level:", error);
                    alert("Error: Could not load level data. Please ensure all files are present.");
                    // Clear level content on error
                    levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);
                    enemyManager.clear();
                    boss = null;
                    armorPickup = null;
                    gameState = 'menu';
                    return;
                }
            } else {
                // Clear level content when no level selected
                levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);
                enemyManager.clear();
                boss = null;
                armorPickup = null;
                gameState = 'menu';
                return;
            }
        }

        function askQuestion(interactionId, originalId) {
            // Pass both identifiers so the quiz system knows which object triggered the question
            quiz.askQuestion(interactionId, originalId);
            gameState = 'quiz';
        }

        function handleInteraction() {
            for (const npc of npcs) {
                const screenX = npc.worldX + worldX;
                if(player.x < screenX + npc.width && player.x + player.width > screenX && player.y < npc.y + npc.height && player.y + player.height > npc.y && !npc.isLeaving) {
                     askQuestion(npc.activates, npc.interactionId);
                }
            }
            for (const chest of chests) {
                if (chest.state === 'closed') {
                    const screenX = chest.worldX + worldX;
                    if(player.x < screenX + chest.width && player.x + player.width > screenX && player.y < chest.y && player.y + player.height > chest.y - chest.height) {
                         askQuestion(chest.id, chest.id);
                    }
                }
            }
        }


        function fireWeapon() {
            if (fireTimer > 0) return;
            if (player.currentWeapon === 3 || player.currentWeapon === 7) {
                for (const proj of projectiles) {
                    if (proj.type === player.currentWeapon) return;
                }
            }
            fireTimer = FIRE_COOLDOWNS[player.currentWeapon - 1];

            const weaponPos = player.getWeaponSpawnPos();
            const weaponYOffset = player.crouching ? 20 : 0;

            switch(player.currentWeapon) {
                case 2: projectiles.push({ x: weaponPos.x, y: weaponPos.y - 3 + weaponYOffset, vx: player.facing * 15, vy: 0, width: 30, height: 6, type: 2 }); break;
                case 3: projectiles.push({ centerX: weaponPos.centerX, centerY: weaponPos.centerY + weaponYOffset, radius: 120, angle: 0, rotSpeed: 0.2, type: 3 }); break;
                case 4: projectiles.push({ x: weaponPos.x, y: weaponPos.y - 5 + weaponYOffset, vx: player.facing * 6, vy: -10, width: 30, height: 10, wavePhase: 0, type: 4 }); break;
                case 5: projectiles.push({ x: player.x + (player.facing > 0 ? player.width : -40), y: weaponPos.y - 12 + weaponYOffset, vx: player.facing * 9, vy: 0, width: 40, height: 4, gap: 4, type: 5 }); break;
                case 6: projectiles.push({ x: weaponPos.x, y: weaponPos.y - 15 + weaponYOffset, vx: player.facing * 5, vy: 0, size: 30, angle: 0, rotSpeed: 0.15 * player.facing, type: 6 }); break;
                case 7: projectiles.push({ centerX: player.x + player.width / 2, centerY: player.y + player.height / 2 + weaponYOffset, radius: 150, angle: 0, rotSpeed: 0.12, direction: 1, type: 7 }); break;
                case 8: projectiles.push({ x: player.x + (player.facing > 0 ? player.width : -30), y: player.y + player.height / 2 - 7 + weaponYOffset, vx: player.facing * 8, vy: -18, width: 30, height: 15, lastDropX: player.x + (player.facing > 0 ? player.width : -30), dropsLeft: 5, type: 8 }); break;
                case 1: projectiles.push({ x: player.x + (player.facing > 0 ? player.width : -20), y: player.y + player.height / 2 - 5 + weaponYOffset, vx: player.facing * 8, vy: -8, width: 20, height: 10, type: 1 }); break;
            }
        }

        // [NEW] Central function to handle player death and respawn
        function handlePlayerDeath() {
            if (player.isRespawning) return; // Prevent this from running multiple times

            player.isRespawning = true;
            setTimeout(() => {
                if (player.lives > 0) {
                    player.respawn(groundY);
                    worldX = 0;
                    // Reset any dynamic level elements if needed
                    enemyManager.clear();
                    hazards.forEach(h => {
                        if (h.deactivatedByNPC) h.activated = true; // Reactivate hazards
                    });
                } else {
                    // Game over - reset persistent state and return to menu
                    playerPersistence.resetToInitial();
                    
                    // **FIX**: Reset respawn flag even on game over to prevent stuck state
                    player.isRespawning = false;
                    player.dead = false; // Reset dead state for clean menu transition
                    
                    // Clear level content on game over
                    levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);
                    enemyManager.clear();
                    boss = null;
                    armorPickup = null;
                    gameState = 'menu'; // Game over
                    selectedLevel = -1; // Reset selected level
                }
            }, 2000); // 2-second delay before respawn/game over
        }

        // Psychological zone effects (Level 4)
        function applyPsychZoneEffects(playerWorldX) {
            if (!levelManager.currentLevel || !levelManager.currentLevel.psychZones) return;

            // Reset effects first
            player.invertedControls = false;
            player.hasTwin = false;
            player.shadowTwin.active = false;
            player.gravityFlipped = false;
            player.tunnelVision = 0;
            player.speedMultiplier = 1;
            player.depressionFog = 0;

            // Apply active zone effects
            for (const zone of levelManager.currentLevel.psychZones) {
                if (playerWorldX >= zone.startX && playerWorldX <= zone.endX) {
                    if (player.preventedEffects && player.preventedEffects.has(zone.effect)) {
                        continue;
                    }
                    switch(zone.effect) {
                        case 'tunnel_vision':
                            player.tunnelVision = zone.intensity;
                            break;
                        case 'inverted_controls':
                            player.invertedControls = true;
                            break;
                        case 'mirror_twin':
                            player.hasTwin = true;
                            player.twinX = canvas.width - player.x; // Mirror position
                            
                            // Initialize shadow twin if not already active
                            if (!player.shadowTwin.active) {
                                player.shadowTwin.active = true;
                                player.shadowTwin.x = player.x + 200; // Start offset from player
                                player.shadowTwin.y = player.y;
                                player.shadowTwin.vx = 0;
                                player.shadowTwin.vy = 0;
                                player.shadowTwin.grounded = false;
                                player.shadowTwin.facing = -player.facing;
                                player.shadowTwin.actionTimer = 0;
                                player.shadowTwin.currentAction = 'idle';
                                player.shadowTwin.actionDuration = Math.random() * 2000 + 1000; // 1-3 seconds
                            }
                            break;
                        case 'upside_down':
                            player.gravityFlipped = true;
                            break;
                        case 'speed_up':
                            player.speedMultiplier = zone.intensity;
                            break;
                        case 'darkness_slowness':
                            player.speedMultiplier = 0.5;
                            player.depressionFog = zone.intensity;
                            break;
                    }
                    break; // Only apply one zone at a time
                }
            }
        }

        function updateShadowTwin() {
            const twin = player.shadowTwin;
            const dt = 16; // Approximate frame time
            
            // Update action timer
            twin.actionTimer += dt;
            
            // Check if current action is complete
            if (twin.actionTimer >= twin.actionDuration) {
                // Choose new pseudo-random action
                const actions = ['idle', 'walk_left', 'walk_right', 'jump', 'random_jump'];
                const weights = [20, 25, 25, 15, 15]; // Weighted probabilities
                
                let totalWeight = weights.reduce((sum, w) => sum + w, 0);
                let random = Math.random() * totalWeight;
                let actionIndex = 0;
                
                for (let i = 0; i < weights.length; i++) {
                    random -= weights[i];
                    if (random <= 0) {
                        actionIndex = i;
                        break;
                    }
                }
                
                twin.currentAction = actions[actionIndex];
                twin.actionTimer = 0;
                twin.actionDuration = Math.random() * 2000 + 1000; // 1-3 seconds
            }
            
            // Apply physics - gravity
            twin.vy += 0.8; // Same gravity as player
            
            // Execute current action
            switch (twin.currentAction) {
                case 'walk_left':
                    twin.vx = -2;
                    twin.facing = -1;
                    break;
                case 'walk_right':
                    twin.vx = 2;
                    twin.facing = 1;
                    break;
                case 'jump':
                    if (twin.grounded) {
                        twin.vy = -15; // Same jump strength as player
                    }
                    twin.vx *= 0.9; // Slight deceleration
                    break;
                case 'random_jump':
                    if (twin.grounded) {
                        twin.vy = -12;
                        twin.vx = (Math.random() - 0.5) * 6; // Random horizontal velocity
                    }
                    break;
                case 'idle':
                default:
                    twin.vx *= 0.8; // Deceleration
                    break;
            }
            
            // Update position
            twin.x += twin.vx;
            twin.y += twin.vy;
            
            // Platform collision detection (simplified)
            twin.grounded = false;
            for (const platform of platforms) {
                const screenX = platform.worldX + worldX;
                if (twin.x < screenX + platform.width && 
                    twin.x + 50 > screenX && // Assume twin is same size as player
                    twin.y + 92 > platform.y &&
                    twin.y < platform.y + platform.height &&
                    twin.vy >= 0) {
                    twin.y = platform.y - 92; // Place on top of platform
                    twin.vy = 0;
                    twin.grounded = true;
                    break;
                }
            }
            
            // Ground collision
            if (twin.y + 92 > groundY) {
                twin.y = groundY - 92;
                twin.vy = 0;
                twin.grounded = true;
            }
            
            // Boundary constraints - keep twin in dissociation zone roughly
            const zoneStart = 7000 + worldX;
            const zoneEnd = 8000 + worldX;
            if (twin.x < zoneStart - 100) {
                twin.x = zoneStart - 100;
                twin.vx = Math.abs(twin.vx); // Bounce right
            }
            if (twin.x > zoneEnd + 100) {
                twin.x = zoneEnd + 100;
                twin.vx = -Math.abs(twin.vx); // Bounce left
            }
            
            // Avoid pits
            for (const pit of pits) {
                const pitScreenX = pit.worldX + worldX;
                if (twin.x > pitScreenX - 50 && twin.x < pitScreenX + pit.width + 50 && twin.grounded) {
                    // Jump to avoid pit if approaching
                    if (Math.abs(twin.vx) > 0.5) {
                        twin.vy = -12;
                        twin.grounded = false;
                    }
                }
            }
        }

        function update() {
            if (gameState !== 'playing') return;

            groundY = canvas.height - 100;

            const playerWorldX = player.x - worldX;

            if (levelManager.currentLevel) {
                if (lastSpawnX === null || Math.abs(worldX - lastSpawnX) > SPAWN_CHECK_DISTANCE) {
                    levelManager.spawnLevelContent(worldX, canvas, platforms, npcs, chests, hazards, enemyManager);
                    lastSpawnX = worldX;
                }

                if (selectedLevel === 4 && levelManager.currentLevel.psychZones) {
                    applyPsychZoneEffects(playerWorldX);
                }
            }

            // Update platform states for new mechanics
        if (levelManager.currentLevel) {
            levelManager.updatePlatformStates(platforms, worldX, player, canvas);
            levelManager.applyZoneEffects(player, worldX, canvas);
        }

        // Handle special platform interactions
        for (const platform of platforms) {
            const screenX = platform.worldX + worldX;
            
            // Check if player is on this platform
            if (player.onPlatform === platform) {
                // Handle different platform types
                switch(platform.type) {
                    case 'temperature':
                        // Apply temperature effect to player
                        if (!player.temperature) player.temperature = 98.6;
                        player.temperature += platform.effect * 0.1;
                        
                        // Damage if too extreme
                        if (player.temperature < 95 || player.temperature > 104) {
                            if (!player.invincible) {
                                player.lives--;
                                player.invincible = true;
                                setTimeout(() => { player.invincible = false; }, 2000);
                            }
                        }
                        break;
                        
                    case 'hygiene_tool':
                        // Track hygiene sequence
                        if (!player.hygieneSequence) player.hygieneSequence = [];
                        if (!player.hygieneSequence.includes(platform.tool)) {
                            player.hygieneSequence.push(platform.tool);
                            
                            // Check if sequence is correct
                            const correctSequence = ['soap', 'water', 'towel', 'lotion'];
                            if (player.hygieneSequence.length === correctSequence.length) {
                                const isCorrect = player.hygieneSequence.every((tool, i) => tool === correctSequence[i]);
                                if (isCorrect) {
                                    player.cleanlinessBoost = true;
                                    player.speedMultiplier *= 1.2;
                                }
                            }
                        }
                        break;
                        
                    case 'pushable':
                        // Food cart mechanics
                        if (keys['e'] || keys['E']) {
                            platform.worldX += player.facing * 2;
                            
                            // Check if cart reached feeding zone
                            for (const zone of platforms) {
                                if (zone.type === 'feeding_zone' && zone.requiresFood) {
                                    const dist = Math.abs(platform.worldX - zone.worldX);
                                    if (dist < 50) {
                                        zone.fed = true;
                                        zone.activated = true;
                                    }
                                }
                            }
                        }
                        break;
                        
                    case 'pulsing':
                        // Pain platform damage
                        if (platform.isPainful && !player.invincible) {
                            player.lives--;
                            player.invincible = true;
                            setTimeout(() => { player.invincible = false; }, 1000);
                        }
                        break;
                        
                    case 'pH_sensitive':
                        // pH damage
                        if (platform.damaging && !player.invincible) {
                            player.lives -= platform.damageAmount;
                            player.invincible = true;
                            setTimeout(() => { player.invincible = false; }, 1000);
                        }
                        break;
                        
                    case 'glucose_powered':
                        // Depletes glucose
                        if (platform.depletes) {
                            platform.requiredGlucose -= 0.5;
                            if (platform.requiredGlucose <= 0) {
                                platform.activated = false;
                            }
                        }
                        break;
                        
                    case 'reflex_test':
                        // Mark if player jumped
                        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
                            player.hasJumped = true;
                        }
                        break;
                        
                    case 'milestone':
                        // Apply milestone effects
                        if (platform.skill === 'crawling' && platform.lowCeiling) {
                            player.forceCrouch = true;
                        }
                        if (platform.skill === 'rolling' && platform.rotates) {
                            player.vx += Math.sin(platform.rotation) * 0.5;
                        }
                        break;
                        
                    case 'bubble':
                        // Prenatal protection
                        player.bubbleProtection = platform.protection;
                        break;
                        
                    case 'social':
                        // Peer pressure effects
                        if (platform.influence === 'negative' && platform.pulls) {
                            // Pull player toward bad decisions
                            const pullDirection = Math.sign(platform.worldX - (player.x - worldX));
                            player.vx += pullDirection * 0.3;
                        }
                        break;
                }
            }
        }

        if (levelManager.currentLevel && levelManager.currentLevel.comfortItems) {
            for (let i = levelManager.currentLevel.comfortItems.length - 1; i >= 0; i--) {
                const item = levelManager.currentLevel.comfortItems[i];
                const screenX = item.x + worldX;
                
                if (player.x < screenX + 30 && player.x + player.width > screenX &&
                    player.y < item.y + 30 && player.y + player.height > item.y) {
                    
                    // Apply comfort item effect
                    switch(item.effect) {
                        case 'warmth':
                            if (player.temperature) player.temperature += item.value;
                            break;
                        case 'cleanliness':
                            player.cleanlinessLevel = (player.cleanlinessLevel || 0) + item.value;
                            break;
                        case 'nutrition':
                            player.hungerSatisfied = true;
                            break;
                        case 'pain_relief':
                            player.painImmunity = true;
                            setTimeout(() => { player.painImmunity = false; }, 5000);
                            break;
                    }
                    
                    levelManager.currentLevel.comfortItems.splice(i, 1);
                }
            }
        }

        // Handle vital pickups (Level 6)
        if (levelManager.currentLevel && levelManager.currentLevel.vitalPickups) {
            for (let i = levelManager.currentLevel.vitalPickups.length - 1; i >= 0; i--) {
                const pickup = levelManager.currentLevel.vitalPickups[i];
                const screenX = pickup.x + worldX;
                
                if (player.x < screenX + 30 && player.x + player.width > screenX &&
                    player.y < pickup.y + 30 && player.y + player.height > pickup.y) {
                    
                    // Apply vital sign effect
                    const playerWorldX = player.x - worldX;
                    
                    // Find current vital zone
                    if (levelManager.currentLevel.vitalZones) {
                        for (const zone of levelManager.currentLevel.vitalZones) {
                            if (playerWorldX >= zone.startX && playerWorldX <= zone.endX) {
                                switch(pickup.increases) {
                                    case 'o2Sat':
                                        zone.currentO2 = Math.min(100, zone.currentO2 + pickup.value);
                                        break;
                                    case 'fluidBalance':
                                        zone.currentBalance += pickup.value;
                                        break;
                                    case 'bloodSugar':
                                        zone.currentSugar += pickup.value;
                                        break;
                                    case 'perfusion':
                                        zone.perfusion = Math.min(100, zone.perfusion + pickup.value);
                                        break;
                                }
                                
                                if (pickup.balances === 'electrolytes') {
                                    zone.electrolytes = 'balanced';
                                }
                            }
                        }
                    }
                    
                    levelManager.currentLevel.vitalPickups.splice(i, 1);
                }
            }
        }

        // Handle health items (Level 7)
        if (levelManager.currentLevel && levelManager.currentLevel.healthItems) {
            for (let i = levelManager.currentLevel.healthItems.length - 1; i >= 0; i--) {
                const item = levelManager.currentLevel.healthItems[i];
                const screenX = item.x + worldX;
                
                if (player.x < screenX + 30 && player.x + player.width > screenX &&
                    player.y < item.y + 30 && player.y + player.height > item.y) {
                    
                    // Apply health promotion effect
                    switch(item.type) {
                        case 'prenatal_vitamin':
                            player.prenatalProtection = true;
                            break;
                        case 'vaccine_record':
                            player.immunityBoost = true;
                            player.invincibleFrames = 300;
                            break;
                        case 'safety_lock':
                            // Deactivate nearby hazards
                            hazards.forEach(h => {
                                if (h.childproofable && Math.abs(h.x - item.x) < 500) {
                                    h.activated = false;
                                }
                            });
                            break;
                        case 'walker':
                            player.mobilityAssist = true;
                            player.fallDamageReduction = 0.5;
                            break;
                    }
                    
                    levelManager.currentLevel.healthItems.splice(i, 1);
                }
            }
        }

            if (fireTimer > 0) fireTimer--;

            // Update player medications
            player.updateMedications();
            
            // Check for fixed spawn points and update existing items
            try {
                let currentPlayerWorldX = player.x - worldX;
                const newFixedItems = itemSpawner.checkFixedSpawnPoints(currentPlayerWorldX, worldX, canvas);
                
                // Add new fixed spawn items to pickups array
                for (const item of newFixedItems) {
                    pickups.push(item);
                }
                
                // Update all pickup items (physics, timers)
                for (let i = pickups.length - 1; i >= 0; i--) {
                    const item = pickups[i];
                    const shouldKeep = itemSpawner.updateItem(item, groundY, platforms);
                    if (!shouldKeep) {
                        pickups.splice(i, 1);
                    }
                }
            } catch (error) {
                console.error('Error in item spawning system:', error);
            }

            // Medication spawning disabled for level 1 - medications only from NPCs/chests
            // Level 1 medications are now only available through quiz interactions

            // Check medication pickups
            for (let i = medications.length - 1; i >= 0; i--) {
                const med = medications[i];
                const screenX = med.worldX + worldX;

                if (player.x < screenX + med.width && player.x + player.width > screenX &&
                    player.y < med.y + med.height && player.y + player.height > med.y) {

                    const result = player.applyMedication(med.type);
                    if (result.success) {
                        medications.splice(i, 1);
                    } else if (result.reason === 'tolerance') {
                        // Show reduced effect message
                        console.log('Tolerance built up! Wait before using again.');
                        medications.splice(i, 1);
                    } else if (result.reason === 'interaction') {
                        // Show interaction warning
                        console.log('Dangerous drug interaction!');
                        medications.splice(i, 1);
                    }
                }
            }

            // Check interaction zones (areas where multiple meds cause damage)
            if (!player.invincible) {
                for (const zone of interactionZones) {
                    const screenX = zone.worldX + worldX;
                    if (player.x < screenX + zone.width && player.x + player.width > screenX &&
                        player.y < zone.y + zone.height && player.y + zone.height > zone.y) {

                        if (player.activeMedications.length >= 2) {
                            player.lives--;
                            player.invincible = true; // Brief immunity
                            setTimeout(() => { player.invincible = false; }, 2000);
                        }
                    }
                }
            }

            // Apply bullet time effect
            if (player.bulletTime) {
                // Slow down enemies
                for (const enemy of enemyManager.enemies) {
                    enemy.speed = 0.5;
                }
            } else {
                for (const enemy of enemyManager.enemies) {
                    enemy.speed = 2; // Normal speed
                }
            }

            let onSpill = false;
            hazards.forEach(haz => {
                if (!haz.activated) return;

                const screenX = haz.worldX + worldX;

                switch(haz.type) {
                    case 'aerosol_geyser':
                        const now = Date.now();
                        const cycleTime = haz.timing.onTime + haz.timing.offTime;
                        const timeInCycle = (now - (haz.timing.offset || 0)) % cycleTime;
                        haz.isOn = timeInCycle < haz.timing.onTime;

                        if (haz.isOn && !player.dead && player.x < screenX + haz.width && player.x + player.width > screenX && player.y + player.height > haz.y - haz.height) {
                           if(!player.invincible) player.die();
                        }
                        break;

                    case 'spill_slick':
                        if (player.grounded && player.x + player.width > screenX && player.x < screenX + haz.width && player.y + player.height > haz.y) {
                            onSpill = true;
                        }
                        break;

                    case 'falling_object':
                        // Handle falling object timing and spawning
                        if (!haz.instances) haz.instances = [];

                        const fallNow = Date.now();
                        const timeSinceStart = (fallNow - (haz.timing.offset || 0)) % haz.timing.interval;

                        // Spawn new falling object at interval
                        if (timeSinceStart < 50 && !haz.lastSpawned) { // 50ms window to prevent double spawning
                            haz.instances.push({
                                x: haz.worldX,
                                y: haz.y,
                                vy: 0,
                                width: haz.width,
                                height: haz.height,
                                active: true
                            });
                            haz.lastSpawned = true;
                        } else if (timeSinceStart > 100) {
                            haz.lastSpawned = false;
                        }

                        // Update existing falling objects
                        for (let i = haz.instances.length - 1; i >= 0; i--) {
                            const obj = haz.instances[i];
                            if (!obj.active) continue;

                            // Apply gravity
                            obj.vy += 0.6;
                            obj.y += obj.vy;

                            // Check collision with player
                            const objScreenX = obj.x + worldX;
                            if (objScreenX + obj.width > player.x && objScreenX < player.x + player.width &&
                                obj.y + obj.height > player.y && obj.y < player.y + player.height) {
                                if (!player.invincible && !player.dead) {
                                    player.die();
                                }
                            }

                            // Remove if off screen
                            if (obj.y > canvas.height + 100) {
                                haz.instances.splice(i, 1);
                            }
                        }
                        break;

                    case 'rushing_hazard':
                        // Handle rushing hazard horizontal movement
                        if (!haz.currentX) haz.currentX = haz.worldX;
                        if (!haz.direction) haz.direction = haz.speed > 0 ? 1 : -1;

                        // Move horizontally
                        haz.currentX += haz.speed;

                        // Reverse direction at boundaries (assuming 200px movement range)
                        if (Math.abs(haz.currentX - haz.worldX) > 200) {
                            haz.speed = -haz.speed;
                            haz.direction = -haz.direction;
                        }

                        // Check collision with player and apply push
                        const rushScreenX = haz.currentX + worldX;
                        if (rushScreenX + haz.width > player.x && rushScreenX < player.x + player.width &&
                            haz.y + haz.height > player.y && haz.y < player.y + player.height) {
                            // Push player in direction of movement
                            player.vx += haz.direction * 3;
                            if (!player.invincible && Math.abs(player.vx) > 8) {
                                // If pushed too hard, cause damage
                                if (!player.dead) player.die();
                            }
                        }
                        break;

                    // Add cases for other hazards like 'sparking_hazard' here later
                }
            });

            if (onSpill && player.grounded) {
                player.vx *= 1.05;
                if (Math.abs(player.vx) < 2) player.vx = player.facing * 2;
            }

            // Handle alarm platform enemy spawning
            platforms.forEach(platform => {
                if (platform.type === 'alarm' && platform.alarmTriggered && platform.alarmTime) {
                    const elapsed = Date.now() - platform.alarmTime;
                    if (elapsed > (platform.alarmDelay || 1000) && !platform.enemiesSpawned) {
                        // Spawn enemies near the alarm platform
                        let spawnX = platform.worldX + platform.width + 100;
                        const playerWorldX = player.x - worldX;
                        if (Math.abs(spawnX - playerWorldX) < MIN_SPAWN_DISTANCE) {
                            spawnX = playerWorldX + Math.sign(spawnX - playerWorldX || 1) * MIN_SPAWN_DISTANCE;
                        }
                        enemyManager.enemies.push({
                            worldX: spawnX,
                            y: platform.y - 40,
                            vy: 0,
                            width: 40,
                            height: 40,
                            vx: 0,
                            hp: 1,
                            falling: false,
                            speed: 2
                        });
                        platform.enemiesSpawned = true;

                        // Reset after 5 seconds to allow retriggering
                        setTimeout(() => {
                            platform.alarmTriggered = false;
                            platform.alarmTime = null;
                            platform.enemiesSpawned = false;
                        }, 5000);
                    }
                }
            });

            enemyManager.update(canvas, worldX, player, pits);

            player.handleInput(keys, onSpill);
            player.updateState(SPRITE_ANIMATIONS);
            player.updatePhysics(groundY, platforms, pits, worldX);
            
            // Update shadow twin if active
            if (player.shadowTwin.active) {
                updateShadowTwin();
            }

            if (player.checkFallDeath()) {
                player.die();
            }

                        // [NEW] Central Death Handler - This now manages all respawns
            if (player.dead && !player.isRespawning) {
                handlePlayerDeath();
            }

            const deltaX = player.updateScreenPosition(worldX, screenLocked, testLevelEndX, gate);
            if (deltaX !== 0) {
                worldX -= deltaX;
            }

            if (boss) {
                boss.update(player, canvas);
                
                // Handle boss projectiles
                if (boss.pendingProjectile) {
                    const proj = boss.pendingProjectile;
                    const dx = proj.targetX - proj.x;
                    const dy = proj.targetY - proj.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const vx = (dx / distance) * proj.speed;
                    const vy = (dy / distance) * proj.speed;
                    
                    projectiles.push({
                        x: proj.x,
                        y: proj.y,
                        vx: vx,
                        vy: vy,
                        width: 20,
                        height: 20,
                        type: 'boss_projectile',
                        isBossProjectile: true
                    });
                    
                    boss.pendingProjectile = null;
                }
                
                // Handle boss area attacks
                if (boss.pendingAreaAttack) {
                    const attack = boss.pendingAreaAttack;
                    // Check if player is in area attack
                    if (player.x < attack.x + attack.width &&
                        player.x + player.width > attack.x &&
                        player.y < attack.y + attack.height &&
                        player.y + player.height > attack.y) {
                        if (!player.invincible && !player.dead) {
                            player.die();
                        }
                    }
                    
                    // Decrement attack duration
                    attack.duration--;
                    if (attack.duration <= 0) {
                        boss.pendingAreaAttack = null;
                    }
                }
                
                // Check if boss is destroyed
                if (boss.isDestroyed) {
                    const armorId = selectedLevel + 1;
                    armorPickup = {
                        x: boss.x + boss.width / 2 - 20,
                        y: boss.y + boss.height / 2 - 20,
                        width: 40,
                        height: 40,
                        armorId: armorId
                    };
                    boss = null;
                }
                
                if (boss && player.checkBossCollision(boss)) {
                    setTimeout(() => {
                        // Clear level content when boss defeats player
                        levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);
                        enemyManager.clear();
                        boss = null;
                        armorPickup = null;
                        gameState = 'menu';
                    }, 2000);
                }
            }

            for (let i = npcs.length - 1; i >= 0; i--) {
                const npc = npcs[i];
                if (npc.isLeaving) {
                    npc.worldX += 4;
                    if (npc.worldX + worldX > canvas.width) {
                        npcs.splice(i, 1);
                    }
                }
            }

            for (let i = projectiles.length - 1; i >= 0; i--) {
                const proj = projectiles[i];

                switch(proj.type) {
                    case 3: proj.centerX = player.x + player.width/2; proj.centerY = player.y + player.height/2 + (player.crouching ? 20 : 0); proj.angle += proj.rotSpeed; if (proj.angle > Math.PI * 2) { projectiles.splice(i, 1); continue; } break;
                    case 7: proj.centerX = player.x + player.width/2; proj.centerY = player.y + player.height/2 + (player.crouching ? 20 : 0); proj.angle += proj.rotSpeed * proj.direction; if ((proj.direction === 1 && proj.angle >= Math.PI * 2)) { proj.direction = -1; } else if (proj.direction === -1 && proj.angle <= 0) { projectiles.splice(i, 1); continue; } break;
                    case 4: if (!proj.landed) { proj.x += proj.vx; proj.vy += 0.6; proj.y += proj.vy; proj.wavePhase += 0.3; if (proj.y + proj.height > groundY) { proj.y = groundY - proj.height; proj.vy = 0; proj.vx = 0; proj.worldX = proj.x - worldX; proj.landed = true; proj.landTime = Date.now(); } } else { proj.x = proj.worldX + worldX; if (Date.now() - proj.landTime > 1000) { projectiles.splice(i, 1); continue; } } break;
                    case 5: proj.x += proj.vx; break;
                    case 6: proj.x += proj.vx; proj.angle += proj.rotSpeed; break;
                    case 8: if (!proj.landed) { proj.x += proj.vx; proj.vy += 0.6; proj.y += proj.vy; if (proj.dropsLeft > 0 && Math.abs(proj.x - proj.lastDropX) > 80) { projectiles.push({ worldX: proj.x - worldX, y: proj.y, vx: 0, vy: 0, width: 20, height: 10, type: 1 }); proj.lastDropX = proj.x; proj.dropsLeft--; } if (proj.y + proj.height > groundY) { proj.y = groundY - proj.height; proj.vy = 0; proj.vx = 0; proj.worldX = proj.x - worldX; proj.landed = true; proj.landTime = Date.now(); } } else { proj.x = proj.worldX + worldX; if (Date.now() - proj.landTime > 1000) { projectiles.splice(i, 1); continue; } } break;
                    case 2: proj.x += proj.vx; break;
                    case 'boss_projectile':
                        proj.x += proj.vx;
                        proj.y += proj.vy;
                        
                        // Check collision with player
                        if (proj.x < player.x + player.width &&
                            proj.x + proj.width > player.x &&
                            proj.y < player.y + player.height &&
                            proj.y + proj.height > player.y) {
                            if (!player.invincible && !player.dead) {
                                player.die();
                            }
                            projectiles.splice(i, 1);
                            continue;
                        }
                        
                        // Remove if off-screen
                        if (proj.x < -100 || proj.x > canvas.width + 100 || 
                            proj.y < -100 || proj.y > canvas.height + 100) {
                            projectiles.splice(i, 1);
                            continue;
                        }
                        break;
                    default: if (!proj.landed) { if (proj.worldX !== undefined) { proj.x = proj.worldX + worldX; } else if (proj.vx !== 0) { proj.x += proj.vx; } proj.vy += 0.6; proj.y += proj.vy; if (proj.y + proj.height > groundY) { proj.y = groundY - proj.height; proj.vy = 0; proj.vx = 0; if (proj.worldX === undefined) proj.worldX = proj.x - worldX; proj.landed = true; proj.landTime = Date.now(); } } else { if (proj.worldX !== undefined) proj.x = proj.worldX + worldX; if (Date.now() - proj.landTime > 1000) { projectiles.splice(i, 1); continue; } } break;
                }

                // **FIX**: Corrected Boss Gate and Boss Spawn Logic
                if (gate && gate.hp > 0 && !proj.landed) {
                    const gateScreenX = gate.worldX + worldX;

                    // Gate can only be damaged if it's on screen
                    if (gateScreenX < canvas.width) {
                        const gateY = groundY - gate.height;
                        let hitGate = false;
                        if (proj.type === 3 || proj.type === 7) {
                            const numChecks = 10;
                            for (let k = 0; k <= numChecks; k++) {
                                const t = k / numChecks;
                                const checkX = proj.centerX + Math.cos(proj.angle) * proj.radius * t;
                                const checkY = proj.centerY + Math.sin(proj.angle) * proj.radius * t;
                                if (checkX > gateScreenX && checkX < gateScreenX + gate.width && checkY > gateY && checkY < gateY + gate.height) {
                                    hitGate = true; break;
                                }
                            }
                        } else if (proj.x < gateScreenX + gate.width && proj.x + (proj.width || proj.size || 20) > gateScreenX && proj.y < gateY + gate.height && proj.y + (proj.height || proj.size || 10) > gateY) {
                            hitGate = true;
                        }

                        if (hitGate) {
                            gate.hp--;
                            if (gate.hp <= 0) {
                                gate = null; // Gate is destroyed
                                screenLocked = true; // Lock the screen for the boss fight

                                // Spawn the boss *only* now
                                boss = new Boss(
                                    selectedLevel,
                                    canvas.width - 200,
                                    groundY - 120,
                                    BOSS_DATA[selectedLevel],
                                    BOSS_ANIMATIONS
                                );
                            }
                            if (proj.type !== 3 && proj.type !== 7) {
                                projectiles.splice(i, 1);
                                continue;
                            }
                        }
                    }
                }

                if (boss && boss.hp > 0 && !proj.landed) {
                    let hitBoss = false;
                    if (proj.type === 3 || proj.type === 7) {
                        const numChecks = 10;
                        for (let k = 0; k <= numChecks; k++) {
                            const t = k / numChecks;
                            const checkX = proj.centerX + Math.cos(proj.angle) * proj.radius * t;
                            const checkY = proj.centerY + Math.sin(proj.angle) * proj.radius * t;
                            if (checkX > boss.x && checkX < boss.x + boss.width && checkY > boss.y && checkY < boss.y + boss.height) {
                                hitBoss = true; break;
                            }
                        }
                    } else if (proj.x < boss.x + boss.width && proj.x + (proj.width || proj.size || 20) > boss.x && proj.y < boss.y + boss.height && proj.y + (proj.height || proj.size || 10) > boss.y) {
                        hitBoss = true;
                    }
                    if (hitBoss) {
                        boss.takeDamage(1);
                        if (proj.type !== 3 && proj.type !== 7) {
                            projectiles.splice(i, 1);
                            continue;
                        }
                    }
                }
            }

            const hitResults = enemyManager.checkProjectileCollisions(projectiles, worldX);
            hitResults.sort((a, b) => b.projectileIndex - a.projectileIndex);
            for (const result of hitResults) {
                // Handle enemy drops
                if (result.destroyedEnemy) {
                    try {
                        const droppedItem = itemSpawner.handleEnemyDeath(
                            result.destroyedEnemy, 
                            worldX, 
                            result.enemyType
                        );
                        
                        if (droppedItem) {
                            pickups.push(droppedItem);
                        }
                    } catch (error) {
                        console.error('Error handling enemy death drop:', error);
                    }
                }
                
                // Remove projectile (except for persistent ones)
                if (result.projectileType !== 3 && result.projectileType !== 7) {
                    projectiles.splice(result.projectileIndex, 1);
                }
            }

            for (let i = pickups.length - 1; i >= 0; i--) {
                const pickup = pickups[i];
                const screenX = pickup.worldX + worldX;
                if (screenX < -100) { pickups.splice(i, 1); continue; }
                
                // Check collision with player
                if (player.x < screenX + pickup.width && 
                    player.x + player.width > screenX && 
                    player.y < pickup.y + pickup.height && 
                    player.y + player.height > pickup.y) {
                    
                    // Handle different item types
                    let itemCollected = false;
                    
                    switch (pickup.subtype) {
                        case 'weapon':
                            if (pickup.weaponId) {
                                player.currentWeapon = pickup.weaponId;
                                itemCollected = true;
                            }
                            break;
                        case 'powerup':
                            if (pickup.powerupType === 'life') {
                                player.lives++;
                                itemCollected = true;
                            } else if (pickup.powerupType === 'speed_boost') {
                                player.speedMultiplier *= 1.5;
                                setTimeout(() => { player.speedMultiplier /= 1.5; }, 10000);
                                itemCollected = true;
                            } else if (pickup.powerupType === 'jump_boost') {
                                player.jumpMultiplier *= 1.3;
                                setTimeout(() => { player.jumpMultiplier /= 1.3; }, 10000);
                                itemCollected = true;
                            }
                            break;
                        case 'medication':
                            const result = player.applyMedication(pickup.medicationType);
                            if (result.success) {
                                itemCollected = true;
                            }
                            break;
                        case 'rare':
                            if (pickup.rareType === 'armor_repair') {
                                // Repair current armor or grant temporary invincibility
                                player.invincible = true;
                                setTimeout(() => { player.invincible = false; }, 5000);
                                itemCollected = true;
                            } else if (pickup.rareType === 'invincibility') {
                                player.invincible = true;
                                setTimeout(() => { player.invincible = false; }, 8000);
                                itemCollected = true;
                            }
                            break;
                        default:
                            // Legacy weapon pickup support
                            if (pickup.weaponId) {
                                player.currentWeapon = pickup.weaponId;
                                itemCollected = true;
                            }
                            break;
                    }
                    
                    if (itemCollected) {
                        pickups.splice(i, 1);
                    }
                }
            }

            if (armorPickup) {
                if (player.checkArmorPickupCollision(armorPickup)) {
                    armorPickup = null;
                    setTimeout(() => {
                        alert('Level Complete! New Armor Acquired!');
                        // Clear all level content when completing a level
                        levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);
                        enemyManager.clear();
                        boss = null;
                        gameState = 'menu';
                    }, 500);
                }
            }

            for (let i = powerups.length - 1; i >= 0; i--) {
                const powerup = powerups[i];
                powerup.vy += 0.4;
                powerup.y += powerup.vy;

                if (powerup.y > groundY - 20) {
                    powerup.y = groundY - 20;
                    powerup.vy = 0;
                }

                const screenX = powerup.worldX + worldX;
                const powerupType = player.checkPowerupCollision(powerup, screenX);
                if (powerupType) {
                    powerups.splice(i, 1);
                }
            }
        }

        function draw() {
            ctx.fillStyle = (selectedLevel >= 0 && LEVEL_DATA[selectedLevel]) ? LEVEL_DATA[selectedLevel].color : '#333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (gameState === 'menu') {
                ctx.fillStyle = '#fff'; ctx.font = '48px Arial'; ctx.textAlign = 'center';
                ctx.fillText('Select a Level', canvas.width / 2, 100);

                const buttonsPerRow = 4;
                const buttonWidth = 150;
                const buttonHeight = 80;
                const startX = (canvas.width - (buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * 20)) / 2;
                const startY = canvas.height * 0.3;

                for (let i = 0; i < LEVEL_DATA.length; i++) {
                    const level = LEVEL_DATA[i];
                    const row = Math.floor(i / buttonsPerRow);
                    const col = i % buttonsPerRow;
                    const x = startX + col * (buttonWidth + 20);
                    const y = startY + row * (buttonHeight + 20);

                    ctx.fillStyle = level.color; ctx.fillRect(x, y, buttonWidth, buttonHeight);
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(x, y, buttonWidth, buttonHeight);

                    ctx.fillStyle = '#000'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
                    const words = level.name.split(' ');
                    if (words.length > 1) {
                         ctx.fillText(words[0], x + buttonWidth / 2, y + buttonHeight / 2);
                         ctx.fillText(words[1], x + buttonWidth / 2, y + buttonHeight / 2 + 20);
                    } else {
                        ctx.fillText(level.name, x + buttonWidth / 2, y + buttonHeight / 2 + 8);
                    }
                }
            } else {
                // Apply upside-down transformation if gravity is flipped
                if (player.gravityFlipped) {
                    ctx.save();
                    ctx.translate(canvas.width/2, canvas.height/2);
                    ctx.rotate(Math.PI);
                    ctx.translate(-canvas.width/2, -canvas.height/2);
                }
                
                groundY = canvas.height - 100;

                ctx.fillStyle = '#654321';
                let currentDrawX = 0;
                let sortedPits = [...pits].sort((a,b) => (a.worldX + worldX) - (b.worldX + worldX));
                for(const pit of sortedPits) {
                    const pitScreenX = pit.worldX + worldX;
                    if(pitScreenX > currentDrawX) {
                        ctx.fillRect(currentDrawX, groundY, pitScreenX - currentDrawX, canvas.height - groundY);
                    }
                    currentDrawX = pitScreenX + pit.width;
                }
                if(currentDrawX < canvas.width) {
                    ctx.fillRect(currentDrawX, groundY, canvas.width - currentDrawX, canvas.height - groundY);
                }

                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                for (let x = (worldX % 40); x < canvas.width; x += 40) {
                    let inPit = false;
                    for(const pit of pits) {
                        const pitScreenX = pit.worldX + worldX;
                        if(x > pitScreenX && x < pitScreenX + pit.width) {
                            inPit = true;
                            break;
                        }
                    }
                    if(!inPit) {
                        ctx.beginPath();
                        ctx.moveTo(x, groundY);
                        ctx.lineTo(x, groundY - 10);
                        ctx.stroke();
                    }
                }

                for (const p of platforms) {
                    const screenX = p.worldX + worldX;
                    if (screenX > -p.width && screenX < canvas.width) {
                        ctx.globalAlpha = !p.activated ? 0.3 : 1.0;

                        // Different colors for different platform types
                        switch(p.type) {
                            case 'malfunctioning':
                                ctx.fillStyle = p.isActiveMalfunction ? '#FF4444' : '#FF8888'; // Red when malfunctioning
                                break;
                            case 'alarm':
                                if (p.alarmTriggered) {
                                    // Flashing alarm platform
                                    const flash = Math.floor(Date.now() / 200) % 2;
                                    ctx.fillStyle = flash ? '#FFFF00' : '#FF0000'; // Yellow/Red flash
                                } else {
                                    ctx.fillStyle = '#FFAA00'; // Orange for alarm platforms
                                }
                                break;
                            case 'falling':
                                ctx.fillStyle = '#8B4513'; // Brown for unstable platforms
                                break;
                            default:
                                ctx.fillStyle = '#808080'; // Default gray
                                break;
                        }

                        ctx.fillRect(screenX, p.y, p.width, p.height);

                        // Add visual indicators
                        if (p.type === 'malfunctioning') {
                            ctx.fillStyle = '#FFFFFF';
                            ctx.font = '12px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText('!', screenX + p.width/2, p.y - 5);
                        } else if (p.type === 'alarm') {
                            ctx.fillStyle = '#000000';
                            ctx.font = '12px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText('⚠', screenX + p.width/2, p.y - 5);
                        }

                        ctx.globalAlpha = 1.0;
                    }
                }

                // Draw hidden platforms if atropine is active
            if (player.hiddenPlatformsVisible) {
                for (const p of hiddenPlatforms) {
                    const screenX = p.worldX + worldX;
                    if (screenX > -p.width && screenX < canvas.width) {
                        ctx.globalAlpha = 0.7;
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(screenX, p.y, p.width, p.height);
                        ctx.strokeStyle = '#FFF';
                        ctx.strokeRect(screenX, p.y, p.width, p.height);
                        ctx.globalAlpha = 1.0;
                    }
                }
            }

            for (const p of platforms) {
                const screenX = p.worldX + worldX;
                if (screenX > -p.width && screenX < canvas.width) {
                    ctx.save();
                    
                    // Apply special visual effects based on platform type
                    switch(p.type) {
                        case 'rhythmic':
                            // Cardiac rhythm visualization
                            if (p.visible) {
                                ctx.fillStyle = '#FF6B6B';
                                ctx.globalAlpha = 0.8;
                                ctx.fillRect(screenX, p.y, p.width, p.height);
                                
                                // ECG line effect
                                ctx.strokeStyle = '#FFF';
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                const beatPhase = (Date.now() % p.beatInterval) / p.beatInterval;
                                const peakX = screenX + p.width * beatPhase;
                                ctx.moveTo(screenX, p.y + p.height/2);
                                ctx.lineTo(peakX - 5, p.y + p.height/2);
                                ctx.lineTo(peakX, p.y);
                                ctx.lineTo(peakX + 5, p.y + p.height);
                                ctx.lineTo(peakX + 10, p.y + p.height/2);
                                ctx.lineTo(screenX + p.width, p.y + p.height/2);
                                ctx.stroke();
                            }
                            break;
                            
                        case 'breathing':
                            // Lung expansion effect
                            ctx.fillStyle = '#6B9FFF';
                            ctx.globalAlpha = 0.7;
                            ctx.fillRect(screenX, p.y, p.width, p.height);
                            
                            // Airflow particles
                            const breathPhase = (Date.now() % 3000) / 3000;
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                            for (let i = 0; i < 5; i++) {
                                const particleX = screenX + p.width * (i / 5) + Math.sin(breathPhase * Math.PI * 2) * 10;
                                const particleY = p.y + p.height/2 + Math.cos(breathPhase * Math.PI * 2 + i) * 5;
                                ctx.beginPath();
                                ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                                ctx.fill();
                            }
                            break;
                            
                        case 'temperature':
                            // Temperature visual effects
                            if (p.temp === 'hot') {
                                // Heat waves
                                ctx.fillStyle = '#FF4444';
                                ctx.globalAlpha = 0.6;
                                ctx.fillRect(screenX, p.y, p.width, p.height);
                                
                                // Heat shimmer
                                ctx.strokeStyle = 'rgba(255, 100, 0, 0.3)';
                                for (let i = 0; i < 3; i++) {
                                    const waveY = p.y - 10 - i * 10 + p.heatWave;
                                    ctx.beginPath();
                                    ctx.moveTo(screenX, waveY);
                                    ctx.quadraticCurveTo(screenX + p.width/2, waveY - 10, screenX + p.width, waveY);
                                    ctx.stroke();
                                }
                            } else if (p.temp === 'cold') {
                                // Frost effect
                                ctx.fillStyle = '#B0E0FF';
                                ctx.globalAlpha = p.frostLevel;
                                ctx.fillRect(screenX, p.y, p.width, p.height);
                                
                                // Ice crystals
                                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                                ctx.lineWidth = 1;
                                for (let i = 0; i < 5; i++) {
                                    const crystalX = screenX + (p.width / 5) * i + 10;
                                    const crystalY = p.y + 10;
                                    ctx.beginPath();
                                    // Snowflake pattern
                                    for (let j = 0; j < 6; j++) {
                                        const angle = (j / 6) * Math.PI * 2;
                                        ctx.moveTo(crystalX, crystalY);
                                        ctx.lineTo(crystalX + Math.cos(angle) * 5, crystalY + Math.sin(angle) * 5);
                                    }
                                    ctx.stroke();
                                }
                            }
                            break;
                            
                        case 'pulsing':
                            // Pain pulse effect
                            ctx.fillStyle = p.isPainful ? '#FF0000' : '#00FF00';
                            ctx.globalAlpha = p.isPainful ? 0.8 : 0.5;
                            ctx.save();
                            ctx.translate(screenX + p.width/2, p.y + p.height/2);
                            ctx.scale(p.pulseScale, p.pulseScale);
                            ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
                            ctx.restore();
                            
                            // Pain indicator
                            if (p.isPainful) {
                                ctx.fillStyle = '#FFF';
                                ctx.font = 'bold 16px Arial';
                                ctx.textAlign = 'center';
                                ctx.fillText('PAIN!', screenX + p.width/2, p.y - 10);
                            }
                            break;
                            
                        case 'bubble':
                            // Prenatal bubble effect
                            ctx.strokeStyle = `rgba(100, 200, 255, ${p.protection / 100})`;
                            ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.arc(screenX + p.width/2, p.y + p.height/2, 
                                   (p.width/2 + 20) * p.bubbleSize, 0, Math.PI * 2);
                            ctx.stroke();
                            
                            // Protection percentage
                            ctx.fillStyle = '#FFF';
                            ctx.font = '12px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText(`${Math.round(p.protection)}%`, screenX + p.width/2, p.y + p.height/2);
                            break;
                            
                        case 'growth_spurt':
                            // Growth visualization
                            ctx.fillStyle = '#90EE90';
                            ctx.fillRect(screenX, p.y, p.width, p.height);
                            
                            // Growth arrows
                            ctx.strokeStyle = '#00FF00';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(screenX + p.width/2, p.y + p.height);
                            ctx.lineTo(screenX + p.width/2, p.y - 10);
                            ctx.moveTo(screenX + p.width/2 - 5, p.y - 5);
                            ctx.lineTo(screenX + p.width/2, p.y - 10);
                            ctx.lineTo(screenX + p.width/2 + 5, p.y - 5);
                            ctx.stroke();
                            break;
                    }
                    
                    ctx.restore();
                }
            }

            // --- [NEW] DRAW HAZARDS ---
            hazards.forEach(haz => {
                if (!haz.activated) return;
                const screenX = haz.worldX + worldX;
                if (screenX > -haz.width && screenX < canvas.width) {
                    switch(haz.type) {
                        case 'aerosol_geyser':
                            if (haz.isOn) {
                                ctx.fillStyle = 'rgba(144, 238, 144, 0.7)'; // Light green, semi-transparent
                                ctx.fillRect(screenX, haz.y - haz.height, haz.width, haz.height);
                            }
                            break;
                        case 'spill_slick':
                            ctx.fillStyle = 'rgba(100, 100, 200, 0.5)'; // Puddle blue
                            ctx.beginPath();
                            ctx.ellipse(screenX + haz.width / 2, haz.y, haz.width / 2, 8, 0, 0, Math.PI * 2);
                            ctx.fill();
                            break;

                        case 'falling_object':
                            // Draw falling object instances
                            if (haz.instances) {
                                haz.instances.forEach(obj => {
                                    if (obj.active) {
                                        const objScreenX = obj.x + worldX;
                                        if (objScreenX > -obj.width && objScreenX < canvas.width) {
                                            ctx.fillStyle = '#8B4513'; // Brown for falling debris
                                            ctx.fillRect(objScreenX, obj.y, obj.width, obj.height);
                                            ctx.strokeStyle = '#654321';
                                            ctx.strokeRect(objScreenX, obj.y, obj.width, obj.height);
                                        }
                                    }
                                });
                            }
                            break;

                        case 'rushing_hazard':
                            // Draw rushing hazard with movement animation
                            const rushScreenX = (haz.currentX || haz.worldX) + worldX;
                            if (rushScreenX > -haz.width && rushScreenX < canvas.width) {
                                ctx.fillStyle = '#FF6B6B'; // Red for danger
                                ctx.fillRect(rushScreenX, haz.y, haz.width, haz.height);

                                // Add motion lines to show movement
                                ctx.strokeStyle = '#FF4444';
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                const direction = haz.direction || 1;
                                for (let i = 0; i < 3; i++) {
                                    const lineX = rushScreenX - (direction * (10 + i * 5));
                                    ctx.moveTo(lineX, haz.y + 10 + i * 15);
                                    ctx.lineTo(lineX + direction * 15, haz.y + 10 + i * 15);
                                }
                                ctx.stroke();
                                ctx.lineWidth = 1;
                            }
                            break;
                    }
                }
            });

            // Draw medications
            for (const med of medications) {
                const screenX = med.worldX + worldX;
                if (screenX > -30 && screenX < canvas.width + 30) {
                    // Draw medication capsule
                    const colors = {
                        'epinephrine': '#FF69B4',
                        'benzodiazepine': '#4169E1',
                        'morphine': '#FFD700',
                        'insulin': '#90EE90',
                        'corticosteroid': '#E6E6FA',
                        'atropine': '#FF4500'
                    };

                    ctx.fillStyle = colors[med.type] || '#FFF';
                    ctx.beginPath();
                    ctx.arc(screenX + 15, med.y + 15, 15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Draw medication initial
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(med.type[0].toUpperCase(), screenX + 15, med.y + 20);
                }
            }

            // Draw interaction zones
            for (const zone of interactionZones) {
                const screenX = zone.worldX + worldX;
                if (screenX > -zone.width && screenX < canvas.width) {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    ctx.fillRect(screenX, zone.y, zone.width, zone.height);
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(screenX, zone.y, zone.width, zone.height);
                    ctx.setLineDash([]);
                }
            }

            // Draw medication UI (active medications)
            if (selectedLevel === 1) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(10, 120, 250, 100);
                ctx.fillStyle = '#FFF';
                ctx.font = '14px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('Active Medications:', 20, 140);

                player.activeMedications.forEach((med, index) => {
                    const timeLeft = Math.ceil((med.duration - (Date.now() - med.startTime)) / 1000);
                    ctx.fillText(`${med.type}: ${timeLeft}s`, 20, 160 + index * 20);
                });
            }

            // Visual effects for medications
            if (player.invincible) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
                ctx.restore();
            }

            if (player.bulletTime) {
                ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

                for (const npc of npcs) {
                    const screenX = npc.worldX + worldX;
                    if (screenX > -npc.width && screenX < canvas.width) {
                        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(screenX, npc.y, npc.width, npc.height);
                        ctx.strokeStyle = '#000'; ctx.strokeRect(screenX, npc.y, npc.width, npc.height);
                        const distance = Math.abs((player.x + player.width / 2) - (screenX + npc.width / 2));
                        const targetPlatform = platforms.find(p => p.id === npc.interactionId);
                        if (distance < 50 && targetPlatform && !targetPlatform.activated && !npc.isLeaving) {
                            ctx.fillStyle = 'black'; ctx.font = '16px Arial'; ctx.textAlign = 'center';
                            ctx.fillText("[E]", screenX + npc.width / 2, npc.y - 10);
                        }
                    }
                }

                for (const chest of chests) {
                    const screenX = chest.worldX + worldX;
                    if (screenX > -chest.width && screenX < canvas.width) {
                        if (chest.state === 'closed') { ctx.fillStyle = '#8B4513'; }
                        else if (chest.state === 'open') { ctx.fillStyle = '#D2B48C'; }
                        else { ctx.fillStyle = '#555555'; }
                        ctx.beginPath();
                        ctx.arc(screenX + chest.width / 2, chest.y, chest.width / 2, Math.PI, 0);
                        ctx.closePath();
                        ctx.fill();
                        const distance = Math.abs((player.x + player.width / 2) - (screenX + chest.width / 2));
                        if (distance < 50 && chest.state === 'closed') {
                            ctx.fillStyle = 'white'; ctx.font = '16px Arial'; ctx.textAlign = 'center';
                            ctx.fillText("[E]", screenX + chest.width / 2, chest.y - 30);
                        }
                    }
                }

                for (const powerup of powerups) {
                    const screenX = powerup.worldX + worldX;
                    if (screenX > -20 && screenX < canvas.width) {
                        if (powerup.type === 'life') {
                            ctx.fillStyle = 'red';
                            ctx.font = '24px Arial';
                            ctx.fillText('♥', screenX, powerup.y);
                        }
                    }
                }

                if (gate && gate.hp > 0) {
                    const gateScreenX = gate.worldX + worldX;
                    const gateY = groundY - gate.height;
                    const damageRatio = gate.hp / gate.maxHp;
                    const red = Math.floor(255 * (1-damageRatio));
                    const gray = Math.floor(150 * damageRatio);
                    ctx.fillStyle = `rgb(${red}, ${gray}, ${gray})`;
                    ctx.fillRect(gateScreenX, gateY, gate.width, gate.height);
                }

                if (armorPickup) {
                    const armorDef = ARMOR_DATA[armorPickup.armorId];
                    ctx.fillStyle = armorDef.color; ctx.fillRect(armorPickup.x, armorPickup.y, armorPickup.width, armorPickup.height);
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(armorPickup.x, armorPickup.y, armorPickup.width, armorPickup.height);
                }

                if (boss) {
                    // Render boss area attack if active
                    if (boss.pendingAreaAttack) {
                        const attack = boss.pendingAreaAttack;
                        const alpha = attack.duration / 60; // Fade out over time
                        ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;
                        ctx.fillRect(attack.x, attack.y, attack.width, attack.height);
                        ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
                        ctx.lineWidth = 3;
                        ctx.setLineDash([10, 5]);
                        ctx.strokeRect(attack.x, attack.y, attack.width, attack.height);
                        ctx.setLineDash([]);
                    }
                    
                    // Render boss with sprite
                    boss.render(ctx);
                    
                    // Render boss health bar
                    const barWidth = 300, barHeight = 20, barX = (canvas.width - barWidth) / 2, barY = 50;
                    ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barWidth, barHeight);
                    ctx.fillStyle = '#ff0000'; ctx.fillRect(barX, barY, barWidth * (boss.hp / boss.maxHp), barHeight);
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(barX, barY, barWidth, barHeight);
                    
                    // Boss name display
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 18px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(boss.name, canvas.width / 2, barY - 10);
                }

                for (const pickup of pickups) {
                    const screenX = pickup.worldX + worldX;
                    if (screenX > -50 && screenX < canvas.width + 50) {
                        // Add glow effect for rare items
                        if (pickup.glowEffect || pickup.subtype === 'rare') {
                            const time = Date.now() * 0.005;
                            const glowAlpha = 0.3 + 0.2 * Math.sin(time);
                            ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
                            ctx.fillRect(screenX - 5, pickup.y - 5, pickup.width + 10, pickup.height + 10);
                        }
                        
                        // Render based on item type
                        switch (pickup.subtype) {
                            case 'weapon':
                                ctx.fillStyle = WEAPON_COLORS[pickup.weaponId - 1] || '#888';
                                ctx.fillRect(screenX, pickup.y, pickup.width, pickup.height);
                                ctx.strokeStyle = '#000'; 
                                ctx.strokeRect(screenX, pickup.y, pickup.width, pickup.height);
                                ctx.fillStyle = '#000'; 
                                ctx.font = '14px Arial'; 
                                ctx.textAlign = 'center';
                                ctx.fillText(pickup.weaponId.toString(), screenX + pickup.width/2, pickup.y + pickup.height/2 + 5);
                                break;
                                
                            case 'powerup':
                                if (pickup.powerupType === 'life') {
                                    ctx.fillStyle = '#FF0000';
                                    ctx.font = '20px Arial';
                                    ctx.textAlign = 'center';
                                    ctx.fillText('♥', screenX + pickup.width/2, pickup.y + pickup.height/2 + 7);
                                } else if (pickup.powerupType === 'speed_boost') {
                                    ctx.fillStyle = '#00FF00';
                                    ctx.fillRect(screenX, pickup.y, pickup.width, pickup.height);
                                    ctx.fillStyle = '#FFF';
                                    ctx.font = '12px Arial';
                                    ctx.textAlign = 'center';
                                    ctx.fillText('SPD', screenX + pickup.width/2, pickup.y + pickup.height/2 + 4);
                                } else if (pickup.powerupType === 'jump_boost') {
                                    ctx.fillStyle = '#0080FF';
                                    ctx.fillRect(screenX, pickup.y, pickup.width, pickup.height);
                                    ctx.fillStyle = '#FFF';
                                    ctx.font = '12px Arial';
                                    ctx.textAlign = 'center';
                                    ctx.fillText('JMP', screenX + pickup.width/2, pickup.y + pickup.height/2 + 4);
                                }
                                break;
                                
                            case 'medication':
                                const medColors = {
                                    'epinephrine': '#FF69B4',
                                    'morphine': '#FFD700',
                                    'insulin': '#90EE90'
                                };
                                ctx.fillStyle = medColors[pickup.medicationType] || '#FFF';
                                ctx.beginPath();
                                ctx.arc(screenX + pickup.width/2, pickup.y + pickup.height/2, pickup.width/2, 0, Math.PI * 2);
                                ctx.fill();
                                ctx.strokeStyle = '#000';
                                ctx.lineWidth = 2;
                                ctx.stroke();
                                ctx.fillStyle = '#000';
                                ctx.font = 'bold 12px Arial';
                                ctx.textAlign = 'center';
                                ctx.fillText(pickup.medicationType[0].toUpperCase(), screenX + pickup.width/2, pickup.y + pickup.height/2 + 4);
                                break;
                                
                            case 'rare':
                                ctx.fillStyle = '#FFD700';
                                ctx.fillRect(screenX, pickup.y, pickup.width, pickup.height);
                                ctx.strokeStyle = '#FF4500';
                                ctx.lineWidth = 3;
                                ctx.strokeRect(screenX, pickup.y, pickup.width, pickup.height);
                                ctx.fillStyle = '#000';
                                ctx.font = 'bold 16px Arial';
                                ctx.textAlign = 'center';
                                ctx.fillText('★', screenX + pickup.width/2, pickup.y + pickup.height/2 + 6);
                                break;
                                
                            default:
                                // Legacy weapon rendering
                                if (pickup.weaponId) {
                                    ctx.fillStyle = WEAPON_COLORS[pickup.weaponId - 1] || '#888';
                                    ctx.fillRect(screenX, pickup.y, pickup.width || 30, pickup.height || 30);
                                    ctx.strokeStyle = '#000';
                                    ctx.strokeRect(screenX, pickup.y, pickup.width || 30, pickup.height || 30);
                                    ctx.fillStyle = '#000';
                                    ctx.font = '14px Arial';
                                    ctx.textAlign = 'center';
                                    ctx.fillText(pickup.weaponId.toString(), screenX + (pickup.width || 30)/2, pickup.y + (pickup.height || 30)/2 + 5);
                                } else {
                                    // Generic item
                                    ctx.fillStyle = '#888';
                                    ctx.fillRect(screenX, pickup.y, pickup.width || 20, pickup.height || 20);
                                }
                                break;
                        }
                        
                        // Show despawn timer for temporary items
                        if (pickup.despawnTimer > 0 && pickup.despawnTimer < 180) { // Show warning in last 3 seconds
                            const alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
                            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
                            ctx.fillRect(screenX - 2, pickup.y - 2, pickup.width + 4, pickup.height + 4);
                        }
                    }
                }

                enemyManager.render(ctx, worldX);

                for (const proj of projectiles) {
                    switch(proj.type) {
                        case 3: ctx.strokeStyle = '#32cd32'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(proj.centerX, proj.centerY); ctx.lineTo(proj.centerX + Math.cos(proj.angle) * proj.radius, proj.centerY + Math.sin(proj.angle) * proj.radius); ctx.stroke(); break;
                        case 7: ctx.strokeStyle = '#20b2aa'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(proj.centerX, proj.centerY); ctx.lineTo(proj.centerX + Math.cos(proj.angle) * proj.radius, proj.centerY + Math.sin(proj.angle) * proj.radius); ctx.stroke(); break;
                        case 4: ctx.strokeStyle = '#ffa500'; ctx.lineWidth = 3; ctx.beginPath(); for (let dx = 0; dx <= proj.width; dx += 5) { const x = proj.x + dx, y = proj.y + proj.height/2 + Math.sin((dx + proj.wavePhase) * 0.3) * 5; if (dx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); break;
                        case 5: ctx.fillStyle = '#ff69b4'; ctx.fillRect(proj.x, proj.y, proj.width, proj.height); ctx.fillRect(proj.x, proj.y + proj.height + proj.gap, proj.width, proj.height); break;
                        case 6: ctx.save(); ctx.translate(proj.x + proj.size/2, proj.y + proj.size/2); ctx.rotate(proj.angle); ctx.fillStyle = '#9370db'; ctx.fillRect(-proj.size/2, -proj.size/10, proj.size, proj.size/5); ctx.fillRect(-proj.size/10, -proj.size/2, proj.size/5, proj.size); ctx.restore(); break;
                        case 8: ctx.fillStyle = '#ff4500'; ctx.beginPath(); ctx.arc(proj.x + proj.height/2, proj.y + proj.height/2, proj.height/2, Math.PI/2, Math.PI*1.5); ctx.arc(proj.x + proj.width - proj.height/2, proj.y + proj.height/2, proj.height/2, Math.PI*1.5, Math.PI/2); ctx.closePath(); ctx.fill(); break;
                        case 2: ctx.fillStyle = '#00bfff'; ctx.fillRect(proj.x, proj.y, proj.width, proj.height); break;
                        case 1: ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.ellipse(proj.x + proj.width/2, proj.y + proj.height/2, proj.width/2, proj.height/2, 0, 0, Math.PI * 2); ctx.fill(); break;
                        case 'boss_projectile': ctx.fillStyle = '#8B00FF'; ctx.beginPath(); ctx.arc(proj.x + proj.width/2, proj.y + proj.height/2, proj.width/2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#4B0082'; ctx.lineWidth = 2; ctx.stroke(); break;
                    }
                }

                player.render(ctx, playerSprite, spriteLoaded, SPRITE_ANIMATIONS, ARMOR_DATA);

                if (selectedLevel === 4) {
                    drawPsychZoneEffects();
                }

                if (levelManager.currentLevel) {
                    // Comfort zones (Level 5)
                    if (levelManager.currentLevel.comfortZones) {
                        for (const zone of levelManager.currentLevel.comfortZones) {
                            const zoneStartX = zone.startX + worldX;
                            const zoneEndX = zone.endX + worldX;
                            
                            if (zoneEndX > 0 && zoneStartX < canvas.width) {
                                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                                ctx.fillRect(Math.max(0, zoneStartX), 0, 
                                           Math.min(canvas.width, zoneEndX) - Math.max(0, zoneStartX), 
                                           canvas.height);
                                
                                // Zone label
                                ctx.fillStyle = '#FFF';
                                ctx.font = 'bold 20px Arial';
                                ctx.textAlign = 'center';
                                ctx.fillText(zone.type.toUpperCase() + ' ZONE', 
                                           (Math.max(0, zoneStartX) + Math.min(canvas.width, zoneEndX)) / 2, 
                                           50);
                                
                                // Zone-specific indicators
                                switch(zone.type) {
                                    case 'temperature':
                                        ctx.fillText(`Temp: ${zone.currentTemp.toFixed(1)}°F (Target: ${zone.idealTemp}°F)`,
                                                   (Math.max(0, zoneStartX) + Math.min(canvas.width, zoneEndX)) / 2, 80);
                                        break;
                                    case 'hygiene':
                                        ctx.fillText(`Cleanliness: ${zone.cleanlinessLevel.toFixed(0)}%`,
                                                   (Math.max(0, zoneStartX) + Math.min(canvas.width, zoneEndX)) / 2, 80);
                                        break;
                                    case 'nutrition':
                                        ctx.fillText(`Hunger: ${zone.hungerLevel.toFixed(0)}%`,
                                                   (Math.max(0, zoneStartX) + Math.min(canvas.width, zoneEndX)) / 2, 80);
                                        break;
                                    case 'sleep':
                                        ctx.fillText(`Noise: ${zone.currentNoise} dB (Max: ${zone.maxNoise} dB)`,
                                                   (Math.max(0, zoneStartX) + Math.min(canvas.width, zoneEndX)) / 2, 80);
                                        break;
                                }
                            }
                        }
                    }
                    
                    // Vital zones (Level 6)
                    if (levelManager.currentLevel.vitalZones) {
                        for (const zone of levelManager.currentLevel.vitalZones) {
                            const zoneStartX = zone.startX + worldX;
                            const zoneEndX = zone.endX + worldX;
                            
                            if (zoneEndX > 0 && zoneStartX < canvas.width) {
                                // Zone-specific vital sign display
                                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                                ctx.font = 'bold 16px monospace';
                                ctx.textAlign = 'left';
                                
                                let vitalText = '';
                                let vitalColor = '#00FF00';
                                
                                switch(zone.type) {
                                    case 'cardiac':
                                        vitalText = `HR: ${zone.currentHR} bpm`;
                                        if (zone.currentHR < 60 || zone.currentHR > 100) vitalColor = '#FF0000';
                                        break;
                                    case 'respiratory':
                                        vitalText = `RR: ${zone.currentResp} | O2: ${zone.currentO2}%`;
                                        if (zone.currentO2 < 92) vitalColor = '#FF0000';
                                        break;
                                    case 'renal':
                                        vitalText = `UO: ${zone.currentOutput} mL/hr`;
                                        if (zone.currentOutput < 30) vitalColor = '#FF0000';
                                        break;
                                    case 'metabolic':
                                        vitalText = `pH: ${zone.currentPH.toFixed(2)} | Glucose: ${zone.currentSugar}`;
                                        if (zone.currentPH < 7.35 || zone.currentPH > 7.45) vitalColor = '#FF0000';
                                        break;
                                }
                                
                                ctx.fillStyle = vitalColor;
                                ctx.fillText(vitalText, 20, 150);
                            }
                        }
                    }
                }

                if (player.dead) {
                    ctx.fillStyle = `rgba(255, 0, 0, ${Math.sin(Date.now() * 0.01) * 0.5 + 0.5})`;
                    ctx.fillRect(player.x, player.y, player.width, player.height);
                }

                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(10, 10, 220, 105);
                ctx.fillStyle = '#fff'; ctx.font = '18px Arial'; ctx.textAlign = 'left';
                const currentArmorId = player.armors[player.currentArmorIndex];
                const currentArmorName = ARMOR_DATA[currentArmorId].name;
                ctx.fillText(`Armor: ${currentArmorName}`, 20, 35);
                ctx.fillText(`Weapon: ${WEAPON_NAMES[player.currentWeapon - 1]}`, 20, 60);
                ctx.fillText(`Lives: ${player.lives}`, 20, 85);

                if (player.dead) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
                    ctx.fillStyle = '#fff'; ctx.font = '36px Arial'; ctx.textAlign = 'center';
                    if (player.lives > 0) {
                        ctx.fillText('YOU DIED! Respawning...', canvas.width / 2, canvas.height / 2);
                    } else {
                        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
                    }
                }

                

                function drawPsychZoneEffects() {
                    const playerWorldX = player.x - worldX;

                    // Tunnel vision effect (anxiety)
                    if (player.tunnelVision > 0) {
                        const gradient = ctx.createRadialGradient(
                            player.x + player.width/2, player.y + player.height/2,
                            100,
                            player.x + player.width/2, player.y + player.height/2,
                            canvas.width
                        );
                        gradient.addColorStop(0, 'rgba(0,0,0,0)');
                        gradient.addColorStop(1, `rgba(0,0,0,${player.tunnelVision})`);
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    // Depression fog
                    if (player.depressionFog > 0) {
                        ctx.fillStyle = `rgba(50, 50, 70, ${player.depressionFog})`;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    // Draw mirror twin
                    if (player.hasTwin) {
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        // Draw semi-transparent twin at mirrored position
                        player.render(ctx, playerSprite, spriteLoaded, SPRITE_ANIMATIONS, ARMOR_DATA, player.twinX);
                        ctx.restore();
                    }
                    
                    // Draw shadow twin
                    if (player.shadowTwin.active) {
                        ctx.save();
                        ctx.globalAlpha = 0.4;
                        
                        // Create a temporary player object for rendering the shadow twin
                        const shadowPlayer = {
                            x: player.shadowTwin.x,
                            y: player.shadowTwin.y,
                            width: player.width,
                            height: player.height,
                            facing: player.shadowTwin.facing,
                            crouching: false,
                            currentArmorIndex: player.currentArmorIndex,
                            armors: player.armors,
                            animation: {
                                currentFrame: player.animation.currentFrame,
                                lastFrameTime: player.animation.lastFrameTime
                            },
                            grounded: player.shadowTwin.grounded
                        };
                        
                        // Render shadow twin with same appearance as player but more transparent
                        player.render.call(shadowPlayer, ctx, playerSprite, spriteLoaded, SPRITE_ANIMATIONS, ARMOR_DATA);
                        ctx.restore();
                    }

                }

                if (gameState === 'paused') {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    const panelWidth = Math.min(400, canvas.width * 0.8), panelHeight = 200;
                    const panelX = (canvas.width - panelWidth) / 2, panelY = (canvas.height - panelHeight) / 2;
                    ctx.fillStyle = '#fff'; ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
                    ctx.fillStyle = '#000'; ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center';
                    ctx.fillText('PAUSED', canvas.width / 2, panelY + 40);
                    const buttonWidth = panelWidth - 60, buttonHeight = 50;
                    const resumeX = panelX + 30, resumeY = panelY + 60;
                    ctx.fillStyle = '#4CAF50'; ctx.fillRect(resumeX, resumeY, buttonWidth, buttonHeight);
                    ctx.fillStyle = '#fff'; ctx.font = '24px Arial';
                    ctx.fillText('Resume', canvas.width / 2, resumeY + buttonHeight / 2 + 8);
                    const selectX = resumeX, selectY = resumeY + buttonHeight + 20;
                    ctx.fillStyle = '#f44336'; ctx.fillRect(selectX, selectY, buttonWidth, buttonHeight);
                    ctx.fillStyle = '#fff';
                    ctx.fillText('Level Select', canvas.width / 2, selectY + buttonHeight / 2 + 8);
                }

                if (gameState === 'quiz' && quiz.getCurrentQuestion()) {
                    quiz.drawQuiz(ctx, canvas);
                }
            }
        }

        

        // Debugging function to draw spatial axes
        function drawSpatialAxes() {
            if (gameState !== 'playing') return;

            const axisColor = 'rgba(255, 255, 255, 0.8)';
            const tickColor = 'rgba(255, 255, 255, 0.6)';
            const textColor = 'rgba(255, 255, 255, 0.9)';

            ctx.save();
            ctx.strokeStyle = axisColor;
            ctx.fillStyle = textColor;
            ctx.font = '12px monospace';
            ctx.lineWidth = 1;

            // X-axis (horizontal) - shows world coordinates
            const xAxisY = canvas.height - 40; // 40 pixels from bottom
            ctx.beginPath();
            ctx.moveTo(0, xAxisY);
            ctx.lineTo(canvas.width, xAxisY);
            ctx.stroke();

            // X-axis tick marks and labels
            const playerWorldX = player.x - worldX; // Current player world position
            const tickInterval = 200; // Every 200 world units
            const startWorldX = Math.floor((-worldX - 100) / tickInterval) * tickInterval;

            for (let worldX_pos = startWorldX; worldX_pos <= -worldX + canvas.width + 100; worldX_pos += tickInterval) {
                const screenX = worldX_pos + worldX;
                if (screenX >= 0 && screenX <= canvas.width) {
                    // Draw tick mark
                    ctx.strokeStyle = tickColor;
                    ctx.beginPath();
                    ctx.moveTo(screenX, xAxisY - 5);
                    ctx.lineTo(screenX, xAxisY + 5);
                    ctx.stroke();

                    // Draw label
                    ctx.fillStyle = textColor;
                    ctx.textAlign = 'center';
                    ctx.fillText(worldX_pos.toString(), screenX, xAxisY + 18);
                }
            }

            // Y-axis (vertical) - shows pixel coordinates from ground
            const yAxisX = 30; // 30 pixels from left
            ctx.strokeStyle = axisColor;
            ctx.beginPath();
            ctx.moveTo(yAxisX, 50); // Start 50px from top
            ctx.lineTo(yAxisX, groundY + 10); // End 10px below ground
            ctx.stroke();

            // Y-axis tick marks and labels (every 100 pixels)
            const yTickInterval = 100;
            for (let y = groundY; y >= 50; y -= yTickInterval) {
                const groundOffset = groundY - y; // Distance above ground level

                // Draw tick mark
                ctx.strokeStyle = tickColor;
                ctx.beginPath();
                ctx.moveTo(yAxisX - 5, y);
                ctx.lineTo(yAxisX + 5, y);
                ctx.stroke();

                // Draw label (showing distance above ground)
                ctx.fillStyle = textColor;
                ctx.textAlign = 'right';
                ctx.fillText(groundOffset.toString(), yAxisX - 8, y + 4);
            }

            // Draw axis labels
            ctx.fillStyle = textColor;
            ctx.font = '14px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('X (World)', 10, xAxisY - 10);
            ctx.save();
            ctx.translate(15, (groundY + 50) / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText('Y (Height)', 0, 0);
            ctx.restore();

            // Show current player position
            ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            const playerY = groundY - player.y - player.height;
            ctx.fillText(`Player: (${Math.round(playerWorldX)}, ${Math.round(playerY)})`, canvas.width - 200, 20);

            ctx.restore();
                
            // Restore upside-down transformation if it was applied
            if (player.gravityFlipped) {
                ctx.restore();
            }
        }

        function gameLoop() {
            try {
                update();
                draw();
                if (typeof DEBUG_DRAW_AXES !== 'undefined' && DEBUG_DRAW_AXES) {
                    drawSpatialAxes();
                }
            } catch (error) {
                console.error('Game loop error:', error);
                // Continue running even if there's an error
            }
            requestAnimationFrame(gameLoop);
        }

        console.log('Starting game...');
        gameLoop();
export function initGame() {
    // TODO: Import/init player, enemies, UI, etc.
    // TODO: Set up canvas, start game loop
    console.log('Game initialized');
  }