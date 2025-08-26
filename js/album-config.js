/**
 * CONFIGURAÇÃO DO ÁLBUM DE FOTOS LOCAL
 * 
 * INSTRUÇÕES PARA CONFIGURAR O ÁLBUM DE FOTOS:
 * 
 * 1. Para usar imagens locais (recomendado):
 *    - Adicione suas imagens na pasta "images/album" do site
 *    - Use o caminho relativo: "images/album/nome-da-imagem.jpg"
 *    - Formatos suportados: JPG, JPEG, PNG, GIF, WEBP
 * 
 * 2. Para cada imagem, você pode configurar:
 *    - path: Caminho da imagem (local ou URL)
 *    - caption: Legenda da imagem (opcional)
 *    - date: Data da imagem no formato DD/MM/AAAA (opcional)
 * 
 * 3. Adicione quantas imagens desejar no array 'albumImages'
 */

const albumConfig = {
    // Título do álbum
    title: "Ensaio Fotográfico",
    
    // Subtítulo do álbum
    subtitle: "",
    
    // Configurações adicionais
    settings: {
        // Número de fotos por página (0 = todas)
        itemsPerPage: 0,
        
        // Ordenar por data (mais recentes primeiro)
        sortByDate: true,
        
        // Exibir legenda das fotos
        showCaption: true,
        
        // Exibir data das fotos
        showDate: true
    },
    
    // Lista de imagens do álbum - será preenchida dinamicamente
    albumImages: [
        // As imagens serão carregadas automaticamente da pasta images/albuns
    ],
    
    // Configuração da pasta de imagens
    imageFolder: "images/album",
    
    // Extensões de arquivo suportadas
    supportedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
    
    // Número total de imagens a serem exibidas
    maxImages: 16
};
