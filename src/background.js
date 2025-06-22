class Background {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        
        // Parallax settings for each layer
        this.layers = [
            {
                image: "./assets/images/swampbackgrounds/1.png", // Furthest back
                scrollSpeed: 0.2, // Slowest scroll
                scale: 2
            },
            {
                image: "./assets/images/swampbackgrounds/2.png", // Middle layer
                scrollSpeed: 0.5, // Medium scroll
                scale: 2
            },
            {
                image: "./assets/images/swampbackgrounds/3.png", // Closest layer
                scrollSpeed: 0.8, // Fastest scroll
                scale: 2
            }
        ];
    }

    update() {
    }

    draw() {
        // Get camera position for parallax calculation
        const cameraOffset = this.gameEngine.camera.getViewOffset();
        
        // Draw each parallax layer
        this.layers.forEach((layer, index) => {
            this.drawParallaxLayer(layer, cameraOffset);
        });
    }
    
    drawParallaxLayer(layer, cameraOffset) {
        const backgroundImage = ASSET_MANAGER.getAsset(layer.image);
        if (!backgroundImage) return; // Skip if image not loaded
        
        const imageWidth = backgroundImage.width * layer.scale;
        const imageHeight = backgroundImage.height * layer.scale;
        
        // Calculate parallax offset (camera movement * scroll speed)
        const parallaxOffsetX = cameraOffset.x * layer.scrollSpeed;
        const parallaxOffsetY = cameraOffset.y * layer.scrollSpeed;
        
        // Calculate how many images we need to tile to cover the screen
        const screenWidth = this.gameEngine.ctx.canvas.width;
        const screenHeight = this.gameEngine.ctx.canvas.height;
        
        // Calculate starting positions to ensure we cover the entire screen
        const startX = Math.floor(-parallaxOffsetX / imageWidth) - 1;
        const endX = Math.ceil((screenWidth - parallaxOffsetX) / imageWidth) + 1;
        const startY = Math.floor(-parallaxOffsetY / imageHeight) - 1;
        const endY = Math.ceil((screenHeight - parallaxOffsetY) / imageHeight) + 1;
        
        // Draw tiled background images
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const drawX = x * imageWidth + parallaxOffsetX;
                const drawY = y * imageHeight + parallaxOffsetY;
                
                this.gameEngine.ctx.drawImage(
                    backgroundImage,
                    drawX, drawY,
                    imageWidth, imageHeight
                );
            }
        }
    }
}
