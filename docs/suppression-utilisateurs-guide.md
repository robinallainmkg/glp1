# 🏥 Documentation - Système de Suppression Utilisateurs GLP1 France

## 📋 Vue d'ensemble

Ce système permet la suppression sécurisée d'utilisateurs dans le dashboard admin du site GLP1 France, avec compatibilité automatique entre l'environnement local et la production Hostinger.

## 🚀 Fichiers Créés

### 1. `/src/pages/api/delete-user-hostinger.php`
- **Rôle**: API de suppression compatible multi-environnement
- **Fonctionnalités**: Détection automatique local/production, backup, logs
- **Sécurité**: Validation, backup automatique, logs détaillés

### 2. `/src/pages/admin-users-advanced.astro`
- **Rôle**: Interface dashboard admin avancée
- **Fonctionnalités**: Recherche, statistiques, export CSV, notifications
- **Design**: Compatible mobile, design cohérent GLP1

### 3. `/test-delete-users.html`
- **Rôle**: Interface de test pour validation
- **Fonctionnalités**: Tests API, création utilisateurs test, diagnostic

## 🔧 Installation

### Étape 1: Déployer les fichiers

```bash
# Copier l'API de suppression
cp src/pages/api/delete-user-hostinger.php /chemin/vers/site/src/pages/api/

# Copier le dashboard avancé
cp src/pages/admin-users-advanced.astro /chemin/vers/site/src/pages/

# Copier l'interface de test (optionnel)
cp test-delete-users.html /chemin/vers/site/
```

### Étape 2: Vérifier la structure des dossiers

Le système détecte automatiquement l'environnement et ajuste les chemins :

**Local** :
```
src/pages/api/delete-user-hostinger.php
├── data/users-unified.json
├── data/backups/
└── logs/user-deletions.log
```

**Hostinger** :
```
src/pages/api/delete-user-hostinger.php
├── ../../../data/users-unified.json
├── ../../../data/backups/
└── ../../../logs/user-deletions.log
```

### Étape 3: Créer les dossiers nécessaires

```bash
# Sur le serveur (ajustez les chemins selon votre configuration)
mkdir -p data/backups
mkdir -p logs
chmod 755 data/backups
chmod 755 logs
```

## 🛡️ Sécurité

### Validation des Données
- ✅ Format email validé
- ✅ Sanitisation des entrées
- ✅ Vérification d'existence utilisateur

### Backup Automatique
- ✅ Backup avant chaque suppression
- ✅ Horodatage des backups
- ✅ Nettoyage automatique (garde 10 derniers)

### Logs Détaillés
- ✅ Toutes les actions loggées
- ✅ IP et User-Agent enregistrés
- ✅ Environnement et timestamp

## 🌍 Compatibilité Environnements

### Détection Automatique
Le système détecte automatiquement l'environnement :

```php
function detectEnvironment() {
    $serverName = $_SERVER['SERVER_NAME'] ?? '';
    
    if (strpos($serverName, 'glp1-france.com') !== false || 
        strpos($serverName, 'hostinger') !== false ||
        !strpos($serverName, 'localhost')) {
        return 'production'; // Hostinger
    }
    return 'local'; // Développement
}
```

### Configuration des Chemins
```php
// Production (Hostinger)
'data_file' => __DIR__ . '/../../../data/users-unified.json'

// Local
'data_file' => __DIR__ . '/../../data/users-unified.json'
```

## 📊 Utilisation

### Dashboard Admin
1. **Accéder** : `/admin-users-advanced`
2. **Rechercher** : Utiliser la barre de recherche
3. **Supprimer** : Cliquer sur 🗑️ et confirmer
4. **Exporter** : Bouton "Exporter CSV"

### Interface de Test
1. **Accéder** : `/test-delete-users.html`
2. **Tester API** : Bouton "Tester la Connexion"
3. **Charger users** : Bouton "Charger les Utilisateurs"
4. **Créer test** : Bouton "Créer Utilisateur Test"
5. **Supprimer** : Saisir email et tester

## 🔍 Monitoring

### Logs d'Activité
```bash
# Voir les derniers logs
tail -f logs/user-deletions.log

# Filtrer par erreurs
grep "ERROR" logs/user-deletions.log

# Statistiques quotidiennes
grep "$(date +%Y-%m-%d)" logs/user-deletions.log | wc -l
```

