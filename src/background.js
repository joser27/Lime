class Background {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
    }

    update() {
    }

    draw() {
        // Background could be implemented here later
        // If you want a parallax background or static background that moves with camera,
        // you would apply camera offset here as well using:
        // const screenPos = this.gameEngine.camera.worldToScreen(worldX, worldY);
    }
}
