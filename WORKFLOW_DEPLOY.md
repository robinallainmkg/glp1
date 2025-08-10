# 🚀 WORKFLOW DE DÉPLOIEMENT AUTOMATIQUE

## 🎯 PRINCIPE
Upload automatique vers **GitHub + Hostinger** en une seule commande !

## 💻 COMMANDE PRINCIPALE DE DÉPLOIEMENT

### ⚠️ IMPORTANT : Utilisez TOUJOURS deploy-auto.ps1

```powershell
.\deploy-auto.ps1        # SEULE commande de déploiement autorisée
```

**❌ NE PLUS UTILISER :**
- ~~`deploy.ps1`~~ (supprimé)
- ~~`npm run deploy`~~

## 🔧 FONCTIONNEMENT DE deploy-auto.ps1

Le script `deploy-auto.ps1` exécute automatiquement :

1. **Upload GitHub** : Commit + Push vers production
2. **Build Astro** : Génération des 93 pages statiques
3. **Upload Hostinger** : Synchronisation via WinSCP
4. **Vérification** : Confirmation du déploiement

## 💻 COMMANDES ALTERNATIVES (si nécessaire)

### Options par plateforme
```powershell
npm run deploy:windows   # PowerShell avec SCP
npm run deploy:mac       # Bash avec rsync
```

## � SETUP INITIAL

### Windows - Installation WinSCP
```powershell
.\install-winscp.ps1     # Installation automatique
# OU manuellement: https://winscp.net/download
```

### Mac - Installation rsync/sshpass
```bash
brew install rsync sshpass
```

## 🚀 WORKFLOW QUOTIDIEN

### Déploiement standard (recommandé)
```powershell
# Faire vos modifications...
.\deploy-auto.ps1
```

**Résultat automatique :**
- ✅ Commit des modifications avec timestamp
- ✅ Push vers GitHub (production)
- ✅ Build du site (93 pages générées)
- ✅ Upload vers Hostinger via WinSCP
- ✅ Site live mis à jour : https://glp1-france.fr

### En cas d'erreur de déploiement
```powershell
# Vérifier le build
npm run build

# Redéployer
.\deploy-auto.ps1
```
# 1. Développement
git checkout main
git add .
git commit -m "Mes modifications"
git push origin main

# 2. Production
git checkout production
git merge main
npm run deploy:complete
```

## � CONFIGURATION AUTOMATIQUE

### GitHub
- **Repository:** robinallainmkg/glp1
- **Branches:** main (dev) → production (live)
- **Push:** Automatique avec --no-verify

### Hostinger SSH
- **Host:** 147.79.98.140:65002
- **User:** u403023291
- **Path:** /public_html
- **Upload:** Automatique via WinSCP/rsync

## ✅ VÉRIFICATION DÉPLOIEMENT

Après `npm run deploy:complete` :
1. **GitHub:** Vérifier commits sur production
2. **Hostinger:** https://glp1-france.fr (mise à jour automatique)
3. **Build:** 88 pages générées

## 🚨 DÉPANNAGE

### WinSCP non trouvé (Windows)
```powershell
.\install-winscp.ps1
```

### Erreur SSH/rsync (Mac)
```bash
brew install sshpass
```

### Erreur Git push
```powershell
git pull origin production  # Sync remote
npm run deploy:complete     # Retry
```

### Upload manuel de secours
Si l'upload automatique échoue, le script ouvre automatiquement :
- Dossier `dist/` 
- Instructions de connexion SSH

---

**🎉 RÉSULTAT :** Une seule commande = Site live mis à jour sur GitHub ET Hostinger !
