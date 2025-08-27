/**
 * Boss Arena 1 - Pharmacological Boss Fight
 */
const boss_1 = {
    id: 'boss_1',
    name: 'Pharmacological Boss Arena',
    description: 'Boss testing arena for Pharmacological level',
    color: '#98FB98',
    
    worldLength: 1200,
    playerStart: { x: 100, y: 'ground-0' },
    backgroundMusic: null,
    questionFile: 'data/boss_arena_questions.json',
    
    enemyWaves: [],
    items: [],
    hazards: [],
    
    platforms: [
        {
            worldX: 50,
            y: 'ground-60',
            width: 200,
            height: 20,
            type: 'standard',
            color: '#98FB98'
        },
        {
            worldX: 400,
            y: 'ground-80',
            width: 150,
            height: 20,
            type: 'standard',
            color: '#98FB98'
        }
    ],
    
    npcs: [],
    chests: [],
    powerups: [],
    fixedItemSpawns: [],
    
    isBossArena: true,
    bossLevel: 1,
    
    completion: {
        type: 'boss_defeat',
        message: 'Pharmacological Boss defeated!'
    }
};

export default boss_1;