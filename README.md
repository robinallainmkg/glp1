# 🏥 GLP-1 France - Site d'Information Médicale

## 📋 APERÇU DU PROJET

Site web d'information spécialisé sur les **agonistes du récepteur GLP-1** en France, développé avec **Astro.js**. 

### Statistiques actuelles (Août 2025)
- **238 articles** répartis en 9 collections thématiques
- **137 pages** générées en statique
- **Dashboard d'administration** avec analyse SEO et pertinence éditoriale
- **Système de maillage interne** optimisé pour le SEO
- **Score SEO moyen** : En cours d'optimisation vers 80+/100

## 🎯 OBJECTIFS

### Principal
Informer et accompagner les patients sur les traitements GLP-1 en France

### Secondaires
- **SEO** : Positionnement sur les mots-clés médicaux stratégiques
- **Monétisation** : Préparation pour l'affiliation (pharmacies, compléments)
- **Autorité** : Référence francophone sur les GLP-1

### 🧹 État du Nettoyage (Août 2025)
- ✅ **Tous les H1 markdown supprimés** (238/238 articles)
- ✅ **Sections vides/génériques nettoyées** 
- ✅ **Dashboard admin optimisé** (2 onglets : Articles + Roadmap)
- ✅ **Architecture des layouts cohérente** (H1 auto-injecté)
- ✅ **Scripts de maintenance documentés**

## 🚀 Technologies

- **Framework**: Astro 4.x
- **Styles**: CSS personnalisé avec variables CSS
- **Scripts**: Node.js pour la génération et le nettoyage de contenu
- **Déploiement**: Compatible avec Vercel, Netlify, GitHub Pages

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Git

## 🛠️ Installation

```bash
# Cloner le projet
git clone https://github.com/robinallainmkg/glp1.git
cd glp1

# Installer les dépendances
npm install

# Nettoyer et optimiser tous les articles (IMPORTANT)
node scripts/clean-definitive.mjs

# Générer l'audit SEO et pertinence
node scripts/audit-pertinence-content.mjs

# Lancer le serveur de développement
npm run dev
```

> **⚠️ IMPORTANT - LOGIQUE DES TITRES H1** : 
> Les articles markdown ne doivent **PAS** contenir de H1 (`# titre`). 
> Le layout `ArticleLayout.astro` injecte automatiquement le H1 depuis le frontmatter `title`.
> Les articles commencent directement par du contenu et des H2 (`## section`).

## 📂 Structure du Projet

```
├── src/
│   ├── layouts/          # Layouts Astro
│   │   ├── ArticleLayout.astro  # Layout principal des articles
│   │   └── BaseLayout.astro     # Layout de base
│   ├── pages/           # Pages du site
│   │   ├── admin-dashboard.astro # Dashboard d'administration
│   │   └── ...         # Pages statiques et dynamiques
│   ├── styles/          # CSS global et thèmes
│   └── content/         # Articles markdown (238 articles)
│       ├── medicaments-glp1/    # 45 articles
│       ├── glp1-perte-de-poids/ # 42 articles
│       ├── effets-secondaires-glp1/ # 38 articles
│       └── ...          # 7 autres collections
├── data/                # Base de données JSON
│   ├── articles-database.json   # Index complet des articles
│   ├── collections.json         # Configuration des collections
│   └── authors-testimonials.json # Témoignages et auteurs
├── scripts/             # Scripts d'optimisation
│   ├── clean-definitive.mjs     # Nettoyage H1 et sections vides
│   ├── audit-pertinence-content.mjs # Audit SEO et éditorial
│   ├── seo-audit-global.mjs     # Analyse SEO stratégique
│   └── ...             # 40+ scripts d'automatisation
├── public/              # Assets statiques
└── dist/               # Build de production
```

### 🎨 Architecture des Layouts

Le site utilise une **architecture de layouts hiérarchique** :

#### 📄 BaseLayout.astro
- **Rôle** : Layout fondamental avec HTML, HEAD, navigation, footer
- **Usage** : Pages statiques, pages de collection (index), pages institutionnelles
- **Contient** :
  - Header avec navigation et recherche
  - Métadonnées SEO (Open Graph, Twitter Cards)
  - CSS global et Google Analytics
  - Footer et scripts communs
- **Utilisé par** : `index.astro`, pages `/collection/index.astro`, pages spéciales

#### 📖 ArticleLayout.astro  
- **Rôle** : Layout spécialisé pour les articles individuels
- **Usage** : Articles de contenu (fichiers markdown des collections)
- **Hérite de** : `BaseLayout.astro` (composition)
- **Fonctionnalités spécifiques** :
  - **🍞 Fil d'Ariane** : Navigation hiérarchique automatique
  - **🎨 H1 stylisé** : Injecté depuis le frontmatter `title` avec gradient thématique
  - **📊 Métadonnées riches** : Auteur, temps de lecture, date, catégorie
  - **🎯 Thèmes adaptatifs** : Couleurs selon la collection (medical, cost, research...)
  - **📱 Design responsive** : Optimisé pour mobile et desktop
  - **🔗 Liens internes** : Navigation entre articles connexes

#### 🎨 Thèmes ArticleLayout Disponibles
```javascript
// Configurations prédéfinies pour chaque type de contenu
'weight-loss'   → ⚖️  Vert     (Perte de poids)
'medical'       → 💊  Bleu     (Médicaments)  
'cost'          → 💰  Jaune    (Prix/Coûts)
'side-effects'  → ⚠️  Rouge    (Effets secondaires)
'research'      → 🔬  Indigo   (Recherche scientifique)
'diabetes'      → 🩺  Violet   (Diabète)
'nutrition'     → 🥗  Orange   (Régime/Nutrition)
'alternatives'  → 🌱  Cyan     (Alternatives naturelles)
'experts'       → 👨‍⚕️ Teal     (Médecins/Experts)
```

