// Centralized game constants

export const MIN_SPAWN_DISTANCE = 150;

export const LEVEL_DATA = [
    { name: "Coordinated Care", color: '#87CEEB', file: 'data/coordinated_care.json' },
    { name: "Pharm. Therapies", color: '#98FB98', file: 'data/pharma_therapies.json' },
    { name: "Safety/Infection", color: '#FFD700', file: 'data/safety_infection_control.json' },
    { name: "Risk Reduction", color: '#FFB6C1', file: 'data/reduction_of_risk_potential.json' },
    { name: "Psychosocial Int.", color: '#ADD8E6', file: 'data/psychosocial_integrity.json' },
    { name: "Basic Care", color: '#FFA07A', file: 'data/basic_care_and_comfort.json' },
    { name: "Phys. Adaptation", color: '#DA70D6', file: 'data/physiological_adaptation.json' },
    { name: "Health Promotion", color: '#A52A2A', file: 'data/health_promotion_and_maintenance.json' }
];

export const SPRITE_ANIMATIONS = {
    walk:       { y: 0,   frames: 4, width: 62, height: 115, startFrame: 0 },
    walkShoot:  { y: 0,   frames: 1, width: 62, height: 115, startFrame: 4 },
    idleShoot:  { y: 0,   frames: 1, width: 62, height: 115, startFrame: 5 },
    jumpUp:     { y: 115, frames: 1, width: 62, height: 115, startFrame: 0 },
    jumpDown:   { y: 115, frames: 1, width: 62, height: 115, startFrame: 1 },
    jumpShoot:  { y: 115, frames: 1, width: 62, height: 115, startFrame: 2 },
    crouch:     { y: 230, frames: 1, width: 62, height: 115, startFrame: 0 },
    crouchShoot:{ y: 230, frames: 2, width: 62, height: 115, startFrame: 1 },
    idle:       { y: 0,   frames: 1, width: 62, height: 115, startFrame: 0 }
};

