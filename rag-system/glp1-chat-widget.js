/**
 * 💬 Widget Chat RAG pour GLP1-France
 * Interface utilisateur pour le système de chat intelligent
 */

class GLP1ChatWidget {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || '/rag-system/api/search.php';
        this.apiKey = options.apiKey || '';
        this.containerSelector = options.container || '#glp1-chat-widget';
        this.isOpen = false;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.createWidget();
        this.attachEventListeners();
    }
    
    createWidget() {
        const container = document.querySelector(this.containerSelector);
        if (!container) {
            console.error('Container not found:', this.containerSelector);
            return;
        }
        
        container.innerHTML = `
            <div id="glp1-chat-container" class="glp1-chat-container">
                <!-- Chat Button -->
                <button id="glp1-chat-toggle" class="glp1-chat-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Posez vos questions sur GLP1</span>
                </button>
                
                <!-- Chat Window -->
                <div id="glp1-chat-window" class="glp1-chat-window">
                    <div class="glp1-chat-header">
                        <h3>💊 Assistant GLP1</h3>
                        <button id="glp1-chat-close" class="glp1-chat-close">&times;</button>
                    </div>
                    
                    <div class="glp1-chat-messages" id="glp1-chat-messages">
                        <div class="glp1-message glp1-message-bot">
                            <div class="glp1-message-content">
                                👋 Bonjour ! Je suis votre assistant spécialisé en GLP1. Posez-moi vos questions sur les traitements, effets secondaires, prix, etc.
                            </div>
                        </div>
                    </div>
                    
                    <div class="glp1-chat-input-container">
                        <input 
                            type="text" 
                            id="glp1-chat-input" 
                            placeholder="Tapez votre question..."
                            maxlength="500"
                        >
                        <button id="glp1-chat-send" class="glp1-chat-send">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="m22 2-7 20-4-9-9-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="glp1-chat-suggestions">
                        <div class="glp1-suggestion" data-question="Qu'est-ce que GLP1 ?">Qu'est-ce que GLP1 ?</div>
                        <div class="glp1-suggestion" data-question="Quel est le prix d'Ozempic ?">Prix d'Ozempic</div>
                        <div class="glp1-suggestion" data-question="Quels sont les effets secondaires de Wegovy ?">Effets secondaires Wegovy</div>
                        <div class="glp1-suggestion" data-question="Où trouver un médecin pour GLP1 ?">Trouver un médecin</div>
                    </div>
                </div>
            </div>
        `;
        
        this.addStyles();
    }
    
    addStyles() {
        if (document.getElementById('glp1-chat-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'glp1-chat-styles';
        styles.textContent = `
            .glp1-chat-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .glp1-chat-toggle {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                padding: 15px 20px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.3s ease;
                max-width: 280px;
            }
            
            .glp1-chat-toggle:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(0,0,0,0.2);
            }
            
            .glp1-chat-window {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            
            .glp1-chat-window.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .glp1-chat-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .glp1-chat-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .glp1-chat-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .glp1-chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .glp1-message {
                display: flex;
                flex-direction: column;
            }
            
            .glp1-message-content {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .glp1-message-bot .glp1-message-content {
                background: #f1f3f5;
                color: #333;
                align-self: flex-start;
            }
            
            .glp1-message-user .glp1-message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                align-self: flex-end;
            }
            
            .glp1-chat-input-container {
                padding: 20px;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 10px;
            }
            
            .glp1-chat-input-container input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #dee2e6;
                border-radius: 25px;
                outline: none;
                font-size: 14px;
            }
            
            .glp1-chat-input-container input:focus {
                border-color: #667eea;
            }
            
            .glp1-chat-send {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50%;
                width: 45px;
                height: 45px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .glp1-chat-send:hover {
                transform: scale(1.05);
            }
            
            .glp1-chat-send:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .glp1-chat-suggestions {
                padding: 0 20px 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .glp1-suggestion {
                background: #f8f9fa;
                color: #495057;
                padding: 8px 12px;
                border-radius: 15px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid #e9ecef;
            }
            
            .glp1-suggestion:hover {
                background: #e9ecef;
                transform: translateY(-1px);
            }
            
            .glp1-loading {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6c757d;
                font-style: italic;
            }
            
            .glp1-loading::after {
                content: '';
                width: 16px;
                height: 16px;
                border: 2px solid #dee2e6;
                border-top: 2px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .glp1-sources {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #e9ecef;
                font-size: 12px;
                color: #6c757d;
            }
            
            .glp1-source-link {
                display: inline-block;
                color: #667eea;
                text-decoration: none;
                margin-right: 10px;
                margin-top: 5px;
            }
            
            .glp1-source-link:hover {
                text-decoration: underline;
            }
            
            @media (max-width: 480px) {
                .glp1-chat-container {
                    bottom: 10px;
                    right: 10px;
                    left: 10px;
                }
                
                .glp1-chat-window {
                    width: 100%;
                    right: auto;
                    left: 0;
                }
                
                .glp1-chat-toggle span {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    attachEventListeners() {
        // Toggle chat
        document.getElementById('glp1-chat-toggle').addEventListener('click', () => {
            this.toggleChat();
        });
        
        // Close chat
        document.getElementById('glp1-chat-close').addEventListener('click', () => {
            this.closeChat();
        });
        
        // Send message
        document.getElementById('glp1-chat-send').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key
        document.getElementById('glp1-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLoading) {
                this.sendMessage();
            }
        });
        
        // Suggestions
        document.querySelectorAll('.glp1-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                const question = suggestion.dataset.question;
                document.getElementById('glp1-chat-input').value = question;
                this.sendMessage();
            });
        });
    }
    
    toggleChat() {
        const window = document.getElementById('glp1-chat-window');
        if (this.isOpen) {
            this.closeChat();
        } else {
            window.classList.add('open');
            this.isOpen = true;
            document.getElementById('glp1-chat-input').focus();
        }
    }
    
    closeChat() {
        const window = document.getElementById('glp1-chat-window');
        window.classList.remove('open');
        this.isOpen = false;
    }
    
    async sendMessage() {
        if (this.isLoading) return;
        
        const input = document.getElementById('glp1-chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Ajouter le message de l'utilisateur
        this.addMessage(message, 'user');
        input.value = '';
        
        // Afficher le loader
        this.isLoading = true;
        const loadingId = this.addMessage('Recherche en cours...', 'bot', true);
        this.updateSendButton();
        
        try {
            // Appeler l'API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: message,
                    api_key: this.apiKey,
                    generate_answer: true,
                    limit: 3
                })
            });
            
            const data = await response.json();
            
            // Supprimer le loader
            this.removeMessage(loadingId);
            
            if (data.success) {
                // Ajouter la réponse
                const answer = data.answer || 'Désolé, je n\'ai pas trouvé de réponse pertinente.';
                this.addMessage(answer, 'bot', false, data.results);
            } else {
                this.addMessage('Erreur: ' + (data.error || 'Une erreur est survenue'), 'bot');
            }
            
        } catch (error) {
            console.error('Erreur API:', error);
            this.removeMessage(loadingId);
            this.addMessage('Désolé, une erreur technique est survenue. Veuillez réessayer.', 'bot');
        }
        
        this.isLoading = false;
        this.updateSendButton();
    }
    
    addMessage(content, type, isLoading = false, sources = null) {
        const messagesContainer = document.getElementById('glp1-chat-messages');
        const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `glp1-message glp1-message-${type}`;
        messageDiv.id = messageId;
        
        let sourcesHtml = '';
        if (sources && sources.length > 0) {
            sourcesHtml = '<div class="glp1-sources">Sources: ';
            sources.forEach((source, index) => {
                if (index < 3) { // Limiter à 3 sources
                    sourcesHtml += `<a href="${source.url}" target="_blank" class="glp1-source-link">${source.title}</a>`;
                }
            });
            sourcesHtml += '</div>';
        }
        
        messageDiv.innerHTML = `
            <div class="glp1-message-content ${isLoading ? 'glp1-loading' : ''}">
                ${content}
                ${sourcesHtml}
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageId;
    }
    
    removeMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }
    
    updateSendButton() {
        const sendButton = document.getElementById('glp1-chat-send');
        sendButton.disabled = this.isLoading;
    }
}

// Auto-initialisation si le container existe
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#glp1-chat-widget')) {
        // Configuration par défaut - à adapter selon vos besoins
        window.glp1Chat = new GLP1ChatWidget({
            apiEndpoint: '/rag-system/api/search.php',
            apiKey: '', // Ajouter votre clé API ou la gérer côté serveur
            container: '#glp1-chat-widget'
        });
    }
});
