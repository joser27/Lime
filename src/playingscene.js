class PlayingScene {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.initEntities();
    }

    initEntities() {
        this.levelManager = new LevelManager(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.levelManager);
        
        this.player = new Player(this.gameEngine, this.sceneManager);
        this.gameEngine.addEntity(this.player);


    }

    update() {
        if (this.gameEngine.keys["Escape"]) {
            this.sceneManager.changeScene("MenuScene");
        }
        if (this.gameEngine.consumeKey("f")) {
            params.debug = !params.debug;
        }
    }
    draw() {
    }
}