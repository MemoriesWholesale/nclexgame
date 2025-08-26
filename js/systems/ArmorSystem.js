/**
 * ArmorSystem - Manages armor-weapon enhancement combinations
 * Each of the 8 armors provides unique upgrades to each of the 8 weapons
 */
export class ArmorSystem {
    constructor() {
        // 8x8 matrix of armor enhancements for weapons
        // armorEnhancements[armorId][weaponId] = enhancement object
        this.armorEnhancements = {
            // Armor 0: Default (no enhancements)
            0: {
                1: { name: 'Basic Pill', damage: 1, speed: 1, special: null },
                2: { name: 'Basic Syringe', damage: 1, speed: 1, special: null },
                3: { name: 'Basic Stethoscope', damage: 1, speed: 1, special: null },
                4: { name: 'Basic Bandage', damage: 1, speed: 1, special: null },
                5: { name: 'Basic Shears', damage: 1, speed: 1, special: null },
                6: { name: 'Basic Hammer', damage: 1, speed: 1, special: null },
                7: { name: 'Basic BP Monitor', damage: 1, speed: 1, special: null },
                8: { name: 'Basic Bottle', damage: 1, speed: 1, special: null }
            },
            
            // Armor 1: Coordinated Care Armor - Enhances coordination and teamwork
            1: {
                1: { name: 'Team Pill', damage: 1.2, speed: 1.1, special: 'split_shot' },
                2: { name: 'Coordinated Syringe', damage: 1.1, speed: 1.3, special: 'auto_aim' },
                3: { name: 'Team Stethoscope', damage: 1, speed: 1, special: 'wide_range' },
                4: { name: 'Care Bandage', damage: 1.1, speed: 1.2, special: 'healing_trail' },
                5: { name: 'Surgical Shears', damage: 1.3, speed: 1.1, special: 'precise_cut' },
                6: { name: 'Care Hammer', damage: 1.2, speed: 1, special: 'team_buff' },
                7: { name: 'Network Monitor', damage: 1, speed: 1.2, special: 'data_share' },
                8: { name: 'Support Bottle', damage: 1.1, speed: 1.1, special: 'multiple_drops' }
            },
            
            // Armor 2: Pharmacological Armor - Enhances drug effects
            2: {
                1: { name: 'Enhanced Pill', damage: 1.5, speed: 1, special: 'dose_stacking' },
                2: { name: 'IV Syringe', damage: 1.3, speed: 1.2, special: 'continuous_dose' },
                3: { name: 'Drug Monitor', damage: 1, speed: 1.1, special: 'toxicity_detect' },
                4: { name: 'Medicated Bandage', damage: 1.2, speed: 1, special: 'slow_release' },
                5: { name: 'Pill Shears', damage: 1.1, speed: 1.3, special: 'dose_splitting' },
                6: { name: 'Compounding Hammer', damage: 1.4, speed: 0.9, special: 'combo_effect' },
                7: { name: 'Pharma Monitor', damage: 1, speed: 1.2, special: 'interaction_alert' },
                8: { name: 'Med Bottle', damage: 1.2, speed: 1.1, special: 'concentrated' }
            },
            
            // Armor 3: Safety Armor - Prevents accidents and reduces risks
            3: {
                1: { name: 'Safety Pill', damage: 1, speed: 1.2, special: 'non_toxic' },
                2: { name: 'Safe Syringe', damage: 1.1, speed: 1.1, special: 'retractable' },
                3: { name: 'Alert Stethoscope', damage: 1, speed: 1, special: 'danger_sense' },
                4: { name: 'Sterile Bandage', damage: 1, speed: 1.3, special: 'infection_block' },
                5: { name: 'Safety Shears', damage: 1.1, speed: 1.2, special: 'blunt_tip' },
                6: { name: 'Safety Hammer', damage: 1.2, speed: 1, special: 'shock_absorb' },
                7: { name: 'Warning Monitor', damage: 1, speed: 1.4, special: 'early_alert' },
                8: { name: 'Childproof Bottle', damage: 1, speed: 1.1, special: 'tamper_proof' }
            },
            
            // Armor 4: Risk Management Armor - Assesses and mitigates risks
            4: {
                1: { name: 'Risk Pill', damage: 1.1, speed: 1, special: 'risk_assessment' },
                2: { name: 'Calculated Syringe', damage: 1.2, speed: 1.1, special: 'dose_calculation' },
                3: { name: 'Risk Stethoscope', damage: 1, speed: 1.1, special: 'pattern_recognition' },
                4: { name: 'Pressure Bandage', damage: 1.3, speed: 1, special: 'hemorrhage_control' },
                5: { name: 'Precision Shears', damage: 1.4, speed: 1, special: 'surgical_precision' },
                6: { name: 'Risk Hammer', damage: 1.1, speed: 1.2, special: 'calculated_force' },
                7: { name: 'Risk Monitor', damage: 1, speed: 1.3, special: 'predictive_analysis' },
                8: { name: 'Measured Bottle', damage: 1.2, speed: 1, special: 'controlled_release' }
            },
            
            // Armor 5: Psychological Armor - Mental health and cognitive support
            5: {
                1: { name: 'Psych Pill', damage: 1, speed: 1.2, special: 'mood_stabilizing' },
                2: { name: 'Therapeutic Syringe', damage: 1.1, speed: 1.3, special: 'anxiety_reducing' },
                3: { name: 'Empathy Stethoscope', damage: 1, speed: 1, special: 'emotional_insight' },
                4: { name: 'Comfort Bandage', damage: 1, speed: 1.4, special: 'pain_relief' },
                5: { name: 'Gentle Shears', damage: 1.2, speed: 1.1, special: 'trauma_informed' },
                6: { name: 'Therapy Hammer', damage: 1.3, speed: 0.9, special: 'breakthrough' },
                7: { name: 'Mental Monitor', damage: 1, speed: 1.2, special: 'cognitive_tracking' },
                8: { name: 'Calming Bottle', damage: 1, speed: 1.1, special: 'stress_reducing' }
            },
            
            // Armor 6: Basic Care Armor - Fundamental nursing care
            6: {
                1: { name: 'Care Pill', damage: 1.1, speed: 1.3, special: 'comfort_care' },
                2: { name: 'Gentle Syringe', damage: 1, speed: 1.4, special: 'painless_injection' },
                3: { name: 'Care Stethoscope', damage: 1, speed: 1.1, special: 'vital_monitoring' },
                4: { name: 'Healing Bandage', damage: 1.2, speed: 1.2, special: 'wound_healing' },
                5: { name: 'Care Shears', damage: 1, speed: 1.5, special: 'gentle_cutting' },
                6: { name: 'Comfort Hammer', damage: 1.1, speed: 1.3, special: 'positioning_aid' },
                7: { name: 'Basic Monitor', damage: 1, speed: 1.2, special: 'continuous_care' },
                8: { name: 'Hygiene Bottle', damage: 1, speed: 1.3, special: 'cleansing' }
            },
            
            // Armor 7: Adaptive Armor - Responds to changing conditions
            7: {
                1: { name: 'Adaptive Pill', damage: 1.3, speed: 1.1, special: 'dose_adjustment' },
                2: { name: 'Smart Syringe', damage: 1.2, speed: 1.2, special: 'auto_titration' },
                3: { name: 'Learning Stethoscope', damage: 1.1, speed: 1.2, special: 'pattern_learning' },
                4: { name: 'Smart Bandage', damage: 1.1, speed: 1.1, special: 'moisture_responsive' },
                5: { name: 'Variable Shears', damage: 1.2, speed: 1.3, special: 'adaptive_cutting' },
                6: { name: 'Flex Hammer', damage: 1.4, speed: 1, special: 'variable_force' },
                7: { name: 'AI Monitor', damage: 1, speed: 1.4, special: 'machine_learning' },
                8: { name: 'Smart Bottle', damage: 1.3, speed: 1, special: 'context_aware' }
            },
            
            // Armor 8: Health Promotion Armor - Preventive and wellness care
            8: {
                1: { name: 'Wellness Pill', damage: 1, speed: 1.1, special: 'health_boost' },
                2: { name: 'Prevention Syringe', damage: 1, speed: 1.2, special: 'immunization' },
                3: { name: 'Wellness Stethoscope', damage: 1, speed: 1.3, special: 'health_screening' },
                4: { name: 'Protective Bandage', damage: 1, speed: 1.1, special: 'barrier_protection' },
                5: { name: 'Wellness Shears', damage: 1.1, speed: 1.4, special: 'healthy_lifestyle' },
                6: { name: 'Exercise Hammer', damage: 1.2, speed: 1.2, special: 'strength_building' },
                7: { name: 'Health Monitor', damage: 1, speed: 1.1, special: 'wellness_tracking' },
                8: { name: 'Supplement Bottle', damage: 1.1, speed: 1.2, special: 'nutritional_boost' }
            }
        };
    }
    
