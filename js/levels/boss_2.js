/**
 * Boss Arena 2 - Safety/Infection Control Boss Fight
 */
const boss_2 = {
    id: 'boss_2',
    name: 'Safety Boss Arena',
    description: 'Boss testing arena for Safety/Infection Control level',
    color: '#FFD700',
    
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
            color: '#FFD700'
        },
        {
            worldX: 400,
            y: 'ground-80',
            width: 150,
            height: 20,
            type: 'standard',
            color: '#FFD700'
        }
    ],
    
    npcs: [],
    chests: [],
    powerups: [],
    fixedItemSpawns: [],
    
    isBossArena: true,
    bossLevel: 2,
    
    completion: {
        type: 'boss_defeat',
        message: 'Safety Boss defeated!'
    }
};

export default boss_2;