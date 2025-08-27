/**
 * Boss Arena 3 - Risk Reduction Boss Fight
 */
const boss_3 = {
    id: 'boss_3',
    name: 'Risk Reduction Boss Arena',
    description: 'Boss testing arena for Risk Reduction level',
    color: '#FFB6C1',
    
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
            color: '#FFB6C1'
        },
        {
            worldX: 400,
            y: 'ground-80',
            width: 150,
            height: 20,
            type: 'standard',
            color: '#FFB6C1'
        }
    ],
    
    npcs: [],
    chests: [],
    powerups: [],
    fixedItemSpawns: [],
    
    isBossArena: true,
    bossLevel: 3,
    
    completion: {
        type: 'boss_defeat',
        message: 'Risk Reduction Boss defeated!'
    }
};

export default boss_3;