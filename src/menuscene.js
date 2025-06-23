class MenuScene {
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
        const centerY = canvas.height / 2;
        
        this.buttons = [
            {
                x: centerX - this.buttonWidth / 2,
                y: centerY - 25, // Center vertically with some spacing
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Delve Deep",
                color: "#4CAF50", // Green
                hoverColor: "#45a049"
            },
            {
                x: centerX - this.buttonWidth / 2,
                y: centerY + 35, // Below the first button
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Options",
                color: "#2196F3", // Blue
                hoverColor: "#1976D2"
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
                    if (this.hoveredButton.text === "Delve Deep") {
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
        
        // Draw menu image as full-screen background
        const menuImage = ASSET_MANAGER.getAsset("./assets/images/menu.png");
        if (menuImage) {
            ctx.drawImage(menuImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        // Draw title above buttons
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Position title above the buttons
        const titleY = ctx.canvas.height / 2 - 120; // Above center where buttons are
        ctx.strokeText("Cave Dodger", ctx.canvas.width / 2, titleY);
        ctx.fillText("Cave Dodger", ctx.canvas.width / 2, titleY);

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
        const centerY = canvas.height / 2;
        
        this.buttons = [
            {
                x: centerX - this.buttonWidth / 2,
                y: centerY - 25, // Center vertically with some spacing
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Fullscreen",
                color: "#4CAF50", // Green
                hoverColor: "#45a049"
            },
            {
                x: centerX - this.buttonWidth / 2,
                y: centerY + 35, // Below the first button
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Back",
                color: "#2196F3", // Blue
                hoverColor: "#1976D2"
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
                    } else if (this.hoveredButton.text === "Back") {
                        this.sceneManager.changeScene("MenuScene");
                    }
                }
                this.gameEngine.click = null; // Reset click
            }
        }
    }

    draw() {
        const ctx = this.gameEngine.ctx;

        // Draw menu image as full-screen background
        const menuImage = ASSET_MANAGER.getAsset("./assets/images/menu.png");
        if (menuImage) {
            ctx.drawImage(menuImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        // Draw title above buttons
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Position title above the buttons (same as MenuScene)
        const titleY = ctx.canvas.height / 2 - 120;
        ctx.strokeText("Options", ctx.canvas.width / 2, titleY);
        ctx.fillText("Options", ctx.canvas.width / 2, titleY);

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

class GameOverScene {

}

