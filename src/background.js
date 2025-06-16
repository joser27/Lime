class Background {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
    }

    update() {
    }

    draw() {
        const ctx = this.gameEngine.ctx;
        ctx.drawImage(
            ASSET_MANAGER.getAsset("./assets/images/messyRoom.jpg"),
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
        );
    }
}
