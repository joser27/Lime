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
        
        // Create a row of bricks at row 8 from column 0 to 13
        this.bricks = []; // Array to store all bricks
        for (let col = 0; col <= 13; col++) {
            const brickPos = gridToWorld(col, 8);
            const brick = new Brick(this.gameEngine, this.sceneManager, brickPos.x, brickPos.y);
            this.bricks.push(brick);
            this.gameEngine.addEntity(brick);
        }

        // Create a column of bricks at column 0 from row 0 to row 8
        for (let row = 1; row <= 8; row++) {
            const brickPos = gridToWorld(0, row);
            const brick = new Brick(this.gameEngine, this.sceneManager, brickPos.x, brickPos.y);
            this.bricks.push(brick);
            this.gameEngine.addEntity(brick);
        }

        // Create a column of bricks at column 12 from row 0 to row 8
        for (let row = 0; row <= 8; row++) {
            const brickPos = gridToWorld(12, row);
            const brick = new Brick(this.gameEngine, this.sceneManager, brickPos.x, brickPos.y);
            this.bricks.push(brick);
            this.gameEngine.addEntity(brick);
        }

        // You can still add individual bricks if needed
        const testBrickPos = gridToWorld(5, 5);
        this.testBrick = new Brick(this.gameEngine, this.sceneManager, testBrickPos.x, testBrickPos.y);
        this.gameEngine.addEntity(this.testBrick);

        // Add player second
        this.player = new Player(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.player);

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
    }
}