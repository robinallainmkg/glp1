# 📝 GUIDE COLLECTIONS & ARTICLES - GLP1 France 2025

## 🎨 STRUCTURE OBLIGATOIRE

### Template Page Collection
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout 
  title="Nom Collection - Guide Complet"
  description="Description SEO complète"
  keywords="mots, clés, collection">

<div class="container">
  <div class="max-w-6xl mx-auto">
    
    <!-- Hero avec thème -->
    <div class="bg-gradient-to-r from-[couleur1] to-[couleur2] text-white rounded-2xl p-8 mb-8">
      <h1 class="text-4xl font-bold mb-4">Titre Collection</h1>
      <p class="text-xl opacity-90">Description courte et accrocheuse.</p>
    </div>

    <!-- Articles -->
    <div class="collection-grid">
      <article class="article-card">
        <div class="article-inner">
          <div class="article-hero [CLASSE-THEME]">
            <div class="article-icon">[EMOJI]</div>
          </div>
          <div class="article-content">
            <h2 class="article-title">
              <a href="/collection/article-slug/">Titre Article</a>
            </h2>
            <p class="article-description">Description 1-2 phrases.</p>
            <div class="article-meta">
              <span class="article-author">Nom Auteur</span>
              <span class="article-badge">X min</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</div>
</BaseLayout>
```
            </div>
          </div>
        </div>
      </article>

      <!-- Répéter pour chaque article -->

    </div>
  </div>
</div>

</BaseLayout>
```

## 🎨 **CLASSES THÉMATIQUES DISPONIBLES**

### **Classes CSS pour `article-hero`**

| Collection Type | Classe CSS | Couleurs | Usage |
|-----------------|------------|----------|-------|
| **Médicaments** | `.medical` | Bleu → Violet | Traitements, médicaments |
| **Perte de Poids** | `.weight-loss` | Vert | Amaigrissement, régimes |
| **Effets Secondaires** | `.effects` | Rouge | Effets indésirables |
| **Diabète** | `.diabetes` | Orange → Rouge | Diabète, glycémie |
| **Médecins** | `.doctors` | Vert → Teal | Professionnels, cliniques |
| **Recherche** | `.research` | Violet | Études, science |
| **Alternatives** | `.alternatives` | Bleu → Cyan | Alternatives, options |
| **Nutrition** | `.nutrition` | Orange → Jaune | Régime, alimentation |
| **Prix** | `.price` | Jaune | Coût, tarifs |

### **Ajouter une Nouvelle Classe Thématique**

Si besoin d'un nouveau thème, ajouter dans `src/styles/global.css` :

```css
.article-hero.nouveau-theme {
  background: linear-gradient(135deg, #couleur1, #couleur2);
}
```

## 📝 **WORKFLOW CRÉATION NOUVELLE COLLECTION**

### **Étape 1 : Créer la Structure de Dossiers**

```bash
# Dans src/content/
mkdir src/content/ma-nouvelle-collection/

# Dans src/pages/
mkdir src/pages/ma-nouvelle-collection/
```

### **Étape 2 : Créer la Page Index**

```bash
# Copier le template
cp src/pages/medicaments-glp1/index.astro src/pages/ma-nouvelle-collection/index.astro
```

**Modifier le contenu** en suivant le template ci-dessus avec :
- Titre et description appropriés
- Couleurs de hero thématiques (`from-[couleur1] to-[couleur2]`)
- Classe thématique pour `article-hero`
- Articles correspondants

### **Étape 3 : Ajouter au Menu de Navigation**

Dans le fichier de navigation (à localiser), ajouter :

```astro
<a href="/ma-nouvelle-collection/" class="nav-link">
  Ma Nouvelle Collection
</a>
```

### **Étape 4 : Créer des Articles**

Structure d'article Markdown :

```markdown
---
title: "Titre Complet de l'Article"
description: "Description SEO de l'article"
date: "2025-08-08"
author: "Dr. Nom Prénom"
category: "ma-nouvelle-collection"
keywords: ["mot1", "mot2", "mot3"]
readingTime: "X min"
---

# Titre de l'Article

Contenu de l'article...
```

### **Étape 5 : Régénérer la Base de Données**

```powershell
cd C:\Users\robin\projet\glp1-main
node scripts/generate-database-v2.mjs
node scripts/update-authors.mjs
```

### **Étape 6 : Test et Validation**

```powershell
npm run dev
# Vérifier : http://localhost:4321/ma-nouvelle-collection/
```

## 🎯 **STANDARDS QUALITÉ OBLIGATOIRES**

### **✅ Structure Article Card**

**OBLIGATOIRE** - Chaque article doit avoir cette structure :

