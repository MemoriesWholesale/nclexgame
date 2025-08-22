import { Player } from './player.js';
import LevelManager from './levelManager.js';
import { Quiz } from './quiz.js';
import { Enemy, EnemyManager } from './enemy.js';

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

        const levelData = [
            { name: "Coordinated Care", color: '#87CEEB', file: 'data/coordinated_care.json' },
            { name: "Pharm. Therapies", color: '#98FB98', file: 'data/pharma_therapies.json' },
            { name: "Safety/Infection", color: '#FFD700', file: 'data/safety_infection_control.json' },
            { name: "Risk Reduction", color: '#FFB6C1', file: 'data/reduction_of_risk_potential.json' },
            { name: "Psychosocial Int.", color: '#ADD8E6', file: 'data/psychosocial_integrity.json' },
            { name: "Basic Care", color: '#FFA07A', file: 'data/basic_care_and_comfort.json' },
            { name: "Phys. Adaptation", color: '#DA70D6', file: 'data/physiological_adaptation.json' },
            { name: "Health Promotion", color: '#A52A2A', file: 'data/health_promotion_and_maintenance.json' }
        ];

        // NEW: Precise animation map based on the 372x345 sprite sheet
        const spriteAnimations = {
            walk:       { y: 0,   frames: 4, width: 62, height: 115, startFrame: 0 },
            walkShoot:  { y: 0,   frames: 1, width: 62, height: 115, startFrame: 4 },
            idleShoot:  { y: 0,   frames: 1, width: 62, height: 115, startFrame: 5 },
            jumpUp:     { y: 115, frames: 1, width: 62, height: 115, startFrame: 0 },
            jumpDown:   { y: 115, frames: 1, width: 62, height: 115, startFrame: 1 },
            jumpShoot:  { y: 115, frames: 1, width: 62, height: 115, startFrame: 2 },
            crouch:     { y: 230, frames: 1, width: 62, height: 115, startFrame: 0 },
            crouchShoot:{ y: 230, frames: 2, width: 62, height: 115, startFrame: 1 },
            idle:       { y: 0,   frames: 1, width: 62, height: 115, startFrame: 0 }
        };

        // Create player instance
        const player = new Player(canvas);

        // Create quiz instance
        const quiz = new Quiz();

        // Create enemy manager
        const enemyManager = new EnemyManager();

        const armorData = [
            { name: 'Default', color: '#FF0000' },
            { name: "Coord. Care Armor", color: '#0000FF' },
            { name: "Pharm. Armor", color: '#FFFF00' },
            { name: "Safety Armor", color: '#00FF00' },
            { name: "Risk Armor", color: '#FFA500' },
            { name: "Psych. Armor", color: '#800080' },
            { name: "Basic Care Armor", color: '#00FFFF' },
            { name: "Adapt. Armor", color: '#FFC0CB' },
            { name: "Health Promo Armor", color: '#A52A2A' }
        ];

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
        let pickupSpawnTimer = 0;
        const pits = [];
        const chests = [];
        const powerups = [];
        const medications = [];
        const interactionZones = [];
        const hiddenPlatforms = [];
        let medicationSpawnTimer = 0;

        const hazards = [];

        let currentWeapon = 1;
        const weaponNames = ['Pill', 'Syringe', 'Stethoscope', 'Bandage', 'Shears', 'Hammer', 'BP Monitor', 'Bottle'];
        const weaponColors = ['#ffffff', '#00bfff', '#32cd32', '#ffa500', '#ff69b4', '#9370db', '#20b2aa', '#ff4500'];
        let fireTimer = 0;
        const fireCooldowns = [10, 5, 20, 25, 30, 40, 25, 45];

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

                for (let i = 0; i < levelData.length; i++) {
                    const row = Math.floor(i / buttonsPerRow);
                    const col = i % buttonsPerRow;
                    const btnX = startX + col * (buttonWidth + 20);
                    const btnY = startY + row * (buttonHeight + 20);

                    if (mouseX >= btnX && mouseX <= btnX + buttonWidth && mouseY >= btnY && mouseY <= btnY + buttonHeight) {
                        selectedLevel = i;
                        startGame();
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
                    // Clear all level content when returning to level select menu
                    levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);
                    enemyManager.clear();
                    boss = null;
                    armorPickup = null;
                    gameState = 'menu';
                    selectedLevel = -1;
                }
            } else if (gameState === 'quiz' && quiz.getCurrentQuestion()) {
                const currentQuestion = quiz.getCurrentQuestion();
                if (currentQuestion.answered) {
                    if (currentQuestion.isCorrect) {
                        const activationIds = currentQuestion.interactionId.split(',');
                        activationIds.forEach(id => {
                            const targetPlatform = platforms.find(p => p.id === id);
                            if (targetPlatform) {
                                targetPlatform.activated = true;
                            }
                        });

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

        async function startGame() {
            // **FIX**: Clear all level content arrays right at the start.
            levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);

            gameState = 'playing';
            const groundY = canvas.height - 100;
            player.reset(groundY);
            worldX = 0;
            enemyManager.clear();
            currentWeapon = 1;
            screenLocked = false;
            boss = null;
            armorPickup = null;
            quiz.clearCurrentQuestion();
            canFire = true;

            // Reset all timers to ensure fresh level start
            pickupSpawnTimer = 0;
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

                    const response = await fetch(levelDef.questionFile || levelData[selectedLevel].file);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    await quiz.loadQuestions(levelDef.questionFile || levelData[selectedLevel].file);

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

        function spawnPickup() {
            const playerWorldX = player.x - worldX;
            if (gate === null || boss || playerWorldX > testLevelEndX - canvas.width) return;
            pickups.push({
                worldX: -worldX + canvas.width / 2 + Math.random() * canvas.width / 2,
                y: canvas.height - 130,
                weaponId: 2 + Math.floor(Math.random() * 7)
            });
        }

        function fireWeapon() {
            if (fireTimer > 0) return;
            if (currentWeapon === 3 || currentWeapon === 7) {
                for (const proj of projectiles) {
                    if (proj.type === currentWeapon) return;
                }
            }
            fireTimer = fireCooldowns[currentWeapon - 1];

            const weaponPos = player.getWeaponSpawnPos();
            const weaponYOffset = player.crouching ? 20 : 0;

            switch(currentWeapon) {
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
                    // Clear level content on game over
                    levelManager.clearLevelContent(platforms, npcs, chests, hazards, pits, powerups, medications, interactionZones, hiddenPlatforms, projectiles, pickups);
                    enemyManager.clear();
                    boss = null;
                    armorPickup = null;
                    gameState = 'menu'; // Game over
                }
            }, 2000); // 2-second delay before respawn/game over
        }

        function update() {
            if (gameState !== 'playing') return;

            groundY = canvas.height - 100;

            if (levelManager.currentLevel) {
                levelManager.spawnLevelContent(worldX, canvas, platforms, npcs, chests, hazards, enemyManager);
                function applyPsychZoneEffects() {
                    if (!levelManager.currentLevel || !levelManager.currentLevel.psychZones) return;

                    const playerWorldX = player.x - worldX;

                    // Reset effects first
                    player.invertedControls = false;
                    player.hasTwin = false;
                    player.gravityFlipped = false;
                    player.tunnelVision = 0;
                    player.speedMultiplier = 1;

                    // Apply active zone effects
                    for (const zone of levelManager.currentLevel.psychZones) {
                        if (playerWorldX >= zone.startX && playerWorldX <= zone.endX) {
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
                if (selectedLevel === 4 && levelManager.currentLevel.psychZones) {
                    applyPsychZoneEffects();
                }
            };

            if (fireTimer > 0) fireTimer--;
            pickupSpawnTimer++;

            // Update player medications
            player.updateMedications();

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
                        const spawnX = platform.worldX + platform.width + 100;
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

            enemyManager.update(canvas, worldX, player, pits, gate, boss, testLevelEndX);

            if (pickupSpawnTimer > 450) {
                spawnPickup();
                pickupSpawnTimer = 0;
            }

            player.handleInput(keys, onSpill);
            player.updateState(spriteAnimations);
            player.updatePhysics(groundY, platforms, pits, worldX);

            if (player.checkFallDeath()) {
                player.die();
            }

                        // [NEW] Central Death Handler - This now manages all respawns
            if (player.dead) {
                handlePlayerDeath();
            }

            const deltaX = player.updateScreenPosition(worldX, screenLocked, testLevelEndX, gate);
            if (deltaX !== 0) {
                worldX -= deltaX;
            }

            if (boss) {
                boss.x += boss.vx;
                if (boss.x <= 100 || boss.x >= canvas.width - 100 - boss.width) {
                    boss.vx = -boss.vx;
                }
                if (player.checkBossCollision(boss)) {
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
                                boss = {
                                    x: canvas.width - 200, y: groundY - 120,
                                    width: 80, height: 120, vx: -2, hp: 10, maxHp: 10
                                };
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
                        boss.hp--;
                        if (boss.hp <= 0) {
                            const armorId = selectedLevel + 1;
                            armorPickup = {
                                x: boss.x + boss.width / 2 - 20, y: boss.y + boss.height / 2 - 20,
                                width: 40, height: 40, armorId: armorId
                            };
                            boss = null;
                        }
                        if (proj.type !== 3 && proj.type !== 7) {
                            projectiles.splice(i, 1);
                            continue;
                        }
                    }
                }

                const hitResults = enemyManager.checkProjectileCollisions(projectiles, worldX);

                for (const result of hitResults) {
                    if (result.projectileType !== 3 && result.projectileType !== 7) {
                        projectiles.splice(result.projectileIndex, 1);
                        break;
                    }
                }
            }

            for (let i = pickups.length - 1; i >= 0; i--) {
                const pickup = pickups[i];
                const screenX = pickup.worldX + worldX;
                if (screenX < -100) { pickups.splice(i, 1); continue; }
                const weaponId = player.checkPickupCollision(pickup, screenX);
                if (weaponId) {
                    currentWeapon = weaponId;
                    pickups.splice(i, 1);
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
            ctx.fillStyle = selectedLevel >= 0 ? levelData[selectedLevel].color : '#333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (gameState === 'menu') {
                ctx.fillStyle = '#fff'; ctx.font = '48px Arial'; ctx.textAlign = 'center';
                ctx.fillText('Select a Level', canvas.width / 2, 100);

                const buttonsPerRow = 4;
                const buttonWidth = 150;
                const buttonHeight = 80;
                const startX = (canvas.width - (buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * 20)) / 2;
                const startY = canvas.height * 0.3;

                for (let i = 0; i < levelData.length; i++) {
                    const level = levelData[i];
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
                    const armorDef = armorData[armorPickup.armorId];
                    ctx.fillStyle = armorDef.color; ctx.fillRect(armorPickup.x, armorPickup.y, armorPickup.width, armorPickup.height);
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.strokeRect(armorPickup.x, armorPickup.y, armorPickup.width, armorPickup.height);
                }

                if (boss) {
                    ctx.fillStyle = '#4B0082'; ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
                    const barWidth = 300, barHeight = 20, barX = (canvas.width - barWidth) / 2, barY = 50;
                    ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barWidth, barHeight);
                    ctx.fillStyle = '#ff0000'; ctx.fillRect(barX, barY, barWidth * (boss.hp / boss.maxHp), barHeight);
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(barX, barY, barWidth, barHeight);
                }

                for (const pickup of pickups) {
                    const screenX = pickup.worldX + worldX;
                    if (screenX > -30 && screenX < canvas.width + 30) {
                        ctx.fillStyle = weaponColors[pickup.weaponId - 1]; ctx.fillRect(screenX, pickup.y, 30, 30);
                        ctx.strokeStyle = '#000'; ctx.strokeRect(screenX, pickup.y, 30, 30);
                        ctx.fillStyle = '#000'; ctx.font = '16px Arial'; ctx.textAlign = 'center';
                        ctx.fillText(pickup.weaponId.toString(), screenX + 15, pickup.y + 20);
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
                    }
                }

                player.render(ctx, playerSprite, spriteLoaded, spriteAnimations, armorData);

                if (selectedLevel === 4) {
                    drawPsychZoneEffects();
                }

                if (player.dead) {
                    ctx.fillStyle = `rgba(255, 0, 0, ${Math.sin(Date.now() * 0.01) * 0.5 + 0.5})`;
                    ctx.fillRect(player.x, player.y, player.width, player.height);
                }

                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(10, 10, 220, 105);
                ctx.fillStyle = '#fff'; ctx.font = '18px Arial'; ctx.textAlign = 'left';
                const currentArmorId = player.armors[player.currentArmorIndex];
                const currentArmorName = armorData[currentArmorId].name;
                ctx.fillText(`Armor: ${currentArmorName}`, 20, 35);
                ctx.fillText(`Weapon: ${weaponNames[currentWeapon - 1]}`, 20, 60);
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
                        player.render(ctx, playerSprite, spriteLoaded, spriteAnimations, armorData, player.twinX);
                        ctx.restore();
                    }

                    // Upside down effect
                    if (player.gravityFlipped) {
                        ctx.save();
                        ctx.translate(canvas.width/2, canvas.height/2);
                        ctx.rotate(Math.PI);
                        ctx.translate(-canvas.width/2, -canvas.height/2);
                        // The entire world would need to be redrawn here
                        // Or you could apply this transformation at the start of draw()
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
        }

        function gameLoop() {
            update();
            draw();
            drawSpatialAxes(); // Add debugging axes overlay
            requestAnimationFrame(gameLoop);
        }

        gameLoop();
export function initGame() {
    // TODO: Import/init player, enemies, UI, etc.
    // TODO: Set up canvas, start game loop
    console.log('Game initialized');
  }