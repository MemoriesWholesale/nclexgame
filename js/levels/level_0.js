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
        // Tutorial platforms
        {
            id: 'tut_1',
            x: 300,
            y: 'ground-150',
            width: 120,
            height: 20,
            type: 'static',
            activated: true
        },
        {
            id: 'tut_2',
            x: 500,
            y: 'ground-200',
            width: 100,
            height: 20,
            type: 'static',
            activated: true
        },
        
        // Elevator puzzle section
        {
            id: 'elevator_1',
            x: 800,
            y: 'ground-108', // **FIX**: Lowered from 'ground-120' to be reachable
            width: 120,
            height: 20,
            type: 'elevator',
            activated: false,
            startY: 'ground-108', // **FIX**: Lowered from 'ground-120'
            endY: 'ground-350',
            speed: -1 
        },
        
        // High ledge accessible via elevator
        {
            id: 'high_ledge_1',
            x: 920,
            y: 'ground-350',
            width: 500,
            height: 20,
            type: 'ledge',
            activated: true
        },
        
        // Moving platforms section
        {
            id: 'moving_1',
            x: 1500,
            y: 'ground-200',
            width: 100,
            height: 20,
            type: 'moving',
            activated: true,
            movement: {
                startX: 1500,
                endX: 1700,
                speed: 1,
                horizontal: true
            }
        },
        {
            id: 'moving_2',
            x: 1800,
            y: 'ground-250',
            width: 100,
            height: 20,
            type: 'moving',
            activated: true,
            movement: {
                startY: 'ground-250',
                endY: 'ground-150',
                speed: 1,
                vertical: true
            }
        },
        
        // Delegation chain platforms
        {
            id: 'deleg_1',
            x: 2200,
            y: 'ground-150',
            width: 80,
            height: 20,
            type: 'timed',
            activated: false,
            activeTime: 5000
        },
        {
            id: 'deleg_2',
            x: 2350,
            y: 'ground-250',
            width: 80,
            height: 20,
            type: 'timed',
            activated: false,
            activeTime: 5000,
            requiresPrevious: 'deleg_1'
        },
        {
            id: 'deleg_3',
            x: 2500,
            y: 'ground-350',
            width: 100,
            height: 20,
            type: 'static',
            activated: false,
            requiresPrevious: 'deleg_2'
        },
        
        // Collaboration section - synchronized platforms
        {
            id: 'sync_1',
            x: 3000,
            y: 'ground-200',
            width: 80,
            height: 20,
            type: 'disappearing',
            activated: true,
            timing: {
                onTime: 3000,
                offTime: 2000
            }
        },
        {
            id: 'sync_2',
            x: 3150,
            y: 'ground-200',
            width: 80,
            height: 20,
            type: 'disappearing',
            activated: true,
            timing: {
                onTime: 3000,
                offTime: 2000,
                offset: 2500  // Opposite phase
            }
        },

        // *** NEW: Vertical Labyrinth Section ***
        // A high platform, initially out of reach.
        {
            id: 'vert_ledge_1',
            x: 3600,
            y: 'ground-500', // Very high up
            width: 400,
            height: 20,
            type: 'ledge',
            activated: true
        },
        // Timed platforms activated by the Physical Therapist NPC
        {
            id: 'timed_climb_1',
            x: 3800,
            y: 'ground-180',
            width: 70,
            height: 20,
            type: 'timed',
            activated: false,
            activeTime: 8000 // A longer timer for the whole sequence
        },
        {
            id: 'timed_climb_2',
            x: 3650,
            y: 'ground-300',
            width: 70,
            height: 20,
            type: 'timed',
            activated: false,
            activeTime: 8000,
            requiresPrevious: 'timed_climb_1' 
        },
        {
            id: 'timed_climb_3',
            x: 3800,
            y: 'ground-420',
            width: 70,
            height: 20,
            type: 'timed',
            activated: false,
            activeTime: 8000,
            requiresPrevious: 'timed_climb_2'
        },
        // Moving platform activated by the Dietitian NPC
        {
            id: 'collab_bridge_1',
            x: 4000,
            y: 'ground-500',
            width: 150,
            height: 20,
            type: 'moving',
            activated: false,
            movement: {
                startX: 4000,
                endX: 4500,
                speed: 1.5,
                horizontal: true
            }
        },
        // *** END: New Section ***

        // Decorative platforms to add to the "baroque" feel
        { id: 'deco_1', x: 4200, y: 'ground-300', width: 50, height: 20, type: 'static', activated: true },
        { id: 'deco_2', x: 4350, y: 'ground-200', width: 50, height: 20, type: 'static', activated: true },

    ],
    
    // NPCs
    npcs: [
        {
            id: 'pharmacist_1',
            type: 'pharmacist',
            x: 720,
            y: 'ground-60',
            dialogue: "Answer correctly to activate the elevator!",
            activates: 'elevator_1'
        },
        {
            id: 'nurse_1',
            type: 'nurse',
            x: 2100,
            y: 'ground-60',
            dialogue: "Delegation starts here. Talk to me first!",
            activates: 'deleg_1'
        },
        {
            id: 'doctor_1',
            type: 'doctor',
            x: 2300,
            y: 'ground-60',
            dialogue: "Good! Now continue the chain of command.",
            activates: 'deleg_2',
            requiresPrevious: 'nurse_1'
        },
        {
            id: 'specialist_1',
            type: 'specialist',
            x: 2450,
            y: 'ground-60',
            dialogue: "Excellent coordination! Final platform activated!",
            activates: 'deleg_3',
            requiresPrevious: 'doctor_1'
        },

        // *** NEW: NPCs for the Labyrinth Section ***
        {
            id: 'pt_1',
            type: 'physical_therapist',
            x: 3900,
            y: 'ground-60',
            dialogue: "Rehabilitation is a climb! Let's get you moving.",
            activates: 'timed_climb_1' // Activates the start of the timed sequence
        },
        {
            id: 'dietitian_1',
            type: 'dietitian',
            x: 3650,
            y: 'vert_ledge_1-top', // Positioned on the high ledge
            dialogue: "Good nutrition provides the bridge to recovery. Well done!",
            activates: 'collab_bridge_1', // Activates the moving bridge
            requiresPrevious: 'timed_climb_3' // Requires the player to have reached the top
        }
        // *** END: New NPCs ***
    ],
    
    // Hazards (pits)
    hazards: [
        { type: 'pit', x: 1000, width: 150 },
        { type: 'pit', x: 1250, width: 100 },
        { type: 'pit', x: 2700, width: 200 },
        { type: 'pit', x: 3300, width: 150 },
        { type: 'pit', x: 4600, width: 300 } // Added a new pit after the bridge
    ],
    
    // Items (chests, pickups)
    items: [
        {
            type: 'chest',
            x: 1020,
            y: 'high_ledge_1-top',
            contains: 'extra_life',
            requiresQuestion: true
        },
        {
            type: 'chest',
            x: 2550,
            y: 'deleg_3-top',
            contains: 'weapon_upgrade',
            weaponId: 4,
            requiresQuestion: true
        },
        // New chest on the high vertical ledge
        {
            type: 'chest',
            x: 3700,
            y: 'vert_ledge_1-top',
            contains: 'extra_life',
            requiresQuestion: true
        },
        {
            type: 'weapon_pickup',
            x: 1800,
            y: 'ground-30',
            weaponId: 3
        },
        {
            type: 'health_pack',
            x: 2600,
            y: 'ground-30'
        }
    ],
    
    // Enemy waves (triggered by position)
    enemyWaves: [
        {
            triggerX: 500,
            enemies: [
                { type: 'basic', x: 550, y: 'ground-0' },
                { type: 'basic', x: 600, y: 'ground-0' }
            ]
        },
        {
            triggerX: 1500,
            enemies: [
                { type: 'basic', x: 1550, y: 'ground-0' },
                { type: 'nurse_zombie', x: 1650, y: 'ground-0', hp: 2 }
            ]
        },
        {
            triggerX: 2800,
            enemies: [
                { type: 'basic', x: 2850, y: 'ground-0' },
                { type: 'basic', x: 2900, y: 'ground-0' },
                { type: 'nurse_zombie', x: 2950, y: 'ground-0', hp: 2 }
            ]
        },
        // New enemy wave in the vertical section
        {
            triggerX: 3500,
            enemies: [
                { type: 'basic', x: 3550, y: 'ground-0' },
                { type: 'nurse_zombie', x: 3700, y: 'ground-0', hp: 2 },
                { type: 'basic', x: 4100, y: 'ground-0' }
            ]
        }
    ],
    
    // Boss configuration
    boss: {
        triggerX: 11500,
        x: 11800,
        y: 'ground-120',
        type: 'coordinator_boss',
        hp: 15,
        phases: [
            {
                hpThreshold: 15,
                attacks: ['charge'],
                speed: 2
            },
            {
                hpThreshold: 8,
                attacks: ['charge', 'summon'],
                speed: 3
            },
            {
                hpThreshold: 3,
                attacks: ['rage'],
                speed: 4
            }
        ]
    }
};

export default level;