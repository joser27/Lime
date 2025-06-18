class PlayingScene {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.jobApplications = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // Reduced from 3000 to 2000 - faster spawns
        this.minSpawnInterval = 1500; // Reduced from 2000 to 1500
        this.maxSpawnInterval = 3000; // Reduced from 4000 to 3000
        this.minDistanceBetweenApps = 400; // Minimum distance between job applications
        
        // Timer and speed management
        this.gameTime = 0;
        this.baseSpeed = 8; // Increased from 5 to 8 - faster base speed
        this.speedIncreaseInterval = 5; // Reduced from 10 to 5 - speed increases more frequently
        this.speedIncreaseAmount = 1.5; // Increased from 1 to 1.5 - bigger speed jumps
        this.maxSpeed = 20; // Increased from 15 to 20 - higher max speed
        this.scoreSpeedMultiplier = 0.5; // Speed increase per dodge
        
        // Score tracking
        this.score = 0;
        
        this.initEntities();
    }

    initEntities() {
        // Add level manager first
        this.levelManager = new LevelManager(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.levelManager);
        
        // Add player second
        this.player = new Player(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.player);

        // Add background last (will be drawn first)
        this.background = new Background(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.background);
    }

    spawnJobApplication() {
        const canvas = this.gameEngine.ctx.canvas;
        const groundLevel = this.player.groundLevel + 50;
        const x = canvas.width;
        const y = groundLevel - 28 * params.scale;
        
        // Calculate current speed based on both game time and score
        const timeMultiplier = Math.floor(this.gameTime / this.speedIncreaseInterval);
        const scoreMultiplier = this.score * this.scoreSpeedMultiplier;
        const currentSpeed = Math.min(
            this.baseSpeed + (timeMultiplier * this.speedIncreaseAmount) + scoreMultiplier,
            this.maxSpeed
        );
        
        // Check if there's enough space between this and the last job application
        let canSpawn = true;
        this.gameEngine.entities.forEach(entity => {
            if (entity instanceof JobApplication) {
                const distance = x - entity.x;
                if (distance < this.minDistanceBetweenApps) {
                    canSpawn = false;
                }
            }
        });

        if (canSpawn) {
            const jobApp = new JobApplication(this.gameEngine, this.sceneManager, x, y, currentSpeed, "horizontal");
            this.gameEngine.entities.unshift(jobApp);
            
            // Spawn interval also decreases with score to make it more challenging
            const scoreIntervalReduction = Math.min(this.score * 50, 500); // Reduce interval by up to 500ms based on score
            const adjustedMinInterval = Math.max(this.minSpawnInterval - scoreIntervalReduction, 800); // Don't go below 800ms
            const adjustedMaxInterval = Math.max(this.maxSpawnInterval - scoreIntervalReduction, 1500); // Don't go below 1500ms
            
            this.spawnInterval = Math.random() * (adjustedMaxInterval - adjustedMinInterval) + adjustedMinInterval;
            this.spawnTimer = 0;
        } else {
            this.spawnTimer = this.spawnInterval - 500;
        }
    }

    spawnChildSupport() {
        const canvas = this.gameEngine.ctx.canvas;
        const x = Math.random() * (canvas.width - 306); // Random x position, accounting for child support width
        const y = -408 * 0.5; // Start above the screen
        
        // Calculate current speed based on both game time and score
        const timeMultiplier = Math.floor(this.gameTime / this.speedIncreaseInterval);
        const scoreMultiplier = this.score * this.scoreSpeedMultiplier;
        const currentSpeed = Math.min(
            this.baseSpeed + (timeMultiplier * this.speedIncreaseAmount) + scoreMultiplier,
            this.maxSpeed
        );
        
        // Check if there's enough space between this and other vertical child support
        let canSpawn = true;
        this.gameEngine.entities.forEach(entity => {
            if (entity instanceof ChildSupport) {
                const horizontalDistance = Math.abs(x - entity.x);
                if (horizontalDistance < 350) { // Minimum horizontal distance between vertical child support
                    canSpawn = false;
                }
            }
        });

        if (canSpawn) {
            const childSupport = new ChildSupport(this.gameEngine, this.sceneManager, x, y, currentSpeed, "vertical");
            this.gameEngine.entities.unshift(childSupport);
        }
    }

    draw() {
        // Draw timer and score at the top of the screen (after everything else)
        const ctx = this.gameEngine.ctx;
        ctx.save();
        
        // Draw a larger, more visible background for the timer and score
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        const timerWidth = 400;
        const timerHeight = 50;
        const timerX = ctx.canvas.width / 2 - timerWidth / 2;
        const timerY = 20;
        ctx.fillRect(timerX, timerY, timerWidth, timerHeight);
        
        // Add a subtle border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(timerX, timerY, timerWidth, timerHeight);
        
        // Draw timer text
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Format time as MM:SS
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Draw the time with a slight shadow for better visibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw timer label and value
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px Arial";
        ctx.fillText("TIME", ctx.canvas.width / 2 - 120, timerY + 15);
        ctx.font = "bold 28px Arial";
        ctx.fillText(timeString, ctx.canvas.width / 2 - 120, timerY + 35);
        
        // Draw first vertical separator
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.moveTo(ctx.canvas.width / 2 - 40, timerY + 10);
        ctx.lineTo(ctx.canvas.width / 2 - 40, timerY + timerHeight - 10);
        ctx.stroke();
        
        // Draw score label and value
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px Arial";
        ctx.fillText("SCORE", ctx.canvas.width / 2, timerY + 15);
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#00FF00"; // Green color for score
        ctx.fillText(this.score.toString().padStart(3, '0'), ctx.canvas.width / 2, timerY + 35);
        
        // Draw second vertical separator
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.moveTo(ctx.canvas.width / 2 + 40, timerY + 10);
        ctx.lineTo(ctx.canvas.width / 2 + 40, timerY + timerHeight - 10);
        ctx.stroke();
        
        // Draw lives
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px Arial";
        ctx.fillText("LIVES", ctx.canvas.width / 2 + 120, timerY + 15);
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#FF4444"; // Red color for lives
        ctx.fillText("♥".repeat(this.player.lives), ctx.canvas.width / 2 + 120, timerY + 35);

        // Draw debug collision info if debug mode is on
        if (params.debug) {
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.textAlign = "left";
            ctx.fillText(`Player BB: (${Math.round(this.player.boundingBox.x)}, ${Math.round(this.player.boundingBox.y)})`, 10, 100);
            this.gameEngine.entities.forEach(entity => {
                if (entity instanceof JobApplication) {
                    ctx.fillText(`JobApp BB: (${Math.round(entity.boundingBox.x)}, ${Math.round(entity.boundingBox.y)})`, 10, 120);
                }
            });
        }
        
        ctx.restore();
    }

    update() {
        // Update game timer
        this.gameTime += this.gameEngine.clockTick;
        
        // Update spawn timer
        this.spawnTimer += this.gameEngine.clockTick * 1000;
        if (this.spawnTimer >= this.spawnInterval) {
            // Only spawn job applications horizontally
            this.spawnJobApplication();
        }

        // Spawn child support from the top based on time and score
        const childSupportSpawnChance = 0.005 + (this.gameTime * 0.0005) + (this.score * 0.002); // Increases with time and score
        if (this.score > 0 && Math.random() < childSupportSpawnChance) {
            this.spawnChildSupport();
        }

        // Check for collisions and update score
        let collisionDetected = false;
        this.gameEngine.entities.forEach(entity => {
            if (entity instanceof JobApplication || entity instanceof ChildSupport) {
                // Debug bounding box positions
                if (params.debug) {
                    console.log("Player BB:", {
                        x: this.player.boundingBox.x,
                        y: this.player.boundingBox.y,
                        width: this.player.boundingBox.width,
                        height: this.player.boundingBox.height,
                        right: this.player.boundingBox.right,
                        bottom: this.player.boundingBox.bottom
                    });
                    console.log("Obstacle BB:", {
                        x: entity.boundingBox.x,
                        y: entity.boundingBox.y,
                        width: entity.boundingBox.width,
                        height: entity.boundingBox.height,
                        right: entity.boundingBox.right,
                        bottom: entity.boundingBox.bottom
                    });
                }

                // Check for collision
                if (this.player.boundingBox.collide(entity.boundingBox)) {
                    collisionDetected = true;
                    console.log("COLLISION DETECTED!");
                    // Player takes damage
                    if (this.player.takeDamage()) {
                        console.log("Player took damage! Lives remaining:", this.player.lives);
                        // If player has no lives left, game over
                        if (this.player.lives <= 0) {
                            console.log("Game Over - No lives remaining!");
                            this.sceneManager.changeScene("GameOverScene");
                        }
                    }
                } else if (entity.hasBeenPassed && !entity.scoreCounted) {
                    // Only count points for job applications, not child support
                    if (entity instanceof JobApplication) {
                        this.score++;
                        entity.scoreCounted = true;
                        
                        // Play point earned sound
                        const pointSound = ASSET_MANAGER.getAsset("./assets/sounds/pointearned.mp3");
                        if (pointSound) {
                            pointSound.volume = 0.5;
                            pointSound.currentTime = 0; // Reset to beginning
                            pointSound.play().catch(e => console.log("Could not play point sound:", e));
                        }
                    } else {
                        // Mark child support as counted but don't give points
                        entity.scoreCounted = true;
                    }
                }
            }
        });

        if (this.gameEngine.keys["Escape"]) {
            this.sceneManager.changeScene("MenuScene");
        }
        if (this.gameEngine.consumeKey("f")) {
            params.debug = !params.debug;
            console.log("Debug mode:", params.debug ? "ON" : "OFF");
        }
    }
}