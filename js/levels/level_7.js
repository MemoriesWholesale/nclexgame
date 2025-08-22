// js/levels/level_7.js
// Health Promotion and Maintenance Level - Lifecycle & Prevention Theme

const level = {
    id: 7,
    name: "Health Promotion and Maintenance",
    theme: "community_health_center",
    color: '#A52A2A', // Brown for earth/growth/lifecycle
    questionFile: 'data/health_promotion_and_maintenance.json',
    worldLength: 16000,
    
    // Starting configuration
    playerStart: { x: 100, y: 'ground-0' },
    
    // Lifecycle zones - different stages of life with unique mechanics
    lifecycleZones: [
        { id: 'prenatal', startX: 500, endX: 1500, stage: 'prenatal',
          mechanics: 'protective_bubble', hazards: 'teratogens' },
        { id: 'infant', startX: 2000, endX: 3000, stage: 'infant',
          mechanics: 'crawling', milestones: ['rolling', 'sitting', 'crawling'] },
        { id: 'toddler', startX: 3500, endX: 4500, stage: 'toddler',
          mechanics: 'exploration', safety: 'childproofing' },
        { id: 'child', startX: 5000, endX: 6000, stage: 'child',
          mechanics: 'growth_spurts', education: 'health_habits' },
        { id: 'adolescent', startX: 6500, endX: 7500, stage: 'adolescent',
          mechanics: 'risk_taking', education: 'prevention' },
        { id: 'adult', startX: 8000, endX: 9000, stage: 'adult',
          mechanics: 'balance', screening: 'preventive_care' },
        { id: 'older_adult', startX: 9500, endX: 10500, stage: 'older_adult',
          mechanics: 'adaptation', focus: 'chronic_management' },
        { id: 'end_of_life', startX: 11000, endX: 12000, stage: 'end_of_life',
          mechanics: 'dignity', care: 'palliative' }
    ],
    
    // Platforms
    platforms: [
        // --- SECTION 1: PRENATAL DEVELOPMENT ---
        // Protected bubble platforms (safe from teratogens)
        { id: 'womb_platform_1', x: 600, y: 'ground-150', width: 100, height: 20, type: 'bubble', 
          activated: true, protection: 100, degradeRate: 1 },
        { id: 'womb_platform_2', x: 800, y: 'ground-200', width: 100, height: 20, type: 'bubble', 
          activated: true, protection: 100, degradeRate: 1 },
        { id: 'womb_platform_3', x: 1000, y: 'ground-250', width: 100, height: 20, type: 'bubble', 
          activated: true, protection: 100, degradeRate: 1 },
        { id: 'nutrition_platform_1', x: 1200, y: 'ground-200', width: 120, height: 20, type: 'nutrient', 
          activated: true, provides: 'folic_acid' },
        { id: 'prenatal_exit', x: 1400, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        
        // --- SECTION 2: INFANT MILESTONES ---
        // Developmental milestone platforms
        { id: 'rolling_platform', x: 2100, y: 'ground-80', width: 150, height: 20, type: 'milestone', 
          activated: true, skill: 'rolling', rotates: true },
        { id: 'sitting_platform', x: 2350, y: 'ground-120', width: 80, height: 40, type: 'milestone', 
          activated: true, skill: 'sitting', stable: false },
        { id: 'crawling_tunnel', x: 2500, y: 'ground-60', width: 200, height: 60, type: 'milestone', 
          activated: true, skill: 'crawling', lowCeiling: true },
        { id: 'standing_platform', x: 2750, y: 'ground-150', width: 60, height: 20, type: 'milestone', 
          activated: true, skill: 'standing', wobbly: true },
        { id: 'first_steps', x: 2900, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        
        // --- SECTION 3: TODDLER EXPLORATION ---
        // Childproofed vs dangerous platforms
        { id: 'safe_play_1', x: 3600, y: 'ground-100', width: 100, height: 20, type: 'childproof', 
          activated: true, safe: true },
        { id: 'hazard_platform_1', x: 3750, y: 'ground-150', width: 80, height: 20, type: 'household_danger', 
          activated: true, hazard: 'sharp_edges', damage: true },
        { id: 'safe_play_2', x: 3900, y: 'ground-200', width: 100, height: 20, type: 'childproof', 
          activated: false },
        { id: 'hazard_platform_2', x: 4050, y: 'ground-150', width: 80, height: 20, type: 'household_danger', 
          activated: true, hazard: 'chemicals', damage: true },
        { id: 'safety_gate', x: 4200, y: 'ground-100', width: 20, height: 80, type: 'gate', 
          activated: false, blocks: true },
        { id: 'toddler_exit', x: 4350, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        
        // --- SECTION 4: CHILDHOOD GROWTH ---
        // Growth spurt platforms (change size)
        { id: 'growth_platform_1', x: 5100, y: 'ground-150', width: 80, height: 20, type: 'growth_spurt', 
          activated: true, growthRate: 1, maxHeight: 40 },
        { id: 'growth_platform_2', x: 5250, y: 'ground-200', width: 80, height: 20, type: 'growth_spurt', 
          activated: true, growthRate: 1.5, maxHeight: 60 },
        { id: 'nutrition_check_1', x: 5400, y: 'ground-250', width: 100, height: 20, type: 'health_check', 
          activated: true, requires: 'balanced_diet' },
        { id: 'exercise_platform', x: 5550, y: 'ground-300', width: 120, height: 20, type: 'activity', 
          activated: true, boosts: 'growth' },
        { id: 'immunization_platform', x: 5700, y: 'ground-250', width: 100, height: 20, type: 'prevention', 
          activated: false, provides: 'immunity' },
        { id: 'school_health', x: 5850, y: 'ground-150', width: 150, height: 20, type: 'static', activated: true },
        
        // --- SECTION 5: ADOLESCENT CHALLENGES ---
        // Risk-taking behavior platforms
        { id: 'peer_pressure_1', x: 6600, y: 'ground-150', width: 80, height: 20, type: 'social', 
          activated: true, influence: 'negative', pulls: true },
        { id: 'safe_choice_1', x: 6750, y: 'ground-200', width: 100, height: 20, type: 'decision', 
          activated: true, choice: 'positive' },
        { id: 'risky_platform_1', x: 6900, y: 'ground-100', width: 60, height: 20, type: 'risky', 
          activated: true, danger: 'high', reward: 'shortcut' },
        { id: 'education_platform', x: 7050, y: 'ground-250', width: 120, height: 20, type: 'prevention', 
          activated: false, teaches: 'safe_behaviors' },
        { id: 'peer_pressure_2', x: 7200, y: 'ground-150', width: 80, height: 20, type: 'social', 
          activated: true, influence: 'negative', pulls: true },
        { id: 'resilience_platform', x: 7350, y: 'ground-200', width: 100, height: 20, type: 'static', activated: false },
        
        // --- SECTION 6: ADULT WELLNESS ---
        // Work-life balance platforms
        { id: 'work_platform_1', x: 8100, y: 'ground-150', width: 100, height: 20, type: 'balance', 
          activated: true, aspect: 'work', drains: 'energy' },
        { id: 'rest_platform_1', x: 8250, y: 'ground-200', width: 100, height: 20, type: 'balance', 
          activated: true, aspect: 'rest', restores: 'energy' },
        { id: 'work_platform_2', x: 8400, y: 'ground-250', width: 100, height: 20, type: 'balance', 
          activated: true, aspect: 'work', drains: 'energy' },
        { id: 'exercise_adult', x: 8550, y: 'ground-300', width: 100, height: 20, type: 'balance', 
          activated: true, aspect: 'exercise', maintains: 'health' },
        { id: 'screening_platform', x: 8700, y: 'ground-250', width: 120, height: 20, type: 'prevention', 
          activated: false, screening: 'cancer' },
        { id: 'wellness_center', x: 8850, y: 'ground-150', width: 150, height: 20, type: 'static', activated: true },
        
        // --- SECTION 7: OLDER ADULT ADAPTATION ---
        // Assistive device platforms
        { id: 'handrail_platform_1', x: 9600, y: 'ground-150', width: 100, height: 20, type: 'assisted', 
          activated: true, aid: 'handrail', stability: true },
        { id: 'vision_platform', x: 9750, y: 'ground-200', width: 80, height: 20, type: 'sensory', 
          activated: true, challenge: 'low_vision', dim: true },
        { id: 'hearing_platform', x: 9900, y: 'ground-250', width: 80, height: 20, type: 'sensory', 
          activated: true, challenge: 'hearing_loss', muffled: true },
        { id: 'medication_platform', x: 10050, y: 'ground-200', width: 100, height: 20, type: 'chronic_care', 
          activated: true, management: 'polypharmacy' },
        { id: 'social_platform', x: 10200, y: 'ground-150', width: 120, height: 20, type: 'social', 
          activated: false, provides: 'connection' },
        { id: 'independence_platform', x: 10350, y: 'ground-100', width: 150, height: 20, type: 'static', activated: true },
        
        // --- SECTION 8: END OF LIFE CARE ---
        // Dignity and comfort platforms
        { id: 'comfort_care_1', x: 11100, y: 'ground-150', width: 120, height: 20, type: 'palliative', 
          activated: true, focus: 'comfort', peaceful: true },
        { id: 'family_platform', x: 11250, y: 'ground-200', width: 100, height: 20, type: 'support', 
          activated: true, presence: 'family' },
        { id: 'spiritual_platform', x: 11400, y: 'ground-250', width: 100, height: 20, type: 'holistic', 
          activated: true, care: 'spiritual' },
        { id: 'legacy_platform', x: 11550, y: 'ground-200', width: 120, height: 20, type: 'meaning', 
          activated: true, creates: 'legacy' },
        { id: 'peaceful_transition', x: 11700, y: 'ground-150', width: 150, height: 20, type: 'static', 
          activated: true, gentle: true },
        
        // --- FINAL SECTION: PREVENTION GAUNTLET ---
        // Combination of all preventive measures
        { id: 'vaccine_platform', x: 12200, y: 'ground-200', width: 80, height: 20, type: 'prevention', 
          activated: true, protection: 'disease' },
        { id: 'screening_final', x: 12350, y: 'ground-250', width: 80, height: 20, type: 'prevention', 
          activated: true, detection: 'early' },
        { id: 'education_final', x: 12500, y: 'ground-300', width: 80, height: 20, type: 'prevention', 
          activated: true, knowledge: 'health_literacy' },
        { id: 'community_final', x: 12650, y: 'ground-250', width: 100, height: 20, type: 'prevention', 
          activated: true, support: 'community' },
        
        // Pre-boss arena
        { id: 'pre_boss_platform', x: 13000, y: 'ground-100', width: 300, height: 20, type: 'static', activated: true },
        { id: 'boss_arena', x: 13500, y: 'ground-0', width: 2000, height: 20, type: 'static', activated: true }
    ],
    
    // NPCs - Healthcare providers across lifespan
    npcs: [
        { id: 'obstetrician', type: 'doctor', x: 400, y: 'ground-60', 
          dialogue: "Prenatal care is crucial! Let me provide essential nutrients.", 
          givesItem: 'prenatal_vitamins' },
        
        { id: 'pediatrician', type: 'doctor', x: 1900, y: 'ground-60', 
          dialogue: "Developmental milestones are important markers. Keep practicing!", 
          teachesSkill: 'infant_care' },
        
        { id: 'child_safety_expert', type: 'specialist', x: 3400, y: 'ground-60', 
          dialogue: "Toddlers explore everything! Let me childproof this area.", 
          activates: 'safe_play_2,safety_gate', deactivates: 'hazard_platform_1,hazard_platform_2' },
        
        { id: 'school_nurse', type: 'nurse', x: 4900, y: 'ground-60', 
          dialogue: "Time for immunizations! This will protect you going forward.", 
          activates: 'immunization_platform' },
        
        { id: 'health_educator', type: 'educator', x: 6400, y: 'ground-60', 
          dialogue: "Adolescence brings challenges. Education prevents risky behaviors!", 
          activates: 'education_platform,resilience_platform' },
        
        { id: 'wellness_coach', type: 'coach', x: 7900, y: 'ground-60', 
          dialogue: "Adult health needs balance. Regular screening saves lives!", 
          activates: 'screening_platform' },
        
        { id: 'geriatrician', type: 'doctor', x: 9400, y: 'ground-60', 
          dialogue: "Aging requires adaptation. Social connection is vital!", 
          activates: 'social_platform' },
        
        { id: 'hospice_nurse', type: 'nurse', x: 10900, y: 'ground-60', 
          dialogue: "End-of-life care focuses on dignity and comfort. Peace is possible.", 
          providesAura: 'peaceful' },
        
        { id: 'public_health_nurse', type: 'nurse', x: 12900, y: 'pre_boss_platform-top', 
          dialogue: "The Disease Prevention Boss attacks across all life stages. Use prevention strategies!", 
          givesItem: 'prevention_shield' }
    ],
    
    // Health promotion items
    healthItems: [
        { type: 'prenatal_vitamin', x: 700, y: 'ground-30', effect: 'protects_bubble' },
        { type: 'growth_chart', x: 2200, y: 'ground-30', tracks: 'milestones' },
        { type: 'safety_lock', x: 3700, y: 'ground-30', childproofs: 'hazards' },
        { type: 'vaccine_record', x: 5200, y: 'ground-30', provides: 'immunity_boost' },
        { type: 'condom', x: 6700, y: 'ground-30', prevents: 'STI' },
        { type: 'mammogram_voucher', x: 8300, y: 'ground-30', enables: 'screening' },
        { type: 'walker', x: 9700, y: 'ground-30', assists: 'mobility' },
        { type: 'advance_directive', x: 11200, y: 'ground-30', ensures: 'dignity' }
    ],
    
    // Hazards
    hazards: [
        { type: 'pit', x: 1600, width: 400 },
        { type: 'pit', x: 3100, width: 400 },
        { type: 'pit', x: 4600, width: 400 },
        { type: 'pit', x: 6100, width: 400 },
        { type: 'pit', x: 7600, width: 400 },
        { type: 'pit', x: 9100, width: 300 },
        { type: 'pit', x: 10600, width: 400 },
        { type: 'pit', x: 11900, width: 300 },
        
        // Lifecycle-specific hazards
        { id: 'teratogen_1', type: 'teratogen', x: 900, y: 'ground-300', 
          damage: 'fetal', avoidable: true },
        { id: 'fall_hazard_1', type: 'fall_risk', x: 2600, y: 'ground-0', 
          affects: 'infant', preventable: true },
        { id: 'poison_hazard_1', type: 'poison', x: 3950, y: 'ground-0', 
          affects: 'toddler', childproofable: true },
        { id: 'peer_pressure_hazard', type: 'social_pressure', x: 6800, y: 'ground-0', 
          affects: 'adolescent', resistable: true },
        { id: 'chronic_disease_risk', type: 'lifestyle', x: 8600, y: 'ground-0', 
          affects: 'adult', preventable: true },
        { id: 'isolation_hazard', type: 'social_isolation', x: 10100, y: 'ground-0', 
          affects: 'older_adult', addressable: true }
    ],
    
    // Items
    items: [
        { type: 'chest', x: 1100, y: 'nutrition_platform_1-top', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 2850, y: 'standing_platform-top', contains: 'developmental_toy', requiresQuestion: true },
        { type: 'chest', x: 4100, y: 'ground-200', contains: 'safety_equipment', requiresQuestion: true },
        { type: 'chest', x: 5600, y: 'exercise_platform-top', contains: 'weapon_upgrade', weaponId: 2, requiresQuestion: true },
        { type: 'health_pack', x: 7100, y: 'ground-30' },
        { type: 'chest', x: 8600, y: 'screening_platform-top', contains: 'prevention_tool', requiresQuestion: true },
        { type: 'chest', x: 10000, y: 'medication_platform-top', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 11600, y: 'legacy_platform-top', contains: 'weapon_upgrade', weaponId: 8, requiresQuestion: true },
        { type: 'health_pack', x: 12800, y: 'ground-30' }
    ],
    
    // Enemy waves - Health threats across lifespan
    enemyWaves: [
        { triggerX: 1000, enemies: [
            { type: 'birth_complication', x: 1050, y: 'ground-0', hp: 2 },
            { type: 'genetic_disorder', x: 1150, y: 'ground-0', hp: 2 }
        ]},
        { triggerX: 2400, enemies: [
            { type: 'infection', x: 2450, y: 'ground-0', hp: 2, spreads: true },
            { type: 'developmental_delay', x: 2550, y: 'ground-0', slow: true }
        ]},
        { triggerX: 3800, enemies: [
            { type: 'accident', x: 3850, y: 'ground-0', hp: 3, fast: true },
            { type: 'poisoning', x: 3950, y: 'ground-0', toxic: true }
        ]},
        { triggerX: 5400, enemies: [
            { type: 'obesity', x: 5450, y: 'ground-0', hp: 3, slows: true },
            { type: 'cavity', x: 5550, y: 'ground-0', damage: 'persistent' }
        ]},
        { triggerX: 7000, enemies: [
            { type: 'addiction', x: 7050, y: 'ground-0', hp: 4, pulls: true },
            { type: 'STI', x: 7150, y: 'ground-0', spreads: true }
        ]},
        { triggerX: 8700, enemies: [
            { type: 'stress', x: 8750, y: 'ground-0', hp: 3, drains: true },
            { type: 'hypertension', x: 8850, y: 'ground-0', silent: true }
        ]},
        { triggerX: 10200, enemies: [
            { type: 'dementia', x: 10250, y: 'ground-0', hp: 4, confuses: true },
            { type: 'fall_risk', x: 10350, y: 'ground-0', trips: true }
        ]},
        { triggerX: 11800, enemies: [
            { type: 'depression', x: 11850, y: 'ground-0', hp: 3, isolates: true },
            { type: 'pain', x: 11950, y: 'ground-0', persistent: true }
        ]}
    ],
    
    // Boss configuration - Disease Prevention Boss
    boss: {
        triggerX: 14500,
        x: 14800,
        y: 'ground-150',
        type: 'disease_prevention_boss',
        hp: 50,
        phases: [
            { 
                hpThreshold: 50, 
                attacks: ['infectious_wave'], 
                speed: 2, 
                message: 'Preventable diseases emerging! Deploy immunization!',
                spawns: 'vaccine_preventable'
            },
            { 
                hpThreshold: 40, 
                attacks: ['lifestyle_disease_surge'], 
                speed: 2.5, 
                message: 'Chronic diseases developing! Promote healthy behaviors!',
                effect: 'lifestyle_drain'
            },
            { 
                hpThreshold: 30, 
                attacks: ['mental_health_crisis'], 
                speed: 3, 
                message: 'Mental health deteriorating! Activate support systems!',
                effect: 'isolation'
            },
            { 
                hpThreshold: 20, 
                attacks: ['accident_cascade'], 
                speed: 3.5, 
                message: 'Safety failures everywhere! Implement prevention measures!',
                spawns: 'environmental_hazards'
            },
            { 
                hpThreshold: 10, 
                attacks: ['pandemic_protocol'], 
                speed: 4, 
                message: 'Global health crisis! All prevention strategies critical!',
                effect: 'all_threats_active'
            }
        ]
    }
};

export default level;