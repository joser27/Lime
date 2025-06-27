class PlayingScene {
    constructor(gameEngine, sceneManager, existingGameState = null) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        
        // Use existing game state or create new one
        this.gameState = existingGameState || new GameState();
        
        // Game over overlay state
        this.gameOverButtons = [];
        this.hoveredButton = null;
        this.buttonWidth = 200;
        this.buttonHeight = 50;
        
        this.initGame();
    }

    initGame() {
        // Clear any existing entities and reset game engine state
        this.cleanupGame();
        
        // Initialize entities
        this.initEntities();
        this.setupGameOverButtons();
        
        console.log(`Starting game - Level: ${this.gameState.level}, Lives: ${this.gameState.lives}, Score: ${this.gameState.score}`);
    }

    cleanupGame() {
        console.log("Cleaning up game state...");
        
        // Store reference to this scene to preserve it
        const currentScene = this;
        
        // Clear all entities except this scene
        this.gameEngine.entities = this.gameEngine.entities.filter(entity => entity === currentScene);
        
        // Reset camera completely
        this.gameEngine.camera.x = 0;
        this.gameEngine.camera.y = 0;
        this.gameEngine.camera.target = null;
        
        // Clear game engine input state
        this.gameEngine.click = null;
        this.gameEngine.mouse = null;
        this.gameEngine.wheel = null;
        this.gameEngine.rightclick = null;
        
        // Reset key states
        this.gameEngine.keys = {};
        this.gameEngine.consumedKeys = {};
        
        // Reset timer to fix clockTick issues
        if (this.gameEngine.timer) {
            this.gameEngine.timer.gameTime = 0;
            this.gameEngine.timer.lastTimestamp = Date.now();
        }
        
        // Clear any references
        this.player = null;
        this.mrman = [];
        this.levelManager = null;
        this.background = null;
        this.hoveredButton = null;
        
        console.log("Game state cleaned up successfully - Scene preserved");
    }

    initEntities() {
        // Add level manager first
        this.levelManager = new LevelManager(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.levelManager);
        
        // Load the Tiled map
        this.levelManager.loadTiledMap(
            "./assets/swampmap.tmj",           // Map file
            "./assets/images/SwampTileset.png" // Tileset image
        );
        

        // Add player
        this.player = new Player(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.player);
        
        // Ensure player is fully initialized and vulnerable
        console.log("Player created:", this.player ? "SUCCESS" : "FAILED");
        if (this.player) {
            console.log("Player invulnerable:", this.player.isInvulnerable);
            console.log("Player health:", this.player.currentHealth + "/" + this.player.maxHealth);
            
            // Force player to be vulnerable on restart
            this.player.isInvulnerable = false;
            this.player.invulnerabilityTimer = 0;
        }

        // Add MrMan enemies
        this.mrman = []; // Array to store all MrMans
        for (let i = 0; i <= 1; i++) {
            const mrman = new MrMan(this.gameEngine, this.sceneManager, grid(10 + i * 3), grid(5));
            this.mrman.push(mrman); // Add MrMan to the array   
            this.gameEngine.addEntity(mrman);
        }
        this.mrman2 = new MrMan(this.gameEngine, this.sceneManager, grid(10), grid(19));
        this.gameEngine.addEntity(this.mrman2);
        
        // Add flying enemies to demonstrate flying pathfinding
        // this.flyingEnemies = [];
        // for (let i = 0; i < 1; i++) {
        //     const flyingEnemy = new FlyingEnemy(this.gameEngine, grid(15 + i * 5), grid(3));
        //     this.flyingEnemies.push(flyingEnemy);
        //     this.gameEngine.addEntity(flyingEnemy);
        // }

        // Set the camera to follow the player
        this.gameEngine.camera.setTarget(this.player);

        // Add background last (will be drawn first)
        this.background = new Background(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.background);
    }

    setupGameOverButtons() {
        const canvas = this.gameEngine.ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        this.gameOverButtons = [
            {
                x: centerX - this.buttonWidth / 2,
                y: centerY + 40,
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Play Again",
                color: "#4CAF50",
                hoverColor: "#45a049"
            },
            {
                x: centerX - this.buttonWidth / 2,
                y: centerY + 100,
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Main Menu",
                color: "#2196F3",
                hoverColor: "#1976D2"
            }
        ];
    }

    draw() {
        // Draw game over overlay if player is dead
        if (this.gameState.gameOver) {
            this.drawGameOverOverlay();
        }
    }

    drawGameOverOverlay() {
        const ctx = this.gameEngine.ctx;
        
        // Draw semi-transparent dark overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw note paper image
        const noteImage = ASSET_MANAGER.getAsset("./assets/images/note.png");
        if (noteImage) {
            const noteWidth = 500;
            const noteHeight = 700;
            const noteX = ctx.canvas.width / 2 - noteWidth / 2;
            const noteY = ctx.canvas.height / 2 - noteHeight / 2;
            
            // Draw the note image
            ctx.drawImage(noteImage, noteX, noteY, noteWidth, noteHeight);
            
            // Draw "YOU DIED" title on the note
            ctx.font = "bold 32px Arial";
            ctx.fillStyle = "#8B0000"; // Dark red for contrast on the note
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeText("YOU DIED", ctx.canvas.width / 2, noteY + 200);
            ctx.fillText("YOU DIED", ctx.canvas.width / 2, noteY + 200);

            // Draw stats on the note
            const statsY = noteY + 280;
            ctx.font = "18px Arial";
            ctx.fillStyle = "#2F2F2F"; // Dark gray for readability on note
            ctx.strokeStyle = "white";
            ctx.lineWidth = 0.5;
            
            // Draw stats with slight outline for readability
            const stats = [
                `Score: ${this.gameState.score}`,
                `Time Survived: ${this.gameState.getFormattedTime()}`,
                `Enemies Defeated: ${this.gameState.enemiesDefeated}`
            ];
            
            stats.forEach((stat, index) => {
                const y = statsY + (index * 25);
                ctx.strokeText(stat, ctx.canvas.width / 2, y);
                ctx.fillText(stat, ctx.canvas.width / 2, y);
            });
        } else {
            // Fallback to original box if note image not found
            const boxWidth = 400;
            const boxHeight = 350;
            const boxX = ctx.canvas.width / 2 - boxWidth / 2;
            const boxY = ctx.canvas.height / 2 - boxHeight / 2;

            ctx.fillStyle = "rgba(40, 40, 40, 0.95)";
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
            
            // Title and stats with fallback styling
            ctx.font = "bold 32px Arial";
            ctx.fillStyle = "#FF4444";
            ctx.textAlign = "center";
            ctx.fillText("YOU DIED", ctx.canvas.width / 2, boxY + 60);
            
            ctx.font = "18px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(`Score: ${this.gameState.score}`, ctx.canvas.width / 2, boxY + 120);
            ctx.fillText(`Time Survived: ${this.gameState.getFormattedTime()}`, ctx.canvas.width / 2, boxY + 145);
            ctx.fillText(`Enemies Defeated: ${this.gameState.enemiesDefeated}`, ctx.canvas.width / 2, boxY + 170);
        }

        // Update button positions (in case canvas resized)
        this.setupGameOverButtons();

        // Draw buttons
        this.gameOverButtons.forEach(button => {
            // Draw button background
            ctx.fillStyle = this.hoveredButton === button ? button.hoverColor : button.color;
            ctx.fillRect(button.x, button.y, button.width, button.height);

            // Draw button border
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            // Draw button text
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                button.text, 
                button.x + button.width / 2, 
                button.y + button.height / 2
            );
        });
    }

    update() {
        // Update game state time
        this.gameState.updateGameTime();
        
        // Handle game over overlay interactions
        if (this.gameState.gameOver) {
            this.handleGameOverInput();
            return; // Don't process normal game updates when game over
        }
        
        if (this.gameEngine.keys["Escape"]) {
            this.sceneManager.changeScene("MenuScene");
        }
        if (this.gameEngine.consumeKey("f")) {
            params.debug = !params.debug;
            console.log("Debug mode:", params.debug ? "ON" : "OFF");
        }
        
        // Output collision map with 'o' key
        if (this.gameEngine.consumeKey("o")) {
            this.levelManager.outputCollisionMap();
        }
        
        // Test A* pathfinding with debugging (press 't' key)
        if (this.gameEngine.consumeKey("t")) {
            this.testAStarPathfinding();
        }
        
        // Check if player is dead (removed from world)
        if (this.player && this.player.removeFromWorld) {
            console.log("Game Over - Player defeated!");
            this.gameState.loseLife();
            return;
        }
        
        // Handle player attack interactions
        this.handlePlayerAttacks();
        
        // Handle MrMan attack interactions
        this.handleMrManAttacks();
    }

    handleGameOverInput() {
        // Check if mouse is over any button
        if (this.gameEngine.mouse) {
            this.hoveredButton = this.gameOverButtons.find(button => 
                this.gameEngine.mouse.x >= button.x && 
                this.gameEngine.mouse.x <= button.x + button.width &&
                this.gameEngine.mouse.y >= button.y && 
                this.gameEngine.mouse.y <= button.y + button.height
            );

            // Handle click
            if (this.gameEngine.click) {
                if (this.hoveredButton) {
                    if (this.hoveredButton.text === "Play Again") {
                        this.restartGame();
                    } else if (this.hoveredButton.text === "Main Menu") {
                        this.sceneManager.changeScene("MenuScene");
                    }
                }
                this.gameEngine.click = null; // Reset click
            }
        }
    }

    restartGame() {
        console.log("Restarting game...");
        
        // Reset the game state completely
        this.gameState.reset();
        
        // Reinitialize the entire game
        this.initGame();
        
        console.log("Game restart completed");
    }
    
    testAStarPathfinding() {
        console.log("=== TESTING A* PATHFINDING ===");
        
        // Enable debugging
        this.gameEngine.aStar.setDebugLogging(true);
        this.gameEngine.aStar.setCollisionDebugging(true);
        
        // Get MrMan and Player positions
        const mrman = this.mrman && this.mrman.length > 0 ? this.mrman[0] : null;
        const player = this.player;
        
        if (!mrman || !player) {
            console.log("Cannot test - MrMan or Player not found");
            return;
        }
        
        console.log(`MrMan position: (${mrman.x}, ${mrman.y})`);
        console.log(`Player position: (${player.x}, ${player.y})`);
        console.log(`MrMan entity size: ${mrman.entitySize.width}x${mrman.entitySize.height}`);
        
        // Test pathfinding
        const start = {x: mrman.x, y: mrman.y};
        const goal = {x: player.x, y: player.y};
        
        console.log("Attempting to find path...");
        const path = this.gameEngine.aStar.findPath(start, goal, mrman.entityType, mrman.entitySize);
        
        if (path) {
            console.log(`Path found with ${path.length} waypoints`);
        } else {
            console.log("No path found");
        }
        
        // Disable debugging after test
        this.gameEngine.aStar.setDebugLogging(false);
        this.gameEngine.aStar.setCollisionDebugging(false);
        
        console.log("=== A* TEST COMPLETE ===");
    }
    
    handlePlayerAttacks() {
        // Check punch collisions
        if (this.player.punchBoundingBox) {
            this.checkAttackCollisions(this.player.punchBoundingBox, "punch");
        }
        
        // Check flying kick collisions
        if (this.player.flyingKickBoundingBox) {
            this.checkAttackCollisions(this.player.flyingKickBoundingBox, "flyingkick");
        }
    }
    
    handleMrManAttacks() {
        // Check if MrMan array exists and iterate through each MrMan
        if (this.mrman && this.mrman.length > 0) {
            for (let mrman of this.mrman) {
                // Skip if this MrMan has been removed
                if (mrman.removeFromWorld) continue;
                
                const attackBox = mrman.getAttackBoundingBox();
                if (attackBox) {
                    // Check if MrMan's attack hits the player
                    if (this.gameEngine.collisionManager.checkBoxCollision(attackBox, this.player.boundingBox)) {
                        this.handleMrManAttackOnPlayer(mrman);
                    }
                }
            }
        }
    }
    
    checkAttackCollisions(attackBox, attackType) {
        // Check collision with all entities
        for (let entity of this.gameEngine.entities) {
            // Skip player, entities without bounding boxes, and Block entities
            if (entity === this.player || !entity.boundingBox || entity instanceof Block) continue;
            
            // Check if attack box intersects with entity
            if (this.gameEngine.collisionManager.checkBoxCollision(attackBox, entity.boundingBox)) {
                this.handleAttackHit(entity, attackType);
            }
        }
    }
    
    handleAttackHit(hitEntity, attackType) {
        // Handle different entity types differently
        if (hitEntity instanceof MrMan) {
            this.handlePlayerAttackOnMrMan(hitEntity, attackType);
        } else if (hitEntity instanceof BrokenBrick) {
            this.handlePlayerAttackOnBrokenBrick(hitEntity, attackType);
        }
        // Note: Block entities are excluded in checkAttackCollisions
        // Add more entity types as needed
    }
    
    handlePlayerAttackOnMrMan(mrman, attackType) {
        console.log(`Player ${attackType} hit MrMan!`);
        // Trigger hurt state with knockback instead of immediate removal
        mrman.getHit(attackType, this.player.direction);
        
        // If MrMan is defeated (marked for removal), add score
        if (mrman.removeFromWorld) {
            this.gameState.defeatEnemy(10); // 10 points per enemy
            console.log(`Enemy defeated! Score: ${this.gameState.score}`);
        }
    }
    
    handlePlayerAttackOnBrokenBrick(brokenBrick, attackType) {
        console.log(`Player ${attackType} hit broken brick!`);
        // Mark broken brick for removal
        brokenBrick.removeFromWorld = true;
    }
    
    handleMrManAttackOnPlayer(mrman) {
        console.log("MrMan's flying kick hit the player!");
        // Damage the player with the specific MrMan that hit them
        this.player.takeDamage(mrman);
    }
}