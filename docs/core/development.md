# Workflow de Développement - GLP-1 France

## Vue d'ensemble

Guide complet pour le développement quotidien, incluant les commandes essentielles, le workflow éditorial et les bonnes pratiques.

## � Démarrage Quotidien

### Commandes de Base

```bash
# Navigation vers le projet
cd glp1-github

# Démarrage développement standard
npm run dev

# Démarrage avec TinaCMS (pour contenu)
npm run dev:tina

# Build et test
npm run build
npm run preview
```

### URLs d'Accès

- **Site principal** : http://localhost:4321/
- **Admin TinaCMS** : http://localhost:4321/admin
- **Dashboard Admin** : http://localhost:4321/admin/

## � Workflow Éditorial

### 1. Création d'Articles via TinaCMS

```bash
# Démarrer TinaCMS
npm run dev:tina
```

1. Aller sur http://localhost:4321/admin
2. Sélectionner la collection appropriée
3. Créer un nouvel article
4. Remplir les métadonnées SEO
5. Ajouter l'image principale
6. Sauvegarder (commit automatique)

### 2. Structure d'un Article

```markdown
---
title: "Titre SEO optimisé"
description: "Description meta pour SEO"
image: "/images/uploads/article-image.jpg"
imageAlt: "Description alternative de l'image"
author: "dr-claire-morel"
date: "2025-08-20"
categories: ["medicaments-glp1"]
featured: false
---

# Contenu de l'article

Introduction engageante...

## Sections structurées

Contenu détaillé avec headers H2, H3...
```

### 3. Gestion des Images

#### Via TinaCMS
- Upload direct dans l'éditeur
- Compression automatique
- Alt text obligatoire
- Formats supportés : JPG, PNG, WebP

#### Via Script
```bash
# Génération automatique de thumbnails
node scripts/generate-thumbnails.mjs

# Optimisation des images existantes
npm run optimize:images
```

#### Structure recommandée
```
public/images/
├── thumbnails/          # Auto-générées (400x200px)
├── uploads/            # Via TinaCMS
├── experts/            # Photos d'experts (80x80px)
├── collections/        # Images de collections
└── og/                # Images Open Graph (1200x630px)
```

## 🛠️ Développement Technique

### Architecture du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── AffiliateProduct.astro
│   ├── ArticleCard.astro
│   └── SearchBox.astro
├── layouts/            # Templates de page
│   ├── BaseLayout.astro
│   ├── ArticleLayout.astro
│   └── CollectionLayout.astro
├── pages/              # Pages du site
│   ├── api/           # Endpoints API
│   ├── admin/         # Interface admin
│   ├── collections/   # Pages de collections
│   └── guides/        # Pages de guides
├── content/           # Contenu géré par TinaCMS
│   ├── medicaments-glp1/
│   ├── glp1-perte-de-poids/
│   └── autres-collections/
└── utils/             # Fonctions utilitaires
    ├── affiliate-manager.ts
    └── content-helpers.ts