```astro
<article class="article-card">
  <div class="article-inner">           <!-- OBLIGATOIRE -->
    <div class="article-hero [THEME]">  <!-- OBLIGATOIRE avec thème -->
      <div class="article-icon">[EMOJI]</div>
    </div>
    <div class="article-content">       <!-- OBLIGATOIRE -->
      <h2 class="article-title">        <!-- OBLIGATOIRE -->
        <a href="/path/">Titre</a>
      </h2>
      <p class="article-description">   <!-- OBLIGATOIRE -->
        Description...
      </p>
      <div class="article-meta">        <!-- OBLIGATOIRE -->
        <span class="article-author">Auteur</span>
        <span class="article-badge">X min</span>
      </div>
    </div>
  </div>
</article>
```

### **❌ Structures INTERDITES**

**NE JAMAIS UTILISER** ces anciennes structures :

```astro
<!-- ❌ INTERDIT : Sans article-inner -->
<article class="article-card">
  <div class="article-hero">...</div>
  <div class="article-content">...</div>
</article>

<!-- ❌ INTERDIT : Ancien style avec classes personnalisées -->
<article class="bg-white rounded-2xl shadow-lg">
  <div class="h-48 bg-gradient-to-br">...</div>
  <div class="p-6">...</div>
</article>

<!-- ❌ INTERDIT : Classes CSS inline -->
<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
```

### **✅ Classes CSS Standardisées**

**TOUJOURS UTILISER** ces classes :

- `.article-card` → Container principal
- `.article-inner` → Wrapper interne OBLIGATOIRE
- `.article-hero [theme]` → Hero avec thème obligatoire
- `.article-icon` → Container emoji
- `.article-content` → Container contenu
- `.article-title` → Titre article
- `.article-description` → Description article
- `.article-meta` → Container métadonnées
- `.article-author` → Nom auteur
- `.article-badge` → Badge temps lecture

## 🤖 **INTÉGRATION DASHBOARD ADMIN**

### **Template Génération Automatique**

Le dashboard admin devra générer automatiquement :

```javascript
// Template pour nouvelle collection
const collectionTemplate = `---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout 
  title="${collectionName} - Guide Complet"
  description="${collectionDescription}"
  keywords="${keywords.join(', ')}"
>

<div class="container">
  <div class="max-w-6xl mx-auto">
    
    <div class="bg-gradient-to-r from-${heroColor1} to-${heroColor2} text-white rounded-2xl p-8 mb-8">
      <h1 class="text-4xl font-bold mb-4">${collectionTitle}</h1>
      <p class="text-xl opacity-90">
        ${collectionDescription}
      </p>
    </div>

    <div class="collection-grid">
      ${articles.map(article => generateArticleCard(article, themeClass)).join('\n')}
    </div>
  </div>
</div>

</BaseLayout>`;

// Template pour article card
const generateArticleCard = (article, themeClass) => `
<article class="article-card">
  <div class="article-inner">
    <div class="article-hero ${themeClass}">
      <div class="article-icon">${article.icon}</div>
    </div>
    <div class="article-content">
      <h2 class="article-title">
        <a href="/${article.collection}/${article.slug}/">
          ${article.title}
        </a>
      </h2>
      <p class="article-description">
        ${article.description}
      </p>
      <div class="article-meta">
        <span class="article-author">${article.author}</span>
        <span class="article-badge">${article.readingTime}</span>
      </div>
    </div>
  </div>
</article>`;
```

### **Variables Requises pour Admin**

Le dashboard devra permettre de configurer :

- **Collection Name** : Nom technique (slug)
- **Collection Title** : Titre affiché
- **Collection Description** : Description SEO
- **Theme Class** : Classe CSS thématique
- **Hero Colors** : Couleurs du gradient hero
- **Default Icon** : Emoji par défaut pour les articles

## 🚀 **CHECKLIST DÉPLOIEMENT**

### **Avant Ajout Collection/Article**

- [ ] Structure dossiers créée (`src/content/` et `src/pages/`)
- [ ] Template index.astro copié et modifié
- [ ] Classe thématique CSS ajoutée si nécessaire
- [ ] Menu navigation mis à jour

### **Après Ajout**

- [ ] Database régénérée (`generate-database-v2.mjs`)
- [ ] Auteurs mis à jour (`update-authors.mjs`)
- [ ] Test local effectué (`npm run dev`)
- [ ] Design uniforme vérifié
- [ ] SEO validé (title, description, keywords)
- [ ] Déploiement réalisé (`deploy-auto.ps1`)

## 📚 **EXEMPLES CONCRETS**

### **Collection Médicaments (Référence)**

Voir : `src/pages/medicaments-glp1/index.astro`
- Thème : `.medical` (bleu → violet)
- Structure : ✅ Parfaite conformité
- Articles : 6 articles uniformes

### **Collection Perte de Poids (Référence)**

Voir : `src/pages/glp1-perte-de-poids/index.astro`
- Thème : `.weight-loss` (vert)
- Structure : ✅ Parfaite conformité
- Articles : 6 articles uniformes

---

**📢 IMPORTANT** : Ce guide est LA référence absolue pour toute création/modification de collection ou article. Le dashboard admin DOIT se conformer à ces standards pour garantir l'uniformité du design.
