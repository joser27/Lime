class SceneManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameEngine.camera = this;

        this.scenes = {
            MenuScene: new MenuScene(this.gameEngine, this),
            PlayingScene: null,
        }
        this.currentScene = this.scenes.MenuScene;
        this.gameEngine.addEntity(this.currentScene);
    }

    update() {

    }
    draw() {

    }

    changeScene(sceneName) {
        this.gameEngine.clearEntities();

        if (sceneName == "PlayingScene") {
            this.scenes.PlayingScene = new PlayingScene(this.gameEngine, this);
            this.currentScene = this.scenes.PlayingScene;
        } else if (sceneName == "MenuScene") {
            this.scenes.MenuScene = new MenuScene(this.gameEngine, this);
            this.currentScene = this.scenes.MenuScene;
        }

        this.gameEngine.addEntity(this.currentScene);

    }
}