/**
 * Boss Arena 4 - Psychosocial Boss Fight
 */
const boss_4 = {
    id: 'boss_4',
    name: 'Psychosocial Boss Arena',
    description: 'Boss testing arena for Psychosocial level',
    color: '#ADD8E6',
    
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
            color: '#ADD8E6'
        },
        {
            worldX: 400,
            y: 'ground-80',
            width: 150,
            height: 20,
            type: 'standard',
            color: '#ADD8E6'
        }
    ],
    
    npcs: [],
    chests: [],
    powerups: [],
    fixedItemSpawns: [],
    
    isBossArena: true,
    bossLevel: 4,
    
    completion: {
        type: 'boss_defeat',
        message: 'Psychosocial Boss defeated!'
    }
};

export default boss_4;