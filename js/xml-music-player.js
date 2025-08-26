/**
 * XML Music Player - Player de música integrado com dados XML
 */
class XMLMusicPlayer {
    constructor() {
        this.musicLoader = new XMLMusicLoader();
        this.youtubePlayer = null;
        this.isPlayerReady = false;
        this.isPlaying = false;
        this.currentMusic = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadMusicData();
    }

    /**
     * Inicializa os elementos DOM
     */
    initializeElements() {
        this.elements = {
            musicTitle: document.getElementById('music-title'),
            musicSubtitle: document.getElementById('music-subtitle'),
            lyricsContent: document.getElementById('lyrics-content'),
            playPauseBtn: document.getElementById('play-pause-btn'),
            nextTrackBtn: document.getElementById('next-track-btn'),
            prevTrackBtn: document.getElementById('prev-track-btn'),
            nextSongBtn: document.getElementById('next-song-btn'),
            currentTime: document.getElementById('current-time'),
            duration: document.getElementById('duration'),
            progress: document.getElementById('progress'),
            volumeSlider: document.getElementById('volume-slider'),
            muteBtn: document.getElementById('mute-btn')
        };
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Botões de controle
        if (this.elements.playPauseBtn) {
            this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        
        if (this.elements.nextTrackBtn) {
            this.elements.nextTrackBtn.addEventListener('click', () => this.nextMusic());
        }
        
        if (this.elements.prevTrackBtn) {
            this.elements.prevTrackBtn.addEventListener('click', () => this.previousMusic());
        }
        
        if (this.elements.nextSongBtn) {
            this.elements.nextSongBtn.addEventListener('click', () => this.nextMusic());
        }

        // Controle de volume
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
        }

        if (this.elements.muteBtn) {
            this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // Barra de progresso
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => this.seekTo(e));
        }
    }

    /**
     * Carrega os dados das músicas do XML
     */
    async loadMusicData() {
        try {
            await this.musicLoader.loadMusicData();
            this.currentMusic = this.musicLoader.getCurrentMusic();
            
            if (this.currentMusic) {
                this.updateUI();
                this.initializeYouTubePlayer();
            } else {
                this.showError('Nenhuma música encontrada no arquivo XML');
            }
            
        } catch (error) {
            console.error('Erro ao carregar músicas:', error);
            this.showError('Erro ao carregar as músicas. Verifique o arquivo XML.');
        }
    }

    /**
     * Inicializa o player do YouTube
     */
    initializeYouTubePlayer() {
        if (!this.currentMusic) return;

        // Aguardar a API do YouTube estar disponível
        if (typeof YT === 'undefined' || !YT.Player) {
            setTimeout(() => this.initializeYouTubePlayer(), 100);
            return;
        }

        this.youtubePlayer = new YT.Player('youtube-player-container', {
            height: '0',
            width: '0',
            videoId: this.currentMusic.youtubeId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                rel: 0,
                showinfo: 0
            },
            events: {
                onReady: (event) => this.onPlayerReady(event),
                onStateChange: (event) => this.onPlayerStateChange(event)
            }
        });
    }

    /**
     * Callback quando o player está pronto
     */
    onPlayerReady(event) {
        this.isPlayerReady = true;
        this.youtubePlayer.setVolume(80);
        this.startProgressUpdate();
        console.log('Player do YouTube pronto');
    }

    /**
     * Callback para mudanças de estado do player
     */
    onPlayerStateChange(event) {
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                this.isPlaying = true;
                this.updatePlayPauseButton();
                break;
            case YT.PlayerState.PAUSED:
                this.isPlaying = false;
                this.updatePlayPauseButton();
                break;
            case YT.PlayerState.ENDED:
                this.nextMusic();
                break;
        }
    }

    /**
     * Alterna entre play e pause
     */
    togglePlayPause() {
        if (!this.isPlayerReady) return;

        if (this.isPlaying) {
            this.youtubePlayer.pauseVideo();
        } else {
            this.youtubePlayer.playVideo();
        }
    }

    /**
     * Próxima música
     */
    nextMusic() {
        const nextMusic = this.musicLoader.nextMusic();
        if (nextMusic) {
            this.currentMusic = nextMusic;
            this.loadNewMusic();
        }
    }

    /**
     * Música anterior
     */
    previousMusic() {
        const prevMusic = this.musicLoader.previousMusic();
        if (prevMusic) {
            this.currentMusic = prevMusic;
            this.loadNewMusic();
        }
    }

    /**
     * Carrega uma nova música no player
     */
    loadNewMusic() {
        if (!this.currentMusic || !this.isPlayerReady) return;

        this.youtubePlayer.loadVideoById(this.currentMusic.youtubeId);
        this.updateUI();
        
        // Tocar automaticamente a nova música
        setTimeout(() => {
            if (this.isPlayerReady) {
                this.youtubePlayer.playVideo();
            }
        }, 1000);
    }

    /**
     * Atualiza a interface do usuário
     */
    updateUI() {
        if (!this.currentMusic) return;

        // Atualizar título e artista
        if (this.elements.musicTitle) {
            this.elements.musicTitle.textContent = this.currentMusic.titulo;
        }
        
        if (this.elements.musicSubtitle) {
            this.elements.musicSubtitle.textContent = this.currentMusic.artista;
        }

        // Atualizar letra
        if (this.elements.lyricsContent) {
            this.elements.lyricsContent.innerHTML = this.formatLyrics(this.currentMusic.letra);
        }

        console.log(`Música atual: ${this.currentMusic.titulo} - ${this.currentMusic.artista}`);
    }

    /**
     * Formata a letra da música
     */
    formatLyrics(letra) {
        if (!letra || letra === 'Letra não disponível') {
            return '<p class="no-lyrics">Letra não disponível</p>';
        }

        // Dividir por linhas e criar parágrafos
        const lines = letra.split('\n').filter(line => line.trim() !== '');
        return lines.map(line => `<p>${line.trim()}</p>`).join('');
    }

    /**
     * Atualiza o botão de play/pause
     */
    updatePlayPauseButton() {
        if (!this.elements.playPauseBtn) return;

        const icon = this.elements.playPauseBtn.querySelector('i');
        if (icon) {
            icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    /**
     * Controle de volume
     */
    setVolume(volume) {
        if (this.isPlayerReady) {
            this.youtubePlayer.setVolume(volume);
        }
    }

    /**
     * Alternar mute
     */
    toggleMute() {
        if (!this.isPlayerReady) return;

        if (this.youtubePlayer.isMuted()) {
            this.youtubePlayer.unMute();
            this.elements.muteBtn.querySelector('i').className = 'fas fa-volume-up';
        } else {
            this.youtubePlayer.mute();
            this.elements.muteBtn.querySelector('i').className = 'fas fa-volume-mute';
        }
    }

    /**
     * Buscar posição na música
     */
    seekTo(event) {
        if (!this.isPlayerReady) return;

        const progressContainer = event.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.offsetWidth;
        const duration = this.youtubePlayer.getDuration();
        const seekTime = duration * percentage;

        this.youtubePlayer.seekTo(seekTime);
    }

    /**
     * Atualiza a barra de progresso
     */
    startProgressUpdate() {
        setInterval(() => {
            if (this.isPlayerReady && this.youtubePlayer) {
                const currentTime = this.youtubePlayer.getCurrentTime();
                const duration = this.youtubePlayer.getDuration();

                if (duration > 0) {
                    const percentage = (currentTime / duration) * 100;
                    if (this.elements.progress) {
                        this.elements.progress.style.width = percentage + '%';
                    }

                    // Atualizar tempo
                    if (this.elements.currentTime) {
                        this.elements.currentTime.textContent = this.formatTime(currentTime);
                    }
                    if (this.elements.duration) {
                        this.elements.duration.textContent = this.formatTime(duration);
                    }
                }
            }
        }, 1000);
    }

    /**
     * Formata tempo em MM:SS
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        if (this.elements.lyricsContent) {
            this.elements.lyricsContent.innerHTML = `<p class="error-message">${message}</p>`;
        }
        
        if (this.elements.musicTitle) {
            this.elements.musicTitle.textContent = 'Erro';
        }
        
        if (this.elements.musicSubtitle) {
            this.elements.musicSubtitle.textContent = 'Não foi possível carregar as músicas';
        }
    }
}

// Inicializar o player quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar a API do YouTube estar disponível
    window.onYouTubeIframeAPIReady = () => {
        new XMLMusicPlayer();
    };
    
    // Fallback caso a API já esteja carregada
    if (typeof YT !== 'undefined' && YT.Player) {
        new XMLMusicPlayer();
    }
});

