/**
 * LevelPathValidator - Ensures every level has a viable path to the Boss Gate
 * without requiring correct quiz answers
 */
export class LevelPathValidator {
    constructor() {
        this.PLAYER_JUMP_DISTANCE = 200; // Maximum horizontal jump distance
        this.PLAYER_JUMP_HEIGHT = 120;   // Maximum jump height
        this.PLAYER_WIDTH = 50;
        this.PLAYER_HEIGHT = 92;
    }
    
    /**
     * Validate that a level has a viable path from start to Boss Gate
     */
    validateLevel(levelData, canvas) {
        const validationResult = {
            isValid: true,
            issues: [],
            recommendations: []
        };
        
        if (!levelData) {
            validationResult.isValid = false;
            validationResult.issues.push('No level data provided');
            return validationResult;
        }
        
        // Check basic level structure
        this.validateBasicStructure(levelData, validationResult);
        
        // Check pit accessibility
        this.validatePitTraversal(levelData, canvas, validationResult);
        
        // Check hazard circumvention
        this.validateHazardCircumvention(levelData, canvas, validationResult);
        
        // Check platform accessibility
        this.validatePlatformAccessibility(levelData, canvas, validationResult);
        
        // Check reward path optimization
        this.validateRewardPaths(levelData, validationResult);
        
        return validationResult;
    }
    
    /**
     * Validate basic level structure
     */
    validateBasicStructure(levelData, result) {
        if (!levelData.playerStart) {
            result.isValid = false;
            result.issues.push('No player start position defined');
        }
        
        if (!levelData.worldLength) {
            result.issues.push('No world length defined - using default');
        }
        
        const bossGateX = levelData.worldLength || 10800;
        const startX = levelData.playerStart?.x || 100;
        
        if (bossGateX <= startX) {
            result.isValid = false;
            result.issues.push('Boss Gate position must be after player start');
        }
    }
    
    /**
     * Validate that all pits can be traversed without quiz answers
     */
    validatePitTraversal(levelData, canvas, result) {
        if (!levelData.hazards) return;
        
        const pits = levelData.hazards.filter(h => h.type === 'pit');
        const unconditionalPlatforms = this.getUnconditionalPlatforms(levelData);
        
        pits.forEach(pit => {
            const canJumpOver = pit.width <= this.PLAYER_JUMP_DISTANCE;
            const hasAlternatePath = this.checkAlternatePath(pit, unconditionalPlatforms, canvas);
            
            if (!canJumpOver && !hasAlternatePath) {
                result.isValid = false;
                result.issues.push(`Pit at x=${pit.x} (width=${pit.width}) blocks progression - too wide to jump and no alternate path`);
                result.recommendations.push(`Add platforms across pit at x=${pit.x} or reduce width to ≤${this.PLAYER_JUMP_DISTANCE}`);
            } else if (!canJumpOver) {
                result.recommendations.push(`Pit at x=${pit.x} requires alternate path - ensure platforms remain accessible`);
            }
        });
    }
    
    /**
     * Validate that hazards don't create impossible barriers
     */
    validateHazardCircumvention(levelData, canvas, result) {
        if (!levelData.hazards) return;
        
        const blockingHazards = levelData.hazards.filter(h => 
            h.type !== 'pit' && this.isHazardBlocking(h, canvas)
        );
        
        blockingHazards.forEach(hazard => {
            const hasOffPeriod = this.checkHazardOffPeriod(hazard);
            const hasAlternatePath = this.checkHazardAlternatePath(hazard, levelData, canvas);
            
            if (!hasOffPeriod && !hasAlternatePath) {
                result.isValid = false;
                result.issues.push(`Hazard at x=${hazard.x} (${hazard.type}) creates impossible barrier`);
                result.recommendations.push(`Add off period to hazard at x=${hazard.x} or provide alternate path`);
            }
        });
    }
    
