class JobApplication {
    constructor(gameEngine, sceneManager, x, y, speed = 5) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.x = x;
        this.y = y;
        this.width = 500*0.5;
        this.height = 647*0.5;
        this.speed = speed;
        this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
        this.vectorHeight = 100;
        this.hasBeenPassed = false;
        this.scoreCounted = false;
    }

    update() {
        this.x -= this.speed;
        this.updateBoundingBox();

        // Check if player has passed over this job application
        if (!this.hasBeenPassed && this.gameEngine.entities.some(entity => {
            if (entity instanceof Player) {
                // Check if player is above the vector line and has passed the x position
                return entity.x > this.x + this.width && 
                       entity.y < this.y - this.vectorHeight;
            }
            return false;
        })) {
            this.hasBeenPassed = true;
            // You could add score or other game logic here
        }

        // Remove if off screen
        if (this.x < -this.width) {
            this.removeFromWorld = true;
        }
    }

    draw() {
        const ctx = this.gameEngine.ctx;
        
        // Draw the job application
        ctx.drawImage(
            ASSET_MANAGER.getAsset("./assets/images/Employment-Job-Application.png"),
            this.x,
            this.y,
            this.width,
            this.height
        );

        // Draw the vector line
        ctx.save();
        ctx.strokeStyle = this.hasBeenPassed ? "#00FF00" : "#FF0000"; // Green if passed, red if not
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Draw vertical line
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y - this.vectorHeight);
        // Draw arrow head
        const arrowSize = 10;
        ctx.moveTo(this.x + this.width / 2, this.y - this.vectorHeight);
        ctx.lineTo(this.x + this.width / 2 - arrowSize, this.y - this.vectorHeight + arrowSize);
        ctx.moveTo(this.x + this.width / 2, this.y - this.vectorHeight);
        ctx.lineTo(this.x + this.width / 2 + arrowSize, this.y - this.vectorHeight + arrowSize);
        ctx.stroke();
        ctx.restore();

        if (params.debug) {
            // Draw bounding box
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
        }
    }

    updateBoundingBox() {
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
    }
}

