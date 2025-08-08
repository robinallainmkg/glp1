# 🚀 GUIDE RAPIDE DÉPLOIEMENT HOSTINGER

## 📦 FICHIERS PRÊTS POUR LE DÉPLOIEMENT

✅ **Fichiers créés et prêts :**
- `glp1-site-production.zip` - Archive du site buildé
- `.htaccess-hostinger` - Configuration serveur optimisée
- `scripts/verify-deployment.sh` - Script de vérification post-déploiement
- `DEPLOIEMENT_HOSTINGER_STEPS.md` - Guide détaillé

## ⚡ DÉPLOIEMENT RAPIDE (15 minutes)

### **ÉTAPE 1 : Connexion Domaine (5 min)**

1. **Aller sur https://hpanel.hostinger.com**
2. **Se connecter** à votre compte Hostinger
3. **Ajouter le domaine** :
   - Menu "Domaines" → "Ajouter un domaine existant"
   - Entrer : `glp1-france.fr`
   - Confirmer

4. **Noter les serveurs DNS** (vos serveurs DNS Hostinger) :
   ```
   ns1.dns-parking.com
   ns2.dns-parking.com
   ```
5. **Configurer chez votre registrar** :
   - Remplacer les serveurs DNS actuels par :
     - `ns1.dns-parking.com`
     - `ns2.dns-parking.com`
   - ⏰ **Attendre 24-48h** pour la propagation

### **ÉTAPE 2 : Upload du Site (5 min)**

1. **File Manager Hostinger** :
   - Dans hpanel → Sélectionner `glp1-france.fr`
   - Cliquer "File Manager"
   - Aller dans `public_html/`

2. **Vider et uploader** :
   - **SUPPRIMER** tout le contenu de `public_html/`
   - Upload `glp1-site-production.zip`
   - Clic droit → "Extract" dans `public_html/`
   - **DÉPLACER** le contenu du dossier `dist/` vers la racine de `public_html/`

3. **Vérifier structure** :
   ```
   public_html/
   ├── index.html          ← OBLIGATOIRE à la racine
   ├── logo.svg
   ├── _astro/
   ├── admin/
   ├── glp1-cout/
   └── ... (autres dossiers)
   ```

### **ÉTAPE 3 : Configuration .htaccess (2 min)**

1. **Créer .htaccess** dans `public_html/` :
   - Nouveau fichier → `.htaccess`
   - Copier le contenu de `.htaccess-hostinger`
   - Sauvegarder

### **ÉTAPE 4 : Activation HTTPS (3 min)**

1. **Dans hpanel Hostinger** :
   - Section "SSL/TLS"
   - Activer "Force HTTPS"
   - Activer le certificat SSL gratuit

## ✅ VÉRIFICATION IMMÉDIATE

### **Test rapide** :
1. **Accéder au site** : `https://glp1-france.fr`
2. **Vérifier HTTPS** : Le cadenas doit être vert
3. **Tester navigation** : Menu, recherche, pages
4. **Vérifier admin** : `https://glp1-france.fr/admin-login`

### **Script de vérification automatique** :
```bash
# Depuis votre ordinateur, après 24-48h de propagation DNS
./scripts/verify-deployment.sh
```

## 🔧 CONFIGURATION OPTIONNELLE

### **Protection Admin avancée** :
Dans `.htaccess`, décommenter et ajuster :
```apache
<FilesMatch "admin.*">
    Deny from all
    Allow from VOTRE.IP.ADDRESS  # Remplacez par votre IP
</FilesMatch>
```

### **Google Analytics** :
Ajouter le code de tracking dans `src/layouts/BaseLayout.astro` avant rebuild.

## 🆘 DÉPANNAGE RAPIDE

| **Problème** | **Solution** |
|--------------|-------------|
| Site ne s'affiche pas | Vérifier que `index.html` est à la racine de `public_html/` |
| Pas HTTPS | Activer SSL dans hpanel + attendre 24h |
| DNS ne fonctionne pas | Vérifier config registrar + attendre 48h max |
| 404 sur les pages | Vérifier upload complet + .htaccess présent |
| Admin inaccessible | Vérifier restrictions IP dans .htaccess |

## 📊 MONITORING POST-DÉPLOIEMENT

### **Outils recommandés** :
- **UptimeRobot** : Surveillance disponibilité gratuite
- **Google Search Console** : Indexation SEO
- **Google Analytics** : Statistiques visiteurs
- **Hostinger Analytics** : Logs et statistiques serveur

### **Checklist hebdomadaire** :
- [ ] Site accessible et rapide
- [ ] Certificat SSL valide
- [ ] Sauvegardes à jour
- [ ] Logs d'erreur vides
- [ ] Performance optimale

## 📱 MISES À JOUR FUTURES

### **Workflow simple** :
```bash
# 1. Modifier le code localement
# 2. Tester avec npm run dev
# 3. Build et deploy
npm run build
# 4. Créer nouvelle archive
zip -r glp1-site-update.zip dist/*
# 5. Upload via File Manager Hostinger
```

### **Workflow Git (avancé)** :
Configurer Git Deploy dans Hostinger pour déploiements automatiques.

---

## 🎯 OBJECTIF : SITE EN LIGNE EN 15 MINUTES

**✅ Avec ce guide, votre site sera en ligne rapidement !**

**📞 Support disponible 24/7 :**
- Chat Hostinger : hpanel.hostinger.com
- Documentation : support.hostinger.com