```

### Configuration TinaCMS

Le schema TinaCMS est défini dans `.tina/config.ts` :

```typescript
// Collections principales
collections: [
  {
    name: "medicaments-glp1",
    label: "Médicaments GLP-1",
    path: "src/content/medicaments-glp1",
    fields: [
      { name: "title", type: "string", required: true },
      { name: "description", type: "string" },
      { name: "image", type: "image" },
      { name: "body", type: "rich-text" }
    ]
  },
  // ... autres collections
]
```

### APIs et Data Management

#### Structure des APIs
```
src/pages/api/
├── contact.ts          # Formulaire de contact
├── guide-beauty.ts     # Téléchargement guide
└── admin-data.ts       # Administration données
```

#### Gestion des données
```
data/
├── users-unified.json           # Base utilisateurs
├── contact-submissions.json     # Messages contact
├── newsletter-subscribers.json  # Newsletter
├── affiliate-products.json     # Produits affiliés
└── collections.json            # Métadonnées collections
```

## � Workflow Git

### Branches principales
- `production` : Code de production
- `develop` : Développement actuel
- `feature/*` : Nouvelles fonctionnalités

### Processus de développement

```bash
# 1. Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et tester
npm run dev
npm run build

# 3. Commit et push
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# 4. Merge vers develop puis production
git checkout develop
git merge feature/nouvelle-fonctionnalite
git push origin develop
```

## 🧪 Tests et Validation

### Tests de Build
```bash
# Test complet de build
npm run build

# Preview du build
npm run preview

# Vérification des types
npm run check

# Formatage du code
npm run format
```

### Tests de Contenu
- Vérifier les liens internes
- Tester les formulaires
- Valider les métadonnées SEO
- Contrôler l'affichage des images

### Tests de Performance
```bash
# Analyse du bundle
npm run build:analyze

# Test de performance
npm run lighthouse
```

## 🚨 Debug et Troubleshooting

### Problèmes courants

#### TinaCMS ne démarre pas
```bash
rm -rf .tina
npx @tinacms/cli@latest build
npm run dev:tina
```

#### Images manquantes
```bash
# Vérifier la structure
ls public/images/thumbnails/

# Régénérer si besoin
node scripts/generate-thumbnails.mjs
```

#### Erreurs de build
```bash
# Nettoyer le cache
rm -rf dist .astro node_modules/.cache
npm install
npm run build
```

### Logs utiles

```bash
# Mode debug Astro
DEBUG=astro:* npm run dev

# Logs détaillés TinaCMS  
TINA_DEBUG=1 npm run dev:tina
```

## 📊 Monitoring et Analytics

### Dashboard Admin
- **URL** : http://localhost:4321/admin/
- **Données** : Utilisateurs, affiliation, analytics
- **Export** : CSV, JSON

### Métriques importantes
- Inscriptions newsletter
- Téléchargements guide
- Clics affiliation
- Pages vues par collection

## ⚡ Scripts de Maintenance

```bash
# Génération d'images
npm run generate:images

# Optimisation complète
npm run optimize:all

# Nettoyage cache
npm run clean

# Backup données
npm run backup:data

# Validation liens
npm run check:links
```

## 📚 Références Développement

- [Architecture](architecture.md) - Structure technique
- [Deployment](deployment.md) - Mise en production
- [Features/Content Management](../features/content-management.md) - Gestion contenu
- [Operations/Troubleshooting](../operations/troubleshooting.md) - Résolution problèmes

---

> **Tip** : Utilisez `npm run dev:tina` pour l'édition de contenu et `npm run dev` pour le développement technique.
npm run dev:tina        # Site + TinaCMS (recommandé)
# ou
npm run dev            # Site seul (plus rapide)

# Arrêter les processus
taskkill /f /im node.exe   # Windows
# ou Ctrl+C dans les terminaux
```

**URLs de développement** :
- **Site** : http://localhost:4321/
- **TinaCMS Admin** : http://localhost:4321/admin

## 📝 Gestion de Contenu avec TinaCMS

### Workflow Éditorial

1. **Accéder au CMS** : http://localhost:4321/admin
2. **Sélectionner une collection** (ex: medicaments-glp1)
3. **Modifier un article** ou créer nouveau
4. **Sauvegarder** → Git commit automatique
5. **Prévisualiser** sur le site

### Collections Disponibles
```
📊 9 Collections | 119 Articles Total

medicaments-glp1         → 19 articles
glp1-perte-de-poids     → 15 articles  
glp1-cout               → 12 articles
glp1-diabete            → 14 articles
effets-secondaires-glp1 → 13 articles
medecins-glp1-france    → 11 articles
recherche-glp1          → 12 articles
regime-glp1             → 13 articles
alternatives-glp1       → 10 articles
```

### Structure d'Article Type
```yaml
---
title: "Ozempic pour Maigrir : Guide Complet 2024"
metaDescription: "Découvrez comment Ozempic aide à perdre du poids..."
slug: "ozempic-perte-de-poids-guide"
pubDate: 2024-01-15
updateDate: 2024-08-20
author: "Dr. Martin Dubois"
category: "Guide médical"
keywords: ["ozempic", "perte de poids", "GLP-1"]
thumbnail: "ozempic-perte-de-poids-illus.jpg"
featured: true
priority: 1
---

# Contenu de l'article en Markdown
...
```

## 🖼️ Gestion des Images

### Convention de Nommage
```
public/images/thumbnails/
├── {article-slug}-illus.jpg     # Image principale
├── ozempic-prix-illus.jpg       # Exemple
└── wegovy-avis-illus.jpg        # Exemple
```

### Workflow Images

1. **Créer l'image** (1200x630px, <200KB)
2. **Nommer** selon le slug de l'article
3. **Placer** dans `public/images/thumbnails/`
4. **Référencer** dans le frontmatter TinaCMS

### Scripts Images
```bash
# Générer images manquantes
node scripts/image-generator.mjs --missing-only

# Forcer régénération
node scripts/image-generator.mjs --force

# Changer type d'image (photo/ai)
node scripts/image-switcher.mjs switch {slug} {type}
```

## 🔧 Développement Frontend

### Structure des Composants
```
src/
├── components/
│   ├── ArticleCard.astro      # Carte d'article
│   ├── CollectionGrid.astro   # Grille de collections
│   ├── Header.astro           # Navigation
│   └── Footer.astro           # Pied de page
├── layouts/
│   ├── ArticleLayout.astro    # Layout article
│   ├── CollectionLayout.astro # Layout collection
│   └── BaseLayout.astro       # Layout de base
└── pages/
    ├── index.astro            # Page d'accueil
    ├── articles.astro         # Liste articles
    └── collections/           # Pages collections
```

### Hot Reload et Debugging

**TinaCMS + Astro** :
```bash
npm run dev:tina
# Port 4001: TinaCMS GraphQL
# Port 4321: Site Astro
```

**Astro seul** (plus rapide) :
```bash
npm run dev
# Port 4321: Site seulement
```

### Logs et Debugging
```bash
# Logs détaillés
npm run dev -- --verbose

# Debug mode Astro
npm run dev -- --debug

# Vérifier la configuration
npm run build 2>&1 | grep -i error
```

## 🗄️ Travail avec la Base de Données

### APIs Supabase Disponibles
```typescript
// src/pages/api/deals.ts - Produits affiliés
// src/pages/api/products.ts - Recherche produits
// src/pages/api/contact.ts - Formulaires
// src/lib/supabase.ts - Client Supabase
```

### Tests Supabase
```bash
# Test connexion
npm run db:test

# Vérifier les tables
# Aller sur: https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum
```

### Données Locales (Obsolète)
```bash
# Vérifier migration terminée
powershell -ExecutionPolicy Bypass -File "scripts\check-data-migration.ps1" -DryRun

# Nettoyer ancien dossier data/
powershell -ExecutionPolicy Bypass -File "scripts\deployment\deploy-auto.ps1" -CleanLocalData
```

## 🎨 Styling avec TailwindCSS

### Classes Communes
```css
/* Layout */
.container-max    → max-width + center
.grid-articles    → Grid responsive articles
.flex-center      → Flex center alignment

