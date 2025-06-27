class MrMan {
    constructor(gameEngine, sceneManager, x, y) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.x = x;
        this.y = y;

        // Use consistent scaling based on game scale
        const characterScale = getCharacterScale();
        this.width = 10 * characterScale; // Scaled width
        this.height = 10 * characterScale; // Scaled height
        
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
        // Follow behavior properties
        this.followDistance = 100; // Distance to maintain from player
        this.moveSpeed = 4; // Consistent movement speed for all states
        this.direction = "right"; // Track which direction MrMan is facing
        
        // Wandering behavior properties
        this.isWandering = true; // Track if MrMan is wandering
        this.isIdle = false; // Track if MrMan is idle
        this.wanderDirection = "right"; // Direction for wandering
        this.wanderTimer = 0; // Timer for wandering/idle
        this.wanderDuration = 0; // How long to wander in current direction
        this.idleDuration = 0; // How long to idle
        this.wanderMinTime = 3; // Minimum time to idle between wanders (seconds)
        this.wanderMaxTime = 8; // Maximum time to idle between wanders (seconds)
        this.wanderDistance = grid(2); // Distance to wander (2 tiles)
        this.startWanderX = 0; // Starting X position for current wander
        this.detectionRange = 400; // Range at which MrMan detects player and starts following
        
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
        this.jumpStrength = 15; // Slightly less than player's 17
        this.groundLevel = 415;
        this.isJumping = false;
        
        // Jump decision making
        this.jumpCooldown = 1.0; // Time between jumps - reduced for more responsive jumping
        this.lastJumpTime = 0;
        this.obstacleCheckDistance = 60; // Distance ahead to check for obstacles
        
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
        
        // Pathfinding properties
        this.currentPath = null; // Array of waypoints to follow
        this.currentWaypointIndex = 0; // Index of current waypoint
        this.pathfindingCooldown = 0.5; // How often to recalculate path (seconds) - increased for performance
        this.lastPathfindTime = 0; // When path was last calculated
        this.waypointReachedDistance = 20; // Distance to consider waypoint reached (pixels)
        this.entityType = "ground"; // Type for pathfinding algorithm
        this.entitySize = {width: this.width, height: this.height}; // Size for pathfinding
        this.usePathfinding = true; // Toggle for pathfinding vs simple follow
        
        // Pathfinding optimization
        this.lastPlayerPosition = {x: 0, y: 0}; // Track player position for change detection
        this.playerMovementThreshold = 64; // Only recalculate if player moved this much (pixels)
        this.maxPathfindingDistance = 400; // Don't pathfind if player is too far away
        
        // Stuck detection and recovery
        this.lastPosition = {x: this.x, y: this.y}; // Track last position
        this.stuckTimer = 0; // How long we've been stuck
        this.stuckThreshold = 3.0; // Time before considering stuck (increased to prevent false positives)
        this.isStuck = false; // Whether we're currently stuck
        this.stuckRecoveryMode = false; // Whether we're in recovery mode
        this.stuckRecoveryTimer = 0; // Timer for recovery actions
        this.lastStuckCheck = 0; // Performance: throttle stuck detection
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
                this.updatePathfinding(player);
                const pathMovement = this.getPathfindingMovement();
                deltaX = pathMovement * this.gameEngine.clockTick * 60;
                
                // Check if MrMan should jump during recovery
                this.checkForJumping(pathMovement);
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
                        // Follow the player using pathfinding
                        this.updatePathfinding(player);
                        
                        // Check for stuck condition and handle recovery
                        this.updateStuckDetection();
                        
                        let pathMovement;
                        if (this.stuckRecoveryMode) {
                            pathMovement = this.getStuckRecoveryMovement(player);
                        } else {
                            pathMovement = this.getPathfindingMovement();
                        }
                        
                        deltaX = pathMovement * this.gameEngine.clockTick * 60;
                        
                        // Check if MrMan should jump based on pathfinding
                        this.checkForJumping(pathMovement);
                    }
                } else {
                    // Player out of range - wander around or idle
                    // OPTIMIZATION: Clear pathfinding when no player
                    if (this.currentPath) {
                        this.currentPath = null;
                    }
                    
                    if (!this.isWandering && !this.isIdle) {
                        this.startWandering();
                    } else if (this.isWandering) {
                        // Continue wandering
                        const frameSpeed = this.moveSpeed * this.gameEngine.clockTick * 60;
                        
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
                // OPTIMIZATION: Clear pathfinding when no player
                if (this.currentPath) {
                    this.currentPath = null;
                }
                
                if (!this.isWandering && !this.isIdle) {
                    this.startWandering();
                } else if (this.isWandering) {
                    // Continue wandering
                    const frameSpeed = this.moveSpeed * this.gameEngine.clockTick * 60;
                    
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
        
        // Check for landing (same logic as Player)
        if (this.isJumping && this.velocity > 0 && this.y === oldY) {
            this.isJumping = false;
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
    
    /**
     * Update pathfinding to follow the player
     * @param {Object} player Player entity to follow
     */
    updatePathfinding(player) {
        if (!this.usePathfinding || !player) {
            return; // Pathfinding disabled or no player
        }
        
        // Get current time at the beginning of the method
        const currentTime = this.gameEngine.timer.gameTime;
        
        // OPTIMIZATION: Only pathfind when actively following player
        // Don't pathfind when wandering, idle, attacking, hurt, or recovering
        if (this.isWandering || this.isIdle || this.isAttacking || this.isHurt || this.isRecovering) {
            return;
        }
        
        // OPTIMIZATION: Check distance to player - don't pathfind if too far
        const distanceToPlayer = Math.abs(player.x - this.x) + Math.abs(player.y - this.y); // Manhattan distance for speed
        if (distanceToPlayer > this.maxPathfindingDistance) {
            // Clear path if player is too far - saves memory
            this.currentPath = null;
            return;
        }
        
        // PERFORMANCE: Don't pathfind if stuck and not in recovery mode
        // This prevents expensive repeated pathfinding attempts when clearly stuck
        if (this.isStuck && !this.stuckRecoveryMode) {
            return;
        }
        
        // OPTIMIZATION: Check if level manager exists and map is loaded (reduced frequency)
        const levelManager = this.gameEngine.entities.find(entity => entity instanceof LevelManager);
        if (!levelManager || !levelManager.isMapLoaded) {
            return; // Wait for level to load
        }
        
        // Debug validation: Check if blocks are properly loaded (throttled)
        if (params.debug && currentTime - this.lastPathfindTime > 5.0) { // Only check every 5+ seconds
            const totalBlocks = this.gameEngine.entities.filter(entity => entity instanceof Block).length;
            if (totalBlocks === 0) {
                console.warn("MrMan pathfinding: No blocks found in game engine!");
                return;
            }
        }
        
        // OPTIMIZATION: Check pathfinding cooldown
        if (currentTime - this.lastPathfindTime < this.pathfindingCooldown) {
            return; // Still using current path
        }
        
        // OPTIMIZATION: Only recalculate if player moved significantly
        const playerMovement = Math.abs(player.x - this.lastPlayerPosition.x) + Math.abs(player.y - this.lastPlayerPosition.y);
        if (this.currentPath && playerMovement < this.playerMovementThreshold) {
            return; // Player hasn't moved enough to warrant recalculation
        }
        
        // Calculate new path from MrMan to player
        const start = {x: this.x, y: this.y};
        const goal = {x: player.x, y: player.y};
        
        const newPath = this.gameEngine.aStar.findPath(start, goal, this.entityType, this.entitySize);
        
        if (newPath && newPath.length > 1) {
            this.currentPath = newPath;
            this.currentWaypointIndex = 1; // Skip first waypoint (current position)
            this.lastPathfindTime = currentTime;
            this.lastPlayerPosition.x = player.x;
            this.lastPlayerPosition.y = player.y;
        } else if (!this.currentPath) {
            // No path found and no current path - fallback to simple following
            this.currentPath = [start, goal];
            this.currentWaypointIndex = 1;
            this.lastPathfindTime = currentTime;
            this.lastPlayerPosition.x = player.x;
            this.lastPlayerPosition.y = player.y;
        }
    }
    
        /**
     * Get movement direction based on current pathfinding
     * @returns {Number} Movement speed in pixels per frame (-followSpeed to +followSpeed)
     */
    getPathfindingMovement() {
        if (!this.currentPath || this.currentWaypointIndex >= this.currentPath.length) {
            return 0; // No path or reached end
        }
        
        const currentWaypoint = this.currentPath[this.currentWaypointIndex];
        const horizontalDistance = currentWaypoint.x - this.x;
        const verticalDistance = currentWaypoint.y - this.y;
        
        // Use tighter tolerances to prevent corner cutting
        const horizontalReachDistance = 20; // Slightly increased for better tolerance
        const verticalReachDistance = 25;   // Increased for better vertical tolerance
        
        // Check if we've reached the current waypoint
        const reachedHorizontally = Math.abs(horizontalDistance) <= horizontalReachDistance;
        const reachedVertically = Math.abs(verticalDistance) <= verticalReachDistance;
        
        if (reachedHorizontally && reachedVertically) {
            this.currentWaypointIndex++;
            
            // If there are more waypoints, move to the next one
            if (this.currentWaypointIndex < this.currentPath.length) {
                return this.getPathfindingMovement(); // Recursive call for next waypoint
            } else {
                return 0; // Reached final waypoint
            }
        }
        
        // IMPROVED LOGIC: Handle corner cutting scenarios better
        // If we're close horizontally but need to move vertically (falling/jumping scenarios)
        if (reachedHorizontally && !reachedVertically) {
            // Check if we need to fall (waypoint is below us)
            if (verticalDistance > 0) {
                // Waypoint is below us - we might need to fall or move forward to fall
                // Check if there's ground below the waypoint position
                let checkX = this.x;
                if (Math.abs(horizontalDistance) > 5) {
                    // Still some horizontal distance - prioritize horizontal movement
                    if (horizontalDistance > 0) {
                        this.direction = "right";
                        return this.moveSpeed;
                    } else {
                        this.direction = "left";
                        return -this.moveSpeed;
                    }
                }
                // If we're horizontally aligned, gravity will handle the vertical movement
                return 0;
            } else {
                // Waypoint is above us - we need to jump, but this should be handled by jump logic
                return 0;
            }
        }
        
        // Standard horizontal movement with obstacle checking
        if (Math.abs(horizontalDistance) > 5) {
            // Check if there's an obstacle directly in front before moving
            const direction = horizontalDistance > 0 ? 1 : -1;
            const checkX = this.x + (direction * getTilePixelSize() * 0.5);
            const checkY = this.y;
            
            // If there's an obstacle ahead, check if we can move around it
            if (!this.gameEngine.collisionManager.isPositionFree(checkX, checkY, this.width, this.height)) {
                // Try to continue horizontal movement for a bit to see if we can get unstuck
                // This helps with corner cutting where MrMan gets slightly stuck on edges
                const smallerCheckX = this.x + (direction * getTilePixelSize() * 0.25);
                if (this.gameEngine.collisionManager.isPositionFree(smallerCheckX, checkY, this.width, this.height)) {
                    // Can move a little bit, so continue
                    if (horizontalDistance > 0) {
                        this.direction = "right";
                        return this.moveSpeed * 0.5; // Move slower when near obstacles
                    } else {
                        this.direction = "left";
                        return -this.moveSpeed * 0.5;
                    }
                }
                return 0; // Completely blocked, let jumping logic handle it
            }
            
            if (horizontalDistance > 0) {
                this.direction = "right";
                return this.moveSpeed;
            } else {
                this.direction = "left";
                return -this.moveSpeed;
            }
        }
        
        return 0;
    }
    
    /**
     * Check if MrMan should jump based on pathfinding and obstacles
     * @param {Number} pathMovement Horizontal movement from pathfinding
     */
    checkForJumping(pathMovement) {
        // Don't jump if already jumping, hurt, or attacking
        if (this.isJumping || this.isHurt || this.isAttacking) {
            return;
        }
        
        const currentTime = this.gameEngine.timer.gameTime;
        
        // Check jump cooldown
        if (currentTime - this.lastJumpTime < this.jumpCooldown) {
            return;
        }
        
        // Check for jumping even when not moving (if pathfinding suggests it)
        const shouldJumpForPath = this.shouldJumpForPath();
        const shouldJumpForObstacle = Math.abs(pathMovement) >= 1 && this.shouldJumpForObstacle(pathMovement);
        
        // If pathfinding suggests jumping and we're not moving horizontally due to obstacle
        if (shouldJumpForPath && Math.abs(pathMovement) < 1) {
            this.performJump();
            return;
        }
        
        // Check if there's an obstacle ahead that requires jumping
        if (shouldJumpForObstacle) {
            this.performJump();
        }
    }
    
    /**
     * Check if there's an obstacle ahead that requires jumping
     * @param {Number} pathMovement Direction of movement
     * @returns {Boolean} True if should jump
     */
    shouldJumpForObstacle(pathMovement) {
        const direction = pathMovement > 0 ? 1 : -1;
        const tileSize = getTilePixelSize();
        
        // Check one tile ahead for obstacles
        const checkX = this.x + (direction * tileSize);
        const checkY = this.y;
        
        // Check if there's a solid block ahead at current level
        if (!this.gameEngine.collisionManager.isPositionFree(checkX, checkY, this.width, this.height)) {
            // There's an obstacle, check if jumping would clear it
            const jumpCheckY = this.y - (tileSize * 1.5); // Check 1.5 tiles up
            if (this.gameEngine.collisionManager.isPositionFree(checkX, jumpCheckY, this.width, this.height)) {
                return true; // Jump would clear the obstacle
            }
        }
        
        // Also check if there's a gap ahead that we need to jump over
        const checkGroundX = this.x + (direction * tileSize);
        const checkGroundY = this.y + tileSize; // Check for ground below next position
        
        if (this.gameEngine.collisionManager.isPositionFree(checkGroundX, checkGroundY, this.width, this.height)) {
            // There's no ground ahead, might need to jump across a gap
            // Check if there's a platform to land on within jump distance
            for (let jumpDist = 2; jumpDist <= 4; jumpDist++) {
                const landingX = this.x + (direction * tileSize * jumpDist);
                const landingY = this.y;
                
                if (!this.gameEngine.collisionManager.isPositionFree(landingX, landingY + tileSize, this.width, this.height)) {
                    // Found a landing spot
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Check if pathfinding suggests a jump (next waypoint is significantly higher)
     * @returns {Boolean} True if should jump
     */
    shouldJumpForPath() {
        if (!this.currentPath || this.currentWaypointIndex >= this.currentPath.length) {
            return false;
        }
        
        const currentWaypoint = this.currentPath[this.currentWaypointIndex];
        const heightDifference = this.y - currentWaypoint.y;
        const horizontalDistance = Math.abs(currentWaypoint.x - this.x);
        
        // If next waypoint is significantly higher and we're close horizontally
        const jumpThreshold = getTilePixelSize() * 0.5; // 50% of a tile
        const horizontalThreshold = getTilePixelSize() * 2; // Within 2 tiles horizontally
        
        return heightDifference > jumpThreshold && horizontalDistance <= horizontalThreshold;
    }
    
    /**
     * Perform the jump action
     */
    performJump() {
        this.velocity = -this.jumpStrength;
        this.isJumping = true;
        this.lastJumpTime = this.gameEngine.timer.gameTime;
        
        // Play jump sound (same as player)
        this.gameEngine.audioManager.play("./assets/sounds/roblox-classic-jump.mp3", {
            volume: 0.8, // Slightly quieter than player
            playbackRate: 2.0,
        });
        
        console.log("MrMan jumped!");
    }
    
    draw() {
        // Apply camera offset to drawing position
        const screenPos = this.gameEngine.camera.worldToScreen(this.x, this.y - this.height);

        const aniOffsetx = -14;
        const aniOffsety = 18;
        
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
        } else if (this.isJumping) {
            // Show jump animation when jumping
            if (this.direction === "left") {
                currentAnimation = this.jumpLeftAnimation;
            } else {
                currentAnimation = this.jumpRightAnimation;
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
            
            // Draw pathfinding visualization
            if (this.currentPath && this.currentPath.length > 1) {
                this.gameEngine.ctx.strokeStyle = "rgba(255, 255, 0, 0.8)"; // Yellow path
                this.gameEngine.ctx.lineWidth = 3;
                this.gameEngine.ctx.setLineDash([5, 5]);
                this.gameEngine.ctx.beginPath();
                
                // Draw path as connected lines
                for (let i = 0; i < this.currentPath.length - 1; i++) {
                    const currentWaypoint = this.currentPath[i];
                    const nextWaypoint = this.currentPath[i + 1];
                    
                    const currentScreenPos = this.gameEngine.camera.worldToScreen(currentWaypoint.x, currentWaypoint.y);
                    const nextScreenPos = this.gameEngine.camera.worldToScreen(nextWaypoint.x, nextWaypoint.y);
                    
                    if (i === 0) {
                        this.gameEngine.ctx.moveTo(currentScreenPos.x, currentScreenPos.y);
                    }
                    this.gameEngine.ctx.lineTo(nextScreenPos.x, nextScreenPos.y);
                }
                this.gameEngine.ctx.stroke();
                this.gameEngine.ctx.setLineDash([]);
                
                // Draw waypoints as circles - simplified for performance
                for (let i = 0; i < this.currentPath.length; i++) {
                    const waypoint = this.currentPath[i];
                    const waypointScreenPos = this.gameEngine.camera.worldToScreen(waypoint.x, waypoint.y);
                    
                    // Color waypoints based on current target (simpler check)
                    if (i === this.currentWaypointIndex) {
                        this.gameEngine.ctx.fillStyle = "rgba(255, 0, 0, 0.8)"; // Red for current target
                    } else {
                        this.gameEngine.ctx.fillStyle = "rgba(255, 255, 0, 0.6)"; // Yellow for normal waypoints
                    }
                    
                    this.gameEngine.ctx.beginPath();
                    this.gameEngine.ctx.arc(waypointScreenPos.x, waypointScreenPos.y, 5, 0, 2 * Math.PI);
                    this.gameEngine.ctx.fill();
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
            const currentTime = this.gameEngine.timer.gameTime;
            const timeSinceLastJump = currentTime - this.lastJumpTime;
            
            const debugInfo = [
                `Dir: ${this.direction}`,
                `Vel: ${this.velocity.toFixed(2)}`,
                `Hurt: ${this.isHurt}`,
                `Recover: ${this.isRecovering}`,
                `Attack: ${this.isAttacking}`,
                `Jump: ${this.isJumping}`,
                `Wander: ${this.isWandering}`,
                `Idle: ${this.isIdle}`,
                `Stuck: ${this.isStuck} (${this.stuckTimer.toFixed(1)}s)`,
                `Recovery: ${this.stuckRecoveryMode}`,
                `Health: ${this.currentHealth}/${this.maxHealth}`,
                `Pos: (${Math.round(this.x)}, ${Math.round(this.y)})`,
                `Timer: ${this.isHurt ? this.hurtTimer.toFixed(2) : this.attackTimer.toFixed(2)}`,
                `Path: ${this.currentPath ? this.currentPath.length : 'None'}`,
                `Waypoint: ${this.currentWaypointIndex}/${this.currentPath ? this.currentPath.length : 0}`,
                `Jump CD: ${timeSinceLastJump < this.jumpCooldown ? (this.jumpCooldown - timeSinceLastJump).toFixed(1) : 'Ready'}`
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
    
    /**
     * Update stuck detection system (throttled for performance)
     */
    updateStuckDetection() {
        const currentTime = this.gameEngine.timer.gameTime;
        
        // PERFORMANCE: Only check stuck detection every 0.5 seconds
        if (currentTime - this.lastStuckCheck < 0.5) {
            return;
        }
        this.lastStuckCheck = currentTime;
        
        const distanceMoved = Math.abs(this.x - this.lastPosition.x) + Math.abs(this.y - this.lastPosition.y);
        
        // If we haven't moved much, increment stuck timer
        if (distanceMoved < 10) { // Increased threshold to 10 pixels to be less sensitive
            this.stuckTimer += 0.5; // Add the check interval
            
            if (this.stuckTimer >= this.stuckThreshold && !this.isStuck) {
                this.isStuck = true;
                this.stuckRecoveryMode = true;
                this.stuckRecoveryTimer = 0;
                console.log("MrMan is stuck! Entering recovery mode.");
                
                // Clear current path to force recalculation
                this.currentPath = null;
                
                // PERFORMANCE: Increase pathfinding cooldown when stuck to prevent spam
                this.pathfindingCooldown = 2.0; // Increase to 2 seconds when stuck
            }
        } else {
            // We're moving, reset stuck detection
            this.stuckTimer = 0;
            if (this.isStuck) {
                this.isStuck = false;
                this.stuckRecoveryMode = false;
                this.stuckRecoveryTimer = 0;
                this.pathfindingCooldown = 0.5; // Reset to normal cooldown
                console.log("MrMan is no longer stuck.");
            }
        }
        
        // Update last position
        this.lastPosition.x = this.x;
        this.lastPosition.y = this.y;
        
        // Recovery mode timeout
        if (this.stuckRecoveryMode) {
            this.stuckRecoveryTimer += 0.5; // Add the check interval
            if (this.stuckRecoveryTimer >= 5.0) { // Increased timeout to 5 seconds
                this.stuckRecoveryMode = false;
                this.stuckRecoveryTimer = 0;
                this.isStuck = false;
                this.pathfindingCooldown = 0.5; // Reset to normal cooldown
                console.log("MrMan recovery mode timeout.");
            }
        }
    }
    
    /**
     * Get movement when in stuck recovery mode (simpler, more direct approach)
     * @param {Object} player Player entity
     * @returns {Number} Movement speed
     */
    getStuckRecoveryMovement(player) {
        if (!player) return 0;
        
        // Simple direct movement towards player (ignore pathfinding)
        const horizontalDistance = player.x - this.x;
        
        // Try to move directly towards player
        if (Math.abs(horizontalDistance) > 10) {
            const direction = horizontalDistance > 0 ? 1 : -1;
            const checkX = this.x + (direction * getTilePixelSize() * 0.3);
            const checkY = this.y;
            
            // If path is clear, move towards player
            if (this.gameEngine.collisionManager.isPositionFree(checkX, checkY, this.width, this.height)) {
                if (horizontalDistance > 0) {
                    this.direction = "right";
                    return this.moveSpeed * 0.7; // Slightly slower in recovery mode
                } else {
                    this.direction = "left";
                    return -this.moveSpeed * 0.7;
                }
            } else {
                // If blocked, try jumping
                const currentTime = this.gameEngine.timer.gameTime;
                if (currentTime - this.lastJumpTime >= this.jumpCooldown) {
                    this.performJump();
                }
                return 0;
            }
        }
        
        return 0;
    }
}