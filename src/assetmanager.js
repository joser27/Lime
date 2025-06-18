class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
    };

    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    };

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    };

    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {
            const path = this.downloadQueue[i];
            console.log(path);

            // Determine file type based on extension
            const fileExtension = path.split('.').pop().toLowerCase();
            
            if (fileExtension === 'mp4' || fileExtension === 'webm') {
                // Handle video files
                this.loadVideo(path, callback);
            } else if (fileExtension === 'mp3' || fileExtension === 'wav' || fileExtension === 'ogg') {
                // Handle audio files
                this.loadAudio(path, callback);
            } else {
                // Handle image files (default)
                this.loadImage(path, callback);
            }
        }
    };

    loadImage(path, callback) {
        const img = new Image();

        img.addEventListener("load", () => {
            console.log("Loaded image: " + img.src);
            this.successCount++;
            if (this.isDone()) callback();
        });

        img.addEventListener("error", () => {
            console.log("Error loading image: " + img.src);
            this.errorCount++;
            if (this.isDone()) callback();
        });

        img.src = path;
        this.cache[path] = img;
    };

    loadVideo(path, callback) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true; // Mute to allow autoplay in some browsers

        video.addEventListener("loadeddata", () => {
            console.log("Loaded video: " + video.src);
            this.successCount++;
            if (this.isDone()) callback();
        });

        video.addEventListener("error", () => {
            console.log("Error loading video: " + video.src);
            this.errorCount++;
            if (this.isDone()) callback();
        });

        video.src = path;
        this.cache[path] = video;
    };

    loadAudio(path, callback) {
        const audio = new Audio();
        audio.preload = 'auto';

        audio.addEventListener("canplaythrough", () => {
            console.log("Loaded audio: " + audio.src);
            this.successCount++;
            if (this.isDone()) callback();
        });

        audio.addEventListener("error", () => {
            console.log("Error loading audio: " + audio.src);
            this.errorCount++;
            if (this.isDone()) callback();
        });

        audio.src = path;
        this.cache[path] = audio;
    };

    getAsset(path) {
        return this.cache[path];
    };

    // Helper method to check if an asset is a video
    isVideo(path) {
        const fileExtension = path.split('.').pop().toLowerCase();
        return fileExtension === 'mp4' || fileExtension === 'webm';
    };

    // Helper method to check if an asset is audio
    isAudio(path) {
        const fileExtension = path.split('.').pop().toLowerCase();
        return fileExtension === 'mp3' || fileExtension === 'wav' || fileExtension === 'ogg';
    };

    // Helper method to check if an asset is an image
    isImage(path) {
        const fileExtension = path.split('.').pop().toLowerCase();
        return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(fileExtension);
    };
};

