class AudioManager {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.activeAudios = new Map(); // Track currently playing audio instances
        this.masterVolume = 1.0;
        this.audioGroups = new Map(); // For managing different audio categories (music, sfx, etc.)
        
        // Initialize default audio groups
        this.audioGroups.set('music', { volume: 1.0, muted: false });
        this.audioGroups.set('sfx', { volume: 1.0, muted: false });
        this.audioGroups.set('voice', { volume: 1.0, muted: false });
    }

    // Play audio with optional configuration
    play(audioPath, options = {}) {
        const audio = this.assetManager.getAsset(audioPath);
        if (!audio) {
            console.warn(`Audio not found: ${audioPath}`);
            return null;
        }

        // Clone the audio element to allow multiple instances
        const audioInstance = audio.cloneNode();
        
        // Set default options
        const config = {
            volume: options.volume ?? 1.0,
            loop: options.loop ?? false,
            startTime: options.startTime ?? 0,
            endTime: options.endTime ?? null,
            fadeIn: options.fadeIn ?? 0,
            group: options.group ?? 'sfx',
            onEnded: options.onEnded ?? null,
            id: options.id ?? `audio_${Date.now()}_${Math.random()}`
        };

        // Apply configuration
        audioInstance.volume = this.calculateVolume(config.volume, config.group);
        audioInstance.loop = config.loop;
        audioInstance.currentTime = config.startTime;

        // Handle fade in
        if (config.fadeIn > 0) {
            audioInstance.volume = 0;
            this.fadeIn(audioInstance, this.calculateVolume(config.volume, config.group), config.fadeIn);
        }

        // Handle end time
        if (config.endTime) {
            const checkEndTime = () => {
                if (audioInstance.currentTime >= config.endTime) {
                    this.stop(config.id);
                }
            };
            audioInstance.addEventListener('timeupdate', checkEndTime);
        }

        // Handle onEnded callback
        if (config.onEnded) {
            audioInstance.addEventListener('ended', config.onEnded);
        }

        // Store the audio instance
        this.activeAudios.set(config.id, {
            audio: audioInstance,
            config: config,
            path: audioPath
        });

        // Play the audio
        audioInstance.play().catch(error => {
            console.warn('Error playing audio:', error);
        });

        return config.id;
    }

    // Stop audio by ID
    stop(audioId, fadeOut = 0) {
        const audioData = this.activeAudios.get(audioId);
        if (!audioData) return false;

        if (fadeOut > 0) {
            this.fadeOut(audioData.audio, fadeOut, () => {
                audioData.audio.pause();
                this.activeAudios.delete(audioId);
            });
        } else {
            audioData.audio.pause();
            this.activeAudios.delete(audioId);
        }
        return true;
    }

    // Stop all audio in a group
    stopGroup(groupName, fadeOut = 0) {
        const toStop = [];
        this.activeAudios.forEach((audioData, id) => {
            if (audioData.config.group === groupName) {
                toStop.push(id);
            }
        });
        
        toStop.forEach(id => this.stop(id, fadeOut));
    }

    // Stop all audio
    stopAll(fadeOut = 0) {
        const audioIds = Array.from(this.activeAudios.keys());
        audioIds.forEach(id => this.stop(id, fadeOut));
    }

    // Pause audio
    pause(audioId) {
        const audioData = this.activeAudios.get(audioId);
        if (audioData) {
            audioData.audio.pause();
            return true;
        }
        return false;
    }

    // Resume audio
    resume(audioId) {
        const audioData = this.activeAudios.get(audioId);
        if (audioData) {
            audioData.audio.play();
            return true;
        }
        return false;
    }

    // Set volume for specific audio
    setVolume(audioId, volume) {
        const audioData = this.activeAudios.get(audioId);
        if (audioData) {
            audioData.config.volume = volume;
            audioData.audio.volume = this.calculateVolume(volume, audioData.config.group);
            return true;
        }
        return false;
    }

    // Set master volume
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    // Set group volume
    setGroupVolume(groupName, volume) {
        const group = this.audioGroups.get(groupName);
        if (group) {
            group.volume = Math.max(0, Math.min(1, volume));
            this.updateGroupVolumes(groupName);
        }
    }

    // Mute/unmute group
    setGroupMuted(groupName, muted) {
        const group = this.audioGroups.get(groupName);
        if (group) {
            group.muted = muted;
            this.updateGroupVolumes(groupName);
        }
    }

    // Calculate final volume considering master volume and group settings
    calculateVolume(volume, groupName) {
        const group = this.audioGroups.get(groupName) || { volume: 1.0, muted: false };
        if (group.muted) return 0;
        return volume * group.volume * this.masterVolume;
    }

    // Update volumes for all active audio
    updateAllVolumes() {
        this.activeAudios.forEach((audioData) => {
            audioData.audio.volume = this.calculateVolume(
                audioData.config.volume, 
                audioData.config.group
            );
        });
    }

    // Update volumes for a specific group
    updateGroupVolumes(groupName) {
        this.activeAudios.forEach((audioData) => {
            if (audioData.config.group === groupName) {
                audioData.audio.volume = this.calculateVolume(
                    audioData.config.volume, 
                    audioData.config.group
                );
            }
        });
    }

    // Fade in audio
    fadeIn(audioElement, targetVolume, duration) {
        const startVolume = 0;
        const steps = 60; // 60 fps
        const stepDuration = duration / steps;
        const volumeStep = (targetVolume - startVolume) / steps;
        
        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            audioElement.volume = startVolume + (volumeStep * currentStep);
            
            if (currentStep >= steps) {
                audioElement.volume = targetVolume;
                clearInterval(fadeInterval);
            }
        }, stepDuration * 1000);
    }

    // Fade out audio
    fadeOut(audioElement, duration, callback = null) {
        const startVolume = audioElement.volume;
        const steps = 60;
        const stepDuration = duration / steps;
        const volumeStep = startVolume / steps;
        
        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            audioElement.volume = startVolume - (volumeStep * currentStep);
            
            if (currentStep >= steps) {
                audioElement.volume = 0;
                clearInterval(fadeInterval);
                if (callback) callback();
            }
        }, stepDuration * 1000);
    }

    // Get current playback time
    getCurrentTime(audioId) {
        const audioData = this.activeAudios.get(audioId);
        return audioData ? audioData.audio.currentTime : null;
    }

    // Set current playback time
    setCurrentTime(audioId, time) {
        const audioData = this.activeAudios.get(audioId);
        if (audioData) {
            audioData.audio.currentTime = time;
            return true;
        }
        return false;
    }

    // Check if audio is playing
    isPlaying(audioId) {
        const audioData = this.activeAudios.get(audioId);
        return audioData ? !audioData.audio.paused : false;
    }

    // Get all active audio IDs
    getActiveAudioIds() {
        return Array.from(this.activeAudios.keys());
    }

    // Clean up finished audio instances
    cleanup() {
        const toRemove = [];
        this.activeAudios.forEach((audioData, id) => {
            if (audioData.audio.ended) {
                toRemove.push(id);
            }
        });
        
        toRemove.forEach(id => {
            this.activeAudios.delete(id);
        });
    }

    // Update method to be called in game loop
    update() {
        this.cleanup();
    }
} 