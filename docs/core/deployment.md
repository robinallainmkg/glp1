# 🚀 Guide de Déploiement

> Déploiement automatisé du site GLP-1 France vers la production Hostinger

## ⚡ Déploiement Rapide

### Script Automatisé
```bash
# Déploiement complet avec validations
.\scripts\deployment\deploy-auto.ps1

# Déploiement rapide (skip validations TinaCMS)
.\scripts\deployment\deploy-auto.ps1 -SkipTinaCheck

# Déploiement avec message personnalisé
.\scripts\deployment\deploy-auto.ps1 -CommitMessage "Feat: Nouveaux articles GLP-1"
```

**🎯 Résultat** : Site déployé sur https://glp1-france.fr en ~5 minutes

## 🔍 Processus de Déploiement Détaillé

### Étape 1 : Validations TinaCMS
```powershell
# Vérifications automatiques
✓ Configuration TinaCMS (tina/config.ts)
✓ Collections définies (9 collections)
✓ Variables d'environnement TinaCMS
✓ Images thumbnails (119 fichiers attendus)
✓ Métadonnées articles cohérentes
✓ Test de build Astro
```

### Étape 2 : Build Production
```powershell
# Nettoyage et build optimisé
- Suppression dist/ et .astro/
- Nettoyage cache TinaCMS
- Build avec optimisations production
- Validation assets critiques générés
```

### Étape 3 : Upload Hostinger
```powershell
# Synchronisation SFTP via WinSCP
- Upload dossier dist/ vers public_html/
- Synchronisation avec suppression (-delete)
- Vérification upload réussi
```

### Étape 4 : Validation Post-déploiement
```powershell
# Vérifications finales
✓ Pages générées: ~200 pages HTML
✓ Images synchronisées
✓ Site accessible: https://glp1-france.fr
✓ Admin TinaCMS: https://glp1-france.fr/admin
```

## 🖥️ Configuration Serveur

### Hostinger Configuration
```
Serveur: 147.79.98.140:65002
Utilisateur: u403023291
Protocole: SFTP
Dossier cible: domains/glp1-france.fr/public_html/
```

### WinSCP Setup
```powershell
# Chemins de recherche automatique
C:\Users\robin\AppData\Local\Programs\WinSCP\WinSCP.com
C:\Program Files\WinSCP\WinSCP.com
C:\Program Files (x86)\WinSCP\WinSCP.com
```

### Authentification
- **Host Key** : ssh-ed25519 255 (validé automatiquement)
- **Credentials** : Stockés dans le script (sécurisé)
- **Connection** : SSL/TLS avec validation certificat

## 📦 Structure de Build

### Contenu Déployé
```
dist/                           # Build Astro statique
├── index.html                  # Page d'accueil
├── articles/                   # Liste articles
├── collections/                # 9 collections
│   ├── medicaments-glp1/       # 19 articles
│   ├── glp1-perte-de-poids/    # 15 articles
│   └── ...                     # Autres collections
├── images/                     # Images optimisées
├── admin/                      # Interface TinaCMS
└── _astro/                     # Assets optimisés (CSS/JS)
```

### Optimisations Build
- **Static Generation** : Toutes les pages pré-rendues
- **Asset Optimization** : CSS/JS minifiés
- **Image Compression** : Toutes les images optimisées
- **Tree Shaking** : Code inutilisé supprimé

## 🔐 Sécurité et Backup

### Données Sensibles
```powershell
# Migration Supabase terminée
✓ Ancien dossier data/ non synchronisé
✓ Base de données: Supabase Cloud
✓ Authentification: Supabase Auth
✓ Secrets: Variables d'environnement
```

### Backup Automatique
- **Git History** : Toutes les modifications versionnées
- **Supabase Backup** : Backup automatique base de données
- **Images** : Stockage redondant public/images/

### Sécurité Déploiement
- **SFTP chiffré** : Transmission sécurisée
- **Host Key validation** : Protection MITM
- **Credentials rotation** : Mots de passe régulièrement changés

## 🔄 Environnements

### Développement
```bash
# Local avec TinaCMS
npm run dev:tina
# URLs: http://localhost:4321/ et /admin
```

