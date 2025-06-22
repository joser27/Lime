class Camera {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.x = 0; // Camera position
        this.y = 0;
        this.target = null; // The entity to follow (will be set to player)
        this.followSpeed = 0.1; // How smoothly the camera follows (0.1 = smooth, 1.0 = instant)
        
        // Map bounds - calculated from tile map dimensions
        // Map is 42x42 tiles, each tile is 16x16 pixels at scale 3
        this.mapWidth = 42 * 16 * 3; // 2016 pixels
        this.mapHeight = 42 * 16 * 3; // 2016 pixels
        this.minX = 0;
        this.minY = 0;
        this.maxX = this.mapWidth;
        this.maxY = this.mapHeight;
    }

    update() {
        // Update canvas dimensions for reference
        this.width = this.gameEngine.ctx.canvas.width;
        this.height = this.gameEngine.ctx.canvas.height;
        
        // Follow the target if one is set
        if (this.target) {
            // Calculate target camera position (centered on target)
            let targetX = this.target.x;
            let targetY = this.target.y;
            
            // Apply camera bounds to prevent viewing outside the map
            // Calculate the camera bounds based on canvas size
            const halfCanvasWidth = this.width / 2;
            const halfCanvasHeight = this.height / 2;
            
            // Clamp the target position to keep camera within map bounds
            targetX = Math.max(this.minX + halfCanvasWidth, Math.min(this.maxX - halfCanvasWidth, targetX));
            targetY = Math.max(this.minY + halfCanvasHeight, Math.min(this.maxY - halfCanvasHeight, targetY));
            
            // Smoothly move camera toward clamped target position
            const frameSpeed = this.followSpeed * this.gameEngine.clockTick * 60;
            this.x += (targetX - this.x) * frameSpeed;
            this.y += (targetY - this.y) * frameSpeed;
            
            // Apply final bounds check to camera position itself
            this.x = Math.max(this.minX + halfCanvasWidth, Math.min(this.maxX - halfCanvasWidth, this.x));
            this.y = Math.max(this.minY + halfCanvasHeight, Math.min(this.maxY - halfCanvasHeight, this.y));
            
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
        // Immediately snap to target position for initial setup, respecting bounds
        if (target) {
            const halfCanvasWidth = this.width / 2;
            const halfCanvasHeight = this.height / 2;
            
            let targetX = target.x;
            let targetY = target.y;
            
            // Apply bounds to initial position
            targetX = Math.max(this.minX + halfCanvasWidth, Math.min(this.maxX - halfCanvasWidth, targetX));
            targetY = Math.max(this.minY + halfCanvasHeight, Math.min(this.maxY - halfCanvasHeight, targetY));
            
            this.x = targetX;
            this.y = targetY;
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