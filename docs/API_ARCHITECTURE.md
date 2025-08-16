# Architecture API - GLP-1 France

## Décisions Techniques

### Configuration Astro
- **Mode**: `output: 'static'` (hébergement statique Hostinger)
- **Conséquence**: Les endpoints API TypeScript ne fonctionnent pas en production
- **Solution**: Utilisation de fichiers PHP pour les APIs

### Structure API

#### Endpoints Utilisateurs
```
/api/users.php          - Liste des utilisateurs (GET)
/api/delete-user.php    - Suppression utilisateur (POST)
```

#### Fichiers de Données
```
/data/users-unified.json - Source unique des données utilisateurs
/data/backups/          - Sauvegardes automatiques
```

### Environnements

#### Local (Development)
- **Détection**: `localhost` ou `127.0.0.1`
- **Chemins**: Relatifs depuis `src/pages/api/`
- **APIs**: `/api/users.php`, `/api/delete-user.php`

#### Production (Hostinger)
- **Détection**: Tout autre hostname
- **Chemins**: Absolus Hostinger + fallback relatifs
- **APIs**: Mêmes endpoints PHP

### Fonctionnalités

#### Gestion Utilisateurs (`/admin-user-data/`)
- ✅ Chargement depuis `users-unified.json`
- ✅ Suppression avec backup automatique
- ✅ Détection d'environnement automatique
- ✅ Logs détaillés pour debugging
- ✅ Gestion d'erreurs robuste

#### Sécurité
- Validation email côté serveur
- Backups automatiques avant suppression
- Logs d'audit avec IP et User-Agent
- Nettoyage automatique des anciens backups (garde 10)

### Historique des Changements

#### 2025-08-16
- ❌ Suppression de `/admin-users-advanced/`
- ✅ Création APIs PHP compatibles hébergement statique
- ✅ Mise à jour interface admin avec détection environnement
- ✅ Système de backup et logging intégré

### Notes Importantes
- **Astro Static**: Pas de support API TypeScript en production
- **Hostinger**: Nécessite fichiers PHP pour APIs dynamiques
- **Données**: Source unique `users-unified.json` pour cohérence
- **Backups**: Automatiques avant chaque suppression
