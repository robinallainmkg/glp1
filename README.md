# Site GLP-1 France

Site d'information sur les traitements GLP-1 avec système de gestion de contenu moderne via Decap CMS et déploiement automatisé sur GitHub Pages.

## 🚀 Technologies

- **Framework**: Astro 4.x
- **CMS**: Decap CMS (backend GitHub)
- **Styles**: CSS personnalisé avec variables CSS
- **Déploiement**: GitHub Pages via GitHub Actions
- **Authentification CMS**: GitHub OAuth

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Git
- **Pour le CMS**: Compte GitHub et OAuth App (voir setup ci-dessous)

## 🛠️ Installation

```bash
# Cloner le projet
git clone https://github.com/robinallainmkg/glp1.git
cd glp1

# Installer les dépendances
npm install

# Générer la base de données des articles (optionnel)
npm run generate-database

# Lancer le serveur de développement
npm run dev
```

## 🎛️ Administration - Decap CMS

### Accès au CMS

Une fois le site déployé, accédez au CMS via :
- **Local**: `http://localhost:4321/admin`
- **Production**: `https://robinallainmkg.github.io/glp1/admin`

### Configuration GitHub OAuth App

Pour utiliser le CMS en production, vous devez créer une GitHub OAuth App :

1. **Aller sur GitHub** → Settings → Developer settings → OAuth Apps
2. **Créer une nouvelle OAuth App** avec :
   - Application name: `GLP-1 France CMS`
   - Homepage URL: `https://robinallainmkg.github.io/glp1`
   - Authorization callback URL: `https://api.netlify.com/auth/done` (ou votre proxy OAuth)
3. **Récupérer** le Client ID et Client Secret
4. **Configurer** selon votre méthode d'authentification (voir docs Decap CMS)

### Mode Test Local

Pour tester le CMS en local sans OAuth :

1. Modifier `public/admin/config.yml` temporairement :
```yaml
backend:
  name: test-repo
```

2. Redémarrer le serveur de développement
3. Accéder à `/admin` - vous pourrez créer/éditer du contenu de test

## 🚀 Déploiement

### GitHub Pages (Automatique)

Le déploiement est entièrement automatisé :

1. **Push sur main** → GitHub Actions se déclenche automatiquement
2. **Build** → Le site est construit avec `npm run build`
3. **Deploy** → Publication sur GitHub Pages

### URL du site

- **Production**: https://robinallainmkg.github.io/glp1
- **CMS Admin**: https://robinallainmkg.github.io/glp1/admin

## 📁 Structure du Contenu

Le site organise l'information autour de **9 collections** :

- `alternatives-glp1` - Solutions naturelles
- `glp1-perte-de-poids` - Efficacité et témoignages  
- `effets-secondaires-glp1` - Gestion des risques
- `glp1-cout` - Remboursements, tarifs
- `medicaments-glp1` - Ozempic, Wegovy, Saxenda
- `glp1-diabete` - Usage thérapeutique
- `regime-glp1` - Conseils nutritionnels
- `medecins-glp1-france` - Praticiens spécialisés
- `recherche-glp1` - Études et innovations

Chaque collection peut être gérée via le CMS à `/admin`.

## 🔒 Sécurité

### Politique des Secrets

- ❌ **Jamais de secrets dans le code**
- ✅ **Variables d'environnement locales uniquement**
- ✅ **Clés SSH et certificats exclus du repo**
- ✅ **Headers de sécurité via middleware**

### Headers Sécurisés

Le site implémente automatiquement :
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options  
- Referrer-Policy
- Permissions-Policy

## 🧰 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur local port 4321

# Build
npm run build           # Construction pour production
npm run preview         # Prévisualisation du build

# Maintenance
npm run generate-database  # Mise à jour base articles
npm run clean              # Nettoyage cache build
npm run type-check         # Vérification TypeScript
```

## 📝 Workflow Editorial

### Création d'articles via CMS

1. **Accéder** à `/admin`
2. **Sélectionner** une collection (ex: "GLP-1 Perte de Poids")
3. **Créer** un nouvel article
4. **Remplir** les champs (titre, meta, contenu...)
5. **Sauvegarder** → Crée une Pull Request
6. **Merger** la PR → Publication automatique

### Workflow Git

- **Draft** → Editorial workflow de Decap CMS
- **Review** → Pull Request GitHub  
- **Publish** → Merge + déploiement automatique

## 📊 Monitoring

### Build Status

Vérifiez le statut du déploiement :
- **GitHub Actions** → onglet "Actions" du repo
- **Status badge** disponible dans la documentation

### Logs de Build

En cas d'erreur :
1. Vérifier GitHub Actions logs
2. Tester le build localement : `npm run build`
3. Vérifier la syntaxe des fichiers Markdown

## 🔧 Troubleshooting

### CMS ne charge pas

1. Vérifier la configuration OAuth
2. Contrôler `public/admin/config.yml`
3. Tester en mode `test-repo` localement

### Erreurs de Build

1. `npm run type-check` pour TypeScript
2. Vérifier la structure des collections
3. Valider le frontmatter des articles

### GitHub Pages non accessible

1. Vérifier GitHub Pages settings
2. Contrôler le workflow Actions
3. Valider la configuration `astro.config.mjs`

## 🤝 Contribution

1. Fork le repository
2. Créer une branche feature
3. Tester localement
4. Créer une Pull Request

## 📚 Documentation

- **Astro**: https://docs.astro.build
- **Decap CMS**: https://decapcms.org/docs
- **GitHub Pages**: https://docs.github.com/pages