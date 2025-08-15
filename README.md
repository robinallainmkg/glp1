# 🏥 GLP-1 France - Site d'Information Médicale

> **Branche de référence : `production`**
> 
> Toutes les opérations de développement, de build et de déploiement doivent être effectuées sur la branche `production`. Cette branche correspond toujours à la version en ligne du site. Ne pas utiliser la branche `main` comme référence.

## 📋 APERÇU DU PROJET

Site web d'information spécialisé sur les **agonistes du récepteur GLP-1** en France, développé avec **Astro.js**. 

### Statistiques actuelles (Août 2025)
- **238 articles** répartis en 9 collections thématiques
- **152 pages** générées en statique (build récent)
- **Dashboard d'administration** avec analyse SEO et données utilisateurs
- **Système de collecte de données** (contact, newsletter, guide)
- **APIs TypeScript** sécurisées pour la gestion des données
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

### 📊 Système de Données Utilisateurs (NOUVEAU - Août 2025)
- ✅ **Dashboard admin utilisateurs** : https://glp1-france.fr/admin-user-data/
- ✅ **APIs TypeScript sécurisées** (contact, guide, admin)
- ✅ **Base de données JSON** pour les interactions utilisateurs
- ✅ **Formulaires optimisés** avec autocomplete et validation
- ✅ **Tracking des sources** d'inscription newsletter
- ✅ **Export CSV** des données pour analyse

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

# Basculer sur la branche de production (obligatoire)
git checkout production

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
│   ├── authors-testimonials.json # Témoignages et auteurs
│   ├── contact-submissions.json  # Soumissions de contact (NOUVEAU)
│   ├── newsletter-subscribers.json # Inscrits newsletter (NOUVEAU)
│   └── guide-downloads.json      # Téléchargements guide (NOUVEAU)
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

---

## 📊 Système de Données Utilisateurs

### 🎯 Vue d'ensemble
Système complet de collecte et d'analyse des interactions utilisateurs déployé en août 2025.

### 🔧 Composants

#### Dashboard Admin
- **URL** : https://glp1-france.fr/admin-user-data/
- **Fichier** : `src/pages/admin-user-data.astro`
- **Authentification** : admin/admin123
- **Fonctionnalités** :
  - Statistiques en temps réel
  - Liste des utilisateurs avec source
  - Export CSV des données
  - Graphiques de tendances

#### APIs TypeScript
```typescript
// Contact avec newsletter
POST /api/contact
// Guide avec préférences
POST /api/guide-beauty  
// Données admin (auth requis)
GET /api/admin-data
```

#### Base de données JSON
- `data/contact-submissions.json` - Messages de contact
- `data/newsletter-subscribers.json` - Inscrits newsletter avec source
- `data/guide-downloads.json` - Téléchargements avec préférences

#### Formulaires optimisés
- **Contact** : https://glp1-france.fr/contact/
- **Guide** : https://glp1-france.fr/guide-beaute-perte-de-poids-glp1/
- Autocomplete activé, validation en temps réel
- Intégration newsletter automatique

### 📈 Données collectées
- Inscriptions newsletter par source (contact/guide/direct)
- Messages de contact avec opt-in newsletter
- Préférences utilisateur (préoccupations beauté/santé)
- Horodatage précis de toutes les interactions

### 🔒 Sécurité
- Validation email côté serveur
- Protection CORS sur les APIs
- Authentification basique pour l'admin
- Sanitisation des données d'entrée

> **Documentation complète** : [docs/SYSTEME_DONNEES_UTILISATEURS.md](./docs/SYSTEME_DONNEES_UTILISATEURS.md)

---

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

## 🚀 DÉPLOIEMENT

### Plateformes Supportées

#### 🖥️ **macOS/Linux** : Déploiement Automatique SSH

```bash
# Build et déploiement en une commande
npm run build
node deploy-auto.js
```

**Détails** :
- Utilise `rsync` + `sshpass` pour un déploiement rapide
- Supprime automatiquement les anciens fichiers
- Synchronisation complète du dossier `dist/`
- Connexion SSH directe au serveur Hostinger

#### 🪟 **Windows** : Déploiement PowerShell 

```powershell
# Build et déploiement PowerShell
npm run build
.\deploy-auto.ps1
```

**Détails** :
- Script PowerShell optimisé pour Windows
- Support SFTP/SCP via WinSCP ou alternatives
- Gestion des permissions Windows
- Configuration automatique des credentials

#### 📁 **Déploiement Manuel** (Toutes plateformes)

```bash
# Générer le build
npm run build

# Ouvrir le dossier dist pour upload manuel
node deploy-manual.js
```

**Instructions SFTP** :
- **Host** : 147.79.98.140:65002
- **Username** : u403023291  
- **Répertoire cible** : `domains/glp1-france.fr/public_html/`
- **Méthode** : FileZilla, WinSCP, ou client SFTP

### Configuration Serveur

#### Hostinger SSH/SFTP
```bash
Host: 147.79.98.140
Port: 65002
Username: u403023291
Target: domains/glp1-france.fr/public_html/
Protocol: SSH/SFTP
```

#### Commandes de Build

```bash
# Build optimisé pour production
npm run build

# Preview du build en local
npm run preview

# Audit final avant déploiement
npm run check
```

### ✅ Checklist Déploiement

- [ ] `npm run build` réussi sans erreurs
- [ ] Vérification du dashboard admin (`/admin-dashboard`)
- [ ] Test des URLs critiques (collections, articles)
- [ ] Validation du sitemap (`/sitemap.xml`)
- [ ] Upload des fichiers via méthode appropriée à la plateforme
- [ ] Test du site en production : https://glp1-france.fr

### 🛍️ Affiliation Shopify Collabs (Août 2025)
- ✅ **Partenaire Talika** : Bust Phytoserum (raffermissant post-GLP1)
- ✅ **Code promo** : `GLP1` (-10%)
- ✅ **URL trackée** : talika.fr/GLP1
- ✅ **Placement intelligent** : Après 2 paragraphes dans articles pertinents
- ✅ **Design optimisé** : Badge, pricing et CTA sans doublons