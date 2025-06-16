class SceneManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameEngine.camera = this;
        this.isFullscreen = false;

        this.scenes = {
            MenuScene: new MenuScene(this.gameEngine, this),
            PlayingScene: null,
            OptionsScene: null,
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
        } else if (sceneName == "OptionsScene") {
            this.scenes.OptionsScene = new OptionsScene(this.gameEngine, this);
            this.currentScene = this.scenes.OptionsScene;
        }

        this.gameEngine.addEntity(this.currentScene);

    }

    toggleFullscreen() {
        const canvas = document.getElementById("gameWorld");
        
        if (!this.isFullscreen) {
            if (canvas.requestFullscreen) {
                canvas.requestFullscreen();
            } else if (canvas.webkitRequestFullscreen) { // Safari
                canvas.webkitRequestFullscreen();
            } else if (canvas.msRequestFullscreen) { // IE11
                canvas.msRequestFullscreen();
            }
            this.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { // Safari
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE11
                document.msExitFullscreen();
            }
            this.isFullscreen = false;
        }

        // Listen for fullscreen change events
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
        });
        document.addEventListener('webkitfullscreenchange', () => {
            this.isFullscreen = !!document.webkitFullscreenElement;
        });
        document.addEventListener('msfullscreenchange', () => {
            this.isFullscreen = !!document.msFullscreenElement;
        });
    }
}