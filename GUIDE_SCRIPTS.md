# 📋 Guide des Scripts de Déploiement GLP-1 France

Ce document présente tous les scripts disponibles pour le déploiement, la maintenance et le monitoring du site GLP-1 France.

## 🚀 Scripts de Déploiement

### Configuration Initiale
```bash
npm run deploy:setup
# ou
bash scripts/setup.sh
```
**Description**: Configuration initiale complète du système de déploiement
- Vérification des prérequis système
- Génération des clés SSH
- Configuration du fichier .env.production
- Test de connexion SSH
- Installation des dépendances
- Configuration des hooks Git

**Options disponibles**:
- `--auto` : Mode automatique avec valeurs par défaut
- `--skip-ssh` : Ignorer la configuration SSH
- `--skip-deps` : Ignorer l'installation des dépendances
- `--skip-test` : Ignorer les tests

### Déploiement Principal
```bash
npm run deploy
# ou
bash deploy.sh
```
**Description**: Déploiement complet avec backup et vérifications
- Build du projet
- Création de backup distant
- Synchronisation des fichiers
- Vérifications post-déploiement

**Options disponibles**:
- `--dry-run` : Simulation sans modification
- `--skip-backup` : Ignorer la création de backup
- `--skip-verify` : Ignorer les vérifications
- `--rollback` : Restaurer le dernier backup

### Déploiement Rapide
```bash
npm run deploy:quick
```
**Description**: Déploiement sans backup (plus rapide)

### Test de Déploiement
```bash
npm run deploy:dry
```
**Description**: Simulation de déploiement pour vérifier les changements

## 🔧 Scripts de Maintenance

### Nettoyage Standard
```bash
npm run maintenance:cleanup
# ou
bash scripts/cleanup.sh
```
**Description**: Nettoyage des fichiers locaux et distants
- Suppression des builds anciens
- Nettoyage des logs
- Suppression des fichiers temporaires
- Nettoyage des anciens backups distants

### Statistiques Seulement
```bash
npm run maintenance:stats
```
**Description**: Affichage des statistiques du projet sans nettoyage

### Maintenance Complète
```bash
npm run maintenance:full
```
**Description**: Maintenance complète avec optimisation des images et backup

**Fonctionnalités**:
- Tout le nettoyage standard
- Optimisation des images (PNG/JPEG)
- Backup des configurations importantes
- Vérification de l'intégrité des données

## 📊 Scripts de Monitoring

### Monitoring Standard
```bash
npm run monitoring:check
# ou
bash scripts/monitoring.sh
```
**Description**: Vérification complète de l'état du site
- Test HTTP/HTTPS
- Vérification SSL
- Test des pages importantes
- Vérification de l'espace disque
- Test de performance
- Vérification des backups

### Monitoring Rapide
```bash
npm run monitoring:quick
```
**Description**: Vérification rapide (HTTP et HTTPS seulement)

### Monitoring Complet avec Rapport
```bash
npm run monitoring:full
```
**Description**: Monitoring complet avec génération d'un rapport JSON

## 🔄 Scripts de Gestion

### Vérification du Site
```bash
npm run deploy:check
# ou
bash scripts/check-site.sh
```
**Description**: Vérification détaillée du site déployé
- Test HTTP et codes de réponse
- Vérification SSL et certificat
- Test de performance et métriques
- Validation des meta tags SEO
- Test de responsive design

### Rollback/Restauration
```bash
npm run deploy:rollback
# ou
bash scripts/rollback.sh
```
**Description**: Restauration depuis un backup
- Listing des backups disponibles
- Sélection interactive du backup
- Restauration sécurisée avec confirmations
- Vérification post-restauration

## 🛠️ Scripts Utilitaires

### Installation des Hooks Git
```bash
bash scripts/install-git-hooks.sh
```
**Description**: Installation des hooks Git pour automatiser les vérifications
- Hook pre-push avec vérification de build
- Installation interactive avec confirmations

### Analyse SEO
```bash
npm run seo:analyze
npm run seo:report
```
**Description**: Analyse SEO et génération de rapports

### Test des Collections
```bash
npm run collections:test
```
**Description**: Test et validation des collections de données

## 📁 Structure des Scripts

