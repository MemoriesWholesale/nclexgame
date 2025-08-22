/**
 * LevelPlatforms - Handles all platform-related functionality for levels
 */
export class LevelPlatforms {
    constructor(levelManager) {
        this.levelManager = levelManager;
    }
    
    /**
     * Update all platform states based on their types and current conditions
     */
    updateStates(platforms, worldX, player, canvas) {
        const now = Date.now();
        
        platforms.forEach(platform => {
            if (!platform.activated) return;
            
            switch (platform.type) {
                case 'rhythmic':
                    this.updateRhythmicPlatform(platform, now);
                    break;
                case 'breathing':
                    this.updateBreathingPlatform(platform, now);
                    break;
                case 'oxygen_dependent':
                    this.updateOxygenPlatform(platform);
                    break;
                case 'fluid_sensitive':
                    this.updateFluidSensitivePlatform(platform);
                    break;
                case 'tilting':
                    this.updateTiltingPlatform(platform, player);
                    break;
                case 'temperature':
                    this.updateTemperaturePlatform(platform, now);
                    break;
                case 'noise_sensitive':
                    this.updateNoiseSensitivePlatform(platform, platforms);
                    break;
                case 'pulsing':
                    this.updatePulsingPlatform(platform, now);
                    break;
                case 'milestone':
                    this.updateMilestonePlatform(platform, now);
                    break;
                case 'growth_spurt':
                    this.updateGrowthSpurtPlatform(platform);
                    break;
                case 'bubble':
                    this.updateBubblePlatform(platform, now);
                    break;
                case 'balance':
                    this.updateBalancePlatform(platform, player);
                    break;
                case 'reflex_test':
                    this.updateReflexTestPlatform(platform, player, now);
                    break;
                case 'organ_system':
                    this.updateOrganSystemPlatform(platform, now);
                    break;
                case 'pH_sensitive':
                    this.updatePHSensitivePlatform(platform);
                    break;
            }
        });
    }
    
    /**
     * Reset all dynamic platform states for clean level transitions
     */
    resetStates(platforms) {
        platforms.forEach(platform => {
            this.resetPlatformState(platform);
        });
    }
    
    // Platform type update methods
    updateRhythmicPlatform(platform, now) {
        const beatPhase = ((now + (platform.offset || 0)) % platform.beatInterval) / platform.beatInterval;
        
        if (platform.irregular) {
            // Atrial fibrillation - irregular rhythm
            platform.visible = Math.random() > 0.3;
        } else {
            // Normal sinus rhythm - regular beats
            platform.visible = beatPhase < 0.6;
        }
        
        platform.activated = platform.visible;
    }
    
    updateBreathingPlatform(platform, now) {
        const breathPhase = ((now + (platform.offset || 0)) % 3000) / 3000;
        const expansion = Math.sin(breathPhase * Math.PI * 2) * 0.5 + 0.5;
        
        platform.width = platform.minWidth + (platform.maxWidth - platform.minWidth) * expansion;
        const widthDiff = platform.width - platform.minWidth;
        platform.worldX = platform.originalX - widthDiff / 2;
        if (!platform.originalX) platform.originalX = platform.worldX;
    }
    
    updateOxygenPlatform(platform) {
        let currentO2 = platform.currentO2 || 95;
        
        if (currentO2 < platform.minO2) {
            platform.opacity = Math.max(0, (currentO2 - 80) / (platform.minO2 - 80));
            platform.activated = platform.opacity > 0.3;
        } else {
            platform.opacity = 1;
        }
    }
    
    updateFluidSensitivePlatform(platform) {
        if (platform.sinks) {
            const sinkAmount = (platform.currentFluid - 50) * 0.5;
            platform.y = platform.originalY + sinkAmount;
            if (!platform.originalY) platform.originalY = platform.y;
        }
    }
    
    updateTiltingPlatform(platform, player) {
        const angleDiff = platform.targetAngle - platform.currentAngle;
        platform.currentAngle += angleDiff * 0.02;
        
        // Apply tilt physics to player if on platform
        if (player.onPlatform === platform) {
            player.vx += Math.sin(platform.currentAngle * Math.PI / 180) * 0.3;
        }
    }
    
    updateTemperaturePlatform(platform, now) {
        if (platform.temp === 'hot') {
            platform.heatWave = Math.sin(now * 0.01) * 5;
        } else if (platform.temp === 'cold') {
            platform.frostLevel = Math.sin(now * 0.005) * 0.3 + 0.7;
        }
    }
    
