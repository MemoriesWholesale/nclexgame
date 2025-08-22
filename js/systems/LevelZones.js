/**
 * LevelZones - Handles zone-based effects in levels (comfort zones, vital zones, etc.)
 */
export class LevelZones {
    constructor(levelManager) {
        this.levelManager = levelManager;
    }
    
    /**
     * Initialize all zone states for a level
     */
    initializeZones(level) {
        this.initializeComfortZones(level);
        this.initializeVitalZones(level);
        this.initializeLifecycleZones(level);
    }
    
    /**
     * Apply zone effects to player based on their world position
     */
    applyEffects(player, worldX, canvas) {
        const level = this.levelManager.currentLevel;
        if (!level) return;
        
        const playerWorldX = player.x - worldX;
        
        this.applyComfortZoneEffects(level, player, playerWorldX);
        this.applyVitalZoneEffects(level, player, playerWorldX);
        this.applyLifecycleZoneEffects(level, player, playerWorldX);
    }
    
    // Zone initialization methods
    initializeComfortZones(level) {
        if (!level.comfortZones) return;
        
        level.comfortZones.forEach(zone => {
            switch (zone.type) {
                case 'temperature':
                    zone.playerTemp = 98.6; // Normal body temp
                    break;
                case 'hygiene':
                    zone.cleanlinessLevel = 0;
                    zone.hygieneSequence = [];
                    break;
                case 'nutrition':
                    zone.hungerLevel = 100;
                    zone.lastFeedTime = 0;
                    break;
                case 'sleep':
                    zone.currentNoise = zone.noiseLevel;
                    break;
            }
        });
    }
    
    initializeVitalZones(level) {
        if (!level.vitalZones) return;
        
        level.vitalZones.forEach(zone => {
            switch (zone.type) {
                case 'cardiac':
                    zone.currentHR = zone.heartRate;
                    zone.rhythmStable = true;
                    break;
                case 'respiratory':
                    zone.currentResp = zone.respRate;
                    zone.currentO2 = zone.o2Sat;
                    break;
                case 'renal':
                    zone.currentBalance = zone.fluidBalance;
                    zone.currentOutput = zone.urineOutput;
                    break;
                case 'metabolic':
                    zone.currentSugar = zone.bloodSugar;
                    zone.currentPH = zone.pH;
                    break;
            }
        });
    }
    
    initializeLifecycleZones(level) {
        if (!level.lifecycleZones) return;
        
        level.lifecycleZones.forEach(zone => {
            zone.milestonesCompleted = [];
            zone.preventionMeasures = [];
            zone.healthStatus = 100;
        });
    }
    
    // Zone effect application methods
    applyComfortZoneEffects(level, player, playerWorldX) {
        if (!level.comfortZones) return;
        
        for (const zone of level.comfortZones) {
            if (this.isPlayerInZone(playerWorldX, zone)) {
                this.applyComfortZoneEffect(zone, player);
            }
        }
    }
    
    applyVitalZoneEffects(level, player, playerWorldX) {
        if (!level.vitalZones) return;
        
        for (const zone of level.vitalZones) {
            if (this.isPlayerInZone(playerWorldX, zone)) {
                this.applyVitalZoneEffect(zone, player);
            }
        }
    }
    
    applyLifecycleZoneEffects(level, player, playerWorldX) {
        if (!level.lifecycleZones) return;
        
        for (const zone of level.lifecycleZones) {
            if (this.isPlayerInZone(playerWorldX, zone)) {
                this.applyLifecycleZoneEffect(zone, player);
            }
        }
    }
    
    // Individual zone effect methods
    applyComfortZoneEffect(zone, player) {
        switch (zone.type) {
            case 'temperature':
                this.applyTemperatureEffect(zone, player);
                break;
            case 'hygiene':
                this.applyHygieneEffect(zone, player);
                break;
            case 'nutrition':
                this.applyNutritionEffect(zone, player);
                break;
            case 'sleep':
                this.applySleepEffect(zone, player);
                break;
        }
    }
    
