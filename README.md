# Site GLP-1 France

Site d'information sur les traitements GLP-1 avec système d'administration intégré.

## 🚀 Technologies

- **Framework**: Astro 4.x
- **Styles**: CSS personnalisé avec variables CSS
- **Scripts**: Node.js pour la génération de contenu
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

# Configurer l'environnement
cp .env.example .env.local

# Générer la base de données des articles
npm run generate-database

# Lancer le serveur de développement
npm run dev
```

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