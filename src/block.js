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
        this.isBroken = false;
        this.particles = []; // Array to store falling chunks
    }

    drawSprite(screenX, screenY) {
        this.gameEngine.ctx.drawImage(
            ASSET_MANAGER.getAsset("./assets/images/DarkCastle.png"),
            16*1, 16*0,                           
            params.tileSize, params.tileSize, 
            screenX, screenY,               
            this.width, this.height         
        );
    }

    onPlayerCollision(player) {
        // Check if player is landing on top of the brick
        if (this.isPlayerOnTop(player)) {
            this.breakBrick();
            return false; // No longer solid after breaking
        }
        
        // Normal collision for other directions
        return super.onPlayerCollision(player);
    }

    isPlayerOnTop(player) {
        // Use the collision manager's helper method for consistency
        return this.gameEngine.collisionManager.isEntityOnTop(player, this);
    }

    createParticles() {
        // Create 8-12 small chunks that fall from the brick
        const numParticles = Math.floor(Math.random() * 5) + 8; // 8-12 particles
        
        for (let i = 0; i < numParticles; i++) {
            const particle = {
                x: this.x + Math.random() * this.width, // Random position within brick
                y: this.y + Math.random() * this.height,
                size: Math.random() * 12 + 8, // 8-20 pixel size (much bigger now)
                velocityX: (Math.random() - 0.5) * 3, // Random horizontal velocity
                velocityY: Math.random() * 2 + 1, // Downward velocity
                gravity: 0.3,
                life: 60, // Frames to live (1 second at 60fps)
                rotation: Math.random() * 360, // Random rotation
                rotationSpeed: (Math.random() - 0.5) * 10 // Random rotation speed
            };
            this.particles.push(particle);
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += particle.gravity;
            
            // Update rotation
            particle.rotation += particle.rotationSpeed;
            
            // Decrease life
            particle.life--;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        const brickImage = ASSET_MANAGER.getAsset("./assets/images/DarkCastle.png");
        
        for (const particle of this.particles) {
            const screenPos = this.gameEngine.camera.worldToScreen(particle.x, particle.y);
            
            // Save the current context state
            this.gameEngine.ctx.save();
            
            // Move to particle center for rotation
            this.gameEngine.ctx.translate(screenPos.x + particle.size/2, screenPos.y + particle.size/2);
            
            // Apply rotation
            this.gameEngine.ctx.rotate(particle.rotation * Math.PI / 180);
            
            // Draw the small brick fragment (1/4 size of original)
            const fragmentSize = particle.size;
            this.gameEngine.ctx.drawImage(
                brickImage,
                16*1, 16*0,                           // Source: broken brick sprite
                params.tileSize, params.tileSize,     // Source size
                -fragmentSize/2, -fragmentSize/2,     // Destination: centered on rotation point
                fragmentSize, fragmentSize            // Destination size
            );
            
            // Restore the context state
            this.gameEngine.ctx.restore();
        }
    }

    update() {
        super.update();
        this.updateParticles();
        
        // Remove from world only after all particles are gone
        if (this.isBroken && this.particles.length === 0) {
            this.removeFromWorld = true;
        }
    }

    draw() {
        // Only draw the brick sprite if it's not broken
        if (!this.isBroken) {
            super.draw();
        }
        // Always draw particles if they exist
        this.drawParticles();
    }

    breakBrick() {
        if (!this.isBroken && this.canBreak) {
            this.isBroken = true;
            this.isSolid = false;
            this.canBreak = false;
            
            // Create falling chunks
            this.createParticles();
            
            this.gameEngine.audioManager.play("./assets/sounds/brick-falling.mp3", {
                volume: 0.5,
                endTime: 0.5,
            });
            // Play crumble sound, spawn particles, etc.
            console.log("Broken brick crumbles!");
            
            // Don't remove immediately - let particles finish first
            // this.removeFromWorld = true;
        }
    }

    // Custom break behavior (for external breaking)
    onBreak() {
        this.breakBrick();
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

class GrassBlock extends Block {
    constructor(gameEngine, sceneManager, x, y) {
        super(gameEngine, sceneManager, x, y);
        this.isSolid = true;
        this.canBreak = false;
    }

    drawSprite(screenX, screenY) {
        // Draw grass block sprite
        this.gameEngine.ctx.drawImage(
            ASSET_MANAGER.getAsset("./assets/images/grassblock.png"),
            0, 0,                           // Source X, Y
            16, 16,                         // Source width, height
            screenX, screenY,               // Destination X, Y
            this.width, this.height         // Destination width, height (scaled)
        );
    }
}

// TiledBlock - for blocks created from Tiled map data
class TiledBlock extends Block {
    constructor(gameEngine, sceneManager, x, y, tilesetImage, sourceX, sourceY, sourceWidth, sourceHeight, layerIndex = 0) {
        super(gameEngine, sceneManager, x, y);
        
        // Tileset sprite information
        this.tilesetImage = tilesetImage;
        this.sourceX = sourceX;
        this.sourceY = sourceY;
        this.sourceWidth = sourceWidth;
        this.sourceHeight = sourceHeight;
        this.layerIndex = layerIndex; // For rendering order
        
        // Default properties (can be overridden based on tile properties)
        this.isSolid = true;
        this.canBreak = false;
    }

    drawSprite(screenX, screenY) {
        if (this.tilesetImage) {
            this.gameEngine.ctx.drawImage(
                this.tilesetImage,
                this.sourceX, this.sourceY,           // Source position in tileset
                this.sourceWidth, this.sourceHeight, // Source size
                screenX, screenY,                    // Destination position
                this.width, this.height              // Destination size (scaled)
            );
        } else {
            // Fallback to default block appearance
            super.drawSprite(screenX, screenY);
        }
    }

    // Override to customize behavior based on tile properties
    setTileProperties(properties) {
        if (properties) {
            this.isSolid = properties.solid !== false; // Default to solid unless explicitly false
            this.canBreak = properties.breakable === true;
            this.isTransparent = properties.transparent === true;
        }
    }
}
