// Enemy logic goes here

// Removed automatic enemy spawning; enemies now only appear via level scripts
// that directly manage when and where enemies are created.

export class Enemy {
    constructor(worldX, y, width = 40, height = 40) {
        this.worldX = worldX;
        this.y = y;
        this.vy = 0;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.hp = 1;
        this.falling = false;
        this.speed = 2;
    }
    
    // Update enemy position and AI
    update(canvas, worldX, player, pits) {
        // Check if enemy is over a pit
        let overPit = false;
        const enemyCenterX = this.worldX + this.width / 2;
        for (const pit of pits) {
            if (enemyCenterX > pit.worldX && enemyCenterX < pit.worldX + pit.width) {
                overPit = true;
                break;
            }
        }

        if (overPit) {
            this.falling = true;
        }
        
        if (this.falling) {
            this.vy += 0.8;
            this.y += this.vy;
            return this.y > canvas.height + 50; // Return true if should be removed
        } else {
            const screenX = this.worldX + worldX;
            if (screenX < player.x) { 
                this.vx = this.speed; 
            } else { 
                this.vx = -this.speed; 
            }
            this.worldX += this.vx;

            // Check if enemy should be removed (off screen)
            if (screenX < -100 || screenX > canvas.width + 100) {
                return true;
            }
        }
        
        return false; // Don't remove
    }
    
    // Check collision with player
    checkCollisionWithPlayer(player, worldX) {
        const screenX = this.worldX + worldX;
        return player.checkEnemyCollision(this, screenX);
    }
    
    // Check if projectile hits this enemy
    checkProjectileHit(proj, worldX) {
        const enemyScreenX = this.worldX + worldX;
        const enemyTop = this.y - this.height;
        const enemyBottom = this.y;
        let hit = false;

        if (proj.type === 3 || proj.type === 7) {
            // Rotating weapons (stethoscope, BP monitor)
            const numChecks = 10;
            for (let k = 0; k <= numChecks; k++) {
                const t = k / numChecks;
                const checkX = proj.centerX + Math.cos(proj.angle) * proj.radius * t;
                const checkY = proj.centerY + Math.sin(proj.angle) * proj.radius * t;
                if (checkX > enemyScreenX && checkX < enemyScreenX + this.width &&
                    checkY > enemyTop && checkY < enemyBottom) {
                    hit = true;
                    break;
                }
            }
        } else {
            // Regular projectiles
            if (!proj.landed && proj.x < enemyScreenX + this.width &&
                proj.x + (proj.width || proj.size || 20) > enemyScreenX &&
                proj.y < enemyBottom &&
                proj.y + (proj.height || proj.size || 10) > enemyTop) {
                hit = true;
            }
        }

        return hit;
    }
    
    // Render the enemy
    render(ctx, worldX) {
        const screenX = this.worldX + worldX;
        
        // Body
        ctx.fillStyle = '#8B008B';
        ctx.fillRect(screenX, this.y - this.height, this.width, this.height);
        
        // Eyes (white)
        ctx.fillStyle = '#fff';
        ctx.fillRect(screenX + 8, this.y - this.height + 10, 8, 8);
        ctx.fillRect(screenX + 24, this.y - this.height + 10, 8, 8);
        
        // Pupils (black)
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX + 10, this.y - this.height + 12, 4, 4);
        ctx.fillRect(screenX + 26, this.y - this.height + 12, 4, 4);
    }
}

export class EnemyManager {
    constructor() {
        this.enemies = [];
    }

    // Update all enemies and handle player collisions
    update(canvas, worldX, player, pits) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const shouldRemove = enemy.update(canvas, worldX, player, pits);

            if (shouldRemove) {
                this.enemies.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (enemy.checkCollisionWithPlayer(player, worldX)) {
                return { playerHit: true };
            }
        }

        return { playerHit: false };
    }
    
    // Check projectile collisions with all enemies
    checkProjectileCollisions(projectiles, worldX) {
        const hitResults = [];
        
        for (let j = this.enemies.length - 1; j >= 0; j--) {
            const enemy = this.enemies[j];

            for (let i = projectiles.length - 1; i >= 0; i--) {
                const proj = projectiles[i];

                // Ignore phantom projectiles from the evil twin
                if (proj.isPhantom) continue;

                if (enemy.checkProjectileHit(proj, worldX)) {
                    // Store enemy data before removing it for item drops
                    const destroyedEnemy = { ...enemy };
                    this.enemies.splice(j, 1);
                    
                    hitResults.push({
                        enemyIndex: j,
                        projectileIndex: i,
                        projectileType: proj.type,
                        destroyedEnemy: destroyedEnemy,
                        enemyType: enemy.enemyType || 'basic' // Default to basic if not specified
                    });
                    break; // Break inner loop since enemy is destroyed
                }
            }
        }
        
        return hitResults;
    }
    
    // Render all enemies
    render(ctx, worldX) {
        for (const enemy of this.enemies) {
            enemy.render(ctx, worldX);
        }
    }
    
    // Clear all enemies
    clear() {
        this.enemies.length = 0;
    }
    
    // Get all enemies (for external access)
    getEnemies() {
        return this.enemies;
    }
    
    // Get enemy count
    getCount() {
        return this.enemies.length;
    }
}