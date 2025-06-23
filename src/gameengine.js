// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};
        this.consumedKeys = {}; // Track consumed keys until key release

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
        this.camera = null;
        
        // Audio manager will be initialized after asset manager is ready
        this.audioManager = null;
        
        // Collision manager for handling all collision detection
        this.collisionManager = new CollisionManager(this);
        
        // A* pathfinding system
        this.aStar = new AStar(this);
    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => {
            const rect = this.ctx.canvas.getBoundingClientRect();
            const scaleX = this.ctx.canvas.width / rect.width;
            const scaleY = this.ctx.canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };
        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        this.ctx.canvas.addEventListener("keydown", event => {
            // Only set the key if it wasn't already pressed
            if (!this.keys[event.key]) {
                this.keys[event.key] = true;
                this.consumedKeys[event.key] = false; // Reset consumed state only on new press
            }
        });

        this.ctx.canvas.addEventListener("keyup", event => {
            this.keys[event.key] = false;
            this.consumedKeys[event.key] = false; // Reset consumed state when key is released
        });
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    clearEntities() {
        this.entities.forEach(function (entity) {
            entity.removeFromWorld = true;
        });
    };

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw latest things first
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }

        this.camera.draw(this.ctx, this);
    };

    update() {
        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }

        this.camera.update(this.ctx, this);
        
        // Update audio manager if it exists
        if (this.audioManager) {
            this.audioManager.update();
        }
        
        // console.log("Entities:", this.entities);
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

    // Method to check and consume a key
    consumeKey(key) {
        if (this.keys[key] && !this.consumedKeys[key]) {
            this.consumedKeys[key] = true;
            return true;
        }
        return false;
    }
};

// KV Le was here :)