    applyVitalZoneEffect(zone, player) {
        switch (zone.type) {
            case 'cardiac':
                this.applyCardiacEffect(zone, player);
                break;
            case 'respiratory':
                this.applyRespiratoryEffect(zone, player);
                break;
            case 'renal':
                this.applyRenalEffect(zone, player);
                break;
            case 'neurologic':
                this.applyNeurologicEffect(zone, player);
                break;
            case 'metabolic':
                this.applyMetabolicEffect(zone, player);
                break;
            case 'shock':
                this.applyShockEffect(zone, player);
                break;
        }
    }
    
    applyLifecycleZoneEffect(zone, player) {
        switch (zone.stage) {
            case 'infant':
                this.applyInfantEffect(zone, player);
                break;
            case 'toddler':
                this.applyToddlerEffect(zone, player);
                break;
            case 'adolescent':
                this.applyAdolescentEffect(zone, player);
                break;
            case 'older_adult':
                this.applyOlderAdultEffect(zone, player);
                break;
        }
    }
    
    // Specific effect implementations
    applyTemperatureEffect(zone, player) {
        const tempDiff = zone.idealTemp - zone.currentTemp;
        zone.currentTemp += tempDiff * 0.01;
        
        if (Math.abs(zone.currentTemp - zone.idealTemp) > 10) {
            player.comfortDamage = true;
        }
    }
    
    applyHygieneEffect(zone, player) {
        zone.cleanlinessLevel = Math.max(0, zone.cleanlinessLevel - 0.5);
        if (zone.cleanlinessLevel < 30) {
            player.speedMultiplier *= 0.8;
        }
    }
    
    applyNutritionEffect(zone, player) {
        zone.hungerLevel = Math.max(0, zone.hungerLevel - 0.3);
        if (zone.hungerLevel < 30) {
            player.jumpMultiplier *= 0.8;
        }
    }
    
    applySleepEffect(zone, player) {
        if (zone.currentNoise > zone.maxNoise) {
            player.fatigue = (player.fatigue || 0) + 0.5;
            if (player.fatigue > 50) {
                player.speedMultiplier *= 0.7;
            }
        }
    }
    
    applyCardiacEffect(zone, player) {
        if (zone.arrhythmiaRisk && Math.random() < 0.01) {
            zone.rhythmStable = false;
            player.irregularMovement = true;
        }
    }
    
    applyRespiratoryEffect(zone, player) {
        zone.currentO2 = Math.max(80, zone.currentO2 - 0.2);
        if (zone.currentO2 < 90) {
            player.speedMultiplier *= (zone.currentO2 / 100);
        }
    }
    
    applyRenalEffect(zone, player) {
        if (Math.abs(zone.currentBalance) > 500) {
            player.jumpMultiplier *= 0.8;
        }
    }
    
    applyNeurologicEffect(zone, player) {
        if (zone.icpLevel > 20) {
            player.visionBlur = (zone.icpLevel - 20) / 10;
        }
    }
    
    applyMetabolicEffect(zone, player) {
        if (zone.currentPH < 7.35 || zone.currentPH > 7.45) {
            player.metabolicDamage = true;
        }
    }
    
    applyShockEffect(zone, player) {
        if (zone.perfusion < 60) {
            const perfusionRatio = zone.perfusion / 100;
            player.speedMultiplier *= perfusionRatio;
            player.jumpMultiplier *= perfusionRatio;
        }
    }
    
    applyInfantEffect(zone, player) {
        if (zone.mechanics === 'crawling') {
            player.maxHeight = 60;
            player.crawling = true;
        }
    }
    
    applyToddlerEffect(zone, player) {
        if (zone.mechanics === 'exploration') {
            player.curiosity = true;
            player.speedMultiplier *= 1.2;
        }
    }
    
    applyAdolescentEffect(zone, player) {
        if (zone.mechanics === 'risk_taking') {
            player.invincibilityFrames = 30;
            player.riskTaking = true;
        }
    }
    
    applyOlderAdultEffect(zone, player) {
        if (zone.mechanics === 'adaptation') {
            player.speedMultiplier *= 0.7;
            player.fallRisk = true;
        }
    }
    
    /**
     * Check if player is within a zone's boundaries
     */
    isPlayerInZone(playerWorldX, zone) {
        return playerWorldX >= zone.startX && playerWorldX <= zone.endX;
    }
}