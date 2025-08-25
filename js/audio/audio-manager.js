class AudioManager {
    constructor() {
        this.currentMusic = null;
        this.volume = 0.5; // Volumen por defecto al 50%
        this.isMuted = false;
        this.playlist = [
            'audio/music/Batalla Pixelada.mp3',
            'audio/music/Peleas en el Bosque.mp3',
            'audio/music/Peleas en el Bosque (1).mp3'
        ];
        this.currentTrackIndex = 0;
    }

    init() {
        // Crear el elemento de audio
        this.currentMusic = new Audio();
        this.currentMusic.volume = this.volume;
        this.currentMusic.loop = false; // No loop para poder cambiar entre canciones

        // Cuando termina una canción, reproducir la siguiente
        this.currentMusic.addEventListener('ended', () => {
            this.playNextTrack();
        });
    }

    playNextTrack() {
        // Elegir una canción aleatoria diferente a la actual
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * this.playlist.length);
        } while (nextIndex === this.currentTrackIndex && this.playlist.length > 1);

        this.currentTrackIndex = nextIndex;
        this.currentMusic.src = this.playlist[this.currentTrackIndex];
        this.currentMusic.play().catch(error => {
            console.error('Error reproduciendo música:', error);
        });
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.currentMusic) {
            this.currentMusic.volume = this.isMuted ? 0 : this.volume;
        }
    }

    increaseVolume() {
        this.setVolume(this.volume + 0.1);
    }

    decreaseVolume() {
        this.setVolume(this.volume - 0.1);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.currentMusic) {
            this.currentMusic.volume = this.isMuted ? 0 : this.volume;
        }
    }

    startMusic() {
        if (!this.currentMusic) {
            this.init();
        }
        // No reproducir música automáticamente, esperar a una interacción del usuario
        this.currentMusic.src = this.playlist[this.currentTrackIndex];
    }

    // Método para llamar después de una interacción del usuario
    userInteractionStartMusic() {
        if (this.currentMusic && this.currentMusic.paused) {
            this.playNextTrack();
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
    }

    pauseMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }

    resumeMusic() {
        if (this.currentMusic) {
            this.currentMusic.play().catch(error => {
                console.error('Error resumiendo música:', error);
            });
        }
    }
}

window.AudioManager = AudioManager;
