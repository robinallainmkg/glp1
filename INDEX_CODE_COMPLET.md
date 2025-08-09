# 📋 ARCHITECTURE TECHNIQUE - GLP1 France 2025

## 🏗️ STRUCTURE PROJET

```
src/
├── pages/              # Routing Astro
│   ├── admin-dashboard.astro    # Dashboard admin complet
│   └── [collection]/[slug].astro # Pages dynamiques (×9)
├── layouts/            # Templates
│   ├── BaseLayout.astro         # Layout global
│   └── ArticleLayout.astro      # Template articles
├── content/            # Articles Markdown (74 fichiers)
└── styles/             # CSS thèmes collections

data/
├── articles-database.json       # Base de données principale
└── admin-config.json           # Configuration thèmes
```

## 📊 SYSTÈME DE DONNÉES

**Base principale :** `articles-database.json`
```json
{
  "totalArticles": 74,
  "totalCategories": 9,
  "categories": [
    {
      "name": "alternatives-glp1",
      "displayName": "Alternatives Glp1", 
      "articleCount": 2,
      "articles": [...]
    }
  ],
  "allArticles": [
    {
      "slug": "article-slug",
      "category": "collection-name",
      "url": "/collection/slug/",
      "title": "Titre Article",
      "description": "Description SEO",
      "author": "Dr. Nom",
      "keywords": "mots-clés",
      "readingTime": 5,
      "rawContent": "Contenu markdown...",
      "lastModified": "2025-08-08T..."
    }
  ]
}
```
        }
      ]
    }
  ]
}
```

### Collections (9 catégories)
1. **alternatives-glp1** - Alternatives naturelles/médicales
2. **effets-secondaires-glp1** - Effets indésirables
3. **glp1-cout** - Prix et remboursements
4. **glp1-diabete** - Diabète et traitements
5. **glp1-perte-de-poids** - Perte de poids
6. **medecins-glp1-france** - Professionnels de santé
7. **medicaments-glp1** - Médicaments GLP-1
8. **recherche-glp1** - Recherche scientifique
9. **regime-glp1** - Nutrition et régimes

## 🎨 SYSTÈME DE THÈMES

### Configuration thématique
**Fichier :** `data/admin-config.json`
```json
{
  "collectionThemes": {
    "weight-loss": {
      "name": "Perte de Poids",
      "gradient": "from-green-600 to-green-400",
      "icon": "⚖️",
      "cssClass": "weight-loss"
    },
    "medical": {
      "name": "Médical",
      "gradient": "from-blue-600 to-purple-600", 
      "icon": "💊",
      "cssClass": "medical"
    }
  }
}
```

### Mapping collections → thèmes
```javascript
const themeMap = {
  'alternatives-glp1': 'alternatives',        // 🌱 Cyan
  'effets-secondaires-glp1': 'side-effects',  // ⚠️ Rouge
  'glp1-cout': 'cost',                        // 💰 Jaune
  'glp1-diabete': 'diabetes',                 // 🩺 Violet
  'glp1-perte-de-poids': 'weight-loss',       // ⚖️ Vert
  'medecins-glp1-france': 'experts',          // 👨‍⚕️ Teal
  'medicaments-glp1': 'medical',              // 💊 Bleu
  'recherche-glp1': 'research',               // 🔬 Indigo
  'regime-glp1': 'nutrition'                  // 🥗 Orange
};
```

## 🛣️ SYSTÈME DE ROUTING

### Pages dynamiques
**Pattern :** `src/pages/[collection]/[slug].astro`

**Fonctionnement :**
1. Astro lit `articles-database.json`
2. Génère automatiquement les pages via `getStaticPaths()`
3. Chaque article = une page statique lors du build

**Exemple de page dynamique :**
```astro
---
import ArticleLayout from '../../layouts/ArticleLayout.astro';
import fs from 'fs';
import path from 'path';

export async function getStaticPaths() {
  const category = 'glp1-perte-de-poids';
  const databasePath = path.join(process.cwd(), 'data', 'articles-database.json');
  const articlesDatabase = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  
  const categoryData = articlesDatabase.categories.find(cat => cat.name === category);
  
  return categoryData.articles.map(article => ({
    params: { slug: article.slug },
    props: { article, category: categoryData }
  }));
}

const { article } = Astro.props;
---

<ArticleLayout {...article} />
```

### URLs générées
- **Collection :** `/glp1-perte-de-poids/`
- **Article :** `/glp1-perte-de-poids/ozempic-regime/`

## 🎨 LAYOUTS ET TEMPLATES

### ArticleLayout.astro
**Fichier principal :** `src/layouts/ArticleLayout.astro`
**Responsabilités :**
- Template uniforme pour tous les articles
- Gestion des thèmes par collection
- Conversion Markdown → HTML
- SEO et métadonnées
- Navigation responsive

**Props acceptées :**
```typescript
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
```

### BaseLayout.astro
**Template de base :** Navigation, footer, métadonnées globales

## 🎛️ DASHBOARD ADMIN

### Page principale
**Fichier :** `src/pages/admin-dashboard.astro`
**URL :** `/admin-dashboard/`

### Fonctionnalités
1. **Navigation par onglets**
   - Collections (vue grille avec thèmes)
   - Articles (table filtrable)
   - Créer (formulaires nouveaux contenus)

2. **Gestion des collections**
   - Voir articles par collection
   - Éditer métadonnées
   - Supprimer (préparé pour backend)

3. **Gestion des articles**
   - Filtrage par collection/auteur
   - Recherche textuelle
   - Édition dans modals
   - Création avec auto-slug

### JavaScript principal
```javascript
// Variables globales
let articlesData = [];
let collectionsData = [];
let configData = {};