    /**
     * Validate platform accessibility
     */
    validatePlatformAccessibility(levelData, canvas, result) {
        if (!levelData.platforms) return;
        
        const criticalPlatforms = this.findCriticalPlatforms(levelData, canvas);
        
        criticalPlatforms.forEach(platform => {
            if (platform.activated === false && !this.hasAlternateAccess(platform, levelData)) {
                result.isValid = false;
                result.issues.push(`Critical platform ${platform.id} at x=${platform.x} requires activation with no alternate path`);
                result.recommendations.push(`Set platform ${platform.id} to activated=true or provide alternate access`);
            }
        });
    }
    
    /**
     * Validate that reward paths provide meaningful advantages
     */
    validateRewardPaths(levelData, result) {
        if (!levelData.npcs && !levelData.items) {
            result.recommendations.push('No NPCs or chests found - consider adding reward elements');
            return;
        }
        
        // Check that NPCs and chests provide meaningful rewards
        const npcs = levelData.npcs || [];
        const chests = (levelData.items || []).filter(item => item.type === 'chest');
        
        if (npcs.length === 0 && chests.length === 0) {
            result.recommendations.push('No interactive reward elements - consider adding NPCs or chests');
        }
        
        // Validate that rewards unlock useful paths
        const activatablePlatforms = (levelData.platforms || []).filter(p => p.activated === false);
        const rewardTargets = [...npcs, ...chests].map(item => item.activates).filter(Boolean);
        
        if (activatablePlatforms.length > 0 && rewardTargets.length === 0) {
            result.recommendations.push('Inactive platforms found but no reward interactions to activate them');
        }
    }
    
    /**
     * Get platforms that don't require activation
     */
    getUnconditionalPlatforms(levelData) {
        if (!levelData.platforms) return [];
        
        return levelData.platforms.filter(platform => 
            platform.activated !== false && // Defaults to true or explicitly true
            platform.type !== 'disappearing' &&
            platform.type !== 'alarm' // Alarm platforms can be dangerous
        );
    }
    
    /**
     * Check if there's an alternate path around a pit
     */
    checkAlternatePath(pit, platforms, canvas) {
        const groundY = canvas.height - 100;
        const pitStart = pit.x;
        const pitEnd = pit.x + pit.width;
        
        // Look for platforms that span the pit
        const bridgingPlatforms = platforms.filter(platform => {
            const platStart = platform.x;
            const platEnd = platform.x + (platform.width || 100);
            
            // Platform must overlap with pit area and be reachable
            return platStart <= pitEnd && platEnd >= pitStart &&
                   this.isPlatformReachable(platform, canvas);
        });
        
        if (bridgingPlatforms.length > 0) {
            // Check if platforms form a continuous path
            return this.checkContinuousPath(pitStart, pitEnd, bridgingPlatforms);
        }
        
        return false;
    }
    
    /**
     * Check if a hazard blocks the main path
     */
    isHazardBlocking(hazard, canvas) {
        const groundY = canvas.height - 100;
        const hazardBottom = hazard.y || groundY;
        const hazardTop = hazardBottom - (hazard.height || 50);
        
        // Hazard blocks if it covers ground level or jumping space
        return hazardTop <= groundY && hazardBottom >= groundY - this.PLAYER_JUMP_HEIGHT;
    }
    
    /**
     * Check if hazard has safe periods
     */
    checkHazardOffPeriod(hazard) {
        switch (hazard.type) {
            case 'aerosol_geyser':
                return hazard.timing && hazard.timing.offTime > 0;
            case 'falling_object':
                return hazard.timing && hazard.timing.interval > 1000; // Gaps between falls
            case 'rushing_hazard':
                return false; // Always moving, but can be avoided by timing
            default:
                return true; // Assume other hazards are passable
        }
    }
    
    /**
     * Check if there's an alternate path around a hazard
     */
    checkHazardAlternatePath(hazard, levelData, canvas) {
        // Look for platforms that go over or around the hazard
        const platforms = this.getUnconditionalPlatforms(levelData);
        const hazardArea = {
            x: hazard.x,
            y: hazard.y || (canvas.height - 100),
            width: hazard.width || 50,
            height: hazard.height || 50
        };
        
        return platforms.some(platform => {
            const platformY = this.parsePosition(platform.y, canvas);
            return platformY < hazardArea.y - this.PLAYER_HEIGHT && // Above hazard
                   platform.x <= hazardArea.x + hazardArea.width && // Overlaps horizontally
                   platform.x + (platform.width || 100) >= hazardArea.x;
        });
    }
    
