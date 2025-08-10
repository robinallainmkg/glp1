# 📚 Index Documentation GLP-1 France

## 🚀 Scripts de Déploiement

### Scripts Principaux
- **`deploy-securise.ps1`** ⭐ - Nouveau script sécurisé avec vérifications
- **`deploy-auto.ps1`** - Script original (garder comme backup)
- **`verify-health.ps1`** 🔍 - Vérification santé du site

### Utilisation Recommandée
```powershell
# 1. Vérifier la santé avant déploiement
.\verify-health.ps1 -Full

# 2. Déployer avec le script sécurisé
.\deploy-securise.ps1 "Votre message de commit"
```

## 📖 Guides Complets

### Guides de Déploiement
- **`GUIDE_DEPLOIEMENT_SECURISE.md`** ⭐ - Guide complet pour éviter les erreurs
- **`GUIDE_DEPLOYMENT_COMPLET.md`** - Guide technique détaillé
- **`GUIDE_DEPLOYMENT.md`** - Guide de base
- **`MEMO_DEPLOIEMENT.md`** - Aide-mémoire rapide

### Guides de Développement
- **`GUIDE_DEVELOPPEMENT_LOCAL.md`** - Setup environnement local
- **`GUIDE_GESTION_ARTICLES.md`** - Gestion du contenu
- **`RESTAURATION_DESIGN.md`** - Procédures de restauration

## 🎯 Documentation Stratégique

### SEO et Contenu
- **`RESUME_MODIFICATIONS.md`** - Historique des optimisations SEO
- **`LECONS_APPRISES.md`** - Retours d'expérience

### Checklists
- **`CHECKLIST_FINALE.md`** - Validation avant mise en ligne
- **`COMMANDES_GIT.md`** - Commandes Git essentielles

## 🛠️ Fichiers Techniques

### Configuration
- **`README_AI.md`** - Documentation pour l'IA
- **`README.md`** - Documentation générale

### Scripts Utilitaires
- **`deploy-git.ps1`** - Déploiement Git simple
- **`deploy-with-images.ps1`** - Déploiement avec images
- **`deploy.ps1`** - Script de base

## 🚨 Prévention des Erreurs

### Problèmes Courants Évités
1. **Mauvais chemin de déploiement**
   - ❌ `domains/glp1-france.fr/`
   - ✅ `domains/glp1-france.fr/public_html/`

2. **Build corrompu**
   - Vérifications automatiques dans `deploy-securise.ps1`
   - Test de santé avec `verify-health.ps1`

3. **Connectivité serveur**
   - Test de connexion préalable
   - Validation post-upload

### Workflow Sécurisé
```
verify-health.ps1 → deploy-securise.ps1 → Vérification site live
```

## 🔧 Maintenance

### Scripts de Maintenance
- **`verify-health.ps1 -Quick`** - Vérification rapide quotidienne
- **`verify-health.ps1 -Full`** - Vérification complète hebdomadaire

### Monitoring
- Vérification automatique des chemins de déploiement
- Validation de la taille des fichiers
- Test de connectivité serveur

---

## 🎯 Guide de Démarrage Rapide

### Pour un Nouveau Utilisateur
1. Lire `GUIDE_DEPLOIEMENT_SECURISE.md`
2. Exécuter `.\verify-health.ps1 -Full`
3. Si OK, utiliser `.\deploy-securise.ps1`

### Pour le Développement
1. Suivre `GUIDE_DEVELOPPEMENT_LOCAL.md`
2. Consulter `GUIDE_GESTION_ARTICLES.md`
3. Valider avec `CHECKLIST_FINALE.md`

### En Cas de Problème
1. Consulter `GUIDE_DEPLOIEMENT_SECURISE.md`
2. Vérifier les logs dans `upload.log`
3. Utiliser `verify-health.ps1` pour diagnostiquer

---

**💡 Conseil** : Toujours commencer par `verify-health.ps1` avant tout déploiement !