class Player {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.x = grid(20);
        this.y = grid(5);
        
        // Use consistent scaling based on game scale
        const characterScale = getCharacterScale();
        this.width = 10 * params.scale; // Player width for collision
        this.height = 12 * params.scale; // Player height for collision
        this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
        
        this.walkRightAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/mrman/mrmansheet.png"),
            0,  // xStart
            0, // yStart
            16, // width
            16, // height
            6, // frameCount
            0.1, // frameDuration
            characterScale, 
            true);
        this.walkLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/mrman/mrmansheet.png"),
            16*0,  // xStart
            16*10, // yStart
            16, // width
            16, // height
            6, // frameCount
            0.1, // frameDuration
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
        this.punchLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/mrman/mrmansheet.png"),
            16*0,  // xStart
            16*13, // yStart
            16, // width
            16, // height
            3, // frameCount
            0.2, // frameDuration
            characterScale,
            true);
        this.punchRightAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/mrman/mrmansheet.png"),
            16*0,  // xStart
            16*3, // yStart
            16, // width
            16, // height
            3, // frameCount
            0.2, // frameDuration
            characterScale,
            true);
        this.flyKickRightAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/mrman/mrmansheet.png"),
            16*0,  // xStart
            16*5, // yStart
            16, // width
            16, // height
            1, // frameCount
            0.2, // frameDuration
            characterScale,
            true);
        this.flyKickLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/mrman/mrmansheet.png"),
            16*0,  // xStart
            16*15, // yStart
            16, // width
            16, // height
            1, // frameCount
            0.2, // frameDuration
            characterScale,
            true);
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
        this.jumpRightAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            16*0,  // xStart
            16*7, // yStart
            16, // width
            16, // height
            1,  // frameCount (adjust based on your sprite sheet)
            1, // frameDuration
            characterScale,   // scale - now consistent with game scale
            true // reverse
        );
        this.jumpLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            16*0,  // xStart
            16*17, // yStart
            16, // width
            16, // height
            1,  // frameCount (adjust based on your sprite sheet)
            1, // frameDuration
            characterScale,   // scale - now consistent with game scale
            true // reverse
        );
        this.facePlantLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            16*0,  // xStart
            16*20, // yStart
            16, // width
            16, // height
            1,  // frameCount (adjust based on your sprite sheet)
            1, // frameDuration
            characterScale,   // scale - now consistent with game scale
            true // reverse
        );
        this.facePlantRightAnimation = new Animator(
            ASSET_MANAGER.getAsset(`./assets/images/mrman/mrmansheet.png`),
            16*0,  // xStart
            16*19, // yStart
            16, // width
            16, // height
            1,  // frameCount (adjust based on your sprite sheet)
            1, // frameDuration
            characterScale,   // scale - now consistent with game scale
            true // reverse
        );
        this.speed = 5;
        this.direction = "right";
        this.velocity = 0; // Vertical velocity for gravity/jumping
        this.horizontalVelocity = 0; // Horizontal velocity for friction movement
        this.gravity = 0.9;
        this.jumpStrength = 17;
        this.groundLevel = 415;
        this.isJumping = false;
        
        // Friction/acceleration system (Mario Bros-style)
        this.maxSpeed = 5; // Maximum horizontal speed
        this.acceleration = 0.5; // How quickly player accelerates
        this.friction = 0.85; // Friction multiplier (0.85 = 15% speed loss per frame)
        
        // Punch state tracking
        this.isPunching = false;
        this.punchTimer = 0;
        this.punchDuration = 0.4; // Duration of punch animation in seconds
        this.punchBoundingBox = null; // Will be created when punching
        
        // Punch cooldown system
        this.punchCooldown = 0.8; // Time between punches in seconds
        this.lastPunchTime = 0; // Track when last punch occurred
        
        // Flying kick cooldown system
        this.flyingKickCooldown = 1.2; // Time between flying kicks in seconds (longer than punch)
        this.lastFlyingKickTime = 0; // Track when last flying kick occurred
        
        // Flying kick state tracking
        this.isFlyingKick = false;
        this.flyingKickTimer = 0;
        this.flyingKickDuration = 0.6; // Duration of flying kick in seconds
        this.flyingKickSpeed = 8; // Speed during flying kick
        this.flyingKickBoundingBox = null; // Will be created when flying kick
        
        // Health system
        this.maxHealth = 6; // Maximum health/lives
        this.currentHealth = this.maxHealth; // Current health
        this.healthBarWidth = 60; // Width of health bar in pixels
        this.healthBarHeight = 8; // Height of health bar in pixels
        
        // Pickup system
        this.heldItem = null; // Currently held item
        this.pickupRange = 40; // Range to detect pickupable items
        
        // Invulnerability system
        this.isInvulnerable = false; // Track if player is invulnerable
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 1.5; // Duration of invulnerability in seconds
        
        // Hurt/Knockback state (same as MrMan)
        this.isHurt = false;
        this.hurtTimer = 0;
        this.hurtDuration = 1.0; // How long the hurt state lasts (reduced from 2.0)
        this.knockbackVelocityX = 0; // Horizontal knockback velocity
        this.knockbackVelocityY = 0; // Vertical knockback velocity
        this.bounceCount = 0; // Track number of bounces
        this.maxBounces = 2; // Maximum bounces before settling
        this.bounceDamping = 0.6; // Velocity reduction on each bounce
        
        // Fall damage system
        this.isFalling = false; // Track if player is falling (not jumping)
        this.fallStartY = 0; // Y position where the fall started (highest point while airborne)
        this.isAirborne = false; // Track if player is in the air (jumping or falling)
        this.fallDamageThreshold = 4; // Number of grid blocks before fall damage kicks in
        this.fallDamagePerBlock = 1; // Damage per block fallen beyond threshold
        
        // Faceplant state (for fall damage)
        this.isFacePlant = false; // Track if player is face-planted
        this.facePlantTimer = 0;
        this.facePlantDuration = 1.5; // Duration of faceplant stun in seconds
    }

    update() {
        // Apply gravity (frame-independent)
        this.velocity += this.gravity * this.gameEngine.clockTick * 60; // Multiply by 60 for 60fps baseline

        // Horizontal movement with collision detection (frame-independent)
        const frameSpeed = this.speed * this.gameEngine.clockTick * 60;
        let deltaX = 0;
        let deltaY = 0;
        
        if (this.isFacePlant) {
            // Handle faceplant state - player is stunned and can't move
            this.facePlantTimer += this.gameEngine.clockTick;
            
            // Apply friction during faceplant
            this.horizontalVelocity *= this.friction;
            if (Math.abs(this.horizontalVelocity) < 0.1) {
                this.horizontalVelocity = 0;
            }
            deltaX = this.horizontalVelocity * this.gameEngine.clockTick * 60;
            
            // Only apply gravity during faceplant
            deltaY = this.velocity * this.gameEngine.clockTick * 60;
            
            // Check if faceplant duration is over
            if (this.facePlantTimer >= this.facePlantDuration) {
                this.isFacePlant = false;
                this.facePlantTimer = 0;
            }
            // No other movement allowed during faceplant
        } else if (this.isHurt) {
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
                return;
            }
        } else {
            // Normal movement (only if not hurt)
            // Handle flying kick movement
            if (this.isFlyingKick) {
                // Move in the direction the player is facing during flying kick
                const flyingKickFrameSpeed = this.flyingKickSpeed * this.gameEngine.clockTick * 60;
                if (this.direction === "right") {
                    deltaX = flyingKickFrameSpeed;
                } else {
                    deltaX = -flyingKickFrameSpeed;
                }
                // Clear horizontal velocity during flying kick to prevent interference
                this.horizontalVelocity = 0;
            }
            // Only allow normal movement if not performing special attacks
            else if (!this.isPunching) {
                // Friction-based horizontal movement system (Mario Bros style)
                let targetVelocity = 0;
                
                if (this.gameEngine.keys["d"]) {
                    targetVelocity = this.maxSpeed;
                    this.direction = "right";
                }
                if (this.gameEngine.keys["a"]) {
                    targetVelocity = -this.maxSpeed;
                    this.direction = "left";
                }
                
                // Apply acceleration towards target velocity or friction towards zero
                if (targetVelocity !== 0) {
                    // Accelerating towards target speed
                    const accelerationAmount = this.acceleration * this.gameEngine.clockTick * 60;
                    if (Math.abs(targetVelocity - this.horizontalVelocity) < accelerationAmount) {
                        // Close enough to target velocity, snap to it
                        this.horizontalVelocity = targetVelocity;
                    } else {
                        // Accelerate towards target velocity
                        if (targetVelocity > this.horizontalVelocity) {
                            this.horizontalVelocity += accelerationAmount;
                        } else {
                            this.horizontalVelocity -= accelerationAmount;
                        }
                    }
                } else {
                    // Apply friction when no input
                    this.horizontalVelocity *= this.friction;
                    
                    // Stop completely when velocity is very small to prevent jittering
                    if (Math.abs(this.horizontalVelocity) < 0.1) {
                        this.horizontalVelocity = 0;
                    }
                }
                
                // Apply horizontal velocity to movement
                deltaX = this.horizontalVelocity * this.gameEngine.clockTick * 60;
            } else {
                // Apply friction when punching (can't move but should slow down)
                this.horizontalVelocity *= this.friction;
                if (Math.abs(this.horizontalVelocity) < 0.1) {
                    this.horizontalVelocity = 0;
                }
                deltaX = this.horizontalVelocity * this.gameEngine.clockTick * 60;
            }
            
            // Calculate gravity-based vertical movement
            deltaY = this.velocity * this.gameEngine.clockTick * 60;
        }
        
        // Punch input handling (only if not hurt and not face-planted)
        if (!this.isHurt && !this.isFacePlant && this.gameEngine.consumeKey("p") && !this.isPunching && !this.isJumping && !this.isFlyingKick) {
            // Check if enough time has passed since last punch
            const currentTime = this.gameEngine.timer.gameTime;
            if ((currentTime - this.lastPunchTime) >= this.punchCooldown) {
                this.isPunching = true;
                this.punchTimer = 0;
                this.lastPunchTime = currentTime;
                this.createPunchBoundingBox();
                
                // Play punch sound
                this.gameEngine.audioManager.play("./assets/sounds/punch.mp3", {
                    volume: 0.7,
                });
                
                // Reset punch animation to start from beginning
                if (this.direction === "left") {
                    this.punchLeftAnimation.reset();
                } else {
                    this.punchRightAnimation.reset();
                }
            }
        }
        
        // Flying kick input handling (only if not hurt and not face-planted)
        if (!this.isHurt && !this.isFacePlant && this.gameEngine.consumeKey("k") && !this.isFlyingKick && !this.isPunching) {
            // Check if enough time has passed since last flying kick
            const currentTime = this.gameEngine.timer.gameTime;
            if ((currentTime - this.lastFlyingKickTime) >= this.flyingKickCooldown) {
                this.isFlyingKick = true;
                this.flyingKickTimer = 0;
                this.lastFlyingKickTime = currentTime;
                this.createFlyingKickBoundingBox();
                
                // Play kick sound
                this.gameEngine.audioManager.play("./assets/sounds/bomboclat.mp3", {
                    volume: 0.8,
                    startTime: 0.2,
                    endTime: 0.85,
                    playbackRate: 2.0,
                });
                
                // Reset flying kick animation to start from beginning
                if (this.direction === "left") {
                    this.flyKickLeftAnimation.reset();
                } else {
                    this.flyKickRightAnimation.reset();
                }
            }
        }
        
        // Pickup/Drop input handling (only if not hurt and not face-planted)
        if (!this.isHurt && !this.isFacePlant && this.gameEngine.consumeKey("e")) {
            if (this.heldItem) {
                // Drop the currently held item
                this.dropItem();
            } else {
                // Try to pick up a nearby item
                this.tryPickupItem();
            }
        }
        
        // Update punch state
        if (this.isPunching) {
            this.punchTimer += this.gameEngine.clockTick;
            if (this.punchTimer >= this.punchDuration) {
                this.isPunching = false;
                this.punchTimer = 0;
                this.punchBoundingBox = null; // Remove punch bounding box
            }
        }
        
        // Update flying kick state
        if (this.isFlyingKick) {
            this.flyingKickTimer += this.gameEngine.clockTick;
            if (this.flyingKickTimer >= this.flyingKickDuration) {
                this.isFlyingKick = false;
                this.flyingKickTimer = 0;
                this.flyingKickBoundingBox = null; // Remove flying kick bounding box
            }
        }
        
        // Use collision manager to handle movement
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

        // Jumping (frame-independent) - only if not performing special attacks and not hurt and not face-planted
        if (!this.isHurt && !this.isFacePlant && this.gameEngine.keys[" "] && !this.isJumping && !this.isPunching && !this.isFlyingKick) {
            this.gameEngine.audioManager.play("./assets/sounds/roblox-classic-jump.mp3", {
                volume: 1,
                playbackRate: 2.0,
            });
            this.velocity = -this.jumpStrength;
            this.isJumping = true;
            
            // Start airborne tracking - record current position as potential fall start
            if (!this.isAirborne) {
                this.isAirborne = true;
                this.fallStartY = this.y; // Record position when becoming airborne
            }
        }
        
        // Track when player becomes airborne (falling off platforms)
        if (this.velocity > 0 && !this.isJumping && !this.isAirborne) {
            // Player started falling (stepped off a platform)
            this.isAirborne = true;
            this.isFalling = true;
            this.fallStartY = this.y;
        }
        
        // Update fall start position to highest point while airborne
        if (this.isAirborne && this.y < this.fallStartY) {
            this.fallStartY = this.y; // Update to highest point reached
        }
        
        // Start falling state when airborne and moving downward
        if (this.isAirborne && this.velocity > 0 && !this.isFalling) {
            this.isFalling = true;
        }

        this.updateBoundingBox();
        
        // Update punch bounding box position if it exists
        if (this.punchBoundingBox) {
            this.updatePunchBoundingBox();
        }
        
        // Update flying kick bounding box position if it exists
        if (this.flyingKickBoundingBox) {
            this.updateFlyingKickBoundingBox();
        }
        
        // Update invulnerability timer
        if (this.isInvulnerable) {
            this.invulnerabilityTimer += this.gameEngine.clockTick;
            if (this.invulnerabilityTimer >= this.invulnerabilityDuration) {
                this.isInvulnerable = false;
                this.invulnerabilityTimer = 0;
            }
        }
        
        const gridPos = worldToGrid(this.x, this.y);
    }

    createPunchBoundingBox() {
        // Create punch bounding box in front of player
        const punchWidth = 14 * params.scale; // Width of punch hitbox
        const punchHeight = 14 * params.scale; // Height of punch hitbox
        
        let punchX;
        if (this.direction === "right") {
            punchX = this.x + this.width; // Right side of player
        } else {
            punchX = this.x - punchWidth; // Left side of player
        }
        
        const punchY = this.y + (this.height / 4); // Slightly above center of player
        
        this.punchBoundingBox = new BoundingBox(punchX, punchY, punchWidth, punchHeight);
    }
    
    updatePunchBoundingBox() {
        if (!this.punchBoundingBox) return;
        
        // Update punch bounding box position relative to player
        const punchWidth = 14 * params.scale;
        
        if (this.direction === "right") {
            this.punchBoundingBox.x = this.x + this.width;
        } else {
            this.punchBoundingBox.x = this.x - punchWidth;
        }
        
        this.punchBoundingBox.y = this.y + (this.height / 4);
    }
    
    createFlyingKickBoundingBox() {
        // Create flying kick bounding box in front of player (larger than punch)
        const kickWidth = 12 * params.scale; // Width of kick hitbox (larger than punch)
        const kickHeight = 12 * params.scale; // Height of kick hitbox
        
        let kickX;
        if (this.direction === "right") {
            kickX = this.x + this.width; // Right side of player
        } else {
            kickX = this.x - kickWidth; // Left side of player
        }
        
        const kickY = this.y + (this.height / 3); // Center of player
        
        this.flyingKickBoundingBox = new BoundingBox(kickX, kickY, kickWidth, kickHeight);
    }
    
    updateFlyingKickBoundingBox() {
        if (!this.flyingKickBoundingBox) return;
        
        // Update flying kick bounding box position relative to player
        const kickWidth = 12 * params.scale;
        
        if (this.direction === "right") {
            this.flyingKickBoundingBox.x = this.x + this.width;
        } else {
            this.flyingKickBoundingBox.x = this.x - kickWidth;
        }
        
        this.flyingKickBoundingBox.y = this.y + (this.height / 3);
    }
    
    // Pickup system methods
    tryPickupItem() {
        // Find nearby pickupable items
        for (let entity of this.gameEngine.entities) {
            if (entity.isPickupable && !entity.isHeld && !entity.removeFromWorld) {
                const distance = getDistance(this, entity);
                if (distance <= this.pickupRange) {
                    this.pickupItem(entity);
                    break; // Only pick up one item at a time
                }
            }
        }
    }
    
    pickupItem(item) {
        if (this.heldItem || !item.isPickupable) return; // Already holding something or item not pickupable
        
        this.heldItem = item;
        item.isHeld = true;
        
        // Call item's pickup method if it exists
        if (item.onPickup) {
            item.onPickup(this);
        }
        
        console.log(`Picked up: ${item.constructor.name}`);
    }
    
    dropItem() {
        if (!this.heldItem) return; // Not holding anything
        
        const item = this.heldItem;
        
        // Position item in front of player
        const dropOffset = 40;
        if (this.direction === "right") {
            item.x = this.x + dropOffset;
        } else {
            item.x = this.x - dropOffset;
        }
        item.y = this.y;
        
        // Reset item's horizontal velocity to prevent sliding
        item.horizontalVelocity = 0;
        
        // Update item state
        item.isHeld = false;
        this.heldItem = null;
        
        // Call item's drop method if it exists
        if (item.onDrop) {
            item.onDrop(this);
        }
        
        console.log(`Dropped: ${item.constructor.name}`);
    }

    draw() {
        // Use dynamic sprite dimensions based on character scale
        const characterScale = getCharacterScale();
        const spriteWidth = 16 * characterScale;  // Width of the sprite after scaling
        const spriteHeight = 16 * characterScale;  // Height of the sprite after scaling
        const offsetX = -spriteWidth / 2 + 16;  // Center the sprite horizontally
        const offsetY = -spriteHeight + 38;  // Move up by sprite height to align with ground
        
        // Apply camera offset to drawing position (already rounded in worldToScreen)
        const screenPos = this.gameEngine.camera.worldToScreen(this.x + offsetX, this.y + offsetY);
        
        // Choose the appropriate animation based on state
        let currentAnimation;
        
        if (this.isFacePlant) {
            // Show faceplant animation when face-planted (highest priority)
            if (this.direction === "left") {
                currentAnimation = this.facePlantLeftAnimation;
            } else {
                currentAnimation = this.facePlantRightAnimation;
            }
        } else if (this.isHurt) {
            // Show hurt animation when hurt
            if (this.direction === "left") {
                currentAnimation = this.hurtLeftAnimation;
            } else {
                currentAnimation = this.hurtRightAnimation;
            }
        } else if (this.isFlyingKick) {
            // Flying kick animation takes priority over movement
            if (this.direction === "left") {
                currentAnimation = this.flyKickLeftAnimation;
            } else {
                currentAnimation = this.flyKickRightAnimation;
            }
        } else if (this.isPunching) {
            // Punch animation takes priority over movement
            if (this.direction === "left") {
                currentAnimation = this.punchLeftAnimation;
            } else {
                currentAnimation = this.punchRightAnimation;
            }
        } else if (this.isJumping) {
            // Jump animation when in the air
            if (this.direction === "left") {
                currentAnimation = this.jumpLeftAnimation;
            } else {
                currentAnimation = this.jumpRightAnimation;
            }
        } else if (!this.gameEngine.keys["a"] && !this.gameEngine.keys["d"]) {
            // Idle animation based on direction
            if (this.direction === "left") {
                currentAnimation = this.idleLeftAnimation;
            } else {
                currentAnimation = this.idleRightAnimation;
            }
        } else {
            // Walking animation based on direction
            if (this.direction === "left") {
                currentAnimation = this.walkLeftAnimation;
            } else {
                currentAnimation = this.walkRightAnimation;
            }
        }
        
        // Draw the animation at the camera-adjusted position with pixel-perfect positioning
        currentAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, screenPos.x, screenPos.y);
        
        // Draw health display above player's head
        this.drawHealthDisplay();

        if (params.debug) {
            // Apply camera offset to bounding box drawing
            const boundingBoxScreenPos = this.gameEngine.camera.worldToScreen(this.boundingBox.x, this.boundingBox.y);
            this.gameEngine.ctx.strokeStyle = this.isInvulnerable ? "yellow" : "red";
            this.gameEngine.ctx.lineWidth = 2;
            this.gameEngine.ctx.strokeRect(boundingBoxScreenPos.x, boundingBoxScreenPos.y, this.boundingBox.width, this.boundingBox.height);
            
            // Draw invulnerability info
            if (this.isInvulnerable) {
                const invulnTextPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height - 80);
                this.gameEngine.ctx.fillStyle = "yellow";
                this.gameEngine.ctx.strokeStyle = "black";
                this.gameEngine.ctx.lineWidth = 2;
                this.gameEngine.ctx.font = "12px Arial";
                this.gameEngine.ctx.textAlign = "center";
                
                const invulnText = `INVULNERABLE: ${(this.invulnerabilityDuration - this.invulnerabilityTimer).toFixed(1)}s`;
                this.gameEngine.ctx.strokeText(invulnText, invulnTextPos.x, invulnTextPos.y);
                this.gameEngine.ctx.fillText(invulnText, invulnTextPos.x, invulnTextPos.y);
            }
            
            // Draw faceplant state info
            if (this.isFacePlant) {
                const facePlantTextPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height - 100);
                this.gameEngine.ctx.fillStyle = "orange";
                this.gameEngine.ctx.strokeStyle = "black";
                this.gameEngine.ctx.lineWidth = 2;
                this.gameEngine.ctx.font = "12px Arial";
                this.gameEngine.ctx.textAlign = "center";
                
                const facePlantText = `FACEPLANT: ${(this.facePlantDuration - this.facePlantTimer).toFixed(1)}s`;
                this.gameEngine.ctx.strokeText(facePlantText, facePlantTextPos.x, facePlantTextPos.y);
                this.gameEngine.ctx.fillText(facePlantText, facePlantTextPos.x, facePlantTextPos.y);
            }
            
            // Draw hurt state info
            if (this.isHurt) {
                const hurtTextPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height - 120);
                this.gameEngine.ctx.fillStyle = "red";
                this.gameEngine.ctx.strokeStyle = "black";
                this.gameEngine.ctx.lineWidth = 2;
                this.gameEngine.ctx.font = "12px Arial";
                this.gameEngine.ctx.textAlign = "center";
                
                const hurtInfo = [
                    `HURT: ${(this.hurtDuration - this.hurtTimer).toFixed(1)}s`,
                    `Knockback: (${this.knockbackVelocityX.toFixed(1)}, ${this.knockbackVelocityY.toFixed(1)})`,
                    `Bounces: ${this.bounceCount}/${this.maxBounces}`
                ];
                
                hurtInfo.forEach((info, index) => {
                    const textY = hurtTextPos.y + (index * 14);
                    this.gameEngine.ctx.strokeText(info, hurtTextPos.x, textY);
                    this.gameEngine.ctx.fillText(info, hurtTextPos.x, textY);
                });
            }
            
            // Draw punch cooldown info
            const currentTime = this.gameEngine.timer.gameTime;
            const timeSinceLastPunch = currentTime - this.lastPunchTime;
            if (timeSinceLastPunch < this.punchCooldown) {
                const cooldownTextPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height - 120);
                this.gameEngine.ctx.fillStyle = "orange";
                this.gameEngine.ctx.strokeStyle = "black";
                this.gameEngine.ctx.lineWidth = 2;
                this.gameEngine.ctx.font = "12px Arial";
                this.gameEngine.ctx.textAlign = "center";
                
                const cooldownRemaining = this.punchCooldown - timeSinceLastPunch;
                const cooldownText = `PUNCH COOLDOWN: ${cooldownRemaining.toFixed(1)}s`;
                
                this.gameEngine.ctx.strokeText(cooldownText, cooldownTextPos.x, cooldownTextPos.y);
                this.gameEngine.ctx.fillText(cooldownText, cooldownTextPos.x, cooldownTextPos.y);
            }
            
            // Draw flying kick cooldown info
            const timeSinceLastFlyingKick = currentTime - this.lastFlyingKickTime;
            if (timeSinceLastFlyingKick < this.flyingKickCooldown) {
                const flyingKickCooldownTextPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height - 140);
                this.gameEngine.ctx.fillStyle = "purple";
                this.gameEngine.ctx.strokeStyle = "black";
                this.gameEngine.ctx.lineWidth = 2;
                this.gameEngine.ctx.font = "12px Arial";
                this.gameEngine.ctx.textAlign = "center";
                
                const flyingKickCooldownRemaining = this.flyingKickCooldown - timeSinceLastFlyingKick;
                const flyingKickCooldownText = `FLYING KICK COOLDOWN: ${flyingKickCooldownRemaining.toFixed(1)}s`;
                
                this.gameEngine.ctx.strokeText(flyingKickCooldownText, flyingKickCooldownTextPos.x, flyingKickCooldownTextPos.y);
                this.gameEngine.ctx.fillText(flyingKickCooldownText, flyingKickCooldownTextPos.x, flyingKickCooldownTextPos.y);
            }
            
            // Draw punch bounding box if it exists
            if (this.punchBoundingBox) {
                const punchBoxScreenPos = this.gameEngine.camera.worldToScreen(this.punchBoundingBox.x, this.punchBoundingBox.y);
                this.gameEngine.ctx.strokeStyle = "orange";
                this.gameEngine.ctx.lineWidth = 3;
                this.gameEngine.ctx.strokeRect(punchBoxScreenPos.x, punchBoxScreenPos.y, this.punchBoundingBox.width, this.punchBoundingBox.height);
            }
            
            // Draw flying kick bounding box if it exists
            if (this.flyingKickBoundingBox) {
                const kickBoxScreenPos = this.gameEngine.camera.worldToScreen(this.flyingKickBoundingBox.x, this.flyingKickBoundingBox.y);
                this.gameEngine.ctx.strokeStyle = "purple";
                this.gameEngine.ctx.lineWidth = 4;
                this.gameEngine.ctx.strokeRect(kickBoxScreenPos.x, kickBoxScreenPos.y, this.flyingKickBoundingBox.width, this.flyingKickBoundingBox.height);
            }
            
            // Draw friction/velocity debug info
            const velocityTextPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height - 160);
            this.gameEngine.ctx.fillStyle = "cyan";
            this.gameEngine.ctx.strokeStyle = "black";
            this.gameEngine.ctx.lineWidth = 2;
            this.gameEngine.ctx.font = "12px Arial";
            this.gameEngine.ctx.textAlign = "center";
            
            const velocityInfo = [
                `H-Vel: ${this.horizontalVelocity.toFixed(2)}`,
                `V-Vel: ${this.velocity.toFixed(2)}`,
                `Max Speed: ${this.maxSpeed}`,
                `Accel: ${this.acceleration}`,
                `Friction: ${this.friction}`
            ];
            
            velocityInfo.forEach((info, index) => {
                const textY = velocityTextPos.y + (index * 14);
                this.gameEngine.ctx.strokeText(info, velocityTextPos.x, textY);
                this.gameEngine.ctx.fillText(info, velocityTextPos.x, textY);
            });
        }
        
        // Draw held item above player's head
        if (this.heldItem) {
            this.drawHeldItem();
        }
    }
    
    drawHeldItem() {
        if (!this.heldItem) return;
        
        // Position item above player's head
        const heldItemOffset = {
            x: 0, // Centered horizontally
            y: -this.height - 30 // Above player's head, higher to avoid overlap
        };
        
        // Update held item position to follow player
        this.heldItem.x = this.x + heldItemOffset.x;
        this.heldItem.y = this.y + heldItemOffset.y;
        
        // Draw the held item (force it to show even though it's held)
        this.heldItem.draw(true);
    }

    updateBoundingBox() {
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
    }

    drawHealthDisplay() {
        // Calculate position above player's head
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
    
    // Method to handle taking damage from MrMan
    takeDamage(attackingMrMan = null) {
        // Check if player is invulnerable
        if (this.isInvulnerable) {
            return;
        }
        
        // Play hurt sound
        this.gameEngine.audioManager.play("./assets/sounds/hurt-sound.mp3", {
            volume: 0.6,
            startTime: 4.4,
            endTime: 4.7,
        });
        
        this.currentHealth--;
        
        // Set invulnerability after taking damage
        this.isInvulnerable = true;
        this.invulnerabilityTimer = 0;
        
        // Trigger hurt state with knockback
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
        const knockbackPower = 20; // Horizontal knockback strength (increased from 6)
        const upwardPower = 10; // Upward launch (increased from 10)
        
        // Use the specific MrMan that hit the player, or find one if not provided
        let mrman = attackingMrMan;
        if (!mrman) {
            // Fallback: find any MrMan (for backward compatibility)
            for (let entity of this.gameEngine.entities) {
                if (entity instanceof MrMan) {
                    mrman = entity;
                    break;
                }
            }
        }
        
        if (mrman) {
            // Knockback away from MrMan based on relative positions
            if (mrman.x > this.x) {
                // MrMan is to the right of player, launch player left
                this.knockbackVelocityX = -knockbackPower;
                this.velocity = -upwardPower;
            } else {
                // MrMan is to the left of player, launch player right
                this.knockbackVelocityX = knockbackPower;
                this.velocity = -upwardPower;
            }
        } else {
            // Default knockback if MrMan not found - launch in current direction
            this.knockbackVelocityX = this.direction === "right" ? knockbackPower : -knockbackPower;
            this.velocity = -upwardPower;
        }
        
        // Clear any existing knockback Y velocity
        this.knockbackVelocityY = 0;
        
        // Check if player is dead
        if (this.currentHealth <= 0) {
            console.log("Player defeated! Game Over.");
            this.removeFromWorld = true;
        }
    }
}