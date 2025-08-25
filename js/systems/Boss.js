/**
 * Boss system - Handles boss sprite rendering, animations, and behaviors
 */
export class Boss {
    constructor(levelId, x, y, bossData, bossAnimations) {
        this.levelId = levelId;
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 120;
        this.vx = -2;
        this.facing = levelId === 0 ? 1 : -1; // Level 0 boss faces right, others face left
        
        // Boss data from constants
        this.name = bossData.name;
        this.type = bossData.type;
        this.maxHp = bossData.maxHp;
        this.hp = this.maxHp;
        this.attackPattern = bossData.attackPattern;
        
        // Animation properties
        this.animations = bossAnimations[`level_${levelId}`];
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 8; // Frames per animation frame
        
        // Sprite loading
        this.sprite = new Image();
        this.sprite.src = `assets/bosses/level_${levelId}_boss.png`;
        this.spriteLoaded = false;
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        };
        
        // Attack properties
        this.attackTimer = 0;
        this.attackCooldown = 180; // 3 seconds at 60fps
        this.isAttacking = false;
        this.attackDuration = 60; // 1 second attack animation
        
        // State properties
        this.hurtTimer = 0;
        this.isDying = false;
        this.deathTimer = 0;
        this.deathDuration = 240; // 4 seconds death animation
        
