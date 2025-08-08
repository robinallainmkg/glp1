# 🚀 Commandes Git pour Déploiement Immédiat

## Étapes pour pousser vers GitHub

```bash
# 1. Initialiser Git (si pas déjà fait)
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Premier commit
git commit -m "feat: Site GLP-1 France v1.0 avec système admin complet

- 74 articles dans 9 catégories
- 4 experts spécialisés avec attribution automatique  
- 3 témoignages avec conseils beauté
- Recherche avancée avec suggestions
- Dashboard admin fonctionnel
- Design responsive et cartes interactives
- Build optimisé et production-ready"

# 4. Ajouter le remote GitHub
git remote add origin https://github.com/robinallainmkg/glp1.git

# 5. Créer la branche main et pousser
git branch -M main
git push -u origin main

# 6. Créer les branches de travail
git checkout -b develop
git push -u origin develop

git checkout -b staging  
git push -u origin staging

git checkout main
```

## Configuration Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer le projet
vercel

# Configuration automatique détectée :
# Framework: Astro
# Build Command: npm run build
# Output Directory: dist
# Development Command: npm run dev
```

### Variables d'Environnement Vercel
À ajouter dans le dashboard Vercel :

```
SITE_URL=https://glp1-france.fr
NODE_ENV=production
ADMIN_PASSWORD=votre_mot_de_passe_sécurisé_123!
```

### Configuration Domaine Personnalisé
```bash
# Ajouter votre domaine
vercel domains add glp1-france.fr

# Créer l'alias
vercel alias set votre-projet.vercel.app glp1-france.fr
```

## Alternative Netlify

1. Aller sur netlify.com
2. "Import from Git" → Sélectionner GitHub
3. Choisir le repo `robinallainmkg/glp1`
4. Configuration automatique via `netlify.toml`
5. Ajouter les variables d'environnement dans les settings

## Après le Déploiement

### ✅ Vérifications
- [ ] Site accessible sur votre domaine
- [ ] HTTPS activé automatiquement
- [ ] Admin accessible via `/admin-login/`
- [ ] Recherche fonctionnelle
- [ ] Cartes d'articles cliquables
- [ ] Design responsive sur mobile

### 🔄 Workflow Continu
```bash
# Développement quotidien
git checkout develop
git pull origin develop

# Nouvelles fonctionnalités
git checkout -b feature/nom-de-la-feature
# ... développer ...
git add .
git commit -m "feat: description de la fonctionnalité"
git push origin feature/nom-de-la-feature

# Merger via Pull Request sur GitHub
# develop → staging → main (déploiement automatique)
```

---

**Votre site sera en ligne en moins de 5 minutes !** 🚀
