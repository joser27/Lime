class Player {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.x = 0;
        this.y = 0;
        this.boundingBox = new BoundingBox(this.x, this.y, 12*params.scale, 10*params.scale);
        this.walkRightAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/Enemies.png"),
            0,  // xStart
            16*2, // yStart
            16, // width
            16, // height
            6, // frameCount
            0.1, // frameDuration
            5, // scale
            true);
        this.walkLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/Enemies.png"),
            16*8,  // xStart
            16*27, // yStart
            16, // width
            16, // height
            6, // frameCount
            0.1, // frameDuration
            5, // scale
            true);           
        this.idleRightAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/Enemies.png"),
            0,  // xStart
            16*1, // yStart
            16, // width
            16, // height
            6, // frameCount
            0.1, // frameDuration
            5, // scale
            true);
        this.idleLeftAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/Enemies.png"),
            16*8,  // xStart
            16*26, // yStart
            16, // width
            16, // height
            6, // frameCount
            0.1, // frameDuration
            5, // scale
            true);
        this.speed = 5;
        this.direction = "right";
        this.velocity = 0;
        this.gravity = 0.8;
        this.jumpStrength = 30;
        this.groundLevel = 415;
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
        const spriteWidth = 16 * 5;  // Width of the sprite after scaling (16 * scale)
        const spriteHeight = 16 * 5;  // Height of the sprite after scaling
        const offsetX = -spriteWidth / 2 + 20;  // Center the sprite horizontally
        const offsetY = -spriteHeight + 55;  // Move up by sprite height to align with ground
        
        // Apply camera offset to drawing position (already rounded in worldToScreen)
        const screenPos = this.gameEngine.camera.worldToScreen(this.x + offsetX, this.y + offsetY);
        
        // Choose the appropriate animation based on direction and movement
        let currentAnimation;
        if (!this.gameEngine.keys["a"] && !this.gameEngine.keys["d"]) {
            // Idle animation based on direction
            if (this.direction === "left") {
                currentAnimation = this.idleLeftAnimation;
            } else {
                currentAnimation = this.idleRightAnimation;
            }
        } else {
            // Walking animation based on direction
            if (this.direction === "left") {
                currentAnimation = this.walkLeftAnimation;
            } else {
                currentAnimation = this.walkRightAnimation;
            }
        }
        
        // Draw the animation at the camera-adjusted position with pixel-perfect positioning
        currentAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, screenPos.x, screenPos.y);

        if (params.debug) {
            // Apply camera offset to bounding box drawing
            const boundingBoxScreenPos = this.gameEngine.camera.worldToScreen(this.boundingBox.x, this.boundingBox.y);
            this.gameEngine.ctx.strokeStyle = "red";
            this.gameEngine.ctx.lineWidth = 2;
            this.gameEngine.ctx.strokeRect(boundingBoxScreenPos.x, boundingBoxScreenPos.y, this.boundingBox.width, this.boundingBox.height);
        }
    }

    updateBoundingBox() {
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
    }
}