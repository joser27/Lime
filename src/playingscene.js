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
        
        // Add player second
        this.player = new Player(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.player);

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