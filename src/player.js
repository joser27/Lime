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
            10, // scale
            true);
        this.idleAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/Enemies.png"),
            0,  // xStart
            16*1, // yStart
            16, // width
            16, // height
            6, // frameCount
            0.1, // frameDuration
            10, // scale
            true);

        this.speed = 5;
        this.direction = "right";
        this.velocity = 0;
        this.gravity = 0.8;
        this.jumpStrength = 30;
        this.groundLevel = 500;
        this.isJumping = false;

    }

    update() {

        // Apply gravity and update position (frame-independent)
        this.velocity += this.gravity * this.gameEngine.clockTick * 60; // Multiply by 60 for 60fps baseline
        this.y = Math.round(this.y + this.velocity * this.gameEngine.clockTick * 60);

        // Ground collision
        if (this.y > this.groundLevel) {
            this.y = this.groundLevel;
            this.velocity = 0;
            this.isJumping = false;
        }

        // Horizontal movement with boundary (frame-independent)
        const frameSpeed = this.speed * this.gameEngine.clockTick * 60;
        if (this.gameEngine.keys["d"] && this.x < this.gameEngine.ctx.canvas.width - 16 * params.scale) {
            this.x = Math.round(this.x + frameSpeed);
            this.direction = "right";
        }
        if (this.gameEngine.keys["a"] && this.x > 0) {
            this.x = Math.round(this.x - frameSpeed);
            this.direction = "left";
        }

        // Jumping (frame-independent)
        if (this.gameEngine.keys[" "] && !this.isJumping) {
            this.gameEngine.audioManager.play("./assets/sounds/pointearned.mp3", {
                volume: 0.5,
            });
            this.velocity = -this.jumpStrength;
            this.isJumping = true;
        }

        this.updateBoundingBox();
    }


    draw() {
        // Save the current context state
        this.gameEngine.ctx.save();


        const offsetX = -50;  // Move left by 50px
        const offsetY = -50;  // Move up by 50px
        const spriteWidth = 16 * params.scale;  // Width of the sprite after scaling
        
        // If moving left, flip the context horizontally
        if (this.direction === "left") {
            // Translate to the right edge of the sprite
            this.gameEngine.ctx.translate(this.x + spriteWidth, this.y);
            this.gameEngine.ctx.scale(-1, 1);
            // Draw at origin with offset
            if (!this.gameEngine.keys["a"] && !this.gameEngine.keys["d"]) {
                this.idleAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, offsetX, offsetY);
            } else {
                this.walkAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, offsetX, offsetY);
            }
        } else {
            // Play idle animation when not moving horizontally
            if (!this.gameEngine.keys["a"] && !this.gameEngine.keys["d"]) {
                this.idleAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, this.x + offsetX, this.y + offsetY);
            } else {
                this.walkAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, this.x + offsetX, this.y + offsetY);
            }
        }
        
        // Restore the context state
        this.gameEngine.ctx.restore();

        if (params.debug) {
            //draw bounding box
            this.gameEngine.ctx.strokeStyle = "red";
            this.gameEngine.ctx.lineWidth = 2;
            this.gameEngine.ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
        }
    }

    updateBoundingBox() {
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
    }
}