### Preview (Optionnel)
```bash
# Test build local
npm run build
npm run preview
# URL: http://localhost:4321/
```

### Production
```
# Après déploiement
Site: https://glp1-france.fr
Admin: https://glp1-france.fr/admin
Dashboard Supabase: https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum
```

## 📊 Monitoring Post-déploiement

### Vérifications Automatiques
```powershell
# Incluses dans le script deploy-auto.ps1
✓ Nombre de pages générées (~200)
✓ Images synchronisées
✓ Collections TinaCMS (9)
✓ Thumbnails disponibles (119)
✓ Site accessible (test HTTP)
```

### Métriques de Performance
- **Build Time** : 2-3 minutes
- **Upload Time** : 2-3 minutes (selon taille)
- **Total Deploy Time** : ~5-7 minutes
- **Site Size** : ~50-100MB (avec images)

### Tests Post-déploiement
```bash
# Tests manuels recommandés
1. Ouvrir https://glp1-france.fr
2. Naviguer vers quelques articles
3. Tester l'interface admin /admin
4. Vérifier images chargent
5. Tester formulaires de contact
```

## 🚨 Dépannage Déploiement

### Erreurs Communes

**WinSCP non trouvé**
```powershell
# Solution: installer WinSCP
# Download: https://winscp.net/download/WinSCP-5.21.7-Setup.exe
# Ou spécifier chemin manuellement dans script
```

**Erreur de build**
```powershell
# Nettoyer et retry
rm -rf dist/ .astro/ node_modules/
npm install
npm run build
```

**Upload timeout**
```powershell
# Vérifier connexion internet
# Retry le déploiement
.\scripts\deployment\deploy-auto.ps1
```

**Site inaccessible après déploiement**
```powershell
# Attendre propagation DNS (1-5 min)
# Vérifier logs Hostinger
# Test direct IP: 147.79.98.140
```

### Logs de Déploiement
```powershell
# Logs détaillés dans upload.log
cat upload.log

# Debug verbose
.\scripts\deployment\deploy-auto.ps1 -Verbose
```

## 🔧 Scripts de Déploiement

### Paramètres Disponibles
```powershell
# Message de commit personnalisé
-CommitMessage "Votre message"

# Skip validations TinaCMS (plus rapide)
-SkipTinaCheck

# Nettoyer ancien dossier data
-CleanLocalData

# Exemple complet
.\scripts\deployment\deploy-auto.ps1 -CommitMessage "Update: Nouveaux articles" -SkipTinaCheck
```

### Validation Pré-déploiement
```powershell
# Validation complète du système
.\scripts\validate-tina-setup.ps1

# Vérification migration Supabase
.\scripts\check-data-migration.ps1 -DryRun
```

## 📋 Checklist Déploiement

### Avant Déploiement
- [ ] **Modifications testées** localement (`npm run dev`)
- [ ] **Build réussit** (`npm run build`)
- [ ] **Articles sauvegardés** dans TinaCMS
- [ ] **Git sync** terminé (commits TinaCMS)
- [ ] **Images générées** si nécessaire

### Pendant Déploiement
- [ ] **Script s'exécute** sans erreur
- [ ] **Validations TinaCMS** passent
- [ ] **Build production** réussit
- [ ] **Upload Hostinger** terminé
- [ ] **Vérifications post-deploy** OK

### Après Déploiement
- [ ] **Site accessible** (https://glp1-france.fr)
- [ ] **Admin TinaCMS** fonctionne (/admin)
- [ ] **Articles s'affichent** correctement
- [ ] **Images chargent** sans 404
- [ ] **Performance acceptable** (<3s loading)

## 🎯 Résumé Workflow

```
1. Développement → npm run dev:tina
2. Modifications → TinaCMS /admin
3. Test local → Vérification site
4. Validation → .\scripts\validate-tina-setup.ps1
5. Déploiement → .\scripts\deployment\deploy-auto.ps1
6. Vérification → https://glp1-france.fr
```

**🎉 Déploiement terminé !** Votre site est maintenant en production.

---

**Fréquence** : Déploiement à la demande | **Durée** : ~5-7 minutes | **Support** : [troubleshooting.md](../operations/troubleshooting.md)
