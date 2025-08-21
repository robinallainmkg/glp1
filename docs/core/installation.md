# Installation et Setup - GLP-1 France

## Vue d'ensemble

Guide d'installation complète pour le projet GLP-1 France, incluant Supabase, TinaCMS et l'environnement de développement.

## 🚀 Installation Rapide (5 minutes)

### Prérequis
- Node.js 18+ installé
- Git installé
- Compte Supabase (gratuit)

### 1. Clone et Installation

```bash
git clone [repository-url]
cd glp1-github
npm install
```

### 2. Configuration Supabase

#### Créer le projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **URL du projet** et **clé anon publique**

#### Configuration des variables d'environnement
Créez `.env` à la racine :

```env
PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

#### Structure de base de données
Exécutez ces requêtes SQL dans l'éditeur Supabase :

```sql
-- Table utilisateurs
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  source VARCHAR(100),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 3. Configuration TinaCMS

#### Génération du client TinaCMS
```bash
npx @tinacms/cli@latest build
```

#### Client ID TinaCMS
Ajouter dans `.env` :
```env
NEXT_PUBLIC_TINA_CLIENT_ID=d2c40213-494b-4005-94ad-b601dbdf1f0e
```

### 4. Lancement du développement

```bash
# Mode développement standard
npm run dev

# Mode TinaCMS (pour édition contenu)
npm run dev:tina
```

**URLs d'accès :**
- Site : http://localhost:4321/
- Admin TinaCMS : http://localhost:4321/admin
- Admin Dashboard : http://localhost:4321/admin/

## 🛠️ Configuration Avancée

### Structure des Données

Le projet utilise des fichiers JSON pour stocker les données :

```
data/
├── users-unified.json           # Données utilisateurs unifiées
├── contact-submissions.json     # Messages de contact
├── newsletter-subscribers.json  # Inscrits newsletter  
├── guide-downloads.json        # Téléchargements guide
├── affiliate-products.json     # Produits d'affiliation
├── authors-testimonials.json   # Auteurs et témoignages
└── collections.json            # Métadonnées collections
```

### Configuration des APIs

Les APIs sont configurées pour fonctionner en mode statique :

```typescript
// Configuration Astro
export default {
  output: 'static',  // Mode statique pour Hostinger
  // Les APIs PHP remplacent les endpoints TypeScript
}
```

### Environnements

#### Développement Local
- Détection automatique via `localhost`
- APIs : TypeScript endpoints
- Base de données : Fichiers JSON locaux

#### Production (Hostinger)
- Détection automatique via hostname
- APIs : Fichiers PHP
- Base de données : JSON + backups automatiques

## 🔧 Configuration Spécifique

### Images et Médias

```bash
# Génération automatique de thumbnails
node scripts/generate-thumbnails.mjs

# Optimisation d'images
npm run optimize:images
```

Structure recommandée :
```
public/images/
├── thumbnails/     # Générées automatiquement
├── uploads/        # Via TinaCMS
├── experts/        # Photos d'experts
└── collections/    # Images de collections
```

### SEO et Métadonnées

Configuration dans `src/config/site.config.json` :

```json
{
  "site": {
    "title": "GLP-1 France",
    "description": "Guide complet sur les traitements GLP-1",
    "url": "https://glp1-france.fr"
  },
  "seo": {
    "defaultImage": "/images/og-default.jpg",
    "twitterCard": "summary_large_image"
  }
}
```

## 🚨 Troubleshooting Installation

### Problème : TinaCMS ne démarre pas
```bash
# Nettoyer le cache
rm -rf .tina
npx @tinacms/cli@latest build
npm run dev:tina
```

### Problème : Erreurs de build
```bash
# Vérifier les dépendances
npm audit fix
npm run build
```

### Problème : Supabase connexion
1. Vérifier les variables d'environnement
2. Tester la connexion dans la console Supabase
3. Vérifier les politiques RLS (Row Level Security)

### Problème : Images manquantes
```bash
# Régénérer toutes les thumbnails
node scripts/generate-thumbnails.mjs
```

## 📚 Références

