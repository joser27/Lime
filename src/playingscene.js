class PlayingScene {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        
        this.initEntities();
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

        // Add MrMan enemies
        this.mrman = []; // Array to store all MrMans
        for (let i = 0; i <= 1; i++) {
            const mrman = new MrMan(this.gameEngine, this.sceneManager, grid(10 + i * 3), grid(5));
            this.mrman.push(mrman); // Add MrMan to the array   
            this.gameEngine.addEntity(mrman);
        }

        // Set the camera to follow the player
        this.gameEngine.camera.setTarget(this.player);

        // Add background last (will be drawn first)
        this.background = new Background(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.background);
    }

    draw() {

    }

    update() {
        if (this.gameEngine.keys["Escape"]) {
            this.sceneManager.changeScene("MenuScene");
        }
        if (this.gameEngine.consumeKey("f")) {
            params.debug = !params.debug;
            console.log("Debug mode:", params.debug ? "ON" : "OFF");
        }
        
        // Check if player is dead (removed from world)
        if (this.player && this.player.removeFromWorld) {
            console.log("Game Over - Player defeated!");
            this.sceneManager.changeScene("MenuScene");
            return;
        }
        
        // Handle player attack interactions
        this.handlePlayerAttacks();
        
        // Handle MrMan attack interactions
        this.handleMrManAttacks();
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