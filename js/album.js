document.addEventListener('DOMContentLoaded', function() {
    if (typeof albumConfig === 'undefined') {
        console.error('Erro: Arquivo de configuração do álbum não encontrado.');
        showError('Configuração do álbum não encontrada. Verifique o arquivo js/album-config.js.');
        return;
    }
    
    // Elementos do DOM
    const albumGrid = document.getElementById('album-grid');
    const albumTitle = document.querySelector('.album-header h1');
    const albumSubtitle = document.querySelector('.album-header h2');
    
    // Variáveis globais para o lightbox
    let currentImageIndex = 0;
    let allImages = [];
    
    // Atualizar título
    if (albumTitle) {
        albumTitle.textContent = albumConfig.title || 'Álbum de Fotos';
    }
    
    if (albumSubtitle) {
        albumSubtitle.textContent = albumConfig.subtitle || '';
    }
    
    function showError(message) {
        if (albumGrid) {
            albumGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
    
    function formatDate(dateString) {
        if (dateString && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return dateString;
        }
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString || '';
        }
    }
    
    function assignMosaicClass(index) {
        const fixedPattern = [
            'large', 'tall', 'wide', 
            'small', 'small', 'small', 
            'small', 'small', 'small', 
            'small', 'small'
        ];
        return fixedPattern[index] || 'small';
    }
    
    // Função corrigida para carregar imagens
    function loadImage(item, container) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                // Mantém o overlay e adiciona a imagem
                container.insertBefore(img, container.firstChild);
                resolve();
            };
            img.onerror = function() {
                console.error('Erro ao carregar imagem:', item.path);
                // Mantém o placeholder se a imagem não carregar
                resolve();
            };
            img.src = item.path;
            img.alt = item.caption || 'Foto do álbum';
            img.className = 'album-image'; // Classe importante para o CSS
            img.loading = 'lazy';
        });
    }
    
    function createAlbumItem(item, index) {
        const itemElement = document.createElement('div');
        itemElement.className = 'album-post';
        
        const mosaicClass = assignMosaicClass(index);
        itemElement.classList.add(mosaicClass);
        itemElement.dataset.index = index;
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'album-image-container';
        
        // Cria a estrutura do overlay (legenda e data)
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        if (albumConfig.settings.showCaption && item.caption) {
            const caption = document.createElement('div');
            caption.className = 'caption';
            caption.textContent = item.caption;
            overlay.appendChild(caption);
        }
        
        if (albumConfig.settings.showDate && item.date) {
            const date = document.createElement('div');
            date.className = 'date';
            date.textContent = formatDate(item.date);
            overlay.appendChild(date);
        }
        
        imageContainer.appendChild(overlay);
        itemElement.appendChild(imageContainer);
        
        // Adiciona evento de clique para abrir o lightbox
        itemElement.addEventListener('click', function() {
            currentImageIndex = parseInt(this.dataset.index);
            openLightbox();
        });
        
        // Carrega a imagem de forma assíncrona
        setTimeout(() => {
            loadImage(item, imageContainer);
        }, index * 300);
        
        return itemElement;
    }
    
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
        updateLightboxContent();
    }
    
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % allImages.length;
        updateLightboxContent();
    }
    
    function updateLightboxContent() {
        const currentImage = allImages[currentImageIndex];
        const lightboxImage = document.querySelector('.lightbox img');
        const lightboxCaption = document.querySelector('.lightbox-caption');
        const lightboxCounter = document.querySelector('.lightbox-counter');
        
        if (lightboxImage) {
            lightboxImage.src = currentImage.path;
            lightboxImage.alt = currentImage.caption || `Foto ${currentImageIndex + 1}`;
        }
        
        if (lightboxCaption) {
            if (currentImage.caption) {
                lightboxCaption.textContent = currentImage.caption;
                lightboxCaption.style.display = 'block';
            } else {
                lightboxCaption.style.display = 'none';
            }
        }
        
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${allImages.length}`;
        }
    }
    
    function openLightbox() {
        if (document.querySelector('.lightbox')) {
            return;
        }
        
        const currentImage = allImages[currentImageIndex];
        
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';
        
        const img = document.createElement('img');
        img.src = currentImage.path;
        img.alt = currentImage.caption || `Foto ${currentImageIndex + 1}`;
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.title = 'Fechar';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'lightbox-nav lightbox-prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.title = 'Anterior';
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            prevImage();
        });
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'lightbox-nav lightbox-next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.title = 'Próxima';
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            nextImage();
        });
        
        const counter = document.createElement('div');
        counter.className = 'lightbox-counter';
        counter.textContent = `${currentImageIndex + 1} / ${allImages.length}`;
        
        const caption = document.createElement('div');
        caption.className = 'lightbox-caption';
        if (currentImage.caption) {
            caption.textContent = currentImage.caption;
        } else {
            caption.style.display = 'none';
        }
        
        lightboxContent.appendChild(img);
        lightboxContent.appendChild(caption);
        lightbox.appendChild(closeBtn);
        lightbox.appendChild(prevBtn);
        lightbox.appendChild(nextBtn);
        lightbox.appendChild(counter);
        lightbox.appendChild(lightboxContent);
        document.body.appendChild(lightbox);
        
        document.body.style.overflow = 'hidden';
        
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target === closeBtn) {
                document.body.removeChild(lightbox);
                document.body.style.overflow = '';
            }
        });
        
        document.addEventListener('keydown', function handleKeyDown(e) {
            if (e.key === 'Escape') {
                if (document.querySelector('.lightbox')) {
                    document.body.removeChild(lightbox);
                    document.body.style.overflow = '';
                    document.removeEventListener('keydown', handleKeyDown);
                }
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            }
        });
    }
    
    function loadAlbum() {
        try {
            if (!albumConfig.albumImages || !Array.isArray(albumConfig.albumImages)) {
                throw new Error('Configuração de imagens inválida.');
            }
            
            // Usar apenas as 11 primeiras imagens
            const imagesToUse = albumConfig.albumImages.slice(0, 11);
            allImages = imagesToUse;
            
            if (albumGrid) {
                // Substituir placeholders
                const placeholders = document.querySelectorAll('.album-post.placeholder');
                
                placeholders.forEach((placeholder, index) => {
                    if (index < imagesToUse.length) {
                        const albumItem = createAlbumItem(imagesToUse[index], index);
                        placeholder.replaceWith(albumItem);
                    } else {
                        placeholder.remove();
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao carregar o álbum:', error);
            showError(`Erro ao carregar o álbum: ${error.message}`);
        }
    }
    
    // Iniciar o carregamento do álbum
    loadAlbum();
});