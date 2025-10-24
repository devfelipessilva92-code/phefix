// Album com padrão alternado correto de imagens
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const mosaicContainer = document.getElementById('mosaic-container');
    
    // Variáveis globais
    let currentImageIndex = 0;
    let allImages = [];
    let lightbox = null;
    
    // Configurações
    const IMAGE_FOLDER = './images/album/';
    const TOTAL_IMAGES = 35; // Número total de imagens para carregar
    
    // Função para mostrar erro
    function showError(message) {
        if (mosaicContainer) {
            mosaicContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
    
    // Função para criar peça do mosaico
    function createMosaicPiece(imagePath, index) {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'mosaic-piece';
        pieceElement.dataset.index = index;
        
        // Imagem
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = `Foto ${index + 1}`;
        img.className = 'mosaic-image';
        
        // Evento de clique para lightbox
        pieceElement.addEventListener('click', function() {
            currentImageIndex = parseInt(this.dataset.index);
            openLightbox();
        });
        
        // Montar estrutura
        pieceElement.appendChild(img);
        
        return pieceElement;
    }
    
    // Lightbox functions
    function openLightbox() {
        if (lightbox) {
            lightbox.classList.add('active');
            updateLightboxContent();
            document.body.style.overflow = 'hidden';
            return;
        }
        
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        const content = document.createElement('div');
        content.className = 'lightbox-content';
        
        const img = document.createElement('img');
        img.alt = '';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', closeLightbox);
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'lightbox-nav lightbox-prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox(-1);
        });
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'lightbox-nav lightbox-next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox(1);
        });
        
        const counter = document.createElement('div');
        counter.className = 'lightbox-counter';
        
        content.appendChild(img);
        lightbox.appendChild(closeBtn);
        lightbox.appendChild(prevBtn);
        lightbox.appendChild(nextBtn);
        lightbox.appendChild(counter);
        lightbox.appendChild(content);
        
        document.body.appendChild(lightbox);
        
        // Atualizar conteúdo e mostrar
        setTimeout(() => {
            lightbox.classList.add('active');
            updateLightboxContent();
            document.body.style.overflow = 'hidden';
        }, 10);
        
        // Adicionar eventos de teclado
        document.addEventListener('keydown', handleKeyDown);
    }
    
    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            setTimeout(() => {
                if (lightbox && lightbox.parentNode) {
                    lightbox.parentNode.removeChild(lightbox);
                    lightbox = null;
                }
                document.body.style.overflow = '';
            }, 300);
            document.removeEventListener('keydown', handleKeyDown);
        }
    }
    
    function updateLightboxContent() {
        if (!lightbox) return;
        
        const currentImage = allImages[currentImageIndex];
        const lightboxImage = lightbox.querySelector('img');
        const lightboxCounter = lightbox.querySelector('.lightbox-counter');
        
        lightboxImage.src = currentImage;
        lightboxImage.alt = `Foto ${currentImageIndex + 1}`;
        
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${allImages.length}`;
    }
    
    function navigateLightbox(direction) {
        currentImageIndex = (currentImageIndex + direction + allImages.length) % allImages.length;
        updateLightboxContent();
    }
    
    function handleKeyDown(e) {
        if (!lightbox) return;
        
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
        }
    }
    
    // Função para verificar se uma imagem existe
    function checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    // Função para descobrir imagens JPG na pasta
    async function discoverJpgImages() {
        const discoveredImages = [];
        
        // Verificar imagens de 1 a TOTAL_IMAGES
        for (let i = 1; i <= TOTAL_IMAGES; i++) {
            const imagePath = `${IMAGE_FOLDER}${i}.jpg`;
            
            try {
                const exists = await checkImageExists(imagePath);
                if (exists) {
                    discoveredImages.push(imagePath);
                }
            } catch (error) {
                console.warn(`Erro ao verificar imagem ${imagePath}:`, error);
            }
        }
        
        return discoveredImages;
    }
    
    // Função para carregar álbum
    async function loadAlbum() {
        try {
            // Mostrar mensagem de carregamento
            if (mosaicContainer) {
                mosaicContainer.innerHTML = `
                    <div class="loading-message">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Carregando fotos...</p>
                    </div>
                `;
            }
            
            // Descobrir imagens JPG na pasta
            const imagesToUse = await discoverJpgImages();
            
            if (imagesToUse.length === 0) {
                throw new Error('Nenhuma imagem JPG encontrada na pasta ./images/album/');
            }
            
            allImages = [...imagesToUse];
            
            // Limpar e popular o mosaico
            if (mosaicContainer) {
                mosaicContainer.innerHTML = '';
                
                imagesToUse.forEach((imagePath, index) => {
                    const element = createMosaicPiece(imagePath, index);
                    if (element) {
                        mosaicContainer.appendChild(element);
                    }
                });
                
                // Adicionar mensagem se não houver imagens suficientes
                /*
                if (imagesToUse.length < TOTAL_IMAGES) {
                    const message = document.createElement('div');
                    message.className = 'error-message';
                    message.innerHTML = `<p>Encontradas ${imagesToUse.length} imagens. Adicione mais imagens na pasta para preencher completamente o mosaico.</p>`;
                    mosaicContainer.appendChild(message);
                }
                */
            }
            
        } catch (error) {
            console.error('Erro ao carregar álbum:', error);
            showError(`Erro: ${error.message}`);
        }
    }
    
    // Iniciar carregamento do álbum
    loadAlbum();
});