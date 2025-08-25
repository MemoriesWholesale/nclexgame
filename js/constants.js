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
        idle: { row: 0, frames: 3, frameWidth: 167, frameHeight: 167, cols: 3 },
        attack: { row: 1, frames: 3, frameWidth: 167, frameHeight: 167, cols: 3 },
        hurt: { row: 2, frames: 2, frameWidth: 167, frameHeight: 167, cols: 3 },
        death: { row: 2, frames: 1, frameWidth: 167, frameHeight: 167, cols: 3, startCol: 2 }
    },
    level_1: {
        idle: { row: 0, frames: 5, frameWidth: 100, frameHeight: 125, cols: 5 },
        attack: { row: 1, frames: 5, frameWidth: 100, frameHeight: 125, cols: 5 },
        hurt: { row: 2, frames: 5, frameWidth: 100, frameHeight: 125, cols: 5 },
        death: { row: 3, frames: 4, frameWidth: 100, frameHeight: 125, cols: 5 }
    },
    level_2: {
        idle: { row: 0, frames: 3, frameWidth: 167, frameHeight: 125, cols: 3 },
        attack: { row: 1, frames: 3, frameWidth: 167, frameHeight: 125, cols: 3 },
        hurt: { row: 2, frames: 3, frameWidth: 167, frameHeight: 125, cols: 3 },
        death: { row: 3, frames: 2, frameWidth: 167, frameHeight: 125, cols: 3 }
    },
    level_3: {
        idle: { row: 0, frames: 4, frameWidth: 125, frameHeight: 167, cols: 4 },
        attack: { row: 1, frames: 2, frameWidth: 125, frameHeight: 167, cols: 4 },
        hurt: { row: 2, frames: 2, frameWidth: 125, frameHeight: 167, cols: 4 },
        death: { row: 2, frames: 2, frameWidth: 125, frameHeight: 167, cols: 4 }
    },
    level_4: {
        idle: { row: 0, frames: 3, frameWidth: 167, frameHeight: 167, cols: 3 },
        attack: { row: 1, frames: 2, frameWidth: 167, frameHeight: 167, cols: 3 },
        hurt: { row: 2, frames: 1, frameWidth: 167, frameHeight: 167, cols: 3 },
        death: { row: 2, frames: 1, frameWidth: 167, frameHeight: 167, cols: 3, startCol: 1 }
    },
    level_5: {
        idle: { row: 0, frames: 3, frameWidth: 167, frameHeight: 125, cols: 3 },
        attack: { row: 1, frames: 3, frameWidth: 167, frameHeight: 125, cols: 3 },
        hurt: { row: 2, frames: 3, frameWidth: 167, frameHeight: 125, cols: 3 },
        death: { row: 3, frames: 3, frameWidth: 167, frameHeight: 125, cols: 3 }
    },
    level_6: {
        idle: { row: 0, frames: 4, frameWidth: 125, frameHeight: 125, cols: 4 },
        attack: { row: 1, frames: 3, frameWidth: 125, frameHeight: 125, cols: 4 },
        hurt: { row: 2, frames: 3, frameWidth: 125, frameHeight: 125, cols: 4 },
        death: { row: 3, frames: 3, frameWidth: 125, frameHeight: 125, cols: 4 }
    },
    level_7: {
        idle: { row: 0, frames: 4, frameWidth: 125, frameHeight: 125, cols: 4 },
        attack: { row: 1, frames: 4, frameWidth: 125, frameHeight: 125, cols: 4 },
        hurt: { row: 2, frames: 4, frameWidth: 125, frameHeight: 125, cols: 4 },
        death: { row: 3, frames: 4, frameWidth: 125, frameHeight: 125, cols: 4 }
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