// Navigation onglets
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabName + '-tab').classList.add('active');
}

// Filtrage articles
function filterArticles() {
  const collectionFilter = document.getElementById('filter-collection')?.value;
  // Logique de filtrage...
}
```

## 🎨 SYSTÈME CSS

### Structure CSS
1. **Variables CSS globales** dans `:root`
2. **Thèmes par collection** (`.weight-loss`, `.medical`, etc.)
3. **Composants réutilisables** (`.article-card`, `.btn-primary`, etc.)

### Variables principales
```css
:root {
  /* Couleurs principales */
  --primary-blue: #2563EB;
  --accent-green: #16A34A;
  
  /* Espacements */
  --spacing-4: 1rem;
  --spacing-8: 2rem;
  
  /* Typographie */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-base: 1rem;
  
  /* Ombres */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### Thèmes collections
```css
.weight-loss {
  background: linear-gradient(135deg, #059669 0%, #34d399 100%);
}

.medical {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
}
```

## 🔧 SCRIPTS UTILITAIRES

### update-database.mjs
**Fonction :** Régénère `articles-database.json` depuis les fichiers Markdown
**Usage :** `node scripts/update-database.mjs`

### fix-dynamic-pages.mjs
**Fonction :** Corrige les imports dans les pages dynamiques
**Usage :** `node scripts/fix-dynamic-pages.mjs`

## 📁 CONTENU ET ARTICLES

### Structure des articles
**Dossier :** `src/content/[collection]/`
**Format :** Markdown avec frontmatter YAML

**Exemple d'article :**
```markdown
---
title: "Peut-on guérir du diabète ?"
description: "Guide complet sur la guérison du diabète"
author: "Dr. Émilie Martin"
keywords: "diabète, guérison, traitement"
---

**Résumé :** Cet article explique...

## À retenir

Contenu principal...
```

## 🚀 COMMANDES PRINCIPALES

### Développement
```bash
npm run dev          # Serveur dev sur http://localhost:4321
npx astro dev --port 4321 --host  # Avec exposition réseau
```

### Build et déploiement
```bash
npm run build        # Build statique dans /dist
npx astro build      # Build direct
```

### Scripts utilitaires
```bash
node scripts/update-database.mjs     # Régénérer BDD articles
node scripts/fix-dynamic-pages.mjs   # Corriger imports pages
```

## 🔍 POINTS D'ATTENTION POUR IA FUTURS

### 1. Base de données JSON
- **Critique :** Toujours synchroniser `articles-database.json` avec `/content/`
- **Régénération :** Utiliser `update-database.mjs` après ajout d'articles
- **Structure :** Respecter exactement le schéma JSON existant

### 2. Pages dynamiques
- **Pattern obligatoire :** `[slug].astro` dans chaque dossier collection
- **Import JSON :** Utiliser `fs.readFileSync()` pas `import` pour compatibilité build
- **getStaticPaths :** Indispensable pour génération statique

### 3. Thèmes et CSS
- **Mapping :** Toujours mapper collection → thème dans `getCollectionTheme()`
- **Variables CSS :** Utiliser les variables existantes pour cohérence
- **Responsive :** Tous les composants doivent être mobile-first

### 4. Dashboard admin
- **Frontend only :** Actuellement pas de backend, fonctions prêtes pour intégration
- **Données :** Chargées via éléments `<script type="application/json">`
- **Robustesse :** Toujours vérifier existence éléments DOM (`?.`)

### 5. SEO et performance
- **Meta tags :** Gérés dans `BaseLayout.astro`
- **Images :** Optimisées et servies depuis `/public/`
- **Build :** 94 pages statiques générées automatiquement

## 🎯 ARCHITECTURE FUTURE

### Backend recommandé
1. **API REST** pour CRUD articles/collections
2. **Authentification** JWT pour dashboard admin
3. **Base de données** PostgreSQL ou MongoDB
4. **File management** pour upload images
5. **Régénération** automatique après modifications

### Améliorations possibles
1. **CMS intégré** avec éditeur WYSIWYG
2. **Workflow éditorial** (brouillon → révision → publication)
3. **Analytics** intégrées pour mesurer performance articles
4. **CDN** pour optimisation images et assets
5. **PWA** pour expérience mobile native

---

*Cette documentation est mise à jour le 8 août 2025. Version du code : 2.0 stable.*
