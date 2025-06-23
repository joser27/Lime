class SceneManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameEngine.camera = new Camera(gameEngine);
        this.isFullscreen = false;
        
        // Global game state that persists across scenes
        this.globalGameState = null;

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
             // Create new game state if starting fresh, or reuse existing one
            if (!this.globalGameState) {
                this.globalGameState = new GameState();
            }
            this.scenes.PlayingScene = new PlayingScene(this.gameEngine, this, this.globalGameState);
            this.currentScene = this.scenes.PlayingScene;
        } else if (sceneName == "MenuScene") {
            // Reset global game state when returning to menu
            this.globalGameState = null;
            this.scenes.MenuScene = new MenuScene(this.gameEngine, this);
            this.currentScene = this.scenes.MenuScene;
        } else if (sceneName == "OptionsScene") {
            this.scenes.OptionsScene = new OptionsScene(this.gameEngine, this);
            this.currentScene = this.scenes.OptionsScene;
        } else if (sceneName == "GameOverScene") {
            this.scenes.GameOverScene = new GameOverScene(this.gameEngine, this);
            this.currentScene = this.scenes.GameOverScene;
        }

        // Add the scene at the beginning of the entities array so it's drawn last
        this.gameEngine.entities.unshift(this.currentScene);
    }

    // Method to transition to next level while keeping game state
    nextLevel() {
        if (this.globalGameState && this.currentScene instanceof PlayingScene) {
            this.globalGameState.nextLevel();
            console.log(`Advancing to level ${this.globalGameState.level}`);
            
            // Recreate PlayingScene with same game state but new level
            this.gameEngine.clearEntities();
            this.scenes.PlayingScene = new PlayingScene(this.gameEngine, this, this.globalGameState);
            this.currentScene = this.scenes.PlayingScene;
            this.gameEngine.entities.unshift(this.currentScene);
        }
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