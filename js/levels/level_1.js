// js/levels/level_1.js
// Pharmacological Therapies Level - Medication Effects Theme

const level = {
    id: 1,
    name: "Pharmacological Therapies",
    theme: "medication_administration",
    color: '#98FB98',
    questionFile: 'data/pharma_therapies.json',
    worldLength: 14000,
    
    // Starting configuration
    playerStart: { x: 100, y: 'ground-0' },
    
    // Platforms
    platforms: [
        // --- SECTION 1: PHARMACY TUTORIAL ---
        { id: 'pharm_shelf_1', x: 300, y: 'ground-120', width: 200, height: 20, type: 'static', activated: true },
        { id: 'pharm_shelf_2', x: 550, y: 'ground-200', width: 200, height: 20, type: 'static', activated: true },
        { id: 'pharm_shelf_3', x: 800, y: 'ground-280', width: 200, height: 20, type: 'static', activated: true },
        { id: 'tutorial_platform', x: 1100, y: 'ground-150', width: 300, height: 20, type: 'static', activated: true },
        
        // --- SECTION 2: DOSAGE CALCULATION CANYON ---
        // Number platforms that require correct medication timing
        { id: 'dose_1', x: 1600, y: 'ground-100', width: 60, height: 20, type: 'timed', activated: true, activeTime: 3000 },
        { id: 'dose_2', x: 1750, y: 'ground-180', width: 60, height: 20, type: 'timed', activated: true, activeTime: 3000, offset: 1000 },
        { id: 'dose_3', x: 1900, y: 'ground-260', width: 60, height: 20, type: 'timed', activated: true, activeTime: 3000, offset: 2000 },
        { id: 'dose_4', x: 2050, y: 'ground-180', width: 60, height: 20, type: 'timed', activated: true, activeTime: 3000, offset: 3000 },
        { id: 'dose_5', x: 2200, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        
        // Hidden platform only visible with atropine
        { id: 'hidden_shortcut_1', x: 1800, y: 'ground-350', width: 400, height: 20, type: 'hidden', activated: true },
        
        // Alternative path platforms (harder route without medications)
        { id: 'alt_path_1', x: 1900, y: 'ground-400', width: 100, height: 20, type: 'static', activated: true },
        { id: 'alt_path_2', x: 2050, y: 'ground-350', width: 80, height: 20, type: 'static', activated: true },
        
        // --- SECTION 3: BLOODSTREAM RAPIDS ---
        // Fast-moving platforms representing blood flow
        { id: 'blood_cell_1', x: 2800, y: 'ground-150', width: 80, height: 80, type: 'moving', activated: true, 
          movement: { startX: 2800, endX: 3200, speed: 4, horizontal: true } },
        { id: 'blood_cell_2', x: 3000, y: 'ground-250', width: 80, height: 80, type: 'moving', activated: true, 
          movement: { startX: 3000, endX: 3400, speed: -4, horizontal: true } },
        { id: 'blood_cell_3', x: 3200, y: 'ground-150', width: 80, height: 80, type: 'moving', activated: true, 
          movement: { startX: 3200, endX: 3600, speed: 4, horizontal: true } },
        { id: 'vessel_wall_1', x: 3700, y: 'ground-200', width: 150, height: 20, type: 'static', activated: true },
        
        // Small passages that require insulin to shrink, but with alternative route
        { id: 'capillary_1', x: 4000, y: 'ground-50', width: 200, height: 40, type: 'static', activated: true },
        { id: 'capillary_tunnel', x: 4200, y: 'ground-90', width: 40, height: 40, type: 'static', activated: true },
        { id: 'capillary_2', x: 4240, y: 'ground-50', width: 200, height: 40, type: 'static', activated: true },
        
        // Alternative route over capillaries (harder without insulin)
        { id: 'capillary_over_1', x: 3950, y: 'ground-150', width: 80, height: 20, type: 'static', activated: true },
        { id: 'capillary_over_2', x: 4100, y: 'ground-200', width: 80, height: 20, type: 'static', activated: true },
        { id: 'capillary_over_3', x: 4250, y: 'ground-150', width: 80, height: 20, type: 'static', activated: true },
        
        // --- SECTION 4: BLOOD-BRAIN BARRIER ---
        // Puzzle platforms requiring specific medications
        { id: 'barrier_platform_1', x: 4800, y: 'ground-200', width: 100, height: 20, type: 'static', activated: false },
        { id: 'barrier_platform_2', x: 4950, y: 'ground-300', width: 100, height: 20, type: 'static', activated: false },
        { id: 'barrier_platform_3', x: 5100, y: 'ground-400', width: 100, height: 20, type: 'static', activated: false },
        
        // Withdrawal platforms - only solid when NO medications active
        { id: 'withdrawal_1', x: 5400, y: 'ground-150', width: 100, height: 20, type: 'withdrawal', activated: true },
        { id: 'withdrawal_2', x: 5550, y: 'ground-250', width: 100, height: 20, type: 'withdrawal', activated: true },
        { id: 'withdrawal_3', x: 5700, y: 'ground-350', width: 100, height: 20, type: 'withdrawal', activated: true },
        
        // High platforms requiring double jump from corticosteroid
        { id: 'high_ledge_1', x: 6000, y: 'ground-450', width: 200, height: 20, type: 'static', activated: true },
        { id: 'high_ledge_2', x: 6300, y: 'ground-500', width: 200, height: 20, type: 'static', activated: true },
        
        // Alternative route around high ledges (more challenging without corticosteroids)
        { id: 'low_alt_1', x: 5900, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        { id: 'low_alt_2', x: 6050, y: 'ground-150', width: 80, height: 20, type: 'static', activated: true },
        { id: 'low_alt_3', x: 6200, y: 'ground-200', width: 80, height: 20, type: 'static', activated: true },
        { id: 'low_alt_4', x: 6350, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        
        // --- SECTION 5: RECEPTOR SITE ARENA ---
        { id: 'arena_floor', x: 6800, y: 'ground-0', width: 800, height: 20, type: 'static', activated: true },
        { id: 'arena_platform_1', x: 6900, y: 'ground-200', width: 100, height: 20, type: 'moving', activated: true,
          movement: { startX: 6900, endX: 7400, speed: 3, horizontal: true } },
        { id: 'arena_platform_2', x: 7100, y: 'ground-350', width: 100, height: 20, type: 'moving', activated: true,
          movement: { startX: 7100, endX: 7400, speed: -2, horizontal: true } },
        
        // --- SECTION 6: SIDE EFFECT GAUNTLET ---
        // Platforms that move erratically (simulating side effects)
        { id: 'dizzy_platform_1', x: 8000, y: 'ground-200', width: 80, height: 20, type: 'orbiting', activated: true,
          orbit: { centerX: 8040, centerY: 'ground-200', radiusX: 40, radiusY: 100, speed: 0.05, startAngle: 0 } },
        { id: 'dizzy_platform_2', x: 8200, y: 'ground-200', width: 80, height: 20, type: 'orbiting', activated: true,
          orbit: { centerX: 8240, centerY: 'ground-200', radiusX: 40, radiusY: 100, speed: -0.05, startAngle: Math.PI } },
        
        // Disappearing platforms (vision side effects)
        { id: 'blurry_1', x: 8400, y: 'ground-150', width: 60, height: 20, type: 'disappearing', activated: true,
          timing: { onTime: 1000, offTime: 1000 } },
        { id: 'blurry_2', x: 8500, y: 'ground-200', width: 60, height: 20, type: 'disappearing', activated: true,
          timing: { onTime: 1000, offTime: 1000, offset: 500 } },
        { id: 'blurry_3', x: 8600, y: 'ground-250', width: 60, height: 20, type: 'disappearing', activated: true,
          timing: { onTime: 1000, offTime: 1000, offset: 1000 } },
        
        // Final approach to boss
        { id: 'pre_boss_platform', x: 9000, y: 'ground-100', width: 300, height: 20, type: 'static', activated: true },
        { id: 'boss_arena', x: 9500, y: 'ground-0', width: 2000, height: 20, type: 'static', activated: true }
    ],
    
    // NPCs - Pharmacy staff
    npcs: [
        { id: 'pharmacist_tutorial', type: 'pharmacist', x: 400, y: 'pharm_shelf_1-top', 
          dialogue: "Welcome to the pharmacy! Each medication has unique effects. Use them wisely!", 
          givesItem: 'epinephrine' },
        
        { id: 'nurse_dosage', type: 'nurse', x: 1150, y: 'tutorial_platform-top',
          dialogue: "Remember: timing is everything with medications. Some platforms ahead require precise dosing!",
          activates: 'dose_1' },
        
        { id: 'pharmacist_interaction', type: 'pharmacist', x: 2250, y: 'dose_5-top',
          dialogue: "Be careful! Some medications have dangerous interactions. Red zones ahead will hurt if you mix meds!",
          givesItem: 'benzodiazepine' },
        
        { id: 'doctor_barrier', type: 'doctor', x: 4700, y: 'ground-60',
          dialogue: "The blood-brain barrier is selective. Answer correctly to unlock the passage.",
          activates: 'barrier_platform_1,barrier_platform_2,barrier_platform_3' },
        
        { id: 'patient_withdrawal', type: 'patient', x: 5300, y: 'ground-60',
          dialogue: "Sometimes the cure is worse than the disease. Those platforms only work when you're medication-free.",
          givesItem: 'morphine' },
        
        { id: 'specialist_boss', type: 'specialist', x: 9100, y: 'pre_boss_platform-top',
          dialogue: "The Receptor Boss ahead adapts to medications. You'll need to use different drugs for each phase!",
          givesItem: 'corticosteroid' }
    ],
    
    // Hazards
    hazards: [
        { type: 'pit', x: 1450, width: 150 },
        { type: 'pit', x: 2400, width: 400 },
        { type: 'pit', x: 3900, width: 100 },
        { type: 'pit', x: 4500, width: 300 },
        { type: 'pit', x: 5850, width: 150 },
        { type: 'pit', x: 7700, width: 300 },
        { type: 'pit', x: 8700, width: 300 }
    ],
    
    // Special zones
    interactionZones: [
        { worldX: 2500, y: 'ground-200', width: 200, height: 200 },
        { worldX: 3500, y: 'ground-300', width: 150, height: 300 },
        { worldX: 5200, y: 'ground-400', width: 100, height: 400 },
        { worldX: 7800, y: 'ground-500', width: 200, height: 500 }
    ],
    
    // Hidden platforms (visible only with atropine)
    hiddenPlatforms: [
        { worldX: 1800, y: 'ground-350', width: 400, height: 20 },
        { worldX: 3450, y: 'ground-400', width: 200, height: 20 },
        { worldX: 4600, y: 'ground-500', width: 150, height: 20 },
        { worldX: 6700, y: 'ground-600', width: 300, height: 20 }
    ],
    
    // Items
    items: [
        // Medication pickups removed - now only available through NPCs and chests
        
        // Chests requiring questions - strategically placed near challenges
        { type: 'chest', x: 2100, y: 'ground-400', contains: 'extra_life', requiresQuestion: true },
        
        // Insulin chest - placed before capillary tunnel section (helps with shrinking)
        { type: 'chest', x: 3900, y: 'ground-50', contains: 'medication', subtype: 'insulin', requiresQuestion: true },
        
        // Epinephrine chest - helps with speed/jumping in blood-brain barrier section
        { type: 'chest', x: 4300, y: 'capillary_2-top', contains: 'medication', subtype: 'epinephrine', requiresQuestion: true },
        
        // Morphine chest - provides invincibility for hazardous areas
        { type: 'chest', x: 3600, y: 'vessel_wall_1-top', contains: 'medication', subtype: 'morphine', requiresQuestion: true },
        
        // Atropine chest - reveals hidden platforms for shortcuts 
        { type: 'chest', x: 1650, y: 'ground-200', contains: 'medication', subtype: 'atropine', requiresQuestion: true },
        
        // Corticosteroid chest - enables double jump for high platforms
        { type: 'chest', x: 5900, y: 'withdrawal_3-top', contains: 'medication', subtype: 'corticosteroid', requiresQuestion: true },
        
        // Benzodiazepine chest - provides bullet time for difficult sections
        { type: 'chest', x: 7000, y: 'ground-200', contains: 'medication', subtype: 'benzodiazepine', requiresQuestion: true },
        
        // Weapon upgrade chest
        { type: 'chest', x: 6150, y: 'high_ledge_1-top', contains: 'weapon_upgrade', weaponId: 6, requiresQuestion: true },
        { type: 'chest', x: 8650, y: 'ground-400', contains: 'extra_life', requiresQuestion: true },
        
        // Regular health packs
        { type: 'health_pack', x: 3000, y: 'ground-30' },
        { type: 'health_pack', x: 5500, y: 'ground-30' },
        { type: 'health_pack', x: 7500, y: 'ground-30' }
    ],
    
    // Boss configuration - Receptor Site Boss
    boss: {
        triggerX: 10500,
        x: 10800,
        y: 'ground-150',
        type: 'receptor_boss',
        hp: 20,
        phases: [
            { 
                hpThreshold: 20, 
                vulnerability: 'epinephrine', 
                attacks: ['spike_proteins'], 
                speed: 2,
                message: 'Beta receptors active - use Epinephrine!' 
            },
            { 
                hpThreshold: 15, 
                vulnerability: 'morphine', 
                attacks: ['pain_waves'], 
                speed: 3,
                message: 'Opioid receptors exposed - use Morphine!' 
            },
            { 
                hpThreshold: 10, 
                vulnerability: 'benzodiazepine', 
                attacks: ['anxiety_burst'], 
                speed: 3,
                message: 'GABA receptors open - use Benzodiazepine!' 
            },
            { 
                hpThreshold: 5, 
                vulnerability: 'any', 
                attacks: ['desperation'], 
                speed: 4,
                message: 'Receptor overload - any medication works!' 
            }
        ]
    }
};

export default level;