### Vérification des Backups
```bash
# Lister les backups
ls -la data/backups/

# Vérifier l'espace disque
du -h data/backups/

# Compter les backups
ls data/backups/ | wc -l
```

## 🚨 Résolution de Problèmes

### Erreur "Fichier de données introuvable"
```bash
# Vérifier l'existence
ls -la data/users-unified.json

# Vérifier les permissions
chmod 644 data/users-unified.json
```

### Erreur "Impossible de créer le backup"
```bash
# Créer le dossier
mkdir -p data/backups

# Permissions
chmod 755 data/backups
chown www-data:www-data data/backups  # Si nécessaire
```

### Erreur de logs
```bash
# Créer le dossier de logs
mkdir -p logs

# Permissions
chmod 755 logs
touch logs/user-deletions.log
chmod 644 logs/user-deletions.log
```

## 🎯 API Endpoints

### Suppression d'Utilisateur
```http
POST /api/delete-user-hostinger.php
Content-Type: application/json

{
  "email": "utilisateur@example.com"
}
```

**Réponse Succès** :
```json
{
  "success": true,
  "message": "Utilisateur supprimé avec succès",
  "data": {
    "emailDeleted": "utilisateur@example.com",
    "userName": "John Doe",
    "previousCount": 150,
    "newCount": 149,
    "backupFile": "users-backup-2025-08-16_16-30-45.json",
    "environment": "production",
    "timestamp": "2025-08-16 16:30:45"
  }
}
```

**Réponse Erreur** :
```json
{
  "success": false,
  "error": "Utilisateur avec l'email utilisateur@example.com introuvable",
  "environment": "production",
  "timestamp": "2025-08-16 16:30:45"
}
```

## 📈 Performances

### Optimisations Implémentées
- ✅ Lecture/écriture optimisée des fichiers JSON
- ✅ Validation early return pour éviter les traitements inutiles
- ✅ Backup asynchrone
- ✅ Nettoyage automatique des anciens backups

### Limites Recommandées
- **Utilisateurs** : Jusqu'à 10,000 (performance optimale)
- **Backups** : 10 fichiers max (nettoyage auto)
- **Logs** : Rotation recommandée tous les 30 jours

## 🔐 Sécurité Avancée

### Headers de Sécurité
```php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Validation Stricte
```php
// Validation email
if (!filter_var($emailToDelete, FILTER_VALIDATE_EMAIL)) {
    throw new Exception('Format d\'email invalide');
}

// Normalisation
$emailToDelete = trim(strtolower($data['email']));
```

### Audit Trail
Chaque action est loggée avec :
- ✅ Timestamp précis
- ✅ Adresse IP
- ✅ User-Agent
- ✅ Environnement détecté
- ✅ Résultat de l'opération

## 🚀 Déploiement Production

### Checklist Pré-Déploiement
- [ ] Tester en local avec `test-delete-users.html`
- [ ] Vérifier les chemins de fichiers
- [ ] Contrôler les permissions dossiers
- [ ] Tester la création de backups
- [ ] Valider les logs

### Commandes de Déploiement
```bash
# 1. Upload des fichiers
scp src/pages/api/delete-user-hostinger.php user@server:/path/to/site/src/pages/api/
scp src/pages/admin-users-advanced.astro user@server:/path/to/site/src/pages/

# 2. Créer la structure
ssh user@server "mkdir -p /path/to/site/data/backups"
ssh user@server "mkdir -p /path/to/site/logs"

# 3. Permissions
ssh user@server "chmod 755 /path/to/site/data/backups"
ssh user@server "chmod 755 /path/to/site/logs"
```

### Test Post-Déploiement
```bash
# Test API
curl -X POST https://your-domain.com/api/delete-user-hostinger.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Vérifier les logs
ssh user@server "tail -n 10 /path/to/site/logs/user-deletions.log"
```

## 📞 Support

En cas de problème :
1. **Consulter les logs** : `logs/user-deletions.log`
2. **Tester l'API** : Utiliser `test-delete-users.html`
3. **Vérifier les permissions** : Dossiers data/ et logs/
4. **Contrôler la structure** : Chemins des fichiers JSON

---

**Développé pour GLP1 France** 🏥
*Version compatible Hostinger - Août 2025*