```
scripts/
├── setup.sh              # Configuration initiale
├── cleanup.sh             # Maintenance et nettoyage
├── monitoring.sh          # Monitoring et surveillance
├── check-site.sh          # Vérification du site
├── rollback.sh            # Gestion des rollbacks
├── install-git-hooks.sh   # Installation des hooks Git
└── hooks/
    └── pre-push           # Hook Git pre-push
```

## 🔧 Configuration

### Variables d'Environnement

Le fichier `.env.production` contient toute la configuration :

```bash
# SSH
SSH_USER="u403023291"
SSH_HOST="147.79.98.140"
SSH_PORT="65002"
SSH_KEY_PATH="~/.ssh/id_rsa_glp1"

# Déploiement
REMOTE_PATH="/home/u403023291/domains/glp1-france.fr/public_html"
SITE_URL="https://glp1-france.fr"
AUTO_BACKUP="true"
BACKUP_KEEP="5"

# Monitoring
ALERT_EMAIL="admin@example.com"
CHECK_SSL="true"
CHECK_PERFORMANCE="true"
```

### Permissions

Tous les scripts sont exécutables et sécurisés :
```bash
chmod +x scripts/*.sh
chmod 600 .env.production
```

## 🚨 Résolution de Problèmes

### Erreurs de Connexion SSH
1. Vérifier que la clé SSH est bien configurée sur Hostinger
2. Tester manuellement : `ssh -i ~/.ssh/id_rsa_glp1 -p 65002 u403023291@147.79.98.140`
3. Vérifier les paramètres dans `.env.production`

### Erreurs de Build
1. Vérifier les dépendances : `npm install`
2. Tester le build local : `npm run build`
3. Consulter les logs de déploiement

### Problèmes de Performance
1. Utiliser le monitoring : `npm run monitoring:full`
2. Vérifier l'espace disque : `npm run maintenance:stats`
3. Optimiser les images : `npm run maintenance:full`

### Échec de Déploiement
1. Tester en mode dry-run : `npm run deploy:dry`
2. Vérifier la connexion : `npm run monitoring:quick`
3. Utiliser le rollback si nécessaire : `npm run deploy:rollback`

## 📋 Workflow Recommandé

### Premier Déploiement
1. `npm run deploy:setup` - Configuration initiale
2. `npm run deploy:dry` - Test de déploiement
3. `npm run deploy` - Premier déploiement
4. `npm run deploy:check` - Vérification

### Déploiements Réguliers
1. `npm run build` - Test local
2. `npm run deploy:dry` - Vérification des changements
3. `npm run deploy:quick` - Déploiement rapide
4. `npm run monitoring:check` - Vérification

### Maintenance Hebdomadaire
1. `npm run maintenance:full` - Nettoyage complet
2. `npm run monitoring:full` - Rapport complet
3. Révision des logs et métriques

### En Cas de Problème
1. `npm run monitoring:check` - Diagnostic
2. `npm run deploy:rollback` - Retour en arrière si nécessaire
3. `npm run deploy:check` - Vérification après correction

## 📊 Métriques et Logs

### Logs de Déploiement
- Fichiers : `deploy_YYYYMMDD_HHMMSS.log`
- Conservation : 30 jours (configurable)
- Niveau : INFO, WARNING, ERROR

### Rapports de Monitoring
- Fichiers : `monitoring_report_YYYYMMDD_HHMMSS.json`
- Métriques : Performance, SSL, espace disque
- Alertes : Email et webhook (configurables)

### Backups
- Emplacement : Serveur distant dans le dossier parent
- Format : `backup_YYYYMMDD_HHMMSS`
- Conservation : 5 backups (configurable)
- Rotation automatique

---

## 🎯 Résumé des Commandes Essentielles

| Action | Commande | Description |
|--------|----------|-------------|
| **Setup** | `npm run deploy:setup` | Configuration initiale |
| **Deploy** | `npm run deploy` | Déploiement complet |
| **Test** | `npm run deploy:dry` | Test de déploiement |
| **Check** | `npm run deploy:check` | Vérification du site |
| **Monitor** | `npm run monitoring:check` | Monitoring complet |
| **Clean** | `npm run maintenance:cleanup` | Nettoyage |
| **Rollback** | `npm run deploy:rollback` | Restauration |

Pour plus d'informations détaillées, consultez :
- `GUIDE_CONFIGURATION_SSH.md` - Configuration SSH
- `GUIDE_DEPLOYMENT.md` - Guide de déploiement
- `README.md` - Documentation générale
