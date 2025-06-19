class LevelManager {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        
        // Grid settings
        this.tileSize = params.tileSize;
        this.scale = params.scale;
        this.gridWidth = Math.ceil(this.gameEngine.ctx.canvas.width / (this.tileSize * this.scale));
        this.gridHeight = Math.ceil(this.gameEngine.ctx.canvas.height / (this.tileSize * this.scale));
        
        // Calculate grid offset to center it
        this.offsetX = (this.gameEngine.ctx.canvas.width - (this.gridWidth * this.tileSize * this.scale)) / 2;
        this.offsetY = (this.gameEngine.ctx.canvas.height - (this.gridHeight * this.tileSize * this.scale)) / 2;
    }

    update() {
        // Update logic for blocks will go here
    }

    draw() {
        if (params.debug) {
            this.drawGrid();
        }


    }

    drawGrid() {
        const ctx = this.gameEngine.ctx;
        
        // Get camera offset
        const cameraOffset = this.gameEngine.camera.getViewOffset();
        
        // Set grid line style
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 1;

        // Draw vertical lines and x coordinates
        for (let x = 0; x <= this.gridWidth; x++) {
            const worldX = this.offsetX + (x * this.tileSize * this.scale);
            const screenX = worldX + cameraOffset.x;
            ctx.beginPath();
            ctx.strokeStyle = "#666666";  // Reset stroke style for grid lines
            ctx.lineWidth = 1;
            ctx.moveTo(screenX, this.offsetY + cameraOffset.y);
            ctx.lineTo(screenX, this.offsetY + cameraOffset.y + (this.gridHeight * this.tileSize * this.scale));
            ctx.stroke();

            // Draw x coordinates at the top with outline
            if (x < this.gridWidth) {
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const text = x.toString();
                const textX = screenX + (this.tileSize * this.scale / 2);
                const textY = this.offsetY + cameraOffset.y - 8;
                
                // Draw text outline
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                ctx.strokeText(text, textX, textY);
                
                // Draw text
                ctx.fillStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.fillText(text, textX, textY);
            }
        }

        // Draw horizontal lines and y coordinates
        for (let y = 0; y <= this.gridHeight; y++) {
            const worldY = this.offsetY + (y * this.tileSize * this.scale);
            const screenY = worldY + cameraOffset.y;
            ctx.beginPath();
            ctx.strokeStyle = "#666666";  // Reset stroke style for grid lines
            ctx.lineWidth = 1;
            ctx.moveTo(this.offsetX + cameraOffset.x, screenY);
            ctx.lineTo(this.offsetX + cameraOffset.x + (this.gridWidth * this.tileSize * this.scale), screenY);
            ctx.stroke();

            // Draw y coordinates on the left with outline
            if (y < this.gridHeight) {
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const text = y.toString();
                const textX = this.offsetX + cameraOffset.x - 8;
                const textY = screenY + (this.tileSize * this.scale / 2);
                
                // Draw text outline
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                ctx.strokeText(text, textX, textY);
                
                // Draw text
                ctx.fillStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.fillText(text, textX, textY);
            }
        }

        // Draw tile coordinates in each cell
        ctx.font = "bold 8px Arial";
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const worldX = this.offsetX + (x * this.tileSize * this.scale);
                const worldY = this.offsetY + (y * this.tileSize * this.scale);
                const screenX = worldX + cameraOffset.x;
                const screenY = worldY + cameraOffset.y;
                
                // Draw coordinate text in each cell with outline
                const text = `${x},${y}`;
                const textX = screenX + (this.tileSize * this.scale / 2);
                const textY = screenY + (this.tileSize * this.scale / 2);
                
                // Draw text outline
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.strokeText(text, textX, textY);
                
                // Draw text
                ctx.fillStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.fillText(text, textX, textY);
            }
        }
        
    }

    // Helper method to convert screen coordinates to grid coordinates
    screenToGrid(screenX, screenY) {
        const gridX = Math.floor((screenX - this.offsetX) / (this.tileSize * this.scale));
        const gridY = Math.floor((screenY - this.offsetY) / (this.tileSize * this.scale));
        return { x: gridX, y: gridY };
    }

    // Helper method to convert grid coordinates to screen coordinates
    gridToScreen(gridX, gridY) {
        const screenX = this.offsetX + (gridX * this.tileSize * this.scale);
        const screenY = this.offsetY + (gridY * this.tileSize * this.scale);
        return { x: screenX, y: screenY };
    }
}