#### 🔀 Règles d'Usage
```
Pages Statiques     →  BaseLayout      (ex: accueil, pages collection)
Articles Markdown   →  ArticleLayout   (ex: tous les contenus des dossiers src/content/)
```

#### ⚠️ Règle Importante
Les fichiers markdown ne doivent **JAMAIS** contenir de `# H1` - le titre est automatiquement injecté par `ArticleLayout` depuis le frontmatter.

## 🔧 Commandes

```bash
# Développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview

# ===== SCRIPTS DE NETTOYAGE =====

# Nettoyage complet des articles (supprime H1, sections vides)
node scripts/clean-definitive.mjs

# Audit de pertinence éditoriale et SEO
node scripts/audit-pertinence-content.mjs

# Analyse SEO stratégique avancée
node scripts/seo-audit-global.mjs

# ===== SCRIPTS DE GÉNÉRATION =====

# Génération de la base de données d'articles
node scripts/generate-database-v2.mjs

# Application des prompts d'amélioration
npm run apply:prompt

# Enrichissement des articles courts
node scripts/enrich-short-articles.mjs
```

## 🎨 Fonctionnalités

- **Recherche avancée** avec suggestions et prévisualisation
- **Système d'auteurs** spécialisés par domaine
- **Témoignages** avec conseils beauté
- **Dashboard admin** pour la gestion des articles
- **Design responsive** et cartes d'articles interactives
- **SEO optimisé** avec métadonnées dynamiques

## 👥 Équipe d'Experts

- **Dr. Claire Morel** - Médecin nutritionniste
- **Julien Armand** - Journaliste santé & bien-être  
- **Élodie Carpentier** - Spécialiste cosmétique & dermo-soins
- **Marc Delattre** - Rédacteur sport & forme

## 🔐 Administration

Accès admin via `/admin-login/` avec authentification par session.

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Netlify

```bash
# Build command: npm run build
# Publish directory: dist
```

### Variables d'Environnement de Production

```bash
SITE_URL=https://votre-domaine.com
NODE_ENV=production
ADMIN_PASSWORD=votre_mot_de_passe_securise
```

## 📝 Workflow de Développement

1. **Développement local** sur branche `develop`
2. **Tests** et validation 
3. **Merge** vers `main` pour staging
4. **Deploy** automatique en production

## 🔧 Maintenance

### Scripts d'Optimisation Régulière
```bash
# Audit complet du contenu éditorial
node scripts/audit-pertinence-content.mjs

# Nettoyage définitif (H1, sections vides, contenu générique)
node scripts/clean-definitive.mjs

# Optimisation SEO stratégique
node scripts/seo-audit-global.mjs

# Enrichissement des articles courts (< 300 mots)
node scripts/enrich-short-articles.mjs
```

### Workflow de Contenu
1. **Création** : Ajouter nouveaux articles dans `/src/content/[collection]/`
2. **Nettoyage** : Exécuter `clean-definitive.mjs` pour supprimer H1 et sections vides
3. **Audit** : Lancer `audit-pertinence-content.mjs` pour l'analyse SEO
4. **Optimisation** : Utiliser les scripts d'enrichissement si besoin
5. **Validation** : Vérifier dans le dashboard admin `/admin-dashboard/`

### Données et Configuration
- **Articles** : Régénération via `generate-database-v2.mjs`
- **Témoignages** : Mise à jour dans `/data/authors-testimonials.json`
- **Collections** : Configuration dans `/data/collections.json`
- **Métadonnées** : Frontmatter automatiquement optimisé par les scripts

## 📊 Performance

- Build optimisé avec Astro
- Images optimisées
- CSS minifié
- JavaScript minimal côté client

## 🐛 Dépannage

- **Build Error**: Vérifier la syntaxe des fichiers `.astro`
- **Admin Error**: Vérifier les chemins vers les fichiers de données
- **Styles manquants**: Régénérer le CSS global

## 📞 Support

Pour toute question technique, consulter la documentation Astro ou les issues GitHub.

---

**Version**: 1.0.0  
**Dernière mise à jour**: Août 2025

### 🔄 Migration des Layouts (Août 2025)

#### Problème Initial
Les pages `[slug].astro` de chaque collection utilisaient directement `BaseLayout`, ce qui empêchait :
- L'affichage du fil d'Ariane  
- Les thèmes adaptatifs par collection
- Les métadonnées riches spécifiques aux articles

#### Solution Appliquée
```bash
# Script de migration automatique créé
node scripts/update-collection-layouts.mjs

# Toutes les collections migrées vers ArticleLayout :
✅ alternatives-glp1/[slug].astro
✅ effets-secondaires-glp1/[slug].astro  
✅ glp1-cout/[slug].astro
✅ glp1-diabete/[slug].astro
✅ medecins-glp1-france/[slug].astro
✅ medicaments-glp1/[slug].astro
✅ recherche-glp1/[slug].astro
✅ regime-glp1/[slug].astro
✅ glp1-perte-de-poids/[slug].astro
```

#### Résultat
- 🍞 **Fil d'Ariane** visible sur tous les articles
- 🎨 **Thèmes cohérents** par collection  
- 📊 **Métadonnées uniformes** (auteur, temps de lecture, etc.)
- 🔗 **Navigation améliorée** entre contenus