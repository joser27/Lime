class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameTime = 0;
        this.startTime = Date.now();
        this.gameOver = false;
        this.enemiesDefeated = 0;
    }

    // Method to handle level progression
    nextLevel() {
        this.level++;
        // Keep score and lives but reset time for new level
        this.gameTime = 0;
        this.startTime = Date.now();
    }

    // Method to handle player death
    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver = true;
        }
    }

    // Method to add score
    addScore(points) {
        this.score += points;
    }

    // Method to defeat enemy
    defeatEnemy(points = 10) {
        this.enemiesDefeated++;
        this.addScore(points);
    }

    // Update game time
    updateGameTime() {
        if (!this.gameOver) {
            this.gameTime = (Date.now() - this.startTime) / 1000;
        }
    }

    // Get formatted time string
    getFormattedTime() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}