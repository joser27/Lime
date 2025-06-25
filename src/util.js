/** Global Parameters Object */
const params = {
    tileSize: 16,
    scale: 3,
};

/**
 * @param {Number} n
 * @returns Random Integer Between 0 and n-1
 */
const randomInt = n => Math.floor(Math.random() * n);

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @returns String that can be used as a rgb web color
 */
const rgb = (r, g, b) => `rgba(${r}, ${g}, ${b})`;

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @param {Number} a Alpha Value
 * @returns String that can be used as a rgba web color
 */
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * @param {Number} h Hue
 * @param {Number} s Saturation
 * @param {Number} l Lightness
 * @returns String that can be used as a hsl web color
 */
const hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

// === COORDINATE CONVERSION FUNCTIONS ===

/**
 * Convert world pixel coordinates to grid coordinates
 * @param {Number} worldX World X position in pixels
 * @param {Number} worldY World Y position in pixels
 * @returns {Object} Grid coordinates {x, y}
 */
const worldToGrid = (worldX, worldY) => {
    const tilePixelSize = params.tileSize * params.scale;
    return {
        x: Math.floor(worldX / tilePixelSize),
        y: Math.floor(worldY / tilePixelSize)
    };
};

/**
 * Convert grid coordinates to world pixel coordinates
 * @param {Number} gridX Grid X position (column)
 * @param {Number} gridY Grid Y position (row)
 * @returns {Object} World coordinates {x, y}
 */
const gridToWorld = (gridX, gridY) => {
    const tilePixelSize = params.tileSize * params.scale;
    return {
        x: gridX * tilePixelSize,
        y: gridY * tilePixelSize
    };
};

/**
 * Convert a single grid coordinate to world pixels
 * Convenient shorthand for direct use in constructors
 * @param {Number} gridCoord Grid coordinate (row or column)
 * @returns {Number} World pixel position
 */
const grid = (gridCoord) => {
    const tilePixelSize = params.tileSize * params.scale; // 16 * 3 = 48 pixels per tile
    return gridCoord * tilePixelSize;
};

/**
 * Get the size of one tile in world pixels
 * @returns {Number} Tile size in pixels (tileSize * scale)
 */
const getTilePixelSize = () => {
    return params.tileSize * params.scale;
};

/**
 * Snap world coordinates to the nearest grid position
 * @param {Number} worldX World X position in pixels
 * @param {Number} worldY World Y position in pixels
 * @returns {Object} Snapped world coordinates {x, y}
 */
const snapToGrid = (worldX, worldY) => {
    const grid = worldToGrid(worldX, worldY);
    return gridToWorld(grid.x, grid.y);
};

/** Creates an alias for requestAnimationFrame for backwards compatibility */
window.requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        /**
         * Compatibility for requesting animation frames in older browsers
         * @param {Function} callback Function
         * @param {DOM} element DOM ELEMENT
         */
        ((callback, element) => {
            window.setTimeout(callback, 1000 / 60);
        });
})();

/**
 * Returns distance from two points
 * @param {Number} p1, p2 Two objects with x and y coordinates
 * @returns Distance between the two points
 */
const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calculate animation scale to maintain consistency with game scale
 * @param {Number} relativeSize How big the sprite should be relative to tiles (default: 1.25 = 25% bigger than tiles)
 * @returns {Number} Calculated animation scale
 */
const getAnimationScale = (relativeSize = 1.25) => {
    return Math.round(params.scale * relativeSize);
};

/**
 * Get consistent character animation scale
 * @returns {Number} Animation scale that matches current game scale
 */
const getCharacterScale = () => {
    return getAnimationScale(1.25); // Characters are 25% bigger than tiles
};