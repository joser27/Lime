class FlyingEnemy {
    constructor(gameEngine, x, y) {
        this.gameEngine = gameEngine;
        this.x = x;
        this.y = y;
        
        // Basic properties
        this.width = 16 * params.scale;
        this.height = 16 * params.scale;
        this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
        
        // Flying entity properties
        this.speed = 2;
        this.direction = "right";
        this.maxHealth = 2;
        this.currentHealth = this.maxHealth;
        
        // Pathfinding properties
        this.currentPath = null;
        this.currentWaypointIndex = 0;
        this.pathfindingCooldown = 0.8;
        this.lastPathfindTime = 0;
        this.waypointReachedDistance = 15;
        this.entityType = "flying"; // Flying entity type
        this.entitySize = {width: this.width, height: this.height};
        this.usePathfinding = true;
        
        // Detection and following
        this.detectionRange = 400;
        this.followDistance = 50; // Maintain this distance from player
        
        // Simple color for visualization (since we don't have sprites)
        this.color = "purple";
    }
    
    update() {
        let deltaX = 0;
        let deltaY = 0;
        
        // Find player
        const player = this.findPlayer();
        
        if (player) {
            const distanceToPlayer = Math.sqrt(
                Math.pow(player.x - this.x, 2) + 
                Math.pow(player.y - this.y, 2)
            );
            
            // Only follow if player is within detection range
            if (distanceToPlayer <= this.detectionRange) {
                this.updatePathfinding(player);
                const movement = this.getPathfindingMovement();
                deltaX = movement.x * this.gameEngine.clockTick * 60;
                deltaY = movement.y * this.gameEngine.clockTick * 60;
            }
        }
        
        // Apply movement (flying entities don't need collision detection with ground)
        this.x += deltaX;
        this.y += deltaY;
        
        // Keep within reasonable bounds
        this.x = Math.max(0, Math.min(this.x, 2000));
        this.y = Math.max(0, Math.min(this.y, 1000));
        
        this.updateBoundingBox();
    }
    
    /**
     * Update pathfinding to follow the player
     * @param {Object} player Player entity to follow
     */
    updatePathfinding(player) {
        if (!this.usePathfinding) {
            return;
        }
        
        const currentTime = this.gameEngine.timer.gameTime;
        
        // Check if enough time has passed to recalculate path
        if (currentTime - this.lastPathfindTime < this.pathfindingCooldown) {
            return;
        }
        
        // Calculate position to maintain distance from player
        const distanceToPlayer = Math.sqrt(
            Math.pow(player.x - this.x, 2) + 
            Math.pow(player.y - this.y, 2)
        );
        
        let goalX = player.x;
        let goalY = player.y;
        
        // If too close to player, move away
        if (distanceToPlayer < this.followDistance) {
            const angle = Math.atan2(this.y - player.y, this.x - player.x);
            goalX = player.x + Math.cos(angle) * this.followDistance;
            goalY = player.y + Math.sin(angle) * this.followDistance;
        }
        
        const start = {x: this.x, y: this.y};
        const goal = {x: goalX, y: goalY};
        
        const newPath = this.gameEngine.aStar.findPath(start, goal, this.entityType, this.entitySize);
        
        if (newPath && newPath.length > 1) {
            this.currentPath = newPath;
            this.currentWaypointIndex = 1;
            this.lastPathfindTime = currentTime;
        } else if (!this.currentPath) {
            // Fallback path
            this.currentPath = [start, goal];
            this.currentWaypointIndex = 1;
        }
    }
    
    /**
     * Get movement direction based on current pathfinding
     * @returns {Object} Movement vector {x, y}
     */
    getPathfindingMovement() {
        if (!this.currentPath || this.currentWaypointIndex >= this.currentPath.length) {
            return {x: 0, y: 0};
        }
        
        const currentWaypoint = this.currentPath[this.currentWaypointIndex];
        const distanceToWaypoint = Math.sqrt(
            Math.pow(currentWaypoint.x - this.x, 2) + 
            Math.pow(currentWaypoint.y - this.y, 2)
        );
        
        // Check if we've reached the current waypoint
        if (distanceToWaypoint <= this.waypointReachedDistance) {
            this.currentWaypointIndex++;
            
            if (this.currentWaypointIndex < this.currentPath.length) {
                return this.getPathfindingMovement();
            } else {
                return {x: 0, y: 0};
            }
        }
        
        // Move towards current waypoint
        const deltaX = currentWaypoint.x - this.x;
        const deltaY = currentWaypoint.y - this.y;
        
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            // Normalize movement vector
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            return {
                x: (deltaX / distance) * this.speed,
                y: (deltaY / distance) * this.speed
            };
        }
        
        return {x: 0, y: 0};
    }
    
    findPlayer() {
        for (let entity of this.gameEngine.entities) {
            if (entity instanceof Player) {
                return entity;
            }
        }
        return null;
    }
    
    updateBoundingBox() {
        this.boundingBox.x = this.x;
        this.boundingBox.y = this.y;
    }
    
    draw() {
        const screenPos = this.gameEngine.camera.worldToScreen(this.x, this.y);
        
        // Draw simple colored rectangle (since we don't have flying enemy sprites)
        this.gameEngine.ctx.fillStyle = this.color;
        this.gameEngine.ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        
        // Draw a simple eye to show direction
        this.gameEngine.ctx.fillStyle = "white";
        this.gameEngine.ctx.fillRect(screenPos.x + 2, screenPos.y + 2, 4, 4);
        
        if (params.debug) {
            // Draw bounding box
            this.gameEngine.ctx.strokeStyle = "purple";
            this.gameEngine.ctx.lineWidth = 2;
            this.gameEngine.ctx.strokeRect(screenPos.x, screenPos.y, this.width, this.height);
            
            // Draw pathfinding visualization
            if (this.currentPath && this.currentPath.length > 1) {
                this.gameEngine.ctx.strokeStyle = "rgba(128, 0, 128, 0.8)"; // Purple path
                this.gameEngine.ctx.lineWidth = 2;
                this.gameEngine.ctx.setLineDash([3, 3]);
                this.gameEngine.ctx.beginPath();
                
                for (let i = 0; i < this.currentPath.length - 1; i++) {
                    const currentWaypoint = this.currentPath[i];
                    const nextWaypoint = this.currentPath[i + 1];
                    
                    const currentScreenPos = this.gameEngine.camera.worldToScreen(currentWaypoint.x, currentWaypoint.y);
                    const nextScreenPos = this.gameEngine.camera.worldToScreen(nextWaypoint.x, nextWaypoint.y);
                    
                    if (i === 0) {
                        this.gameEngine.ctx.moveTo(currentScreenPos.x, currentScreenPos.y);
                    }
                    this.gameEngine.ctx.lineTo(nextScreenPos.x, nextScreenPos.y);
                }
                this.gameEngine.ctx.stroke();
                this.gameEngine.ctx.setLineDash([]);
                
                // Draw waypoints
                for (let i = 0; i < this.currentPath.length; i++) {
                    const waypoint = this.currentPath[i];
                    const waypointScreenPos = this.gameEngine.camera.worldToScreen(waypoint.x, waypoint.y);
                    
                    this.gameEngine.ctx.fillStyle = i === this.currentWaypointIndex ? "rgba(255, 0, 255, 0.8)" : "rgba(128, 0, 128, 0.6)";
                    this.gameEngine.ctx.beginPath();
                    this.gameEngine.ctx.arc(waypointScreenPos.x, waypointScreenPos.y, 3, 0, 2 * Math.PI);
                    this.gameEngine.ctx.fill();
                }
            }
            
            // Draw debug text
            const debugTextPos = this.gameEngine.camera.worldToScreen(this.x, this.y - 30);
            this.gameEngine.ctx.fillStyle = "white";
            this.gameEngine.ctx.strokeStyle = "black";
            this.gameEngine.ctx.lineWidth = 1;
            this.gameEngine.ctx.font = "10px Arial";
            this.gameEngine.ctx.textAlign = "center";
            
            const debugText = `Flying: ${this.currentPath ? this.currentPath.length : 'No'} waypoints`;
            this.gameEngine.ctx.strokeText(debugText, debugTextPos.x, debugTextPos.y);
            this.gameEngine.ctx.fillText(debugText, debugTextPos.x, debugTextPos.y);
        }
    }
} 