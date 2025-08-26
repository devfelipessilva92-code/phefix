// Audio Player
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do player
    const audioElement = document.getElementById('audio-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('progress');
    const progressContainer = document.querySelector('.progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    
    // Músicas disponíveis (pré-configuradas no player)
    const playlist = [
        {
            title: "Linkin Park - In The End",
            src: "https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3" // URL de exemplo, substituir por URL real
        },
        {
            title: "Linkin Park - Numb",
            src: "https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3" // URL de exemplo, substituir por URL real
        },
        {
            title: "Linkin Park - What I've Done",
            src: "https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3" // URL de exemplo, substituir por URL real
        }
    ];
    
    // Índice da música atual
    let currentTrackIndex = 0;
    
    // Carregar a primeira música
    loadTrack(currentTrackIndex);
    
    // Função para carregar uma música
    function loadTrack(index) {
        // Atualizar a fonte do áudio
        audioElement.src = playlist[index].src;
        
        // Carregar os metadados do áudio
        audioElement.load();
        
        // Atualizar o título da música (opcional, pode ser adicionado ao HTML)
        // document.getElementById('track-title').textContent = playlist[index].title;
        
        // Resetar a barra de progresso
        progressBar.style.width = '0%';
        
        // Atualizar os displays de tempo
        currentTimeDisplay.textContent = formatTime(0);
        durationDisplay.textContent = '0:00';
        
        // Atualizar o ícone de play/pause
        updatePlayPauseIcon();
    }
    
    // Função para formatar o tempo em minutos:segundos
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    // Atualizar o ícone do botão de play/pause
    function updatePlayPauseIcon() {
        if (audioElement.paused) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }
    
    // Atualizar o ícone do botão de mute
    function updateMuteIcon() {
        if (audioElement.muted || audioElement.volume === 0) {
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
    
    // Event listeners para os controles do player
    
    // Play/Pause
    playPauseBtn.addEventListener('click', function() {
        if (audioElement.paused) {
            audioElement.play();
        } else {
            audioElement.pause();
        }
        updatePlayPauseIcon();
    });
    
    // Mute/Unmute
    muteBtn.addEventListener('click', function() {
        audioElement.muted = !audioElement.muted;
        updateMuteIcon();
    });
    
    // Volume
    volumeSlider.addEventListener('input', function() {
        audioElement.volume = this.value / 100;
        
        if (audioElement.volume === 0) {
            audioElement.muted = true;
        } else {
            audioElement.muted = false;
        }
        
        updateMuteIcon();
    });
    
    // Atualizar a barra de progresso enquanto a música toca
    audioElement.addEventListener('timeupdate', function() {
        // Calcular a porcentagem de progresso
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.style.width = `${percent}%`;
        
        // Atualizar o display de tempo atual
        currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
    });
    
    // Atualizar o display de duração quando os metadados estiverem carregados
    audioElement.addEventListener('loadedmetadata', function() {
        durationDisplay.textContent = formatTime(audioElement.duration);
    });
    
    // Permitir clicar na barra de progresso para pular para um ponto específico
    progressContainer.addEventListener('click', function(e) {
        // Calcular a posição do clique em relação à largura total
        const clickPosition = e.offsetX / this.offsetWidth;
        
        // Definir o tempo atual com base na posição do clique
        audioElement.currentTime = clickPosition * audioElement.duration;
    });
    
    // Quando a música terminar, carregar a próxima
    audioElement.addEventListener('ended', function() {
        // Avançar para a próxima música
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        
        // Reproduzir automaticamente
        audioElement.play();
    });
    
    // Definir o volume inicial
    audioElement.volume = volumeSlider.value / 100;
});
