# 🚀 WORKFLOW DE DÉPLOIEMENT SIMPLE

## 🎯 PRINCIPE
1. **Développement** sur branche `main`
2. **Production** sur branche `production` 
3. **Déploiement** manuel vers Hostinger

## 💻 COMMANDES RAPIDES

### Workflow quotidien
```bash
# Développement
git checkout main
git pull origin main
npm run dev  # http://localhost:4321

# Après modifications
git add .
git commit -m "Description des modifications"
git push origin main
```

### Déploiement vers LIVE
```bash
# 1. Basculer vers production
git checkout production
git merge main
git push origin production

# 2. Déployer vers Hostinger
npm run deploy        # Multi-plateforme
npm run deploy:windows # Windows uniquement  
npm run deploy:mac     # Mac uniquement
```

## 📋 ÉTAPES DE DÉPLOIEMENT

Le script fait automatiquement :
1. ✅ Vérification branche `production`
2. 🧹 Nettoyage ancien build
3. 🏗️ Build du site statique
4. ✅ Vérification du build
5. 📁 Ouverture dossier `dist/`

**Vous devez faire manuellement :**
1. Connexion panel Hostinger
2. File Manager → public_html/
3. Supprimer tout le contenu
4. Upload contenu du dossier `dist/`

## 🌐 RÉSULTAT
Site mis à jour sur : **https://glp1-france.fr**

## 🔧 CONFIGURATION AVANCÉE (Optionnel)

Pour le déploiement automatique via SSH :
1. Éditer `deploy.js` 
2. Remplir `HOSTINGER_CONFIG.username`
3. Configurer clé SSH avec Hostinger

## 🚨 DÉPANNAGE

### Erreur "pas sur branche production"
```bash
git checkout production
```

### Erreur de build
```bash
npm install
npm run clean
npm run build
```

### Erreur de permissions Windows
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**✨ SIMPLE ET EFFICACE** : Push vers GitHub + Script de déploiement = Site live mis à jour !
