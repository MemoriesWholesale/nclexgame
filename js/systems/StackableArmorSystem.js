/**
 * StackableArmorSystem - Manages Shield and Charge armor types
 * These armors stack with level armors for maximum 3 armor types equipped
 */
export class StackableArmorSystem {
    constructor() {
        // Define all 72 charge-up abilities (8 weapons × 9 armor combinations)
        // Armor combinations: 8 level armors + shield + charge
        this.chargeAbilities = this.initializeChargeAbilities();
    }
    
    /**
     * Initialize all 72 charge-up abilities
     */
    initializeChargeAbilities() {
        const abilities = {};
        
        // For each weapon (1-8)
        for (let weaponId = 1; weaponId <= 8; weaponId++) {
            abilities[weaponId] = {};
            
            // For each armor combination (0-8 level armors + shield + charge)
            for (let armorId = 0; armorId <= 8; armorId++) {
                const baseAbility = this.getBaseChargeAbility(weaponId);
                const armorModifier = this.getArmorModifier(armorId);
                
                abilities[weaponId][armorId] = {
                    name: `${armorModifier.prefix} ${baseAbility.name}`,
                    type: baseAbility.type,
                    power: baseAbility.power * armorModifier.powerMultiplier,
                    range: baseAbility.range * armorModifier.rangeMultiplier,
                    special: armorModifier.special || baseAbility.special,
                    projectileCount: Math.round(baseAbility.projectileCount * armorModifier.countMultiplier),
                    description: `${armorModifier.description} ${baseAbility.description}`
                };
            }
            
            // Shield armor combinations
            abilities[weaponId]['shield'] = {
                name: `Protective ${this.getBaseChargeAbility(weaponId).name}`,
                type: 'shield_enhanced',
                power: this.getBaseChargeAbility(weaponId).power * 1.2,
                range: this.getBaseChargeAbility(weaponId).range * 0.8,
                special: 'damage_absorption',
                projectileCount: this.getBaseChargeAbility(weaponId).projectileCount,
                description: `Defensive version with damage absorption`
            };
            
            // Charge armor combinations
            abilities[weaponId]['charge'] = {
                name: `Powered ${this.getBaseChargeAbility(weaponId).name}`,
                type: 'power_enhanced',
                power: this.getBaseChargeAbility(weaponId).power * 1.5,
                range: this.getBaseChargeAbility(weaponId).range * 1.3,
                special: 'energy_burst',
                projectileCount: this.getBaseChargeAbility(weaponId).projectileCount + 2,
                description: `High-powered version with energy burst`
            };
        }
        
        return abilities;
    }
    
    /**
     * Get base charge ability for each weapon type
     */
    getBaseChargeAbility(weaponId) {
        const baseAbilities = {
            1: { // Pill
                name: 'Pill Barrage',
                type: 'multi_projectile',
                power: 2.0,
                range: 1.0,
                projectileCount: 5,
                special: 'spread_pattern',
                description: 'fires multiple homing pills'
            },
            2: { // Syringe
                name: 'Precision Strike',
                type: 'piercing_beam',
                power: 3.0,
                range: 2.0,
                projectileCount: 1,
                special: 'armor_piercing',
                description: 'shoots a powerful piercing beam'
            },
            3: { // Stethoscope
                name: 'Sonic Pulse',
                type: 'area_effect',
                power: 2.5,
                range: 2.5,
                projectileCount: 1,
                special: 'expanding_wave',
                description: 'creates an expanding sonic wave'
            },
            4: { // Bandage
                name: 'Healing Wave',
                type: 'wave_attack',
                power: 2.0,
                range: 1.5,
                projectileCount: 3,
                special: 'healing_trail',
                description: 'launches healing wave projectiles'
            },
            5: { // Shears
                name: 'Razor Storm',
                type: 'spinning_attack',
                power: 2.8,
                range: 1.2,
                projectileCount: 8,
                special: 'spinning_blades',
                description: 'creates a storm of spinning razors'
            },
            6: { // Hammer
                name: 'Ground Pound',
                type: 'impact_wave',
                power: 4.0,
                range: 1.8,
                projectileCount: 1,
                special: 'shockwave',
                description: 'creates a devastating ground impact'
            },
            7: { // BP Monitor
                name: 'Data Burst',
                type: 'tracking_swarm',
                power: 1.8,
                range: 2.2,
                projectileCount: 12,
                special: 'auto_target',
                description: 'releases a swarm of tracking projectiles'
            },
            8: { // Bottle
                name: 'Liquid Explosion',
                type: 'area_burst',
                power: 3.5,
                range: 1.5,
                projectileCount: 1,
                special: 'chain_reaction',
                description: 'creates a devastating liquid explosion'
            }
        };
        
        return baseAbilities[weaponId] || baseAbilities[1];
    }
    
