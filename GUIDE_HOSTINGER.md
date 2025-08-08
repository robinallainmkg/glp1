# 🌐 Guide Déploiement Hostinger - GLP-1 France

## 🎯 Objectif
Déployer votre site GLP-1 France sur Hostinger avec votre nom de domaine.

## 📋 Prérequis
- [ ] Compte Hostinger actif
- [ ] Nom de domaine configuré (glp1-france.fr)
- [ ] Accès au panneau de contrôle Hostinger
- [ ] Code source sur GitHub ✅

## 🚀 Méthodes de Déploiement

### Option 1: Déploiement Manuel (Le plus simple)

#### Étape 1: Build du projet
```bash
# Dans votre dossier projet
npm run build

# Vérifier que le dossier dist/ est créé
ls -la dist/
```

#### Étape 2: Upload via File Manager Hostinger
1. **Connexion Hostinger**
   - Aller sur hpanel.hostinger.com
   - Se connecter à votre compte
   - Sélectionner votre domaine `glp1-france.fr`

2. **Accéder au File Manager**
   - Dans le panneau de contrôle → "File Manager"
   - Naviguer vers le dossier `public_html/`

3. **Upload des fichiers**
   - Supprimer le contenu existant de `public_html/`
   - Compresser le contenu du dossier `dist/` en ZIP
   - Upload le fichier ZIP dans `public_html/`
   - Extraire le ZIP directement dans `public_html/`

#### Étape 3: Configuration
- Vérifier que `index.html` est à la racine de `public_html/`
- Tester l'accès à votre site : `https://glp1-france.fr`

### Option 2: Déploiement via Git (Recommandé)

#### Configuration Git Deploy sur Hostinger

1. **Activer Git dans Hostinger**
   - Panneau de contrôle → "Git"
   - "Create Repository"
   - Nom: `glp1-site`
   - Branche: `main`

2. **Connecter votre repository GitHub**
   ```bash
   # URL du repository: https://github.com/robinallainmkg/glp1.git
   # Branche: main
   # Dossier de destination: public_html/
   ```

3. **Script de déploiement automatique**
   Créer un fichier `deploy.sh` dans votre repository :

```bash
#!/bin/bash
# Script de déploiement automatique pour Hostinger

# Build du projet
npm ci
npm run generate-database
npm run build

# Copier les fichiers vers public_html
cp -r dist/* public_html/

echo "✅ Déploiement terminé!"
```

### Option 3: Via GitHub Actions (Automatique)

Créer `.github/workflows/deploy-hostinger.yml` :

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate database
      run: npm run generate-database
    
    - name: Build project
      run: npm run build
    
    - name: Deploy via FTP
      uses: SamKirkland/FTP-Deploy-Action@4.3.3
      with:
        server: ${{ secrets.HOSTINGER_FTP_HOST }}
        username: ${{ secrets.HOSTINGER_FTP_USER }}
        password: ${{ secrets.HOSTINGER_FTP_PASSWORD }}
        local-dir: ./dist/
        server-dir: ./public_html/
```

## 🔧 Configuration Hostinger Spécifique

### 1. Configuration PHP (si nécessaire)
```php
# .htaccess à placer dans public_html/
RewriteEngine On

# Redirection HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Gestion des routes SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Cache des assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

### 2. Variables d'environnement
Créer un fichier `config.php` dans `public_html/` :

```php
<?php
// Configuration pour l'admin
define('SITE_URL', 'https://glp1-france.fr');
define('ADMIN_PASSWORD', 'votre_mot_de_passe_securise');
define('NODE_ENV', 'production');
?>
```

### 3. Protection du dossier admin
Créer `.htaccess` dans `public_html/admin/` :

```apache
# Protection admin
AuthType Basic
AuthName "Administration GLP-1 France"
AuthUserFile /path/to/.htpasswd
Require valid-user

# Ou restriction par IP
<RequireAll>
    Require ip 192.168.1.0/24
    Require ip votre.ip.publique
</RequireAll>
```

## 📂 Structure de Déploiement

```
public_html/
├── index.html              # Page d'accueil
├── admin/                  # Dashboard admin
├── glp1-cout/             # Pages collections
├── medicaments-glp1/      # Pages collections
├── _astro/                # Assets Astro
├── images/                # Images du site
├── .htaccess              # Configuration serveur
└── config.php             # Configuration (optionnel)
```

## 🔄 Workflow de Mise à Jour

### Méthode Manuelle
```bash
# 1. Modifications locales
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# 2. Build et upload
npm run build
# Upload le contenu de dist/ vers public_html/
```

### Méthode Automatique (Git Deploy)
```bash
# Simple push vers main déclenche le déploiement
git push origin main
```

## 🔐 Sécurité Production

### 1. Configuration SSL
- Hostinger active automatiquement SSL/HTTPS
- Vérifier le certificat : `https://glp1-france.fr`

### 2. Protection Admin
```bash
# Générer un mot de passe sécurisé
openssl rand -base64 32

# Utiliser ce mot de passe dans votre configuration
```

### 3. Backup Automatique
- Activer les backups Hostinger
- Fréquence : quotidienne
- Conservation : 30 jours

## 📊 Monitoring et Performance

### 1. Google Analytics
Ajouter dans `src/layouts/BaseLayout.astro` :

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Monitoring Uptime
- UptimeRobot : surveillance gratuite
- Pingdom : monitoring avancé
- Google Search Console : SEO

## 🚨 Checklist Post-Déploiement

- [ ] Site accessible : `https://glp1-france.fr`
- [ ] HTTPS fonctionnel (cadenas vert)
- [ ] Admin accessible : `https://glp1-france.fr/admin-login/`
- [ ] Recherche fonctionnelle
- [ ] Images témoignages uploadées
- [ ] Cartes d'articles cliquables
- [ ] Pages de collection fonctionnelles
- [ ] Responsive design sur mobile
- [ ] Vitesse de chargement < 3 secondes

## 🛠️ Dépannage

### Problèmes courants
1. **Erreur 500** : Vérifier les permissions des fichiers
2. **CSS cassé** : Vérifier les chemins dans `astro.config.mjs`
3. **Admin inaccessible** : Vérifier les variables d'environnement
4. **Images manquantes** : Uploader le dossier `images/`

### Support Hostinger
- Documentation : support.hostinger.com
- Chat en direct disponible 24/7
- Tickets de support prioritaires

---

**Votre site sera en ligne sur Hostinger en moins de 30 minutes !** 🚀
