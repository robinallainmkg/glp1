# 🚀 Installation Complète

> Guide d'installation en 5 minutes pour le projet GLP-1 France

## ⚡ Installation Rapide

### 1. Prérequis
```bash
# Vérifier Node.js (requis: v18+)
node --version

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
