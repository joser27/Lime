
// Base Block class with common functionality
class Block {
    constructor(gameEngine, sceneManager, x, y) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.x = x;
        this.y = y;
        this.width = params.tileSize * params.scale;
        this.height = params.tileSize * params.scale;
        
        // Bounding box for collision detection
        this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
        
        // Common properties that can be overridden
        this.isSolid = true; // Does this block have collision?
        this.isTransparent = false; // Does light pass through?
        this.canBreak = false; // Can this block be destroyed?
    }

    update() {
        // Common update logic for all blocks
        this.updateBoundingBox();
    }

    draw() {
        // Apply camera offset to drawing position
        const screenPos = this.gameEngine.camera.worldToScreen(this.x, this.y);
        
        // Each subclass will override this to draw their specific sprite
        this.drawSprite(screenPos.x, screenPos.y);
        
        // Debug drawing
        if (params.debug) {
            this.drawDebug();
        }
    }

    drawSprite(screenX, screenY) {
        // To be overridden by subclasses
        // Default: draw a simple colored rectangle
        this.gameEngine.ctx.fillStyle = "#888888";
        this.gameEngine.ctx.fillRect(screenX, screenY, this.width, this.height);
    }

    drawDebug() {
        const boundingBoxScreenPos = this.gameEngine.camera.worldToScreen(this.boundingBox.x, this.boundingBox.y);
        this.gameEngine.ctx.strokeStyle = "blue";
        this.gameEngine.ctx.lineWidth = 1;
        this.gameEngine.ctx.strokeRect(boundingBoxScreenPos.x, boundingBoxScreenPos.y, this.boundingBox.width, this.boundingBox.height);
    }

    updateBoundingBox() {
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
    }

    // Override this for special interaction behavior
    onPlayerCollision(player) {
        // Default: solid collision
        return this.isSolid;
    }

    // Override this for when block is broken/destroyed
    onBreak() {
        if (this.canBreak) {
            this.removeFromWorld = true;
        }
    }
}

// Normal brick - basic solid block
class Brick extends Block {
    constructor(gameEngine, sceneManager, x, y) {
        super(gameEngine, sceneManager, x, y);
        this.isSolid = true;
        this.canBreak = false;
    }

    drawSprite(screenX, screenY) {
        // Draw normal brick sprite from row 0, col 0 of sprite sheet
        this.gameEngine.ctx.drawImage(
            ASSET_MANAGER.getAsset("./assets/images/DarkCastle.png"),
            0, 0,                           // Source X, Y (row 0, col 0)
            params.tileSize, params.tileSize, // Source width, height (one tile)
            screenX, screenY,               // Destination X, Y
            this.width, this.height         // Destination width, height (scaled)
        );
    }
}

// Broken brick - might crumble or have different collision
class BrokenBrick extends Block {
    constructor(gameEngine, sceneManager, x, y) {
        super(gameEngine, sceneManager, x, y);
        this.isSolid = true;
        this.canBreak = true; // Can be destroyed
        this.health = 1; // Takes 1 hit to break
    }

    drawSprite(screenX, screenY) {
        // Draw broken brick sprite
        this.gameEngine.ctx.fillStyle = "#696969";
        this.gameEngine.ctx.fillRect(screenX, screenY, this.width, this.height);
        // Draw cracks
        this.gameEngine.ctx.strokeStyle = "#2F2F2F";
        this.gameEngine.ctx.beginPath();
        this.gameEngine.ctx.moveTo(screenX + 5, screenY);
        this.gameEngine.ctx.lineTo(screenX + 15, screenY + this.height);
        this.gameEngine.ctx.stroke();
    }

    onPlayerCollision(player) {
        // Maybe the brick crumbles when touched?
        // For now, just normal collision
        return super.onPlayerCollision(player);
    }

    // Custom break behavior
    onBreak() {
        // Play crumble sound, spawn particles, etc.
        console.log("Broken brick crumbles!");
        super.onBreak();
    }
}

// Door blocks - can be opened/closed
class BrickDoorTop extends Block {
    constructor(gameEngine, sceneManager, x, y) {
        super(gameEngine, sceneManager, x, y);
        this.isOpen = false;
        this.isSolid = !this.isOpen; // Solid when closed, passable when open
        this.doorBottom = null; // Reference to bottom part
    }

    drawSprite(screenX, screenY) {
        const color = this.isOpen ? "#654321" : "#8B4513";
        this.gameEngine.ctx.fillStyle = color;
        this.gameEngine.ctx.fillRect(screenX, screenY, this.width, this.height);
        // Draw door handle
        this.gameEngine.ctx.fillStyle = "#FFD700";
        this.gameEngine.ctx.fillRect(screenX + this.width - 8, screenY + this.height/2 - 2, 4, 4);
    }

    onPlayerCollision(player) {
        // Open/close door when player touches it
        this.toggleDoor();
        return this.isSolid;
    }

    toggleDoor() {
        this.isOpen = !this.isOpen;
        this.isSolid = !this.isOpen;
        
        // Also toggle the bottom part if it exists
        if (this.doorBottom) {
            this.doorBottom.isOpen = this.isOpen;
            this.doorBottom.isSolid = this.isSolid;
        }
    }
}

class BrickDoorBottom extends Block {
    constructor(gameEngine, sceneManager, x, y) {
        super(gameEngine, sceneManager, x, y);
        this.isOpen = false;
        this.isSolid = !this.isOpen;
        this.doorTop = null; // Reference to top part
    }

    drawSprite(screenX, screenY) {
        const color = this.isOpen ? "#654321" : "#8B4513";
        this.gameEngine.ctx.fillStyle = color;
        this.gameEngine.ctx.fillRect(screenX, screenY, this.width, this.height);
    }

    onPlayerCollision(player) {
        // Trigger door from bottom part too
        if (this.doorTop) {
            this.doorTop.toggleDoor();
        }
        return this.isSolid;
    }
}

// Light brick - emits light, maybe different behavior
class BrickLight extends Block {
    constructor(gameEngine, sceneManager, x, y) {
        super(gameEngine, sceneManager, x, y);
        this.isSolid = true;
        this.isTransparent = true; // Emits light
        this.lightRadius = 100;
        this.isLightOn = true;
    }

    update() {
        super.update();
        // Maybe flicker occasionally?
        if (Math.random() < 0.001) {
            this.flickerLight();
        }
    }

    drawSprite(screenX, screenY) {
        // Draw light brick
        this.gameEngine.ctx.fillStyle = this.isLightOn ? "#FFFF99" : "#888888";
        this.gameEngine.ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Draw light glow effect
        if (this.isLightOn) {
            const ctx = this.gameEngine.ctx;
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = "#FFFF99";
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, screenY + this.height/2, this.lightRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }

    flickerLight() {
        this.isLightOn = !this.isLightOn;
        // Turn back on after a short delay
        setTimeout(() => {
            this.isLightOn = true;
        }, 100);
    }

    onPlayerCollision(player) {
        // Maybe player can toggle the light?
        return super.onPlayerCollision(player);
    }
}

