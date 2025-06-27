class AStar {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.maxIterations = 200; // Reduced for faster pathfinding
        this.maxJumpHeight = 3; // Maximum blocks a ground entity can jump up
        this.maxJumpDistance = 4; // Maximum horizontal distance for jumps
        this.enableDebugLogging = false;
        this.debugCollisionChecks = false; // Separate flag for collision debugging
    }

    /**
     * Find a path from start to goal using simplified platformer pathfinding
     * @param {Object} start World coordinates {x, y}
     * @param {Object} goal World coordinates {x, y}
     * @param {String} entityType "ground" or "flying"
     * @param {Object} entitySize {width, height} in world pixels
     * @returns {Array} Array of world coordinate waypoints or null if no path
     */
    findPath(start, goal, entityType = "ground", entitySize = {width: 32, height: 32}) {
        // Convert world coordinates to grid coordinates
        const startGrid = worldToGrid(start.x, start.y);
        const goalGrid = worldToGrid(goal.x, goal.y);
        
        // Early bailout for distant targets
        const distance = Math.abs(goalGrid.x - startGrid.x) + Math.abs(goalGrid.y - startGrid.y);
        if (distance > 30) {
            return null;
        }
        
        // Quick line-of-sight check for simple cases
        if (distance <= 3 && this.canReachDirect(start, goal, entityType, entitySize)) {
            if (this.enableDebugLogging) {
                console.log(`A* using direct path (entity size: ${entitySize.width}x${entitySize.height})`);
            }
            return [start, goal];
        }
        
        // Use simplified A* with reactive rules
        const path = this.simpleAStar(startGrid, goalGrid, entityType, entitySize);
        
        if (path && this.enableDebugLogging) {
            console.log(`A* found path with ${path.length} waypoints (entity size: ${entitySize.width}x${entitySize.height})`);
            console.log(`Path waypoints:`, path.map(p => `(${p.gridX || 'N/A'},${p.gridY || 'N/A'})`));
            
            // Validate the path by checking each waypoint
            console.log("=== PATH VALIDATION ===");
            for (let i = 0; i < path.length; i++) {
                const waypoint = path[i];
                const gridPos = worldToGrid(waypoint.x, waypoint.y);
                const isSolid = this.isSolid(gridPos, entitySize);
                console.log(`Waypoint ${i}: world(${waypoint.x.toFixed(1)},${waypoint.y.toFixed(1)}) grid(${gridPos.x},${gridPos.y}) ${isSolid ? 'SOLID!' : 'free'}`);
                
                // Check path between waypoints
                if (i > 0) {
                    const prevWaypoint = path[i-1];
                    const prevGrid = worldToGrid(prevWaypoint.x, prevWaypoint.y);
                    const currentGrid = gridPos;
                    
                    console.log(`=== CHECKING PATH FROM WAYPOINT ${i-1} TO ${i} ===`);
                    const pathClear = this.validatePathBetweenWaypoints(prevGrid, currentGrid, entitySize);
                    console.log(`Path from (${prevGrid.x},${prevGrid.y}) to (${currentGrid.x},${currentGrid.y}): ${pathClear ? 'CLEAR' : 'BLOCKED!'}`);
                }
            }
        } else if (this.enableDebugLogging) {
            console.log(`A* failed to find path (entity size: ${entitySize.width}x${entitySize.height})`);
        }
        
        return path;
    }
    
    /**
     * Simplified A* that focuses on reachability rather than precise physics
     */
    simpleAStar(startGrid, goalGrid, entityType, entitySize) {
        const openSet = [startGrid];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        const startKey = this.getGridKey(startGrid);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startGrid, goalGrid));
        
        let iterations = 0;
        
        while (openSet.length > 0 && iterations < this.maxIterations) {
            iterations++;
            
            // Find lowest fScore
            let current = openSet.reduce((min, node) => {
                const nodeKey = this.getGridKey(node);
                const minKey = this.getGridKey(min);
                return fScore.get(nodeKey) < fScore.get(minKey) ? node : min;
            });
            
            // Remove current from openSet
            const currentIndex = openSet.findIndex(node => 
                node.x === current.x && node.y === current.y
            );
            openSet.splice(currentIndex, 1);
            
            // Check if we reached the goal
            if (current.x === goalGrid.x && current.y === goalGrid.y) {
                return this.reconstructSimplePath(cameFrom, current);
            }
            
            // Get simple neighbors
            const neighbors = this.getSimpleNeighbors(current, entityType, entitySize);
            
            for (let neighbor of neighbors) {
                const currentKey = this.getGridKey(current);
                const neighborKey = this.getGridKey(neighbor);
                
                const moveCost = this.getSimpleMoveCost(current, neighbor);
                const tentativeGScore = gScore.get(currentKey) + moveCost;
                
                if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, goalGrid));
                    
                    if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        return null; // No path found
    }
    
    /**
     * Get simple neighbors using basic platformer movement rules
     */
    getSimpleNeighbors(gridPos, entityType, entitySize) {
        const neighbors = [];
        
        if (entityType === "flying") {
            // Flying entities: 8-directional movement
            const directions = [
                {x: -1, y: 0}, {x: 1, y: 0},   // Left, Right
                {x: 0, y: -1}, {x: 0, y: 1},   // Up, Down
                {x: -1, y: -1}, {x: 1, y: -1}, // Diagonal up
                {x: -1, y: 1}, {x: 1, y: 1}    // Diagonal down
            ];
            
            for (let dir of directions) {
                const neighbor = {x: gridPos.x + dir.x, y: gridPos.y + dir.y};
                if (this.isValidPosition(neighbor, entitySize)) {
                    neighbors.push(neighbor);
                }
            }
        } else {
            // Ground entities: Use simple platformer rules
            this.addSimpleGroundNeighbors(gridPos, neighbors, entitySize);
        }
        
        return neighbors;
    }
    
    /**
     * Add neighbors for ground entities using simple rules
     */
    addSimpleGroundNeighbors(gridPos, neighbors, entitySize) {
        // 1. Horizontal movement (left/right) - walk on same level
        const horizontalDirs = [{x: -1, y: 0}, {x: 1, y: 0}];
        
        for (let dir of horizontalDirs) {
            const neighbor = {x: gridPos.x + dir.x, y: gridPos.y};
            
            // Can walk if position is free and has ground support
            if (this.isValidPosition(neighbor, entitySize) && this.hasGroundSupport(neighbor, entitySize)) {
                neighbors.push(neighbor);
            }
            // Or can walk off edge and fall (let gravity handle it)
            else if (this.isValidPosition(neighbor, entitySize)) {
                // Find where we would land
                const landingY = this.findGroundLevel(neighbor, entitySize);
                if (landingY !== null && landingY - gridPos.y <= 4) { // Max 4 tile fall
                    // CRITICAL: Check if the path from current position to landing is clear
                    if (this.validatePathBetweenWaypoints(gridPos, {x: neighbor.x, y: landingY}, entitySize)) {
                        neighbors.push({x: neighbor.x, y: landingY});
                    }
                }
            }
            
            // Simple jumping: if blocked horizontally, try jumping up 1-3 tiles
            if (!this.isValidPosition(neighbor, entitySize) || !this.hasGroundSupport(neighbor, entitySize)) {
                for (let jumpHeight = 1; jumpHeight <= this.maxJumpHeight; jumpHeight++) {
                    const jumpPos = {x: gridPos.x + dir.x, y: gridPos.y - jumpHeight};
                    
                    if (this.isValidPosition(jumpPos, entitySize)) {
                        // Check if we can actually make this jump (simple check)
                        if (this.canJumpSimple(gridPos, jumpPos, entitySize)) {
                            // CRITICAL: Validate the jump path doesn't go through blocks
                            if (this.validatePathBetweenWaypoints(gridPos, jumpPos, entitySize)) {
                                neighbors.push(jumpPos);
                            }
                        }
                    }
                }
            }
        }
        
        // 2. Vertical movement - straight up jumps (only allow single-step jumps)
        for (let jumpHeight = 1; jumpHeight <= Math.min(2, this.maxJumpHeight); jumpHeight++) {
            const upPos = {x: gridPos.x, y: gridPos.y - jumpHeight};
            if (this.isValidPosition(upPos, entitySize)) {
                // CRITICAL: Check path is clear for vertical jumps too
                if (this.validatePathBetweenWaypoints(gridPos, upPos, entitySize)) {
                    neighbors.push(upPos);
                }
            }
        }
        
        // 3. Fall straight down (only allow single-step falls to prevent going through blocks)
        for (let fallDistance = 1; fallDistance <= 4; fallDistance++) {
            const fallPos = {x: gridPos.x, y: gridPos.y + fallDistance};
            if (this.isValidPosition(fallPos, entitySize) && this.hasGroundSupport(fallPos, entitySize)) {
                // CRITICAL: Check if fall path is clear
                if (this.validatePathBetweenWaypoints(gridPos, fallPos, entitySize)) {
                    neighbors.push(fallPos);
                    break; // Stop at first valid landing spot
                }
            }
        }
    }
    
    /**
     * Simple jump check - just verify path is mostly clear
     */
    canJumpSimple(from, to, entitySize = {width: 32, height: 32}) {
        const dx = Math.abs(to.x - from.x);
        const dy = from.y - to.y; // Positive if jumping up
        
        // Basic constraints
        if (dy > this.maxJumpHeight || dy < -4) return false; // Can't jump too high or fall too far
        if (dx > this.maxJumpDistance) return false; // Can't jump too far horizontally
        
        // Simple path check - just check a few points along the arc
        const steps = Math.max(dx, Math.abs(dy)) + 1;
        for (let i = 1; i < steps; i++) {
            const progress = i / steps;
            const checkX = Math.round(from.x + (to.x - from.x) * progress);
            const checkY = Math.round(from.y + (to.y - from.y) * progress);
            
            // Only check for major obstacles using the correct entity size
            if (this.isSolid({x: checkX, y: checkY}, entitySize)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if a position has ground support (simplified)
     */
    hasGroundSupport(gridPos, entitySize = {width: 32, height: 32}) {
        return this.isSolid({x: gridPos.x, y: gridPos.y + 1}, entitySize);
    }
    
    /**
     * Find ground level by falling down (simplified)
     */
    findGroundLevel(gridPos, entitySize, maxFall = 8) {
        for (let y = gridPos.y; y < gridPos.y + maxFall; y++) {
            const testPos = {x: gridPos.x, y: y};
            
            if (this.hasGroundSupport(testPos, entitySize) && this.isValidPosition(testPos, entitySize)) {
                return y;
            }
        }
        return null;
    }
    
    /**
     * Quick line-of-sight check for nearby targets
     */
    canReachDirect(start, goal, entityType, entitySize) {
        const startGrid = worldToGrid(start.x, start.y);
        const goalGrid = worldToGrid(goal.x, goal.y);
        
        // Only for close targets
        const dx = Math.abs(goalGrid.x - startGrid.x);
        const dy = Math.abs(goalGrid.y - startGrid.y);
        
        if (dx <= 2 && dy <= 2) {
            // Check if path is clear using the correct entity size
            return this.canJumpSimple(startGrid, goalGrid, entitySize);
        }
        
        return false;
    }
    
    /**
     * Simple movement cost
     */
    getSimpleMoveCost(from, to) {
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        
        // Jumping costs more than walking
        if (dy > 0) {
            return 1.0 + (dy * 1.5); // Jump penalty
        }
        
        // Falling is cheap
        if (dy < 0) {
            return 1.0 + (Math.abs(dy) * 0.5);
        }
        
        // Horizontal movement
        return dx > 0 ? 1.0 : 0.5;
    }
    
    /**
     * Check if a grid position is valid (not solid and within bounds)
     */
    isValidPosition(gridPos, entitySize) {
        // Check bounds
        if (gridPos.x < 0 || gridPos.y < 0 || gridPos.x > 100 || gridPos.y > 100) {
            return false;
        }
        
        return !this.isSolid(gridPos, entitySize);
    }
    
    /**
     * Check if a grid position contains a solid block (accounting for entity size)
     */
    isSolid(gridPos, entitySize = {width: 32, height: 32}) {
        const worldPos = gridToWorld(gridPos.x, gridPos.y);
        const tileSize = getTilePixelSize();
        
        // Check multiple positions within the tile to be more thorough
        // Test center position
        const centerX = worldPos.x + tileSize / 2 - entitySize.width / 2;
        const centerY = worldPos.y + tileSize / 2 - entitySize.height / 2;
        
        const centerFree = this.gameEngine.collisionManager.isPositionFree(
            centerX, 
            centerY, 
            entitySize.width, 
            entitySize.height
        );
        
        if (this.debugCollisionChecks) {
            console.log(`A* checking grid(${gridPos.x},${gridPos.y}) -> world(${worldPos.x},${worldPos.y}) -> center(${centerX.toFixed(1)},${centerY.toFixed(1)}) size(${entitySize.width}x${entitySize.height}) = ${centerFree ? 'FREE' : 'BLOCKED'}`);
        }
        
        if (!centerFree) {
            return true; // Solid if center position is blocked
        }
        
        // For larger entities, also check corners to be extra safe
        if (entitySize.width > 32 || entitySize.height > 32) {
            // Check top-left corner
            const tlFree = this.gameEngine.collisionManager.isPositionFree(
                worldPos.x, 
                worldPos.y, 
                entitySize.width, 
                entitySize.height
            );
            
            if (this.debugCollisionChecks) {
                console.log(`A* corner check grid(${gridPos.x},${gridPos.y}) -> topLeft(${worldPos.x},${worldPos.y}) = ${tlFree ? 'FREE' : 'BLOCKED'}`);
            }
            
            if (!tlFree) {
                return true;
            }
        }
        
        return false; // Not solid
    }
    
    /**
     * Manhattan distance heuristic
     */
    heuristic(from, to) {
        return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
    }
    
    /**
     * Generate a unique key for a grid position
     */
    getGridKey(gridPos) {
        return `${gridPos.x},${gridPos.y}`;
    }
    
    /**
     * Reconstruct path from A* result with simplified waypoints
     */
    reconstructSimplePath(cameFrom, current) {
        const gridPath = [current];
        
        let previous = cameFrom.get(this.getGridKey(current));
        while (previous) {
            gridPath.unshift(previous);
            previous = cameFrom.get(this.getGridKey(previous));
        }
        
        // Convert to world coordinates with center positioning
        const path = [];
        for (let gridPos of gridPath) {
            const worldPos = gridToWorld(gridPos.x, gridPos.y);
            const tileSize = getTilePixelSize();
            
            path.push({
                x: worldPos.x + tileSize / 2,
                y: worldPos.y + tileSize / 2,
                gridX: gridPos.x,
                gridY: gridPos.y
            });
        }
        
        return path;
    }
    
    /**
     * Enable or disable debug logging
     */
    setDebugLogging(enabled) {
        this.enableDebugLogging = enabled;
    }
    
    /**
     * Enable or disable collision debugging
     */
    setCollisionDebugging(enabled) {
        this.debugCollisionChecks = enabled;
    }
    
    /**
     * Validate that the path between two waypoints is clear
     */
    validatePathBetweenWaypoints(fromGrid, toGrid, entitySize) {
        const dx = Math.abs(toGrid.x - fromGrid.x);
        const dy = Math.abs(toGrid.y - fromGrid.y);
        
        // If it's just a single step, we already validated the destination
        if (dx <= 1 && dy <= 1) {
            return true;
        }
        
        // For longer paths, check intermediate positions
        const steps = Math.max(dx, dy);
        for (let i = 1; i < steps; i++) {
            const progress = i / steps;
            const checkX = Math.round(fromGrid.x + (toGrid.x - fromGrid.x) * progress);
            const checkY = Math.round(fromGrid.y + (toGrid.y - fromGrid.y) * progress);
            
            const checkPos = {x: checkX, y: checkY};
            if (this.isSolid(checkPos, entitySize)) {
                console.log(`  Intermediate position (${checkX},${checkY}) is BLOCKED!`);
                return false;
            } else {
                console.log(`  Intermediate position (${checkX},${checkY}) is clear`);
            }
        }
        
        return true;
    }
}
