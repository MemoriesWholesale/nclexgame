// js/levels/level_6.js
// Physiological Adaptation Level - Body Systems & Critical Care Theme

const level = {
    id: 6,
    name: "Physiological Adaptation",
    theme: "intensive_care_unit",
    color: '#DA70D6', // Orchid for complex medical systems
    questionFile: 'data/physiological_adaptation.json',
    worldLength: 15000,
    
    // Starting configuration
    playerStart: { x: 100, y: 'ground-0' },
    
    // Vital sign zones - player must maintain homeostasis
    vitalZones: [
        { id: 'cardiac_zone', startX: 1500, endX: 2500, type: 'cardiac',
          heartRate: 60, targetRange: [60, 100], arrhythmiaRisk: true },
        { id: 'respiratory_zone', startX: 3000, endX: 4000, type: 'respiratory',
          respRate: 12, targetRange: [12, 20], o2Sat: 95 },
        { id: 'renal_zone', startX: 4500, endX: 5500, type: 'renal',
          fluidBalance: 0, urineOutput: 30, targetOutput: [30, 80] },
        { id: 'neurologic_zone', startX: 6000, endX: 7000, type: 'neurologic',
          consciousness: 15, glasgowScale: true, icpLevel: 10 },
        { id: 'metabolic_zone', startX: 7500, endX: 8500, type: 'metabolic',
          bloodSugar: 100, pH: 7.4, electrolytes: 'balanced' },
        { id: 'shock_zone', startX: 9000, endX: 10000, type: 'shock',
          perfusion: 50, shockType: 'progressive', compensating: false }
    ],
    
    // Platforms
    platforms: [
        // --- SECTION 1: CARDIAC RHYTHM ---
        // Platforms that beat like a heart rhythm
        { id: 'cardiac_platform_1', x: 1600, y: 'ground-150', width: 80, height: 20, type: 'rhythmic', 
          activated: true, rhythm: 'normal_sinus', beatInterval: 1000 },
        { id: 'cardiac_platform_2', x: 1800, y: 'ground-200', width: 80, height: 20, type: 'rhythmic', 
          activated: true, rhythm: 'normal_sinus', beatInterval: 1000, offset: 250 },
        { id: 'cardiac_platform_3', x: 2000, y: 'ground-250', width: 80, height: 20, type: 'rhythmic', 
          activated: true, rhythm: 'normal_sinus', beatInterval: 1000, offset: 500 },
        { id: 'cardiac_platform_4', x: 2200, y: 'ground-200', width: 80, height: 20, type: 'rhythmic', 
          activated: true, rhythm: 'normal_sinus', beatInterval: 1000, offset: 750 },
        
        // Arrhythmia platforms (irregular patterns)
        { id: 'afib_platform', x: 1900, y: 'ground-350', width: 100, height: 20, type: 'rhythmic', 
          activated: true, rhythm: 'atrial_fib', irregular: true },
        
        // NPC Benefit: Pacemaker platform (stable rhythm)
        { id: 'pacemaker_bridge', x: 1600, y: 'ground-400', width: 700, height: 20, type: 'static', 
          activated: false, stabilizesRhythm: true },
        
        // --- SECTION 2: RESPIRATORY MECHANICS ---
        // Platforms that expand/contract like lungs breathing
        { id: 'lung_platform_1', x: 3100, y: 'ground-150', width: 60, height: 20, type: 'breathing', 
          activated: true, expansionRate: 2, maxWidth: 120, minWidth: 60 },
        { id: 'lung_platform_2', x: 3300, y: 'ground-200', width: 60, height: 20, type: 'breathing', 
          activated: true, expansionRate: 2, maxWidth: 120, minWidth: 60, offset: 1000 },
        { id: 'lung_platform_3', x: 3500, y: 'ground-250', width: 60, height: 20, type: 'breathing', 
          activated: true, expansionRate: 2, maxWidth: 120, minWidth: 60, offset: 2000 },
        
        // Hypoxia platforms (fade based on O2 levels)
        { id: 'hypoxic_platform_1', x: 3700, y: 'ground-300', width: 100, height: 20, type: 'oxygen_dependent', 
          activated: true, minO2: 90, currentO2: 95 },
        { id: 'hypoxic_platform_2', x: 3850, y: 'ground-350', width: 100, height: 20, type: 'oxygen_dependent', 
          activated: true, minO2: 92, currentO2: 95 },
        
        // NPC Benefit: Ventilator support
        { id: 'ventilator_bridge', x: 3100, y: 'ground-450', width: 850, height: 20, type: 'static', 
          activated: false, providesO2: true },
        
        // --- SECTION 3: FLUID & ELECTROLYTE BALANCE ---
        // Platforms affected by fluid levels
        { id: 'fluid_platform_1', x: 4600, y: 'ground-150', width: 100, height: 20, type: 'fluid_sensitive', 
          activated: true, currentFluid: 50, sinks: true },
        { id: 'fluid_platform_2', x: 4800, y: 'ground-200', width: 100, height: 20, type: 'fluid_sensitive', 
          activated: true, currentFluid: 50, sinks: true },
        { id: 'fluid_platform_3', x: 5000, y: 'ground-250', width: 100, height: 20, type: 'fluid_sensitive', 
          activated: true, currentFluid: 50, sinks: true },
        
        // Electrolyte gates (require balance to pass)
        { id: 'sodium_gate', x: 5200, y: 'ground-300', width: 20, height: 100, type: 'electrolyte_gate', 
          activated: true, electrolyte: 'sodium', required: 140 },
        { id: 'potassium_gate', x: 5350, y: 'ground-300', width: 20, height: 100, type: 'electrolyte_gate', 
          activated: true, electrolyte: 'potassium', required: 4.0 },
        
        // NPC Benefit: Dialysis platform
        { id: 'dialysis_bridge', x: 4600, y: 'ground-400', width: 800, height: 20, type: 'static', 
          activated: false, balancesFluid: true },
        
        // --- SECTION 4: NEUROLOGICAL PATHWAYS ---
        // Platforms that test reflexes and consciousness
        { id: 'reflex_platform_1', x: 6100, y: 'ground-150', width: 80, height: 20, type: 'reflex_test', 
          activated: true, responseTime: 500, disappearsOnFail: true },
        { id: 'reflex_platform_2', x: 6250, y: 'ground-200', width: 80, height: 20, type: 'reflex_test', 
          activated: true, responseTime: 400, disappearsOnFail: true },
        { id: 'reflex_platform_3', x: 6400, y: 'ground-250', width: 80, height: 20, type: 'reflex_test', 
          activated: true, responseTime: 300, disappearsOnFail: true },
        
        // ICP (Intracranial Pressure) sensitive platforms
        { id: 'icp_platform_1', x: 6600, y: 'ground-300', width: 100, height: 20, type: 'icp_sensitive', 
          activated: true, maxICP: 20, breaksAbove: true },
        { id: 'icp_platform_2', x: 6800, y: 'ground-350', width: 100, height: 20, type: 'icp_sensitive', 
          activated: true, maxICP: 15, breaksAbove: true },
        
        // NPC Benefit: Neuro stabilizer
        { id: 'neuro_bridge', x: 6100, y: 'ground-450', width: 800, height: 20, type: 'static', 
          activated: false, stabilizesNeuro: true },
        
        // --- SECTION 5: METABOLIC BALANCE ---
        // pH-sensitive platforms
        { id: 'acidic_platform_1', x: 7600, y: 'ground-150', width: 80, height: 20, type: 'pH_sensitive', 
          activated: true, idealPH: 7.4, currentPH: 7.2, damageRate: 1 },
        { id: 'neutral_platform_1', x: 7750, y: 'ground-200', width: 80, height: 20, type: 'pH_sensitive', 
          activated: true, idealPH: 7.4, currentPH: 7.4, damageRate: 0 },
        { id: 'alkaline_platform_1', x: 7900, y: 'ground-250', width: 80, height: 20, type: 'pH_sensitive', 
          activated: true, idealPH: 7.4, currentPH: 7.6, damageRate: 1 },
        
        // Glucose-powered platforms
        { id: 'glucose_platform_1', x: 8050, y: 'ground-300', width: 100, height: 20, type: 'glucose_powered', 
          activated: true, requiredGlucose: 100, depletes: true },
        { id: 'glucose_platform_2', x: 8200, y: 'ground-350', width: 100, height: 20, type: 'glucose_powered', 
          activated: true, requiredGlucose: 120, depletes: true },
        
        // NPC Benefit: Metabolic stabilizer
        { id: 'metabolic_bridge', x: 7600, y: 'ground-450', width: 700, height: 20, type: 'static', 
          activated: false, balancesMetabolism: true },
        
        // --- SECTION 6: SHOCK RESPONSE ---
        // Compensatory mechanism platforms
        { id: 'compensation_platform_1', x: 9100, y: 'ground-150', width: 100, height: 20, type: 'shock_response', 
          activated: true, mechanism: 'vasoconstriction', effectiveness: 100 },
        { id: 'compensation_platform_2', x: 9300, y: 'ground-200', width: 100, height: 20, type: 'shock_response', 
          activated: true, mechanism: 'tachycardia', effectiveness: 75 },
        { id: 'compensation_platform_3', x: 9500, y: 'ground-250', width: 100, height: 20, type: 'shock_response', 
          activated: true, mechanism: 'increased_resp', effectiveness: 50 },
        
        // Perfusion-dependent platforms
        { id: 'perfusion_platform_1', x: 9700, y: 'ground-300', width: 100, height: 20, type: 'perfusion_dependent', 
          activated: true, minPerfusion: 60, fades: true },
        { id: 'perfusion_platform_2', x: 9900, y: 'ground-350', width: 100, height: 20, type: 'perfusion_dependent', 
          activated: true, minPerfusion: 40, fades: true },
        
        // NPC Benefit: Resuscitation platform
        { id: 'resuscitation_bridge', x: 9100, y: 'ground-450', width: 900, height: 20, type: 'static', 
          activated: false, restoresPerfusion: true },
        
        // --- SECTION 7: MULTI-ORGAN FAILURE CASCADE ---
        // Platforms representing organ systems failing in sequence
        { id: 'organ_platform_heart', x: 10500, y: 'ground-200', width: 80, height: 20, type: 'organ_system', 
          activated: true, organ: 'heart', failureTime: 5000 },
        { id: 'organ_platform_lungs', x: 10650, y: 'ground-250', width: 80, height: 20, type: 'organ_system', 
          activated: true, organ: 'lungs', failureTime: 4000 },
        { id: 'organ_platform_kidneys', x: 10800, y: 'ground-300', width: 80, height: 20, type: 'organ_system', 
          activated: true, organ: 'kidneys', failureTime: 3000 },
        { id: 'organ_platform_liver', x: 10950, y: 'ground-250', width: 80, height: 20, type: 'organ_system', 
          activated: true, organ: 'liver', failureTime: 2000 },
        { id: 'organ_platform_brain', x: 11100, y: 'ground-200', width: 80, height: 20, type: 'organ_system', 
          activated: true, organ: 'brain', failureTime: 1000 },
        
        // NPC Benefit: Life support system
        { id: 'life_support_bridge', x: 10500, y: 'ground-400', width: 600, height: 20, type: 'static', 
          activated: false, preventsOrganFailure: true },
        
        // Pre-boss arena
        { id: 'pre_boss_platform', x: 11500, y: 'ground-100', width: 300, height: 20, type: 'static', activated: true },
        { id: 'boss_arena', x: 12000, y: 'ground-0', width: 2000, height: 20, type: 'static', activated: true }
    ],
    
    // NPCs - ICU specialists
    npcs: [
        { id: 'cardiologist', type: 'specialist', x: 1400, y: 'ground-60', 
          dialogue: "Arrhythmias ahead! Let me stabilize the cardiac rhythm.", 
          activates: 'pacemaker_bridge' },
        
        { id: 'respiratory_therapist', type: 'respiratory_therapist', x: 2900, y: 'ground-60', 
          dialogue: "O2 sats dropping! Initiating ventilator support.", 
          activates: 'ventilator_bridge' },
        
        { id: 'nephrologist', type: 'specialist', x: 4400, y: 'ground-60', 
          dialogue: "Fluid overload detected. Starting dialysis protocol.", 
          activates: 'dialysis_bridge' },
        
        { id: 'neurologist', type: 'specialist', x: 5900, y: 'ground-60', 
          dialogue: "ICP rising dangerously! Administering neuroprotective measures.", 
          activates: 'neuro_bridge' },
        
        { id: 'endocrinologist', type: 'specialist', x: 7400, y: 'ground-60', 
          dialogue: "Metabolic crisis! Balancing pH and glucose levels.", 
          activates: 'metabolic_bridge' },
        
        { id: 'intensivist', type: 'doctor', x: 8900, y: 'ground-60', 
          dialogue: "Patient in shock! Initiating aggressive resuscitation.", 
          activates: 'resuscitation_bridge' },
        
        { id: 'critical_care_nurse', type: 'nurse', x: 10300, y: 'ground-60', 
          dialogue: "Multi-organ failure imminent! Activating life support.", 
          activates: 'life_support_bridge' },
        
        { id: 'icu_director', type: 'doctor', x: 11400, y: 'pre_boss_platform-top', 
          dialogue: "The Homeostasis Boss disrupts all body systems. Maintain balance!", 
          givesItem: 'adaptation_boost' }
    ],
    
    // Hazards
    hazards: [
        { type: 'pit', x: 1300, width: 200 },
        // **FIX**: Reduced from 400px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 2600, width: 200 },
        // **FIX**: Reduced from 400px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 4100, width: 200 },
        // **FIX**: Reduced from 400px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 5600, width: 200 },
        // **FIX**: Reduced from 400px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 7100, width: 200 },
        // **FIX**: Reduced from 400px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 8600, width: 200 },
        // **FIX**: Reduced from 400px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 10100, width: 200 },
        
        // Acid-base imbalance zones
        { id: 'acidosis_zone', type: 'pH_hazard', x: 7800, y: 'ground-0', 
          width: 200, height: 100, pH: 7.2, damage: true },
        { id: 'alkalosis_zone', type: 'pH_hazard', x: 8100, y: 'ground-0', 
          width: 200, height: 100, pH: 7.6, damage: true }
    ],
    
    // Vital sign pickups
    vitalPickups: [
        { type: 'oxygen_tank', x: 3200, y: 'ground-30', increases: 'o2Sat', value: 10 },
        { type: 'IV_fluid', x: 4700, y: 'ground-30', increases: 'fluidBalance', value: 500 },
        { type: 'electrolyte_pack', x: 5100, y: 'ground-30', balances: 'electrolytes' },
        { type: 'glucose_gel', x: 7700, y: 'ground-30', increases: 'bloodSugar', value: 30 },
        { type: 'vasopressor', x: 9200, y: 'ground-30', increases: 'perfusion', value: 20 }
    ],
    
    // Items
    items: [
        { type: 'chest', x: 1350, y: 'ground-200', contains: 'defibrillator', requiresQuestion: true },
        { type: 'chest', x: 2400, y: 'ground-450', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 3950, y: 'ground-500', contains: 'ventilator_upgrade', requiresQuestion: true },
        { type: 'chest', x: 5400, y: 'ground-450', contains: 'weapon_upgrade', weaponId: 3, requiresQuestion: true },
        { type: 'health_pack', x: 6900, y: 'ground-30' },
        { type: 'chest', x: 8300, y: 'ground-500', contains: 'insulin_pump', requiresQuestion: true },
        { type: 'chest', x: 10000, y: 'ground-500', contains: 'extra_life', requiresQuestion: true },
        { type: 'health_pack', x: 11200, y: 'ground-30' }
    ],
    
    // Enemy waves - System failures
    enemyWaves: [
        { triggerX: 1700, enemies: [
            { type: 'arrhythmia', x: 1750, y: 'ground-0', hp: 2, irregular: true },
            { type: 'pvc', x: 1850, y: 'ground-0', skips: true }
        ]},
        { triggerX: 3400, enemies: [
            { type: 'hypoxia', x: 3450, y: 'ground-0', hp: 3, drains: 'o2' },
            { type: 'apnea', x: 3550, y: 'ground-0', stops: true }
        ]},
        { triggerX: 5000, enemies: [
            { type: 'edema', x: 5050, y: 'ground-0', hp: 3, slows: true },
            { type: 'dehydration', x: 5150, y: 'ground-0', speed: 4 }
        ]},
        { triggerX: 6700, enemies: [
            { type: 'seizure', x: 6750, y: 'ground-0', hp: 4, shakes: true },
            { type: 'paralysis', x: 6850, y: 'ground-0', freezes: true }
        ]},
        { triggerX: 9600, enemies: [
            { type: 'shock_wave', x: 9650, y: 'ground-0', hp: 5, aoe: true },
            { type: 'organ_failure', x: 9750, y: 'ground-0', hp: 4, cascades: true }
        ]}
    ],
    
    // Boss configuration - Homeostasis Boss
    boss: {
        triggerX: 13000,
        x: 13300,
        y: 'ground-150',
        type: 'homeostasis_boss',
        hp: 45,
        phases: [
            { 
                hpThreshold: 45, 
                attacks: ['system_imbalance'], 
                speed: 2, 
                message: 'Homeostasis disrupted! All systems destabilizing!',
                effect: 'vital_fluctuation'
            },
            { 
                hpThreshold: 35, 
                attacks: ['cardiac_arrest', 'respiratory_failure'], 
                speed: 2.5, 
                message: 'Cardiopulmonary collapse imminent!',
                effect: 'hypoxia'
            },
            { 
                hpThreshold: 25, 
                attacks: ['metabolic_storm', 'neural_cascade'], 
                speed: 3, 
                message: 'Metabolic crisis! Neural pathways failing!',
                effect: 'acidosis'
            },
            { 
                hpThreshold: 15, 
                attacks: ['multi_organ_failure'], 
                speed: 3.5, 
                message: 'Complete system failure! Life support critical!',
                effect: 'organ_shutdown'
            },
            { 
                hpThreshold: 5, 
                attacks: ['final_compensation'], 
                speed: 4, 
                message: 'Body entering final compensation! Survive the cascade!',
                effect: 'all_systems_critical'
            }
        ]
    }
};

export default level;