export const BOSS_ANIMATIONS = {
    // Level-specific animations - each boss has unique frame layouts
    level_0: {
        idle: { frames: [0, 1], frameWidth: 167, frameHeight: 167, cols: 3 }, // a1, a2
        projectile_init: { frames: [2, 5], frameWidth: 167, frameHeight: 167, cols: 3 }, // a3, b3
        projectile_active: { frames: [4], frameWidth: 167, frameHeight: 167, cols: 3 }, // b2
        projectile_end: { frames: [3, 6], frameWidth: 167, frameHeight: 167, cols: 3 }, // b1, c1
        dash_start: { frames: [7], frameWidth: 167, frameHeight: 167, cols: 3 }, // c2
        dash_active: { frames: [8], frameWidth: 167, frameHeight: 167, cols: 3 }, // c3
        hurt: { frames: [4], frameWidth: 167, frameHeight: 167, cols: 3 }, // b2 (reuse for hurt)
        death: { frames: [6], frameWidth: 167, frameHeight: 167, cols: 3 } // c1 (reuse for death)
    },
    level_1: {
        idle: { 
            frames: [0, 1, 2, 3, 4], // a1-a5
            irregular: true,
            frameData: [
                { x: 0, y: 0, width: 94, height: 115 },     // a1
                { x: 94, y: 0, width: 94, height: 115 },    // a2
                { x: 188, y: 0, width: 104, height: 115 },  // a3
                { x: 292, y: 0, width: 104, height: 115 },  // a4
                { x: 396, y: 0, width: 104, height: 115 }   // a5
            ]
        },
        aerial_attack: { 
            frames: [5, 6, 7, 8, 9], // b1-b5
            irregular: true,
            frameData: [
                { x: 0, y: 115, width: 94, height: 128 },     // b1
                { x: 94, y: 115, width: 94, height: 128 },    // b2
                { x: 188, y: 115, width: 104, height: 128 },  // b3
                { x: 292, y: 115, width: 104, height: 128 },  // b4
                { x: 396, y: 115, width: 104, height: 128 }   // b5
            ]
        },
        post_attack_idle: { 
            frames: [10, 11, 12], // c1-c3
            irregular: true,
            frameData: [
                { x: 0, y: 243, width: 94, height: 128 },     // c1
                { x: 94, y: 243, width: 94, height: 128 },    // c2
                { x: 188, y: 243, width: 104, height: 128 }   // c3
            ]
        },
        high_jump: { 
            frames: [13, 14], // c4-c5 (taller frames)
            irregular: true,
            frameData: [
                { x: 292, y: 243, width: 104, height: 147 },  // c4 (15% taller)
                { x: 396, y: 243, width: 104, height: 147 }   // c5 (15% taller)
            ]
        },
        high_jump_landing: { 
            frames: [15, 16, 17], // d1-d3
            irregular: true,
            frameData: [
                { x: 0, y: 371, width: 94, height: 128 },     // d1
                { x: 94, y: 371, width: 94, height: 128 },    // d2
                { x: 188, y: 371, width: 104, height: 128 }   // d3
            ]
        },
        stationary_projectile: { 
            frames: [18], // d4 (shorter like row a)
            irregular: true,
            frameData: [
                { x: 292, y: 371, width: 104, height: 115 }   // d4
            ]
        },
        hurt: { 
            frames: [10], // Reuse c1 for hurt
            irregular: true,
            frameData: [
                { x: 0, y: 243, width: 94, height: 128 }
            ]
        },
        death: { 
            frames: [15, 16, 17], // Reuse d1-d3 for death
            irregular: true,
            frameData: [
                { x: 0, y: 371, width: 94, height: 128 },
                { x: 94, y: 371, width: 94, height: 128 },
                { x: 188, y: 371, width: 104, height: 128 }
            ]
        }
    },
    level_2: {
        idle: { 
            frames: [0, 9, 12], // a1, d1, e1
            frameWidth: 167, 
            frameHeight: 100, 
            cols: 3 
        },
        slow_projectile: { 
            frames: [5, 2, 6, 3, 4, 1], // b3→a3→c1→b1→b2→a2
            frameWidth: 167, 
            frameHeight: 100, 
            cols: 3 
        },
        quick_projectile: { 
            frames: [13, 10, 7], // e2→d2→c2
            frameWidth: 167, 
            frameHeight: 100, 
            cols: 3 
        },
        special_attack: { 
            frames: [8], // c3
            frameWidth: 167, 
            frameHeight: 100, 
            cols: 3 
        },
        hurt: { 
            frames: [9], // Reuse d1 for hurt
            frameWidth: 167, 
            frameHeight: 100, 
            cols: 3 
        },
        death: { 
            frames: [12, 9], // e1, d1 for death sequence
            frameWidth: 167, 
            frameHeight: 100, 
            cols: 3 
        }
    },
    level_3: {
        basic_idle: { 
            frames: [0, 4], // a1, b1 (alternating)
            frameWidth: 125, 
            frameHeight: 167, 
            cols: 4 
        },
        extended_idle: { 
            frames: [0, 4, 2, 1], // a1 → b1 → a3 → a2
            frameWidth: 125, 
            frameHeight: 167, 
            cols: 4 
        },
        electrical_attack: { 
            frames: [1, 3], // a2 ↔ a4 (alternating)
            frameWidth: 125, 
            frameHeight: 167, 
            cols: 4 
        },
        simple_melee: { 
            frames: [8], // c1 (extends into c2)
            frameWidth: 250, // Double width for tendril extension
            frameHeight: 167, 
            cols: 4,
            isWide: true,
            sourceX: 0, // c1 position
            sourceY: 334  // Row 2 (c row)
        },
        powerful_melee: { 
            frames: [6], // b3 (extends into b4)  
            frameWidth: 250, // Double width for tendril extension
            frameHeight: 167, 
            cols: 4,
            isWide: true,
            sourceX: 250, // b3 position (3rd column)
            sourceY: 167   // Row 1 (b row)
        },
        rush_attack: { 
            frames: [10], // c3 (extends into c4)
            frameWidth: 250, // Double width for rush
            frameHeight: 167, 
            cols: 4,
            isWide: true,
            sourceX: 250, // c3 position (3rd column) 
            sourceY: 334   // Row 2 (c row)
        },
        hurt: { 
            frames: [4], // Reuse b1 for hurt
            frameWidth: 125, 
            frameHeight: 167, 
            cols: 4 
        },
        death: { 
            frames: [0, 4], // a1, b1 for death sequence
            frameWidth: 125, 
            frameHeight: 167, 
            cols: 4 
        }
    },
    level_4: {
        idle: { 
            frames: [0, 2, 6], // a1, a3, c1 (cycling)
            frameWidth: 167, 
            frameHeight: 167, 
            cols: 3 
        },
        attack_1: { 
            frames: [3, 6], // b1↔c1 (flickering)
            frameWidth: 167, 
            frameHeight: 167, 
            cols: 3 
        },
        attack_2: { 
            frames: [5, 6], // b3↔c1 (flickering)
            frameWidth: 167, 
            frameHeight: 167, 
            cols: 3 
        },
        attack_3: { 
            frames: [0, 1, 8], // a1→a2→c3 (sequential)
            frameWidth: 167, 
            frameHeight: 167, 
            cols: 3 
        },
        hurt: { 
            frames: [6], // Reuse c1 for hurt
            frameWidth: 167, 
            frameHeight: 167, 
            cols: 3 
        },
        death: { 
            frames: [0, 6], // a1, c1 for death sequence
            frameWidth: 167, 
            frameHeight: 167, 
            cols: 3 
        }
    },
    level_5: {
        idle: { 
            frames: [0, 0, 2, 3, 5, 6, 8], // a1→a1→a3→b1→b3→c1→c3 (extended cycle)
            frameWidth: 167, 
            frameHeight: 125, 
            cols: 3 
        },
        attack_1: { 
            frames: [7, 9, 4], // c2→d1→b2
            frameWidth: 167, 
            frameHeight: 125, 
            cols: 3 
        },
        attack_2: { 
            frames: [7, 9, 10, 11], // c2→d1→d2→d3
            frameWidth: 167, 
            frameHeight: 125, 
            cols: 3 
        },
        hurt: { 
            frames: [6], // Reuse c1 for hurt
            frameWidth: 167, 
            frameHeight: 125, 
            cols: 3 
        },
        death: { 
            frames: [9, 10, 11], // d1→d2→d3 for death sequence
            frameWidth: 167, 
            frameHeight: 125, 
            cols: 3 
        }
    },
    level_6: {
        idle_moving: { 
            frames: [1, 2, 4, 5, 6, 8, 9, 10, 12], // a2,a3,b1,b2,b3,c1,c2,c3,d1 (cycle through remaining frames)
            frameWidth: 104, // Standard width for columns 1-3
            frameHeight: 125, 
            cols: 4 
        },
        rush_attack: { 
            frames: [0], // a1 (single frame)
            frameWidth: 104, 
            frameHeight: 125, 
            cols: 4 
        },
        strong_melee: { 
            frames: [13, 14], // d2→d3 (2-frame sequence)
            frameWidth: 104, 
            frameHeight: 125, 
            cols: 4 
        },
        special_wide: { 
            frames: [3], // a4 (wide frame, 20% wider)
            frameWidth: 125, // 20% wider frame
            frameHeight: 125, 
            cols: 4,
            isWide: true,
            sourceX: 312, // After 3 columns of 104px each
            sourceY: 0     // Row 0 (a row)
        },
        hurt: { 
            frames: [12], // Reuse d1 for hurt
            frameWidth: 104, 
            frameHeight: 125, 
            cols: 4 
        },
        death: { 
            frames: [13, 14], // d2→d3 for death sequence
            frameWidth: 104, 
            frameHeight: 125, 
            cols: 4 
        }
    },
    level_7: {
        idle_moving: { 
            frames: [0, 3, 5, 6, 8, 9, 10, 12, 13, 15], // a1,a4,b2,b3,c1,c2,c3,d1,d2,d4 (remaining frames for idle/moving)
            frameWidth: 125, 
            frameHeight: 125, 
            cols: 4 
        },
        quick_attack_1: { 
            frames: [1], // a2 (single frame attack)
            frameWidth: 125, 
            frameHeight: 125, 
            cols: 4 
        },
        quick_attack_2: { 
            frames: [2], // a3 (single frame attack)
            frameWidth: 125, 
            frameHeight: 125, 
            cols: 4 
        },
        long_attack: { 
            frames: [4, 7, 11, 14], // b1→b4→c4→d3 (4-frame sequence)
            frameWidth: 125, 
            frameHeight: 125, 
            cols: 4 
        },
        hurt: { 
            frames: [12], // Reuse d1 for hurt
            frameWidth: 125, 
            frameHeight: 125, 
            cols: 4 
        },
        death: { 
            frames: [13, 14, 15], // d2→d3→d4 for death sequence
            frameWidth: 125, 
            frameHeight: 125, 
            cols: 4 
        }
    }
};

