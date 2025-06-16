class MenuScene {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.buttons = [
            {
                x: 300,
                y: 300,
                width: 200,
                height: 50,
                text: "Start Game",
                color: "#4CAF50",
                hoverColor: "#45a049"
            },
            {
                x: 300,
                y: 370,
                width: 200,
                height: 50,
                text: "Options",
                color: "#2196F3",
                hoverColor: "#1976D2"
            }
        ];
        this.hoveredButton = null;
    }

    update() {
        // Check if mouse is over any button
        if (this.gameEngine.mouse) {
            this.hoveredButton = this.buttons.find(button => 
                this.gameEngine.mouse.x >= button.x && 
                this.gameEngine.mouse.x <= button.x + button.width &&
                this.gameEngine.mouse.y >= button.y && 
                this.gameEngine.mouse.y <= button.y + button.height
            );

            // Handle click
            if (this.gameEngine.click) {
                if (this.hoveredButton) {
                    if (this.hoveredButton.text === "Start Game") {
                        this.sceneManager.changeScene("PlayingScene");
                    } else if (this.hoveredButton.text === "Options") {
                        this.sceneManager.changeScene("OptionsScene");
                    }
                }
                this.gameEngine.click = null; // Reset click
            }
        }
    }

    draw() {
        const ctx = this.gameEngine.ctx;
        
        // Draw background
        ctx.fillStyle = "#2C3E50";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw title
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Gamer", ctx.canvas.width / 2, 150);

        // Draw buttons
        this.buttons.forEach(button => {
            // Draw button background
            ctx.fillStyle = this.hoveredButton === button ? button.hoverColor : button.color;
            ctx.fillRect(button.x, button.y, button.width, button.height);

            // Draw button border
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            // Draw button text
            ctx.font = "24px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                button.text, 
                button.x + button.width / 2, 
                button.y + button.height / 2
            );
        });
    }
}

class OptionsScene {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.buttonWidth = 200;
        this.buttonHeight = 50;
        this.updateButtonPositions();
        this.hoveredButton = null;
    }

    updateButtonPositions() {
        const canvas = this.gameEngine.ctx.canvas;
        const centerX = canvas.width / 2;
        
        this.buttons = [
            {
                x: centerX - this.buttonWidth / 2,  // Center the button horizontally
                y: 300,
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Fullscreen",
                color: "#9C27B0",
                hoverColor: "#7B1FA2"
            }
        ];
    }

    update() {
        // Update button positions if canvas size changed
        this.updateButtonPositions();

        // Check if mouse is over any button
        if (this.gameEngine.mouse) {
            this.hoveredButton = this.buttons.find(button => 
                this.gameEngine.mouse.x >= button.x && 
                this.gameEngine.mouse.x <= button.x + button.width &&
                this.gameEngine.mouse.y >= button.y && 
                this.gameEngine.mouse.y <= button.y + button.height
            );

            // Handle click
            if (this.gameEngine.click) {
                if (this.hoveredButton) {
                    if (this.hoveredButton.text === "Fullscreen") {
                        this.sceneManager.toggleFullscreen();
                    }
                }
                this.gameEngine.click = null; // Reset click
            }
        }
    }

    draw() {
        const ctx = this.gameEngine.ctx;

        // Draw background
        ctx.fillStyle = "#2C3E50";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw title
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Options", ctx.canvas.width / 2, 150);

        // Draw buttons
        this.buttons.forEach(button => {
            // Draw button background
            ctx.fillStyle = this.hoveredButton === button ? button.hoverColor : button.color;
            ctx.fillRect(button.x, button.y, button.width, button.height);

            // Draw button border
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            // Draw button text
            ctx.font = "24px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                button.text, 
                button.x + button.width / 2, 
                button.y + button.height / 2
            );
        });
    }
}
