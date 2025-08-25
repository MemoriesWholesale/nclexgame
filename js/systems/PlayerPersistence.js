/**
 * PlayerPersistence - Manages persistent player state across levels and respawns
 */
export class PlayerPersistence {
    constructor() {
        this.persistentState = {
            // Progression data that persists across levels
            lives: 3,
            currentWeapon: 1,
            armors: [0],
            currentArmorIndex: 0,
            // Optional: could add more progression elements like score, unlocks, etc.
            totalScore: 0,
            levelsCompleted: []
        };
    }

    /**
     * Save current player state for persistence
     */
    saveState(player, currentWeapon) {
        this.persistentState.lives = player.lives;
        this.persistentState.currentWeapon = currentWeapon;
        this.persistentState.armors = [...player.armors]; // Deep copy
        this.persistentState.currentArmorIndex = player.currentArmorIndex;
    }

    /**
     * Restore persistent state to player
     */
    restoreState(player) {
        player.lives = this.persistentState.lives;
        player.armors = [...this.persistentState.armors]; // Deep copy
        player.currentArmorIndex = this.persistentState.currentArmorIndex;
        
        return this.persistentState.currentWeapon;
    }

    /**
     * Reset to initial game state (for true fresh start)
     */
    resetToInitial() {
        this.persistentState = {
            lives: 3,
            currentWeapon: 1,
            armors: [0],
            currentArmorIndex: 0,
            totalScore: 0,
            levelsCompleted: []
        };
    }

    /**
     * Get current persistent state (for debugging/display)
     */
    getState() {
        return { ...this.persistentState };
    }

    /**
     * Mark level as completed
     */
    completeLevel(levelId) {
        if (!this.persistentState.levelsCompleted.includes(levelId)) {
            this.persistentState.levelsCompleted.push(levelId);
        }
    }

    /**
     * Check if level is completed
     */
    isLevelCompleted(levelId) {
        return this.persistentState.levelsCompleted.includes(levelId);
    }

    /**
     * Add score to total (optional feature for future)
     */
    addScore(points) {
        this.persistentState.totalScore += points;
    }
}