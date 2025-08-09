# 🎨 Template Référence - Collections & Articles

## 📋 **TEMPLATE COLLECTION STANDARD**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout 
  title="[COLLECTION] - Guide Complet"
  description="[DESCRIPTION_SEO]"
  keywords="[MOTS_CLES]"
>

<div class="container">
  <div class="max-w-6xl mx-auto">
    
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-[COLOR1] to-[COLOR2] text-white rounded-2xl p-8 mb-8">
      <h1 class="text-4xl font-bold mb-4">[TITRE_COLLECTION]</h1>
      <p class="text-xl opacity-90">
        [DESCRIPTION_COURTE]
      </p>
    </div>

    <!-- Articles Grid -->
    <div class="collection-grid">
      
      <article class="article-card">
        <div class="article-inner">
          <div class="article-hero [THEME_CLASS]">
            <div class="article-icon">[EMOJI]</div>
          </div>
          <div class="article-content">
            <h2 class="article-title">
              <a href="/[COLLECTION]/[ARTICLE_SLUG]/">
                [TITRE_ARTICLE]
              </a>
            </h2>
            <p class="article-description">
              [DESCRIPTION_ARTICLE]
            </p>
            <div class="article-meta">
              <span class="article-author">[AUTEUR]</span>
              <span class="article-badge">[X] min</span>
            </div>
          </div>
        </div>
      </article>

    </div>
  </div>
</div>

</BaseLayout>
```

## 🎨 **THÈMES DISPONIBLES**

| Classe CSS | Couleurs Hero | Utilisation |
|------------|---------------|-------------|
| `.medical` | `blue-600` → `purple-600` | Médicaments |
| `.weight-loss` | `green-600` → `green-400` | Perte de poids |
| `.effects` | `red-600` → `red-400` | Effets secondaires |
| `.diabetes` | `orange-600` → `red-500` | Diabète |
| `.doctors` | `green-600` → `teal-600` | Médecins |
| `.research` | `purple-600` → `indigo-600` | Recherche |
| `.alternatives` | `blue-600` → `cyan-400` | Alternatives |
| `.nutrition` | `orange-500` → `yellow-500` | Nutrition |
| `.price` | `yellow-600` → `yellow-400` | Prix |

## 🔧 **VARIABLES DE REMPLACEMENT**

### **Collection**
- `[COLLECTION]` → Slug technique (ex: `medicaments-glp1`)
- `[TITRE_COLLECTION]` → Titre affiché (ex: `Médicaments GLP-1`)
- `[DESCRIPTION_SEO]` → Description pour SEO
- `[DESCRIPTION_COURTE]` → Phrase d'accroche hero
- `[MOTS_CLES]` → Mots-clés séparés par virgules
- `[COLOR1]`, `[COLOR2]` → Couleurs gradient hero
- `[THEME_CLASS]` → Classe thématique CSS

### **Article**
- `[ARTICLE_SLUG]` → Slug de l'article
- `[TITRE_ARTICLE]` → Titre de l'article
- `[DESCRIPTION_ARTICLE]` → Description courte
- `[AUTEUR]` → Nom de l'auteur
- `[X]` → Temps de lecture en minutes
- `[EMOJI]` → Icône emoji

## 📁 **STRUCTURE FICHIERS REQUISE**

```
src/
├── content/
│   └── ma-collection/          # Articles Markdown
│       ├── article1.md
│       └── article2.md
├── pages/
│   └── ma-collection/          # Pages Astro
│       └── index.astro         # Page principale collection
└── styles/
    └── global.css              # Styles thématiques
```

## 🎯 **CHECKLIST ADMIN DASHBOARD**

### **Création Collection**
- [ ] Slug collection unique
- [ ] Titre et description SEO
- [ ] Thème CSS sélectionné
- [ ] Couleurs hero définies
- [ ] Dossiers créés automatiquement
- [ ] Page index.astro générée
- [ ] Navigation mise à jour

### **Création Article**
- [ ] Markdown frontmatter complet
- [ ] Collection assignée
- [ ] Auteur attribué automatiquement
- [ ] Temps lecture calculé
- [ ] Slug unique généré
- [ ] Database régénérée

### **Validation Design**
- [ ] Structure `article-inner` présente
- [ ] Classe thématique appliquée
- [ ] Métadonnées complètes
- [ ] Design responsive
- [ ] Couleurs conformes

## 🚀 **COMMANDES POST-CRÉATION**

```bash
# Régénérer database
node scripts/generate-database-v2.mjs

# Attribuer auteurs
node scripts/update-authors.mjs

# Test local
npm run dev

# Déploiement
./deploy-auto.ps1
```

---

**📢 RÉFÉRENCE ABSOLUE** - À utiliser pour toute intégration dashboard admin
