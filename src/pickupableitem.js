class PickupableItem {
    constructor(gameEngine, sceneManager, x, y, width = 32, height = 32) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        
        // Position and size
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Physics properties
        this.velocity = 0; // Vertical velocity for gravity
        this.gravity = 0.9; // Same as player gravity
        this.isGrounded = false;
        this.groundFriction = 0.7; // Strong friction to stop sliding quickly
        this.horizontalVelocity = 0; // For bouncing/sliding
        
        // Create bounding box for collision detection
        this.boundingBox = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
        
        // Entity properties
        this.removeFromWorld = false;
        
        // Pickup system properties
        this.isPickupable = true;
        this.isHeld = false;
        
        // Visual properties (can be overridden by subclasses)
        this.color = "#666666";
        this.outlineColor = "white";
        this.outlineWidth = 2;
    }

    update() {
        // Update bounding box position
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
        
        // Don't apply physics when held
        if (this.isHeld) {
            return;
        }
        
        // Apply gravity
        this.velocity += this.gravity * this.gameEngine.clockTick * 60;
        
        // Calculate movement deltas
        const deltaX = this.horizontalVelocity * this.gameEngine.clockTick * 60;
        const deltaY = this.velocity * this.gameEngine.clockTick * 60;
        
        // Use collision manager to handle movement (same as player)
        const newPosition = this.gameEngine.collisionManager.handlePlayerMovement(this, deltaX, deltaY);
        const oldY = this.y;
        
        this.x = Math.round(newPosition.x);
        this.y = Math.round(newPosition.y);
        
        // Check if we hit the ground (stopped falling)
        if (this.velocity > 0 && this.y === oldY) {
            this.isGrounded = true;
            this.velocity = 0;
            
            // Apply strong ground friction to horizontal movement
            this.horizontalVelocity *= this.groundFriction;
            if (Math.abs(this.horizontalVelocity) < 0.5) {
                this.horizontalVelocity = 0; // Stop completely when velocity is small
            }
        } else {
            this.isGrounded = false;
        }
    }

    draw(ctxOrForceShow = false, gameEngine = null) {
        // Handle two different calling conventions:
        // 1. Game engine calls: draw(ctx, gameEngine)
        // 2. Player calls: draw(forceShow)
        
        let forceShow = false;
        let ctx = this.gameEngine.ctx;
        
        if (gameEngine !== null) {
            // Called by game engine with draw(ctx, gameEngine)
            forceShow = false;
            ctx = ctxOrForceShow;
        } else {
            // Called by player with draw(forceShow)
            forceShow = ctxOrForceShow;
        }
        
        // Don't draw if being held unless explicitly forced to show
        if (this.isHeld && !forceShow) {
            return;
        }
        
        // Apply camera offset using the proper worldToScreen method
        const screenPos = this.gameEngine.camera.worldToScreen(this.x, this.y);
        
        // Draw the item (can be overridden by subclasses)
        this.drawItem(ctx, screenPos);
        
        // Optional: Draw debug bounding box if debug mode is on
        if (params.debug && this.boundingBox) {
            const boundingBoxScreenPos = this.gameEngine.camera.worldToScreen(this.boundingBox.x, this.boundingBox.y);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                boundingBoxScreenPos.x,
                boundingBoxScreenPos.y,
                this.boundingBox.width,
                this.boundingBox.height
            );
        }
    }
    
    // Override this method in subclasses to define custom appearance
    drawItem(ctx, screenPos) {
        // Default drawing: simple rectangle with outline
        ctx.fillStyle = this.color;
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        
        ctx.strokeStyle = this.outlineColor;
        ctx.lineWidth = this.outlineWidth;
        ctx.strokeRect(screenPos.x, screenPos.y, this.width, this.height);
    }
    
    // Add some horizontal velocity (useful for when dropped or hit)
    addHorizontalVelocity(velocity) {
        this.horizontalVelocity += velocity;
    }
    
    // Add some vertical velocity (useful for bouncing)
    addVerticalVelocity(velocity) {
        this.velocity += velocity;
    }
    
    // Pickup system methods (can be overridden)
    onPickup(player) {
        console.log(`${this.constructor.name} picked up by player`);
    }
    
    onDrop(player) {
        console.log(`${this.constructor.name} dropped by player`);
        
        // No sliding - items drop and stay put
        this.horizontalVelocity = 0;
    }
} 