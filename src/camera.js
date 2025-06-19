class Camera {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.x = 0; // Camera position
        this.y = 0;
        this.target = null; // The entity to follow (will be set to player)
        this.followSpeed = 0.05; // How smoothly the camera follows (0.1 = smooth, 1.0 = instant)
        
    }

    update() {
        // Update canvas dimensions for reference
        this.width = this.gameEngine.ctx.canvas.width;
        this.height = this.gameEngine.ctx.canvas.height;
        
        // Follow the target if one is set
        if (this.target) {
            // Calculate target camera position (centered on target)
            const targetX = this.target.x;
            const targetY = this.target.y;
            
            // Smoothly move camera toward target position
            const frameSpeed = this.followSpeed * this.gameEngine.clockTick * 60;
            this.x += (targetX - this.x) * frameSpeed;
            this.y += (targetY - this.y) * frameSpeed;
            
            // Round camera position to avoid sub-pixel positioning
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
        }
    }

    draw() {
        // Camera doesn't draw anything itself
    }
    
    // Set the target entity for the camera to follow
    setTarget(target) {
        this.target = target;
        // Immediately snap to target position for initial setup
        if (target) {
            this.x = target.x;
            this.y = target.y;
        }
    }
    
    // Get the offset to apply to world coordinates for screen drawing
    getViewOffset() {
        return {
            x: -this.x + (this.width / 2), // Center view on camera x position
            y: -this.y + (this.height / 2)  // Center view on camera y position
        };
    }
    
    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        const offset = this.getViewOffset();
        return {
            x: Math.round(worldX + offset.x),
            y: Math.round(worldY + offset.y)
        };
    }
}