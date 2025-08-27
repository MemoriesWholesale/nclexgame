/**
 * Boss Arena 7 - Health Promotion Boss Fight
 */
const boss_7 = {
    id: 'boss_7',
    name: 'Health Promotion Boss Arena',
    description: 'Boss testing arena for Health Promotion level',
    color: '#A52A2A',
    
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
            color: '#A52A2A'
        },
        {
            worldX: 400,
            y: 'ground-80',
            width: 150,
            height: 20,
            type: 'standard',
            color: '#A52A2A'
        }
    ],
    
    npcs: [],
    chests: [],
    powerups: [],
    fixedItemSpawns: [],
    
    isBossArena: true,
    bossLevel: 7,
    
    completion: {
        type: 'boss_defeat',
        message: 'Health Promotion Boss defeated!'
    }
};

export default boss_7;