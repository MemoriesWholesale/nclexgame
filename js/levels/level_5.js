// js/levels/level_5.js
// Basic Care and Comfort Level - Patient Care Theme

const level = {
    id: 5,
    name: "Basic Care and Comfort",
    theme: "patient_care_unit",
    color: '#FFA07A', // Light salmon for warmth/care
    questionFile: 'data/basic_care_and_comfort.json',
    worldLength: 14000,
    
    // Starting configuration
    playerStart: { x: 100, y: 'ground-0' },
    
    // Comfort zones - areas where player must maintain specific conditions
    comfortZones: [
        { id: 'temp_zone_1', startX: 1500, endX: 2200, type: 'temperature', 
          idealTemp: 72, currentTemp: 55, degradeRate: 0.5 },
        { id: 'position_zone_1', startX: 3000, endX: 3800, type: 'positioning',
          requiredPosition: 'elevated', timer: 5000 },
        { id: 'hygiene_zone_1', startX: 4500, endX: 5300, type: 'hygiene',
          cleanlinessLevel: 0, requiredLevel: 100 },
        { id: 'nutrition_zone_1', startX: 6000, endX: 6800, type: 'nutrition',
          hungerLevel: 100, feedingRequired: true },
        { id: 'sleep_zone_1', startX: 7500, endX: 8300, type: 'sleep',
          noiseLevel: 100, maxNoise: 30 }
    ],
    
    // Platforms
    platforms: [
        // --- SECTION 1: MOBILITY ASSISTANCE ---
        // Platforms representing different mobility aids
        { id: 'bed_1', x: 250, y: 'ground-80', width: 150, height: 60, type: 'bed', 
          activated: true, canAdjust: true, positions: ['flat', 'semi-fowler', 'fowler', 'trendelenburg'] },
        { id: 'wheelchair_ramp_1', x: 450, y: 'ground-100', width: 200, height: 20, type: 'ramp', 
          activated: true, angle: 15 },
        { id: 'transfer_board_1', x: 700, y: 'ground-120', width: 100, height: 20, type: 'transfer', 
          activated: true, slideable: true },
        { id: 'mobility_aid_platform', x: 850, y: 'ground-150', width: 150, height: 20, type: 'static', activated: true },
        
        // --- SECTION 2: TEMPERATURE REGULATION ---
        // Hot and cold platforms that affect player temperature
        { id: 'hot_plate_1', x: 1600, y: 'ground-100', width: 100, height: 20, type: 'temperature', 
          activated: true, temp: 'hot', effect: 5 },
        { id: 'cold_plate_1', x: 1750, y: 'ground-150', width: 100, height: 20, type: 'temperature', 
          activated: true, temp: 'cold', effect: -5 },
        { id: 'neutral_plate_1', x: 1900, y: 'ground-200', width: 100, height: 20, type: 'temperature', 
          activated: true, temp: 'neutral', effect: 0 },
        { id: 'hot_plate_2', x: 2050, y: 'ground-150', width: 100, height: 20, type: 'temperature', 
          activated: true, temp: 'hot', effect: 5 },
        
        // NPC Benefit: Climate control platform
        { id: 'climate_control', x: 1600, y: 'ground-300', width: 550, height: 20, type: 'climate', 
          activated: false, maintainsIdealTemp: true },
        
        // --- SECTION 3: POSITIONING PUZZLE ---
        // Platforms that tilt based on patient positioning needs
        { id: 'tilt_bed_1', x: 3100, y: 'ground-150', width: 120, height: 20, type: 'tilting', 
          activated: true, currentAngle: 0, targetAngle: 30 },
        { id: 'tilt_bed_2', x: 3300, y: 'ground-200', width: 120, height: 20, type: 'tilting', 
          activated: true, currentAngle: 0, targetAngle: -30 },
        { id: 'tilt_bed_3', x: 3500, y: 'ground-250', width: 120, height: 20, type: 'tilting', 
          activated: true, currentAngle: 0, targetAngle: 45 },
        { id: 'position_stabilizer', x: 3700, y: 'ground-150', width: 100, height: 20, type: 'static', activated: true },
        
        // NPC Benefit: Auto-positioning system
        { id: 'auto_position', x: 3100, y: 'ground-350', width: 620, height: 20, type: 'static', 
          activated: false, autoAdjusts: true },
        
        // --- SECTION 4: HYGIENE STATIONS ---
        // Cleaning platforms that must be activated in sequence
        { id: 'soap_dispenser', x: 4600, y: 'ground-200', width: 80, height: 20, type: 'hygiene_tool', 
          activated: true, tool: 'soap', order: 1 },
        { id: 'water_basin', x: 4750, y: 'ground-250', width: 100, height: 20, type: 'hygiene_tool', 
          activated: true, tool: 'water', order: 2 },
        { id: 'towel_rack', x: 4900, y: 'ground-200', width: 80, height: 20, type: 'hygiene_tool', 
          activated: true, tool: 'towel', order: 3 },
        { id: 'lotion_station', x: 5050, y: 'ground-150', width: 80, height: 20, type: 'hygiene_tool', 
          activated: true, tool: 'lotion', order: 4 },
        { id: 'clean_platform', x: 5200, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        
        // Dirt platforms that slow movement
        { id: 'dirty_floor_1', x: 4800, y: 'ground-0', width: 200, height: 20, type: 'dirty', 
          activated: true, slowEffect: 0.5, cleanable: true },
        
        // --- SECTION 5: NUTRITION DELIVERY ---
        // Food cart platforms that must be pushed to patients
        { id: 'food_cart_1', x: 6100, y: 'ground-100', width: 60, height: 40, type: 'pushable', 
          activated: true, weight: 'heavy', contents: 'meal_tray' },
        { id: 'feeding_platform_1', x: 6300, y: 'ground-150', width: 100, height: 20, type: 'feeding_zone', 
          activated: true, requiresFood: true },
        { id: 'food_cart_2', x: 6500, y: 'ground-100', width: 60, height: 40, type: 'pushable', 
          activated: true, weight: 'light', contents: 'snacks' },
        { id: 'feeding_platform_2', x: 6700, y: 'ground-150', width: 100, height: 20, type: 'feeding_zone', 
          activated: true, requiresFood: true },
        
        // NPC Benefit: Meal delivery system
        { id: 'meal_conveyor', x: 6100, y: 'ground-300', width: 700, height: 20, type: 'conveyor', 
          activated: false, speed: 2, deliversFood: true },
        
        // --- SECTION 6: SLEEP ENVIRONMENT ---
        // Noise-sensitive platforms
        { id: 'quiet_zone_1', x: 7600, y: 'ground-150', width: 100, height: 20, type: 'noise_sensitive', 
          activated: true, maxNoise: 20, breaksIfLoud: true },
        { id: 'quiet_zone_2', x: 7800, y: 'ground-200', width: 100, height: 20, type: 'noise_sensitive', 
          activated: true, maxNoise: 20, breaksIfLoud: true },
        { id: 'quiet_zone_3', x: 8000, y: 'ground-150', width: 100, height: 20, type: 'noise_sensitive', 
          activated: true, maxNoise: 20, breaksIfLoud: true },
        { id: 'rest_platform', x: 8200, y: 'ground-100', width: 100, height: 20, type: 'static', activated: true },
        
        // Moving platforms that make noise
        { id: 'noisy_machine_1', x: 7700, y: 'ground-50', width: 80, height: 20, type: 'noisy', 
          activated: true, noiseLevel: 50, movement: { startX: 7700, endX: 8100, speed: 2 } },
        
        // --- SECTION 7: PAIN MANAGEMENT ---
        // Platforms that pulse with "pain" - player must time jumps
        { id: 'pain_platform_1', x: 9000, y: 'ground-150', width: 100, height: 20, type: 'pulsing', 
          activated: true, painLevel: 100, pulseRate: 2000, safeWindow: 500 },
        { id: 'pain_platform_2', x: 9200, y: 'ground-200', width: 100, height: 20, type: 'pulsing', 
          activated: true, painLevel: 100, pulseRate: 2000, safeWindow: 500, offset: 1000 },
        { id: 'pain_platform_3', x: 9400, y: 'ground-150', width: 100, height: 20, type: 'pulsing', 
          activated: true, painLevel: 100, pulseRate: 2000, safeWindow: 500, offset: 500 },
        
        // NPC Benefit: Pain relief platforms
        { id: 'pain_relief_1', x: 9000, y: 'ground-350', width: 500, height: 20, type: 'static', 
          activated: false, removesPain: true },
        
        // --- SECTION 8: COMFORT COMBINATION ---
        // Final section combining all comfort mechanics
        { id: 'comfort_challenge_1', x: 10000, y: 'ground-200', width: 100, height: 20, type: 'comfort_combo', 
          activated: true, requires: ['temperature', 'position', 'hygiene'] },
        { id: 'comfort_challenge_2', x: 10200, y: 'ground-250', width: 100, height: 20, type: 'comfort_combo', 
          activated: true, requires: ['nutrition', 'sleep'] },
        { id: 'comfort_challenge_3', x: 10400, y: 'ground-200', width: 100, height: 20, type: 'comfort_combo', 
          activated: true, requires: ['pain_free', 'clean'] },
        
        // Pre-boss arena
        { id: 'pre_boss_platform', x: 10800, y: 'ground-100', width: 300, height: 20, type: 'static', activated: true },
        { id: 'boss_arena', x: 11300, y: 'ground-0', width: 2000, height: 20, type: 'static', activated: true }
    ],
    
    // NPCs - Care providers
    npcs: [
        { id: 'cna_1', type: 'cna', x: 500, y: 'ground-60', 
          dialogue: "Mobility assistance is crucial. Let me show you proper transfer techniques!", 
          teachesSkill: 'transfer_technique' },
        
        { id: 'nurse_temp', type: 'nurse', x: 1400, y: 'ground-60', 
          dialogue: "Patient comfort requires proper temperature. I'll activate climate control.", 
          activates: 'climate_control' },
        
        { id: 'physical_therapist_3', type: 'physical_therapist', x: 2900, y: 'ground-60', 
          dialogue: "Proper positioning prevents pressure ulcers. Let me set up auto-positioning.", 
          activates: 'auto_position' },
        
        { id: 'hygiene_specialist', type: 'specialist', x: 4400, y: 'ground-60', 
          dialogue: "Cleanliness is essential for healing. Here's the proper sequence!", 
          teachesSkill: 'hygiene_protocol' },
        
        { id: 'dietitian_2', type: 'dietitian', x: 5900, y: 'ground-60', 
          dialogue: "Nutrition aids recovery. I'll set up the meal delivery system.", 
          activates: 'meal_conveyor' },
        
        { id: 'sleep_tech', type: 'specialist', x: 7400, y: 'ground-60', 
          dialogue: "Rest is vital for healing. Let me reduce the noise levels.", 
          deactivates: 'noisy_machine_1' },
        
        { id: 'pain_specialist', type: 'nurse', x: 8800, y: 'ground-60', 
          dialogue: "Pain management improves outcomes. Here's some relief!", 
          activates: 'pain_relief_1' },
        
        { id: 'comfort_coordinator', type: 'nurse', x: 10700, y: 'pre_boss_platform-top', 
          dialogue: "The Neglect Boss thrives on discomfort. Keep patients comfortable to win!", 
          givesItem: 'comfort_shield' }
    ],
    
    // Comfort items that affect zones
    comfortItems: [
        { type: 'blanket', x: 1700, y: 'ground-30', effect: 'warmth', value: 10 },
        { type: 'pillow', x: 3200, y: 'ground-30', effect: 'position', value: 'elevated' },
        { type: 'soap', x: 4700, y: 'ground-30', effect: 'cleanliness', value: 25 },
        { type: 'meal_tray', x: 6200, y: 'ground-30', effect: 'nutrition', value: 50 },
        { type: 'white_noise', x: 7700, y: 'ground-30', effect: 'noise_reduction', value: -30 },
        { type: 'pain_med', x: 9100, y: 'ground-30', effect: 'pain_relief', value: 100 }
    ],
    
    // Hazards
    hazards: [
        // **FIX**: Reduced from 300px to 250px for consistency
        { type: 'pit', x: 1200, width: 200 },
        // **FIX**: Reduced from 600px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 2400, width: 200 },
        // **FIX**: Reduced from 300px to 250px for consistency
        { type: 'pit', x: 4200, width: 200 },
        // **FIX**: Reduced from 500px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 5500, width: 200 },
        { type: 'pit', x: 7200, width: 200 },
        // **FIX**: Reduced from 300px to 250px for consistency
        { type: 'pit', x: 8500, width: 200 },
        // **FIX**: Reduced from 300px to 250px for consistency
        { type: 'pit', x: 9700, width: 200 },
        
        // Pressure ulcer zones (damage if stay too long)
        { id: 'pressure_zone_1', type: 'pressure_ulcer', x: 3400, y: 'ground-0', 
          width: 100, height: 20, timeLimit: 3000 },
        { id: 'pressure_zone_2', type: 'pressure_ulcer', x: 6400, y: 'ground-0', 
          width: 100, height: 20, timeLimit: 3000 }
    ],
    
    // Items
    items: [
        { type: 'chest', x: 1000, y: 'mobility_aid_platform-top', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 2200, y: 'ground-350', contains: 'comfort_item', subtype: 'heating_pad', requiresQuestion: true },
        { type: 'chest', x: 3800, y: 'ground-400', contains: 'weapon_upgrade', weaponId: 4, requiresQuestion: true },
        { type: 'chest', x: 5300, y: 'clean_platform-top', contains: 'comfort_item', subtype: 'lotion', requiresQuestion: true },
        { type: 'health_pack', x: 6900, y: 'ground-30' },
        { type: 'chest', x: 8300, y: 'rest_platform-top', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 9600, y: 'ground-400', contains: 'weapon_upgrade', weaponId: 7, requiresQuestion: true },
        { type: 'health_pack', x: 10500, y: 'ground-30' }
    ],
    
    // Enemy waves - Represent care challenges
    enemyWaves: [
        { triggerX: 800, enemies: [
            { type: 'contracture', x: 850, y: 'ground-0', speed: 1, restrictsMovement: true },
            { type: 'fatigue', x: 950, y: 'ground-0', speed: 0.5, slowsPlayer: true }
        ]},
        { triggerX: 2500, enemies: [
            { type: 'shivering', x: 2550, y: 'ground-0', hp: 2, jumpy: true },
            { type: 'sweating', x: 2650, y: 'ground-0', hp: 2, slippery: true }
        ]},
        { triggerX: 4300, enemies: [
            { type: 'infection', x: 4350, y: 'ground-0', hp: 3, spreads: true },
            { type: 'odor', x: 4450, y: 'ground-0', areaEffect: true }
        ]},
        { triggerX: 7000, enemies: [
            { type: 'insomnia', x: 7050, y: 'ground-0', hp: 2, teleports: true },
            { type: 'restlessness', x: 7150, y: 'ground-0', speed: 4, erratic: true }
        ]},
        { triggerX: 9800, enemies: [
            { type: 'pain_spike', x: 9850, y: 'ground-0', hp: 4, burst: true },
            { type: 'discomfort', x: 9950, y: 'ground-0', hp: 3, persistent: true }
        ]}
    ],
    
    // Boss configuration - Neglect Boss
    boss: {
        triggerX: 12000,
        x: 12300,
        y: 'ground-150',
        type: 'neglect_boss',
        hp: 40,
        phases: [
            { 
                hpThreshold: 40, 
                attacks: ['pressure_wave'], 
                speed: 2, 
                message: 'The Neglect Boss emerges! Patient comfort levels dropping!',
                effect: 'comfort_drain'
            },
            { 
                hpThreshold: 30, 
                attacks: ['pressure_wave', 'hygiene_deterioration'], 
                speed: 2.5, 
                message: 'Hygiene standards failing! Infection risk increasing!',
                effect: 'dirty_environment'
            },
            { 
                hpThreshold: 20, 
                attacks: ['hygiene_deterioration', 'pain_amplification'], 
                speed: 3, 
                message: 'Pain levels spiking! Comfort measures critical!',
                effect: 'pain_increase'
            },
            { 
                hpThreshold: 10, 
                attacks: ['total_discomfort'], 
                speed: 4, 
                message: 'Complete care failure imminent! Apply all comfort measures!',
                effect: 'all_discomfort'
            }
        ]
    }
};

export default level;