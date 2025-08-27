/**
 * Boss Arena 5 - Basic Care Boss Fight
 */
const boss_5 = {
    id: 'boss_5',
    name: 'Basic Care Boss Arena',
    description: 'Boss testing arena for Basic Care level',
    color: '#FFA07A',
    
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
            color: '#FFA07A'
        },
        {
            worldX: 400,
            y: 'ground-80',
            width: 150,
            height: 20,
            type: 'standard',
            color: '#FFA07A'
        }
    ],
    
    npcs: [],
    chests: [],
    powerups: [],
    fixedItemSpawns: [],
    
    isBossArena: true,
    bossLevel: 5,
    
    completion: {
        type: 'boss_defeat',
        message: 'Basic Care Boss defeated!'
    }
};

export default boss_5;