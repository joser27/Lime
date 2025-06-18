class MenuScene {
    constructor(gameEngine, sceneManager) {
        this.gameEngine = gameEngine;
        this.sceneManager = sceneManager;
        this.buttons = [
            {
                x: 300,
                y: 420, // Moved down to make room for description
                width: 200,
                height: 50,
                text: "Start Game",
                color: "#4CAF50",
                hoverColor: "#45a049"
            },
            {
                x: 300,
                y: 490, // Moved down to make room for description
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
        ctx.fillText("No job simulator", ctx.canvas.width / 2, 80);

        // Draw swag image
        const swagImage = ASSET_MANAGER.getAsset("./assets/images/swag.jpg");
        if (swagImage) {
            const imageWidth = 180;
            const imageHeight = 135;
            const imageX = ctx.canvas.width / 2 - imageWidth / 2;
            const imageY = 110;
            
            // Draw image background
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(imageX - 5, imageY - 5, imageWidth + 10, imageHeight + 10);
            
            // Draw the swag image
            ctx.drawImage(swagImage, imageX, imageY, imageWidth, imageHeight);
            
            // Draw image border
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 1;
            ctx.strokeRect(imageX - 5, imageY - 5, imageWidth + 10, imageHeight + 10);
        }

        // Draw game description
        ctx.font = "bold 22px Arial";
        ctx.fillStyle = "#FFD700"; // Gold color for swag
        ctx.textAlign = "center";
        ctx.fillText("Dodge responsibilities and SWAG OUT!", ctx.canvas.width / 2, 280);

        // Draw additional description
        ctx.font = "16px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText("Survive as long as possible!", ctx.canvas.width / 2, 330);

        // Draw controls hint
        ctx.font = "14px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillText("Controls: A/D to move, SPACE to jump", ctx.canvas.width / 2, 360);

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
        
        // Video properties
        this.videoWidth = 400;
        this.videoHeight = 225; // 16:9 aspect ratio
        this.videoX = 0;
        this.videoY = 0;
        this.videoStarted = false;
    }

    updateButtonPositions() {
        const canvas = this.gameEngine.ctx.canvas;
        const centerX = canvas.width / 2;
        
        this.buttons = [
            {
                x: centerX - this.buttonWidth / 2,
                y: 570,  // Moved down further to give video more space
                width: this.buttonWidth,
                height: this.buttonHeight,
                text: "Play Again",
                color: "#4CAF50",
                hoverColor: "#45a049"
            },
            {
                x: centerX - this.buttonWidth / 2,
                y: 640,  // Moved down further to give video more space
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

        // Start video if not already started
        if (!this.videoStarted) {
            const video = ASSET_MANAGER.getAsset("./assets/sounds/tylerlaughingatyou.mp4");
            if (video) {
                console.log("Video found, attempting to play...");
                console.log("Video muted:", video.muted);
                console.log("Video volume:", video.volume);
                console.log("Video readyState:", video.readyState);
                
                // Ensure audio is enabled and set up looping
                video.muted = false;
                video.volume = 1.0;
                video.loop = true; // Enable looping
                video.currentTime = 0; // Reset to beginning
                
                // Try to play with audio
                video.play().then(() => {
                    console.log("Video started successfully with audio and looping");
                }).catch(e => {
                    console.log("Video autoplay prevented:", e);
                    // Try to play muted first, then unmute (workaround for autoplay policies)
                    video.muted = true;
                    video.play().then(() => {
                        console.log("Video started muted, attempting to unmute...");
                        video.muted = false;
                    }).catch(e2 => {
                        console.log("Video still can't play:", e2);
                    });
                });
                this.videoStarted = true;
            } else {
                console.log("Video not found in asset manager");
            }
        }

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
                        // Stop video before changing scene
                        const video = ASSET_MANAGER.getAsset("./assets/sounds/tylerlaughingatyou.mp4");
                        if (video) {
                            video.pause();
                            video.currentTime = 0;
                        }
                        this.videoStarted = false;
                        this.sceneManager.changeScene("PlayingScene");
                    } else if (this.hoveredButton.text === "Main Menu") {
                        // Stop video before changing scene
                        const video = ASSET_MANAGER.getAsset("./assets/sounds/tylerlaughingatyou.mp4");
                        if (video) {
                            video.pause();
                            video.currentTime = 0;
                        }
                        this.videoStarted = false;
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
        ctx.fillText("GAME OVER", ctx.canvas.width / 2, 100);

        // Get stats from the previous playing scene
        const playingScene = this.sceneManager.scenes.PlayingScene;
        if (playingScene) {
            // Draw stats in a nice box (moved up)
            const statsBoxWidth = 400;
            const statsBoxHeight = 150; // Reduced height
            const statsBoxX = ctx.canvas.width / 2 - statsBoxWidth / 2;
            const statsBoxY = 150; // Moved up

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
                const y = statsBoxY + 40 + (index * 40); // Reduced spacing
                // Draw label
                ctx.font = "bold 20px Arial";
                ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
                ctx.fillText(stat.label, statsBoxX + 20, y);
                // Draw value
                ctx.font = "bold 24px Arial";
                ctx.fillStyle = "#4CAF50";
                ctx.textAlign = "right";
                ctx.fillText(stat.value, statsBoxX + statsBoxWidth - 20, y);
                ctx.textAlign = "left";
            });
        }

        // Draw video area
        const video = ASSET_MANAGER.getAsset("./assets/sounds/tylerlaughingatyou.mp4");
        if (video && video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            // Calculate video position (center of screen)
            this.videoX = ctx.canvas.width / 2 - this.videoWidth / 2;
            this.videoY = 320; // Position below stats box
            
            // Draw video background
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(this.videoX, this.videoY, this.videoWidth, this.videoHeight);
            
            // Draw video border
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.videoX, this.videoY, this.videoWidth, this.videoHeight);
            
            // Draw the video frame
            try {
                ctx.drawImage(video, this.videoX, this.videoY, this.videoWidth, this.videoHeight);
            } catch (e) {
                // If video can't be drawn, show a placeholder
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Video Loading...", this.videoX + this.videoWidth / 2, this.videoY + this.videoHeight / 2);
            }
        } else {
            // Video not ready, show loading area
            this.videoX = ctx.canvas.width / 2 - this.videoWidth / 2;
            this.videoY = 320;
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(this.videoX, this.videoY, this.videoWidth, this.videoHeight);
            
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.videoX, this.videoY, this.videoWidth, this.videoHeight);
            
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Video Loading...", this.videoX + this.videoWidth / 2, this.videoY + this.videoHeight / 2);
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