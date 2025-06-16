class Player {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.x = 0;
        this.y = 0;
        this.boundingBox = new BoundingBox(this.x, this.y, 16*params.scale, 16*params.scale);
        this.walkAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/Enemies.png"),
            0,  // xStart
            16*2, // yStart
            16, // width
            16, // height
            6, // frameCount
            0.1, // frameDuration
            4, // scale
            true);
        this.idleAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/Enemies.png"),
            0,  // xStart
            16*1, // yStart
            16, // width
            16, // height
            6, // frameCount
            0.1, // frameDuration
            4, // scale
            true);

        this.speed = 2;
        this.direction = "right";
        this.velocity = 0;
        this.gravity = 0.5;
        this.jumpStrength = 15;
        this.groundLevel = 300;
        this.isJumping = false;
    }

    update() {
        // Apply gravity and update position
        this.velocity += this.gravity;
        this.y = Math.round(this.y + this.velocity);

        // Ground collision
        if (this.y > this.groundLevel) {
            this.y = this.groundLevel;
            this.velocity = 0;
            this.isJumping = false;
        }

        // Horizontal movement with boundary
        if (this.gameEngine.keys["d"]) {
            this.x = Math.round(this.x + this.speed);
            this.direction = "right";
        }
        if (this.gameEngine.keys["a"]) {
            this.x = Math.round(this.x - this.speed);
            this.direction = "left";
        }

        // Jumping
        if (this.gameEngine.keys[" "] && !this.isJumping) {
            this.velocity = -this.jumpStrength;
            this.isJumping = true;
        }

        this.updateBoundingBox();
    }

    draw() {
        // Save the current context state
        this.gameEngine.ctx.save();
        
        // If moving left, flip the context horizontally
        if (this.direction === "left") {
            this.gameEngine.ctx.translate(this.x + 16 * params.scale, this.y);
            this.gameEngine.ctx.scale(-1, 1);
            // Play idle animation when not moving horizontally
            if (!this.gameEngine.keys["a"] && !this.gameEngine.keys["d"]) {
                this.idleAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, 0, 0);
            } else {
                this.walkAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, 0, 0);
            }
        } else {
            // Play idle animation when not moving horizontally
            if (!this.gameEngine.keys["a"] && !this.gameEngine.keys["d"]) {
                this.idleAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, this.x, this.y);
            } else {
                this.walkAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, this.x, this.y);
            }
        }
        
        // Restore the context state
        this.gameEngine.ctx.restore();

        //draw bounding box
        this.gameEngine.ctx.strokeStyle = "red";
        this.gameEngine.ctx.lineWidth = 2;
        this.gameEngine.ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
    }

    updateBoundingBox() {
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
    }
}