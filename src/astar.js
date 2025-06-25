class AStar {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.maxIterations = 500; // Reduced from 1000 for better performance
        this.jumpHeight = 3; // Maximum blocks a ground entity can jump up
        this.enableDebugLogging = false; // Control debug logging performance impact
    }

    /**
     * Find a path from start to goal
     * @param {Object} start World coordinates {x, y}
     * @param {Object} goal World coordinates {x, y}
     * @param {String} entityType "ground" or "flying"
     * @param {Object} entitySize {width, height} in world pixels
     * @returns {Array} Array of world coordinate waypoints or null if no path
     */
    findPath(start, goal, entityType = "ground", entitySize = {width: 32, height: 32}) {
        // OPTIMIZATION: Only validate block visibility in debug mode
        if (params.debug && this.enableDebugLogging && !this.validateBlockVisibility()) {
            console.warn("A* Warning: No blocks detected, pathfinding may be inaccurate");
            return null;
        }
        
        // Convert world coordinates to grid coordinates
        const startGrid = worldToGrid(start.x, start.y);
        const goalGrid = worldToGrid(goal.x, goal.y);
        
        // Check if start and goal are valid
        if (!this.isValidPosition(startGrid, entitySize) || !this.isValidPosition(goalGrid, entitySize)) {
            return null;
        }
        
        // A* algorithm
        const openSet = [startGrid];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        // Initialize scores
        const startKey = this.getGridKey(startGrid);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startGrid, goalGrid));
        
        let iterations = 0;
        
        while (openSet.length > 0 && iterations < this.maxIterations) {
            iterations++;
            
            // Find node with lowest fScore
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
                return this.reconstructPath(cameFrom, current);
            }
            
            // Get neighbors based on entity type
            const neighbors = this.getNeighbors(current, entityType, entitySize);
            
            for (let neighbor of neighbors) {
                const currentKey = this.getGridKey(current);
                const neighborKey = this.getGridKey(neighbor);
                
                const tentativeGScore = gScore.get(currentKey) + this.getMoveCost(current, neighbor, entityType);
                
                if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, goalGrid));
                    
                    // Add to openSet if not already there
                    if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        // No path found
        return null;
    }
    
    /**
     * Validate that A* can see blocks in the game world
     * @returns {Boolean} True if blocks are detected
     */
    validateBlockVisibility() {
        let blockCount = 0;
        for (let entity of this.gameEngine.entities) {
            if (entity instanceof Block && entity.isSolid) {
                blockCount++;
                // Early exit optimization - we only need to know if blocks exist
                if (blockCount > 0) break;
            }
        }
        
        if (params.debug && blockCount === 0) {
            console.warn("A* Warning: No solid blocks found in game entities");
        }
        
        return blockCount > 0;
    }
    
    /**
     * Enable or disable debug logging for performance
     * @param {Boolean} enabled Whether to enable debug logging
     */
    setDebugLogging(enabled) {
        this.enableDebugLogging = enabled;
    }
    
    /**
     * Get valid neighbors for a position based on entity type
     * @param {Object} gridPos Grid coordinates {x, y}
     * @param {String} entityType "ground" or "flying"
     * @param {Object} entitySize {width, height} in world pixels
     * @returns {Array} Array of valid neighbor grid positions
     */
    getNeighbors(gridPos, entityType, entitySize) {
        const neighbors = [];
        
        if (entityType === "flying") {
            // Flying entities can move in 8 directions
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
        } else if (entityType === "ground") {
            // Ground entities need to consider gravity and jumping
            this.addGroundNeighbors(gridPos, neighbors, entitySize);
        }
        
        return neighbors;
    }
    
    /**
     * Add valid neighbors for ground entities (considering gravity and jumping)
     * @param {Object} gridPos Current grid position
     * @param {Array} neighbors Array to add valid neighbors to
     * @param {Object} entitySize Entity size in world pixels
     */
    addGroundNeighbors(gridPos, neighbors, entitySize) {
        // Horizontal movement (left and right) - stay on same level if possible
        const horizontalDirs = [{x: -1, y: 0}, {x: 1, y: 0}];
        
        for (let dir of horizontalDirs) {
            const neighbor = {x: gridPos.x + dir.x, y: gridPos.y};
            
            // First try to stay at the same level
            if (this.isValidPosition(neighbor, entitySize) && this.hasGroundSupport(neighbor)) {
                neighbors.push(neighbor);
            } else {
                // If can't stay at same level, find where entity would land due to gravity
                const groundSupport = this.findGroundLevel(neighbor, entitySize);
                if (groundSupport !== null && this.isValidPosition({x: neighbor.x, y: groundSupport}, entitySize)) {
                    // IMPROVED: Only add falling positions if they're not too far down
                    // This prevents corner cutting through large vertical gaps
                    const fallDistance = groundSupport - gridPos.y;
                    if (fallDistance <= 3) { // Max 3 tiles fall distance for smooth paths
                        neighbors.push({x: neighbor.x, y: groundSupport});
                    }
                }
            }
        }
        
        // Conservative jumping (prioritize simple movements)
        for (let jumpHeight = 1; jumpHeight <= Math.min(this.jumpHeight, 2); jumpHeight++) { // Limit to 2 tiles max
            // Straight up jump (more predictable)
            const jumpPos = {x: gridPos.x, y: gridPos.y - jumpHeight};
            if (this.isValidPosition(jumpPos, entitySize) && this.canJumpTo(gridPos, jumpPos, entitySize)) {
                neighbors.push(jumpPos);
            }
            
            // IMPROVED: More conservative horizontal jumps
            for (let dir of horizontalDirs) {
                const horizontalJumpPos = {x: gridPos.x + dir.x, y: gridPos.y - jumpHeight};
                
                if (this.isValidPosition(horizontalJumpPos, entitySize) && 
                    this.canJumpTo(gridPos, horizontalJumpPos, entitySize)) {
                    
                    // More strict obstacle checking to prevent corner cutting
                    const obstaclePos = {x: gridPos.x + dir.x, y: gridPos.y};
                    const aboveObstaclePos = {x: gridPos.x + dir.x, y: gridPos.y - 1};
                    
                    // Only add horizontal jump if there's a clear obstacle to jump over
                    if (this.isSolid(obstaclePos) && !this.isSolid(aboveObstaclePos)) {
                        neighbors.push(horizontalJumpPos);
                    }
                }
            }
        }
    }
    
    /**
     * Check if a position has ground support (solid block below it)
     * @param {Object} gridPos Grid position to check
     * @returns {Boolean} True if there's solid ground below this position
     */
    hasGroundSupport(gridPos) {
        const groundPos = {x: gridPos.x, y: gridPos.y + 1};
        return this.isSolid(groundPos);
    }
    
    /**
     * Find the ground level for a given x position (where entity would land due to gravity)
     * @param {Object} gridPos Grid position to check
     * @param {Object} entitySize Entity size in world pixels
     * @returns {Number|null} Y grid coordinate of ground level, or null if no ground
     */
    findGroundLevel(gridPos, entitySize, maxFallDistance = 10) {
        for (let y = gridPos.y; y < gridPos.y + maxFallDistance; y++) {
            const testPos = {x: gridPos.x, y: y};
            
            // Check if this position has ground support
            if (this.hasGroundSupport(testPos)) {
                if (this.isValidPosition(testPos, entitySize)) {
                    return y;
                }
            }
        }
        return null;
    }
    
    /**
     * Check if entity can jump from current position to target position
     * @param {Object} from Grid position
     * @param {Object} to Grid position
     * @param {Object} entitySize Entity size
     * @returns {Boolean} True if jump is possible
     */
    canJumpTo(from, to, entitySize) {
        const dx = Math.abs(to.x - from.x);
        const dy = from.y - to.y; // Positive if jumping up
        
        // Simple jump physics check
        if (dy > this.jumpHeight || dy < 0) return false;
        if (dx > this.jumpHeight) return false; // Can't jump too far horizontally
        
        // For horizontal movement at same level, ensure path is clear
        if (dy === 0) {
            const direction = to.x > from.x ? 1 : -1;
            for (let x = from.x + direction; x !== to.x + direction; x += direction) {
                if (this.isSolid({x: x, y: from.y})) {
                    return false; // Blocked horizontally
                }
            }
            return true;
        }
        
        // For actual jumps, check if the jump arc is clear with stricter validation
        const steps = Math.max(dx, Math.abs(dy)) * 3; // Even more granular checking
        for (let i = 1; i <= steps; i++) {
            const progress = i / steps;
            const checkX = Math.round(from.x + (to.x - from.x) * progress);
            const checkY = Math.round(from.y + (to.y - from.y) * progress);
            const checkPos = {x: checkX, y: checkY};
            
            if (this.isSolid(checkPos)) {
                return false; // Obstacle in the way
            }
        }
        
        // Additional check: ensure we're not cutting corners on diagonal jumps
        if (dx > 0 && dy > 0) {
            // Check that the positions adjacent to the jump path are also clear
            const direction = to.x > from.x ? 1 : -1;
            const midX = from.x + direction;
            const midY = from.y;
            
            // Check the intermediate horizontal position
            if (this.isSolid({x: midX, y: midY})) {
                return false; // Would cut through corner
            }
        }
        
        return true;
    }
    
    /**
     * Check if a grid position is valid (not solid and within bounds)
     * @param {Object} gridPos Grid coordinates {x, y}
     * @param {Object} entitySize Entity size in world pixels
     * @returns {Boolean} True if position is valid
     */
    isValidPosition(gridPos, entitySize) {
        // Check bounds (you might want to adjust these based on your level size)
        if (gridPos.x < 0 || gridPos.y < 0 || gridPos.x > 100 || gridPos.y > 100) {
            return false;
        }
        
        // Check if position is solid
        return !this.isSolid(gridPos);
    }
    
    /**
     * Check if a grid position contains a solid block
     * @param {Object} gridPos Grid coordinates {x, y}
     * @returns {Boolean} True if position is solid
     */
    isSolid(gridPos) {
        // Convert grid to world coordinates
        const worldPos = gridToWorld(gridPos.x, gridPos.y);
        const tileSize = getTilePixelSize();
        
        // Debug: Count total blocks in the world for validation
        if (this.debugLogging) {
            const totalBlocks = this.gameEngine.entities.filter(entity => entity instanceof Block).length;
            const solidBlocks = this.gameEngine.entities.filter(entity => entity instanceof Block && entity.isSolid).length;
            console.log(`A* isSolid check - Total blocks: ${totalBlocks}, Solid blocks: ${solidBlocks}, Checking pos: (${gridPos.x}, ${gridPos.y}) -> world: (${worldPos.x}, ${worldPos.y})`);
        }
        
        // Check if this position collides with any solid blocks
        // Use full tile size to ensure accurate block detection
        const isFree = this.gameEngine.collisionManager.isPositionFree(
            worldPos.x, 
            worldPos.y, 
            tileSize, 
            tileSize
        );
        
        return !isFree;
    }
    
    /**
     * Calculate movement cost between two adjacent grid positions
     * @param {Object} from Grid position
     * @param {Object} to Grid position
     * @param {String} entityType Entity type
     * @returns {Number} Movement cost
     */
    getMoveCost(from, to, entityType) {
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        
        if (entityType === "flying") {
            // Diagonal movement costs more
            return (dx === 1 && dy === 1) ? 1.4 : 1.0;
        } else if (entityType === "ground") {
            // Jumping costs more than horizontal movement
            if (dy > 0) {
                return 1.0 + (dy * 2); // Jumping penalty
            }
            return dx === 1 && dy === 1 ? 1.4 : 1.0;
        }
        
        return 1.0;
    }
    
    /**
     * Heuristic function (Manhattan distance for ground, Euclidean for flying)
     * @param {Object} from Grid position
     * @param {Object} to Grid position
     * @returns {Number} Heuristic cost
     */
    heuristic(from, to) {
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        
        // Use Manhattan distance as it works well for platformers
        return dx + dy;
    }
    
    /**
     * Reconstruct path from A* result
     * @param {Map} cameFrom Map of previous positions
     * @param {Object} current Final grid position
     * @returns {Array} Array of world coordinate waypoints
     */
    reconstructPath(cameFrom, current) {
        const gridPath = [current];
        
        const currentKey = this.getGridKey(current);
        let previous = cameFrom.get(currentKey);
        
        while (previous) {
            gridPath.unshift(previous);
            const previousKey = this.getGridKey(previous);
            previous = cameFrom.get(previousKey);
        }
        
        // Simplify path to remove unnecessary waypoints
        const simplifiedGridPath = this.simplifyGridPath(gridPath);
        
        // Convert grid path to world coordinates with proper positioning
        const path = [];
        for (let i = 0; i < simplifiedGridPath.length; i++) {
            const gridPos = simplifiedGridPath[i];
            const worldPos = gridToWorld(gridPos.x, gridPos.y);
            const tileSize = getTilePixelSize();
            
            // Position waypoints at the center of tiles for natural movement
            path.push({
                x: worldPos.x + tileSize / 2,
                y: worldPos.y + tileSize / 2, // Center of the tile
                gridX: gridPos.x,
                gridY: gridPos.y
            });
        }
        
        return path;
    }
    
    /**
     * Simplify grid path by removing unnecessary intermediate waypoints
     * @param {Array} gridPath Array of grid positions
     * @returns {Array} Simplified grid path
     */
    simplifyGridPath(gridPath) {
        if (gridPath.length <= 2) return gridPath;
        
        const simplified = [gridPath[0]];
        
        for (let i = 1; i < gridPath.length - 1; i++) {
            const prev = gridPath[i - 1];
            const curr = gridPath[i];
            const next = gridPath[i + 1];
            
            // IMPROVED: More conservative simplification to prevent corner cutting
            
            // Always keep waypoints that involve vertical movement (jumps/falls)
            if (Math.abs(curr.y - prev.y) > 0 || Math.abs(next.y - curr.y) > 0) {
                simplified.push(curr);
                continue;
            }
            
            // Always keep waypoints that change direction significantly
            const prevDirection = {x: curr.x - prev.x, y: curr.y - prev.y};
            const nextDirection = {x: next.x - curr.x, y: next.y - curr.y};
            
            // If direction changes, keep the waypoint
            if (prevDirection.x !== nextDirection.x || prevDirection.y !== nextDirection.y) {
                simplified.push(curr);
                continue;
            }
            
            // For straight horizontal movement, be more conservative about skipping waypoints
            if (!this.canTraverseDirect(prev, next)) {
                simplified.push(curr); // Keep waypoint if direct path is blocked
            } else {
                // Even if direct traversal is possible, keep waypoints every few tiles
                // to prevent long straight paths that might cut corners
                const distanceFromLast = Math.abs(curr.x - simplified[simplified.length - 1].x);
                if (distanceFromLast >= 3) { // Keep waypoint every 3 tiles
                    simplified.push(curr);
                }
            }
        }
        
        simplified.push(gridPath[gridPath.length - 1]);
        return simplified;
    }
    
    /**
     * Check if entity can traverse directly between two grid positions
     * @param {Object} from Grid position
     * @param {Object} to Grid position
     * @returns {Boolean} True if direct traversal is possible
     */
    canTraverseDirect(from, to) {
        // Only allow direct traversal for horizontal movement at same level
        if (from.y !== to.y) return false;
        
        const direction = to.x > from.x ? 1 : -1;
        
        // Check each position between from and to
        for (let x = from.x + direction; x !== to.x; x += direction) {
            const checkPos = {x: x, y: from.y};
            
            // If any position is solid, can't traverse directly
            if (this.isSolid(checkPos)) {
                return false;
            }
            
            // Also check if there's ground support
            if (!this.hasGroundSupport(checkPos)) {
                return false; // Would fall, need intermediate waypoint
            }
        }
        
        return true;
    }
    
    /**
     * Generate a unique key for a grid position
     * @param {Object} gridPos Grid coordinates {x, y}
     * @returns {String} Unique key
     */
    getGridKey(gridPos) {
        return `${gridPos.x},${gridPos.y}`;
    }
    
    /**
     * Simplify path by removing unnecessary waypoints
     * @param {Array} path Array of world coordinate waypoints
     * @param {String} entityType Entity type
     * @param {Object} entitySize Entity size
     * @returns {Array} Simplified path
     */
    simplifyPath(path, entityType, entitySize) {
        if (path.length <= 2) return path;
        
        const simplified = [path[0]];
        
        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const curr = path[i];
            const next = path[i + 1];
            
            // Check if we can go directly from prev to next
            if (!this.canMoveDirect(prev, next, entityType, entitySize)) {
                simplified.push(curr);
            }
        }
        
        simplified.push(path[path.length - 1]);
        return simplified;
    }
    
    /**
     * Check if entity can move directly between two world positions
     * @param {Object} from World position
     * @param {Object} to World position
     * @param {String} entityType Entity type
     * @param {Object} entitySize Entity size
     * @returns {Boolean} True if direct movement is possible
     */
    canMoveDirect(from, to, entityType, entitySize) {
        const fromGrid = worldToGrid(from.x, from.y);
        const toGrid = worldToGrid(to.x, to.y);
        
        // For flying entities, check if path is clear
        if (entityType === "flying") {
            const steps = Math.max(Math.abs(toGrid.x - fromGrid.x), Math.abs(toGrid.y - fromGrid.y));
            
            for (let i = 1; i < steps; i++) {
                const checkX = Math.round(fromGrid.x + (toGrid.x - fromGrid.x) * (i / steps));
                const checkY = Math.round(fromGrid.y + (toGrid.y - fromGrid.y) * (i / steps));
                
                if (this.isSolid({x: checkX, y: checkY})) {
                    return false;
                }
            }
            return true;
        }
        
        // For ground entities, more complex check needed
        return false; // Conservative approach for ground entities
    }
}
