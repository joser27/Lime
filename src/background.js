class Background {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
    }

    update() {
    }

    draw() {
        const backgroundImage = ASSET_MANAGER.getAsset("./assets/images/dirtbackground1.png");
        
        // Get the image dimensions (you can adjust these if needed)
        const imageWidth = backgroundImage.width * 2;
        const imageHeight = backgroundImage.height * 2;
        
        // Draw a 3x3 grid of background images
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                // Calculate world position for this tile
                const worldX = x * imageWidth;
                const worldY = y * imageHeight;
                
                // Convert to screen position with camera offset
                const screenPos = this.gameEngine.camera.worldToScreen(worldX, worldY);
                
                // Draw the background tile
                this.gameEngine.ctx.drawImage(
                    backgroundImage,
                    screenPos.x, screenPos.y,
                    imageWidth, imageHeight
                );
            }
        }
    }
}