export const BOSS_DATA = [
    { name: 'Coordination Crisis', type: 'coordinated_care', maxHp: 10, attackPattern: 'swipe' },
    { name: 'Toxic Overdose', type: 'pharma_therapies', maxHp: 12, attackPattern: 'projectile' },
    { name: 'Infection Spreader', type: 'safety_infection', maxHp: 8, attackPattern: 'area_damage' },
    { name: 'Risk Amplifier', type: 'risk_reduction', maxHp: 15, attackPattern: 'charge' },
    { name: 'Mental Breakdown', type: 'psychosocial', maxHp: 10, attackPattern: 'confusion' },
    { name: 'Comfort Destroyer', type: 'basic_care', maxHp: 11, attackPattern: 'environmental' },
    { name: 'System Failure', type: 'physiological', maxHp: 18, attackPattern: 'multi_phase' },
    { name: 'Wellness Saboteur', type: 'health_promotion', maxHp: 13, attackPattern: 'debuff' }
];

export const ARMOR_DATA = [
    { name: 'Default', color: '#FF0000' },
    { name: "Coord. Care Armor", color: '#0000FF' },
    { name: "Pharm. Armor", color: '#FFFF00' },
    { name: "Safety Armor", color: '#00FF00' },
    { name: "Risk Armor", color: '#FFA500' },
    { name: "Psych. Armor", color: '#800080' },
    { name: "Basic Care Armor", color: '#00FFFF' },
    { name: "Adapt. Armor", color: '#FFC0CB' },
    { name: "Health Promo Armor", color: '#A52A2A' }
];

export const WEAPON_NAMES = ['Pill', 'Syringe', 'Stethoscope', 'Bandage', 'Shears', 'Hammer', 'BP Monitor', 'Bottle'];
export const WEAPON_COLORS = ['#ffffff', '#00bfff', '#32cd32', '#ffa500', '#ff69b4', '#9370db', '#20b2aa', '#ff4500'];
export const FIRE_COOLDOWNS = [10, 5, 20, 25, 30, 40, 25, 45];
