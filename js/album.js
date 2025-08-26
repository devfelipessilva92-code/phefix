// Script para carregar dinamicamente o álbum de fotos local com estilo mosaico
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o arquivo de configuração foi carregado
    if (typeof albumConfig === 'undefined') {
        console.error('Erro: Arquivo de configuração do álbum não encontrado.');
        showError('Configuração do álbum não encontrada. Verifique o arquivo js/album-config.js.');
        return;
    }
    
    // Elementos do DOM
    const albumGrid = document.getElementById('instagram-feed');
    const albumTitle = document.querySelector('.album-header h1');
    const albumSubtitle = document.querySelector('.album-header h2');
    const albumInfo = document.querySelector('.instagram-info span');
    
    // Variáveis globais para o lightbox
    let currentImageIndex = 0;
    let allImages = [];
    
    // Atualizar título e subtítulo na página
    if (albumTitle) {
        albumTitle.textContent = albumConfig.title || 'Álbum de Fotos';
    }
    
    if (albumSubtitle) {
        albumSubtitle.textContent = albumConfig.subtitle || 'Fotos da banda';
    }
    
    // Atualizar informação adicional
    if (albumInfo) {
        albumInfo.textContent = 'Mosaico de Fotos';
    }
    
    // Função para exibir mensagem de erro
    function showError(message) {
        if (albumGrid) {
            albumGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                    <p>Verifique a configuração no arquivo js/album-config.js</p>
                </div>
            `;
        }
    }
    
    // Função para formatar data
    function formatDate(dateString) {
        // Se já estiver no formato DD/MM/AAAA, retorna como está
        if (dateString && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            return dateString;
        }
        
        // Caso contrário, tenta converter
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
    
    // Função para atribuir classes de tamanho para criar o efeito mosaico
    // Distribuição específica: 1 large (2x2), 1 tall (1x2), 1 wide (2x1) e o restante small (1x1)
    function assignMosaicClass(index, totalItems) {
        // Padrão fixo para garantir exatamente 16 grids:
        // 1 large (2x2 = 4 grids) + 1 tall (1x2 = 2 grids) + 1 wide (2x1 = 2 grids) + 8 small (1x1 = 8 grids) = 16 grids
        const fixedPattern = [
            'large',  // 1 imagem large (4 grids)
            'tall',   // 1 imagem tall (2 grids)
            'wide',   // 1 imagem wide (2 grids)
            'small', 'small', 'small', 'small', 'small', 'small', 'small', 'small'  // 8 imagens small (8 grids)
        ];
        
        // Total de imagens necessárias: 11 (1 + 1 + 1 + 8)
        const requiredImages = 11;
        
        // Se temos menos imagens que o necessário, preencher com small
        if (totalItems < requiredImages) {
            // Garantir pelo menos 1 large, depois preencher com small
            if (index === 0) return 'large';
            return 'small';
        }
        
        // Se temos mais imagens que o necessário, usar apenas as primeiras 11
        if (index >= requiredImages) {
            return null; // Não usar esta imagem
        }
        
        // Retornar classe baseada no padrão fixo
        return fixedPattern[index];
    }
    
    // Função para criar elemento de foto do álbum
    function createAlbumItem(item, index, totalItems) {
        const itemElement = document.createElement('div');
        
        // Atribuir classe base e classe de tamanho para efeito mosaico
        itemElement.className = 'instagram-post';
        const mosaicClass = assignMosaicClass(index, totalItems);
        
        // Se a função retornar null, não usar esta imagem
        if (mosaicClass === null) {
            return null;
        }
        
        if (mosaicClass) {
            itemElement.classList.add(mosaicClass);
        }
        
        itemElement.dataset.index = index;
        
        // Container para a imagem
        const imageContainer = document.createElement('div');
        imageContainer.className = 'album-image-container';
        
        // Imagem com lazy loading otimizado
        const img = document.createElement('img');
        
        // Placeholder mais leve para carregamento inicial
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPi4uLjwvdGV4dD48L3N2Zz4=';
        img.dataset.src = item.path; // URL real da imagem
        img.alt = item.caption || `Foto ${index + 1}`;
        img.className = 'lazy-image';
        
        // Preload das primeiras 3 imagens para carregamento mais rápido
        if (index < 3) {
            img.loading = 'eager';
            img.src = item.path;
            img.classList.add('loaded');
        } else {
            // Implementar Intersection Observer para lazy loading das demais imagens
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            const tempImg = new Image();
                            
                            // Preload da imagem antes de exibir
                            tempImg.onload = () => {
                                img.src = img.dataset.src;
                                img.classList.remove('lazy-image');
                                img.classList.add('loaded');
                            };
                            
                            tempImg.onerror = () => {
                                img.alt = 'Erro ao carregar imagem';
                                img.classList.add('error');
                            };
                            
                            tempImg.src = img.dataset.src;
                            observer.unobserve(img);
                        }
                    });
                }, {
                    rootMargin: '100px 0px', // Carregar 100px antes de aparecer
                    threshold: 0.1
                });
                
                imageObserver.observe(img);
            } else {
                // Fallback para navegadores sem suporte ao Intersection Observer
                img.src = item.path;
                img.classList.add('loaded');
            }
        }
        
        // Adicionar evento de clique para abrir imagem em tamanho maior
        itemElement.addEventListener('click', function() {
            currentImageIndex = parseInt(this.dataset.index);
            openLightbox();
        });
        
        // Overlay com informações
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        // Adicionar legenda se configurado
        if (albumConfig.settings.showCaption && item.caption) {
            const caption = document.createElement('div');
            caption.className = 'caption';
            caption.textContent = item.caption;
            overlay.appendChild(caption);
        }
        
        // Adicionar data se configurado
        if (albumConfig.settings.showDate && item.date) {
            const date = document.createElement('div');
            date.className = 'date';
            date.textContent = formatDate(item.date);
            overlay.appendChild(date);
        }
        
        // Montar estrutura do item
        imageContainer.appendChild(img);
        imageContainer.appendChild(overlay);
        itemElement.appendChild(imageContainer);
        
        return itemElement;
    }
    
    // Função para navegar para a imagem anterior
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
        updateLightboxContent();
    }
    
    // Função para navegar para a próxima imagem
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % allImages.length;
        updateLightboxContent();
    }
    
    // Função para atualizar o conteúdo do lightbox
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
    
    // Função para abrir lightbox com imagem ampliada
    function openLightbox() {
        // Verificar se já existe um lightbox aberto
        if (document.querySelector('.lightbox')) {
            return;
        }
        
        // Criar elementos do lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';
        
        const lightboxImage = document.createElement('img');
        lightboxImage.src = allImages[currentImageIndex].path;
        lightboxImage.alt = allImages[currentImageIndex].caption || `Foto ${currentImageIndex + 1}`;
        
        const closeButton = document.createElement('span');
        closeButton.className = 'lightbox-close';
        closeButton.innerHTML = '&times;';
        closeButton.title = 'Fechar';
        
        // Botões de navegação
        const prevButton = document.createElement('button');
        prevButton.className = 'lightbox-nav lightbox-prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.title = 'Anterior';
        prevButton.addEventListener('click', function(e) {
            e.stopPropagation();
            prevImage();
        });
        
        const nextButton = document.createElement('button');
        nextButton.className = 'lightbox-nav lightbox-next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.title = 'Próxima';
        nextButton.addEventListener('click', function(e) {
            e.stopPropagation();
            nextImage();
        });
        
        // Contador de imagens
        const counter = document.createElement('div');
        counter.className = 'lightbox-counter';
        counter.textContent = `${currentImageIndex + 1} / ${allImages.length}`;
        
        // Adicionar legenda se disponível
        const lightboxCaption = document.createElement('div');
        lightboxCaption.className = 'lightbox-caption';
        if (allImages[currentImageIndex].caption) {
            lightboxCaption.textContent = allImages[currentImageIndex].caption;
        } else {
            lightboxCaption.style.display = 'none';
        }
        
        // Montar estrutura do lightbox
        lightboxContent.appendChild(lightboxImage);
        lightboxContent.appendChild(lightboxCaption);
        lightbox.appendChild(closeButton);
        lightbox.appendChild(prevButton);
        lightbox.appendChild(nextButton);
        lightbox.appendChild(counter);
        lightbox.appendChild(lightboxContent);
        document.body.appendChild(lightbox);
        
        // Impedir rolagem do body enquanto lightbox estiver aberto
        document.body.style.overflow = 'hidden';
        
        // Adicionar evento para fechar o lightbox
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target === closeButton) {
                document.body.removeChild(lightbox);
                document.body.style.overflow = '';
            }
        });
        
        // Adicionar eventos de teclado
        document.addEventListener('keydown', handleKeyDown);
        
        // Função para lidar com eventos de teclado
        function handleKeyDown(e) {
            if (!document.querySelector('.lightbox')) {
                document.removeEventListener('keydown', handleKeyDown);
                return;
            }
            
            switch (e.key) {
                case 'Escape':
                    const lightbox = document.querySelector('.lightbox');
                    if (lightbox) {
                        document.body.removeChild(lightbox);
                        document.body.style.overflow = '';
                        document.removeEventListener('keydown', handleKeyDown);
                    }
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        }
    }
    
    // Função para preload das primeiras imagens (críticas)
    function preloadCriticalImages(images, count = 3) {
        const criticalImages = images.slice(0, count);
        criticalImages.forEach(image => {
            const img = new Image();
            img.src = image.path;
        });
    }
    
    // Função para descobrir imagens na pasta automaticamente
    async function discoverImages() {
        const imageFolder = albumConfig.imageFolder || "images/albuns";
        const supportedExtensions = albumConfig.supportedExtensions || ["jpg", "jpeg", "png"];
        const maxImages = 11; // Exatamente 11 imagens para o padrão fixo
        
        // Lista de nomes de arquivos comuns que podem existir na pasta
        const commonImageNames = [
            'IMG-0982', 'IMG-20220626-WA0024', 'IMG-20220626-WA0026', 'IMG-20220627-WA0005',
            'IMG-20220626-WA0033', 'IMG-20230902-WA0013', 'IMG-1033-1', 'IMG-20220627-WA0023',
            'IMG-20220627-WA0020', 'IMG-1001', 'IMG-1002', 'IMG-1003', 'IMG-1004', 'IMG-1005',
            'IMG-1006', 'IMG-1007', 'IMG-1008', 'IMG-1009', 'IMG-1010', 'IMG-1011', 'IMG-1012',
            'IMG-1013', 'IMG-1014', 'IMG-1015', 'IMG-1016', 'IMG-1017', 'IMG-1018', 'IMG-1019',
            'IMG-1020', 'foto1', 'foto2', 'foto3', 'foto4', 'foto5', 'foto6', 'foto7', 'foto8',
            'foto9', 'foto10', 'foto11', 'foto12', 'image1', 'image2', 'image3', 'image4',
            'image5', 'image6', 'image7', 'image8', 'image9', 'image10', 'image11', 'image12'
        ];
        
        const discoveredImages = [];
        
        // Tentar encontrar imagens testando diferentes combinações
        for (const baseName of commonImageNames) {
            for (const ext of supportedExtensions) {
                const imagePath = `${imageFolder}/${baseName}.${ext}`;
                
                try {
                    // Testar se a imagem existe tentando carregá-la
                    const img = new Image();
                    const imageExists = await new Promise((resolve) => {
                        img.onload = () => resolve(true);
                        img.onerror = () => resolve(false);
                        img.src = imagePath;
                    });
                    
                    if (imageExists) {
                        discoveredImages.push({
                            path: imagePath,
                            caption: "PHFIX",
                            date: new Date().toLocaleDateString('pt-BR')
                        });
                        
                        // Parar quando atingir o número máximo
                        if (discoveredImages.length >= maxImages) {
                            break;
                        }
                    }
                } catch (error) {
                    // Continuar tentando outras imagens
                    continue;
                }
            }
            
            // Parar quando atingir o número máximo
            if (discoveredImages.length >= maxImages) {
                break;
            }
        }
        
        return discoveredImages;
    }
    
    // Função para embaralhar array (algoritmo Fisher-Yates)
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Função para carregar o álbum de fotos
    async function loadAlbum() {
        try {
            let imagesToUse = [];
            
            // Verificar se há imagens configuradas manualmente
            if (albumConfig.albumImages && Array.isArray(albumConfig.albumImages) && albumConfig.albumImages.length > 0) {
                imagesToUse = [...albumConfig.albumImages];
            } else {
                // Descobrir imagens automaticamente na pasta
                imagesToUse = await discoverImages();
            }
            
            // Se não encontrou imagens, mostrar erro
            if (imagesToUse.length === 0) {
                throw new Error('Nenhuma imagem encontrada na pasta ' + (albumConfig.imageFolder || 'images/albuns'));
            }
            
            // Embaralhar as imagens para seleção aleatória
            imagesToUse = shuffleArray(imagesToUse);
            
            // Limitar ao número máximo configurado para o padrão fixo
            // 1 large + 1 tall + 1 wide + 8 small = 11 imagens
            const maxImages = 11; // Exatamente 11 imagens
            imagesToUse = imagesToUse.slice(0, maxImages);
            
            // Armazenar todas as imagens para uso no lightbox
            allImages = [...imagesToUse];
            
            // Preload das primeiras 3 imagens para carregamento mais rápido
            preloadCriticalImages(imagesToUse, 3);
            
            // Ordenar por data se configurado (mas manter aleatoriedade)
            if (albumConfig.settings.sortByDate) {
                // Como já embaralhamos, vamos manter a ordem aleatória
                // mas ainda permitir a configuração funcionar se necessário
            }
            
            // Usar as imagens selecionadas
            let displayImages = imagesToUse;
            
            // Limpar o container
            if (albumGrid) {
                albumGrid.innerHTML = '';
                
                // Adicionar as imagens ao álbum com efeito mosaico
                displayImages.forEach((image, index) => {
                    const imageElement = createAlbumItem(image, index, displayImages.length);
                    // Só adicionar se o elemento não for null
                    if (imageElement) {
                        albumGrid.appendChild(imageElement);
                    }
                });
                
                // Se não houver imagens, mostrar mensagem
                if (displayImages.length === 0) {
                    albumGrid.innerHTML = `
                        <div class="error-message">
                            <p>Nenhuma foto encontrada no álbum</p>
                        </div>
                    `;
                }
            }
            
        } catch (error) {
            console.error('Erro ao carregar álbum de fotos:', error);
            showError(`Erro ao carregar álbum de fotos: ${error.message}`);
        }
    }
    
    // Carregar o álbum de fotos
    loadAlbum();
});
