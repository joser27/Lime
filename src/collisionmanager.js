class CollisionManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }

    /**
     * Check if two bounding boxes intersect
     * @param {BoundingBox} box1 First bounding box
     * @param {BoundingBox} box2 Second bounding box
     * @returns {Boolean} True if boxes overlap
     */
    checkBoxCollision(box1, box2) {
        return box1.x < box2.x + box2.width &&
               box1.x + box1.width > box2.x &&
               box1.y < box2.y + box2.height &&
               box1.y + box1.height > box2.y;
    }

    /**
     * Check if an entity would collide with any blocks at a given position
     * @param {Object} entity The entity to check (must have width/height)
     * @param {Number} newX New X position to test
     * @param {Number} newY New Y position to test
     * @param {Array} excludeTypes Optional array of entity types to exclude from collision
     * @returns {Object|null} The colliding entity or null if no collision
     */
    checkEntityCollision(entity, newX, newY, excludeTypes = []) {
        // Create a temporary bounding box at the new position
        const testBox = new BoundingBox(newX, newY, entity.width, entity.height);
        
        // Check against all entities in the game
        for (let otherEntity of this.gameEngine.entities) {
            // Skip self
            if (otherEntity === entity) continue;
            
            // Skip excluded types
            if (excludeTypes.some(type => otherEntity instanceof type)) continue;
            
            // Skip entities without bounding boxes or that aren't solid
            if (!otherEntity.boundingBox || !otherEntity.isSolid) continue;
            
            // Check collision
            if (this.checkBoxCollision(testBox, otherEntity.boundingBox)) {
                return otherEntity;
            }
        }
        
        return null;
    }

    /**
     * Check collision specifically with Block entities
     * @param {Object} entity The entity to check
     * @param {Number} newX New X position to test
     * @param {Number} newY New Y position to test
     * @returns {Block|null} The colliding block or null
     */
    checkBlockCollision(entity, newX, newY) {
        const testBox = new BoundingBox(newX, newY, entity.width, entity.height);
        
        for (let otherEntity of this.gameEngine.entities) {
            // Check if it's a block and is solid
            if (otherEntity instanceof Block && otherEntity.isSolid) {
                if (this.checkBoxCollision(testBox, otherEntity.boundingBox)) {
                    return otherEntity;
                }
            }
        }
        
        return null;
    }

    /**
     * Handle player movement with collision detection
     * @param {Player} player The player entity
     * @param {Number} deltaX Movement on X axis
     * @param {Number} deltaY Movement on Y axis
     * @returns {Object} Final position after collision handling {x, y}
     */
    handlePlayerMovement(player, deltaX, deltaY) {
        let finalX = player.x;
        let finalY = player.y;

        // Check horizontal movement first
        if (deltaX !== 0) {
            const newX = player.x + deltaX;
            const blockCollision = this.checkBlockCollision(player, newX, player.y);
            
            if (!blockCollision) {
                finalX = newX;
            } else {
                // Handle collision response (could trigger block behavior)
                if (blockCollision.onPlayerCollision) {
                    blockCollision.onPlayerCollision(player);
                }
            }
        }

        // Check vertical movement second (using final X position)
        if (deltaY !== 0) {
            const newY = player.y + deltaY;
            const blockCollision = this.checkBlockCollision(player, finalX, newY);
            
            if (!blockCollision) {
                finalY = newY;
            } else {
                // Handle collision response
                if (blockCollision.onPlayerCollision) {
                    blockCollision.onPlayerCollision(player);
                }
                
                // Handle different types of vertical collisions
                if (deltaY > 0) { // Moving down (falling) - hit ground
                    player.velocity = 0;
                    player.isJumping = false;
                } else if (deltaY < 0) { // Moving up (jumping) - hit ceiling
                    player.velocity = 0; // Stop upward movement immediately
                }
            }
        }

        return { x: finalX, y: finalY };
    }

    /**
     * Get all entities of a specific type within a radius
     * @param {Number} centerX Center X position
     * @param {Number} centerY Center Y position
     * @param {Number} radius Search radius
     * @param {Class} entityType Type of entity to find
     * @returns {Array} Array of entities within radius
     */
    getEntitiesInRadius(centerX, centerY, radius, entityType) {
        const entities = [];
        
        for (let entity of this.gameEngine.entities) {
            if (entity instanceof entityType && entity.boundingBox) {
                const entityCenterX = entity.boundingBox.x + entity.boundingBox.width / 2;
                const entityCenterY = entity.boundingBox.y + entity.boundingBox.height / 2;
                
                const distance = getDistance(
                    { x: centerX, y: centerY },
                    { x: entityCenterX, y: entityCenterY }
                );
                
                if (distance <= radius) {
                    entities.push(entity);
                }
            }
        }
        
        return entities;
    }

    /**
     * Check if a position is free of solid blocks
     * @param {Number} x X position
     * @param {Number} y Y position
     * @param {Number} width Width of area to check
     * @param {Number} height Height of area to check
     * @returns {Boolean} True if position is free
     */
    isPositionFree(x, y, width, height) {
        const testBox = new BoundingBox(x, y, width, height);
        
        for (let entity of this.gameEngine.entities) {
            if (entity instanceof Block && entity.isSolid) {
                if (this.checkBoxCollision(testBox, entity.boundingBox)) {
                    return false;
                }
            }
        }
        
        return true;
    }
} 