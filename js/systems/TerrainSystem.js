/**
 * TerrainSystem - Handles variegated terrain with slopes, hills, mounds, and plateaus
 * Provides realistic physics interactions with gravity and friction
 */
export class TerrainSystem {
    constructor() {
        this.terrainSegments = [];
        this.baseGroundY = 0; // Will be set when initialized
        
        // Physics constants
        this.slopeSpeedMultiplier = {
            uphill: 0.7,    // Slower going uphill
            downhill: 1.3,  // Faster going downhill
            flat: 1.0       // Normal speed on flat ground
        };
        
        this.frictionMultiplier = {
            steep: 0.8,     // More friction on steep slopes
            moderate: 0.9,  // Slight friction on moderate slopes
            gentle: 0.95,   // Minimal friction on gentle slopes
            flat: 1.0       // No friction penalty on flat ground
        };
        
        // Angle thresholds (in radians)
        this.angleThresholds = {
            gentle: Math.PI / 12,    // 15 degrees
            moderate: Math.PI / 6,   // 30 degrees
            steep: Math.PI / 4       // 45 degrees
        };
    }
    
    /**
     * Initialize terrain system with base ground level
     */
    initialize(baseGroundY) {
        this.baseGroundY = baseGroundY;
        this.terrainSegments = [];
    }
    
    /**
     * Add a terrain segment
     */
    addTerrainSegment(segment) {
        this.terrainSegments.push({
            ...segment,
            // Pre-calculate some properties for performance
            length: Math.sqrt(Math.pow(segment.endX - segment.startX, 2) + Math.pow(segment.endY - segment.startY, 2)),
            angle: Math.atan2(segment.endY - segment.startY, segment.endX - segment.startX),
            slope: (segment.endY - segment.startY) / (segment.endX - segment.startX)
        });
        
        // Sort segments by startX for efficient collision detection
        this.terrainSegments.sort((a, b) => a.startX - b.startX);
    }
    
    /**
     * Create different types of terrain features
     */
    createSlope(startX, startY, endX, endY, type = 'linear') {
        return {
            type: 'slope',
            startX,
            startY,
            endX,
            endY,
            curveType: type,
            friction: 'moderate'
        };
    }
    
    createHill(centerX, centerY, width, height, steepness = 1) {
        const segments = [];
        const resolution = 20; // Number of segments to approximate the curve
        
        for (let i = 0; i < resolution; i++) {
            const progress = i / (resolution - 1);
            const nextProgress = (i + 1) / (resolution - 1);
            
            const startX = centerX - width/2 + progress * width;
            const endX = centerX - width/2 + nextProgress * width;
            
            // Bell curve for hill shape
            const startY = centerY - height * this.bellCurve(progress, steepness);
            const endY = centerY - height * this.bellCurve(nextProgress, steepness);
            
            if (i < resolution - 1) {
                segments.push({
                    type: 'hill',
                    startX,
                    startY,
                    endX,
                    endY,
                    curveType: 'smooth',
                    friction: 'gentle'
                });
            }
        }
        
        return segments;
    }
    
    createMound(centerX, centerY, width, height) {
        const segments = [];
        const resolution = 12;
        
        for (let i = 0; i < resolution; i++) {
            const progress = i / (resolution - 1);
            const nextProgress = (i + 1) / (resolution - 1);
            
            const startX = centerX - width/2 + progress * width;
            const endX = centerX - width/2 + nextProgress * width;
            
            // Sine curve for mound shape
            const startY = centerY - height * Math.sin(progress * Math.PI);
            const endY = centerY - height * Math.sin(nextProgress * Math.PI);
            
            if (i < resolution - 1) {
                segments.push({
                    type: 'mound',
                    startX,
                    startY,
                    endX,
                    endY,
                    curveType: 'smooth',
                    friction: 'gentle'
                });
            }
        }
        
        return segments;
    }
    
