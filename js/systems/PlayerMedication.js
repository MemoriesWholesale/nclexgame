/**
 * PlayerMedication - Handles all medication effects and interactions for the player
 */
export class PlayerMedication {
    constructor(player) {
        this.player = player;
        this.activeMedications = [];
        this.medicationCooldowns = {};
        
        // Medication constants
        this.COOLDOWN_TIME = 60000; // 60 seconds
        this.DANGEROUS_COMBINATIONS = [
            ['morphine', 'benzodiazepine'], // Respiratory depression
            ['epinephrine', 'atropine'], // Cardiac stress
        ];
        
        this.MEDICATION_DURATIONS = {
            epinephrine: 10000,
            benzodiazepine: 8000,
            morphine: 6000,
            insulin: 15000,
            corticosteroid: 12000,
            atropine: 20000
        };
    }
    
    /**
     * Apply a medication effect to the player
     */
    applyMedication(medType) {
        if (!this.checkTolerance(medType)) {
            return { success: false, reason: 'tolerance' };
        }
        
        if (this.checkDangerousInteraction(medType)) {
            this.player.lives--;
            return { success: false, reason: 'interaction' };
        }
        
        const medication = this.createMedicationEffect(medType);
        this.activeMedications.push(medication);
        this.medicationCooldowns[medType] = Date.now();
        this.applyImmediateEffect(medType);
        
        return { success: true };
    }
    
    /**
     * Update active medications and remove expired ones
     */
    update() {
        const now = Date.now();
        
        for (let i = this.activeMedications.length - 1; i >= 0; i--) {
            const med = this.activeMedications[i];
            if (now - med.startTime > med.duration) {
                this.removeEffect(med.type);
                this.activeMedications.splice(i, 1);
            }
        }
    }
    
    /**
     * Clear all medication effects (used on respawn/reset)
     */
    clearAll() {
        this.activeMedications.forEach(med => this.removeEffect(med.type));
        this.activeMedications = [];
        this.medicationCooldowns = {};
    }
    
    // Private methods
    checkTolerance(medType) {
        const cooldown = this.medicationCooldowns[medType];
        if (!cooldown) return true;
        
        const timeSinceLast = Date.now() - cooldown;
        return timeSinceLast >= this.COOLDOWN_TIME;
    }
    
    checkDangerousInteraction(newMed) {
        return this.DANGEROUS_COMBINATIONS.some(combo => {
            const hasFirst = this.activeMedications.some(m => m.type === combo[0]);
            const hasSecond = this.activeMedications.some(m => m.type === combo[1]);
            return (hasFirst && newMed === combo[1]) || (hasSecond && newMed === combo[0]);
        });
    }
    
    createMedicationEffect(medType) {
        return {
            type: medType,
            startTime: Date.now(),
            duration: this.MEDICATION_DURATIONS[medType] || 10000
        };
    }
    
    applyImmediateEffect(medType) {
        const effects = {
            epinephrine: () => {
                this.player.speedMultiplier = 2;
                this.player.jumpMultiplier = 1.5;
            },
            benzodiazepine: () => {
                this.player.bulletTime = true;
            },
            morphine: () => {
                this.player.invincible = true;
            },
            insulin: () => {
                this.player.sizeScale = 0.5;
                this.player.width = 25;
                this.player.height = 46;
            },
            corticosteroid: () => {
                this.player.canDoubleJump = true;
                this.player.canGlide = true;
            },
            atropine: () => {
                this.player.hiddenPlatformsVisible = true;
            }
        };
        
        effects[medType]?.();
    }
    
    removeEffect(medType) {
        const removers = {
            epinephrine: () => {
                this.player.speedMultiplier = 1;
                this.player.jumpMultiplier = 1;
            },
            benzodiazepine: () => {
                this.player.bulletTime = false;
            },
            morphine: () => {
                this.player.invincible = false;
            },
            insulin: () => {
                this.player.sizeScale = 1;
                this.player.width = 50;
                this.player.height = 92;
            },
            corticosteroid: () => {
                this.player.canDoubleJump = false;
                this.player.canGlide = false;
                this.player.isGliding = false;
            },
            atropine: () => {
                this.player.hiddenPlatformsVisible = false;
            }
        };
        
        removers[medType]?.();
    }
}