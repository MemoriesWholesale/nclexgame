# NCLEX Game - Refactored Architecture

## Overview
The NCLEX Platformer Game has been refactored from a monolithic structure to a modular, maintainable architecture. This document outlines the new structure and how to extend the system.

## Architecture Overview

### Core Systems
```
js/
├── systems/              # Modular game systems
│   ├── PlayerMedication.js    # Handles medication effects and interactions
│   ├── PlayerPhysics.js       # Manages player physics and platform interactions
│   ├── PlayerAnimation.js     # Controls player sprite animations
│   ├── PlayerInput.js         # Processes player input
│   ├── GameState.js           # Manages game state and transitions
│   ├── GameEvents.js          # Handles keyboard/mouse events
│   ├── GameRenderer.js        # Renders all game elements
│   ├── GameActions.js         # Handles game actions and logic
│   ├── LevelPlatforms.js      # Manages platform behaviors
│   └── LevelZones.js          # Handles zone-based effects
├── player.js             # Main player class (refactored)
├── game_refactored.js    # Main game controller (refactored)
├── levelManager_refactored.js # Level management (refactored)
├── enemy.js              # Enemy system (unchanged)
├── quiz.js               # Quiz system (unchanged)
└── levels/               # Level definitions (unchanged)
```

## Key Improvements

### 1. Separation of Concerns
- **Player class** now focuses on core state management
- **Systems** handle specific responsibilities (physics, rendering, input, etc.)
- **Level management** separated into distinct modules for platforms, zones, and content

### 2. Reduced Complexity
- **game.js**: Reduced from 1917 lines to ~300 lines in main controller
- **player.js**: Reduced from 668 lines to ~298 lines with core logic
- **levelManager.js**: Broken into focused modules

### 3. Enhanced Maintainability
- Clear module boundaries
- Consistent naming conventions
- Comprehensive documentation
- Easy to test individual systems

## System Descriptions

### PlayerMedication System
Handles all medication-related functionality:
- **Tolerance checking** with cooldown timers
- **Drug interactions** detection
- **Effect application** and removal
- **State persistence** across respawns

**Key Methods:**
- `applyMedication(medType)` - Apply medication effect
- `update()` - Update active medications
- `clearAll()` - Clear all effects (respawn/reset)

### PlayerPhysics System  
Manages all physics calculations:
- **Gravity and movement** physics
- **Platform collision** detection
- **Moving platform** synchronization
- **Special platform types** (orbiting, malfunctioning, etc.)

**Key Methods:**
- `update(groundY, platforms, pits, worldX)` - Main physics update
- `applySpillPhysics(onSpill)` - Handle slippery surfaces

### PlayerAnimation System
Controls sprite animations:
- **State-based animations** (idle, walk, jump, shoot, etc.)
- **Frame management** and timing
- **Sprite rendering** with fallback support
- **Animation transitions**

**Key Methods:**
- `updateState(spriteAnimations)` - Update animation state
- `render(ctx, sprite, loaded, animations, armorData)` - Render player

### GameState System
Centralized state management:
- **Game mode** transitions (menu, playing, paused, quiz)
- **Game objects** (boss, gate, pickups, etc.)
- **Timer management** (weapon cooldowns, spawn timers)
- **Level state** (world position, screen lock)

### GameEvents System
Event handling and input processing:
- **Keyboard events** (movement, actions, state changes)
- **Mouse events** (menu clicks, quiz interactions)
- **Event delegation** to appropriate systems

### GameRenderer System
Rendering operations:
- **Environment rendering** (ground, pits, textures)
- **Platform rendering** with type-specific styling
- **Menu rendering** (main menu, pause menu)
- **UI rendering** (player stats, death screen)
- **Debug rendering** (spatial axes for development)

### LevelPlatforms System
Platform behavior management:
- **Dynamic platforms** (rhythmic, breathing, temperature, etc.)
- **Platform state updates** based on timing and conditions
- **State reset** for clean level transitions
- **Medical-themed mechanics** (cardiac, respiratory, neurologic)

### LevelZones System
Zone-based effects:
- **Comfort zones** (temperature, hygiene, nutrition, sleep)
- **Vital zones** (cardiac, respiratory, renal, metabolic)
- **Lifecycle zones** (infant, toddler, adolescent, older adult)
- **Effect application** based on player position

## Extension Guidelines

### Adding New Medication Types
1. Update `MEDICATION_DURATIONS` in PlayerMedication.js
2. Add effect in `applyImmediateEffect()` method
3. Add removal logic in `removeEffect()` method
4. Update dangerous combinations if needed

### Adding New Platform Types
1. Add case in `LevelPlatforms.updateStates()`
2. Implement update method (e.g., `updateNewPlatformType()`)
3. Add reset logic in `resetPlatformState()`
4. Update level definitions to include new type

### Adding New Zone Types
1. Add initialization in appropriate `initialize*Zones()` method
2. Implement effect in corresponding `apply*ZoneEffect()` method
3. Update level definitions with new zone configuration

### Adding New Game States
1. Update GameState.current enum
2. Add state handling in GameEvents
3. Add rendering in GameRenderer
4. Update state transition logic

## Best Practices

### Code Organization
- Keep systems focused on single responsibilities
- Use dependency injection where possible
- Maintain consistent naming conventions
- Document public interfaces

### Performance Considerations
- Systems update only when necessary
- Use object pooling for frequently created/destroyed objects
- Minimize allocations in update loops
- Profile performance-critical sections

### Testing
- Each system can be tested independently
- Mock dependencies for isolated testing
- Test state transitions thoroughly
- Verify cleanup operations

## Migration Guide

To use the refactored code:

1. **Replace imports** in main.js:
   ```javascript
   import { initGame } from './game_refactored.js';
   ```

2. **Update level manager imports**:
   ```javascript
   import LevelManager from './levelManager_refactored.js';
   ```

3. **Verify system dependencies** are properly imported

4. **Test core functionality** (movement, levels, quiz, combat)

5. **Gradually migrate** additional features as needed

## Future Enhancements

### Potential Improvements
- **Save system** for progress persistence  
- **Audio system** with modular sound management
- **Particle effects** system for visual feedback
- **Performance profiler** for optimization
- **Level editor** for content creation
- **Accessibility features** for better usability

### Architectural Considerations
- Consider **Entity-Component-System** for even more modularity
- Implement **pub/sub pattern** for loose coupling
- Add **configuration system** for easy tweaking
- Consider **WebWorkers** for heavy computations