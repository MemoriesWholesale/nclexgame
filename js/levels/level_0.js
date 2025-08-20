// js/levels/level_0.js
// Coordinated Care Level - Hospital Ward Theme

const level = {
    id: 0,
    name: "Coordinated Care",
    theme: "hospital_ward",
    color: '#87CEEB',
    questionFile: 'data/coordinated_care.json',
    worldLength: 12000,
    
    // Starting configuration
    playerStart: { x: 100, y: 'ground-0' },
    
    // Platforms
    platforms: [
        // --- SECTION 1: TUTORIAL AND FIRST NPC ---
        { id: 'tut_1', x: 300, y: 'ground-150', width: 120, height: 20, type: 'static', activated: true },
        { id: 'tut_2', x: 500, y: 'ground-200', width: 100, height: 20, type: 'static', activated: true },
        { id: 'elevator_1', x: 800, y: 'ground-108', width: 120, height: 20, type: 'elevator', activated: false, startY: 'ground-108', endY: 'ground-350', speed: -1 },
        { id: 'high_ledge_1', x: 920, y: 'ground-350', width: 500, height: 20, type: 'ledge', activated: true },
        { id: 'hard_path_1', x: 950, y: 'ground-120', width: 80, height: 20, type: 'static', activated: true },

        // --- SECTION 2: DELEGATION CHAIN ---
        { id: 'moving_1', x: 1500, y: 'ground-200', width: 100, height: 20, type: 'moving', activated: true, movement: { startX: 1500, endX: 1700, speed: 1, horizontal: true } },
        { id: 'moving_2_fixed', x: 1800, y: 'ground-150', width: 100, height: 20, type: 'elevator', activated: true, startY: 'ground-150', endY: 'ground-250', speed: 1 },
        { id: 'deleg_1', x: 2200, y: 'ground-150', width: 80, height: 20, type: 'timed', activated: false, activeTime: 5000 },
        { id: 'deleg_2', x: 2350, y: 'ground-250', width: 80, height: 20, type: 'timed', activated: false, activeTime: 5000, requiresPrevious: 'deleg_1' },
        { id: 'deleg_3', x: 2500, y: 'ground-350', width: 100, height: 20, type: 'static', activated: false, requiresPrevious: 'deleg_2' },
        { id: 'hard_path_2a', x: 2250, y: 'ground-80', width: 70, height: 20, type: 'static', activated: true },
        { id: 'hard_path_2b', x: 2450, y: 'ground-80', width: 70, height: 20, type: 'static', activated: true },

        // --- SECTION 3: VERTICAL LABYRINTH ---
        { id: 'vert_ledge_1', x: 3600, y: 'ground-500', width: 400, height: 20, type: 'ledge', activated: true },
        { id: 'timed_climb_1', x: 3800, y: 'ground-180', width: 70, height: 20, type: 'timed', activated: false, activeTime: 8000 },
        { id: 'timed_climb_2', x: 3650, y: 'ground-300', width: 70, height: 20, type: 'timed', activated: false, activeTime: 8000, requiresPrevious: 'timed_climb_1' },
        { id: 'timed_climb_3', x: 3800, y: 'ground-420', width: 70, height: 20, type: 'timed', activated: false, activeTime: 8000, requiresPrevious: 'timed_climb_2' },
        { id: 'hard_path_3a', x: 3750, y: 'ground-150', width: 50, height: 20, type: 'static', activated: true },
        { id: 'hard_path_3b', x: 3900, y: 'ground-250', width: 50, height: 20, type: 'static', activated: true },
        { id: 'hard_path_3c', x: 3750, y: 'ground-350', width: 50, height: 20, type: 'static', activated: true },
        { id: 'hard_path_3d', x: 3600, y: 'ground-420', width: 50, height: 20, type: 'static', activated: true },

        // --- SECTION 4: THE GREAT PIT (PLAYTESTED AND FIXED) ---
        // **FIX**: Added a proper launch platform before the pit.
        { id: 'pre_pit_4_ledge', x: 4300, y: 'ground-0', width: 150, height: 20, type: 'static', activated: true },
        // NPC Benefit: The bridge now correctly spans the chasm, providing a safe and easy path.
        { id: 'collab_bridge_1', x: 4350, y: 'ground-150', width: 150, height: 20, type: 'moving', activated: false, movement: { startX: 4350, endX: 5100, speed: 2, horizontal: true } },
        // **FIX**: Repositioned the hard path platforms and added a new one to make the jump sequence possible.
        { id: 'hard_path_4a', x: 4600, y: 'ground-100', width: 50, height: 20, type: 'static', activated: true },
        { id: 'hard_path_4b', x: 4780, y: 'ground-150', width: 50, height: 20, type: 'static', activated: true }, // Added platform
        { id: 'hard_path_4c', x: 4950, y: 'ground-100', width: 50, height: 20, type: 'static', activated: true },

        // --- SECTION 5: THE BAROQUE TOWER ---
        { id: 'tower_base', x: 5500, y: 'ground-200', width: 300, height: 20, type: 'static', activated: true },
        { id: 'tower_top_ledge', x: 6000, y: 'ground-600', width: 400, height: 20, type: 'static', activated: true },
        { id: 'orbit_1', x: 5600, y: 'ground-400', width: 60, height: 20, type: 'orbiting', activated: false, orbit: { centerX: 5700, centerY: 'ground-400', radiusX: 100, radiusY: 50, speed: 0.02, startAngle: 0 } },
        { id: 'orbit_2', x: 5600, y: 'ground-400', width: 60, height: 20, type: 'orbiting', activated: false, orbit: { centerX: 5700, centerY: 'ground-400', radiusX: 100, radiusY: 50, speed: 0.02, startAngle: Math.PI } },
        { id: 'elevator_2', x: 5850, y: 'ground-400', width: 100, height: 20, type: 'elevator', activated: false, startY: 'ground-400', endY: 'ground-600', speed: -1.5 },
        { id: 'hard_path_5a', x: 5550, y: 'ground-300', width: 40, height: 20, type: 'disappearing', activated: true, timing: { onTime: 1500, offTime: 2000 } },
        { id: 'hard_path_5b', x: 5700, y: 'ground-400', width: 40, height: 20, type: 'disappearing', activated: true, timing: { onTime: 1500, offTime: 2000, offset: 1750 } },
        { id: 'hard_path_5c', x: 5850, y: 'ground-500', width: 40, height: 20, type: 'static', activated: true },
        { id: 'hard_path_5d', x: 6000, y: 'ground-550', width: 30, height: 20, type: 'static', activated: true },

        // --- SECTION 6: THE FINAL GAUNTLET ---
        // Hard path across pit 6: challenging but possible without NPC help
        { id: 'hard_path_pit6_a', x: 6100, y: 'ground-150', width: 40, height: 20, type: 'static', activated: true },
        { id: 'hard_path_pit6_b', x: 6220, y: 'ground-200', width: 35, height: 20, type: 'disappearing', activated: true, timing: { onTime: 2000, offTime: 1000 } },
        { id: 'hard_path_pit6_c', x: 6350, y: 'ground-120', width: 35, height: 20, type: 'static', activated: true },
        { id: 'gauntlet_approach', x: 6400, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        { id: 'gauntlet_start', x: 6600, y: 'ground-150', width: 200, height: 20, type: 'static', activated: true },
        // Bridge platform to access weave section over the large pit
        { id: 'weave_access_bridge', x: 6850, y: 'ground-200', width: 80, height: 20, type: 'static', activated: true },
        // NPC-activated easier path for pit 6 crossing
        { id: 'pit6_bridge_1', x: 6150, y: 'ground-300', width: 80, height: 20, type: 'elevator', activated: false, startY: 'ground-300', endY: 'ground-150', speed: -2 },
        { id: 'pit6_bridge_2', x: 6280, y: 'ground-250', width: 100, height: 20, type: 'static', activated: false },
        { id: 'pit6_reward_platform', x: 6180, y: 'ground-400', width: 120, height: 20, type: 'static', activated: false },
        { id: 'weave_1', x: 7000, y: 'ground-250', width: 120, height: 20, type: 'moving', activated: false, movement: { startX: 7000, endX: 7300, speed: 2.5, horizontal: true } },
        { id: 'weave_2', x: 7420, y: 'ground-250', width: 120, height: 20, type: 'moving', activated: false, movement: { startX: 7420, endX: 7120, speed: -2.5, horizontal: true } },
        { id: 'weave_3', x: 7500, y: 'ground-400', width: 100, height: 20, type: 'elevator', activated: false, startY: 'ground-400', endY: 'ground-200', speed: -2 },
        { id: 'hard_path_6a', x: 7000, y: 'ground-100', width: 40, height: 20, type: 'static', activated: true },
        { id: 'hard_path_6b', x: 7180, y: 'ground-150', width: 30, height: 20, type: 'static', activated: true },
        { id: 'hard_path_6c', x: 7350, y: 'ground-120', width: 30, height: 20, type: 'disappearing', activated: true, timing: { onTime: 1800, offTime: 1500 } },
        { id: 'hard_path_6d', x: 7520, y: 'ground-150', width: 30, height: 20, type: 'static', activated: true },
        { id: 'hard_path_6e', x: 7700, y: 'ground-100', width: 40, height: 20, type: 'static', activated: true },
        { id: 'pre_boss_ledge', x: 8000, y: 'ground-0', width: 3500, height: 20, type: 'static', activated: true}
    ],
    
    // NPCs
    npcs: [
        { id: 'pharmacist_1', type: 'pharmacist', x: 720, y: 'ground-60', dialogue: "Answer correctly to activate the elevator!", activates: 'elevator_1' },
        { id: 'nurse_1', type: 'nurse', x: 2100, y: 'ground-60', dialogue: "Delegation starts here. Talk to me first!", activates: 'deleg_1' },
        { id: 'doctor_1', type: 'doctor', x: 2300, y: 'ground-60', dialogue: "Good! Now continue the chain of command.", activates: 'deleg_2', requiresPrevious: 'nurse_1' },
        { id: 'specialist_1', type: 'specialist', x: 2450, y: 'ground-60', dialogue: "Excellent coordination! Final platform activated!", activates: 'deleg_3', requiresPrevious: 'doctor_1' },
        { id: 'pt_1', type: 'physical_therapist', x: 3900, y: 'ground-60', dialogue: "Rehabilitation is a climb! Let's get you moving.", activates: 'timed_climb_1' },
        { id: 'dietitian_1', type: 'dietitian', x: 3650, y: 'vert_ledge_1-top', dialogue: "Good nutrition provides the bridge to recovery. Well done!", activates: 'collab_bridge_1', requiresPrevious: 'timed_climb_3' },
        { id: 'ot_1', type: 'occupational_therapist', x: 5550, y: 'tower_base-top', dialogue: "Let's get you functional! These platforms will help you adapt.", activates: 'orbit_1,orbit_2' },
        { id: 'charge_nurse_1', type: 'charge_nurse', x: 5750, y: 'tower_base-top', dialogue: "Good progress. I'll give you a lift to the top.", activates: 'elevator_2', requiresPrevious: 'ot_1' },
        { id: 'respiratory_therapist_1', type: 'respiratory_therapist', x: 6050, y: 'hard_path_5d-top', dialogue: "That pit ahead looks dangerous! Let me help you breathe easier with a safe path.", activates: 'pit6_bridge_1,pit6_bridge_2,pit6_reward_platform' },
        { id: 'case_manager_1', type: 'case_manager', x: 6650, y: 'gauntlet_start-top', dialogue: "Discharge is ahead, but you need a safe path. Let me coordinate it.", activates: 'weave_1,weave_2,weave_3' }
    ],
    
    // Hazards (pits)
    hazards: [
        { type: 'pit', x: 1000, width: 150 },
        { type: 'pit', x: 1250, width: 100 },
        { type: 'pit', x: 2700, width: 200 },
        { type: 'pit', x: 3300, width: 150 },
        // **FIX**: Adjusted pit to match the new platform layout.
        { type: 'pit', x: 4500, width: 550 }, 
        { type: 'pit', x: 6200, width: 250 },
        { type: 'pit', x: 6900, width: 800 } 
    ],
    
    // Items (chests, pickups)
    items: [
        { type: 'chest', x: 1020, y: 'high_ledge_1-top', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 2550, y: 'deleg_3-top', contains: 'weapon_upgrade', weaponId: 4, requiresQuestion: true },
        { type: 'chest', x: 3700, y: 'vert_ledge_1-top', contains: 'extra_life', requiresQuestion: true },
        { type: 'weapon_pickup', x: 1800, y: 'ground-30', weaponId: 3 },
        { type: 'health_pack', x: 2600, y: 'ground-30' },
        { type: 'chest', x: 6100, y: 'tower_top_ledge-top', contains: 'weapon_upgrade', weaponId: 5, requiresQuestion: true },
        { type: 'chest', x: 6220, y: 'pit6_reward_platform-top', contains: 'extra_life', requiresQuestion: true },
        { type: 'health_pack', x: 7800, y: 'ground-30' }
    ],
    
    // Enemy waves (triggered by position)
    enemyWaves: [
        { triggerX: 500, enemies: [ { type: 'basic', x: 550, y: 'ground-0' }, { type: 'basic', x: 600, y: 'ground-0' } ] },
        { triggerX: 1500, enemies: [ { type: 'basic', x: 1550, y: 'ground-0' }, { type: 'nurse_zombie', x: 1650, y: 'ground-0', hp: 2 } ] },
        { triggerX: 2800, enemies: [ { type: 'basic', x: 2850, y: 'ground-0' }, { type: 'basic', x: 2900, y: 'ground-0' }, { type: 'nurse_zombie', x: 2950, y: 'ground-0', hp: 2 } ] },
        { triggerX: 3500, enemies: [ { type: 'basic', x: 3550, y: 'ground-0' }, { type: 'nurse_zombie', x: 3700, y: 'ground-0', hp: 2 }, { type: 'basic', x: 4100, y: 'ground-0' } ] },
        { triggerX: 5600, enemies: [ { type: 'nurse_zombie', x: 5650, y: 'ground-0', hp: 2 }, { type: 'nurse_zombie', x: 5800, y: 'ground-0', hp: 2 } ] },
        { triggerX: 7000, enemies: [ { type: 'basic', x: 7050, y: 'ground-0' }, { type: 'basic', x: 7200, y: 'ground-0' }, { type: 'nurse_zombie', x: 7500, y: 'ground-0', hp: 3 } ] }
    ],
    
    // Boss configuration
    boss: {
        triggerX: 11500,
        x: 11800,
        y: 'ground-120',
        type: 'coordinator_boss',
        hp: 15,
        phases: [
            { hpThreshold: 15, attacks: ['charge'], speed: 2 },
            { hpThreshold: 8, attacks: ['charge', 'summon'], speed: 3 },
            { hpThreshold: 3, attacks: ['rage'], speed: 4 }
        ]
    }
};

export default level;