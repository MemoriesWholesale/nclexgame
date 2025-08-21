// js/levels/level_3.js
// Risk Reduction Level - Fall Prevention & Hospital Safety Theme

const level = {
    id: 3,
    name: "Risk Reduction",
    theme: "fall_prevention",
    color: '#FFB6C1', // Light pink for safety/care
    questionFile: 'data/reduction_of_risk_potential.json',
    worldLength: 14000,
    
    // Starting configuration
    playerStart: { x: 100, y: 'ground-0' },
    
    // Platforms
    platforms: [
        // --- SECTION 1: FALL RISK ASSESSMENT ---
        // Tutorial area with stable platforms
        { id: 'stable_1', x: 250, y: 'ground-120', width: 150, height: 20, type: 'static', activated: true },
        { id: 'stable_2', x: 450, y: 'ground-180', width: 150, height: 20, type: 'static', activated: true },
        
        // Introduction to falling platforms
        { id: 'fall_platform_1', x: 700, y: 'ground-150', width: 100, height: 20, type: 'falling', 
          activated: true, fallDelay: 500, fallSpeed: 0, respawnTime: 3000 },
        { id: 'fall_platform_2', x: 850, y: 'ground-200', width: 100, height: 20, type: 'falling', 
          activated: true, fallDelay: 500, fallSpeed: 0, respawnTime: 3000 },
        { id: 'fall_platform_3', x: 1000, y: 'ground-250', width: 100, height: 20, type: 'falling', 
          activated: true, fallDelay: 500, fallSpeed: 0, respawnTime: 3000 },
        
        // Safe landing after falls
        { id: 'safe_landing_1', x: 1150, y: 'ground-100', width: 200, height: 20, type: 'static', activated: true },
        
        // --- SECTION 2: EQUIPMENT MALFUNCTION ZONE ---
        // Platforms that "malfunction" - move erratically when stepped on
        { id: 'malfunction_1', x: 1500, y: 'ground-150', width: 100, height: 20, type: 'malfunctioning', 
          activated: true, normalSpeed: 0, malfunctionSpeed: 3, axis: 'horizontal' },
        { id: 'malfunction_2', x: 1700, y: 'ground-200', width: 100, height: 20, type: 'malfunctioning', 
          activated: true, normalSpeed: 0, malfunctionSpeed: -2, axis: 'vertical' },
        { id: 'malfunction_3', x: 1900, y: 'ground-150', width: 100, height: 20, type: 'malfunctioning', 
          activated: true, normalSpeed: 0, malfunctionSpeed: 3, axis: 'horizontal' },
        
        // NPC Benefit: Fixed, stable platforms appear
        { id: 'fixed_platform_1', x: 1500, y: 'ground-300', width: 100, height: 20, type: 'static', activated: false },
        { id: 'fixed_platform_2', x: 1700, y: 'ground-350', width: 100, height: 20, type: 'static', activated: false },
        { id: 'fixed_platform_3', x: 1900, y: 'ground-300', width: 100, height: 20, type: 'static', activated: false },
        
        // --- SECTION 3: FALLING OBJECT GAUNTLET ---
        // Platforms with falling hazards from above
        { id: 'gauntlet_platform_1', x: 2500, y: 'ground-100', width: 150, height: 20, type: 'static', activated: true },
        { id: 'gauntlet_platform_2', x: 2700, y: 'ground-150', width: 150, height: 20, type: 'static', activated: true },
        { id: 'gauntlet_platform_3', x: 2900, y: 'ground-100', width: 150, height: 20, type: 'static', activated: true },
        
        // NPC Benefit: Protective ceiling that blocks falling objects
        { id: 'protective_ceiling_1', x: 2500, y: 'ground-400', width: 550, height: 10, type: 'static', 
          activated: false, visual: 'protective_barrier' },
        
        // --- SECTION 4: RUSHING HAZARD CORRIDOR ---
        // Long corridor with hazards that push player
        { id: 'corridor_floor', x: 3500, y: 'ground-0', width: 800, height: 20, type: 'static', activated: true },
        { id: 'safe_alcove_1', x: 3700, y: 'ground-100', width: 80, height: 100, type: 'static', activated: true },
        { id: 'safe_alcove_2', x: 3950, y: 'ground-100', width: 80, height: 100, type: 'static', activated: true },
        { id: 'safe_alcove_3', x: 4200, y: 'ground-100', width: 80, height: 100, type: 'static', activated: true },
        
        // --- SECTION 5: PATIENT MOBILITY ASSISTANCE ---
        // Platforms representing patient mobility devices
        { id: 'walker_platform_1', x: 4600, y: 'ground-150', width: 60, height: 20, type: 'slow_moving', 
          activated: true, movement: { startX: 4600, endX: 4800, speed: 0.5, horizontal: true } },
        { id: 'walker_platform_2', x: 4900, y: 'ground-200', width: 60, height: 20, type: 'slow_moving', 
          activated: true, movement: { startX: 4900, endX: 5100, speed: 0.5, horizontal: true } },
        
        // NPC Benefit: Fast wheelchair platforms
        { id: 'wheelchair_1', x: 4600, y: 'ground-300', width: 100, height: 20, type: 'moving', 
          activated: false, movement: { startX: 4600, endX: 5200, speed: 3, horizontal: true } },
        
        // --- SECTION 6: BED ALARM SYSTEM ---
        // Pressure-sensitive platforms that trigger alarms
        { id: 'bed_platform_1', x: 5500, y: 'ground-150', width: 120, height: 20, type: 'alarm', 
          activated: true, alarmDelay: 1000 },
        { id: 'bed_platform_2', x: 5700, y: 'ground-200', width: 120, height: 20, type: 'alarm', 
          activated: true, alarmDelay: 1000 },
        { id: 'bed_platform_3', x: 5900, y: 'ground-250', width: 120, height: 20, type: 'alarm', 
          activated: true, alarmDelay: 1000 },
        
        // NPC Benefit: Disables alarms
        { id: 'quiet_bridge', x: 5500, y: 'ground-350', width: 520, height: 20, type: 'static', activated: false },
        
        // --- SECTION 7: MEDICATION ERROR PREVENTION ---
        // Color-coded platforms that must be crossed in order
        { id: 'med_platform_red', x: 6500, y: 'ground-150', width: 80, height: 20, type: 'colored', 
          activated: true, color: 'red', order: 1 },
        { id: 'med_platform_blue', x: 6650, y: 'ground-200', width: 80, height: 20, type: 'colored', 
          activated: true, color: 'blue', order: 2 },
        { id: 'med_platform_green', x: 6800, y: 'ground-150', width: 80, height: 20, type: 'colored', 
          activated: true, color: 'green', order: 3 },
        
        // Wrong order causes platforms to become hazardous
        { id: 'safe_med_path', x: 6500, y: 'ground-350', width: 380, height: 20, type: 'static', activated: false },
        
        // --- SECTION 8: FINAL SAFETY ASSESSMENT ---
        // Combination of all hazards
        { id: 'final_challenge_1', x: 7500, y: 'ground-200', width: 100, height: 20, type: 'falling', 
          activated: true, fallDelay: 800, fallSpeed: 0, respawnTime: 2000 },
        { id: 'final_challenge_2', x: 7650, y: 'ground-250', width: 100, height: 20, type: 'malfunctioning', 
          activated: true, normalSpeed: 0, malfunctionSpeed: 2, axis: 'vertical' },
        { id: 'final_challenge_3', x: 7800, y: 'ground-200', width: 100, height: 20, type: 'falling', 
          activated: true, fallDelay: 800, fallSpeed: 0, respawnTime: 2000 },
        
        // Pre-boss arena
        { id: 'pre_boss_platform', x: 8200, y: 'ground-100', width: 300, height: 20, type: 'static', activated: true },
        { id: 'boss_arena', x: 8700, y: 'ground-0', width: 2000, height: 20, type: 'static', activated: true }
    ],
    
    // NPCs - Safety specialists
    npcs: [
        { id: 'fall_coordinator', type: 'fall_coordinator', x: 600, y: 'ground-60', 
          dialogue: "Those platforms ahead are unstable! Let me install safety rails.", 
          deactivates: 'falling_hazard_1', modifies: 'fall_platform_1,fall_platform_2,fall_platform_3' },
        
        { id: 'biomedical_engineer', type: 'engineer', x: 1400, y: 'ground-60', 
          dialogue: "Equipment malfunction detected! I'll provide stable alternatives.", 
          activates: 'fixed_platform_1,fixed_platform_2,fixed_platform_3' },
        
        { id: 'safety_officer_2', type: 'safety_officer', x: 2400, y: 'ground-60', 
          dialogue: "Falling debris ahead! Let me install protective barriers.", 
          activates: 'protective_ceiling_1', deactivates: 'falling_object_1,falling_object_2,falling_object_3' },
        
        { id: 'security_guard', type: 'security', x: 3400, y: 'ground-60', 
          dialogue: "That corridor has dangerous equipment rushes. I'll create safe zones.", 
          deactivates: 'rushing_hazard_1,rushing_hazard_2', activates: 'emergency_stops' },
        
        { id: 'physical_therapist_2', type: 'physical_therapist', x: 4500, y: 'ground-60', 
          dialogue: "Let me provide proper mobility assistance equipment!", 
          activates: 'wheelchair_1' },
        
        { id: 'nurse_manager', type: 'nurse', x: 5400, y: 'ground-60', 
          dialogue: "Those bed alarms are too sensitive. I'll adjust the system.", 
          deactivates: 'bed_alarms', activates: 'quiet_bridge' },
        
        { id: 'pharmacist_2', type: 'pharmacist', x: 6400, y: 'ground-60', 
          dialogue: "Medication order is critical! Let me provide a safe path.", 
          activates: 'safe_med_path' },
        
        { id: 'risk_manager', type: 'specialist', x: 8100, y: 'pre_boss_platform-top', 
          dialogue: "The Sentinel Event Boss ahead adapts to safety breaches. Stay alert!", 
          givesItem: 'safety_shield' }
    ],
    
    // Hazards
    hazards: [
        // Pits representing fall risks
        { type: 'pit', x: 1350, width: 150 },
        { type: 'pit', x: 2100, width: 400 },
        { type: 'pit', x: 3100, width: 400 },
        { type: 'pit', x: 4300, width: 300 },
        { type: 'pit', x: 6100, width: 400 },
        { type: 'pit', x: 6950, width: 550 },
        { type: 'pit', x: 7950, width: 250 },
        
        // Falling objects (deactivatable by NPCs)
        { id: 'falling_object_1', type: 'falling_object', x: 2600, y: 'ground-500', 
          timing: { interval: 2000, offset: 0 }, width: 40, height: 40, activated: true },
        { id: 'falling_object_2', type: 'falling_object', x: 2800, y: 'ground-500', 
          timing: { interval: 2000, offset: 667 }, width: 40, height: 40, activated: true },
        { id: 'falling_object_3', type: 'falling_object', x: 3000, y: 'ground-500', 
          timing: { interval: 2000, offset: 1333 }, width: 40, height: 40, activated: true },
        
        // Rushing hazards that push player
        { id: 'rushing_hazard_1', type: 'rushing_hazard', x: 3600, y: 'ground-50', 
          width: 60, height: 100, speed: 5, direction: 1, activated: true },
        { id: 'rushing_hazard_2', type: 'rushing_hazard', x: 4100, y: 'ground-50', 
          width: 60, height: 100, speed: -5, direction: -1, activated: true }
    ],
    
    // Items
    items: [
        { type: 'chest', x: 1200, y: 'safe_landing_1-top', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 2000, y: 'ground-400', contains: 'safety_equipment', subtype: 'bed_rails', requiresQuestion: true },
        { type: 'chest', x: 3050, y: 'ground-200', contains: 'weapon_upgrade', weaponId: 7, requiresQuestion: true },
        { type: 'health_pack', x: 3800, y: 'ground-30' },
        { type: 'chest', x: 5200, y: 'ground-350', contains: 'safety_equipment', subtype: 'gait_belt', requiresQuestion: true },
        { type: 'chest', x: 6050, y: 'ground-400', contains: 'extra_life', requiresQuestion: true },
        { type: 'health_pack', x: 7000, y: 'ground-30' },
        { type: 'chest', x: 8000, y: 'ground-300', contains: 'weapon_upgrade', weaponId: 8, requiresQuestion: true }
    ],
    
    // Enemy waves
    enemyWaves: [
        { triggerX: 500, enemies: [
            { type: 'trip_hazard', x: 550, y: 'ground-0', speed: 1 },
            { type: 'trip_hazard', x: 650, y: 'ground-0', speed: 1.5 }
        ]},
        { triggerX: 1600, enemies: [
            { type: 'confused_patient', x: 1650, y: 'ground-0', hp: 2, erratic: true },
            { type: 'trip_hazard', x: 1750, y: 'ground-0', speed: 2 }
        ]},
        { triggerX: 3200, enemies: [
            { type: 'equipment_cart', x: 3250, y: 'ground-0', hp: 3, speed: 3 },
            { type: 'confused_patient', x: 3350, y: 'ground-0', hp: 2, erratic: true }
        ]},
        { triggerX: 5600, enemies: [
            { type: 'trip_hazard', x: 5650, y: 'ground-0', speed: 2 },
            { type: 'trip_hazard', x: 5750, y: 'ground-0', speed: 2 },
            { type: 'equipment_cart', x: 5850, y: 'ground-0', hp: 3, speed: 3 }
        ]},
        { triggerX: 7600, enemies: [
            { type: 'confused_patient', x: 7650, y: 'ground-0', hp: 3, erratic: true },
            { type: 'equipment_cart', x: 7750, y: 'ground-0', hp: 4, speed: 4 }
        ]}
    ],
    
    // Boss configuration - Sentinel Event Boss
    boss: {
        triggerX: 10000,
        x: 10300,
        y: 'ground-150',
        type: 'sentinel_event_boss',
        hp: 30,
        phases: [
            { 
                hpThreshold: 30, 
                attacks: ['falling_debris'], 
                speed: 2, 
                message: 'Sentinel Event detected! Environmental hazards increasing!' 
            },
            { 
                hpThreshold: 20, 
                attacks: ['falling_debris', 'equipment_malfunction'], 
                speed: 3, 
                message: 'System failure cascade! Equipment becoming unstable!' 
            },
            { 
                hpThreshold: 10, 
                attacks: ['falling_debris', 'equipment_malfunction', 'patient_surge'], 
                speed: 4, 
                message: 'Critical safety breach! All hazards active!' 
            },
            { 
                hpThreshold: 5, 
                attacks: ['desperation_protocol'], 
                speed: 5, 
                message: 'Emergency protocol activated! Survive the chaos!' 
            }
        ]
    }
};

export default level;