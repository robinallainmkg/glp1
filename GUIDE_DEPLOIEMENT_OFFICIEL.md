# 🚀 GUIDE DE DÉPLOIEMENT - GLP-1 FRANCE

## ⚠️ RÈGLE IMPORTANTE

**TOUJOURS utiliser `deploy-auto.ps1` pour le déploiement !**

```powershell
.\deploy-auto.ps1
```

❌ **NE PLUS UTILISER :**
- ~~`deploy.ps1`~~ (supprimé)
- ~~`npm run deploy`~~

## 🔄 PROCESSUS DE DÉPLOIEMENT

Le script `deploy-auto.ps1` exécute automatiquement :

1. **📤 Upload GitHub**
   - Commit automatique avec timestamp
   - Push vers branche `production`

2. **🏗️ Build Astro**
   - Génération de 93 pages statiques
   - Optimisation automatique

3. **🌐 Upload Hostinger**
   - Synchronisation via WinSCP
   - Upload vers https://glp1-france.fr

## 🎯 WORKFLOW QUOTIDIEN

### Étapes simples
```powershell
# 1. Faire vos modifications dans le code
# 2. Tester localement si nécessaire
npm run dev

# 3. Déployer en une seule commande
.\deploy-auto.ps1
```

### Résultat automatique
- ✅ Code synchronisé sur GitHub
- ✅ Site construit (93 pages)
- ✅ Site live mis à jour
- ✅ Vérification automatique

## 📊 AMÉLIORATIONS SEO RÉCENTES

### Scores SEO améliorés
- **Score moyen** : 50 → **72/100** (+22 points)
- **Pages excellentes** : 10 → **28** (+18 pages)
- **Pages critiques** : 19 → **0** (toutes corrigées)

### Nouvelles fonctionnalités
- ✅ Page Articles complète (`/articles/`)
- ✅ Navigation corrigée (Télécharger le Guide, Lire les Articles)
- ✅ Texte "perdre du poids" visible
- ✅ Titres et descriptions optimisés
- ✅ H1 ajoutés partout

## 🔧 CONFIGURATION TECHNIQUE

### GitHub
- **Repository :** `robinallainmkg/glp1`
- **Branche :** `production`
- **Commits :** Automatiques avec timestamp

### Hostinger
- **URL :** https://glp1-france.fr
- **Host :** 147.79.98.140:65002
- **User :** u403023291
- **Chemin :** `/public_html`

## ✅ VÉRIFICATIONS POST-DÉPLOIEMENT

Après `.\deploy-auto.ps1`, vérifier :

1. **Homepage** : https://glp1-france.fr
   - Texte "perdre du poids" visible (vert)
   - Boutons "Télécharger le Guide" et "Lire les Articles"

2. **Page Articles** : https://glp1-france.fr/articles/
   - 76 articles organisés par catégories
   - Codes couleur par collection

3. **Navigation**
   - Guide : https://glp1-france.fr/guide-beaute-perte-de-poids-glp1/
   - Articles : https://glp1-france.fr/articles/

## 🚨 DÉPANNAGE

### Erreur WinSCP
```powershell
# Installer WinSCP
winget install WinSCP.WinSCP
```

### Erreur Build
```powershell
# Nettoyer et rebuilder
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
```

### Erreur Git
```powershell
# Vérifier status
git status
git pull origin production
```

### Test avant déploiement
```powershell
# Tester le build
npm run build

# Vérifier analyse SEO
node scripts/seo-analysis/final-analysis.mjs
```

## 📋 CHECKLIST DÉPLOIEMENT

### Avant déploiement
- [ ] Modifications testées localement
- [ ] Build réussi (`npm run build`)
- [ ] Pas d'erreurs dans les logs

### Commande de déploiement
```powershell
.\deploy-auto.ps1
```

### Après déploiement
- [ ] Site accessible : https://glp1-france.fr
- [ ] Homepage affichée correctement
- [ ] Navigation fonctionnelle
- [ ] Nouvelles pages accessibles

## 📈 PROCHAINES AMÉLIORATIONS

### À surveiller
- Score SEO moyen (objectif : 80/100)
- Pages à optimiser (score < 50)
- Temps de chargement

### Optimisations possibles
- Images optimisées
- Meta descriptions étendues
- Contenu enrichi sur pages courtes