    /**
     * Get enhancement for specific armor-weapon combination
     */
    getEnhancement(armorId, weaponId) {
        if (!this.armorEnhancements[armorId] || !this.armorEnhancements[armorId][weaponId]) {
            // Fallback to default armor enhancement
            return this.armorEnhancements[0][weaponId] || { name: 'Unknown', damage: 1, speed: 1, special: null };
        }
        return this.armorEnhancements[armorId][weaponId];
    }
    
    /**
     * Get all enhancements for a specific armor
     */
    getArmorEnhancements(armorId) {
        return this.armorEnhancements[armorId] || this.armorEnhancements[0];
    }
    
    /**
     * Apply special effects to projectile based on armor-weapon combination
     */
    applySpecialEffects(projectile, armorId, weaponId) {
        const enhancement = this.getEnhancement(armorId, weaponId);
        const special = enhancement.special;
        
        if (!special) return [projectile]; // Return single projectile in array
        
        switch (special) {
            case 'split_shot':
                // Team Pill splits into multiple projectiles
                return [
                    projectile,
                    { ...projectile, vy: projectile.vy - 2 },
                    { ...projectile, vy: projectile.vy + 2 }
                ];
                
            case 'auto_aim':
                // Coordinated Syringe has slight homing capability
                projectile.homing = true;
                break;
                
            case 'wide_range':
                // Team Stethoscope has larger hit area
                projectile.radius = 150; // Larger than default 120
                break;
                
            case 'healing_trail':
                // Care Bandage leaves healing effect
                projectile.healingTrail = true;
                break;
                
            case 'precise_cut':
                // Surgical Shears have enhanced accuracy
                projectile.vx *= 1.2;
                projectile.vy *= 1.2;
                break;
                
            case 'team_buff':
                // Care Hammer provides temporary team buff
                projectile.teamBuff = true;
                break;
                
            case 'data_share':
                // Network Monitor shares information
                projectile.infoSharing = true;
                break;
                
            case 'multiple_drops':
                // Support Bottle creates multiple drops
                projectile.dropsLeft = Math.max(8, projectile.dropsLeft || 5);
                break;
                
            case 'dose_stacking':
                // Enhanced Pill gets stronger with consecutive hits
                projectile.stackingDamage = true;
                break;
                
            case 'continuous_dose':
                // IV Syringe provides sustained effect
                projectile.sustainedEffect = true;
                break;
                
            case 'concentrated':
                // Med Bottle has concentrated formula
                projectile.width *= 1.3;
                projectile.height *= 1.3;
                break;
                
            // Add more special effects as needed...
            
            default:
                // Unknown special effect
                break;
        }
        
        return [projectile]; // Return single enhanced projectile in array
    }
    
    /**
     * Get damage multiplier for armor-weapon combination
     */
    getDamageMultiplier(armorId, weaponId) {
        const enhancement = this.getEnhancement(armorId, weaponId);
        return enhancement.damage || 1;
    }
    
    /**
     * Get speed multiplier for armor-weapon combination
     */
    getSpeedMultiplier(armorId, weaponId) {
        const enhancement = this.getEnhancement(armorId, weaponId);
        return enhancement.speed || 1;
    }
    
    /**
     * Get enhanced weapon name
     */
    getEnhancedWeaponName(armorId, weaponId) {
        const enhancement = this.getEnhancement(armorId, weaponId);
        return enhancement.name;
    }
}