/* Components */
.btn-primary      → Bouton principal
.card-article     → Carte d'article
.badge-category   → Badge de catégorie

/* Responsive */
sm:               → Mobile
md:               → Tablet  
lg:               → Desktop
xl:               → Large screen
```

### Configuration TailwindCSS
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
      }
    }
  }
}
```

## ⚡ Performance et Optimisation

### Build et Test
```bash
# Build production
npm run build

# Analyser le bundle
npm run build:analyze

# Preview local du build
npm run preview
```

### Métriques Cibles
- **Build Time** : < 3 minutes
- **Bundle Size** : < 1MB
- **Lighthouse Score** : > 90
- **Images** : < 200KB chacune

### Optimisations Automatiques
- **Tree-shaking** : CSS/JS inutilisé supprimé
- **Image optimization** : Compression automatique
- **Static generation** : Pré-rendu complet
- **Minification** : HTML/CSS/JS optimisés

## 🔄 Git Workflow

### Branches
```bash
# Branche principale
git checkout production

# Nouvelle fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite

# Merge vers production
git checkout production
git merge feature/nouvelle-fonctionnalite
```

### Commits TinaCMS
```bash
# TinaCMS fait des commits automatiques
git log --oneline | head -5
# Exemple:
# a1b2c3d Updates content/medicaments-glp1/ozempic-prix.md
# d4e5f6g Updates content/glp1-cout/wegovy-prix.md
```

### Synchronisation
```bash
# Pull dernières modifications
git pull origin production

# Push modifications
git push origin production
```

## 🚀 Préparation Déploiement

### Validation Pré-déploiement
```bash
# Validation complète
powershell -ExecutionPolicy Bypass -File "scripts\validate-tina-setup.ps1"

# Test build
npm run build

# Vérification images
ls public/images/thumbnails/ | wc -l  # Doit être ~119
```

### Checklist Développement
- [ ] **Site démarre** sans erreur (`npm run dev`)
- [ ] **TinaCMS fonctionne** (`npm run dev:tina`)
- [ ] **Articles s'affichent** correctement
- [ ] **Images chargent** toutes
- [ ] **Build réussit** (`npm run build`)
- [ ] **Aucune erreur console** dans le navigateur
- [ ] **Git sync** opérationnel

## 🚨 Dépannage Développement

### Erreurs Communes

**Port 4321 occupé**
```bash
taskkill /f /im node.exe
npm run dev
```

**TinaCMS ne charge pas**
```bash
rm -rf tina/__generated__
npm install
npm run dev:tina
```

**Images 404**
```bash
# Vérifier structure
ls public/images/thumbnails/

# Régénérer si nécessaire
node scripts/image-generator.mjs --missing-only
```

**Build fail**
```bash
# Nettoyer et rebuild
rm -rf dist/ .astro/
npm run build
```

### Logs Utiles
```bash
# Logs serveur Astro
npm run dev -- --verbose

# Logs TinaCMS
# Check console navigateur sur /admin

# Logs build
npm run build 2>&1 | tee build.log
```

## 📊 Monitoring Développement

### Métriques à Surveiller
- **Temps de démarrage** : < 30 secondes
- **Hot reload** : < 3 secondes
- **Build time** : < 3 minutes
- **Bundle size** : Surveillance des augmentations

### Outils de Monitoring
```bash
# Taille du build
du -sh dist/

# Analyse des dépendances
npm ls --depth=0

# Performance build
time npm run build
```

---

**Workflow type** : TinaCMS → Modification → Save → Git → Test → Deploy | **Support** : [troubleshooting.md](../operations/troubleshooting.md)
