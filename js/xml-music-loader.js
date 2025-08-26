/**
 * XML Music Loader - Carrega músicas do arquivo XML
 */
class XMLMusicLoader {
    constructor() {
        this.musicas = [];
        this.currentIndex = 0;
        this.xmlPath = 'musicas_data/musicas.xml';
    }

    /**
     * Carrega o arquivo XML com as músicas
     */
    async loadMusicData() {
        try {
            const response = await fetch(this.xmlPath);
            if (!response.ok) {
                throw new Error(`Erro ao carregar XML: ${response.status}`);
            }
            
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Verificar se há erros de parsing
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Erro ao fazer parse do XML');
            }
            
            this.parseXMLData(xmlDoc);
            return this.musicas;
            
        } catch (error) {
            console.error('Erro ao carregar dados das músicas:', error);
            throw error;
        }
    }

    /**
     * Faz o parse dos dados XML
     */
    parseXMLData(xmlDoc) {
        const musicasNodes = xmlDoc.querySelectorAll('musica');
        this.musicas = [];
        
        musicasNodes.forEach((musicaNode, index) => {
            const titulo = this.getTextContent(musicaNode, 'titulo');
            const artista = this.getTextContent(musicaNode, 'artista');
            const youtubeId = this.getTextContent(musicaNode, 'youtube_id');
            const letra = this.getTextContent(musicaNode, 'letra');
            
            if (titulo && artista && youtubeId) {
                this.musicas.push({
                    id: index,
                    titulo,
                    artista,
                    youtubeId,
                    letra: letra || 'Letra não disponível'
                });
            }
        });
        
        console.log(`Carregadas ${this.musicas.length} músicas do XML`);
    }

    /**
     * Obtém o conteúdo de texto de um elemento XML
     */
    getTextContent(parentNode, tagName) {
        const element = parentNode.querySelector(tagName);
        return element ? element.textContent.trim() : '';
    }

    /**
     * Obtém a música atual
     */
    getCurrentMusic() {
        return this.musicas[this.currentIndex] || null;
    }

    /**
     * Avança para a próxima música
     */
    nextMusic() {
        if (this.musicas.length === 0) return null;
        
        this.currentIndex = (this.currentIndex + 1) % this.musicas.length;
        return this.getCurrentMusic();
    }

    /**
     * Volta para a música anterior
     */
    previousMusic() {
        if (this.musicas.length === 0) return null;
        
        this.currentIndex = (this.currentIndex - 1 + this.musicas.length) % this.musicas.length;
        return this.getCurrentMusic();
    }

    /**
     * Define a música atual por índice
     */
    setCurrentMusic(index) {
        if (index >= 0 && index < this.musicas.length) {
            this.currentIndex = index;
            return this.getCurrentMusic();
        }
        return null;
    }

    /**
     * Obtém todas as músicas
     */
    getAllMusics() {
        return this.musicas;
    }

    /**
     * Obtém o total de músicas
     */
    getTotalMusics() {
        return this.musicas.length;
    }

    /**
     * Obtém o índice atual
     */
    getCurrentIndex() {
        return this.currentIndex;
    }
}

