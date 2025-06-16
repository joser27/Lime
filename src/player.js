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
        this.lives = 3; // Player starts with 3 lives
        this.isInvulnerable = false; // For temporary invulnerability after getting hit
        this.invulnerabilityTimer = 0;
    }

    update() {
        // Update invulnerability timer if active
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= this.gameEngine.clockTick;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
                console.log("Invulnerability ended"); // Debug log
            }
        }

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
        if (this.gameEngine.keys["d"] && this.x < this.gameEngine.ctx.canvas.width - 16 * params.scale) {
            this.x = Math.round(this.x + this.speed);
            this.direction = "right";
        }
        if (this.gameEngine.keys["a"] && this.x > 0) {
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

    takeDamage() {
        if (!this.isInvulnerable) {
            console.log("Taking damage - Current lives:", this.lives); // Debug log
            this.lives--;
            this.isInvulnerable = true;
            this.invulnerabilityTimer = 2; // 2 seconds of invulnerability
            console.log("Damage taken - New lives:", this.lives); // Debug log
            return true; // Return true if damage was taken
        }
        console.log("Player is invulnerable, no damage taken"); // Debug log
        return false; // Return false if invulnerable
    }

    draw() {
        // Save the current context state
        this.gameEngine.ctx.save();
        
        // If invulnerable, make the player flash
        if (this.isInvulnerable) {
            const flashRate = 0.2; // How fast to flash
            if (Math.floor(this.invulnerabilityTimer / flashRate) % 2 === 0) {
                this.gameEngine.ctx.globalAlpha = 0.5; // Make semi-transparent when flashing
            }
        }

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