    createPlateau(startX, endX, plateauY, edgeHeight = 100) {
        const segments = [];
        const transitionWidth = 80; // Width of the transition slopes
        
        // Left transition (slope up)
        segments.push({
            type: 'plateau_edge',
            startX: startX - transitionWidth,
            startY: plateauY + edgeHeight,
            endX: startX,
            endY: plateauY,
            curveType: 'linear',
            friction: 'steep'
        });
        
        // Flat plateau top
        segments.push({
            type: 'plateau_top',
            startX: startX,
            startY: plateauY,
            endX: endX,
            endY: plateauY,
            curveType: 'linear',
            friction: 'flat'
        });
        
        // Right transition (slope down)
        segments.push({
            type: 'plateau_edge',
            startX: endX,
            startY: plateauY,
            endX: endX + transitionWidth,
            endY: plateauY + edgeHeight,
            curveType: 'linear',
            friction: 'steep'
        });
        
        return segments;
    }
    
    createValley(centerX, centerY, width, depth) {
        const segments = [];
        const resolution = 15;
        
        for (let i = 0; i < resolution; i++) {
            const progress = i / (resolution - 1);
            const nextProgress = (i + 1) / (resolution - 1);
            
            const startX = centerX - width/2 + progress * width;
            const endX = centerX - width/2 + nextProgress * width;
            
            // Inverted sine curve for valley shape
            const startY = centerY + depth * (1 - Math.sin(progress * Math.PI));
            const endY = centerY + depth * (1 - Math.sin(nextProgress * Math.PI));
            
            if (i < resolution - 1) {
                segments.push({
                    type: 'valley',
                    startX,
                    startY,
                    endX,
                    endY,
                    curveType: 'smooth',
                    friction: 'moderate'
                });
            }
        }
        
        return segments;
    }
    
    /**
     * Bell curve function for hill generation
     */
    bellCurve(x, steepness) {
        return Math.exp(-steepness * Math.pow(2 * x - 1, 2));
    }
    
    /**
     * Get terrain height at a specific X coordinate
     */
    getTerrainHeight(worldX) {
        // Find the terrain segment that contains this X coordinate
        const segment = this.findTerrainSegment(worldX);
        
        if (!segment) {
            return this.baseGroundY; // Return base ground if no terrain found
        }
        
        // Interpolate Y position along the segment
        const progress = (worldX - segment.startX) / (segment.endX - segment.startX);
        const clampedProgress = Math.max(0, Math.min(1, progress));
        
        if (segment.curveType === 'smooth') {
            // Use smooth interpolation for curved segments
            return this.smoothInterpolate(segment.startY, segment.endY, clampedProgress);
        } else {
            // Linear interpolation for straight segments
            return segment.startY + (segment.endY - segment.startY) * clampedProgress;
        }
    }
    
    /**
     * Get terrain angle at a specific X coordinate (in radians)
     */
    getTerrainAngle(worldX) {
        const segment = this.findTerrainSegment(worldX);
        return segment ? segment.angle : 0;
    }
    
    /**
     * Get terrain normal at a specific X coordinate
     */
    getTerrainNormal(worldX) {
        const angle = this.getTerrainAngle(worldX);
        return {
            x: -Math.sin(angle),
            y: Math.cos(angle)
        };
    }
    
    /**
     * Calculate movement speed modifier based on terrain
     */
    getSpeedModifier(worldX, playerVelocityX) {
        const segment = this.findTerrainSegment(worldX);
        if (!segment) return 1.0;
        
        const angle = Math.abs(segment.angle);
        const isGoingUphill = (playerVelocityX > 0 && segment.slope > 0) || 
                              (playerVelocityX < 0 && segment.slope < 0);
        const isGoingDownhill = (playerVelocityX > 0 && segment.slope < 0) || 
                                (playerVelocityX < 0 && segment.slope > 0);
        
        let speedMod = 1.0;
        let frictionMod = 1.0;
        
        // Apply speed modification based on slope direction
        if (isGoingUphill) {
            speedMod = this.slopeSpeedMultiplier.uphill;
        } else if (isGoingDownhill) {
            speedMod = this.slopeSpeedMultiplier.downhill;
        }
        
        // Apply friction based on slope steepness
        if (angle > this.angleThresholds.steep) {
            frictionMod = this.frictionMultiplier.steep;
        } else if (angle > this.angleThresholds.moderate) {
            frictionMod = this.frictionMultiplier.moderate;
        } else if (angle > this.angleThresholds.gentle) {
            frictionMod = this.frictionMultiplier.gentle;
        }
        
        return speedMod * frictionMod;
    }
    
