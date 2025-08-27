/**
 * Boss Arena 0 - Coordinated Care Boss Fight
 * Minimal arena for testing boss mechanics
 */
const boss_0 = {
    id: 'boss_0',
    name: 'Coordinated Care Boss Arena',
    description: 'Boss testing arena for Coordinated Care level',
    color: '#87CEEB',
    
    worldLength: 1200,
    playerStart: { x: 100, y: 'ground-0' },
    backgroundMusic: null,
    questionFile: 'data/boss_arena_questions.json',
    
    // Required arrays
    enemyWaves: [],
    items: [],
    hazards: [],
    
    // Minimal platforms for boss arena
    platforms: [
        // Left platform for player positioning
        {
            worldX: 50,
            y: 'ground-60',
            width: 200,
            height: 20,
            type: 'standard',
            color: '#87CEEB'
        },
        // Right platform
        {
            worldX: 400,
            y: 'ground-80',
            width: 150,
            height: 20,
            type: 'standard',
            color: '#87CEEB'
        },
        // Center elevated platform
        {
            worldX: 300,
            y: 'ground-120',
            width: 100,
            height: 15,
            type: 'standard',
            color: '#87CEEB'
        }
    ],
    
    npcs: [],
    chests: [],
    powerups: [],
    
    // Fixed items for boss testing
    fixedItemSpawns: [
        {
            id: 'boss_weapon',
            x: 150,
            y: 'ground-30',
            triggerX: 140,
            itemType: 'pickup',
            subtype: 'weapon',
            weaponId: 2,
            width: 30,
            height: 30,
            persistent: true
        }
    ],
    
    // Boss arena specific settings
    isBossArena: true,
    bossLevel: 0, // Corresponds to level 0 boss
    
    // Completion just requires boss defeat
    completion: {
        type: 'boss_defeat',
        message: 'Coordinated Care Boss defeated!'
    }
};

export default boss_0;