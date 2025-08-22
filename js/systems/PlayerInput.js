/**
 * PlayerInput - Handles all player input processing and movement
 */
export class PlayerInput {
    constructor(player) {
        this.player = player;
    }
    
    /**
     * Process player input and update movement/actions
     */
    handleInput(keys, onSpill) {
        if (this.player.dead) {
            this.handleDeadState();
            return;
        }
        
        const inputKeys = this.processInputKeys(keys);
        this.handleHorizontalMovement(inputKeys, onSpill);
        this.handleJumping(inputKeys);
        this.handleGliding(inputKeys);
        this.handleCrouching(inputKeys);
    }
    
    // Private methods
    handleDeadState() {
        this.player.vx = 0;
        this.player.crouching = false;
    }
    
    processInputKeys(keys) {
        let leftKey = keys['ArrowLeft'] || keys['a'] || keys['A'];
        let rightKey = keys['ArrowRight'] || keys['d'] || keys['D'];
        let upKey = keys['ArrowUp'] || keys['w'] || keys['W'];
        let downKey = keys['ArrowDown'] || keys['s'] || keys['S'];
        
        // Handle inverted controls effect
        if (this.player.invertedControls) {
            [leftKey, rightKey] = [rightKey, leftKey];
            [upKey, downKey] = [downKey, upKey];
        }
        
        return { leftKey, rightKey, upKey, downKey };
    }
    
    handleHorizontalMovement(inputKeys, onSpill) {
        const currentSpeed = this.player.baseSpeed * this.player.speedMultiplier;
        
        if (inputKeys.leftKey) {
            this.player.vx = -currentSpeed;
            this.player.facing = -1;
        } else if (inputKeys.rightKey) {
            this.player.vx = currentSpeed;
            this.player.facing = 1;
        } else if (!onSpill) {
            this.player.vx *= 0.8; // Apply friction when not moving
        }
    }
    
    handleJumping(inputKeys) {
        if (!inputKeys.upKey) return;
        
        const currentJumpPower = this.player.baseJumpPower * this.player.jumpMultiplier;
        
        if (this.player.grounded && this.player.canJump) {
            this.executeJump(currentJumpPower);
        } else if (this.player.canDoubleJump && !this.player.hasDoubleJumped && !this.player.grounded) {
            this.executeDoubleJump(currentJumpPower);
        }
    }
    
    executeJump(jumpPower) {
        this.player.vy = -jumpPower;
        this.player.grounded = false;
        this.player.onPlatform = null;
        this.player.hasDoubleJumped = false;
    }
    
    executeDoubleJump(jumpPower) {
        this.player.vy = -jumpPower * 0.8; // Double jump is slightly weaker
        this.player.hasDoubleJumped = true;
    }
    
    handleGliding(inputKeys) {
        if (!this.player.canGlide || this.player.grounded || this.player.vy <= 0) {
            this.player.isGliding = false;
            return;
        }
        
        if (inputKeys.upKey) {
            this.player.isGliding = true;
            this.player.vy = Math.min(this.player.vy, 2); // Slow fall when gliding
        } else {
            this.player.isGliding = false;
        }
    }
    
    handleCrouching(inputKeys) {
        this.player.crouching = inputKeys.downKey && this.player.grounded;
    }
}