class MrMan {
    constructor(gameEngine, sceneManager, x, y) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.x = x;
        this.y = y;

        // Use consistent scaling based on game scale
        const characterScale = getCharacterScale();
        this.width = 10 * characterScale; // Scaled width
        this.height = 12 * characterScale; // Scaled height
        
        // Create bounding box
        this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
        
        // Load animation asset
        this.runRightAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            0,  // xStart
            0,  // yStart
            16, // width
            16, // height
            6,  // frameCount (adjust based on your sprite sheet)
            0.1, // frameDuration
            characterScale,   // scale - now consistent with game scale
            true // reverse
        );
        this.runLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            0,  // xStart
            16*10,  // yStart
            16, // width
            16, // height
            6,  // frameCount (adjust based on your sprite sheet)
            0.1, // frameDuration
            characterScale,   // scale - now consistent with game scale
            true // reverse
        );
        this.hurtRightAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            16*0,  // xStart
            16*6, // yStart
            16, // width
            16, // height
            1,  // frameCount (adjust based on your sprite sheet)
            0.1, // frameDuration
            characterScale,   // scale - now consistent with game scale
            true // reverse
        );
        this.hurtLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            16*0,  // xStart
            16*16, // yStart
            16, // width
            16, // height
            1,  // frameCount (adjust based on your sprite sheet)
            0.1, // frameDuration
            characterScale,   // scale - now consistent with game scale
            true // reverse
        );
        this.flyKickRightAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            16*0,  // xStart
            16*5, // yStart
            16, // width
            16, // height
            1, // frameCount
            0.2, // frameDuration
            characterScale,
            true);
        this.flyKickLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            16*0,  // xStart
            16*15, // yStart        
            16, // width
            16, // height
            1, // frameCount
            0.2, // frameDuration
            characterScale,
            true);
        this.idleRightAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/mrman/mrmansheet.png"),
            0,  // xStart
            16*2, // yStart
            16, // width
            16, // height
            4, // frameCount
            0.2, // frameDuration
            characterScale,
            true);
        this.idleLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/mrman/mrmansheet.png"),
            16*0,  // xStart
            16*12, // yStart
            16, // width
            16, // height
            4, // frameCount
            0.2, // frameDuration
            characterScale,
            true);
        // Follow behavior properties
        this.followDistance = 100; // Distance to maintain from player
        this.followSpeed = 3; // Speed at which MrMan follows
        this.direction = "right"; // Track which direction MrMan is facing
        
        // Wandering behavior properties
        this.isWandering = true; // Track if MrMan is wandering
        this.isIdle = false; // Track if MrMan is idle
        this.wanderDirection = "right"; // Direction for wandering
        this.wanderSpeed = 2; // Speed during wandering (slower than following)
        this.wanderTimer = 0; // Timer for wandering/idle
        this.wanderDuration = 0; // How long to wander in current direction
        this.idleDuration = 0; // How long to idle
        this.wanderMinTime = 3; // Minimum time to idle between wanders (seconds)
        this.wanderMaxTime = 8; // Maximum time to idle between wanders (seconds)
        this.wanderDistance = grid(2); // Distance to wander (2 tiles)
        this.startWanderX = 0; // Starting X position for current wander
        this.detectionRange = 300; // Range at which MrMan detects player and starts following
        
        // Attack behavior properties
        this.attackRange = 200; // Distance at which MrMan will attack (increased from 50)
        this.isAttacking = false; // Track if MrMan is performing flying kick
        this.attackTimer = 0;
        this.attackDuration = 0.6; // Duration of flying kick attack
        this.attackSpeed = 6; // Speed during flying kick attack
        this.attackCooldown = 1.5; // Time between attacks
        this.lastAttackTime = 0; // Track when last attack occurred
        
        // Physics properties (same as Player)
        this.velocity = 0;
        this.gravity = 0.8;
        this.groundLevel = 415;
        this.isJumping = false;
        
        // Hurt/Knockback state
        this.isHurt = false;
        this.hurtTimer = 0;
        this.hurtDuration = 2.0; // How long the hurt state lasts
        this.knockbackVelocityX = 0; // Horizontal knockback velocity
        this.knockbackVelocityY = 0; // Vertical knockback velocity
        this.bounceCount = 0; // Track number of bounces
        this.maxBounces = 2; // Maximum bounces before settling
        this.bounceDamping = 0.6; // Velocity reduction on each bounce
        
        // Recovery state after hurt
        this.isRecovering = false; // Track if MrMan is in recovery state
        this.recoveryTimer = 0;
        this.recoveryDuration = 1.5; // How long recovery lasts (can't attack during this time)
        
        // Health system
        this.maxHealth = 3; // Maximum health/lives
        this.currentHealth = this.maxHealth; // Current health
        this.healthBarWidth = 60; // Width of health bar in pixels
        this.healthBarHeight = 8; // Height of health bar in pixels
    }

    update() {
        // Apply gravity (frame-independent) - same as Player
        this.velocity += this.gravity * this.gameEngine.clockTick * 60;
        
        let deltaX = 0;
        let deltaY = 0;
        
        if (this.isHurt) {
            // Handle hurt/knockback state
            this.hurtTimer += this.gameEngine.clockTick;
            
            // Apply knockback movement - simplified physics
            deltaX = this.knockbackVelocityX * this.gameEngine.clockTick * 60;
            deltaY = this.velocity * this.gameEngine.clockTick * 60;
            
            // Apply friction to horizontal knockback (slows down over time)
            this.knockbackVelocityX *= 0.92; // Strong friction for quick slowdown
            
            // Check if hurt duration is over
            if (this.hurtTimer >= this.hurtDuration) {
                this.isHurt = false;
                this.hurtTimer = 0;
                this.knockbackVelocityX = 0;
                this.knockbackVelocityY = 0;
                this.bounceCount = 0;
                
                // Start recovery state
                this.isRecovering = true;
                this.recoveryTimer = 0;
                
                // Only remove if health is depleted
                if (this.currentHealth <= 0) {
                    this.removeFromWorld = true;
                }
                return;
            }
        } else if (this.isAttacking) {
            // Handle flying kick attack state
            this.attackTimer += this.gameEngine.clockTick;
            
            // Move towards player during attack
            const attackFrameSpeed = this.attackSpeed * this.gameEngine.clockTick * 60;
            if (this.direction === "right") {
                deltaX = attackFrameSpeed;
            } else {
                deltaX = -attackFrameSpeed;
            }
            
            // Check if attack duration is over
            if (this.attackTimer >= this.attackDuration) {
                this.isAttacking = false;
                this.attackTimer = 0;
                this.lastAttackTime = this.gameEngine.timer.gameTime;
            }
        } else if (this.isRecovering) {
            // Handle recovery state - can move but can't attack
            this.recoveryTimer += this.gameEngine.clockTick;
            
            // Check if recovery duration is over
            if (this.recoveryTimer >= this.recoveryDuration) {
                this.isRecovering = false;
                this.recoveryTimer = 0;
            }
            
            // Can still follow player during recovery, but no attack logic
            let player = this.findPlayer();
            if (player) {
                const horizontalDistance = player.x - this.x;
                
                // Move towards the player if not already very close
                if (Math.abs(horizontalDistance) > 5) {
                    const frameSpeed = this.followSpeed * this.gameEngine.clockTick * 60;
                    
                    if (horizontalDistance > 0) {
                        deltaX = Math.min(frameSpeed, Math.abs(horizontalDistance));
                        this.direction = "right";
                    } else {
                        deltaX = -Math.min(frameSpeed, Math.abs(horizontalDistance));
                        this.direction = "left";
                    }
                }
            }
            
            // Calculate gravity-based vertical movement
            deltaY = this.velocity * this.gameEngine.clockTick * 60;
        } else {
            // Normal behavior - check if player is in detection range
            // Find the player entity
            let player = this.findPlayer();
            
            if (player) {
                // Calculate distance to player
                const distanceToPlayer = Math.abs(player.x - this.x);
                const currentTime = this.gameEngine.timer.gameTime;
                
                // Check if player is within detection range
                if (distanceToPlayer <= this.detectionRange) {
                    // Player detected - stop wandering/idle and follow/attack
                    this.isWandering = false;
                    this.isIdle = false;
                    
                    // Check if we should attack (player is close, on same grid row, and cooldown is over)
                    const playerGridPos = worldToGrid(player.x, player.y);
                    const mrmanGridPos = worldToGrid(this.x, this.y);
                    const sameGridY = playerGridPos.y === mrmanGridPos.y;
                    
                    if (distanceToPlayer <= this.attackRange && 
                        sameGridY &&
                        !this.isAttacking && 
                        !this.isHurt && 
                        !this.isRecovering && 
                        (currentTime - this.lastAttackTime) >= this.attackCooldown) {
                        
                        // Start flying kick attack
                        this.isAttacking = true;
                        this.attackTimer = 0;
                        
                        // Play kick sound for MrMan's attack
                        this.gameEngine.audioManager.play("./assets/sounds/bomboclat.mp3", {
                            volume: 0.8,
                            startTime: 0.2,
                            endTime: 0.85,
                            playbackRate: 2.0,
                        });
                        
                        // Face the player
                        if (player.x > this.x) {
                            this.direction = "right";
                        } else {
                            this.direction = "left";
                        }
                        
                        // Reset flying kick animation to start from beginning
                        if (this.direction === "left") {
                            this.flyKickLeftAnimation.reset();
                        } else {
                            this.flyKickRightAnimation.reset();
                        }
                        
                        console.log("MrMan is attacking the player!");
                    } else if (!this.isAttacking) {
                        // Follow the player - move directly towards them
                        const horizontalDistance = player.x - this.x;
                        
                        // Always move towards the player if not already very close
                        if (Math.abs(horizontalDistance) > 5) {
                            // Calculate frame-independent movement speed
                            const frameSpeed = this.followSpeed * this.gameEngine.clockTick * 60;
                            
                            if (horizontalDistance > 0) {
                                deltaX = Math.min(frameSpeed, Math.abs(horizontalDistance));
                                this.direction = "right"; // Moving right
                            } else {
                                deltaX = -Math.min(frameSpeed, Math.abs(horizontalDistance));
                                this.direction = "left"; // Moving left
                            }
                        }
                    }
                } else {
                    // Player out of range - wander around or idle
                    if (!this.isWandering && !this.isIdle) {
                        // Just started wandering/idle cycle
                        this.startWandering();
                    } else if (this.isWandering) {
                        // Continue wandering
                        const frameSpeed = this.wanderSpeed * this.gameEngine.clockTick * 60;
                        
                        // Calculate how far we've moved from start position
                        const distanceMoved = Math.abs(this.x - this.startWanderX);
                        
                        // Check if we've moved 2 tiles
                        if (distanceMoved >= this.wanderDistance) {
                            // Finished wandering, start idle
                            this.startIdle();
                        } else {
                            // Continue moving in wander direction
                            if (this.wanderDirection === "right") {
                                deltaX = frameSpeed;
                            } else {
                                deltaX = -frameSpeed;
                            }
                        }
                    } else if (this.isIdle) {
                        // Continue idling
                        this.wanderTimer += this.gameEngine.clockTick;
                        
                        // Check if idle time is over
                        if (this.wanderTimer >= this.idleDuration) {
                            this.startWandering();
                        }
                        // No movement during idle
                    }
                }
            } else {
                // No player found - wander around or idle
                if (!this.isWandering && !this.isIdle) {
                    this.startWandering();
                } else if (this.isWandering) {
                    // Continue wandering
                    const frameSpeed = this.wanderSpeed * this.gameEngine.clockTick * 60;
                    
                    // Calculate how far we've moved from start position
                    const distanceMoved = Math.abs(this.x - this.startWanderX);
                    
                    // Check if we've moved 2 tiles
                    if (distanceMoved >= this.wanderDistance) {
                        // Finished wandering, start idle
                        this.startIdle();
                    } else {
                        // Continue moving in wander direction
                        if (this.wanderDirection === "right") {
                            deltaX = frameSpeed;
                        } else {
                            deltaX = -frameSpeed;
                        }
                    }
                } else if (this.isIdle) {
                    // Continue idling
                    this.wanderTimer += this.gameEngine.clockTick;
                    
                    // Check if idle time is over
                    if (this.wanderTimer >= this.idleDuration) {
                        this.startWandering();
                    }
                    // No movement during idle
                }
            }
            
            // Calculate gravity-based vertical movement (same as Player)
            deltaY = this.velocity * this.gameEngine.clockTick * 60;
        }
        
        // Use collision manager to handle movement (same as Player)
        const newPosition = this.gameEngine.collisionManager.handlePlayerMovement(this, deltaX, deltaY);
        const oldY = this.y;
        this.x = Math.round(newPosition.x);
        this.y = Math.round(newPosition.y);
        
        // Handle bouncing when hurt
        if (this.isHurt && this.velocity > 0 && this.y === oldY && this.bounceCount < this.maxBounces) {
            // We hit the ground while falling - bounce!
            this.velocity = -Math.abs(this.velocity) * 0.7; // Bounce with 70% of current velocity
            this.bounceCount++;
            
            // Reduce horizontal knockback on bounce
            this.knockbackVelocityX *= 0.8;
        }
        
        // Update bounding box
        this.updateBoundingBox();
    }
    
    // Method to trigger hurt state (called from PlayingScene)
    getHit(attackType, playerDirection) {
        if (this.isHurt) return; // Already hurt, ignore additional hits
        
        // Play hurt sound
        this.gameEngine.audioManager.play("./assets/sounds/hurt-sound.mp3", {
            volume: 0.6,
            startTime: 4.4,
            endTime: 4.7,
        });
        
        // Reduce health
        this.currentHealth--;
        console.log(`MrMan hit! Health: ${this.currentHealth}/${this.maxHealth}`);
        
        this.isHurt = true;
        this.hurtTimer = 0;
        this.bounceCount = 0;
        
        // Reset hurt animation to start from beginning
        if (this.direction === "left") {
            this.hurtLeftAnimation.reset();
        } else {
            this.hurtRightAnimation.reset();
        }
        
        // Simple knockback physics - single velocity vector
        const knockbackPower = attackType === "flyingkick" ? 20 : 8; // Stronger for flying kick (increased from 8/5)
        const upwardPower = 10; // Upward launch (increased from 12)
        
        // Find the player to determine knockback direction
        let player = this.findPlayer();
        if (player) {
            // Knockback away from player based on relative positions
            if (player.x > this.x) {
                // Player is to the right of MrMan, launch MrMan left
                this.knockbackVelocityX = -knockbackPower;
                this.velocity = -upwardPower;
            } else {
                // Player is to the left of MrMan, launch MrMan right
                this.knockbackVelocityX = knockbackPower;
                this.velocity = -upwardPower;
            }
        } else {
            // Fallback to direction-based knockback if player not found
            this.knockbackVelocityX = this.direction === "right" ? knockbackPower : -knockbackPower;
            this.velocity = -upwardPower;
        }
        
        // Clear any existing knockback Y velocity
        this.knockbackVelocityY = 0;
    }

    // Get MrMan's attack bounding box when attacking
    getAttackBoundingBox() {
        if (!this.isAttacking) return null;
        
        // Create attack bounding box in front of MrMan
        const attackWidth = 12 * params.scale;
        const attackHeight = 12 * params.scale;
        
        let attackX;
        if (this.direction === "right") {
            attackX = this.x + this.width;
        } else {
            attackX = this.x - attackWidth;
        }
        
        const attackY = this.y + (this.height / 4);
        
        return new BoundingBox(attackX, attackY, attackWidth, attackHeight);
    }

    // Helper method to find the player entity
    findPlayer() {
        for (let entity of this.gameEngine.entities) {
            if (entity instanceof Player) {
                return entity;
            }
        }
        return null;
    }

    // Method to start wandering in a random direction
    startWandering() {
        this.isWandering = true;
        this.isIdle = false;
        this.wanderTimer = 0;
        
        // Randomly choose direction (left or right)
        this.wanderDirection = Math.random() < 0.5 ? "left" : "right";
        this.direction = this.wanderDirection; // Update facing direction
        
        // Set starting position for this wander
        this.startWanderX = this.x;
        
        console.log(`MrMan started wandering ${this.wanderDirection} for 2 tiles from position ${this.startWanderX}`);
    }
    
    // Method to start idle state
    startIdle() {
        this.isWandering = false;
        this.isIdle = true;
        this.wanderTimer = 0;
        
        // Randomly choose idle duration between min and max time
        this.idleDuration = Math.random() * (this.wanderMaxTime - this.wanderMinTime) + this.wanderMinTime;
        
        console.log(`MrMan started idling for ${this.idleDuration.toFixed(1)} seconds`);
    }

    draw() {
        // Apply camera offset to drawing position
        const screenPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height);

        const aniOffsetx = -14;
        const aniOffsety = 35;
        
        // Choose the appropriate animation based on state and direction
        let currentAnimation;
        
        if (this.isHurt) {
            // Show hurt animation when hurt
            if (this.direction === "left") {
                currentAnimation = this.hurtLeftAnimation;
            } else {
                currentAnimation = this.hurtRightAnimation;
            }
        } else if (this.isAttacking) {
            // Show flying kick animation when attacking
            if (this.direction === "left") {
                currentAnimation = this.flyKickLeftAnimation;
            } else {
                currentAnimation = this.flyKickRightAnimation;
            }
        } else if (this.isIdle) {
            // Show idle animation when idle (not moving)
            if (this.direction === "left") {
                currentAnimation = this.idleLeftAnimation;
            } else {
                currentAnimation = this.idleRightAnimation;
            }
        } else {
            // Show run animation for all other states (wandering, following, recovering)
            if (this.direction === "left") {
                currentAnimation = this.runLeftAnimation;
            } else {
                currentAnimation = this.runRightAnimation;
            }
        }
        
        // Draw the animation
        currentAnimation.drawFrame(
            this.gameEngine.clockTick, 
            this.gameEngine.ctx, 
            screenPos.x + aniOffsetx, 
            screenPos.y + aniOffsety
        );
        
        // Draw health display above MrMan's head
        this.drawHealthDisplay();
        
        // Debug drawing
        if (params.debug) {
            // Draw bounding box
            const boundingBoxScreenPos = this.gameEngine.camera.worldToScreen(this.boundingBox.x, this.boundingBox.y);
            this.gameEngine.ctx.strokeStyle = this.isHurt ? "red" : "blue";
            this.gameEngine.ctx.lineWidth = 2;
            this.gameEngine.ctx.strokeRect(boundingBoxScreenPos.x, boundingBoxScreenPos.y, this.boundingBox.width, this.boundingBox.height);
            
            // Draw attack bounding box if attacking
            const attackBox = this.getAttackBoundingBox();
            if (attackBox) {
                const attackBoxScreenPos = this.gameEngine.camera.worldToScreen(attackBox.x, attackBox.y);
                this.gameEngine.ctx.strokeStyle = "orange";
                this.gameEngine.ctx.lineWidth = 3;
                this.gameEngine.ctx.strokeRect(attackBoxScreenPos.x, attackBoxScreenPos.y, attackBox.width, attackBox.height);
            }
            
            // Draw attack range circle
            const player = this.findPlayer();
            if (player) {
                const playerScreenPos = this.gameEngine.camera.worldToScreen(player.x, player.y);
                const mrmanScreenPos = this.gameEngine.camera.worldToScreen(this.x, this.y);
                
                // Draw detection range circle around MrMan (larger, blue)
                this.gameEngine.ctx.strokeStyle = "rgba(0, 0, 255, 0.4)"; // Semi-transparent blue
                this.gameEngine.ctx.lineWidth = 2;
                this.gameEngine.ctx.setLineDash([3, 3]); // Dashed line
                this.gameEngine.ctx.beginPath();
                this.gameEngine.ctx.arc(mrmanScreenPos.x, mrmanScreenPos.y, this.detectionRange, 0, 2 * Math.PI);
                this.gameEngine.ctx.stroke();
                this.gameEngine.ctx.setLineDash([]); // Reset line dash
                
                // Draw attack range circle around MrMan (smaller, red)
                this.gameEngine.ctx.strokeStyle = "rgba(255, 0, 0, 0.6)"; // Semi-transparent red
                this.gameEngine.ctx.lineWidth = 2;
                this.gameEngine.ctx.setLineDash([5, 5]); // Dashed line
                this.gameEngine.ctx.beginPath();
                this.gameEngine.ctx.arc(mrmanScreenPos.x, mrmanScreenPos.y, this.attackRange, 0, 2 * Math.PI);
                this.gameEngine.ctx.stroke();
                this.gameEngine.ctx.setLineDash([]); // Reset line dash
                
                // Draw line to player if within detection range
                const distanceToPlayer = Math.abs(player.x - this.x);
                if (distanceToPlayer <= this.detectionRange) {
                    const lineColor = distanceToPlayer <= this.attackRange ? "rgba(255, 0, 0, 0.8)" : "rgba(0, 0, 255, 0.6)";
                    this.gameEngine.ctx.strokeStyle = lineColor;
                    this.gameEngine.ctx.lineWidth = 3;
                    this.gameEngine.ctx.beginPath();
                    this.gameEngine.ctx.moveTo(mrmanScreenPos.x, mrmanScreenPos.y);
                    this.gameEngine.ctx.lineTo(playerScreenPos.x, playerScreenPos.y);
                    this.gameEngine.ctx.stroke();
                }
            }
            
            // Draw debug text above MrMan's head
            const debugTextPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height - 60);
            this.gameEngine.ctx.fillStyle = "white";
            this.gameEngine.ctx.strokeStyle = "black";
            this.gameEngine.ctx.lineWidth = 2;
            this.gameEngine.ctx.font = "12px Arial";
            this.gameEngine.ctx.textAlign = "center";
            
            // Debug information to display
            const debugInfo = [
                `Dir: ${this.direction}`,
                `Vel: ${this.velocity.toFixed(2)}`,
                `Hurt: ${this.isHurt}`,
                `Recover: ${this.isRecovering}`,
                `Attack: ${this.isAttacking}`,
                `Wander: ${this.isWandering}`,
                `Idle: ${this.isIdle}`,
                `Health: ${this.currentHealth}/${this.maxHealth}`,
                `Pos: (${Math.round(this.x)}, ${Math.round(this.y)})`,
                `Timer: ${this.isHurt ? this.hurtTimer.toFixed(2) : this.attackTimer.toFixed(2)}`
            ];
            
            // Draw each line of debug info
            debugInfo.forEach((info, index) => {
                const textY = debugTextPos.y + (index * 14);
                // Draw text outline (stroke)
                this.gameEngine.ctx.strokeText(info, debugTextPos.x, textY);
                // Draw text fill
                this.gameEngine.ctx.fillText(info, debugTextPos.x, textY);
            });
        }
    }
    
    updateBoundingBox() {
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
    }

    drawHealthDisplay() {
        // Calculate position above MrMan's head
        const healthDisplayPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height - 20);
        
        // Health bar background
        const barX = healthDisplayPos.x - this.healthBarWidth / 2;
        const barY = healthDisplayPos.y - 15;
        
        // Draw health bar background (dark gray)
        this.gameEngine.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.gameEngine.ctx.fillRect(barX - 2, barY - 2, this.healthBarWidth + 4, this.healthBarHeight + 4);
        
        // Draw health bar background (light gray)
        this.gameEngine.ctx.fillStyle = "rgba(128, 128, 128, 0.8)";
        this.gameEngine.ctx.fillRect(barX, barY, this.healthBarWidth, this.healthBarHeight);
        
        // Draw current health (red to green gradient based on health)
        if (this.currentHealth > 0) {
            const healthPercentage = this.currentHealth / this.maxHealth;
            const healthWidth = this.healthBarWidth * healthPercentage;
            
            // Color based on health percentage
            let healthColor;
            if (healthPercentage > 0.6) {
                healthColor = "rgba(0, 255, 0, 0.9)"; // Green
            } else if (healthPercentage > 0.3) {
                healthColor = "rgba(255, 255, 0, 0.9)"; // Yellow
            } else {
                healthColor = "rgba(255, 0, 0, 0.9)"; // Red
            }
            
            this.gameEngine.ctx.fillStyle = healthColor;
            this.gameEngine.ctx.fillRect(barX, barY, healthWidth, this.healthBarHeight);
        }
        
        // Draw heart icons above health bar
        const heartY = barY - 20;
        const heartSize = 12;
        const heartSpacing = 16;
        const startX = healthDisplayPos.x - ((this.maxHealth * heartSpacing) / 2) + (heartSpacing / 2);
        
        for (let i = 0; i < this.maxHealth; i++) {
            const heartX = startX + (i * heartSpacing);
            
            if (i < this.currentHealth) {
                // Draw filled heart (red)
                this.drawHeart(heartX, heartY, heartSize, "rgba(255, 0, 0, 0.9)", true);
            } else {
                // Draw empty heart (gray outline)
                this.drawHeart(heartX, heartY, heartSize, "rgba(128, 128, 128, 0.7)", false);
            }
        }
        
        // Draw health text
        this.gameEngine.ctx.fillStyle = "white";
        this.gameEngine.ctx.strokeStyle = "black";
        this.gameEngine.ctx.lineWidth = 2;
        this.gameEngine.ctx.font = "10px Arial";
        this.gameEngine.ctx.textAlign = "center";
        
        const healthText = `${this.currentHealth}/${this.maxHealth}`;
        const textY = barY + this.healthBarHeight + 12;
        
        // Draw text outline
        this.gameEngine.ctx.strokeText(healthText, healthDisplayPos.x, textY);
        // Draw text fill
        this.gameEngine.ctx.fillText(healthText, healthDisplayPos.x, textY);
    }
    
    drawHeart(x, y, size, color, filled) {
        const ctx = this.gameEngine.ctx;
        const halfSize = size / 2;
        
        ctx.save();
        ctx.translate(x, y);
        
        if (filled) {
            ctx.fillStyle = color;
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
        }
        
        // Draw heart shape using curves
        ctx.beginPath();
        ctx.moveTo(0, halfSize * 0.3);
        
        // Left curve
        ctx.bezierCurveTo(-halfSize * 0.8, -halfSize * 0.5, -halfSize * 0.8, halfSize * 0.3, 0, halfSize);
        
        // Right curve  
        ctx.bezierCurveTo(halfSize * 0.8, halfSize * 0.3, halfSize * 0.8, -halfSize * 0.5, 0, halfSize * 0.3);
        
        ctx.closePath();
        
        if (filled) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
        
        ctx.restore();
    }
}