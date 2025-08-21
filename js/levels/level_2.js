// js/levels/level_2.js
// Safety & Infection Control Level - Hospital Hazard Theme

const level = {
    id: 2,
    name: "Safety/Infection Control",
    theme: "hospital_hazard",
    color: '#FFD700', // Yellow for caution
    questionFile: 'data/safety_infection_control.json',
    worldLength: 13000,

    // Starting configuration
    playerStart: { x: 100, y: 'ground-0' },

    // Platforms
    platforms: [
        // --- SECTION 1: INTRODUCTION TO HAZARDS ---
        { id: 'safe_ledge_1', x: 250, y: 'ground-0', width: 400, height: 20, type: 'static', activated: true },
        { id: 'jump_over_spill_1', x: 800, y: 'ground-120', width: 150, height: 20, type: 'static', activated: true },
        { id: 'jump_over_spill_2', x: 1050, y: 'ground-120', width: 150, height: 20, type: 'static', activated: true },
        { id: 'safe_ledge_2', x: 1300, y: 'ground-0', width: 400, height: 20, type: 'static', activated: true },

        // --- SECTION 2: AIRBORNE ALLEY ---
        // Hard path requires timing jumps between aerosol geysers
        { id: 'hard_path_air_1', x: 2000, y: 'ground-150', width: 80, height: 20, type: 'static', activated: true },
        { id: 'hard_path_air_2', x: 2200, y: 'ground-150', width: 80, height: 20, type: 'static', activated: true },
        { id: 'hard_path_air_3', x: 2400, y: 'ground-150', width: 80, height: 20, type: 'static', activated: true },
        // NPC Benefit: A solid bridge appears above the geysers
        { id: 'air_bridge', x: 2000, y: 'ground-250', width: 480, height: 20, type: 'static', activated: false },
        { id: 'safe_ledge_3', x: 2600, y: 'ground-0', width: 400, height: 20, type: 'static', activated: true },

        // --- SECTION 3: DROPLET DASH ---
        { id: 'droplet_platform_1', x: 3300, y: 'ground-200', width: 100, height: 20, type: 'static', activated: true },
        { id: 'droplet_platform_2', x: 3550, y: 'ground-200', width: 100, height: 20, type: 'static', activated: true },
        // NPC Benefit: Creates a shield to block droplets
        { id: 'shield_platform', x: 3425, y: 'ground-180', width: 100, height: 150, type: 'static', activated: false, visual: 'shield' },

        // --- SECTION 4: RISING TIDE OF BIOHAZARDS ---
        // A vertical climb to escape a rising hazard
        { id: 'climb_1', x: 4500, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        { id: 'climb_2', x: 4300, y: 'ground-250', width: 100, height: 20, type: 'static', activated: true },
        { id: 'climb_3', x: 4500, y: 'ground-400', width: 100, height: 20, type: 'static', activated: true },
        { id: 'climb_4', x: 4700, y: 'ground-550', width: 100, height: 20, type: 'static', activated: true },
        // NPC Benefit: An elevator to safely bypass the climb
        { id: 'tide_elevator', x: 4200, y: 'ground-0', width: 100, height: 20, type: 'elevator', activated: false, startY: 'ground-0', endY: 'ground-600', speed: -2 },
        { id: 'safe_ledge_4', x: 4800, y: 'ground-0', width: 800, height: 20, type: 'static', activated: true },

        // --- SECTION 5: ELECTRICAL ENGINEERING ---
        { id: 'pre_boss_platform', x: 6000, y: 'ground-100', width: 300, height: 20, type: 'static', activated: true },
        { id: 'boss_arena', x: 6500, y: 'ground-0', width: 2000, height: 20, type: 'static', activated: true }
    ],

    // NPCs who deactivate hazards
    npcs: [
        { id: 'evs_1', type: 'evs', x: 680, y: 'ground-60', dialogue: "Looks slippery ahead. Let me clean that up for you!", deactivates: 'spill_1,spill_2' },
        { id: 'infection_control_1', type: 'infection_control_nurse', x: 1800, y: 'ground-60', dialogue: "Airborne pathogens detected! Let me activate the negative pressure ventilation.", deactivates: 'geyser_1,geyser_2,geyser_3', activates: 'air_bridge' },
        { id: 'charge_nurse_2', type: 'charge_nurse', x: 3100, y: 'ground-60', dialogue: "Those droplets look nasty. Take cover behind this protective shield!", activates: 'shield_platform' },
        { id: 'engineer_1', type: 'engineer', x: 4100, y: 'ground-60', dialogue: "This rising contamination is a major safety breach! Use this emergency elevator.", activates: 'tide_elevator' },
        { id: 'safety_officer_1', type: 'safety_officer', x: 5800, y: 'ground-60', dialogue: "Faulty wiring ahead! Let me cut the power to those hazards.", deactivates: 'spark_1,spark_2,spark_3' }
    ],

    // New Hazard Types
    hazards: [
        // Section 1: Slippery spills
        { id: 'spill_1', type: 'spill_slick', x: 900, y: 'ground-10', width: 150, activated: true },
        { id: 'spill_2', type: 'spill_slick', x: 1150, y: 'ground-10', width: 150, activated: true },
        { type: 'pit', x: 1850, width: 150 },

        // Section 2: Airborne geysers
        { id: 'geyser_1', type: 'aerosol_geyser', x: 2100, y: 'ground-0', width: 40, height: 160, timing: { onTime: 1500, offTime: 2000 }, activated: true },
        { id: 'geyser_2', type: 'aerosol_geyser', x: 2300, y: 'ground-0', width: 40, height: 160, timing: { onTime: 1500, offTime: 2000, offset: 750 }, activated: true },
        { id: 'geyser_3', type: 'aerosol_geyser', x: 2500, y: 'ground-0', width: 40, height: 160, timing: { onTime: 1500, offTime: 2000, offset: 1500 }, activated: true },

        // Section 3: Droplet sprays
        { id: 'droplet_source_1', type: 'droplet_spray', x: 3800, y: 'ground-200', direction: 'left', timing: { fireRate: 3000, offset: 0 }, activated: true },
        { type: 'pit', x: 4000, width: 200 },
        
        // Section 4: Rising Tide
        { id: 'rising_tide_1', type: 'rising_tide', startX: 4200, endX: 4800, startY: 'ground+50', endY: 'ground-650', speed: 0.5, activated: true },

        // Section 5: Electrical Hazards
        { id: 'spark_1', type: 'sparking_hazard', x: 6100, y: 'ground-10', width: 50, height: 10, timing: { onTime: 500, offTime: 1000 }, activated: true },
        { id: 'spark_2', type: 'sparking_hazard', x: 6200, y: 'ground-110', width: 50, height: 10, timing: { onTime: 500, offTime: 1000, offset: 500 }, activated: true },
        { id: 'spark_3', type: 'sparking_hazard', x: 6300, y: 'ground-10', width: 50, height: 10, timing: { onTime: 500, offTime: 1000, offset: 1000 }, activated: true },
    ],

    // Items
    items: [
        { type: 'chest', x: 1500, y: 'ground-60', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 2800, y: 'ground-60', contains: 'weapon_upgrade', weaponId: 2, requiresQuestion: true },
        { type: 'health_pack', x: 3500, y: 'ground-260' },
        { type: 'chest', x: 4750, y: 'ground-610', contains: 'extra_life', requiresQuestion: true }
    ],

    // Boss configuration
    boss: {
        triggerX: 7000,
        x: 7200,
        y: 'ground-150',
        type: 'mdro_boss', // Multi-Drug Resistant Organism
        hp: 25,
        phases: [
            { hpThreshold: 25, vulnerability: 'any', attacks: ['basic_shot'], speed: 2, message: 'Pathogen identified! Engage with caution.' },
            { hpThreshold: 15, vulnerability: 'not_pills', attacks: ['basic_shot', 'contact_aura'], speed: 3, message: 'Organism has become resistant! Physical contact is dangerous.' },
            { hpThreshold: 8, vulnerability: 'energy', attacks: ['contact_aura', 'droplet_spray'], speed: 4, message: 'Airborne transmission detected! Keep moving!' }
        ]
    }
};

export default level;