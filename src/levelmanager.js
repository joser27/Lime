class LevelManager {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        
        // Grid settings
        this.tileSize = params.tileSize;
        this.scale = params.scale;
        this.gridWidth = Math.ceil(this.gameEngine.ctx.canvas.width / (this.tileSize * this.scale));
        this.gridHeight = Math.ceil(this.gameEngine.ctx.canvas.height / (this.tileSize * this.scale));
        
        // No offset - grid represents actual world coordinates
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Tiled map data
        this.mapData = null; // Will store the loaded .tmj data
        this.tilesetData = null; // Will store the loaded .tsx data
        this.tilesetImage = null; // Will store the tileset image
        this.blocks = []; // Array to store generated Block entities
        
        // Map loading state
        this.isMapLoaded = false;
    }

    // Load a Tiled map and tileset
    loadTiledMap(mapPath, tilesetImagePath) {
        console.log("Loading Tiled map:", mapPath);
        console.log("Loading tileset image:", tilesetImagePath);
        
        // Debug: List all available assets
        console.log("Available assets:", Object.keys(ASSET_MANAGER.cache));
        console.log("Total assets loaded:", Object.keys(ASSET_MANAGER.cache).length);
        console.log("AssetManager success count:", ASSET_MANAGER.successCount);
        console.log("AssetManager error count:", ASSET_MANAGER.errorCount);
        
        try {
            // Load map data
            this.mapData = ASSET_MANAGER.getAsset(mapPath);
            console.log("Map data loaded:", this.mapData ? "SUCCESS" : "FAILED");
            if (this.mapData) {
                console.log("Map dimensions:", this.mapData.width, "x", this.mapData.height);
                console.log("Map layers:", this.mapData.layers ? this.mapData.layers.length : "No layers");
                console.log("Map tilesets:", this.mapData.tilesets);
            }
            
            // Get tileset path from map data
            let tilesetPath = null;
            if (this.mapData && this.mapData.tilesets && this.mapData.tilesets.length > 0) {
                const tilesetRef = this.mapData.tilesets[0]; // Use first tileset
                console.log("Tileset reference from map:", tilesetRef);
                
                if (tilesetRef.source) {
                    // External tileset - construct full path
                    const mapDir = mapPath.substring(0, mapPath.lastIndexOf('/') + 1);
                    tilesetPath = mapDir + tilesetRef.source;
                    console.log("External tileset detected:", tilesetRef.source);
                    console.log("Map directory:", mapDir);
                    console.log("Resolved tileset path:", tilesetPath);
                    
                    // Check if this path exists in the asset cache
                    const availableAssets = Object.keys(ASSET_MANAGER.cache);
                    console.log("Looking for tileset path in cache:", tilesetPath);
                    console.log("Available assets containing 'tsx':", availableAssets.filter(path => path.includes('tsx')));
                    console.log("Available assets containing 'Swamp':", availableAssets.filter(path => path.includes('Swamp')));
                } else {
                    // Embedded tileset
                    this.tilesetData = tilesetRef;
                    console.log("Embedded tileset detected");
                }
            } else {
                console.error("No tilesets found in map data");
            }
            
            // Load external tileset if needed
            if (tilesetPath) {
                this.tilesetData = ASSET_MANAGER.getAsset(tilesetPath);
                console.log("External tileset data loaded:", this.tilesetData ? "SUCCESS" : "FAILED");
            }
            
            if (this.tilesetData) {
                console.log("Tileset properties:", {
                    tilewidth: this.tilesetData.tilewidth,
                    tileheight: this.tilesetData.tileheight,
                    imagewidth: this.tilesetData.imagewidth,
                    imageheight: this.tilesetData.imageheight,
                    firstgid: this.mapData.tilesets[0].firstgid // firstgid is in the map, not the tileset
                });
                
                // Store firstgid from map data
                this.tilesetData.firstgid = this.mapData.tilesets[0].firstgid;
            }
            
            // Load tileset image
            this.tilesetImage = ASSET_MANAGER.getAsset(tilesetImagePath);
            console.log("Tileset image loaded:", this.tilesetImage ? "SUCCESS" : "FAILED");
            if (this.tilesetImage) {
                console.log("Image dimensions:", this.tilesetImage.width, "x", this.tilesetImage.height);
            }
            
            if (this.mapData && this.tilesetData && this.tilesetImage) {
                this.generateBlocks();
                this.isMapLoaded = true;
                console.log("Tiled map successfully loaded and converted to blocks");
            } else {
                console.error("Failed to load all required assets for Tiled map");
                console.error("Map data:", this.mapData ? "OK" : "MISSING");
                console.error("Tileset data:", this.tilesetData ? "OK" : "MISSING");
                console.error("Tileset image:", this.tilesetImage ? "OK" : "MISSING");
            }
        } catch (error) {
            console.error("Error loading Tiled map:", error);
        }
    }

    // Convert Tiled map data to Block entities
    generateBlocks() {
        if (!this.mapData || !this.tilesetData) {
            console.error("Cannot generate blocks: map data or tileset data missing");
            return;
        }

        // Clear existing blocks
        this.blocks = [];
        
        // Process each layer in the map
        this.mapData.layers.forEach((layer, layerIndex) => {
            if (layer.type === "tilelayer" && layer.data) {
                console.log(`Processing layer ${layerIndex}: ${layer.name}`);
                this.processLayer(layer, layerIndex);
            }
        });
        
        console.log(`Generated ${this.blocks.length} blocks from Tiled map`);
        
        // Add blocks to the game engine
        this.blocks.forEach(block => {
            this.gameEngine.addEntity(block);
        });
    }

    // Process a single tile layer
    processLayer(layer, layerIndex) {
        const mapWidth = this.mapData.width;
        const mapHeight = this.mapData.height;
        
        console.log(`Processing layer "${layer.name}" (${mapWidth}x${mapHeight})`);
        
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const tileIndex = y * mapWidth + x;
                const gid = layer.data[tileIndex]; // Global tile ID
                
                if (gid > 0) { // 0 means empty tile
                    // Convert GID to local tile ID (subtract first GID of tileset)
                    const firstGid = this.tilesetData.firstgid || 1; // Default to 1 if not specified
                    const localTileId = gid - firstGid;
                    
                    // Calculate world position
                    const worldX = x * this.tileSize * this.scale;
                    const worldY = y * this.tileSize * this.scale;
                    
                    // Create block with tileset information
                    const block = this.createBlockFromTile(worldX, worldY, localTileId, layerIndex);
                    if (block) {
                        this.blocks.push(block);
                    }
                }
            }
        }
        
        console.log(`Layer "${layer.name}" generated ${this.blocks.length} total blocks so far`);
    }

    // Create a Block entity from tile data
    createBlockFromTile(worldX, worldY, tileId, layerIndex) {
        try {
            // Calculate tile position in tileset
            const tilesPerRow = Math.floor(this.tilesetData.imagewidth / this.tilesetData.tilewidth);
            const tileX = (tileId % tilesPerRow) * this.tilesetData.tilewidth;
            const tileY = Math.floor(tileId / tilesPerRow) * this.tilesetData.tileheight;
            
            // Create a TiledBlock with the tileset sprite information
            const block = new TiledBlock(
                this.gameEngine,
                this.sceneManager,
                worldX,
                worldY,
                this.tilesetImage, // Use tileset image
                tileX, // Source X in tileset
                tileY, // Source Y in tileset
                this.tilesetData.tilewidth, // Source width
                this.tilesetData.tileheight, // Source height
                layerIndex // Layer depth for rendering order
            );
            
            // Apply tile properties if they exist
            if (this.tilesetData.tiles && this.tilesetData.tiles[tileId]) {
                const tileProperties = this.tilesetData.tiles[tileId].properties;
                block.setTileProperties(tileProperties);
            }
            
            return block;
        } catch (error) {
            console.error("Error creating block from tile:", error);
            return null;
        }
    }

    // Get all blocks (useful for other systems)
    getBlocks() {
        return this.blocks;
    }

    // Clear all blocks from the level
    clearBlocks() {
        this.blocks.forEach(block => {
            block.removeFromWorld = true;
        });
        this.blocks = [];
        this.isMapLoaded = false;
    }

    // Output collision map data for debugging
    outputCollisionMap() {
        if (!this.isMapLoaded) {
            console.log("No map loaded - cannot output collision data");
            return null;
        }

        console.log("=== COLLISION MAP DATA ===");
        console.log(`Map dimensions: ${this.mapData.width}x${this.mapData.height} tiles`);
        console.log(`Tile size: ${this.tileSize}x${this.tileSize} pixels`);
        console.log(`Scale: ${this.scale}x`);
        console.log(`World tile size: ${this.tileSize * this.scale}x${this.tileSize * this.scale} pixels`);
        console.log(`Total blocks created: ${this.blocks.length}`);

        // Create a 2D array representing the collision map
        const collisionMap = [];
        for (let y = 0; y < this.mapData.height; y++) {
            collisionMap[y] = new Array(this.mapData.width).fill(0);
        }

        // Fill the collision map with block data
        let solidBlockCount = 0;
        this.blocks.forEach(block => {
            const gridPos = worldToGrid(block.x, block.y);
            if (gridPos.x >= 0 && gridPos.x < this.mapData.width && 
                gridPos.y >= 0 && gridPos.y < this.mapData.height) {
                
                collisionMap[gridPos.y][gridPos.x] = block.isSolid ? 1 : 0;
                if (block.isSolid) solidBlockCount++;
            }
        });

        console.log(`Solid blocks: ${solidBlockCount}`);
        console.log(`Non-solid blocks: ${this.blocks.length - solidBlockCount}`);

        // Output the collision map as a visual representation
        console.log("\nCollision Map (1 = solid, 0 = empty):");
        console.log("X-axis: →");
        console.log("Y-axis: ↓");
        
        // Print column headers (show all columns)
        let header = "Y\\X ";
        for (let x = 0; x < this.mapData.width; x++) {
            if (x < 10) {
                header += x.toString().padStart(2, ' ');
            } else {
                // For double digit numbers, use single character spacing
                header += x.toString().padStart(2, ' ');
            }
        }
        console.log(header);

        // Print all rows and columns
        for (let y = 0; y < this.mapData.height; y++) {
            let row = y.toString().padStart(2, ' ') + " ";
            for (let x = 0; x < this.mapData.width; x++) {
                row += collisionMap[y][x].toString().padStart(2, ' ');
            }
            console.log(row);
        }

        console.log(`\nFull collision map displayed (${this.mapData.width}x${this.mapData.height})`);

        // Also output as a compact string for easy copying
        console.log("\n=== COMPACT COLLISION MAP (for copying) ===");
        let compactMap = "";
        for (let y = 0; y < this.mapData.height; y++) {
            for (let x = 0; x < this.mapData.width; x++) {
                compactMap += collisionMap[y][x];
            }
            compactMap += "\n";
        }
        console.log(compactMap);

        // Return the collision map for programmatic use
        return {
            width: this.mapData.width,
            height: this.mapData.height,
            tileSize: this.tileSize * this.scale,
            collisionMap: collisionMap,
            blocks: this.blocks,
            compactString: compactMap
        };
    }

    // Export collision map in different formats
    exportCollisionMap(format = "array") {
        if (!this.isMapLoaded) {
            console.log("No map loaded - cannot export collision data");
            return null;
        }

        // Create collision map
        const collisionMap = [];
        for (let y = 0; y < this.mapData.height; y++) {
            collisionMap[y] = new Array(this.mapData.width).fill(0);
        }

        this.blocks.forEach(block => {
            const gridPos = worldToGrid(block.x, block.y);
            if (gridPos.x >= 0 && gridPos.x < this.mapData.width && 
                gridPos.y >= 0 && gridPos.y < this.mapData.height) {
                collisionMap[gridPos.y][gridPos.x] = block.isSolid ? 1 : 0;
            }
        });

        switch (format.toLowerCase()) {
            case "json":
                const jsonData = {
                    width: this.mapData.width,
                    height: this.mapData.height,
                    tileSize: this.tileSize * this.scale,
                    collisionMap: collisionMap
                };
                console.log("JSON Collision Map:");
                console.log(JSON.stringify(jsonData, null, 2));
                return jsonData;

            case "csv":
                let csvData = "";
                for (let y = 0; y < this.mapData.height; y++) {
                    csvData += collisionMap[y].join(",") + "\n";
                }
                console.log("CSV Collision Map:");
                console.log(csvData);
                return csvData;

            case "compact":
                let compactData = "";
                for (let y = 0; y < this.mapData.height; y++) {
                    compactData += collisionMap[y].join("") + "\n";
                }
                console.log("Compact Collision Map:");
                console.log(compactData);
                return compactData;

            default: // "array"
                console.log("Array Collision Map:");
                console.log(collisionMap);
                return collisionMap;
        }
    }

    update() {
        // Update logic for blocks will go here
    }

    draw() {
        if (params.debug) {
            this.drawGrid();
        }


    }

    drawGrid() {
        const ctx = this.gameEngine.ctx;
        
        // Get camera offset
        const cameraOffset = this.gameEngine.camera.getViewOffset();
        
        // Set grid line style
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 1;

        // Draw vertical lines and x coordinates
        for (let x = 0; x <= this.gridWidth; x++) {
            const worldX = this.offsetX + (x * this.tileSize * this.scale);
            const screenX = worldX + cameraOffset.x;
            ctx.beginPath();
            ctx.strokeStyle = "#666666";  // Reset stroke style for grid lines
            ctx.lineWidth = 1;
            ctx.moveTo(screenX, this.offsetY + cameraOffset.y);
            ctx.lineTo(screenX, this.offsetY + cameraOffset.y + (this.gridHeight * this.tileSize * this.scale));
            ctx.stroke();

            // Draw x coordinates at the top with outline
            if (x < this.gridWidth) {
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const text = x.toString();
                const textX = screenX + (this.tileSize * this.scale / 2);
                const textY = this.offsetY + cameraOffset.y - 8;
                
                // Draw text outline
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                ctx.strokeText(text, textX, textY);
                
                // Draw text
                ctx.fillStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.fillText(text, textX, textY);
            }
        }

        // Draw horizontal lines and y coordinates
        for (let y = 0; y <= this.gridHeight; y++) {
            const worldY = this.offsetY + (y * this.tileSize * this.scale);
            const screenY = worldY + cameraOffset.y;
            ctx.beginPath();
            ctx.strokeStyle = "#666666";  // Reset stroke style for grid lines
            ctx.lineWidth = 1;
            ctx.moveTo(this.offsetX + cameraOffset.x, screenY);
            ctx.lineTo(this.offsetX + cameraOffset.x + (this.gridWidth * this.tileSize * this.scale), screenY);
            ctx.stroke();

            // Draw y coordinates on the left with outline
            if (y < this.gridHeight) {
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const text = y.toString();
                const textX = this.offsetX + cameraOffset.x - 8;
                const textY = screenY + (this.tileSize * this.scale / 2);
                
                // Draw text outline
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                ctx.strokeText(text, textX, textY);
                
                // Draw text
                ctx.fillStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.fillText(text, textX, textY);
            }
        }

        // Draw tile coordinates in each cell
        ctx.font = "bold 8px Arial";
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const worldX = this.offsetX + (x * this.tileSize * this.scale);
                const worldY = this.offsetY + (y * this.tileSize * this.scale);
                const screenX = worldX + cameraOffset.x;
                const screenY = worldY + cameraOffset.y;
                
                // Draw coordinate text in each cell with outline
                const text = `${x},${y}`;
                const textX = screenX + (this.tileSize * this.scale / 2);
                const textY = screenY + (this.tileSize * this.scale / 2);
                
                // Draw text outline
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.strokeText(text, textX, textY);
                
                // Draw text
                ctx.fillStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.fillText(text, textX, textY);
            }
        }
        
    }

    // Helper method to convert screen coordinates to grid coordinates
    screenToGrid(screenX, screenY) {
        const gridX = Math.floor((screenX - this.offsetX) / (this.tileSize * this.scale));
        const gridY = Math.floor((screenY - this.offsetY) / (this.tileSize * this.scale));
        return { x: gridX, y: gridY };
    }

    // Helper method to convert grid coordinates to screen coordinates
    gridToScreen(gridX, gridY) {
        const screenX = this.offsetX + (gridX * this.tileSize * this.scale);
        const screenY = this.offsetY + (gridY * this.tileSize * this.scale);
        return { x: screenX, y: screenY };
    }
}