    /**
     * Calculate gravity modifier based on terrain angle
     */
    getGravityModifier(worldX) {
        const segment = this.findTerrainSegment(worldX);
        if (!segment) return { x: 0, y: 1 };
        
        const angle = segment.angle;
        
        // Decompose gravity along the slope
        return {
            x: Math.sin(angle) * 0.3, // Horizontal component (slope sliding)
            y: Math.cos(angle)        // Vertical component
        };
    }
    
    /**
     * Find the terrain segment containing a given X coordinate
     */
    findTerrainSegment(worldX) {
        for (const segment of this.terrainSegments) {
            if (worldX >= segment.startX && worldX <= segment.endX) {
                return segment;
            }
        }
        return null;
    }
    
    /**
     * Smooth interpolation using ease-in-out curve
     */
    smoothInterpolate(start, end, t) {
        // Ease-in-out cubic curve
        const smoothT = t * t * (3 - 2 * t);
        return start + (end - start) * smoothT;
    }
    
    /**
     * Check if player is on ground (considering terrain)
     */
    isPlayerGrounded(playerX, playerY, playerHeight, tolerance = 5) {
        const terrainHeight = this.getTerrainHeight(playerX + 25); // Check center of player
        return Math.abs((playerY + playerHeight) - terrainHeight) <= tolerance;
    }
    
    /**
     * Render terrain
     */
    render(ctx, worldX, canvas) {
        ctx.strokeStyle = '#2F4F2F'; // Dark olive green
        ctx.lineWidth = 3;
        ctx.fillStyle = '#228B22'; // Forest green
        
        ctx.beginPath();
        
        // Calculate world coordinates visible on screen
        const startWorldX = -worldX - 100; // Slightly off-screen left
        const endWorldX = -worldX + canvas.width + 100; // Slightly off-screen right
        
        let firstPoint = true;
        
        // Draw terrain curve
        for (let worldPosX = startWorldX; worldPosX <= endWorldX; worldPosX += 5) {
            const terrainY = this.getTerrainHeight(worldPosX);
            const screenX = worldPosX + worldX; // Convert world X to screen X
            
            if (firstPoint) {
                ctx.moveTo(screenX, terrainY);
                firstPoint = false;
            } else {
                ctx.lineTo(screenX, terrainY);
            }
        }
        
        // Fill below terrain
        const rightScreenX = endWorldX + worldX;
        const leftScreenX = startWorldX + worldX;
        ctx.lineTo(rightScreenX, canvas.height);
        ctx.lineTo(leftScreenX, canvas.height);
        ctx.closePath();
        ctx.fill();
        
        // Draw terrain outline
        ctx.beginPath();
        firstPoint = true;
        
        for (let worldPosX = startWorldX; worldPosX <= endWorldX; worldPosX += 3) {
            const terrainY = this.getTerrainHeight(worldPosX);
            const screenX = worldPosX + worldX; // Convert world X to screen X
            
            if (firstPoint) {
                ctx.moveTo(screenX, terrainY);
                firstPoint = false;
            } else {
                ctx.lineTo(screenX, terrainY);
            }
        }
        
        ctx.stroke();
        
        // Draw terrain feature indicators (for debugging/polish)
        this.renderTerrainFeatures(ctx, worldX, canvas);
    }
    
    /**
     * Render terrain feature indicators
     */
    renderTerrainFeatures(ctx, worldX, canvas) {
        for (const segment of this.terrainSegments) {
            const startScreenX = segment.startX + worldX;
            const endScreenX = segment.endX + worldX;
            
            // Only render visible segments
            if (endScreenX < 0 || startScreenX > canvas.width) continue;
            
            // Draw feature labels for debugging
            const midX = (startScreenX + endScreenX) / 2;
            const midY = (segment.startY + segment.endY) / 2;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            
            // Optional: uncomment for debugging labels
            // ctx.fillText(segment.type, midX, midY - 10);
        }
    }
    
    /**
     * Get terrain info at position (for UI/debugging)
     */
    getTerrainInfo(worldX) {
        const segment = this.findTerrainSegment(worldX);
        if (!segment) {
            return {
                type: 'flat',
                angle: 0,
                slope: 0,
                height: this.baseGroundY
            };
        }
        
        return {
            type: segment.type,
            angle: segment.angle * (180 / Math.PI), // Convert to degrees
            slope: segment.slope,
            height: this.getTerrainHeight(worldX),
            friction: segment.friction
        };
    }
}