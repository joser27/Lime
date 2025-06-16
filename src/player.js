class Player {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.x = 0;
        this.y = 0;
        this.walkAnimation = new Animator(
            ASSET_MANAGER.getAsset("./assets/images/Enemies.png"),
            0,  // xStart
            16*1, // yStart
            16, // width
            16, // height
            3, // frameCount
            0.1, // frameDuration
            18, // scale
            true);

        this.velocity = 0;
        this.speed = 2;
        this.direction = "right";
        this.gravity = 0.1;
        this.groundLevel = 300; // Ground level where player stops falling
        this.isJumping = false;
    }

    update() {
        // Apply gravity
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Ground collision
        if (this.y > this.groundLevel) {
            this.y = this.groundLevel;
            this.velocity = 0;
            this.isJumping = false;
        }

        // Horizontal movement
        if (this.gameEngine.keys["d"]) {
            this.x += this.speed;
            this.direction = "right";
        }
        if (this.gameEngine.keys["a"]) {
            this.x -= this.speed;
            this.direction = "left";
        }

        // Jumping
        if (this.gameEngine.keys[" "] && !this.isJumping) {
            this.velocity = -5; // Initial jump velocity
            this.isJumping = true;
        }
    }

    draw() {
        this.walkAnimation.drawFrame(this.gameEngine.clockTick, this.gameEngine.ctx, this.x, this.y);
    }
}