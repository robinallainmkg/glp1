# 🌐 GUIDE DÉPLOIEMENT MULTI-DEVICE - GLP-1 FRANCE

## 🎯 OBJECTIF
Synchroniser automatiquement : **Device Local** → **GitHub** → **Hostinger Live**

## 🔧 CONFIGURATION AUTO-DÉPLOIEMENT

### Hostinger Configuration
```
Repository: https://github.com/robinallainmkg/glp1.git
Branch: production
Install Path: public_html
Auto-Deploy: ON
```

### Branches Strategy
- **main** : Développement et modifications
- **production** : Déploiement automatique vers Hostinger

## 💻 SETUP WINDOWS

### 1. Installation Git & Node.js
```powershell
# Vérifier les installations
git --version
node --version
npm --version
```

### 2. Cloner le projet
```powershell
cd C:\Users\[username]\projet\
git clone https://github.com/robinallainmkg/glp1.git glp1-main
cd glp1-main
```

### 3. Installation dépendances
```powershell
npm install
```

### 4. Test local
```powershell
npm run dev
```
**URL:** http://localhost:4321

### 5. Configuration Git (première fois)
```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@gmail.com"
```

## 🍎 SETUP MAC

### 1. Installation via Homebrew
```bash
# Installer Homebrew si pas installé
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Git et Node.js
brew install git node
```

### 2. Cloner le projet
```bash
cd ~/Projects/
git clone https://github.com/robinallainmkg/glp1.git glp1-main
cd glp1-main
```

### 3. Installation dépendances
```bash
npm install
```

### 4. Test local
```bash
npm run dev
```
**URL:** http://localhost:4321

### 5. Configuration Git (première fois)
```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@gmail.com"
```

## 🚀 WORKFLOW DE DÉPLOIEMENT

### Développement quotidien
```bash
# 1. Récupérer les dernières modifications
git pull origin main

# 2. Démarrer le serveur local
npm run dev

# 3. Faire les modifications...

# 4. Tester localement
# Vérifier http://localhost:4321

# 5. Commiter les modifications
git add .
git commit -m "Description claire des modifications"

# 6. Pousser vers GitHub
git push origin main
```

### Déploiement en production
```bash
# Merger main vers production et déclencher auto-déploiement
git checkout production
git merge main
git push origin production

# Retourner sur main pour continuer le développement
git checkout main
```

### Déploiement d'urgence (manuel)
```bash
# Si l'auto-déploiement ne fonctionne pas
npm run build
bash deploy.sh  # Nécessite configuration SSH
```

## 🔄 SYNCHRONISATION ENTRE DEVICES

### Scenario: Travail depuis nouveau device
```bash
# 1. Récupérer les dernières modifications
git pull origin main

# 2. Vérifier que tout fonctionne
npm install  # Si nouvelles dépendances
npm run build  # Test du build
npm run dev    # Test local

# 3. Continuer le travail normalement
```

### Scenario: Conflit entre devices
```bash
# Si il y a des conflits
git status
git stash  # Sauvegarder modifications locales
git pull origin main  # Récupérer version distante
git stash pop  # Restaurer modifications locales
# Résoudre conflits manuellement
git add .
git commit -m "Résolution conflits"
git push origin main
```

## 🛠️ COMMANDES RAPIDES PAR DEVICE

### Windows (PowerShell)
```powershell
# Navigation rapide
cd C:\Users\robin\projet\glp1-main

# Workflow complet
git pull origin main; npm run dev

# Déploiement
git add .; git commit -m "Modifications Windows"; git push origin main

# Vers production
git checkout production; git merge main; git push origin production; git checkout main
```

### Mac (Terminal)
```bash
# Navigation rapide
cd ~/Projects/glp1-main

# Workflow complet
git pull origin main && npm run dev

# Déploiement
git add . && git commit -m "Modifications Mac" && git push origin main

# Vers production
git checkout production && git merge main && git push origin production && git checkout main
```

## 📋 CHECKLIST CHANGEMENT DE DEVICE

### Avant de quitter un device
- [ ] Toutes les modifications commitées
- [ ] `git push origin main` effectué
- [ ] Aucun fichier modifié non sauvé
- [ ] `git status` propre

### Sur le nouveau device
- [ ] `git pull origin main` effectué
- [ ] `npm install` si besoin
- [ ] `npm run dev` fonctionne
- [ ] http://localhost:4321 accessible
- [ ] Toutes les collections s'affichent correctement

## 🚨 RÉSOLUTION PROBLÈMES

### Auto-déploiement ne fonctionne pas
1. Vérifier configuration Hostinger
2. Vérifier que la branche `production` existe
3. Forcer le déploiement : push nouveau commit sur `production`
4. Fallback : utiliser `bash deploy.sh`

### CSS ne s'applique pas après déploiement
1. Vérifier `src/layouts/BaseLayout.astro` contient `import '../styles/global.css'`
2. Rebuild : `npm run build`
3. Redéployer vers production

### Collections sans couleur
1. Exécuter : `node scripts/fix-collections.mjs`
2. Commit et redéployer

### Node modules corrompus
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🔐 CONFIGURATION SSH (Déploiement manuel)

### Windows
```powershell
# Si deploy.sh ne fonctionne pas
# Installer Git Bash et utiliser :
& "C:\Program Files\Git\bin\bash.exe" deploy.sh
```

### Mac
```bash
# SSH devrait fonctionner directement
bash deploy.sh
```

## 📊 MONITORING

### URLs à vérifier après déploiement
- **Production:** https://glp1-france.fr
- **Collections:** https://glp1-france.fr/glp1-cout/
- **Articles:** https://glp1-france.fr/glp1-cout/wegovy-prix/

### Éléments à valider
- [ ] Footer complet avec 4 sections
- [ ] Collections avec bonnes couleurs
- [ ] Navigation fonctionnelle
- [ ] CSS appliqué sur toutes les pages
- [ ] Aucune erreur 404

---

**💡 ASTUCE:** Utilisez toujours l'auto-déploiement via GitHub. Le déploiement manuel (SCP) ne devrait être utilisé qu'en cas d'urgence.