- [Documentation Astro](https://docs.astro.build/)
- [Documentation TinaCMS](https://tina.io/docs/)
- [Documentation Supabase](https://supabase.com/docs)
- [Guide Supabase 5min](../archive/INSTALLATION-SUPABASE-5MIN.md)

## ⚡ Scripts Utiles

```bash
# Développement
npm run dev                 # Site standard
npm run dev:tina           # Avec TinaCMS

# Build et déploiement
npm run build              # Build production
npm run preview            # Preview build local

# Maintenance
npm run check              # Vérification types
npm run format             # Formatage code
npm run generate:images    # Génération thumbnails
```

---

> **Note** : Cette installation configure un environnement complet de développement. Pour un déploiement en production, voir [deployment.md](deployment.md).

# Vérifier npm
npm --version

# Si manquant, installer Node.js depuis nodejs.org
```

### 2. Clone et Installation
```bash
# Clone du repository
git clone https://github.com/robinallainmkg/glp1.git
cd glp1

# Installation des dépendances
npm install

# Première vérification
npm run dev
```

**✅ Test** : Site accessible sur http://localhost:4321/

## 🔧 Configuration TinaCMS

### Variables d'Environnement
Créer un fichier `.env` :
```env
# TinaCMS (obligatoire)
NEXT_PUBLIC_TINA_CLIENT_ID=d2c40213-494b-4005-94ad-b601dbdf1f0e
TINA_TOKEN=your_tina_token_here
NEXT_PUBLIC_TINA_BRANCH=main

# Supabase (si besoin des APIs)
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Production
NODE_ENV=development
ASTRO_TELEMETRY_DISABLED=1
```

### Démarrage TinaCMS
```bash
# Démarrer avec TinaCMS
npm run dev:tina

# Interface admin accessible sur:
# http://localhost:4321/admin
```

## 📊 Configuration Supabase

### 1. Projet Supabase
- **URL Projet** : https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum
- **Base de données** : Déjà configurée
- **Tables** : users, deals, submissions, guide_downloads

### 2. Variables d'Environnement
```bash
# Récupérer depuis Supabase Dashboard > Settings > API
PUBLIC_SUPABASE_URL=https://ywekaivgjzsmdocchvum.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Key publique
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Key service (admin)
```

### 3. Test Connexion
```bash
# Tester la connexion Supabase
npm run db:test
```

## 🖼️ Configuration Images

### Structure Images
```bash
# Vérifier la structure des images
ls public/images/thumbnails/
# Doit contenir des fichiers: article-slug-illus.jpg
```

### Génération Images Manquantes
```bash
# Générer les images manquantes
node scripts/image-generator.mjs --missing-only

# Vérifier les images générées
ls public/images/thumbnails/ | wc -l
# Cible: ~119 images (une par article)
```

## 📝 Validation Installation

### Script de Validation Complet
```bash
# Valider toute l'installation
powershell -ExecutionPolicy Bypass -File "scripts\validate-tina-setup.ps1"

# Ou version simplifiée
powershell -ExecutionPolicy Bypass -File "scripts\check-data-migration.ps1" -DryRun
```

### Checklist Manuelle
- [ ] **Node.js** v18+ installé
- [ ] **npm install** terminé sans erreur
- [ ] **npm run dev** démarre le site
- [ ] **npm run dev:tina** démarre TinaCMS
- [ ] **Variables d'environnement** configurées
- [ ] **Images thumbnails** présentes
- [ ] **Admin TinaCMS** accessible (/admin)

## 🔧 Outils de Développement

### Extensions VS Code Recommandées
```json
{
  "recommendations": [
    "astro-build.astro-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.powershell",
    "yzhang.markdown-all-in-one"
  ]
}
```

### Scripts Utiles
```bash
# Développement
npm run dev              # Site seul
npm run dev:tina         # Site + TinaCMS
npm run build            # Build production

# Maintenance
npm run lint             # Vérifications code
npm run type-check       # Validation TypeScript
npm run preview          # Preview build local
```

## 📦 Structure Projet

### Dossiers Principaux
```
glp1-github/
├── src/
│   ├── components/      # Composants Astro
│   ├── content/         # Articles (9 collections)
│   ├── layouts/         # Layouts de page
│   ├── pages/           # Pages et APIs
│   └── lib/             # Utilities (Supabase, etc.)
├── public/
│   ├── images/          # Images statiques
│   └── admin/           # Interface TinaCMS
├── tina/                # Configuration TinaCMS
├── scripts/             # Scripts automatisation
└── docs/                # Documentation (vous êtes ici)
```

### Collections Articles
- **medicaments-glp1** (19 articles)
- **glp1-perte-de-poids** (15 articles)
- **glp1-cout** (12 articles)
- **glp1-diabete** (14 articles)
- **effets-secondaires-glp1** (13 articles)
- **medecins-glp1-france** (11 articles)
- **recherche-glp1** (12 articles)
- **regime-glp1** (13 articles)
- **alternatives-glp1** (10 articles)

**Total** : 119 articles gérés via TinaCMS

## 🚨 Dépannage Installation

### Erreurs Communes

**Port 4321 occupé**
```bash
# Windows
taskkill /f /im node.exe

# Puis relancer
npm run dev
```

**Erreur TinaCMS**
```bash
# Nettoyer le cache
rm -rf tina/__generated__
npm run dev:tina
```

**Images manquantes**
```bash
# Générer toutes les images
node scripts/image-generator.mjs --force
```

**Supabase connection failed**
```bash
# Vérifier les variables d'environnement
echo $PUBLIC_SUPABASE_URL
echo $PUBLIC_SUPABASE_ANON_KEY

# Tester la connexion
npm run db:test
```

## ✅ Validation Finale

### Test Complet
```bash
# 1. Site fonctionne
curl http://localhost:4321/

# 2. TinaCMS accessible
curl http://localhost:4321/admin/

# 3. Collections chargées
curl http://localhost:4321/collections/medicaments-glp1/

# 4. Build réussit
npm run build

# 5. Preview fonctionne
npm run preview
```

**🎉 Installation terminée !** Vous pouvez maintenant consulter le [guide de développement](development.md).

---

**Temps total** : ~5 minutes | **Prérequis** : Node.js v18+ | **Support** : [troubleshooting.md](../operations/troubleshooting.md)