    /**
     * Get armor modifier effects for charge abilities
     */
    getArmorModifier(armorId) {
        const modifiers = {
            0: { // Default
                prefix: 'Basic',
                powerMultiplier: 1.0,
                rangeMultiplier: 1.0,
                countMultiplier: 1.0,
                description: 'standard power'
            },
            1: { // Coordinated Care
                prefix: 'Coordinated',
                powerMultiplier: 0.9,
                rangeMultiplier: 1.2,
                countMultiplier: 1.5,
                special: 'team_sync',
                description: 'enhanced teamwork effects'
            },
            2: { // Pharmacological
                prefix: 'Enhanced',
                powerMultiplier: 1.4,
                rangeMultiplier: 0.9,
                countMultiplier: 0.8,
                special: 'dose_concentration',
                description: 'concentrated pharmaceutical power'
            },
            3: { // Safety
                prefix: 'Safety',
                powerMultiplier: 0.8,
                rangeMultiplier: 1.1,
                countMultiplier: 1.2,
                special: 'non_lethal',
                description: 'safer but effective approach'
            },
            4: { // Risk Management
                prefix: 'Calculated',
                powerMultiplier: 1.2,
                rangeMultiplier: 1.1,
                countMultiplier: 1.0,
                special: 'precision_targeting',
                description: 'precisely calculated effects'
            },
            5: { // Psychological
                prefix: 'Therapeutic',
                powerMultiplier: 1.0,
                rangeMultiplier: 1.3,
                countMultiplier: 1.1,
                special: 'mental_influence',
                description: 'psychologically enhanced'
            },
            6: { // Basic Care
                prefix: 'Caring',
                powerMultiplier: 0.9,
                rangeMultiplier: 1.2,
                countMultiplier: 1.3,
                special: 'gentle_healing',
                description: 'gentle but persistent care'
            },
            7: { // Adaptive
                prefix: 'Adaptive',
                powerMultiplier: 1.1,
                rangeMultiplier: 1.0,
                countMultiplier: 1.2,
                special: 'smart_targeting',
                description: 'intelligently adapting effects'
            },
            8: { // Health Promotion
                prefix: 'Wellness',
                powerMultiplier: 0.7,
                rangeMultiplier: 1.4,
                countMultiplier: 1.4,
                special: 'health_boost',
                description: 'health-promoting effects'
            }
        };
        
        return modifiers[armorId] || modifiers[0];
    }
    
    /**
     * Get charge ability for current armor/weapon combination
     */
    getChargeAbility(weaponId, armorId, hasShield, hasCharge) {
        // Determine the effective armor combination
        let effectiveArmorId = armorId;
        
        if (hasShield && hasCharge) {
            // Both special armors - create hybrid ability
            const shieldAbility = this.chargeAbilities[weaponId]['shield'];
            const chargeAbility = this.chargeAbilities[weaponId]['charge'];
            const baseAbility = this.chargeAbilities[weaponId][armorId];
            
            return {
                name: `Fortified ${baseAbility.name}`,
                type: 'hybrid_enhanced',
                power: baseAbility.power * 1.3,
                range: baseAbility.range * 1.2,
                special: 'shield_and_power',
                projectileCount: baseAbility.projectileCount + 1,
                description: `Combined shield and power enhancement`
            };
        } else if (hasShield) {
            effectiveArmorId = 'shield';
        } else if (hasCharge) {
            effectiveArmorId = 'charge';
        }
        
        return this.chargeAbilities[weaponId][effectiveArmorId];
    }
    
    /**
     * Execute charge ability
     */
    executeChargeAbility(player, weaponId, armorId, hasShield, hasCharge, projectiles) {
        const ability = this.getChargeAbility(weaponId, armorId, hasShield, hasCharge);
        const weaponPos = player.getWeaponSpawnPos();
        
        switch (ability.type) {
            case 'multi_projectile':
                return this.createMultiProjectile(player, weaponPos, ability);
                
            case 'piercing_beam':
                return this.createPiercingBeam(player, weaponPos, ability);
                
            case 'area_effect':
                return this.createAreaEffect(player, weaponPos, ability);
                
            case 'wave_attack':
                return this.createWaveAttack(player, weaponPos, ability);
                
            case 'spinning_attack':
                return this.createSpinningAttack(player, weaponPos, ability);
                
            case 'impact_wave':
                return this.createImpactWave(player, weaponPos, ability);
                
            case 'tracking_swarm':
                return this.createTrackingSwarm(player, weaponPos, ability);
                
            case 'area_burst':
                return this.createAreaBurst(player, weaponPos, ability);
                
            case 'shield_enhanced':
            case 'power_enhanced':
            case 'hybrid_enhanced':
                // Enhanced versions of base abilities
                return this.createEnhancedAbility(player, weaponPos, ability);
        }
        
        return [];
    }
    
