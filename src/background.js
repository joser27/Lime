class Background {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
    }

    update() {
    }

    draw() {
        // Draw all 11 background images in 3 rows
        for (let i = 1; i <= 11; i++) {
            const backgroundImage = ASSET_MANAGER.getAsset(`./assets/images/background${18}.png`);
            
            const imageWidth = backgroundImage.width * 2;
            const imageHeight = backgroundImage.height * 2;
            
            // Draw the top row (above the current top)
            const worldXTop = (i - 1) * imageWidth; // (i-1) so background1 starts at x=0
            const worldYTop = -imageHeight; // Top row at y=-imageHeight (above the current top)
            
            // Convert to screen position with camera offset
            const screenPosTop = this.gameEngine.camera.worldToScreen(worldXTop, worldYTop);
            
            // Draw the background image in top row
            this.gameEngine.ctx.drawImage(
                backgroundImage,
                screenPosTop.x, screenPosTop.y,
                imageWidth, imageHeight
            );
            
            // Draw the middle row (current top row)
            const worldXMiddle = (i - 1) * imageWidth; // Same X position
            const worldYMiddle = 0; // Middle row at y=0
            
            // Convert to screen position with camera offset
            const screenPosMiddle = this.gameEngine.camera.worldToScreen(worldXMiddle, worldYMiddle);
            
            // Draw the background image in middle row
            this.gameEngine.ctx.drawImage(
                backgroundImage,
                screenPosMiddle.x, screenPosMiddle.y,
                imageWidth, imageHeight
            );
            
            // Draw the bottom row (current bottom row)
            const worldXBottom = (i - 1) * imageWidth; // Same X position
            const worldYBottom = imageHeight; // Bottom row at y=imageHeight
            
            // Convert to screen position with camera offset
            const screenPosBottom = this.gameEngine.camera.worldToScreen(worldXBottom, worldYBottom);
            
            // Draw the background image in bottom row
            this.gameEngine.ctx.drawImage(
                backgroundImage,
                screenPosBottom.x, screenPosBottom.y,
                imageWidth, imageHeight
            );
        }
    }
}
