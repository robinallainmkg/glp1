# 🚀 Guide de Migration GitHub et Déploiement Production

## 📋 Checklist Pré-Migration

### ✅ Configuration Locale
- [x] `.gitignore` configuré
- [x] `.env.example` créé  
- [x] `README.md` documenté
- [x] `package.json` avec scripts complets
- [x] Configuration Vercel/Netlify ajoutée
- [x] Build testé et fonctionnel

### 🔧 Actions à Effectuer Avant GitHub

1. **Nettoyer le projet**
```bash
# Supprimer les fichiers temporaires
rm -rf node_modules/.cache
rm -rf .astro
rm src/pages/admin-broken.astro.bak

# Tester le build
npm run clean
npm install
npm run build
```

2. **Créer le fichier .env.local**
```bash
cp .env.example .env.local
# Éditer .env.local avec vos valeurs locales
```

3. **Modifier astro.config.mjs**
```javascript
// Remplacer 'votre-domaine.com' par votre domaine réel
site: 'https://glp1-france.com'
```

## 🌟 Migration vers GitHub

### 1. Initialiser Git
```bash
cd /Users/mac/Documents/glp1_affiliate_site_scaffold
git init
git add .
git commit -m "Initial commit: Site GLP-1 France v1.0"
```

### 2. Créer le Repo GitHub
1. Aller sur GitHub.com
2. Créer un nouveau repository **PRIVÉ** : `glp1-affiliate-site`
3. **NE PAS** initialiser avec README (déjà existant)

### 3. Connecter et Pousser
```bash
git remote add origin https://github.com/VOTRE-USERNAME/glp1-affiliate-site.git
git branch -M main
git push -u origin main
```

### 4. Créer les Branches
```bash
# Créer et pousser la branche develop
git checkout -b develop
git push -u origin develop

# Créer et pousser la branche staging  
git checkout -b staging
git push -u origin staging

# Retourner sur main
git checkout main
```

## 🏗️ Workflow Git Recommandé

```
develop (développement) → staging (tests) → main (production)
```

### Commandes Quotidiennes
```bash
# Travailler sur develop
git checkout develop
git pull origin develop

# Créer une feature branch
git checkout -b feature/nouvelle-fonctionnalite
# ... développer ...
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# Merger via Pull Request sur GitHub
# develop → staging → main
```

## 🌐 Déploiement Production

### Option 1: Vercel (Recommandé)

**Avantages**: CDN global, déploiement automatique, preview branches

1. **Installer Vercel CLI**
```bash
npm i -g vercel
vercel login
```

2. **Connecter le Projet**
```bash
vercel
# Suivre les instructions
# Framework: Astro
# Build Command: npm run build  
# Output Directory: dist
```

3. **Configuration des Domaines**
```bash
# Ajouter votre domaine personnalisé
vercel domains add glp1-france.com
vercel alias set your-project-name.vercel.app glp1-france.com
```

4. **Variables d'Environnement**
Dans le dashboard Vercel:
```
SITE_URL=https://glp1-france.com
NODE_ENV=production
ADMIN_PASSWORD=votre_mot_de_passe_très_sécurisé_123!
```

### Option 2: Netlify

1. **Connecter GitHub** sur netlify.com
2. **Importer le projet** depuis GitHub
3. **Configuration Build**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

4. **Variables d'Environnement** dans Netlify:
```
SITE_URL=https://glp1-france.com
NODE_ENV=production
ADMIN_PASSWORD=votre_mot_de_passe_très_sécurisé_123!
```

## 🔄 Déploiement Automatique

### Configuration GitHub Actions (Optionnel)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build
    - run: npm run type-check
```

## 📱 Changement d'Ordinateur

### Cloner sur Nouvel Ordinateur
```bash
# Cloner le repo
git clone https://github.com/VOTRE-USERNAME/glp1-affiliate-site.git
cd glp1-affiliate-site

# Installer les dépendances  
npm install

# Créer l'environnement local
cp .env.example .env.local
# Éditer .env.local

# Tester
npm run dev
```

### Synchronisation
```bash
# Récupérer les dernières modifications
git pull origin develop

# Ou récupérer une branche spécifique
git checkout staging
git pull origin staging
```

## 🔐 Sécurité Production

### Variables d'Environnement Sensibles
```bash
# Production uniquement
ADMIN_PASSWORD=mot_de_passe_très_sécurisé_avec_caractères_spéciaux!
SITE_URL=https://votre-domaine-reel.com

# Optionnel
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://...
```

### Protection Admin
1. **Changer le mot de passe** par défaut
2. **Activer HTTPS** (automatique avec Vercel/Netlify)
3. **Limiter l'accès admin** par IP si possible

## 📊 Monitoring et Maintenance

### Outils Recommandés
- **Uptime**: UptimeRobot ou Ping-Bot
- **Analytics**: Google Analytics 4
- **Erreurs**: Sentry (optionnel)
- **Performance**: Lighthouse CI

### Maintenance Régulière
```bash
# Mise à jour des dépendances
npm audit
npm update

# Régénération de la base de données
npm run generate-database

# Tests de build
npm run build
```

## 🚨 Checklist Déploiement Final

- [ ] Domaine configuré et fonctionnel
- [ ] HTTPS activé
- [ ] Variables d'environnement définies
- [ ] Mot de passe admin changé
- [ ] Build de production testé
- [ ] Recherche fonctionnelle
- [ ] Admin accessible
- [ ] Images témoignages uploadées
- [ ] Google Analytics configuré (optionnel)
- [ ] Backup automatique configuré

## 📞 Support Technique

En cas de problème:
1. **Vérifier les logs** Vercel/Netlify
2. **Tester en local** avec `npm run build && npm run preview`
3. **Comparer** les variables d'environnement
4. **Consulter** la documentation Astro

---

**Prêt pour la production !** 🎉
