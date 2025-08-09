# 🔧 GUIDE TECHNIQUE DÉTAILLÉ - EXEMPLES DE CODE

## 📋 TABLE DES MATIÈRES TECHNIQUE

1. [Structure des fichiers critiques](#structure-des-fichiers-critiques)
2. [Exemples de code fonctionnel](#exemples-de-code-fonctionnel)
3. [Patterns de développement](#patterns-de-développement)
4. [Debugging et maintenance](#debugging-et-maintenance)
5. [Intégration future](#intégration-future)

## 📁 STRUCTURE DES FICHIERS CRITIQUES

### Fichiers de configuration
```
astro.config.mjs          # Configuration Astro
package.json               # Dépendances Node.js
data/articles-database.json # Base de données articles
data/admin-config.json     # Configuration thèmes admin
```

### Layouts principaux
```
src/layouts/BaseLayout.astro    # Layout de base (navigation, footer)
src/layouts/ArticleLayout.astro # Template articles uniforme
```

### Pages dynamiques générées
```
src/pages/[collection]/[slug].astro  # 9 fichiers identiques
src/pages/[collection]/index.astro   # Pages collections
```

### Dashboard admin
```
src/pages/admin-dashboard.astro  # Interface complète admin
src/pages/admin-login.astro      # Page de connexion
src/pages/admin.astro           # Ancien admin (legacy)
```

### Scripts utilitaires
```
scripts/update-database.mjs     # Régénération BDD
scripts/fix-dynamic-pages.mjs   # Correction imports
scripts/image-generator.mjs     # Génération images (existant)
```

## 💻 EXEMPLES DE CODE FONCTIONNEL

### 1. Page dynamique type
**Fichier :** `src/pages/glp1-perte-de-poids/[slug].astro`
```astro
---
import ArticleLayout from '../../layouts/ArticleLayout.astro';
import fs from 'fs';
import path from 'path';

export async function getStaticPaths() {
  const category = 'glp1-perte-de-poids';  // ⚠️ Changer selon collection
  
  // Lecture directe JSON (compatible build)
  const databasePath = path.join(process.cwd(), 'data', 'articles-database.json');
  const articlesDatabase = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  
  const categoryData = articlesDatabase.categories.find(cat => cat.name === category);
  
  if (!categoryData) {
    return [];  // ⚠️ Sécurité si collection vide
  }

  // Génération paths pour chaque article
  return categoryData.articles.map(article => ({
    params: { 
      slug: article.slug 
    },
    props: { 
      article,
      category: categoryData
    }
  }));
}

const { article, category } = Astro.props;

// Mapping thème selon collection
const getCollectionTheme = (categoryName: string) => {
  const themeMap = {
    'alternatives-glp1': 'alternatives',
    'effets-secondaires-glp1': 'side-effects',
    'glp1-cout': 'cost',
    'glp1-diabete': 'diabetes',
    'glp1-perte-de-poids': 'weight-loss',
    'medecins-glp1-france': 'experts',
    'medicaments-glp1': 'medical',
    'recherche-glp1': 'research',
    'regime-glp1': 'nutrition'
  };
  return themeMap[categoryName] || 'weight-loss';
};

const collectionTheme = getCollectionTheme(article.category);
---

<ArticleLayout
  title={article.title}
  description={article.description}
  author={article.author}
  category={article.category}
  keywords={article.keywords}
  readingTime={article.readingTime}
  lastModified={article.lastModified}
  content={article.rawContent}
  collectionTheme={collectionTheme}
/>
```

### 2. ArticleLayout avec conversion Markdown
**Fichier :** `src/layouts/ArticleLayout.astro`
```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  description: string;
  author: string;
  category: string;
  keywords: string | string[];
  readingTime: number;
  lastModified?: string;
  content: string;
  collectionTheme?: string;
}

const { 
  title, description, author, category, keywords, 
  readingTime, lastModified, content, collectionTheme = 'weight-loss'
} = Astro.props;

// Configuration thèmes visuels
const themeConfig = {
  'weight-loss': {
    gradient: 'from-green-600 to-green-400',
    badge: 'bg-green-100 text-green-800',
    icon: '⚖️'
  },
  'medical': {
    gradient: 'from-blue-600 to-purple-600',
    badge: 'bg-blue-100 text-blue-800', 
    icon: '💊'
  },
  'nutrition': {
    gradient: 'from-orange-600 to-yellow-500',
    badge: 'bg-orange-100 text-orange-800',
    icon: '🥗'
  },
  // ... autres thèmes
};

const theme = themeConfig[collectionTheme] || themeConfig['weight-loss'];

// Conversion Markdown basique → HTML
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')      // **gras**
    .replace(/\*(.*?)\*/g, '<em>$1</em>')                  // *italique*
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')                 // ## Titre 2
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')                // ### Titre 3
    .replace(/^\- (.*$)/gm, '<li>$1</li>')                 // - Liste
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')            // Wrapper <ul>
    .replace(/\[affiliate-box\]/g, '<div class="affiliate-box">Contenu partenaire</div>')
    .replace(/\r?\n\r?\n/g, '</p><p>')                     // Paragraphes
    .replace(/^(?!<[h|u|l])/gm, '<p>')
    .replace(/(?<!>)$/gm, '</p>')
    .replace(/<p><\/p>/g, '')                              // Nettoyage <p> vides
    .replace(/<p>(<[h|u])/g, '$1')
    .replace(/(<\/[h|u][^>]*>)<\/p>/g, '$1');
}

const htmlContent = markdownToHtml(content);
const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
---

<BaseLayout title={title} description={description}>
  <article class="article-layout">
    <!-- En-tête avec thème dynamique -->
    <header class={`article-header bg-gradient-to-r ${theme.gradient} text-white`}>
      <div class="container mx-auto px-4 py-12">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center gap-4 mb-6">
            <span class="text-4xl">{theme.icon}</span>
            <span class={`px-3 py-1 rounded-full text-sm font-medium ${theme.badge} bg-white bg-opacity-20 text-white`}>
              {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          
          <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {title}
          </h1>
          
          <p class="text-xl opacity-90 mb-8 leading-relaxed">
            {description}
          </p>
          
          <!-- Métadonnées article -->
          <div class="flex flex-wrap items-center gap-6 text-sm">
            <div class="flex items-center gap-2">
              <span class="opacity-75">✍️ Par</span>
              <span class="font-medium">{author}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="opacity-75">⏱️</span>
              <span>{readingTime} min de lecture</span>
            </div>
            {lastModified && (
              <div class="flex items-center gap-2">
                <span class="opacity-75">📅</span>
                <span>{new Date(lastModified).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu article avec prose styling -->
    <main class="article-content">
      <div class="container mx-auto px-4 py-12">
        <div class="max-w-4xl mx-auto">
          <div class="prose prose-lg max-w-none" set:html={htmlContent}></div>
          
          <!-- Mots-clés si présents -->
          {keywordsString && (
            <div class="keywords-section mt-12 p-6 bg-gray-50 rounded-xl">
              <h3 class="text-lg font-semibold mb-4">🏷️ Mots-clés</h3>
              <div class="flex flex-wrap gap-2">
                {keywordsString.split(',').map(keyword => (
                  <span class="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border">
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <!-- Navigation retour -->
          <nav class="article-navigation mt-12">
            <a 
              href={`/${category}/`} 
              class={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.gradient} text-white rounded-lg hover:shadow-lg transition-all duration-300`}
            >
              ← Retour à {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </a>
          </nav>
        </div>
      </div>
    </main>
  </article>
</BaseLayout>

<!-- Styles CSS pour prose et composants -->
<style>
  .article-layout {
    min-height: 100vh;
  }

  .article-header {
    position: relative;
    overflow: hidden;
  }

  .article-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
  }

  /* Styling du contenu prose */
  .prose {
    color: #374151;
    line-height: 1.8;
  }

  .prose h2 {
    color: #1f2937;
    font-size: 1.875rem;
    font-weight: 700;
    margin: 2rem 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .prose h3 {
    color: #374151;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
  }

  .prose p {
    margin: 1rem 0;
    line-height: 1.8;
  }

  .prose ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .prose li {
    margin: 0.5rem 0;
    list-style-type: disc;
  }

  .affiliate-box {
    background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
    border: 2px solid #f59e0b;
    border-radius: 1rem;
    padding: 1.5rem;
    margin: 2rem 0;
    text-align: center;
    font-weight: 600;
    color: #92400e;
  }

  @media (max-width: 768px) {
    .article-header h1 {
      font-size: 2rem;
    }
  }
</style>
```

### 3. JavaScript Dashboard Admin (extrait principal)
**Fichier :** `src/pages/admin-dashboard.astro` (partie script)
```javascript
<script>
  // Variables globales pour données
  let articlesData = [];
  let collectionsData = [];
  let configData = {};

  // Initialisation au chargement page
  document.addEventListener('DOMContentLoaded', function() {
    // Chargement données depuis éléments JSON
    try {
      const articlesElement = document.getElementById('articles-data');
      if (articlesElement) {
        articlesData = JSON.parse(articlesElement.textContent);
      }
    } catch (e) {
      console.error('Erreur chargement articles:', e);
      articlesData = [];
    }
    
    try {
      const collectionsElement = document.getElementById('collections-data');
      if (collectionsElement) {
        collectionsData = JSON.parse(collectionsElement.textContent);
      }
    } catch (e) {
      console.error('Erreur chargement collections:', e);
      collectionsData = [];
    }
    
    try {
      const configElement = document.getElementById('config-data');
      if (configElement) {
        configData = JSON.parse(configElement.textContent);
      }
    } catch (e) {
      console.error('Erreur chargement config:', e);
      configData = {};
    }

    // Initialiser premier onglet
    showTab('collections');

    // Gestionnaire fermeture modal sur overlay
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
          closeModal();
        }
      });
    }
  });

  // Navigation entre onglets avec vérifications
  function showTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // Afficher onglet cible avec vérifications
    const targetTab = document.getElementById(tabName + '-tab');
    const targetButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    
    if (targetTab) {
      targetTab.classList.add('active');
      console.log('Tab activé:', tabName);
    } else {
      console.error('Tab non trouvé:', tabName + '-tab');
    }
    
    if (targetButton) {
      targetButton.classList.add('active');
      console.log('Button activé pour:', tabName);
    } else {
      console.error('Button non trouvé pour:', tabName);
    }
  }

  // Filtrage articles avec protection erreurs
  function filterArticles() {
    const collectionFilter = document.getElementById('filter-collection')?.value || '';
    const authorFilter = document.getElementById('filter-author')?.value || '';
    const searchTerm = document.getElementById('search-articles')?.value?.toLowerCase() || '';

    document.querySelectorAll('.article-row').forEach(row => {
      const collection = row.dataset.collection || '';
      const author = row.dataset.author || '';
      const titleElement = row.querySelector('.article-title-main');
      const descriptionElement = row.querySelector('.article-description-preview');
      
      const title = titleElement ? titleElement.textContent.toLowerCase() : '';
      const description = descriptionElement ? descriptionElement.textContent.toLowerCase() : '';

      const matchCollection = !collectionFilter || collection === collectionFilter;
      const matchAuthor = !authorFilter || author === authorFilter;
      const matchSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);

      row.style.display = matchCollection && matchAuthor && matchSearch ? '' : 'none';
    });
  }

  // Gestion modals robuste
  function showModal(title, content) {
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = content;
    if (modalOverlay) modalOverlay.classList.add('active');
  }

  function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
  }

  // Édition article avec formulaire complet
  function editArticle(category, slug) {
    console.log('Edit article:', category, slug);
    const article = articlesData.find(a => a.category === category && a.slug === slug);
    if (!article) {
      alert('Article non trouvé');
      return;
    }

    const authorOptions = [...new Set(articlesData.map(a => a.author))].map(author => 
      `<option value="${author}" ${article.author === author ? 'selected' : ''}>${author}</option>`
    ).join('');

    const keywordsValue = Array.isArray(article.keywords) ? article.keywords.join(', ') : (article.keywords || '');

    const content = `
      <form id="edit-article-form">
        <div class="form-group">
          <label>Titre:</label>
          <input type="text" id="edit-title" value="${article.title || ''}" class="form-input">
        </div>
        <div class="form-group">
          <label>Description:</label>
          <textarea id="edit-description" class="form-textarea">${article.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Auteur:</label>
          <select id="edit-author" class="form-input">
            ${authorOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Mots-clés (séparés par des virgules):</label>
          <input type="text" id="edit-keywords" value="${keywordsValue}" class="form-input">
        </div>
        <div class="form-group">
          <label>Temps de lecture (minutes):</label>
          <input type="number" id="edit-reading-time" value="${article.readingTime || ''}" class="form-input">
        </div>
        <div class="form-actions">
          <button type="button" class="btn-primary" onclick="saveArticle('${category}', '${slug}')">💾 Sauvegarder</button>
          <button type="button" class="btn-secondary" onclick="closeModal()">❌ Annuler</button>
        </div>
      </form>
    `;

    showModal('Modifier l\'Article', content);
  }

  // Création nouvelle collection avec auto-slug
  function showCreateCollection() {
    const themeOptions = Object.entries(configData.collectionThemes || {}).map(([key, theme]) => 
      `<option value="${key}">${theme.name} (${theme.description})</option>`
    ).join('');

    const content = `
      <form id="create-collection-form">
        <div class="form-group">
          <label>Nom de la collection:</label>
          <input type="text" id="new-collection-name" placeholder="ex: Médicaments Nouveaux" class="form-input">
        </div>
        <div class="form-group">
          <label>Slug technique (généré automatiquement):</label>
          <input type="text" id="new-collection-slug" placeholder="medicaments-nouveaux" class="form-input">
        </div>
        <div class="form-group">
          <label>Description:</label>
          <textarea id="new-collection-description" placeholder="Description de la collection..." class="form-textarea"></textarea>
        </div>
        <div class="form-group">
          <label>Thème:</label>
          <select id="new-collection-theme" class="form-input">
            ${themeOptions}
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-primary" onclick="createNewCollection()">🚀 Créer Collection</button>
          <button type="button" class="btn-secondary" onclick="closeModal()">❌ Annuler</button>
        </div>
      </form>
    `;

    showModal('Créer une Nouvelle Collection', content);

    // Auto-génération slug avec setTimeout pour attendre DOM
    setTimeout(() => {
      const nameInput = document.getElementById('new-collection-name');
      const slugInput = document.getElementById('new-collection-slug');
      
      if (nameInput && slugInput) {
        nameInput.addEventListener('input', function() {
          const name = this.value;
          // Conversion nom → slug avec accents français
          const slug = name.toLowerCase()
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          slugInput.value = slug;
        });
      }
    }, 100);
  }

  // Fonctions raccourcies pour boutons
  function createCollection() {
    showCreateCollection();
  }

  function createArticle() {
    showCreateArticle();
  }

  // Actualisation base de données avec feedback utilisateur
  function refreshDatabase() {
    if (confirm('Actualiser la base de données ? Cette opération peut prendre quelques secondes.')) {
      const originalText = document.querySelector('[onclick="refreshDatabase()"]').textContent;
      document.querySelector('[onclick="refreshDatabase()"]').textContent = '🔄 Actualisation...';
      
      // Simulation actualisation (backend à implémenter)
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }
</script>

<!-- Éléments JSON pour chargement données JavaScript -->
<script type="application/json" id="articles-data">
{JSON.stringify(allArticlesEnriched)}
</script>

<script type="application/json" id="collections-data">
{JSON.stringify(collectionsWithThemes)}
</script>

<script type="application/json" id="config-data">
{JSON.stringify(config)}
</script>
```

## 📊 PATTERNS DE DÉVELOPPEMENT

### 1. Pattern page dynamique Astro
```typescript
// ⚠️ TOUJOURS utiliser ce pattern pour nouvelles collections
export async function getStaticPaths() {
  const category = 'COLLECTION_NAME';  // ← Remplacer ici uniquement
  
  const databasePath = path.join(process.cwd(), 'data', 'articles-database.json');
  const articlesDatabase = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  
  const categoryData = articlesDatabase.categories.find(cat => cat.name === category);
  
  if (!categoryData) return [];  // Sécurité

  return categoryData.articles.map(article => ({
    params: { slug: article.slug },
    props: { article, category: categoryData }
  }));
}
```

### 2. Pattern chargement données dashboard
```javascript
// ⚠️ TOUJOURS vérifier existence éléments DOM
const element = document.getElementById('target-id');
if (element) {
  // Traitement sécurisé
  element.textContent = newValue;
} else {
  console.error('Element non trouvé:', 'target-id');
}

// ⚠️ Utiliser ?. pour propriétés optionnelles
const value = document.getElementById('input-id')?.value || '';
```

### 3. Pattern thème collection
```javascript
// ⚠️ TOUJOURS mapper nouvelles collections ici
const getCollectionTheme = (categoryName: string) => {
  const themeMap = {
    'nouvelle-collection': 'theme-name',  // ← Ajouter nouvelles ici
    // ... mapping existant
  };
  return themeMap[categoryName] || 'weight-loss';  // Fallback
};
```

## 🔍 DEBUGGING ET MAINTENANCE

### Problèmes courants et solutions

**1. Page 404 sur article**
```bash
# Vérifier existence fichier markdown
ls src/content/COLLECTION/ARTICLE.md

# Vérifier entrée dans database
grep "slug-article" data/articles-database.json

# Régénérer database
node scripts/update-database.mjs
```

**2. Build qui échoue**
```bash
# Vérifier imports JSON
grep -r "import.*json" src/pages/

# Corriger imports si nécessaire
node scripts/fix-dynamic-pages.mjs

# Test build
npx astro build
```

**3. Dashboard onglets ne marchent pas**
```javascript
// Vérifier dans Console navigateur
console.log('Données chargées:', { articlesData, collectionsData, configData });

// Vérifier éléments DOM
console.log('Onglet existe:', document.getElementById('collections-tab'));
```

**4. Nouveau thème collection**
```json
// 1. Ajouter dans data/admin-config.json
{
  "collectionThemes": {
    "nouveau-theme": {
      "name": "Nouveau Thème",
      "gradient": "from-purple-600 to-pink-600",
      "icon": "🆕",
      "cssClass": "nouveau-theme"
    }
  }
}
```

```css
/* 2. Ajouter CSS dans src/styles/global.css */
.nouveau-theme {
  background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
}
```

```javascript
// 3. Ajouter mapping dans getCollectionTheme()
const themeMap = {
  'ma-nouvelle-collection': 'nouveau-theme',
  // ... autres
};
```

### Logs de débogage utiles
```bash
# Serveur dev avec logs détaillés
npx astro dev --port 4321 --verbose

# Vérifier routes générées
npx astro build --dry-run

# Analyser bundle size
npx astro build --analyze
```

## 🚀 INTÉGRATION FUTURE

### Préparation backend API

**Structure recommandée :**
```
api/
├── collections/
│   ├── GET /collections          # Liste collections
│   ├── POST /collections         # Créer collection
│   ├── PUT /collections/:id      # Modifier collection
│   └── DELETE /collections/:id   # Supprimer collection
├── articles/
│   ├── GET /articles            # Liste articles (avec filtres)
│   ├── POST /articles           # Créer article
│   ├── PUT /articles/:id        # Modifier article
│   └── DELETE /articles/:id     # Supprimer article
└── database/
    └── POST /database/refresh   # Régénérer database
```

**Fonctions dashboard prêtes pour backend :**
```javascript
// ⚠️ Ces fonctions sont prêtes pour intégration API
async function saveArticle(category, slug) {
  const formData = {
    title: document.getElementById('edit-title').value,
    description: document.getElementById('edit-description').value,
    author: document.getElementById('edit-author').value,
    keywords: document.getElementById('edit-keywords').value,
    readingTime: document.getElementById('edit-reading-time').value
  };
  
  // ← Ajouter appel API ici
  const response = await fetch(`/api/articles/${category}/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  if (response.ok) {
    // Succès
    closeModal();
    location.reload();
  } else {
    // Erreur
    alert('Erreur lors de la sauvegarde');
  }
}
```

### Variables d'environnement futures
```bash
# .env
API_BASE_URL=http://localhost:3001
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/glp1
UPLOAD_PATH=/uploads
```

---

*Documentation technique mise à jour le 8 août 2025*  
*Compatible avec la base de code actuelle - 74 articles, 9 collections*
