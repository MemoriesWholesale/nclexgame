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
        
        const player = {
            x: 100, y: 0, width: 50, height: 92, // Adjusted for new sprite aspect ratio
            vx: 0, vy: 0, speed: 5, jumpPower: 15,
            grounded: false, facing: 1, lives: 3, dead: false, crouching: false,
            armors: [0], currentArmorIndex: 0,
            onPlatform: null,
            state: 'idle',
            currentFrame: 0,
            animationTimer: 0,
            isShooting: false,
            shootTimer: 0
        };

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
        const testLevelEndX = 10800;
        
        let gate = null;
        let boss = null;
        let screenLocked = false;
        let armorPickup = null;
        
        const enemies = [];
        let enemySpawnTimer = 0;
        let spawnFromRightNext = true;
        
        const projectiles = [];
        const platforms = [];
        const npcs = [];
        const pickups = [];
        let pickupSpawnTimer = 0;
        const pits = [];
        const chests = [];
        const powerups = [];

        let questionBank = [];
        let availableQuestions = [];
        let currentQuestion = null;
        
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
                player.currentArmorIndex = (player.currentArmorIndex + 1) % player.armors.length;
            }
            
            if ((e.key === 'e' || e.key === 'E') && gameState === 'playing' && !player.dead) {
                handleInteraction();
            }
            
            if (e.key === ' ' && canFire) {
                if (gameState === 'playing' && !player.dead) {
                    fireWeapon();
                    player.isShooting = true;
                    player.shootTimer = 15;
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
                    gameState = 'menu';
                    selectedLevel = -1;
                }
            } else if (gameState === 'quiz' && currentQuestion) {
                if (currentQuestion.answered) {
                    const targetPlatform = platforms.find(p => p.id === currentQuestion.interactionId);
                    if (targetPlatform && currentQuestion.isCorrect) {
                        targetPlatform.activated = true;
                    }

                    const targetChest = chests.find(c => c.id === currentQuestion.interactionId);
                    if (targetChest) {
                        if (currentQuestion.isCorrect) {
                            targetChest.state = 'open';
                            powerups.push({
                                worldX: targetChest.worldX + targetChest.width / 2 - 10,
                                y: targetChest.y - 30,
                                vy: -5,
                                type: 'life'
                            });
                        } else {
                            targetChest.state = 'inert';
                        }
                    }

                    const interactingNpc = npcs.find(n => n.interactionId === currentQuestion.interactionId);
                    if(interactingNpc && !currentQuestion.isCorrect) interactingNpc.isLeaving = true;
                    
                    currentQuestion = null;
                    gameState = 'playing';
                } else {
                    currentQuestion.shuffledAnswers.forEach((answer) => {
                        if (mouseX >= answer.x && mouseX <= answer.x + answer.width &&
                            mouseY >= answer.y && mouseY <= answer.y + answer.height) {
                            
                            currentQuestion.answered = true;
                            currentQuestion.playerAnswer = answer.text;
                            currentQuestion.isCorrect = (answer.text === currentQuestion.correctAnswer);
                        }
                    });
                }
            }
        });

        async function startGame() {
            gameState = 'playing';
            player.x = 100; player.y = canvas.height - player.height - 100;
            player.vx = 0; player.vy = 0;
            player.lives = 3; player.dead = false;
            worldX = 0;
            enemies.length = 0; projectiles.length = 0; pickups.length = 0; platforms.length = 0; npcs.length = 0; pits.length = 0; chests.length = 0; powerups.length = 0;
            currentWeapon = 1; enemySpawnTimer = 0; pickupSpawnTimer = 0;
            screenLocked = false;
            gate = { worldX: testLevelEndX, width: 60, height: 150, hp: 5, maxHp: 5 };
            boss = null;
            armorPickup = null;
            currentQuestion = null;
            canFire = true;

            if (selectedLevel !== -1) {
                try {
                    const response = await fetch(levelData[selectedLevel].file);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    questionBank = await response.json();
                    availableQuestions = [...questionBank];
                } catch (error) {
                    console.error("Could not load question file:", error);
                    alert("Error: Could not load questions for this level. Please ensure the .json file exists and you are using a live server.");
                    gameState = 'menu';
                    return;
                }
            }

            if (selectedLevel === 0) {
                const elevatorPlatform = {
                    worldX: 800, y: canvas.height - 120, width: 120, height: 20,
                    activated: false, type: 'elevator', id: 1,
                    startY: canvas.height - 120, endY: canvas.height - 350, speed: -2
                };
                platforms.push(elevatorPlatform);
                
                const highLedge = {
                    worldX: 920, y: canvas.height - 350, width: 500, height: 20, activated: true, type: 'ledge'
                };
                platforms.push(highLedge);

                const pharmacistNPC = {
                    worldX: 720, y: canvas.height - 100 - 60, width: 40, height: 60,
                    type: 'pharmacist', interactionId: 1,
                    isLeaving: false
                };
                npcs.push(pharmacistNPC);

                chests.push({
                    worldX: highLedge.worldX + 100, y: highLedge.y,
                    width: 50, height: 25,
                    id: 101,
                    state: 'closed'
                });

                pits.push({ worldX: 1000, width: 150 });
                pits.push({ worldX: 1250, width: 100 });
            }
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function askQuestion(interactionId) {
            if (availableQuestions.length === 0) {
                availableQuestions = [...questionBank];
            }

            const qIndex = Math.floor(Math.random() * availableQuestions.length);
            const questionData = availableQuestions.splice(qIndex, 1)[0];

            const correctAnswer = questionData.answers[0];
            let shuffledAnswers = [...questionData.answers];
            shuffleArray(shuffledAnswers);

            currentQuestion = {
                q: questionData.q,
                correctAnswer: correctAnswer,
                shuffledAnswers: shuffledAnswers.map(ans => ({ text: ans })),
                answered: false, isCorrect: false, playerAnswer: null,
                interactionId: interactionId
            };
            
            gameState = 'quiz';
        }

        function handleInteraction() {
            for (const npc of npcs) {
                const screenX = npc.worldX + worldX;
                if(player.x < screenX + npc.width && player.x + player.width > screenX && player.y < npc.y + npc.height && player.y + player.height > npc.y && !npc.isLeaving) {
                    const targetPlatform = platforms.find(p => p.id === npc.interactionId);
                    if (targetPlatform && !targetPlatform.activated) {
                        askQuestion(npc.interactionId);
                    }
                }
            }
            for (const chest of chests) {
                if (chest.state === 'closed') {
                    const screenX = chest.worldX + worldX;
                    if(player.x < screenX + chest.width && player.x + player.width > screenX && player.y < chest.y && player.y + player.height > chest.y - chest.height) {
                         askQuestion(chest.id);
                    }
                }
            }
        }
        
        function spawnEnemy() {
            const playerWorldX = player.x - worldX;
            if (gate === null || boss || playerWorldX > testLevelEndX - canvas.width) return;
            
            enemies.push({
                worldX: spawnFromRightNext ? -worldX + canvas.width + 50 : -worldX - 50,
                y: canvas.height - 140,
                vy: 0,
                width: 40, height: 40,
                vx: 0, hp: 1,
                falling: false
            });
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
            
            // FIXED: Adjust Y position based on crouching state
            const weaponYOffset = player.crouching ? 20 : 0; // Lower the weapon spawn point when crouching
            
            switch(currentWeapon) {
                case 2: 
                    projectiles.push({ 
                        x: player.x + (player.facing > 0 ? player.width : -30), 
                        y: player.y + player.height / 2 - 3 + weaponYOffset, 
                        vx: player.facing * 15, vy: 0, width: 30, height: 6, type: 2 
                    }); 
                    break;
                case 3: 
                    projectiles.push({ 
                        centerX: player.x + player.width / 2, 
                        centerY: player.y + player.height / 2 + weaponYOffset, 
                        radius: 120, angle: 0, rotSpeed: 0.2, type: 3 
                    }); 
                    break;
                case 4: 
                    projectiles.push({ 
                        x: player.x + (player.facing > 0 ? player.width : -30), 
                        y: player.y + player.height / 2 - 5 + weaponYOffset, 
                        vx: player.facing * 6, vy: -10, width: 30, height: 10, wavePhase: 0, type: 4 
                    }); 
                    break;
                case 5: 
                    projectiles.push({ 
                        x: player.x + (player.facing > 0 ? player.width : -40), 
                        y: player.y + player.height / 2 - 12 + weaponYOffset, 
                        vx: player.facing * 9, vy: 0, width: 40, height: 4, gap: 4, type: 5 
                    }); 
                    break;
                case 6: 
                    projectiles.push({ 
                        x: player.x + (player.facing > 0 ? player.width : -30), 
                        y: player.y + player.height / 2 - 15 + weaponYOffset, 
                        vx: player.facing * 5, vy: 0, size: 30, angle: 0, rotSpeed: 0.15 * player.facing, type: 6 
                    }); 
                    break;
                case 7: 
                    projectiles.push({ 
                        centerX: player.x + player.width / 2, 
                        centerY: player.y + player.height / 2 + weaponYOffset, 
                        radius: 150, angle: 0, rotSpeed: 0.12, direction: 1, type: 7 
                    }); 
                    break;
                case 8: 
                    projectiles.push({ 
                        x: player.x + (player.facing > 0 ? player.width : -30), 
                        y: player.y + player.height / 2 - 7 + weaponYOffset, 
                        vx: player.facing * 8, vy: -18, width: 30, height: 15, 
                        lastDropX: player.x + (player.facing > 0 ? player.width : -30), 
                        dropsLeft: 5, type: 8 
                    }); 
                    break;
                default: 
                    projectiles.push({ 
                        x: player.x + (player.facing > 0 ? player.width : -20), 
                        y: player.y + player.height / 2 - 5 + weaponYOffset, 
                        vx: player.facing * 8, vy: -8, width: 20, height: 10, type: 1 
                    }); 
                    break;
            }
        }
        
        function update() {
            if (gameState !== 'playing') return;
            
            groundY = canvas.height - 100;
            
            if (fireTimer > 0) fireTimer--;
            enemySpawnTimer++;
            pickupSpawnTimer++;
            
            if (enemySpawnTimer > 300) { 
                spawnEnemy(); 
                spawnFromRightNext = !spawnFromRightNext;
                enemySpawnTimer = 0; 
            }
            if (pickupSpawnTimer > 450) { 
                spawnPickup(); 
                pickupSpawnTimer = 0; 
            }
            
            if (!player.dead) {
                if (keys['ArrowLeft'] || keys['a'] || keys['A']) { player.vx = -player.speed; player.facing = -1; }
                else if (keys['ArrowRight'] || keys['d'] || keys['D']) { player.vx = player.speed; player.facing = 1; }
                else { player.vx *= 0.8; }
                if ((keys['ArrowUp'] || keys['w'] || keys['W']) && player.grounded) {
                    player.vy = -player.jumpPower;
                    player.grounded = false;
                    player.onPlatform = null;
                }
                player.crouching = (keys['ArrowDown'] || keys['s'] || keys['S']) && player.grounded;

                if(player.shootTimer > 0) player.shootTimer--;
                else player.isShooting = false;
                
                if (player.isShooting) {
                    if (player.crouching) {
                        player.state = 'crouchShoot';
                    } else if (!player.grounded) {
                        player.state = 'jumpShoot';
                    } else if (Math.abs(player.vx) > 0.1) {
                        player.state = 'walkShoot';
                    } else {
                        player.state = 'idleShoot';
                    }
                } else if (player.crouching) {
                    player.state = 'crouch';
                } else if (!player.grounded) {
                    player.state = player.vy < 0 ? 'jumpUp' : 'jumpDown';
                } else if (Math.abs(player.vx) > 0.1) {
                    player.state = 'walk';
                } else {
                    player.state = 'idle';
                }
                
                const currentAnimation = spriteAnimations[player.state];
                player.animationTimer++;
                if (player.animationTimer > 8) {
                    player.currentFrame = (player.currentFrame + 1) % currentAnimation.frames;
                    player.animationTimer = 0;
                }
                if (player.currentFrame >= currentAnimation.frames) {
                    player.currentFrame = 0;
                }

            } else {
                player.vx = 0; player.crouching = false;
            }
            
            player.vy += 0.8;
            player.x += player.vx;
            
            for (const p of platforms) {
                if (p.type === 'elevator' && p.activated) {
                    p.y += p.speed;
                    if (p.y <= p.endY) {
                        p.y = p.endY;
                        p.speed = Math.abs(p.speed);
                    } else if (p.y >= p.startY) {
                        p.y = p.startY;
                        p.speed = -Math.abs(p.speed);
                    }
                    if (player.onPlatform === p) {
                        player.y = p.y - player.height;
                    }
                }
            }
            
            const prevY = player.y;
            player.y += player.vy;
            player.grounded = false;
            player.onPlatform = null;

            for (const p of platforms) {
                const screenX = p.worldX + worldX;
                if (p.activated || p.type === 'ledge') {
                    if (player.x + player.width > screenX && player.x < screenX + p.width && prevY + player.height <= p.y && player.y + player.height >= p.y) {
                        player.y = p.y - player.height;
                        player.vy = 0;
                        player.grounded = true;
                        if (p.type === 'elevator') {
                            player.onPlatform = p;
                        }
                    }
                }
            }

            let onGround = true;
            const playerCenterX = player.x + player.width / 2 - worldX;
            for (const pit of pits) {
                if(playerCenterX > pit.worldX && playerCenterX < pit.worldX + pit.width) {
                    onGround = false;
                    break;
                }
            }

            if (onGround && player.y + player.height > groundY) {
                player.y = groundY - player.height;
                player.vy = 0;
                player.grounded = true;
            }

            if (player.y > canvas.height + 50 && !player.dead) {
                player.lives--;
                player.dead = true;
                setTimeout(() => {
                    if (player.lives > 0) {
                        player.dead = false; player.x = 100;
                        player.y = groundY - player.height; worldX = 0; enemies.length = 0;
                    } else { gameState = 'menu'; }
                }, 2000);
            }
            
            if (!screenLocked) {
                if (player.x < 50) player.x = 50;
                if (player.x > canvas.width / 2 && !player.dead && (-worldX < testLevelEndX - canvas.width / 2)) {
                    worldX -= player.x - canvas.width / 2;
                    player.x = canvas.width / 2;
                }
            } else {
                if (player.x < 50) player.x = 50;
                if (player.x > canvas.width - 50 - player.width) player.x = canvas.width - 50 - player.width;
            }
        
            if (gate && gate.hp > 0) {
                const gateScreenX = gate.worldX + worldX;
                if (player.x + player.width > gateScreenX) {
                    player.x = gateScreenX - player.width;
                }
            }
            
            if (boss) {
                boss.x += boss.vx;
                if (boss.x <= 100 || boss.x >= canvas.width - 100 - boss.width) {
                    boss.vx = -boss.vx;
                }
                if (!player.dead && player.x < boss.x + boss.width && player.x + player.width > boss.x && player.y < boss.y + boss.height && player.y + player.height > boss.y) {
                    player.lives = 0;
                    player.dead = true;
                    setTimeout(() => { gameState = 'menu'; }, 2000);
                }
            }

            for (let i = npcs.length - 1; i >= 0; i--) {
                const npc = npcs[i];
                if (npc.isLeaving) {
                    npc.worldX -= 2; 
                    if (npc.worldX + worldX < -npc.width) {
                        npcs.splice(i, 1);
                    }
                }
            }

            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                
                let overPit = false;
                const enemyCenterX = enemy.worldX + enemy.width / 2;
                for(const pit of pits) {
                    if(enemyCenterX > pit.worldX && enemyCenterX < pit.worldX + pit.width) {
                        overPit = true;
                        break;
                    }
                }

                if (overPit) {
                    enemy.falling = true;
                }
                
                if (enemy.falling) {
                    enemy.vy += 0.8;
                    enemy.y += enemy.vy;
                    if(enemy.y > canvas.height + 50) {
                        enemies.splice(i, 1);
                        continue;
                    }
                } else {
                    const screenX = enemy.worldX + worldX;
                    const speed = 2;
                    if (screenX < player.x) { enemy.vx = speed; } 
                    else { enemy.vx = -speed; }
                    enemy.worldX += enemy.vx;

                    if (screenX < -100 || screenX > canvas.width + 100) { enemies.splice(i, 1); continue; }
                    if (!player.dead && player.x < screenX + enemy.width && player.x + player.width > screenX && player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
                        player.lives--;
                        player.dead = true;
                        setTimeout(() => {
                            if (player.lives > 0) {
                                player.dead = false; player.x = 100;
                                player.y = groundY - player.height; worldX = 0; enemies.length = 0;
                            } else { gameState = 'menu'; }
                        }, 2000);
                    }
                }
            }

            // Update projectiles with crouch-aware positions for rotating weapons
            for (let i = projectiles.length - 1; i >= 0; i--) {
                const proj = projectiles[i];
                
                switch(proj.type) {
                    case 3: 
                        // Update center position for stethoscope based on current crouch state
                        proj.centerX = player.x + player.width/2; 
                        proj.centerY = player.y + player.height/2 + (player.crouching ? 20 : 0); 
                        proj.angle += proj.rotSpeed; 
                        if (proj.angle > Math.PI * 2) { projectiles.splice(i, 1); continue; } 
                        break;
                    case 7: 
                        // Update center position for BP monitor based on current crouch state
                        proj.centerX = player.x + player.width/2; 
                        proj.centerY = player.y + player.height/2 + (player.crouching ? 20 : 0); 
                        proj.angle += proj.rotSpeed * proj.direction; 
                        if ((proj.direction === 1 && proj.angle >= Math.PI * 2)) { proj.direction = -1; } 
                        else if (proj.direction === -1 && proj.angle <= 0) { projectiles.splice(i, 1); continue; } 
                        break;
                    case 4: if (!proj.landed) { proj.x += proj.vx; proj.vy += 0.6; proj.y += proj.vy; proj.wavePhase += 0.3; if (proj.y + proj.height > groundY) { proj.y = groundY - proj.height; proj.vy = 0; proj.vx = 0; proj.worldX = proj.x - worldX; proj.landed = true; proj.landTime = Date.now(); } } else { proj.x = proj.worldX + worldX; if (Date.now() - proj.landTime > 1000) { projectiles.splice(i, 1); continue; } } break;
                    case 5: proj.x += proj.vx; break;
                    case 6: proj.x += proj.vx; proj.angle += proj.rotSpeed; break;
                    case 8: if (!proj.landed) { proj.x += proj.vx; proj.vy += 0.6; proj.y += proj.vy; if (proj.dropsLeft > 0 && Math.abs(proj.x - proj.lastDropX) > 80) { projectiles.push({ worldX: proj.x - worldX, y: proj.y, vx: 0, vy: 0, width: 20, height: 10, type: 1 }); proj.lastDropX = proj.x; proj.dropsLeft--; } if (proj.y + proj.height > groundY) { proj.y = groundY - proj.height; proj.vy = 0; proj.vx = 0; proj.worldX = proj.x - worldX; proj.landed = true; proj.landTime = Date.now(); } } else { proj.x = proj.worldX + worldX; if (Date.now() - proj.landTime > 1000) { projectiles.splice(i, 1); continue; } } break;
                    case 2: proj.x += proj.vx; break;
                    default: if (!proj.landed) { if (proj.worldX !== undefined) { proj.x = proj.worldX + worldX; } else if (proj.vx !== 0) { proj.x += proj.vx; } proj.vy += 0.6; proj.y += proj.vy; if (proj.y + proj.height > groundY) { proj.y = groundY - proj.height; proj.vy = 0; proj.vx = 0; if (proj.worldX === undefined) proj.worldX = proj.x - worldX; proj.landed = true; proj.landTime = Date.now(); } } else { if (proj.worldX !== undefined) proj.x = proj.worldX + worldX; if (Date.now() - proj.landTime > 1000) { projectiles.splice(i, 1); continue; } } break;
                }

                if (gate && gate.hp > 0 && !proj.landed) {
                    const gateScreenX = gate.worldX + worldX;
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
                            gate = null;
                            screenLocked = true;
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

                for (let j = enemies.length - 1; j >= 0; j--) {
                    const enemy = enemies[j];
                    const enemyScreenX = enemy.worldX + worldX;
                    let hit = false;
                    if (proj.type === 3 || proj.type === 7) { 
                        const numChecks = 10;
                        for (let k = 0; k <= numChecks; k++) {
                            const t = k / numChecks;
                            const checkX = proj.centerX + Math.cos(proj.angle) * proj.radius * t;
                            const checkY = proj.centerY + Math.sin(proj.angle) * proj.radius * t;
                            if (checkX > enemyScreenX && checkX < enemyScreenX + enemy.width && checkY > enemy.y && checkY < enemy.y + enemy.height) {
                                hit = true; break;
                            }
                        }
                    } else {
                        if (!proj.landed && proj.x < enemyScreenX + enemy.width && proj.x + (proj.width || proj.size || 20) > enemyScreenX && proj.y < enemy.y + enemy.height && proj.y + (proj.height || proj.size || 10) > enemy.y) {
                            hit = true;
                        }
                    }
                    if (hit) {
                        enemies.splice(j, 1);
                        if (proj.type !== 3 && proj.type !== 7) {
                            projectiles.splice(i, 1);
                            break; 
                        }
                    }
                }
            }

            for (let i = pickups.length - 1; i >= 0; i--) {
                const pickup = pickups[i];
                const screenX = pickup.worldX + worldX;
                if (screenX < -100) { pickups.splice(i, 1); continue; }
                if (!player.dead && player.x < screenX + 30 && player.x + player.width > screenX && player.y < pickup.y + 30 && player.y + player.height > pickup.y) {
                    currentWeapon = pickup.weaponId;
                    pickups.splice(i, 1);
                }
            }
            
            if (armorPickup) {
                if (!player.dead && player.x < armorPickup.x + armorPickup.width && player.x + player.width > armorPickup.x && player.y < armorPickup.y + armorPickup.height && player.y + player.height > armorPickup.y) {
                    if (!player.armors.includes(armorPickup.armorId)) {
                        player.armors.push(armorPickup.armorId);
                    }
                    player.currentArmorIndex = player.armors.indexOf(armorPickup.armorId);
                    armorPickup = null;
                    setTimeout(() => {
                        alert('Level Complete! New Armor Acquired!');
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
                if (player.x < screenX + 20 && player.x + player.width > screenX &&
                    player.y < powerup.y + 20 && player.y + player.height > powerup.y) {
                    if (powerup.type === 'life') {
                        player.lives++;
                    }
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
                        ctx.globalAlpha = (p.type === 'elevator' && !p.activated) ? 0.3 : 1.0;
                        ctx.fillStyle = '#808080';
                        ctx.fillRect(screenX, p.y, p.width, p.height);
                        ctx.globalAlpha = 1.0;
                    }
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
                
                for (const enemy of enemies) {
                    const screenX = enemy.worldX + worldX;
                    ctx.fillStyle = '#8B008B';
                    ctx.fillRect(screenX, enemy.y, enemy.width, enemy.height);
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(screenX + 8, enemy.y + 10, 8, 8);
                    ctx.fillRect(screenX + 24, enemy.y + 10, 8, 8);
                    ctx.fillStyle = '#000';
                    ctx.fillRect(screenX + 10, enemy.y + 12, 4, 4);
                    ctx.fillRect(screenX + 26, enemy.y + 12, 4, 4);
                }

                for (const proj of projectiles) {
                    switch(proj.type) {
                        case 3: ctx.strokeStyle = '#32cd32'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(proj.centerX, proj.centerY); ctx.lineTo(proj.centerX + Math.cos(proj.angle) * proj.radius, proj.centerY + Math.sin(proj.angle) * proj.radius); ctx.stroke(); break;
                        case 7: ctx.strokeStyle = '#20b2aa'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(proj.centerX, proj.centerY); ctx.lineTo(proj.centerX + Math.cos(proj.angle) * proj.radius, proj.centerY + Math.sin(proj.angle) * proj.radius); ctx.stroke(); break;
                        case 4: ctx.strokeStyle = '#ffa500'; ctx.lineWidth = 3; ctx.beginPath(); for (let dx = 0; dx <= proj.width; dx += 5) { const x = proj.x + dx, y = proj.y + proj.height/2 + Math.sin((dx + proj.wavePhase) * 0.3) * 5; if (dx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); break;
                        case 5: ctx.fillStyle = '#ff69b4'; ctx.fillRect(proj.x, proj.y, proj.width, proj.height); ctx.fillRect(proj.x, proj.y + proj.height + proj.gap, proj.width, proj.height); break;
                        case 6: ctx.save(); ctx.translate(proj.x + proj.size/2, proj.y + proj.size/2); ctx.rotate(proj.angle); ctx.fillStyle = '#9370db'; ctx.fillRect(-proj.size/2, -proj.size/10, proj.size, proj.size/5); ctx.fillRect(-proj.size/10, -proj.size/2, proj.size/5, proj.size); ctx.restore(); break;
                        case 8: ctx.fillStyle = '#ff4500'; ctx.beginPath(); ctx.arc(proj.x + proj.height/2, proj.y + proj.height/2, proj.height/2, Math.PI/2, Math.PI*1.5); ctx.arc(proj.x + proj.width - proj.height/2, proj.y + proj.height/2, proj.height/2, Math.PI*1.5, Math.PI/2); ctx.closePath(); ctx.fill(); break;
                        case 2: ctx.fillStyle = '#00bfff'; ctx.fillRect(proj.x, proj.y, proj.width, proj.height); break;
                        default: ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.ellipse(proj.x + proj.width/2, proj.y + proj.height/2, proj.width/2, proj.height/2, 0, 0, Math.PI * 2); ctx.fill(); break;
                    }
                }
                
                if (!player.dead) {
                    if (spriteLoaded) {
                        const currentAnimation = spriteAnimations[player.state];
                        const sX = (currentAnimation.startFrame + player.currentFrame) * currentAnimation.width;
                        const sY = currentAnimation.y;
                        const sWidth = currentAnimation.width;
                        const sHeight = currentAnimation.height;
                        
                        ctx.save();
                        
                        let drawX = player.x;
                        if (player.facing === -1) {
                            ctx.scale(-1, 1);
                            drawX = -player.x - player.width;
                        }
                        
                        const yPos = player.crouching ? player.y + (player.height - (player.width * sHeight / sWidth)) : player.y;

                        ctx.drawImage(
                            playerSprite,
                            sX, sY,
                            sWidth, sHeight,
                            drawX, yPos,
                            player.width, player.height
                        );
                        
                        ctx.restore();
                    } else {
                        ctx.fillStyle = armorData[player.armors[player.currentArmorIndex]].color;
                        const height = player.crouching ? player.height / 2 : player.height;
                        const yPos = player.crouching ? player.y + player.height / 2 : player.y;
                        ctx.fillRect(player.x, yPos, player.width, height);
                    }
                } else {
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

                if (gameState === 'quiz' && currentQuestion) {
                    drawQuiz();
                }
            }
        }

        function drawQuiz() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            const boxWidth = canvas.width * 0.8; const boxHeight = canvas.height * 0.7;
            const boxX = (canvas.width - boxWidth) / 2; const boxY = (canvas.height - boxHeight) / 2;
            ctx.fillStyle = '#222'; ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight); ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            ctx.fillStyle = 'white'; ctx.font = '20px Arial'; ctx.textAlign = 'center';
            const questionText = currentQuestion.q; const textX = canvas.width / 2;
            let textY = boxY + 40; const maxWidth = boxWidth - 40;
            const words = questionText.split(' '); let line = '';

            for(let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                    ctx.fillText(line, textX, textY);
                    line = words[n] + ' '; textY += 25;
                } else { line = testLine; }
            }
            ctx.fillText(line, textX, textY);

            textY += 60;
            const answerLetters = ['A', 'B', 'C', 'D'];
            const answerBoxWidth = boxWidth - 80; const answerBoxHeight = 50;
            
            currentQuestion.shuffledAnswers.forEach((answer, index) => {
                const ansX = boxX + 40; const ansY = textY + (index * (answerBoxHeight + 15));
                answer.x = ansX; answer.y = ansY; answer.width = answerBoxWidth; answer.height = answerBoxHeight;
                ctx.strokeStyle = '#888'; ctx.fillStyle = '#333';
                if (currentQuestion.answered) {
                    if (answer.text === currentQuestion.correctAnswer) { ctx.fillStyle = '#006400'; } 
                    else if (answer.text === currentQuestion.playerAnswer) { ctx.fillStyle = '#8B0000'; }
                }
                ctx.fillRect(ansX, ansY, answerBoxWidth, answerBoxHeight); ctx.strokeRect(ansX, ansY, answerBoxWidth, answerBoxHeight);
                ctx.fillStyle = 'white'; ctx.font = '16px Arial'; ctx.textAlign = 'left';
                ctx.fillText(`${answerLetters[index]}. ${answer.text}`, ansX + 15, ansY + 30);
            });
            
            if(currentQuestion.answered) {
                ctx.fillStyle = currentQuestion.isCorrect ? '#90EE90' : '#F08080'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'center';
                const resultText = currentQuestion.isCorrect ? 'Correct!' : 'Incorrect';
                ctx.fillText(resultText, canvas.width / 2, boxY + boxHeight - 60);
                ctx.fillStyle = 'white'; ctx.font = '18px Arial';
                ctx.fillText("Click anywhere to continue...", canvas.width / 2, boxY + boxHeight - 30);
            }
        }
        
        function gameLoop() {
            update(); 
            draw(); 
            requestAnimationFrame(gameLoop);
        }
        
        gameLoop();
export function initGame() {
    // TODO: Import/init player, enemies, UI, etc.
    // TODO: Set up canvas, start game loop
    console.log('Game initialized');
  }