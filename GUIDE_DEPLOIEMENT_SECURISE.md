# 🚀 Guide de Déploiement GLP-1 France

## ⚠️ IMPORTANT - Configuration Hostinger

### Structure des Dossiers Hostinger
```
/home/u403023291/
├── domains/
│   └── glp1-france.fr/
│       └── public_html/  ← FICHIERS DU SITE ICI
└── autres dossiers...
```

**❌ ERREUR FRÉQUENTE** : Uploader dans `domains/glp1-france.fr/`
**✅ CORRECT** : Uploader dans `domains/glp1-france.fr/public_html/`

### Chemin de Déploiement Correct
- **Serveur** : `u403023291@147.79.98.140:65002`
- **Dossier cible** : `/home/u403023291/domains/glp1-france.fr/public_html/`
- **Protocole** : SFTP avec clé SSH

## 🔧 Scripts de Déploiement

### Script Principal : `deploy-auto.ps1`
```powershell
# Configuration correcte WinSCP
cd domains/glp1-france.fr/public_html  # ← IMPORTANT !
lcd dist
synchronize remote -delete
```

### Utilisation
```bash
# Déploiement standard
.\deploy-auto.ps1

# Avec message personnalisé
.\deploy-auto.ps1 "Mon message de commit"
```

## 📋 Checklist Avant Déploiement

### 1. Vérification Locale
- [ ] `npm run build` réussi
- [ ] Dossier `dist/` généré (90 pages)
- [ ] Fichier `dist/index.html` présent (21 KB)

### 2. Test de Connexion
```powershell
# Test connexion Hostinger
$winscpPath/WinSCP.com /command "open sftp://u403023291@147.79.98.140:65002" "ls" "exit"
```

### 3. Vérification Post-Déploiement
- [ ] Site accessible : https://glp1-france.fr
- [ ] Pages fonctionnelles :
  - [ ] Homepage
  - [ ] `/nouveaux-medicaments-perdre-poids/`
  - [ ] `/qu-est-ce-que-glp1/`
  - [ ] `/experts/`

## 🛠️ Résolution de Problèmes

### Site Inaccessible
1. **Vérifier le chemin de déploiement**
   ```
   Logs WinSCP : /home/u403023291/domains/glp1-france.fr/public_html
   ```

2. **Vérifier les fichiers uploadés**
   - `index.html` à la racine de `public_html/`
   - Dossiers : `_astro/`, `experts/`, etc.

3. **Permissions**
   - Fichiers : 644
   - Dossiers : 755

### Erreurs de Build
```powershell
# Nettoyer et rebuilder
Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item ".astro" -Recurse -Force -ErrorAction SilentlyContinue
npm run build
```

### Erreurs WinSCP
- Vérifier que WinSCP est installé
- Chemin par défaut : `C:\Users\robin\AppData\Local\Programs\WinSCP\WinSCP.com`

## 📊 Architecture du Site

### Pages Principales
- **Homepage** : Optimisée "Ozempic & Wegovy France"
- **Landing** : `/nouveaux-medicaments-perdre-poids/` (Grand public)
- **Bridge** : `/qu-est-ce-que-glp1/` (Éducatif)
- **Experts** : `/experts/` (Professionnel)

### Stratégie SEO
```
Recherche "maigrir" → Landing → Bridge → Articles Experts
```

### Métriques de Contrôle
- **90 pages** générées
- **Sitemap** : `/sitemap.xml`
- **Assets** : Dossier `_astro/`

## 🔄 Workflow de Déploiement

### 1. Développement
```powershell
# Modifications locales
npm run dev  # Test local
```

### 2. Build & Test
```powershell
npm run build
# Vérifier dist/index.html
```

### 3. Déploiement
```powershell
.\deploy-auto.ps1 "Description des changements"
```

### 4. Validation
- Tester https://glp1-france.fr
- Vérifier Google Search Console
- Contrôler Analytics

## 📝 Logs et Debugging

### Fichiers de Log
- `upload.log` : Logs WinSCP détaillés
- `upload.txt` : Script WinSCP généré

### Debug WinSCP
```powershell
# Mode verbose
& $winscpPath/WinSCP.com /log=debug.log /loglevel=2 /script=upload.txt
```

## 🎯 Bonnes Pratiques

### Commits GitHub
- Messages descriptifs
- Branch `production` toujours fonctionnelle
- Force push autorisé (pas de collaborateurs)

### Sécurité
- Credentials dans script (environnement privé)
- Clé SSH fixe pour validation
- Pas de .htaccess (éviter erreurs serveur)

### Performance
- Build propre à chaque déploiement
- Synchronisation avec suppression (`-delete`)
- Compression assets automatique

---

**🔗 Liens Utiles**
- Site Live : https://glp1-france.fr
- Repo GitHub : https://github.com/robinallainmkg/glp1
- Hostinger Panel : https://hpanel.hostinger.com

**📞 Support**
- En cas de problème : Vérifier ce guide en premier
- Logs WinSCP : `upload.log`
- Test de connectivité : `ping 147.79.98.140`
