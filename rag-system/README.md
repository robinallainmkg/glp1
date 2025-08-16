# 🤖 Système RAG GLP1-France

## Vue d'ensemble

Ce système RAG (Retrieval-Augmented Generation) transforme votre site GLP1-France.fr en assistant intelligent capable de répondre aux questions des visiteurs en se basant sur tout le contenu de votre site.

## 🚀 Installation rapide

### 1. Prérequis

```bash
# Installer Python et les dépendances
pip install openai beautifulsoup4 requests
```

### 2. Configuration OpenAI

1. Créez un compte sur [OpenAI Platform](https://platform.openai.com/)
2. Générez une clé API
3. Ajoutez votre clé dans les fichiers de configuration

### 3. Indexation du contenu

```bash
# Lancer l'indexation (à faire une seule fois ou quand le contenu change)
cd rag-system
python indexer.py
```

Cette commande va :
- Scanner tout le contenu de GLP1-France.fr
- Créer des embeddings vectoriels avec OpenAI
- Stocker tout dans `embeddings/glp1_embeddings.json`

### 4. Déploiement

1. **Copier les fichiers** sur votre serveur web
2. **Configurer la clé API** dans `api/search.php`
3. **Tester** avec `demo.html`

## 📁 Structure du projet

```
rag-system/
├── indexer.py              # Indexation du contenu
├── api/
│   └── search.php          # API de recherche
├── embeddings/
│   └── glp1_embeddings.json # Base de données vectorielle
├── docs/
│   └── content/            # Contenu indexé
├── glp1-chat-widget.js     # Widget de chat
└── demo.html               # Page de démonstration
```

## 🔧 Configuration avancée

### Variables d'environnement

Créez un fichier `.env` :

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL_EMBEDDING=text-embedding-3-small
OPENAI_MODEL_COMPLETION=gpt-4o-mini
MAX_CHUNKS_PER_RESPONSE=5
SIMILARITY_THRESHOLD=0.7
```

### Configuration du widget

```javascript
// Configuration personnalisée
const chatWidget = new GLP1ChatWidget({
    apiEndpoint: '/rag-system/api/search.php',
    apiKey: 'your-openai-key',
    theme: 'light', // ou 'dark'
    position: 'bottom-right',
    welcomeMessage: 'Bonjour ! Comment puis-je vous aider avec GLP1 ?',
    suggestions: [
        'Qu\'est-ce que GLP1 ?',
        'Prix d\'Ozempic',
        'Effets secondaires'
    ]
});
```

## 🔄 Maintenance

### Re-indexation

Lancez la re-indexation quand vous ajoutez du nouveau contenu :

```bash
python indexer.py --force-update
```

### Mise à jour des embeddings

Pour optimiser les performances, vous pouvez filtrer le contenu indexé :

```python
# Dans indexer.py, modifiez la liste des URLs à ignorer
EXCLUDE_PATTERNS = [
    '/wp-admin/',
    '/wp-content/uploads/',
    '.pdf',
    '.jpg', '.png', '.gif'
]
```

### Monitoring

Surveillez les logs dans :
- `embeddings/indexing.log` - Logs d'indexation
- `api/search.log` - Logs de recherche

## 📊 Métriques et optimisation

### Performance

- **Temps de réponse moyen** : ~2-3 secondes
- **Coût par requête** : ~$0.001-0.003
- **Taille de la base** : ~50MB pour 1000 pages

### Optimisations possibles

1. **Cache Redis** pour les requêtes fréquentes
2. **CDN** pour le widget JavaScript
3. **Compression gzip** pour les embeddings
4. **Pagination** pour les gros sites

## 🛡️ Sécurité

### Protection de la clé API

```php
// Dans search.php
$allowedDomains = [
    'glp1-france.fr',
    'www.glp1-france.fr'
];

if (!in_array($_SERVER['HTTP_HOST'], $allowedDomains)) {
    http_response_code(403);
    exit('Accès refusé');
}
```

### Rate limiting

Limitez le nombre de requêtes par IP :

```php
// Limiter à 10 requêtes par minute
$maxRequests = 10;
$timeWindow = 60; // secondes
```

## 🧪 Tests

### Test unitaire de l'API

```bash
curl -X POST http://localhost/rag-system/api/search.php \
  -H "Content-Type: application/json" \
  -d '{"query": "Qu'\''est-ce que GLP1 ?", "api_key": "sk-..."}'
```

### Test du widget

Ouvrez `demo.html` dans votre navigateur et testez :

1. ✅ Configuration de la clé API
2. ✅ Recherche sémantique
3. ✅ Widget de chat
4. ✅ Réponses contextuelles

## 🔍 Dépannage

### Problèmes courants

| Problème | Solution |
|----------|----------|
| "Embeddings manquants" | Lancez `python indexer.py` |
| "Clé API invalide" | Vérifiez votre clé OpenAI |
| "Erreur CORS" | Configurez les headers dans search.php |
| "Widget ne s'affiche pas" | Vérifiez le chemin du script JS |

### Debug mode

Activez le mode debug pour voir plus de détails :

```javascript
// Dans le widget
const widget = new GLP1ChatWidget({
    debug: true,
    // ... autres options
});
```

## 📈 Évolutions possibles

### Fonctionnalités avancées

1. **Multi-langues** - Support français/anglais
2. **Analyse sentiments** - Détection de la satisfaction
3. **Recommandations** - Suggestions d'articles
4. **Historique** - Sauvegarde des conversations
5. **Analytics** - Tableau de bord des métriques

### Intégrations

- **Google Analytics** pour le tracking
- **Hotjar** pour l'analyse UX
- **Intercom** pour le support client
- **Zapier** pour l'automatisation

## 💡 Conseils d'optimisation

### Contenu

1. **Structurez** vos articles avec des titres clairs
2. **Utilisez** des mots-clés pertinents
3. **Évitez** la duplication de contenu
4. **Mettez à jour** régulièrement

### Performance

1. **Chunking intelligent** - Découpez par sections logiques
2. **Embeddings de qualité** - Utilisez text-embedding-3-small
3. **Cache stratégique** - Mémorisez les requêtes populaires
4. **Monitoring continu** - Surveillez les performances

---

## 🆘 Support

Pour toute question ou problème :

1. Consultez d'abord cette documentation
2. Vérifiez les logs d'erreur
3. Testez avec `demo.html`
4. Ouvrez un ticket si nécessaire

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024