    updateNoiseSensitivePlatform(platform, platforms) {
        let totalNoise = 0;
        platforms.forEach(other => {
            if (other.type === 'noisy' && other.activated) {
                const distance = Math.abs(platform.worldX - other.worldX);
                if (distance < 500) {
                    totalNoise += other.noiseLevel * (1 - distance / 500);
                }
            }
        });
        
        if (totalNoise > platform.maxNoise && platform.breaksIfLoud) {
            platform.breaking = true;
            platform.breakTimer = (platform.breakTimer || 0) + 1;
            if (platform.breakTimer > 60) {
                platform.activated = false;
                setTimeout(() => {
                    platform.activated = true;
                    platform.breaking = false;
                    platform.breakTimer = 0;
                }, 3000);
            }
        }
    }
    
    updatePulsingPlatform(platform, now) {
        const pulsePhase = ((now + (platform.offset || 0)) % platform.pulseRate) / platform.pulseRate;
        const safePhase = platform.safeWindow / platform.pulseRate;
        
        platform.isPainful = pulsePhase > safePhase;
        platform.painIntensity = platform.isPainful ? platform.painLevel : 0;
        platform.pulseScale = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.1;
    }
    
    updateMilestonePlatform(platform, now) {
        if (platform.skill === 'rolling' && platform.rotates) {
            platform.rotation = (platform.rotation || 0) + 0.02;
        }
        if (platform.skill === 'sitting' && !platform.stable) {
            platform.wobble = Math.sin(now * 0.003) * 5;
        }
        if (platform.skill === 'standing' && platform.wobbly) {
            platform.sway = Math.sin(now * 0.004) * 3;
        }
    }
    
    updateGrowthSpurtPlatform(platform) {
        if (platform.height < platform.maxHeight) {
            platform.height += platform.growthRate * 0.1;
            platform.y = platform.originalY - (platform.height - 20);
            if (!platform.originalY) platform.originalY = platform.y;
        }
    }
    
    updateBubblePlatform(platform, now) {
        platform.protection -= platform.degradeRate * 0.1;
        if (platform.protection <= 0) {
            platform.protection = 0;
            platform.vulnerable = true;
        }
        
        platform.bubbleSize = 1 + Math.sin(now * 0.002) * 0.05;
    }
    
    updateBalancePlatform(platform, player) {
        if (player.onPlatform === platform) {
            if (!player.energy) player.energy = 100;
            
            if (platform.drains === 'energy') {
                player.energy = Math.max(0, player.energy - 0.5);
            } else if (platform.restores === 'energy') {
                player.energy = Math.min(100, player.energy + 1);
            }
            
            player.speedMultiplier = 0.5 + (player.energy / 200);
        }
    }
    
    updateReflexTestPlatform(platform, player, now) {
        if (player.onPlatform === platform) {
            if (!platform.testStartTime) {
                platform.testStartTime = now;
                platform.testing = true;
            }
            
            if (platform.testing && now - platform.testStartTime > platform.responseTime) {
                if (platform.disappearsOnFail && !player.hasJumped) {
                    platform.activated = false;
                    setTimeout(() => {
                        platform.activated = true;
                        platform.testStartTime = null;
                        platform.testing = false;
                    }, 2000);
                }
            }
        }
    }
    
    updateOrganSystemPlatform(platform, now) {
        if (!platform.failureStartTime) {
            platform.failureStartTime = now;
        }
        
        const elapsed = now - platform.failureStartTime;
        if (elapsed > platform.failureTime) {
            platform.failing = true;
            platform.opacity = Math.max(0, 1 - (elapsed - platform.failureTime) / 1000);
            platform.activated = platform.opacity > 0.1;
        }
    }
    
    updatePHSensitivePlatform(platform) {
        const pHDiff = Math.abs(platform.currentPH - platform.idealPH);
        if (pHDiff > 0.1) {
            platform.damaging = true;
            platform.damageAmount = platform.damageRate * pHDiff * 10;
        } else {
            platform.damaging = false;
        }
        
        // Visual indication of pH
        if (platform.currentPH < 7.35) {
            platform.color = '#FF6B6B'; // Acidic - red
        } else if (platform.currentPH > 7.45) {
            platform.color = '#6B6BFF'; // Alkalotic - blue  
        } else {
            platform.color = '#6BFF6B'; // Normal - green
        }
    }
    
    /**
     * Reset individual platform state
     */
    resetPlatformState(platform) {
        const resetProperties = [
            'alarmTriggered', 'alarmTime', 'enemiesSpawned', 
            'isActiveMalfunction', 'lastMalfunctionTime',
            'testStartTime', 'testing', 'breaking', 'breakTimer',
            'failing', 'failureStartTime'
        ];
        
        resetProperties.forEach(prop => {
            if (platform.hasOwnProperty(prop)) {
                delete platform[prop];
            }
        });
        
        // Reset orbiting platforms to start position
        if (platform.type === 'orbiting' && platform.orbit) {
            platform.orbit.currentAngle = platform.orbit.startAngle || 0;
        }
    }
}