    /**
     * Create different types of charge projectiles
     */
    createMultiProjectile(player, weaponPos, ability) {
        const projectiles = [];
        const angleStep = Math.PI / 6; // 30 degrees between projectiles
        const baseAngle = -Math.PI / 2; // Start pointing up
        
        for (let i = 0; i < ability.projectileCount; i++) {
            const angle = baseAngle + (i - Math.floor(ability.projectileCount / 2)) * angleStep;
            projectiles.push({
                x: weaponPos.x,
                y: weaponPos.y,
                vx: Math.cos(angle) * 12 * ability.range,
                vy: Math.sin(angle) * 12 * ability.range,
                width: 25,
                height: 25,
                type: 'charge_ability',
                subtype: 'multi_pill',
                damageMultiplier: ability.power,
                homing: ability.special === 'spread_pattern',
                chargeAbility: true
            });
        }
        
        return projectiles;
    }
    
    createPiercingBeam(player, weaponPos, ability) {
        return [{
            x: weaponPos.x,
            y: weaponPos.y - 5,
            vx: player.facing * 20 * ability.range,
            vy: 0,
            width: 60,
            height: 8,
            type: 'charge_ability',
            subtype: 'piercing_beam',
            damageMultiplier: ability.power,
            piercing: true,
            chargeAbility: true
        }];
    }
    
    createAreaEffect(player, weaponPos, ability) {
        return [{
            centerX: weaponPos.centerX,
            centerY: weaponPos.centerY,
            radius: 80 * ability.range,
            angle: 0,
            rotSpeed: 0,
            type: 'charge_ability',
            subtype: 'sonic_pulse',
            damageMultiplier: ability.power,
            expanding: true,
            maxRadius: 200 * ability.range,
            chargeAbility: true
        }];
    }
    
    createWaveAttack(player, weaponPos, ability) {
        const projectiles = [];
        for (let i = 0; i < ability.projectileCount; i++) {
            projectiles.push({
                x: weaponPos.x + i * 40,
                y: weaponPos.y - 5,
                vx: player.facing * (8 + i * 2) * ability.range,
                vy: -5 - i * 2,
                width: 35,
                height: 12,
                type: 'charge_ability',
                subtype: 'healing_wave',
                damageMultiplier: ability.power,
                wavePhase: i * Math.PI / 4,
                chargeAbility: true
            });
        }
        return projectiles;
    }
    
    createSpinningAttack(player, weaponPos, ability) {
        const projectiles = [];
        for (let i = 0; i < ability.projectileCount; i++) {
            const angle = (Math.PI * 2 / ability.projectileCount) * i;
            projectiles.push({
                x: weaponPos.x,
                y: weaponPos.y,
                vx: Math.cos(angle) * 8 * ability.range,
                vy: Math.sin(angle) * 8 * ability.range,
                size: 20,
                angle: angle,
                rotSpeed: 0.3,
                type: 'charge_ability',
                subtype: 'spinning_blade',
                damageMultiplier: ability.power,
                chargeAbility: true
            });
        }
        return projectiles;
    }
    
    createImpactWave(player, weaponPos, ability) {
        return [{
            x: player.x - 100,
            y: player.y + player.height,
            vx: 0,
            vy: 0,
            width: 200,
            height: 20,
            type: 'charge_ability',
            subtype: 'ground_pound',
            damageMultiplier: ability.power,
            expanding: true,
            maxWidth: 400 * ability.range,
            chargeAbility: true
        }];
    }
    
    createTrackingSwarm(player, weaponPos, ability) {
        const projectiles = [];
        for (let i = 0; i < ability.projectileCount; i++) {
            const angle = (Math.PI * 2 / ability.projectileCount) * i;
            projectiles.push({
                x: weaponPos.x + Math.cos(angle) * 30,
                y: weaponPos.y + Math.sin(angle) * 30,
                vx: Math.cos(angle) * 6,
                vy: Math.sin(angle) * 6,
                width: 15,
                height: 15,
                type: 'charge_ability',
                subtype: 'tracking_dart',
                damageMultiplier: ability.power * 0.7, // Lower individual damage but more projectiles
                homing: true,
                chargeAbility: true
            });
        }
        return projectiles;
    }
    
    createAreaBurst(player, weaponPos, ability) {
        return [{
            x: weaponPos.x - 25,
            y: weaponPos.y - 25,
            vx: player.facing * 10,
            vy: -8,
            width: 50,
            height: 50,
            type: 'charge_ability',
            subtype: 'liquid_bomb',
            damageMultiplier: ability.power,
            explosive: true,
            explosionRadius: 120 * ability.range,
            chargeAbility: true
        }];
    }
    
    createEnhancedAbility(player, weaponPos, ability) {
        // Enhanced versions get special visual and mechanical effects
        const baseProjectiles = this.createMultiProjectile(player, weaponPos, ability);
        
        // Add enhancement effects
        baseProjectiles.forEach(proj => {
            if (ability.special === 'damage_absorption') {
                proj.absorbsDamage = true;
            }
            if (ability.special === 'energy_burst') {
                proj.energyTrail = true;
            }
            if (ability.special === 'shield_and_power') {
                proj.absorbsDamage = true;
                proj.energyTrail = true;
                proj.damageMultiplier *= 1.2;
            }
        });
        
        return baseProjectiles;
    }
}