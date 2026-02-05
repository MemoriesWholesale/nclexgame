/**
 * PlayerInput - Handles all player input processing and movement
 * Includes coyote time and input buffering for better game feel
 */
export class PlayerInput {
    constructor(player) {
        this.player = player;

        // Coyote time - allows jumping shortly after leaving a platform
        this.coyoteTime = 0;
        this.coyoteTimeDuration = 8; // frames (~133ms at 60fps)
        this.wasGrounded = false;

        // Input buffering - remembers jump input for a short time
        this.jumpBufferTime = 0;
        this.jumpBufferDuration = 10; // frames (~166ms at 60fps)
        this.jumpPressed = false;
        this.lastJumpKey = false;
    }

    /**
     * Process player input and update movement/actions
     */
    handleInput(keys, onSpill, deltaTime = 1) {
        if (this.player.dead) {
            this.handleDeadState();
            return;
        }

        const inputKeys = this.processInputKeys(keys);

        // Update coyote time
        this.updateCoyoteTime(deltaTime);

        // Update input buffer
        this.updateInputBuffer(inputKeys, deltaTime);

        this.handleHorizontalMovement(inputKeys, onSpill, deltaTime);
        this.handleJumping(inputKeys);
        this.handleGliding(inputKeys);
        this.handleCrouching(inputKeys);
    }

    /**
     * Update coyote time tracking
     */
    updateCoyoteTime(deltaTime) {
        // If player just left the ground (was grounded, now not grounded)
        if (this.wasGrounded && !this.player.grounded && this.player.vy >= 0) {
            // Only grant coyote time if player walked off (not jumped)
            if (!this.jumpPressed) {
                this.coyoteTime = this.coyoteTimeDuration;
            }
        }

        // Decrement coyote time
        if (this.coyoteTime > 0) {
            this.coyoteTime -= deltaTime;
        }

        // Reset coyote time when grounded
        if (this.player.grounded) {
            this.coyoteTime = 0;
        }

        this.wasGrounded = this.player.grounded;
    }

    /**
     * Update input buffer for jump
     */
    updateInputBuffer(inputKeys, deltaTime) {
        // Detect new jump press (not held)
        const jumpKeyDown = inputKeys.upKey;
        if (jumpKeyDown && !this.lastJumpKey) {
            this.jumpBufferTime = this.jumpBufferDuration;
        }
        this.lastJumpKey = jumpKeyDown;

        // Decrement buffer time
        if (this.jumpBufferTime > 0) {
            this.jumpBufferTime -= deltaTime;
        }
    }

    /**
     * Check if jump should be executed (with coyote time and buffer)
     */
    canExecuteJump() {
        const hasGroundOrCoyote = this.player.grounded || this.coyoteTime > 0;
        const hasJumpInput = this.jumpBufferTime > 0;
        return hasGroundOrCoyote && hasJumpInput && this.player.canJump;
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
    
    handleHorizontalMovement(inputKeys, onSpill, deltaTime = 1) {
        const currentSpeed = this.player.baseSpeed * this.player.speedMultiplier;

        if (inputKeys.leftKey) {
            this.player.vx = -currentSpeed;
            this.player.facing = -1;
        } else if (inputKeys.rightKey) {
            this.player.vx = currentSpeed;
            this.player.facing = 1;
        } else if (!onSpill) {
            this.player.vx *= Math.pow(0.8, deltaTime); // Apply friction when not moving
        }
    }
    
    handleJumping(inputKeys) {
        const currentJumpPower = this.player.baseJumpPower * this.player.jumpMultiplier;

        // Check for buffered jump with coyote time
        if (this.canExecuteJump()) {
            this.executeJump(currentJumpPower);
            this.jumpBufferTime = 0; // Consume the buffered input
            this.coyoteTime = 0; // Consume coyote time
            this.jumpPressed = true;
            return;
        }

        // Handle double jump (only on new press, not buffered)
        if (inputKeys.upKey && !this.lastJumpKey) {
            if (this.player.canDoubleJump && !this.player.hasDoubleJumped && !this.player.grounded && this.coyoteTime <= 0) {
                this.executeDoubleJump(currentJumpPower);
            }
        }

        // Reset jump pressed flag when grounded
        if (this.player.grounded) {
            this.jumpPressed = false;
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

    /**
     * Reset input state (call when player respawns or level changes)
     */
    reset() {
        this.coyoteTime = 0;
        this.jumpBufferTime = 0;
        this.jumpPressed = false;
        this.lastJumpKey = false;
        this.wasGrounded = false;
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