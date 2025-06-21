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
        for (let col = 0; col <= 200; col++) {
            const brickPos = gridToWorld(col, 10);
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
        
        // Add some broken bricks for testing
        const brokenBrickPos1 = gridToWorld(5, 9);
        const brokenBrick1 = new BrokenBrick(this.gameEngine, this.sceneManager, brokenBrickPos1.x, brokenBrickPos1.y);
        this.gameEngine.addEntity(brokenBrick1);
        
        const brokenBrickPos2 = gridToWorld(6, 9);
        const brokenBrick2 = new BrokenBrick(this.gameEngine, this.sceneManager, brokenBrickPos2.x, brokenBrickPos2.y);
        this.gameEngine.addEntity(brokenBrick2);
        
        const brokenBrickPos3 = gridToWorld(7, 9);
        const brokenBrick3 = new BrokenBrick(this.gameEngine, this.sceneManager, brokenBrickPos3.x, brokenBrickPos3.y);
        this.gameEngine.addEntity(brokenBrick3);

        const brokenBrickPos4 = gridToWorld(8, 9);
        const brokenBrick4 = new BrokenBrick(this.gameEngine, this.sceneManager, brokenBrickPos4.x, brokenBrickPos4.y);
        this.gameEngine.addEntity(brokenBrick4);

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