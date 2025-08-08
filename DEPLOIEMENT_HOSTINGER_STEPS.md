# 🚀 DÉPLOIEMENT HOSTINGER - GUIDE ÉTAPE PAR ÉTAPE

## ✅ **ÉTAPES PRÉPARATOIRES COMPLÉTÉES**
- [x] Site buildé avec succès (23 pages générées)
- [x] Repository GitHub configuré
- [x] Fichiers optimisés pour production

## 🎯 **ÉTAPES À SUIVRE MAINTENANT**

### **1. CONNEXION DOMAINE À HOSTINGER**

#### Si votre domaine est EXTERNE (pas acheté chez Hostinger) :

1. **Ajouter le domaine dans Hostinger** :
   - Aller sur https://hpanel.hostinger.com
   - Se connecter à votre compte
   - Menu "Domaines" → "Ajouter un domaine existant"
   - Entrer : `glp1-france.fr`
   - Confirmer l'ajout

2. **Noter les serveurs DNS Hostinger** :
   Hostinger vous donnera les serveurs DNS (exemple) :
   ```
   ns1.dns-parking.com
   ns2.dns-parking.com
   ```

3. **Configurer chez votre registrar** :
   - Aller chez votre registrar de domaine (OVH, Gandi, Namecheap, etc.)
   - Section "Gestion DNS" ou "Serveurs de noms"
   - Remplacer par les serveurs DNS Hostinger
   - ⏰ **Attendre 24-48h pour la propagation**

#### Si votre domaine est CHEZ HOSTINGER :
- Il devrait déjà être configuré automatiquement
- Passer directement à l'étape 2

### **2. DÉPLOIEMENT DU SITE**

#### **Option A : Déploiement Manuel (Recommandé pour débuter)**

1. **Préparer l'archive** :
   ```bash
   cd /Users/mac/Documents/glp1_affiliate_site_scaffold
   
   # Créer une archive du dossier dist
   zip -r glp1-site.zip dist/*
   ```

2. **Upload via File Manager Hostinger** :
   - Dans hpanel.hostinger.com
   - Sélectionner votre domaine `glp1-france.fr`
   - Cliquer sur "File Manager"
   - Naviguer vers `public_html/`
   - **VIDER** le contenu existant de `public_html/`
   - Upload `glp1-site.zip`
   - Clic droit → "Extract" dans `public_html/`
   - Déplacer le contenu de `dist/` vers la racine de `public_html/`
   - Vérifier que `index.html` est bien à la racine

3. **Ajouter le fichier .htaccess** :
   - Dans `public_html/`, créer un fichier `.htaccess`
   - Copier le contenu préparé (voir ci-dessous)

#### **Option B : Déploiement via Git (Avancé)**

1. **Activer Git dans Hostinger** :
   - Panneau de contrôle → "Git"
   - "Create Repository"
   - Repository URL : `https://github.com/robinallainmkg/glp1.git`
   - Branche : `main`
   - Destination : `public_html/`

2. **Configuration auto-déploiement** :
   - Webhook GitHub → Hostinger
   - Push automatique sur `main`

### **3. CONFIGURATION OPTIMISATION**

#### **Fichier .htaccess pour public_html/** :
```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove www (optionnel)
RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

# Gestion des routes SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Protection admin (à ajuster selon vos besoins)
<FilesMatch "admin">
    Order allow,deny
    Allow from all
    # Uncomment and add your IP to restrict access:
    # Allow from 123.456.789.0
</FilesMatch>

# Cache optimisation
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Compression GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### **4. VÉRIFICATIONS POST-DÉPLOIEMENT**

#### **Tests essentiels** :
1. **Accès au site** : `https://glp1-france.fr`
2. **Pages principales** :
   - Home : `https://glp1-france.fr`
   - Collections : `https://glp1-france.fr/glp1-cout`
   - Articles : `https://glp1-france.fr/glp1-cout/wegovy-prix`
   - Experts : `https://glp1-france.fr/experts`
   - Admin : `https://glp1-france.fr/admin-login`

3. **Fonctionnalités** :
   - [ ] Navigation fonctionnelle
   - [ ] Recherche opérationnelle
   - [ ] Images chargées correctement
   - [ ] CSS et JS appliqués
   - [ ] HTTPS actif
   - [ ] Admin accessible (avec protection)

#### **Monitoring** :
- Configurer Google Analytics
- Mettre en place UptimeRobot
- Vérifier les logs Hostinger

### **5. MAINTENANCE**

#### **Mises à jour** :
```bash
# Workflow pour les mises à jour
git add .
git commit -m "Update: description des changements"
git push origin main

# Rebuild et redéploiement
npm run build
# Puis upload manuel ou auto via Git
```

#### **Sauvegardes** :
- Sauvegardes automatiques Hostinger
- Export périodique de `public_html/`
- Sauvegarde de la base de données (si ajoutée plus tard)

## 🆘 **DÉPANNAGE**

### **Domaine ne fonctionne pas** :
- Vérifier propagation DNS : https://dnschecker.org
- Attendre 24-48h maximum
- Vérifier configuration registrar

### **Site ne s'affiche pas** :
- Vérifier que `index.html` est à la racine de `public_html/`
- Contrôler les permissions des fichiers (755 pour dossiers, 644 pour fichiers)
- Consulter les logs d'erreur Hostinger

### **HTTPS ne fonctionne pas** :
- Activer SSL/TLS dans le panneau Hostinger
- Attendre la génération du certificat (jusqu'à 24h)
- Forcer HTTPS via .htaccess

### **Admin non accessible** :
- Vérifier que les fichiers admin sont uploadés
- Contrôler les restrictions IP dans .htaccess
- Tester en navigation privée

## 📞 **CONTACTS**

- Support Hostinger : Chat en ligne 24/7
- Documentation : https://support.hostinger.com
- Status serveurs : https://status.hostinger.com

---

**📋 CHECKLIST FINALE** :
- [ ] Domaine connecté à Hostinger
- [ ] DNS propagés (24-48h)
- [ ] Site uploadé dans public_html/
- [ ] .htaccess configuré
- [ ] HTTPS actif
- [ ] Toutes les pages accessibles
- [ ] Admin protégé
- [ ] Monitoring en place
