class ChildSupport {
    constructor(gameEngine, sceneManager, x, y, speed = 5, direction = "horizontal") {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.x = x;
        this.y = y;
        this.width = 612 * 0.5; // 306 pixels
        this.height = 408 * 0.5; // 204 pixels
        this.speed = speed;
        this.direction = direction; // "horizontal" or "vertical"
        this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
        this.vectorHeight = 200;
        this.hasBeenPassed = false;
        this.scoreCounted = false;
    }

    update() {
        // Calculate frame-independent speed
        const frameSpeed = this.speed * this.gameEngine.clockTick * 60; // Multiply by 60 for 60fps baseline
        
        if (this.direction === "horizontal") {
            // Move from right to left (frame-independent)
            this.x -= frameSpeed;
            
            // Check if player has passed over this child support
            if (!this.hasBeenPassed && this.gameEngine.entities.some(entity => {
                if (entity instanceof Player) {
                    // Check if player is above the vector line and has passed the x position
                    return entity.x > this.x + this.width && 
                           entity.y < this.y - this.vectorHeight;
                }
                return false;
            })) {
                this.hasBeenPassed = true;
            }
            
            // Remove if off screen to the left
            if (this.x < -this.width) {
                this.removeFromWorld = true;
            }
        } else if (this.direction === "vertical") {
            // Fall from top to bottom (frame-independent)
            this.y += frameSpeed;
            
            // Check if player has passed under this child support
            if (!this.hasBeenPassed && this.gameEngine.entities.some(entity => {
                if (entity instanceof Player) {
                    // Check if player is below the child support and has passed the y position
                    return entity.y > this.y + this.height && 
                           entity.x > this.x && 
                           entity.x < this.x + this.width;
                }
                return false;
            })) {
                this.hasBeenPassed = true;
            }
            
            // Remove if off screen to the bottom
            if (this.y > this.gameEngine.ctx.canvas.height) {
                this.removeFromWorld = true;
            }
        }
        
        this.updateBoundingBox();
    }

    draw() {
        const ctx = this.gameEngine.ctx;
        
        // Apply camera offset to drawing position
        const screenPos = this.gameEngine.camera.worldToScreen(this.x, this.y);
        
        // Draw the child support (using the same image for now, you can change this later)
        ctx.drawImage(
            ASSET_MANAGER.getAsset("./assets/images/childsupport.png"),
            screenPos.x,
            screenPos.y,
            this.width,
            this.height
        );

        // Draw the vector line (only for horizontal child support and when debug is on)
        if (this.direction === "horizontal" && params.debug) {
            ctx.save();
            ctx.strokeStyle = this.hasBeenPassed ? "#00FF00" : "#FF0000"; // Green if passed, red if not
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Draw vertical line with camera offset
            const lineStartX = screenPos.x + this.width / 2;
            const lineStartY = screenPos.y;
            const lineEndY = screenPos.y - this.vectorHeight;
            ctx.moveTo(lineStartX, lineStartY);
            ctx.lineTo(lineStartX, lineEndY);
            // Draw arrow head
            const arrowSize = 10;
            ctx.moveTo(lineStartX, lineEndY);
            ctx.lineTo(lineStartX - arrowSize, lineEndY + arrowSize);
            ctx.moveTo(lineStartX, lineEndY);
            ctx.lineTo(lineStartX + arrowSize, lineEndY + arrowSize);
            ctx.stroke();
            ctx.restore();
        }

        if (params.debug) {
            // Draw bounding box with camera offset
            const boundingBoxScreenPos = this.gameEngine.camera.worldToScreen(this.boundingBox.x, this.boundingBox.y);
            ctx.strokeStyle = "blue"; // Different color to distinguish from job applications
            ctx.lineWidth = 2;
            ctx.strokeRect(boundingBoxScreenPos.x, boundingBoxScreenPos.y, this.boundingBox.width, this.boundingBox.height);
        }
    }

    updateBoundingBox() {
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
    }
}