        // Level-specific properties
        if (levelId === 0) {
            this.attackPhase = 'idle';
            this.attackPhaseTimer = 0;
            this.projectileActive = false;
            this.projectileTimer = 0;
            this.dashActive = false;
            this.dashTimer = 0;
            this.dashSpeed = 12;
            this.dashDirection = 1;
            this.phaseSequence = ['projectile', 'dash'];
            this.currentPhaseIndex = 0;
            this.phaseCooldown = 120; // 2 seconds between attacks
            this.pendingProjectile = null; // For boss projectile system
        } else if (levelId === 1) {
            this.attackPhase = 'idle';
            this.attackPhaseTimer = 0;
            this.phaseSequence = ['aerial_attack', 'stationary_projectile', 'high_jump'];
            this.currentPhaseIndex = 0;
            this.phaseCooldown = 150; // 2.5 seconds between attacks
            this.jumpHeight = 0;
            this.jumpSpeed = 0;
            this.isJumping = false;
            this.projectileShowerTimer = 0;
            this.projectileShowerCount = 0;
            this.pendingProjectile = null;
            this.pendingProjectileShower = [];
        } else if (levelId === 2) {
            this.attackPhase = 'idle';
            this.attackPhaseTimer = 0;
            this.phaseSequence = ['slow_projectile', 'quick_projectile', 'special_attack'];
            this.currentPhaseIndex = 0;
            this.phaseCooldown = 120; // 2 seconds between attacks
            this.pendingProjectile = null;
            this.specialAttackTimer = 0;
        } else if (levelId === 3) {
            this.attackPhase = 'basic_idle';
            this.attackPhaseTimer = 0;
            this.idleType = 'basic'; // 'basic' or 'extended'
            this.phaseSequence = ['simple_melee', 'electrical_attack', 'powerful_melee', 'rush_attack'];
            this.currentPhaseIndex = 0;
            this.phaseCooldown = 100; // 1.5 seconds between attacks
            this.tendrilActive = false;
            this.electricalTimer = 0;
            this.rushDirection = 1;
            this.rushSpeed = 8;
        } else if (levelId === 4) {
            this.attackPhase = 'idle';
            this.attackPhaseTimer = 0;
            this.phaseSequence = ['attack_1', 'attack_2', 'attack_3'];
            this.currentPhaseIndex = 0;
            this.phaseCooldown = 90; // 1.5 seconds between attacks
            this.flickerSpeed = 6; // Fast flickering for attacks 1 & 2
        } else if (levelId === 5) {
            this.attackPhase = 'idle';
            this.attackPhaseTimer = 0;
            this.phaseSequence = ['attack_1', 'attack_2'];
            this.currentPhaseIndex = 0;
            this.phaseCooldown = 140; // 2.3 seconds between attacks (longer for extended idle)
            this.extendedIdleDuration = 210; // 3.5 seconds for long idle cycle
        } else if (levelId === 6) {
            this.attackPhase = 'idle_moving';
            this.attackPhaseTimer = 0;
            this.phaseSequence = ['rush_attack', 'strong_melee'];
            this.currentPhaseIndex = 0;
            this.phaseCooldown = 120; // 2 seconds between attacks
            this.idleMovingDuration = 180; // 3 seconds for idle/moving cycle
            this.rushSpeed = 10;
            this.rushDirection = 1;
        } else if (levelId === 7) {
            this.attackPhase = 'idle_moving';
            this.attackPhaseTimer = 0;
            this.phaseSequence = ['quick_attack_1', 'quick_attack_2', 'long_attack'];
            this.currentPhaseIndex = 0;
            this.phaseCooldown = 100; // 1.7 seconds between attacks  
            this.idleMovingDuration = 200; // 3.3 seconds for long idle cycle (10 frames)
            this.isFinalBoss = true; // Special final boss flag
        }
    }
    
    /**
     * Update boss behavior, animations, and attacks
     */
    update(player, canvas) {
        if (this.isDying) {
            this.updateDeath();
            return;
        }
        
        if (this.hp <= 0 && !this.isDying) {
            this.startDeath();
            return;
        }
        
        // Update hurt state
        if (this.hurtTimer > 0) {
            this.hurtTimer--;
            this.currentAnimation = 'hurt';
        } else {
            // Normal behavior
            this.updateMovement(canvas);
            this.updateAttack(player);
        }
        
        this.updateAnimation();
    }
    
    /**
     * Update boss movement patterns
     */
    updateMovement(canvas) {
        // Basic horizontal movement
        this.x += this.vx;
        
        // Bounce off screen edges
        if (this.x <= 100 || this.x >= canvas.width - 100 - this.width) {
            this.vx = -this.vx;
            this.facing = this.vx > 0 ? 1 : -1;
        }
    }
    
    /**
     * Update attack behavior
     */
    updateAttack(player) {
        // Level-specific attack patterns
        if (this.levelId === 0) {
            this.updateLevel0Attack(player);
            return;
        } else if (this.levelId === 1) {
            this.updateLevel1Attack(player);
            return;
        } else if (this.levelId === 2) {
            this.updateLevel2Attack(player);
            return;
        } else if (this.levelId === 3) {
            this.updateLevel3Attack(player);
            return;
        } else if (this.levelId === 4) {
            this.updateLevel4Attack(player);
            return;
        } else if (this.levelId === 5) {
            this.updateLevel5Attack(player);
            return;
        } else if (this.levelId === 6) {
            this.updateLevel6Attack(player);
            return;
        } else if (this.levelId === 7) {
            this.updateLevel7Attack(player);
            return;
        }
        
        // Default attack behavior for other levels
        if (this.isAttacking) {
            this.attackTimer--;
            this.currentAnimation = 'attack';
            
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.attackTimer = this.attackCooldown;
            }
        } else {
            this.attackTimer--;
            this.currentAnimation = 'idle';
            
            // Start attack if timer reached and player is in range
            if (this.attackTimer <= 0 && this.isPlayerInRange(player)) {
                this.startAttack(player);
            }
        }
    }
    
    /**
     * Level 0 specific attack behavior with projectile and dash attacks
     */
    updateLevel0Attack(player) {
        this.attackPhaseTimer++;
        
        switch (this.attackPhase) {
            case 'idle':
                this.currentAnimation = 'idle';
                if (this.attackPhaseTimer >= this.phaseCooldown) {
                    // Start next attack in sequence
                    const nextAttack = this.phaseSequence[this.currentPhaseIndex];
                    this.startLevel0Attack(nextAttack, player);
                    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phaseSequence.length;
                }
                break;
                
            case 'projectile_init':
                this.currentAnimation = 'projectile_init';
                if (this.attackPhaseTimer >= 30) { // Half second init
                    this.attackPhase = 'projectile_active';
                    this.attackPhaseTimer = 0;
                    this.spawnProjectile(player);
                    this.projectileActive = true;
                    this.projectileTimer = 120; // 2 seconds projectile duration
                }
                break;
                
            case 'projectile_active':
                this.currentAnimation = 'projectile_active';
                this.projectileTimer--;
                if (this.projectileTimer <= 0) {
                    this.attackPhase = 'projectile_end';
                    this.attackPhaseTimer = 0;
                    this.projectileActive = false;
                }
                break;
                
            case 'projectile_end':
                this.currentAnimation = 'projectile_end';
                if (this.attackPhaseTimer >= 20) { // Brief end animation
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                }
                break;
                
            case 'dash_start':
                this.currentAnimation = 'dash_start';
                if (this.attackPhaseTimer >= 20) { // Brief start animation
                    this.attackPhase = 'dash_active';
                    this.attackPhaseTimer = 0;
                    this.dashActive = true;
                    this.dashTimer = 60; // 1 second dash
                    this.dashDirection = player.x > this.x ? 1 : -1;
                }
                break;
                
            case 'dash_active':
                this.currentAnimation = 'dash_active';
                this.x += this.dashSpeed * this.dashDirection;
                this.dashTimer--;
                if (this.dashTimer <= 0) {
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                    this.dashActive = false;
                }
                break;
        }
    }
    
    /**
     * Start level 0 specific attack
     */
    startLevel0Attack(attackType, player) {
        this.attackPhaseTimer = 0;
        this.animationFrame = 0;
        
        if (attackType === 'projectile') {
            this.attackPhase = 'projectile_init';
        } else if (attackType === 'dash') {
            this.attackPhase = 'dash_start';
        }
    }
    
    /**
     * Level 1 specific attack behavior with aerial, projectile, and high jump attacks
     */
    updateLevel1Attack(player) {
        this.attackPhaseTimer++;
        
        switch (this.attackPhase) {
            case 'idle':
                this.currentAnimation = 'idle';
                if (this.attackPhaseTimer >= this.phaseCooldown) {
                    const nextAttack = this.phaseSequence[this.currentPhaseIndex];
                    this.startLevel1Attack(nextAttack, player);
                    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phaseSequence.length;
                }
                break;
                
            case 'aerial_attack':
                this.currentAnimation = 'aerial_attack';
                this.projectileShowerTimer++;
                
                // Spawn projectiles during aerial attack
                if (this.projectileShowerTimer % 15 === 0 && this.projectileShowerCount < 8) {
                    this.spawnAerialProjectile(player);
                    this.projectileShowerCount++;
                }
                
                if (this.attackPhaseTimer >= 120) { // 2 seconds
                    this.attackPhase = 'post_attack_idle';
                    this.attackPhaseTimer = 0;
                    this.projectileShowerTimer = 0;
                    this.projectileShowerCount = 0;
                }
                break;
                
            case 'post_attack_idle':
                this.currentAnimation = 'post_attack_idle';
                if (this.attackPhaseTimer >= 60) { // 1 second
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                }
                break;
                
            case 'stationary_projectile':
                this.currentAnimation = 'stationary_projectile';
                if (this.attackPhaseTimer === 30) {
                    this.spawnProjectile(player);
                }
                if (this.attackPhaseTimer >= 90) { // 1.5 seconds
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                }
                break;
                
            case 'high_jump':
                this.currentAnimation = 'high_jump';
                this.jumpHeight += this.jumpSpeed;
                this.jumpSpeed -= 0.5; // Gravity
                this.y -= this.jumpSpeed;
                
                if (this.attackPhaseTimer >= 120) { // 2 seconds
                    this.attackPhase = 'high_jump_landing';
                    this.attackPhaseTimer = 0;
                }
                break;
                
            case 'high_jump_landing':
                this.currentAnimation = 'high_jump_landing';
                if (this.attackPhaseTimer >= 40) { // Brief landing animation
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                    this.jumpHeight = 0;
                    this.jumpSpeed = 0;
                }
                break;
        }
    }
    
    /**
     * Start level 1 specific attack
     */
    startLevel1Attack(attackType, player) {
        this.attackPhaseTimer = 0;
        this.animationFrame = 0;
        
        if (attackType === 'aerial_attack') {
            this.attackPhase = 'aerial_attack';
            this.projectileShowerTimer = 0;
            this.projectileShowerCount = 0;
        } else if (attackType === 'stationary_projectile') {
            this.attackPhase = 'stationary_projectile';
        } else if (attackType === 'high_jump') {
            this.attackPhase = 'high_jump';
            this.jumpSpeed = 15; // Initial jump velocity
            this.jumpHeight = 0;
        }
    }
    
    /**
     * Spawn aerial projectile for level 1
     */
    spawnAerialProjectile(player) {
        // Add to projectile shower array
        this.pendingProjectileShower.push({
            x: this.x + Math.random() * this.width,
            y: this.y,
            targetX: player.x + Math.random() * player.width,
            targetY: player.y,
            speed: 3 + Math.random() * 2
        });
    }
    
    /**
     * Level 2 specific attack behavior with slow/quick projectile sequences and special attack
     */
    updateLevel2Attack(player) {
        this.attackPhaseTimer++;
        
        switch (this.attackPhase) {
            case 'idle':
                this.currentAnimation = 'idle';
                if (this.attackPhaseTimer >= this.phaseCooldown) {
                    const nextAttack = this.phaseSequence[this.currentPhaseIndex];
                    this.startLevel2Attack(nextAttack, player);
                    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phaseSequence.length;
                }
                break;
                
            case 'slow_projectile':
                this.currentAnimation = 'slow_projectile';
                // Slow sequence: b3→a3→c1→b1→b2→a2 (6 frames)
                // Spawn projectile on specific frames
                if (this.attackPhaseTimer === 30 || this.attackPhaseTimer === 90) {
                    this.spawnProjectile(player);
                }
                
                if (this.attackPhaseTimer >= 180) { // 3 seconds for slow sequence
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                }
                break;
                
            case 'quick_projectile':
                this.currentAnimation = 'quick_projectile';
                // Quick sequence: e2→d2→c2 (3 frames)
                if (this.attackPhaseTimer === 15) {
                    this.spawnProjectile(player);
                }
                
                if (this.attackPhaseTimer >= 60) { // 1 second for quick sequence
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                }
                break;
                
            case 'special_attack':
                this.currentAnimation = 'special_attack';
                this.specialAttackTimer++;
                
                // Hold the pose for extended time
                if (this.attackPhaseTimer >= 120) { // 2 seconds special attack
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                    this.specialAttackTimer = 0;
                }
                break;
        }
    }
    
    /**
     * Start level 2 specific attack
     */
    startLevel2Attack(attackType, player) {
        this.attackPhaseTimer = 0;
        this.animationFrame = 0;
        
        if (attackType === 'slow_projectile') {
            this.attackPhase = 'slow_projectile';
            this.animationSpeed = 20; // Slower animation for slow sequence
        } else if (attackType === 'quick_projectile') {
            this.attackPhase = 'quick_projectile';
            this.animationSpeed = 8; // Faster animation for quick sequence
        } else if (attackType === 'special_attack') {
            this.attackPhase = 'special_attack';
            this.specialAttackTimer = 0;
            this.animationSpeed = 8; // Normal speed
        }
    }
    
    /**
     * Level 3 specific attack behavior with tendril attacks and electrical effects
     */
    updateLevel3Attack(player) {
        this.attackPhaseTimer++;
        
        switch (this.attackPhase) {
            case 'basic_idle':
            case 'extended_idle':
                // Switch between basic and extended idle randomly
                if (this.attackPhaseTimer === 1) {
                    this.idleType = Math.random() > 0.6 ? 'extended' : 'basic';
                    this.currentAnimation = this.idleType === 'basic' ? 'basic_idle' : 'extended_idle';
                }
                
                if (this.attackPhaseTimer >= this.phaseCooldown) {
                    const nextAttack = this.phaseSequence[this.currentPhaseIndex];
                    this.startLevel3Attack(nextAttack, player);
                    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phaseSequence.length;
                }
                break;
                
            case 'simple_melee':
                this.currentAnimation = 'simple_melee';
                this.tendrilActive = true;
                
                if (this.attackPhaseTimer >= 60) { // 1 second tendril attack
                    this.attackPhase = 'basic_idle';
                    this.attackPhaseTimer = 0;
                    this.tendrilActive = false;
                }
                break;
                
            case 'electrical_attack':
                this.currentAnimation = 'electrical_attack';
                this.electricalTimer++;
                
                // Electrical effect could damage nearby objects
                if (this.electricalTimer % 30 === 0) {
                    this.createElectricalField(player);
                }
                
                if (this.attackPhaseTimer >= 90) { // 1.5 second electrical attack
                    this.attackPhase = 'basic_idle';
                    this.attackPhaseTimer = 0;
                    this.electricalTimer = 0;
                }
                break;
                
            case 'powerful_melee':
                this.currentAnimation = 'powerful_melee';
                this.tendrilActive = true;
                
                if (this.attackPhaseTimer >= 80) { // 1.3 second powerful attack
                    this.attackPhase = 'basic_idle';
                    this.attackPhaseTimer = 0;
                    this.tendrilActive = false;
                }
                break;
                
            case 'rush_attack':
                this.currentAnimation = 'rush_attack';
                
                // Move boss during rush attack
                this.x += this.rushSpeed * this.rushDirection;
                
                // Change direction if hitting walls or player proximity
                if (this.x <= 100 || this.x >= 800) {
                    this.rushDirection = -this.rushDirection;
                }
                
                if (this.attackPhaseTimer >= 100) { // 1.7 second rush attack
                    this.attackPhase = 'basic_idle';
                    this.attackPhaseTimer = 0;
                }
                break;
        }
    }
    
    /**
     * Start level 3 specific attack
     */
    startLevel3Attack(attackType, player) {
        this.attackPhaseTimer = 0;
        this.animationFrame = 0;
        
        if (attackType === 'simple_melee') {
            this.attackPhase = 'simple_melee';
        } else if (attackType === 'electrical_attack') {
            this.attackPhase = 'electrical_attack';
            this.electricalTimer = 0;
        } else if (attackType === 'powerful_melee') {
            this.attackPhase = 'powerful_melee';
        } else if (attackType === 'rush_attack') {
            this.attackPhase = 'rush_attack';
            this.rushDirection = player.x > this.x ? 1 : -1;
        }
    }
    
    /**
     * Create electrical field effect for level 3
     */
    createElectricalField(player) {
        // Create area effect around boss
        this.pendingElectricalField = {
            x: this.x - 50,
            y: this.y - 30,
            width: this.width + 100,
            height: this.height + 60,
            duration: 30, // Half second effect
            damage: 1
        };
    }
    
    /**
     * Level 4 specific attack behavior with flickering and sequential attacks
     */
    updateLevel4Attack(player) {
        this.attackPhaseTimer++;
        
        switch (this.attackPhase) {
            case 'idle':
                this.currentAnimation = 'idle';
                if (this.attackPhaseTimer >= this.phaseCooldown) {
                    const nextAttack = this.phaseSequence[this.currentPhaseIndex];
                    this.startLevel4Attack(nextAttack, player);
                    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phaseSequence.length;
                }
                break;
                
            case 'attack_1':
                this.currentAnimation = 'attack_1';
                // Fast flickering between b1 and c1
                this.animationSpeed = this.flickerSpeed;
                
                if (this.attackPhaseTimer >= 90) { // 1.5 second flickering attack
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                    this.animationSpeed = 8; // Reset to normal speed
                }
                break;
                
            case 'attack_2':
                this.currentAnimation = 'attack_2';
                // Fast flickering between b3 and c1
                this.animationSpeed = this.flickerSpeed;
                
                if (this.attackPhaseTimer >= 90) { // 1.5 second flickering attack
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                    this.animationSpeed = 8; // Reset to normal speed
                }
                break;
                
            case 'attack_3':
                this.currentAnimation = 'attack_3';
                // Sequential: a1→a2→c3
                this.animationSpeed = 15; // Slower for sequential attack
                
                if (this.attackPhaseTimer >= 120) { // 2 second sequential attack
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                    this.animationSpeed = 8; // Reset to normal speed
                }
                break;
        }
    }
    
    /**
     * Start level 4 specific attack
     */
    startLevel4Attack(attackType, player) {
        this.attackPhaseTimer = 0;
        this.animationFrame = 0;
        this.attackPhase = attackType;
        
        // Set appropriate animation speeds
        if (attackType === 'attack_1' || attackType === 'attack_2') {
            this.animationSpeed = this.flickerSpeed; // Fast flickering
        } else if (attackType === 'attack_3') {
            this.animationSpeed = 15; // Slower sequential
        }
    }
    
    /**
     * Level 5 specific attack behavior with extended idle cycle and two related attacks
     */
    updateLevel5Attack(player) {
        this.attackPhaseTimer++;
        
        switch (this.attackPhase) {
            case 'idle':
                this.currentAnimation = 'idle';
                // Extended idle cycle takes longer to complete
                if (this.attackPhaseTimer >= this.extendedIdleDuration) {
                    const nextAttack = this.phaseSequence[this.currentPhaseIndex];
                    this.startLevel5Attack(nextAttack, player);
                    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phaseSequence.length;
                }
                break;
                
            case 'attack_1':
                this.currentAnimation = 'attack_1';
                // Short attack: c2→d1→b2
                this.animationSpeed = 12; // Moderate speed for 3-frame sequence
                
                if (this.attackPhaseTimer >= 72) { // 1.2 seconds for short attack
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                    this.animationSpeed = 10; // Reset to slower idle speed
                }
                break;
                
            case 'attack_2':
                this.currentAnimation = 'attack_2';
                // Extended attack: c2→d1→d2→d3
                this.animationSpeed = 15; // Slower for 4-frame sequence
                
                if (this.attackPhaseTimer >= 120) { // 2 seconds for extended attack
                    this.attackPhase = 'idle';
                    this.attackPhaseTimer = 0;
                    this.animationSpeed = 10; // Reset to slower idle speed
                }
                break;
        }
    }
    
    /**
     * Start level 5 specific attack
     */
    startLevel5Attack(attackType, player) {
        this.attackPhaseTimer = 0;
        this.animationFrame = 0;
        this.attackPhase = attackType;
        
        // Set appropriate animation speeds
        if (attackType === 'attack_1') {
            this.animationSpeed = 12; // Moderate speed for short attack
        } else if (attackType === 'attack_2') {
            this.animationSpeed = 15; // Slower for extended attack
        }
    }
    
    /**
     * Level 6 specific attack behavior with idle/moving cycle and simple melee attacks
     */
    updateLevel6Attack(player) {
        this.attackPhaseTimer++;
        
        switch (this.attackPhase) {
            case 'idle_moving':
                this.currentAnimation = 'idle_moving';
                // Long idle/moving cycle through many frames
                if (this.attackPhaseTimer >= this.idleMovingDuration) {
                    const nextAttack = this.phaseSequence[this.currentPhaseIndex];
                    this.startLevel6Attack(nextAttack, player);
                    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phaseSequence.length;
                }
                break;
                
            case 'rush_attack':
                this.currentAnimation = 'rush_attack';
                
                // Move boss during rush attack
                this.x += this.rushSpeed * this.rushDirection;
                
                // Bounce off walls or change direction toward player
                if (this.x <= 100 || this.x >= 800) {
                    this.rushDirection = -this.rushDirection;
                }
                
                if (this.attackPhaseTimer >= 60) { // 1 second rush
                    this.attackPhase = 'idle_moving';
                    this.attackPhaseTimer = 0;
                }
                break;
                
            case 'strong_melee':
                this.currentAnimation = 'strong_melee';
                // 2-frame melee attack: d2→d3
                this.animationSpeed = 10; // Moderate speed for strong attack
                
                if (this.attackPhaseTimer >= 80) { // 1.3 seconds for strong melee
                    this.attackPhase = 'idle_moving';
                    this.attackPhaseTimer = 0;
                    this.animationSpeed = 8; // Reset to normal speed
                }
                break;
        }
    }
    
    /**
     * Start level 6 specific attack
     */
    startLevel6Attack(attackType, player) {
        this.attackPhaseTimer = 0;
        this.animationFrame = 0;
        this.attackPhase = attackType;
        
        if (attackType === 'rush_attack') {
            // Set rush direction toward player
            this.rushDirection = player.x > this.x ? 1 : -1;
        } else if (attackType === 'strong_melee') {
            this.animationSpeed = 10; // Moderate speed for melee
        }
    }
    
    /**
     * Level 7 specific attack behavior - Final Boss with quick attacks and long sequence
     */
    updateLevel7Attack(player) {
        this.attackPhaseTimer++;
        
        switch (this.attackPhase) {
            case 'idle_moving':
                this.currentAnimation = 'idle_moving';
                // Long idle/moving cycle through 10 frames for dramatic effect
                if (this.attackPhaseTimer >= this.idleMovingDuration) {
                    const nextAttack = this.phaseSequence[this.currentPhaseIndex];
                    this.startLevel7Attack(nextAttack, player);
                    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phaseSequence.length;
                }
                break;
                
            case 'quick_attack_1':
                this.currentAnimation = 'quick_attack_1';
                // Quick single-frame attack (a2)
                
                if (this.attackPhaseTimer >= 30) { // Half second quick attack
                    this.attackPhase = 'idle_moving';
                    this.attackPhaseTimer = 0;
                }
                break;
                
            case 'quick_attack_2':
                this.currentAnimation = 'quick_attack_2';
                // Quick single-frame attack (a3)
                
                if (this.attackPhaseTimer >= 30) { // Half second quick attack
                    this.attackPhase = 'idle_moving';
                    this.attackPhaseTimer = 0;
                }
                break;
                
            case 'long_attack':
                this.currentAnimation = 'long_attack';
                // Long sequence: b1→b4→c4→d3
                this.animationSpeed = 18; // Slower for dramatic 4-frame sequence
                
                if (this.attackPhaseTimer >= 144) { // 2.4 seconds for long attack
                    this.attackPhase = 'idle_moving';
                    this.attackPhaseTimer = 0;
                    this.animationSpeed = 12; // Reset to moderate idle speed
                }
                break;
        }
    }
    
    /**
     * Start level 7 specific attack
     */
    startLevel7Attack(attackType, player) {
        this.attackPhaseTimer = 0;
        this.animationFrame = 0;
        this.attackPhase = attackType;
        
        if (attackType === 'long_attack') {
            this.animationSpeed = 18; // Slower for dramatic long attack
        } else {
            // Quick attacks use normal speed
            this.animationSpeed = 8;
        }
    }
    
    /**
     * Check if player is in attack range
     */
    isPlayerInRange(player) {
        const distance = Math.abs(player.x - this.x);
        return distance < 300; // Attack range
    }
    
    /**
     * Start attack sequence
     */
    startAttack(player) {
        this.isAttacking = true;
        this.attackTimer = this.attackDuration;
        this.currentAnimation = 'attack';
        this.animationFrame = 0; // Reset attack animation
        
        // Execute attack based on pattern
        this.executeAttackPattern(player);
    }
    
    /**
     * Execute specific attack pattern
     */
    executeAttackPattern(player) {
        switch (this.attackPattern) {
            case 'swipe':
                // Simple melee attack - damage handled in collision
                break;
            case 'projectile':
                // Spawn projectile attack
                this.spawnProjectile(player);
                break;
            case 'area_damage':
                // Area of effect attack
                this.createAreaAttack();
                break;
            case 'charge':
                // Charge toward player
                this.chargeAtPlayer(player);
                break;
            case 'confusion':
                // Confuse player controls
                this.confusePlayer(player);
                break;
            case 'environmental':
                // Modify environment
                this.environmentalAttack();
                break;
            case 'multi_phase':
                // Multi-phase attack based on health
                this.multiPhaseAttack(player);
                break;
            case 'debuff':
                // Apply debuff to player
                this.debuffPlayer(player);
                break;
        }
    }
    
    /**
     * Spawn projectile attack
     */
    spawnProjectile(player) {
        // This will be handled by the main game loop
        this.pendingProjectile = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            targetX: player.x + player.width / 2,
            targetY: player.y + player.height / 2,
            speed: 5
        };
    }
    
    /**
     * Create area damage attack
     */
    createAreaAttack() {
        this.pendingAreaAttack = {
            x: this.x - 100,
            y: this.y,
            width: this.width + 200,
            height: this.height,
            duration: 60 // 1 second
        };
    }
    
    /**
     * Charge at player
     */
    chargeAtPlayer(player) {
        const direction = player.x > this.x ? 1 : -1;
        this.vx = direction * 8; // Faster movement during charge
        this.chargeTimer = 30; // Charge for 0.5 seconds
    }
    
    /**
     * Confuse player controls
     */
    confusePlayer(player) {
        player.invertedControls = true;
        // Effect will wear off after time
        setTimeout(() => {
            player.invertedControls = false;
        }, 3000);
    }
    
    /**
     * Environmental attack
     */
    environmentalAttack() {
        // Shake screen or create environmental hazards
        this.screenShake = 30;
    }
    
    /**
     * Multi-phase attack based on health percentage
     */
    multiPhaseAttack(player) {
        const healthPercent = this.hp / this.maxHp;
        
        if (healthPercent > 0.7) {
            this.spawnProjectile(player);
        } else if (healthPercent > 0.3) {
            this.createAreaAttack();
        } else {
            this.chargeAtPlayer(player);
        }
    }
    
    /**
     * Apply debuff to player
     */
    debuffPlayer(player) {
        player.speedMultiplier *= 0.5;
        player.jumpMultiplier *= 0.7;
        
        // Remove debuff after time
        setTimeout(() => {
            player.speedMultiplier = Math.min(player.speedMultiplier * 2, 1);
            player.jumpMultiplier = Math.min(player.jumpMultiplier / 0.7, 1);
        }, 5000);
    }
    
    /**
     * Start death sequence
     */
    startDeath() {
        this.isDying = true;
        this.deathTimer = this.deathDuration;
        this.currentAnimation = 'death';
        this.animationFrame = 0;
        this.vx = 0; // Stop movement
    }
    
    /**
     * Update death animation
     */
    updateDeath() {
        this.deathTimer--;
        this.currentAnimation = 'death';
        
        if (this.deathTimer <= 0) {
            this.isDestroyed = true;
        }
    }
    
    /**
     * Take damage and trigger hurt animation
     */
    takeDamage(damage = 1) {
        if (this.hurtTimer > 0 || this.isDying) return false;
        
        this.hp -= damage;
        this.hurtTimer = 20; // Brief hurt state
        
        return true; // Successfully took damage
    }
    
    /**
     * Update sprite animation
     */
    updateAnimation() {
        this.animationTimer++;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            
            const anim = this.animations[this.currentAnimation];
            if (anim) {
                this.animationFrame++;
                
                const maxFrames = Array.isArray(anim.frames) ? anim.frames.length : anim.frames;
                
                if (this.animationFrame >= maxFrames) {
                    if (this.currentAnimation === 'death' && this.isDying) {
                        // Stay on last frame of death animation
                        this.animationFrame = maxFrames - 1;
                    } else {
                        this.animationFrame = 0;
                    }
                }
            }
        }
    }
    
    /**
     * Render the boss with sprite animation
     */
    render(ctx) {
        if (!this.spriteLoaded) {
            // Fallback rendering - colored rectangle
            ctx.fillStyle = '#4B0082';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        
        const anim = this.animations[this.currentAnimation];
        if (!anim) return;
        
        // Calculate source position based on frame format
        let sourceX, sourceY, sourceWidth, sourceHeight;
        
        if (anim.irregular && anim.frameData) {
            // Irregular frame format with custom positioning
            const frameData = anim.frameData[this.animationFrame % anim.frameData.length];
            sourceX = frameData.x;
            sourceY = frameData.y;
            sourceWidth = frameData.width;
            sourceHeight = frameData.height;
        } else if (anim.isWide) {
            // Wide frame format (for level_3 tendril attacks)
            sourceX = anim.sourceX;
            sourceY = anim.sourceY;
            sourceWidth = anim.frameWidth;
            sourceHeight = anim.frameHeight;
        } else if (Array.isArray(anim.frames)) {
            // Regular frame array format - direct frame indices
            const frameIndex = anim.frames[this.animationFrame % anim.frames.length];
            const col = frameIndex % anim.cols;
            const row = Math.floor(frameIndex / anim.cols);
            sourceX = col * anim.frameWidth;
            sourceY = row * anim.frameHeight;
            sourceWidth = anim.frameWidth;
            sourceHeight = anim.frameHeight;
        } else {
            // Legacy row/column format
            const startCol = anim.startCol || 0;
            const currentCol = startCol + this.animationFrame;
            sourceX = currentCol * anim.frameWidth;
            sourceY = anim.row * anim.frameHeight;
            sourceWidth = anim.frameWidth;
            sourceHeight = anim.frameHeight;
        }
        
        ctx.save();
        
        // Flip sprite based on facing direction
        if (this.facing < 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.sprite,
                sourceX, sourceY, sourceWidth, sourceHeight,
                -this.x - this.width, this.y, this.width, this.height
            );
        } else {
            ctx.drawImage(
                this.sprite,
                sourceX, sourceY, sourceWidth, sourceHeight,
                this.x, this.y, this.width, this.height
            );
        }
        
        ctx.restore();
        
        // Hurt flash effect
        if (this.hurtTimer > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    /**
     * Get collision bounds
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Check collision with another object
     */
    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}