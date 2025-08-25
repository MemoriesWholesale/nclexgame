// js/levels/level_4.js
// Psychosocial Integrity Level - Mental Health & Perception Theme

const level = {
    id: 4,
    name: "Psychosocial Integrity",
    theme: "mental_health_journey",
    color: '#ADD8E6', // Light blue for mental health awareness
    questionFile: 'data/psychosocial_integrity.json',
    worldLength: 15000,
    
    // Starting configuration
    playerStart: { x: 100, y: 'ground-0' },
    
    // Psychological zones that affect gameplay
    psychZones: [
        { id: 'anxiety_tunnel', startX: 1500, endX: 2200, type: 'anxiety', 
          effect: 'tunnel_vision', intensity: 0.7 },
        { id: 'depression_fog', startX: 2800, endX: 3600, type: 'depression', 
          effect: 'darkness_slowness', intensity: 0.8 },
        { id: 'mania_rush', startX: 4200, endX: 5000, type: 'mania', 
          effect: 'speed_up', intensity: 2.0 },
        { id: 'confusion_zone', startX: 5500, endX: 6500, type: 'confusion', 
          effect: 'inverted_controls', intensity: 1.0 },
        { id: 'dissociation_realm', startX: 7000, endX: 8000, type: 'dissociation', 
          effect: 'mirror_twin', intensity: 1.0 },
        { id: 'psychosis_void', startX: 8500, endX: 9500, type: 'psychosis', 
          effect: 'upside_down', intensity: 1.0 },
        { id: 'recovery_garden', startX: 10000, endX: 11000, type: 'recovery', 
          effect: 'gradual_normal', intensity: 0.5 }
    ],
    
    // Platforms
    platforms: [
        // --- SECTION 1: REALITY BASELINE ---
        // Normal platforms to establish baseline
        { id: 'reality_1', x: 250, y: 'ground-100', width: 150, height: 20, type: 'static', activated: true },
        { id: 'reality_2', x: 450, y: 'ground-150', width: 150, height: 20, type: 'static', activated: true },
        { id: 'reality_3', x: 650, y: 'ground-200', width: 150, height: 20, type: 'static', activated: true },
        { id: 'checkpoint_1', x: 850, y: 'ground-100', width: 200, height: 20, type: 'static', activated: true },
        
        // --- SECTION 2: ANXIETY TUNNEL ---
        // Platforms get progressively smaller (representing narrowing perception)
        { id: 'anxiety_1', x: 1600, y: 'ground-100', width: 120, height: 20, type: 'static', activated: true },
        { id: 'anxiety_2', x: 1750, y: 'ground-200', width: 100, height: 20, type: 'static', activated: true },
        { id: 'anxiety_3', x: 1880, y: 'ground-250', width: 80, height: 20, type: 'static', activated: true },
        { id: 'anxiety_4', x: 1990, y: 'ground-300', width: 60, height: 20, type: 'static', activated: true },
        { id: 'anxiety_5', x: 2080, y: 'ground-250', width: 40, height: 20, type: 'static', activated: true },
        
        // NPC Benefit: Breathing platforms (expand when activated)
        { id: 'breathing_space_1', x: 1700, y: 'ground-350', width: 40, height: 20, type: 'expanding', 
          activated: false, expandedWidth: 150 },
        { id: 'breathing_space_2', x: 1950, y: 'ground-400', width: 40, height: 20, type: 'expanding', 
          activated: false, expandedWidth: 150 },
        
        // --- SECTION 3: DEPRESSION FOG ---
        // Platforms that fade in and out (representing lack of clarity)
        { id: 'fog_platform_1', x: 2900, y: 'ground-150', width: 100, height: 20, type: 'fading', 
          activated: true, fadeTime: 2000, solidTime: 1000 },
        { id: 'fog_platform_2', x: 3050, y: 'ground-200', width: 100, height: 20, type: 'fading', 
          activated: true, fadeTime: 2000, solidTime: 1000, offset: 1000 },
        { id: 'fog_platform_3', x: 3200, y: 'ground-250', width: 100, height: 20, type: 'fading', 
          activated: true, fadeTime: 2000, solidTime: 1000, offset: 2000 },
        { id: 'fog_platform_4', x: 3350, y: 'ground-200', width: 100, height: 20, type: 'fading', 
          activated: true, fadeTime: 2000, solidTime: 1000, offset: 3000 },
        
        // NPC Benefit: Solid hope bridges
        { id: 'hope_bridge_1', x: 2900, y: 'ground-350', width: 550, height: 20, type: 'static', activated: false },
        
        // --- SECTION 4: MANIA RUSH ---
        // Fast-moving platforms and quick decisions
        { id: 'mania_racer_1', x: 4300, y: 'ground-150', width: 80, height: 20, type: 'moving', 
          activated: true, movement: { startX: 4300, endX: 4500, speed: 6, horizontal: true } },
        { id: 'mania_racer_2', x: 4600, y: 'ground-200', width: 80, height: 20, type: 'moving', 
          activated: true, movement: { startX: 4600, endX: 4400, speed: -6, horizontal: true } },
        { id: 'mania_racer_3', x: 4700, y: 'ground-250', width: 80, height: 20, type: 'moving', 
          activated: true, movement: { startX: 4700, endX: 4900, speed: 6, horizontal: true } },
        
        // Impulse platforms (disappear very quickly)
        { id: 'impulse_1', x: 4500, y: 'ground-350', width: 60, height: 20, type: 'disappearing', 
          activated: true, timing: { onTime: 500, offTime: 500 } },
        { id: 'impulse_2', x: 4650, y: 'ground-400', width: 60, height: 20, type: 'disappearing', 
          activated: true, timing: { onTime: 500, offTime: 500, offset: 250 } },
        { id: 'impulse_3', x: 4800, y: 'ground-350', width: 60, height: 20, type: 'disappearing', 
          activated: true, timing: { onTime: 500, offTime: 500, offset: 500 } },
        
        // NPC Benefit: Stabilizer platform
        { id: 'mood_stabilizer', x: 4300, y: 'ground-500', width: 600, height: 20, type: 'static', activated: false },
        
        // --- SECTION 5: CONFUSION ZONE (INVERTED CONTROLS) ---
        // Simple platforms but controls are reversed
        { id: 'backwards_1', x: 5600, y: 'ground-150', width: 100, height: 20, type: 'static', activated: true },
        { id: 'backwards_2', x: 5750, y: 'ground-200', width: 100, height: 20, type: 'static', activated: true },
        { id: 'backwards_3', x: 5900, y: 'ground-150', width: 100, height: 20, type: 'static', activated: true },
        { id: 'backwards_4', x: 6050, y: 'ground-200', width: 100, height: 20, type: 'static', activated: true },
        { id: 'backwards_5', x: 6200, y: 'ground-150', width: 100, height: 20, type: 'static', activated: true },
        
        // NPC Benefit: Reorientation platform
        { id: 'clarity_path', x: 5600, y: 'ground-350', width: 600, height: 20, type: 'static', 
          activated: false, removesEffect: 'inverted_controls' },
        
        // --- SECTION 6: DISSOCIATION REALM (MIRROR TWIN) ---
        // Platforms that create mirror images
        { id: 'mirror_platform_1', x: 7100, y: 'ground-150', width: 100, height: 20, type: 'mirror', 
          activated: true, createsTwin: true },
        { id: 'mirror_platform_2', x: 7300, y: 'ground-200', width: 100, height: 20, type: 'mirror', 
          activated: true, createsTwin: true },
        { id: 'mirror_platform_3', x: 7500, y: 'ground-250', width: 100, height: 20, type: 'mirror', 
          activated: true, createsTwin: true },
        { id: 'mirror_platform_4', x: 7700, y: 'ground-200', width: 100, height: 20, type: 'mirror', 
          activated: true, createsTwin: true },
        { id: 'mirror_platform_5', x: 7900, y: 'ground-150', width: 100, height: 20, type: 'mirror', 
          activated: true, createsTwin: true },
        
        // NPC Benefit: Grounding platform (removes twin)
        { id: 'grounding_reality', x: 7100, y: 'ground-400', width: 800, height: 20, type: 'static', 
          activated: false, removesEffect: 'mirror_twin' },
        
        // --- SECTION 7: PSYCHOSIS VOID (UPSIDE DOWN) ---
        // World flips upside down
        { id: 'void_platform_1', x: 8600, y: 'ground-150', width: 100, height: 20, type: 'gravity_flip', activated: true },
        { id: 'void_platform_2', x: 8800, y: 'ground-200', width: 100, height: 20, type: 'gravity_flip', activated: true },
        { id: 'void_platform_3', x: 9000, y: 'ground-250', width: 100, height: 20, type: 'gravity_flip', activated: true },
        { id: 'void_platform_4', x: 9200, y: 'ground-200', width: 100, height: 20, type: 'gravity_flip', activated: true },
        { id: 'void_platform_5', x: 9400, y: 'ground-150', width: 100, height: 20, type: 'gravity_flip', activated: true },
        
        // Ceiling platforms (become floor when upside down)
        { id: 'ceiling_1', x: 8700, y: 'ground-500', width: 100, height: 20, type: 'static', activated: true },
        { id: 'ceiling_2', x: 8900, y: 'ground-550', width: 100, height: 20, type: 'static', activated: true },
        { id: 'ceiling_3', x: 9100, y: 'ground-600', width: 100, height: 20, type: 'static', activated: true },
        { id: 'ceiling_4', x: 9300, y: 'ground-550', width: 100, height: 20, type: 'static', activated: true },
        
        // NPC Benefit: Reality anchor
        { id: 'reality_anchor', x: 8600, y: 'ground-350', width: 800, height: 20, type: 'static', 
          activated: false, removesEffect: 'upside_down' },
        
        // --- SECTION 8: RECOVERY GARDEN ---
        // Gradually returning to normal
        { id: 'recovery_1', x: 10100, y: 'ground-150', width: 150, height: 20, type: 'static', activated: true },
        { id: 'recovery_2', x: 10350, y: 'ground-200', width: 150, height: 20, type: 'static', activated: true },
        { id: 'recovery_3', x: 10600, y: 'ground-150', width: 150, height: 20, type: 'static', activated: true },
        { id: 'recovery_4', x: 10850, y: 'ground-100', width: 150, height: 20, type: 'static', activated: true },
        
        // Pre-boss arena
        { id: 'pre_boss_platform', x: 11200, y: 'ground-100', width: 300, height: 20, type: 'static', activated: true },
        { id: 'boss_arena', x: 11700, y: 'ground-0', width: 2000, height: 20, type: 'static', activated: true }
    ],
    
    // NPCs - Mental health professionals
    npcs: [
        { id: 'therapist_1', type: 'therapist', x: 1100, y: 'ground-60',
          dialogue: "Anxiety ahead. Remember: breathe deeply. Let me create safe spaces.",
          activates: 'breathing_space_1,breathing_space_2',
          preventsEffect: 'tunnel_vision' },
        
        { id: 'psychiatrist_1', type: 'psychiatrist', x: 2700, y: 'ground-60',
          dialogue: "Depression fog is thick here. Hold onto hope - I'll light the way.",
          activates: 'hope_bridge_1',
          preventsEffect: 'darkness_slowness' },
        
        { id: 'social_worker_1', type: 'social_worker', x: 4100, y: 'ground-60',
          dialogue: "Mania makes everything race. Let's find stability together.",
          activates: 'mood_stabilizer',
          preventsEffect: 'speed_up' },
        
        { id: 'counselor_1', type: 'counselor', x: 5400, y: 'ground-60',
          dialogue: "Confusion is temporary. Focus on my voice for clarity.",
          activates: 'clarity_path',
          preventsEffect: 'inverted_controls' },
        
        { id: 'peer_support_1', type: 'peer_support', x: 6900, y: 'ground-60',
          dialogue: "I've been where you are. You're not alone. Stay grounded.",
          activates: 'grounding_reality',
          preventsEffect: 'mirror_twin' },
        
        { id: 'crisis_counselor_1', type: 'crisis_counselor', x: 8400, y: 'ground-60',
          dialogue: "Reality feels broken, but it's still there. Let me anchor you.",
          activates: 'reality_anchor',
          preventsEffect: 'upside_down' },
        
        { id: 'recovery_coach_1', type: 'recovery_coach', x: 10000, y: 'ground-60', 
          dialogue: "You've come so far! Recovery isn't linear, but you're doing it.", 
          givesItem: 'resilience_boost' },
        
        { id: 'mental_health_nurse', type: 'nurse', x: 11100, y: 'pre_boss_platform-top', 
          dialogue: "The Stigma Boss feeds on misconceptions. Knowledge is your weapon!", 
          givesItem: 'clarity_shield' }
    ],
    
    // Hazards
    hazards: [
        { type: 'pit', x: 1100, width: 200 },
        // **FIX**: Reduced from 600px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 2200, width: 200 },
        // **FIX**: Reduced from 600px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 3600, width: 200 },
        // **FIX**: Reduced from 500px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 5000, width: 200 },
        // **FIX**: Reduced from 700px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 6300, width: 200 },
        // **FIX**: Reduced from 500px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 8000, width: 200 },
        // **FIX**: Reduced from 500px to 250px to make it jumpable without NPC help
        { type: 'pit', x: 9500, width: 200 },
        
        // Thought bubbles (harmful if touched)
        { id: 'intrusive_thought_1', type: 'thought_bubble', x: 2000, y: 'ground-400', 
          text: 'worthless', damage: true, movement: { speed: 1, pattern: 'sine' } },
        { id: 'intrusive_thought_2', type: 'thought_bubble', x: 3400, y: 'ground-400', 
          text: 'failure', damage: true, movement: { speed: 1, pattern: 'sine' } },
        { id: 'intrusive_thought_3', type: 'thought_bubble', x: 7600, y: 'ground-400', 
          text: 'alone', damage: true, movement: { speed: 1, pattern: 'sine' } }
    ],
    
    // Items
    items: [
        { type: 'chest', x: 1050, y: 'checkpoint_1-top', contains: 'coping_skill', subtype: 'breathing', requiresQuestion: true },
        { type: 'chest', x: 2150, y: 'ground-400', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 3500, y: 'ground-300', contains: 'coping_skill', subtype: 'grounding', requiresQuestion: true },
        { type: 'chest', x: 4900, y: 'ground-450', contains: 'weapon_upgrade', weaponId: 5, requiresQuestion: true },
        { type: 'health_pack', x: 5200, y: 'ground-30' },
        { type: 'chest', x: 6250, y: 'ground-300', contains: 'coping_skill', subtype: 'mindfulness', requiresQuestion: true },
        { type: 'chest', x: 7950, y: 'ground-400', contains: 'extra_life', requiresQuestion: true },
        { type: 'chest', x: 9450, y: 'ground-500', contains: 'weapon_upgrade', weaponId: 6, requiresQuestion: true },
        { type: 'health_pack', x: 10500, y: 'ground-30' }
    ],
    
    // Enemy waves - Represent mental health challenges
    enemyWaves: [
        { triggerX: 1200, enemies: [
            { type: 'anxiety_spark', x: 1250, y: 'ground-0', speed: 3, jumpy: true },
            { type: 'anxiety_spark', x: 1350, y: 'ground-0', speed: 3, jumpy: true }
        ]},
        { triggerX: 2400, enemies: [
            { type: 'depression_cloud', x: 2450, y: 'ground-0', hp: 2, slow: true },
            { type: 'anxiety_spark', x: 2550, y: 'ground-0', speed: 3, jumpy: true }
        ]},
        { triggerX: 4000, enemies: [
            { type: 'manic_burst', x: 4050, y: 'ground-0', hp: 1, speed: 6, erratic: true },
            { type: 'manic_burst', x: 4150, y: 'ground-0', hp: 1, speed: 6, erratic: true }
        ]},
        { triggerX: 6500, enemies: [
            { type: 'confusion_wisp', x: 6550, y: 'ground-0', hp: 2, teleports: true },
            { type: 'confusion_wisp', x: 6650, y: 'ground-0', hp: 2, teleports: true }
        ]},
        { triggerX: 8200, enemies: [
            { type: 'hallucination', x: 8250, y: 'ground-0', hp: 3, phases: true },
            { type: 'anxiety_spark', x: 8350, y: 'ground-0', speed: 4, jumpy: true }
        ]}
    ],
    
    // Boss configuration - Stigma Boss
    boss: {
        triggerX: 12500,
        x: 12800,
        y: 'ground-150',
        type: 'stigma_boss',
        hp: 35,
        phases: [
            { 
                hpThreshold: 35, 
                attacks: ['misconception_blast'], 
                speed: 2, 
                message: 'Stigma manifests! Challenge the misconceptions!',
                effect: 'minor_confusion'
            },
            { 
                hpThreshold: 25, 
                attacks: ['misconception_blast', 'isolation_field'], 
                speed: 3, 
                message: 'Isolation intensifies! Connection is key!',
                effect: 'screen_darkening'
            },
            { 
                hpThreshold: 15, 
                attacks: ['isolation_field', 'judgment_wave'], 
                speed: 3, 
                message: 'Judgment overwhelms! Self-compassion is strength!',
                effect: 'control_reversal'
            },
            { 
                hpThreshold: 5, 
                attacks: ['reality_shatter'], 
                speed: 4, 
                message: 'Reality fractures! Hold onto what you know is true!',
                effect: 'all_effects'
            }
        ]
    }
};

export default level;