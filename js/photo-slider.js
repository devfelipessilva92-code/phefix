// Photo Slider com Animação de Círculo - Apenas Transição Automática
document.addEventListener('DOMContentLoaded', function() {
    // Usar as imagens do arquivo de configuração externo
    // O array sliderImages é carregado do arquivo slider-config.js
    const imageUrls = sliderImages || [];
    
    // Elementos do DOM
    const sliderContainer = document.querySelector('.slider-container');
    const sliderDots = document.querySelector('.slider-dots');
    
    // Variáveis de controle
    let currentIndex = 0;
    let isAnimating = false;
    let autoSlideInterval;
    
    // Função para converter links do Google Drive para links diretos
    function convertGoogleDriveLink(url) {
        if (!url || typeof url !== 'string') return url;
        
        // Verificar se é um link do Google Drive
        const driveRegex = /drive\.google\.com\/file\/d\/(.*?)\/view/i;
        const match = url.match(driveRegex);
        
        if (match && match[1]) {
            // Converter para link direto
            return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        
        // Verificar se é um link do Dropbox
        if (url.includes('dropbox.com') && url.includes('?dl=0')) {
            return url.replace('?dl=0', '?raw=1');
        }
        
        return url;
    }
    
    // Função para inicializar o slider
    function initSlider() {
        // Verificar se há imagens configuradas
        if (imageUrls.length === 0) {
            console.warn("Nenhuma imagem configurada para o slider. Adicione URLs de imagens no arquivo slider-config.js");
            return;
        }
        
        // Limpar conteúdo existente
        sliderContainer.innerHTML = '';
        sliderDots.innerHTML = '';
        
        // Criar elementos de imagem
        imageUrls.forEach((url, index) => {
            // Converter link se necessário
            const processedUrl = convertGoogleDriveLink(url);
            
            const img = document.createElement('img');
            img.src = processedUrl;
            img.alt = `Slide Image ${index + 1}`;
            img.classList.add('slider-image');
            
            // Primeira imagem ativa
            if (index === 0) {
                img.classList.add('active');
            }
            
            sliderContainer.appendChild(img);
            
            // Criar pontos de navegação (apenas indicadores visuais)
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) {
                dot.classList.add('active');
            }
            
            sliderDots.appendChild(dot);
        });
        
        // Iniciar autoplay
        startAutoSlide();
    }
    
    // Função para criar e animar o círculo de transição
    function createCircleAnimation(nextIndex) {
        // Criar elemento de círculo
        const circle = document.createElement('div');
        circle.classList.add('circle-animation');
        sliderContainer.appendChild(circle);
        
        // Obter dimensões para garantir que o círculo cubra toda a tela
        const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 2;
        
        // Iniciar animação
        isAnimating = true;
        
        // Animar o círculo saindo do centro
        setTimeout(() => {
            circle.style.transition = 'transform 0.8s cubic-bezier(0.86, 0, 0.07, 1)';
            circle.style.transform = `translate(-50%, -50%) scale(${maxDimension})`;
            
            // Trocar imagem quando o círculo estiver no meio da animação
            setTimeout(() => {
                // Remover classe ativa da imagem atual
                const currentImage = document.querySelectorAll('.slider-image')[currentIndex];
                currentImage.classList.remove('active');
                
                // Atualizar índice atual
                currentIndex = nextIndex;
                
                // Adicionar classe ativa à próxima imagem
                const nextImage = document.querySelectorAll('.slider-image')[currentIndex];
                nextImage.classList.add('active');
                
                // Atualizar pontos de navegação
                updateDots();
                
                // Remover círculo após a animação
                setTimeout(() => {
                    circle.remove();
                    isAnimating = false;
                }, 100);
                
            }, 400); // Metade do tempo da animação
            
        }, 50);
    }
    
    // Função para ir para o próximo slide automaticamente
    function goToNextSlide() {
        if (isAnimating) return;
        
        let nextIndex = currentIndex + 1;
        
        // Verificar limites
        if (nextIndex >= document.querySelectorAll('.slider-image').length) {
            nextIndex = 0;
        }
        
        // Criar animação de círculo
        createCircleAnimation(nextIndex);
    }
    
    // Função para atualizar os pontos de navegação
    function updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Função para iniciar o autoplay
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            if (!isAnimating) {
                goToNextSlide();
            }
        }, 10000); // Trocar slide a cada 10 segundos (conforme solicitado)
    }
    
    // Inicializar o slider
    initSlider();
});
