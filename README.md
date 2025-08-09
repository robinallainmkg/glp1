# Site GLP-1 France

Site d'information sur les traitements GLP-1 avec système d'administration intégré et déploiement automatisé.

## 🚀 Technologies

- **Framework**: Astro 4.x
- **Styles**: CSS personnalisé avec variables CSS
- **Scripts**: Node.js pour la génération de contenu
- **Déploiement**: Hostinger via SSH (automatisé), compatible Vercel/Netlify

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Git
- **Pour le déploiement**: SSH client, clé ED25519

## 🛠️ Installation

```bash
# Cloner le projet
git clone https://github.com/robinallainmkg/glp1.git
cd glp1

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local

# Générer la base de données des articles
npm run generate-database

# Lancer le serveur de développement
npm run dev
```

## 🚀 Déploiement

### Quick Start (Windows)

```powershell
# Test de déploiement
npm run deploy:dry

# Déploiement réel
npm run deploy

# Afficher la clé SSH publique
npm run deploy:show-key
```

### Configuration SSH (première fois)

1. **Générer la clé SSH** :
```bash
ssh-keygen -t ed25519 -f ~/.ssh/glp1_ed25519 -C "glp1-france@hostinger"
```

2. **Configurer sur Hostinger** :
   - Panel Hostinger → SSH Access
   - Coller la clé publique (`npm run deploy:show-key`)
   - Sauvegarder

3. **Tester la connexion** :
```bash
ssh -i ~/.ssh/glp1_ed25519 -p 65002 u403023291@147.79.98.140
```

### Déploiement Cross-Platform

- **Windows** : Scripts PowerShell + Git Bash
- **macOS/Linux** : Scripts Bash natifs
- **Tous** : SSH + SCP pour le transfert

📖 **Guide complet** : [GUIDE_DEPLOYMENT_COMPLET.md](./GUIDE_DEPLOYMENT_COMPLET.md)

## ⚡️ Build et ouverture automatique du site local

Le workflow de build met à jour automatiquement la base articles-database.json et ouvre le site dans le navigateur :

```bash
npm run build && npm run preview
```

Cela va :
Lancer la prévisualisation locale sur http://localhost:4173

Si tu veux désactiver l'ouverture automatique, modifie ou retire la commande `open-preview` dans le `package.json`.
## 📂 Structure du Projet

```
├── src/
│   ├── layouts/          # Layouts Astro
│   ├── pages/           # Pages du site
│   ├── styles/          # CSS global
│   └── content/         # Articles markdown
├── data/                # Base de données JSON
├── scripts/             # Scripts de génération
├── public/              # Assets statiques
└── dist/               # Build de production
```

## 🔧 Commandes

```bash
# Développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview

# Génération de la base de données
node scripts/generate-database-v2.mjs

# Application des prompts
npm run apply:prompt
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

### 🏗️ Déploiement Automatisé Hostinger (Recommandé)

Le projet inclut un système de déploiement automatisé vers Hostinger avec backup et vérifications intégrées.

#### Configuration Initiale

1. **Configurer SSH** (voir [Guide SSH](GUIDE_CONFIGURATION_SSH.md))
2. **Créer la configuration de production** :
```bash
cp .env.production.example .env.production
# Éditer .env.production avec vos paramètres Hostinger
```

#### Scripts de Déploiement

```bash
# Déploiement complet avec backup
npm run deploy

# Déploiement rapide sans backup  
npm run deploy:quick

# Test de déploiement (sans upload réel)
npm run deploy:dry

# Vérification post-déploiement
npm run deploy:check

# Rollback vers version précédente
npm run deploy:rollback
```

#### Fonctionnalités du Système de Déploiement

- ✅ **Build automatique** avec vérification d'erreurs
- ✅ **Backup distant** avant chaque déploiement
- ✅ **Synchronisation rsync** optimisée avec exclusions
- ✅ **Vérification post-déploiement** (HTTP, SSL, métriques)
- ✅ **Rollback automatique** en cas de problème
- ✅ **Logs détaillés** pour chaque déploiement
- ✅ **Nettoyage automatique** des anciens backups

#### Workflow de Déploiement Recommandé

```bash
# 1. Tester en local
npm run build
npm run preview

# 2. Test dry-run
npm run deploy:dry

# 3. Déploiement réel
npm run deploy

# 4. Vérification
npm run deploy:check
```

### 🌐 Autres Plateformes

#### Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

#### Netlify

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

- Régénération de la base d'articles via scripts
- Mise à jour des témoignages dans `/data/authors-testimonials.json`
- Ajout de nouveaux articles dans `/src/content/`

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