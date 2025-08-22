# Game Systems Documentation

This directory contains modular game systems that handle specific aspects of gameplay. Each system is designed to be focused, testable, and maintainable.

## System Overview

### Player Systems
- **PlayerMedication.js** - Manages medication effects, interactions, and tolerances
- **PlayerPhysics.js** - Handles physics, collisions, and platform interactions  
- **PlayerAnimation.js** - Controls sprite animations and rendering
- **PlayerInput.js** - Processes keyboard input and movement

### Game Management Systems  
- **GameState.js** - Manages game state, objects, and timers
- **GameEvents.js** - Handles keyboard/mouse events and user interactions
- **GameRenderer.js** - Renders game elements (environment, UI, objects)
- **GameActions.js** - Handles game actions (level selection, interactions, combat)

### Level Systems
- **LevelPlatforms.js** - Manages dynamic platform behaviors and states
- **LevelZones.js** - Handles zone-based effects and medical mechanics

## System Interaction Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GameEvents    │───▶│   GameActions   │───▶│   GameState     │
│ (Input Handling)│    │ (Game Logic)    │    │ (State Mgmt)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Player      │    │  LevelManager   │    │  GameRenderer   │
│   (Core State)  │    │ (Level Content) │    │   (Rendering)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Player Systems  │    │ Level Systems   │
│ - Medication    │    │ - Platforms     │
│ - Physics       │    │ - Zones         │
│ - Animation     │    │                 │
│ - Input         │    │                 │
└─────────────────┘    └─────────────────┘
```

## Usage Examples

### Using Player Systems
```javascript
// Player class initialization
constructor(canvas) {
    // ... core properties ...
    
    // Initialize subsystems
    this.medication = new PlayerMedication(this);
    this.physics = new PlayerPhysics(this);
    this.animation = new PlayerAnimation(this);
    this.input = new PlayerInput(this);
}

// Using systems in methods
handleInput(keys, onSpill) {
    this.input.handleInput(keys, onSpill);
    this.physics.applySpillPhysics(onSpill);
}
```

### Using Game Systems  
```javascript
// Game class initialization
initializeSystems() {
    this.gameState = new GameState();
    this.renderer = new GameRenderer(this.canvas, this.ctx);
    this.actions = new GameActions(this.gameState, this.player, ...);
    this.events = new GameEvents(this.gameState, this.player, ...);
}

// Using systems in game loop
render() {
    if (this.gameState.current === 'menu') {
        this.renderer.renderMenu(this.levelData);
    }
    // ... other rendering ...
}
```

### Using Level Systems
```javascript
// LevelManager initialization
constructor() {
    this.platforms = new LevelPlatforms(this);
    this.zones = new LevelZones(this);
}

// Using systems in level updates
updateLevel(player, worldX, canvas) {
    this.platforms.updateStates(platforms, worldX, player, canvas);
    this.zones.applyEffects(player, worldX, canvas);
}
```

## System Dependencies

### Dependency Chart
```
GameEvents ──┐
GameActions ─┼──▶ GameState
GameRenderer─┘

Player ──┐
         ├──▶ PlayerMedication
         ├──▶ PlayerPhysics  
         ├──▶ PlayerAnimation
         └──▶ PlayerInput

LevelManager ──┐
               ├──▶ LevelPlatforms
               └──▶ LevelZones
```

## Testing Strategy

### Unit Testing
Each system can be tested in isolation:
```javascript
// Example: Testing PlayerMedication
const mockPlayer = { /* minimal player state */ };
const medication = new PlayerMedication(mockPlayer);

// Test medication application
const result = medication.applyMedication('epinephrine');
assert.equal(result.success, true);
assert.equal(mockPlayer.speedMultiplier, 2);
```

### Integration Testing
Test system interactions:
```javascript
// Example: Testing Player + Systems
const player = new Player(mockCanvas);
const keys = { 'ArrowLeft': true };
player.handleInput(keys, false);

// Verify input system affected physics
assert.equal(player.facing, -1);
assert.equal(player.vx, -5);
```

## Performance Notes

### Optimization Guidelines
1. **Avoid allocations** in update loops
2. **Cache calculations** when possible  
3. **Early exit** from expensive operations
4. **Batch operations** when updating multiple objects
5. **Profile regularly** to identify bottlenecks

### System Performance Tips
- **GameRenderer**: Use object pooling for frequently rendered elements
- **PlayerPhysics**: Optimize collision detection with spatial partitioning
- **LevelPlatforms**: Update only active/visible platforms
- **GameEvents**: Debounce rapid input events

## Extending Systems

### Adding New Features
1. **Identify** which system should handle the feature
2. **Extend** the appropriate system with new methods
3. **Update** system interfaces if needed
4. **Add tests** for the new functionality
5. **Document** the changes

### Creating New Systems
1. **Define** clear responsibilities and interfaces
2. **Minimize** dependencies on other systems  
3. **Follow** consistent naming conventions
4. **Add** comprehensive documentation
5. **Include** usage examples