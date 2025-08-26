// Script para carregar dinamicamente o conteúdo da biografia
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o arquivo de configuração foi carregado
    if (typeof bioConfig === 'undefined') {
        console.error('Erro: Arquivo de configuração da biografia não encontrado.');
        return;
    }
    
    // Elementos do DOM
    const bioTitle = document.getElementById('bio-title');
    const bioSubtitle = document.getElementById('bio-subtitle');
    const bioText = document.getElementById('bio-text');
    const bioImageMain = document.getElementById('bio-image-main');
    const bioImageSecondary = document.getElementById('bio-image-secondary');
    
    // Carregar título e subtítulo
    if (bioTitle) bioTitle.textContent = bioConfig.title || 'Biografia';
    if (bioSubtitle) bioSubtitle.textContent = bioConfig.subtitle || '';
    
    // Carregar parágrafos
    if (bioText) {
        // Limpar conteúdo de carregamento
        bioText.innerHTML = '';
        
        // Adicionar parágrafos
        if (bioConfig.paragraphs && Array.isArray(bioConfig.paragraphs)) {
            bioConfig.paragraphs.forEach(paragraph => {
                const p = document.createElement('p');
                p.innerHTML = paragraph; // Usar innerHTML para permitir formatação HTML básica
                bioText.appendChild(p);
            });
        } else {
            // Fallback se não houver parágrafos configurados
            const p = document.createElement('p');
            p.textContent = 'Conteúdo da biografia não encontrado. Edite o arquivo js/bio-config.js para adicionar seu texto.';
            bioText.appendChild(p);
        }
    }
    
    // Carregar imagens
    if (bioImageMain && bioConfig.images && bioConfig.images.main) {
        bioImageMain.src = bioConfig.images.main;
        bioImageMain.alt = bioConfig.title || 'Imagem principal';
        
        // Tratamento de erro para imagem principal
        bioImageMain.onerror = function() {
            this.src = 'images/placeholder.jpg';
            this.alt = 'Imagem não disponível';
            console.error('Erro ao carregar imagem principal da biografia.');
        };
    }
    
    if (bioImageSecondary && bioConfig.images && bioConfig.images.secondary) {
        bioImageSecondary.src = bioConfig.images.secondary;
        bioImageSecondary.alt = bioConfig.title ? bioConfig.title + ' (imagem secundária)' : 'Imagem secundária';
        
        // Tratamento de erro para imagem secundária
        bioImageSecondary.onerror = function() {
            this.src = 'images/placeholder.jpg';
            this.alt = 'Imagem não disponível';
            console.error('Erro ao carregar imagem secundária da biografia.');
        };
    }
});
