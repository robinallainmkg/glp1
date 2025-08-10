# Configuration GitHub OAuth pour Decap CMS

## Étapes pour activer le CMS en production

### 1. Créer une GitHub OAuth App

1. Allez sur GitHub → Settings → Developer settings → OAuth Apps
2. Cliquez sur "New OAuth App"
3. Remplissez :
   - **Application name**: `GLP-1 France CMS`
   - **Homepage URL**: `https://robinallainmkg.github.io/glp1`
   - **Authorization callback URL**: `https://api.netlify.com/auth/done`

### 2. Configurer Decap CMS pour la production

Dans `public/admin/config.yml`, remplacez :

```yaml
backend:
  name: test-repo
```

Par :

```yaml
backend:
  name: github
  repo: robinallainmkg/glp1
  branch: main
```

### 3. Activer GitHub Pages

1. Dans le repository GitHub → Settings → Pages
2. Source: "GitHub Actions"
3. Le site sera disponible sur : `https://robinallainmkg.github.io/glp1`

### 4. Instructions pour les contributeurs

- **Accès CMS** : `https://robinallainmkg.github.io/glp1/admin`
- **Authentification** : Via votre compte GitHub
- **Permissions** : Vous devez avoir les droits d'écriture sur le repository

## Workflow editorial

1. Accéder au CMS → Authentification GitHub
2. Créer/éditer un article → Sauvegarde automatique en draft
3. Publier → Crée une Pull Request
4. Merger la PR → Déploiement automatique sur GitHub Pages

## Mode test local

Pour tester le CMS localement sans GitHub OAuth :

```yaml
backend:
  name: test-repo
```

Puis relancer le serveur dev : `npm run dev`
