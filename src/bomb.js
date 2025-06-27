class Bomb extends PickupableItem {
    constructor(gameEngine, sceneManager, x, y) {
        // Call parent constructor with bomb-specific size
        super(gameEngine, sceneManager, x, y, 32, 32);
        
        // Bomb-specific visual properties
        this.color = "#333333"; // Dark gray for the bomb body
        this.outlineColor = "white";
        this.outlineWidth = 2;
        
        // Explosion properties
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 0.5; // Half second explosion animation
        this.explosionRadius = 80; // Damage radius in pixels
        this.explosionDamage = 2; // Damage dealt to entities
        this.hasExploded = false; // Prevent multiple explosions
        
        // Fuse timer properties
        this.isTicking = false;
        this.fuseTimer = 0;
        this.fuseDuration = 3.0; // 3 seconds before explosion
        this.tickSound = null; // Reference for repeating tick sound
    }
    
    update() {
        // Call parent update for physics
        super.update();
        
        // Handle fuse countdown
        if (this.isTicking && !this.isExploding) {
            this.fuseTimer += this.gameEngine.clockTick;
            
            // Play tick sound every 0.5 seconds
            const tickInterval = 0.5;
            const currentTick = Math.floor(this.fuseTimer / tickInterval);
            const previousTick = Math.floor((this.fuseTimer - this.gameEngine.clockTick) / tickInterval);
            
            if (currentTick > previousTick && this.gameEngine.audioManager) {
                // Play faster ticking as explosion approaches
                const timeLeft = this.fuseDuration - this.fuseTimer;
                const playbackRate = timeLeft < 1.0 ? 2.0 : 1.5;
                
                this.gameEngine.audioManager.play("./assets/sounds/brick-falling.mp3", {
                    volume: 0.3,
                    playbackRate: playbackRate,
                    startTime: 0,
                    endTime: 0.1 // Short tick sound
                });
            }
            
            // Explode when timer reaches duration
            if (this.fuseTimer >= this.fuseDuration) {
                this.detonateExplosion();
            }
        }
        
        // Handle explosion animation
        if (this.isExploding) {
            this.explosionTimer += this.gameEngine.clockTick;
            
            // Remove bomb after explosion animation completes
            if (this.explosionTimer >= this.explosionDuration) {
                this.removeFromWorld = true;
            }
        }
    }
    
    // Method to start the fuse (called when bomb is hit)
    explode() {
        if (this.hasExploded || this.isTicking) return; // Prevent multiple activations
        
        console.log("Bomb fuse activated! 3 seconds until explosion!");
        this.isTicking = true;
        this.fuseTimer = 0;
    }
    
    // Method for actual explosion (called after fuse timer)
    detonateExplosion() {
        if (this.hasExploded) return; // Prevent multiple explosions
        
        console.log("BOOM! Bomb exploded!");
        this.hasExploded = true;
        this.isExploding = true;
        this.isTicking = false;
        this.explosionTimer = 0;
        
        // Play explosion sound if available
        if (this.gameEngine.audioManager) {
            this.gameEngine.audioManager.play("./assets/sounds/bomboclat.mp3", {
                volume: 1.0,
                playbackRate: 0.8
            });
        }
        
        // Deal damage to nearby entities
        this.damageNearbyEntities();
    }
    
    // Check for entities within explosion radius and damage them
    damageNearbyEntities() {
        for (let entity of this.gameEngine.entities) {
            // Skip self and non-damageable entities
            if (entity === this || !entity.boundingBox) continue;
            
            // Calculate distance from bomb center to entity center
            const bombCenterX = this.x + this.width / 2;
            const bombCenterY = this.y + this.height / 2;
            const entityCenterX = entity.x + entity.boundingBox.width / 2;
            const entityCenterY = entity.y + entity.boundingBox.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(entityCenterX - bombCenterX, 2) + 
                Math.pow(entityCenterY - bombCenterY, 2)
            );
            
            // If within explosion radius, deal damage
            if (distance <= this.explosionRadius) {
                this.damageEntity(entity);
            }
        }
    }
    
    // Deal damage to a specific entity
    damageEntity(entity) {
        // Damage player
        if (entity.constructor.name === "Player" && entity.takeDamage) {
            console.log("Bomb damaged player!");
            entity.takeDamage();
        }
        
        // Damage MrMan enemies
        if (entity.constructor.name === "MrMan" && entity.takeDamage) {
            console.log("Bomb damaged MrMan!");
            // MrMan's takeDamage method might be different, check its implementation
            if (entity.getHit) {
                entity.getHit("explosion", "center"); // Use getHit method if available
            } else {
                entity.takeDamage();
            }
        }
        
        // Add more entity types as needed
    }
    
    // Override the drawItem method to customize bomb appearance
    drawItem(ctx, screenPos) {
        if (this.isExploding) {
            // Draw explosion effect
            this.drawExplosion(ctx, screenPos);
        } else {
            // Determine bomb color based on state
            let bombColor = this.color;
            let textColor = "white";
            
            if (this.isTicking) {
                // Calculate time remaining and blink faster as time runs out
                const timeLeft = this.fuseDuration - this.fuseTimer;
                const blinkSpeed = timeLeft < 1.0 ? 8 : timeLeft < 2.0 ? 4 : 2;
                const blinkPhase = Math.floor(this.fuseTimer * blinkSpeed) % 2;
                
                if (blinkPhase === 1) {
                    bombColor = "#ff0000"; // Red when blinking
                    textColor = "yellow";
                }
            }
            
            // Draw the bomb body 
            ctx.fillStyle = bombColor;
            ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
            
            // Draw the outline (red if ticking, white if normal)
            ctx.strokeStyle = this.isTicking ? "#ff0000" : this.outlineColor;
            ctx.lineWidth = this.outlineWidth;
            ctx.strokeRect(screenPos.x, screenPos.y, this.width, this.height);
            
            // Draw text based on state
            ctx.font = "bold 8px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            const textX = screenPos.x + this.width / 2;
            const textY = screenPos.y + this.height / 2;
            
            let displayText = "BOMB";
            if (this.isTicking) {
                // Show countdown
                const timeLeft = Math.ceil(this.fuseDuration - this.fuseTimer);
                displayText = timeLeft.toString();
                ctx.font = "bold 12px Arial"; // Bigger font for countdown
            }
            
            // Draw text outline (black) for better readability
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.strokeText(displayText, textX, textY);
            
            // Draw text fill
            ctx.fillStyle = textColor;
            ctx.fillText(displayText, textX, textY);
        }
        
        // Draw explosion radius in debug mode
        if (params.debug && !this.isExploding) {
            const centerX = screenPos.x + this.width / 2;
            const centerY = screenPos.y + this.height / 2;
            
            ctx.strokeStyle = this.isTicking ? "orange" : "red";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.explosionRadius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash
            
            // Show countdown timer in debug mode
            if (this.isTicking) {
                const timeLeft = (this.fuseDuration - this.fuseTimer).toFixed(1);
                ctx.font = "12px Arial";
                ctx.fillStyle = "orange";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.textAlign = "center";
                ctx.strokeText(`${timeLeft}s`, centerX, centerY - 50);
                ctx.fillText(`${timeLeft}s`, centerX, centerY - 50);
            }
        }
    }
    
    // Draw explosion effect
    drawExplosion(ctx, screenPos) {
        const centerX = screenPos.x + this.width / 2;
        const centerY = screenPos.y + this.height / 2;
        
        // Calculate explosion progress (0 to 1)
        const progress = this.explosionTimer / this.explosionDuration;
        const maxRadius = this.explosionRadius;
        const currentRadius = maxRadius * progress;
        
        // Draw expanding circle with fading opacity
        const opacity = 1 - progress;
        
        // Outer explosion circle (orange/red)
        ctx.fillStyle = `rgba(255, 69, 0, ${opacity * 0.7})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Inner explosion circle (yellow/white)
        ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius * 0.6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Core explosion (white)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius * 0.3, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Override pickup/drop methods for bomb-specific behavior
    onPickup(player) {
        super.onPickup(player); // Call parent method
        console.log("Bomb picked up - hit it to activate 3-second fuse!");
        // Could add bomb-specific pickup effects here
    }
    
    onDrop(player) {
        super.onDrop(player); // Call parent method
        console.log("Bomb placed - hit it to start the countdown!");
        // Could add bomb-specific drop effects here
        // For example: start a timer, play a sound, etc.
    }
}