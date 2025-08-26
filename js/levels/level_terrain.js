/**
 * Terrain Test Level - Showcases the new terrain system
 * Includes slopes, hills, mounds, plateaus, and valleys
 */
const level_terrain = {
    id: 8,
    name: 'Terrain Showcase',
    description: 'Test level for the new terrain system with varied topography',
    color: '#228B22',
    
    // Basic level properties
    worldLength: 3000,
    playerStart: { x: 100, y: 'ground-0' },
    backgroundMusic: null,
    
    // Enemy waves (required by game)
    enemyWaves: [],
    
    // Terrain features - this level showcases the terrain system
    terrain: {
        baseGroundY: 500, // Base ground level
        features: [
            // Flat starting area
            {
                type: 'flat',
                startX: 0,
                endX: 200,
                y: 500
            },
            
            // Gentle slope up
            {
                type: 'slope',
                startX: 200,
                startY: 500,
                endX: 400,
                endY: 450
            },
            
            // Small mound
            {
                type: 'mound',
                centerX: 500,
                centerY: 450,
                width: 200,
                height: 40
            },
            
            // Plateau section
            {
                type: 'plateau',
                startX: 700,
                endX: 1000,
                plateauY: 350,
                edgeHeight: 150
            },
            
            // Valley
            {
                type: 'valley',
                centerX: 1200,
                centerY: 500,
                width: 300,
                depth: 80
            },
            
            // Large hill
            {
                type: 'hill',
                centerX: 1600,
                centerY: 500,
                width: 400,
                height: 120,
                steepness: 1.5
            },
            
            // Steep slope down
            {
                type: 'slope',
                startX: 1800,
                startY: 420,
                endX: 2000,
                endY: 520
            },
            
            // Multiple small mounds
            {
                type: 'mound',
                centerX: 2100,
                centerY: 520,
                width: 120,
                height: 30
            },
            {
                type: 'mound',
                centerX: 2250,
                centerY: 520,
                width: 100,
                height: 25
            },
            {
                type: 'mound',
                centerX: 2380,
                centerY: 520,
                width: 80,
                height: 20
            },
            
            // Final flat area
            {
                type: 'flat',
                startX: 2500,
                endX: 3000,
                y: 520
            }
        ]
    },
    
    // Platforms positioned to complement terrain
    platforms: [
        // Bridge over valley
        {
            worldX: 1100,
            y: 450,
            width: 200,
            height: 20,
            type: 'standard',
            color: '#8B4513'
        },
        
        // Floating platform near hill
        {
            worldX: 1500,
            y: 300,
            width: 100,
            height: 15,
            type: 'standard',
            color: '#654321'
        },
        
        // Moving platform in valley
        {
            worldX: 1250,
            y: 480,
            width: 80,
            height: 15,
            type: 'moving',
            movement: {
                vertical: true,
                speed: 1,
                startY: 480,
                endY: 400
            },
            color: '#4A90E2'
        }
    ],
    
    // NPCs positioned at interesting terrain features
    npcs: [
        {
            worldX: 300,
            y: 430,
            width: 40,
            height: 60,
            activates: 'terrain_intro',
            interactionId: 'terrain_guide',
            name: 'Terrain Guide',
            givesItem: null
        },
        
        {
            worldX: 850,
            y: 320,
            width: 40,
            height: 60,
            activates: 'plateau_challenge',
            interactionId: 'plateau_npc',
            name: 'Plateau Dweller',
            givesItem: 'epinephrine'
        }
    ],
    
    // Chests with special armors
    chests: [
        {
            id: 'terrain_shield',
            worldX: 1580,
            y: 360, // On the hill
            width: 40,
            height: 40,
            state: 'closed',
            contains: 'shield_armor'
        },
        
        {
            id: 'terrain_charge',
            worldX: 2200,
            y: 470, // On a mound
            width: 40,
            height: 40,
            state: 'closed',
            contains: 'charge_armor'
        }
    ],
    
    // Enemies placed strategically
    spawnPoints: [
        {
            worldX: 450,
            minY: 400,
            maxY: 450,
            spawnChance: 0.6,
            enemyTypes: ['basic'],
            maxEnemies: 2
        },
        {
            worldX: 1150, // In the valley
            minY: 550,
            maxY: 580,
            spawnChance: 0.8,
            enemyTypes: ['jumping', 'basic'],
            maxEnemies: 3
        },
        {
            worldX: 1700, // On the hill
            minY: 380,
            maxY: 420,
            spawnChance: 0.7,
            enemyTypes: ['flying', 'basic'],
            maxEnemies: 2
        }
    ],
    
    // Power-ups positioned at challenging locations
    powerups: [
        {
            worldX: 1200, // Bottom of valley
            y: 560,
            type: 'life',
            width: 20,
            height: 20
        },
        
        {
            worldX: 1600, // Top of hill
            y: 360,
            type: 'double_jump',
            width: 25,
            height: 25
        }
    ],
    
    // Fixed item spawns to showcase terrain interaction
    fixedItemSpawns: [
        {
            id: 'slope_weapon',
            x: 350,
            y: 'terrain', // Special value - will be positioned on terrain
            triggerX: 340,
            itemType: 'pickup',
            subtype: 'weapon',
            weaponId: 3,
            width: 30,
            height: 30,
            persistent: true
        },
        
        {
            id: 'valley_medication',
            x: 1250,
            y: 'terrain',
            triggerX: 1240,
            itemType: 'pickup',
            subtype: 'medication',
            medicationType: 'morphine',
            width: 25,
            height: 25,
            persistent: true
        },
        
        {
            id: 'hill_weapon',
            x: 1650,
            y: 'terrain',
            triggerX: 1640,
            itemType: 'pickup',
            subtype: 'weapon',
            weaponId: 6,
            width: 30,
            height: 30,
            persistent: true
        }
    ],
    
    // Terrain-specific hazards
    hazards: [
        // Rockfall on steep slope
        {
            worldX: 1850,
            y: 350,
            width: 50,
            height: 200,
            type: 'falling_rocks',
            activated: true,
            damage: 1
        }
    ],
    
    // Quiz questions for NPCs and chests
    quizzes: {
        'terrain_intro': {
            question: "Which factor is most important when assessing a patient's mobility on varied terrain?",
            answers: [
                "Patient's shoe type",
                "Joint stability and balance",
                "Weather conditions",
                "Time of day"
            ],
            correct: 1,
            explanation: "Joint stability and balance are crucial for safe mobility on uneven surfaces."
        },
        
        'plateau_challenge': {
            question: "When helping a patient navigate elevated surfaces, what's the priority?",
            answers: [
                "Speed of movement",
                "Fall prevention and support",
                "Minimizing rest breaks",
                "Maintaining conversation"
            ],
            correct: 1,
            explanation: "Fall prevention is the top priority when assisting patients on elevated surfaces."
        },
        
        'terrain_shield': {
            question: "What adaptive equipment helps with mobility on uneven terrain?",
            answers: [
                "Wheelchair only",
                "Walking aids with proper tips",
                "Regular shoes",
                "Loose clothing"
            ],
            correct: 1,
            explanation: "Proper walking aids with appropriate tips provide stability on varied terrain."
        },
        
        'terrain_charge': {
            question: "How should you prepare a patient for mobility on slopes?",
            answers: [
                "Encourage rapid movement",
                "Assess strength and provide support",
                "Avoid slopes completely",
                "Focus only on the destination"
            ],
            correct: 1,
            explanation: "Assessing patient strength and providing appropriate support ensures safe slope navigation."
        }
    },
    
    // Level completion criteria
    completion: {
        type: 'reach_end',
        targetX: 2800,
        message: 'Terrain system showcase completed!'
    },
    
    // Special terrain system flags
    useTerrainSystem: true, // Enable terrain system for this level
    showTerrainInfo: true,  // Show terrain debugging info
    
    // Visual enhancements for terrain
    environmentEffects: {
        skyColor: '#87CEEB', // Sky blue
        cloudCount: 3,
        grassEffects: true,
        rockTextures: true
    }
};

export default level_terrain;