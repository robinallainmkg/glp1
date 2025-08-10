# 🚀 WORKFLOW DE DÉPLOIEMENT AUTOMATIQUE

## 🎯 PRINCIPE
Upload automatique vers **GitHub + Hostinger** en une seule commande !

## 💻 COMMANDES AUTOMATIQUES

### Déploiement COMPLET (recommandé)
```powershell
npm run deploy:complete  # GitHub + Hostinger automatique
npm run deploy:full      # Version PowerShell avec WinSCP
```

### Options par plateforme
```powershell
npm run deploy:auto      # Build + instructions manuelles
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

### Option 1: Déploiement depuis n'importe quelle branche
```powershell
# Faire vos modifications...
npm run deploy:complete "Description des modifications"
```

**Résultat automatique :**
- ✅ Commit des modifications
- ✅ Push vers GitHub (main → production)
- ✅ Build du site (88 pages)
- ✅ Upload vers Hostinger
- ✅ Site live mis à jour

### Option 2: Contrôle manuel des branches
```powershell
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
