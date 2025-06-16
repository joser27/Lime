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
            },
            {
                x: centerX - this.buttonWidth / 2,  // Center the button horizontally
                y: 370,  // Position below the fullscreen button
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Back",
                color: "#F44336",  // Red color for back button
                hoverColor: "#D32F2F"
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

class GameOverScene {
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
                x: centerX - this.buttonWidth / 2,
                y: 400,  // Position below stats
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Play Again",
                color: "#4CAF50",
                hoverColor: "#45a049"
            },
            {
                x: centerX - this.buttonWidth / 2,
                y: 470,  // Position below Play Again button
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Main Menu",
                color: "#F44336",
                hoverColor: "#D32F2F"
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
                    if (this.hoveredButton.text === "Play Again") {
                        this.sceneManager.changeScene("PlayingScene");
                    } else if (this.hoveredButton.text === "Main Menu") {
                        this.sceneManager.changeScene("MenuScene");
                    }
                }
                this.gameEngine.click = null; // Reset click
            }
        }
    }

    draw() {
        const ctx = this.gameEngine.ctx;
        
        // Draw semi-transparent dark background
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw game over text
        ctx.font = "bold 64px Arial";
        ctx.fillStyle = "#FF4444";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GAME OVER", ctx.canvas.width / 2, 150);

        // Get stats from the previous playing scene
        const playingScene = this.sceneManager.scenes.PlayingScene;
        if (playingScene) {
            // Draw stats in a nice box
            const statsBoxWidth = 400;
            const statsBoxHeight = 200;
            const statsBoxX = ctx.canvas.width / 2 - statsBoxWidth / 2;
            const statsBoxY = 200;

            // Draw stats box background
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(statsBoxX, statsBoxY, statsBoxWidth, statsBoxHeight);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 2;
            ctx.strokeRect(statsBoxX, statsBoxY, statsBoxWidth, statsBoxHeight);

            // Draw stats
            ctx.font = "bold 32px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            
            // Format time as MM:SS
            const minutes = Math.floor(playingScene.gameTime / 60);
            const seconds = Math.floor(playingScene.gameTime % 60);
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Draw each stat with a label and value
            const stats = [
                { label: "Score", value: playingScene.score.toString().padStart(3, '0') },
                { label: "Time Survived", value: timeString },
                { label: "Job Applications Dodged", value: playingScene.score.toString() }
            ];

            stats.forEach((stat, index) => {
                const y = statsBoxY + 60 + (index * 50);
                // Draw label
                ctx.font = "bold 24px Arial";
                ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
                ctx.fillText(stat.label, statsBoxX + 20, y);
                // Draw value
                ctx.font = "bold 32px Arial";
                ctx.fillStyle = "#4CAF50";
                ctx.textAlign = "right";
                ctx.fillText(stat.value, statsBoxX + statsBoxWidth - 20, y);
                ctx.textAlign = "left";
            });
        }

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