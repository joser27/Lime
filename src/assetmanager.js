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
            } else if (fileExtension === 'tsx') {
                // Handle Tiled tileset XML files
                this.loadXML(path, callback);
            } else if (fileExtension === 'tmj' || fileExtension === 'json') {
                // Handle Tiled map files and JSON files
                this.loadJSON(path, callback);
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

    loadJSON(path, callback) {
        console.log("Attempting to load JSON:", path);
        fetch(path)
            .then(response => {
                console.log("Fetch response for", path, ":", response.status, response.statusText);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Loaded JSON:", path, "- Data:", data);
                this.cache[path] = data;
                this.successCount++;
                if (this.isDone()) callback();
            })
            .catch(error => {
                console.error("Error loading JSON:", path, "- Error:", error.message);
                console.error("Full error:", error);
                this.errorCount++;
                if (this.isDone()) callback();
            });
    };

    loadXML(path, callback) {
        console.log("Attempting to load XML:", path);
        fetch(path)
            .then(response => {
                console.log("Fetch response for", path, ":", response.status, response.statusText);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(xmlText => {
                console.log("Loaded XML text for:", path);
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                
                // Parse tileset XML into a JSON-like structure
                const tilesetData = this.parseTilesetXML(xmlDoc);
                console.log("Parsed tileset data:", tilesetData);
                
                this.cache[path] = tilesetData;
                this.successCount++;
                if (this.isDone()) callback();
            })
            .catch(error => {
                console.error("Error loading XML:", path, "- Error:", error.message);
                console.error("Full error:", error);
                this.errorCount++;
                if (this.isDone()) callback();
            });
    };

    parseTilesetXML(xmlDoc) {
        const tileset = xmlDoc.getElementsByTagName('tileset')[0];
        const image = xmlDoc.getElementsByTagName('image')[0];
        
        return {
            name: tileset.getAttribute('name'),
            tilewidth: parseInt(tileset.getAttribute('tilewidth')),
            tileheight: parseInt(tileset.getAttribute('tileheight')),
            tilecount: parseInt(tileset.getAttribute('tilecount')),
            columns: parseInt(tileset.getAttribute('columns')),
            imagewidth: parseInt(image.getAttribute('width')),
            imageheight: parseInt(image.getAttribute('height')),
            image: image.getAttribute('source')
        };
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

    // Helper method to check if an asset is XML (Tiled tilesets)
    isXML(path) {
        const fileExtension = path.split('.').pop().toLowerCase();
        return fileExtension === 'tsx';
    };

    // Helper method to check if an asset is JSON (including Tiled maps)
    isJSON(path) {
        const fileExtension = path.split('.').pop().toLowerCase();
        return fileExtension === 'json' || fileExtension === 'tmj';
    };

    // Helper method to check if an asset is an image
    isImage(path) {
        const fileExtension = path.split('.').pop().toLowerCase();
        return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(fileExtension);
    };
};