    /**
     * Find platforms critical to level progression
     */
    findCriticalPlatforms(levelData, canvas) {
        if (!levelData.platforms) return [];
        
        const allPlatforms = levelData.platforms;
        const levelEnd = levelData.worldLength || 10800;
        const groundY = canvas.height - 100;
        
        // Identify platforms that are likely necessary for progression
        return allPlatforms.filter(platform => {
            const platformY = this.parsePosition(platform.y, canvas);
            const isHighPlatform = platformY < groundY - this.PLAYER_JUMP_HEIGHT;
            const isInMiddleSection = platform.x > 1000 && platform.x < levelEnd - 1000;
            
            return isHighPlatform && isInMiddleSection;
        });
    }
    
    /**
     * Check if platform has alternate access routes
     */
    hasAlternateAccess(platform, levelData) {
        // Check if there are other platforms nearby that could provide access
        const otherPlatforms = (levelData.platforms || []).filter(p => 
            p.id !== platform.id && p.activated !== false
        );
        
        return otherPlatforms.some(other => {
            const distance = Math.abs(other.x - platform.x);
            return distance <= this.PLAYER_JUMP_DISTANCE * 2; // Within jumping range
        });
    }
    
    /**
     * Check if platform is reachable without special abilities
     */
    isPlatformReachable(platform, canvas) {
        const platformY = this.parsePosition(platform.y, canvas);
        const groundY = canvas.height - 100;
        const heightFromGround = groundY - platformY;
        
        return heightFromGround <= this.PLAYER_JUMP_HEIGHT;
    }
    
    /**
     * Check if platforms form a continuous traversable path
     */
    checkContinuousPath(startX, endX, platforms) {
        if (platforms.length === 0) return false;
        
        // Sort platforms by x position
        platforms.sort((a, b) => a.x - b.x);
        
        let currentX = startX;
        
        for (const platform of platforms) {
            const platformStart = platform.x;
            const platformEnd = platform.x + (platform.width || 100);
            
            // Check if we can reach this platform
            if (platformStart - currentX > this.PLAYER_JUMP_DISTANCE) {
                return false; // Gap too large
            }
            
            // Update current position
            currentX = Math.max(currentX, platformEnd);
            
            // Check if we've crossed the entire obstacle
            if (currentX >= endX) {
                return true;
            }
        }
        
        return currentX >= endX;
    }
    
    /**
     * Parse position string to number (simplified version)
     */
    parsePosition(pos, canvas) {
        const groundY = canvas.height - 100;
        
        if (typeof pos === 'number') return pos;
        if (typeof pos === 'string' && pos.startsWith('ground')) {
            const match = pos.match(/ground-(\d+)/);
            if (match) {
                const offset = parseInt(match[1]);
                return groundY - offset;
            }
            return groundY;
        }
        return pos;
    }
    
    /**
     * Generate a detailed validation report
     */
    generateReport(levelData, canvas) {
        const validation = this.validateLevel(levelData, canvas);
        
        let report = `Level ${levelData.id || 'Unknown'} Validation Report\n`;
        report += `=============================================\n\n`;
        
        if (validation.isValid) {
            report += `✅ LEVEL IS VALID - All paths are accessible\n\n`;
        } else {
            report += `❌ LEVEL HAS BLOCKING ISSUES\n\n`;
        }
        
        if (validation.issues.length > 0) {
            report += `Critical Issues:\n`;
            validation.issues.forEach(issue => {
                report += `  • ${issue}\n`;
            });
            report += `\n`;
        }
        
        if (validation.recommendations.length > 0) {
            report += `Recommendations:\n`;
            validation.recommendations.forEach(rec => {
                report += `  • ${rec}\n`;
            });
            report += `\n`;
        }
        
        return report;
    }
}