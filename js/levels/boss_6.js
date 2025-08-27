/**
 * Boss Arena 6 - Physiological Adaptation Boss Fight
 */
const boss_6 = {
    id: 'boss_6',
    name: 'Physiological Boss Arena',
    description: 'Boss testing arena for Physiological Adaptation level',
    color: '#DA70D6',
    
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
            color: '#DA70D6'
        },
        {
            worldX: 400,
            y: 'ground-80',
            width: 150,
            height: 20,
            type: 'standard',
            color: '#DA70D6'
        }
    ],
    
    npcs: [],
    chests: [],
    powerups: [],
    fixedItemSpawns: [],
    
    isBossArena: true,
    bossLevel: 6,
    
    completion: {
        type: 'boss_defeat',
        message: 'Physiological Boss defeated!'
    }
};

export default boss_6;