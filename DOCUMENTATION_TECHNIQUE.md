# Documentation Technique - Site GLP-1 France

## 🎨 Design System Uniforme

### Structure des Collections

Toutes les collections utilisent maintenant une structure uniformisée avec des couleurs spécifiques :

#### Collections et Couleurs

| Collection | Classe CSS | Couleur | Description |
|------------|------------|---------|-------------|
| `glp1-cout` | `price` | Orange/Jaune | Prix et coûts des traitements |
| `medicaments-glp1` | `medication` | Bleu | Médicaments GLP-1 |
| `glp1-perte-de-poids` | `weight-loss` | Vert | Perte de poids |
| `effets-secondaires-glp1` | `effects` | Rouge | Effets secondaires |
| `glp1-diabete` | `diabetes` | Orange | Diabète |
| `regime-glp1` | `nutrition` | Orange/Jaune | Alimentation |
| `alternatives-glp1` | `alternatives` | Cyan | Alternatives |
| `medecins-glp1-france` | `doctors` | Vert foncé | Médecins |
| `recherche-glp1` | `research` | Violet | Recherche |

### Structure des Pages

#### Pages de Collections (`/collection/index.astro`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout title="..." description="..." keywords="...">
<div class="container">
  <div class="max-w-6xl mx-auto">
    
    <!-- Hero Section avec couleur de la collection -->
    <div class="bg-gradient-to-r from-[couleur]-600 to-[couleur]-400 text-white rounded-2xl p-8 mb-8">
      <h1>Titre de la Collection</h1>
      <p>Description...</p>
    </div>

    <!-- Grille d'articles uniformisée -->
    <div class="collection-grid">
      <article class="article-card">
        <div class="article-inner">
          <div class="article-hero [classe-couleur]">
            <div class="article-icon">🔬</div>
          </div>
          <div class="article-content">
            <h2 class="article-title">
              <a href="/collection/article">Titre Article</a>
            </h2>
            <p class="article-description">Description...</p>
            <div class="article-meta">
              <span class="article-author">Auteur</span>
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

#### Templates d'Articles (`/collection/[slug].astro`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('collection-name');
  return entries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<BaseLayout 
  title={entry.data.title}
  description={entry.data.description}
  keywords={entry.data.keywords}
>

<div class="container">
  <article class="article-content">
    <header class="article-header">
      <h1>{entry.data.title}</h1>
      <div class="article-meta">
        <span class="article-author">{entry.data.author}</span>
        <span class="article-date">{entry.data.date}</span>
        <span class="article-reading-time">{entry.data.readingTime} min de lecture</span>
      </div>
    </header>

    <div class="article-body">
      <Content />
    </div>
  </article>
</div>

</BaseLayout>
```

## 🔧 Scripts d'Automatisation

### Correction des Couleurs des Collections
```bash
node scripts/fix-collections.mjs
```

### Uniformisation des Templates d'Articles
```bash
node scripts/fix-article-templates.mjs
```

## 📁 Structure des Fichiers

```
src/
├── layouts/
│   └── BaseLayout.astro          # Layout principal avec header/footer
├── pages/
│   ├── index.astro              # Page d'accueil
│   └── [collection]/
│       ├── index.astro          # Page de collection
│       ├── [slug].astro         # Template articles dynamiques
│       └── article-specifique.astro  # Articles statiques
├── styles/
│   └── global.css               # Styles globaux avec design system
└── content/
    └── [collection]/            # Contenu markdown des articles
```

## 🚀 Déploiement

### Script de Déploiement
```bash
bash deploy.sh
```

Le script :
1. Build le projet avec `npm run build`
2. Upload via scp vers Hostinger
3. Vérifie le déploiement

### Configuration SSH
- Serveur : 147.79.98.140:65002
- Utilisateur : u403023291
- Méthode : scp (compatible Windows Git Bash)

## 🎯 Prochaines Étapes

1. **Dashboard Admin** : Interface pour gérer le contenu
2. **Templates Avancés** : Templates spécialisés par type d'article
3. **SEO Avancé** : Meta-données dynamiques améliorées
4. **Performance** : Optimisation des images et du CSS

## 📝 Maintenance

### Ajouter une Nouvelle Collection

1. Créer le dossier dans `src/pages/nouvelle-collection/`
2. Ajouter `index.astro` avec la structure uniforme
3. Ajouter `[slug].astro` avec le template uniforme
4. Définir la couleur dans `global.css` si nécessaire
5. Mettre à jour les scripts d'automatisation

### Modifier le Design Global

1. Éditer `src/styles/global.css`
2. Tester localement avec `npm run dev`
3. Déployer avec `bash deploy.sh`

---
*Documentation mise à jour automatiquement le ${new Date().toLocaleDateString('fr-FR')}*
