class Background {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        
        // Simple background image
        this.backgroundImage = "./assets/images/background10.png";
        this.scale = 1; // Scale factor for the background
    }

    update() {
    }

    draw() {
        const backgroundImg = ASSET_MANAGER.getAsset(this.backgroundImage);
        if (!backgroundImg) return; // Skip if image not loaded
        
        // Use smaller scale for zoomed out effect
        const zoomedScale = this.scale * 0.5; // Zoom out by making background smaller
        const imageWidth = backgroundImg.width * zoomedScale;
        const imageHeight = backgroundImg.height * zoomedScale;
        
        // Calculate how many images we need to tile to cover the screen
        const screenWidth = this.gameEngine.ctx.canvas.width;
        const screenHeight = this.gameEngine.ctx.canvas.height;
        
        // Calculate number of tiles needed (extra tiles to ensure full coverage)
        const tilesX = Math.ceil(screenWidth / imageWidth) + 2;
        const tilesY = Math.ceil(screenHeight / imageHeight) + 2;
        
        // Start from a fixed world position (0,0) to make background static
        const worldStartX = 0;
        const worldStartY = 0;
        
        // Draw tiled background images to cover entire screen
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                // Calculate world position for this tile
                const worldX = worldStartX + (x * imageWidth);
                const worldY = worldStartY + (y * imageHeight);
                
                // Convert world position to screen position using camera
                const screenPos = this.gameEngine.camera.worldToScreen(worldX, worldY);
                
                this.gameEngine.ctx.drawImage(
                    backgroundImg,
                    screenPos.x, screenPos.y,
                    imageWidth, imageHeight
                );
            }
        }
    }
}
