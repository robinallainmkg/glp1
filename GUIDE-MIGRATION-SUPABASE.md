# 🚀 Guide de Migration JSON vers Supabase - GLP-1 France

## 📋 Configuration Immédiate

### 1. Créer le Projet Supabase (5 minutes)

1. **Aller sur** [supabase.com](https://supabase.com)
2. **Créer un compte** ou se connecter
3. **Nouveau projet** :
   - Nom: `glp1-france-production`
   - Région: `West Europe (Ireland)` (plus proche de la France)
   - Mot de passe DB: Générer un mot de passe fort
4. **Attendre** la création (1-2 minutes)

### 2. Récupérer les Credentials (2 minutes)

Dans votre projet Supabase :
1. **Aller dans** `Settings > API`
2. **Copier** ces 3 valeurs :
   - `URL` (commence par https://...)
   - `anon/public key` (clé publique)
   - `service_role key` (clé privée - **SENSIBLE**)

### 3. Configurer les Variables d'Environnement (1 minute)

**Modifier** `.env` dans votre projet :
```env
# Remplacer par vos vraies valeurs Supabase
SUPABASE_URL=https://votre-project-id.supabase.co
SUPABASE_ANON_KEY=votre-cle-publique-ici
SUPABASE_SERVICE_KEY=votre-cle-service-ici
```

### 4. Créer la Table Users (1 minute)

Dans Supabase Dashboard :
1. **Aller dans** `SQL Editor`
2. **Copier-coller** le contenu de `database/create-users-table.sql`
3. **Cliquer** `Run` 

✅ **Votre table `users` est créée avec toutes les colonnes et sécurités !**

## 🧪 Test de la Configuration (2 minutes)

**Tester** que tout fonctionne :

```bash
# Dans votre terminal
cd c:\Users\robin\Documents\glp1official\glp1
node -e "import('./lib/supabase.js').then(() => console.log('✅ Supabase OK'))"
```

## 📦 Migration des Données (5 minutes)

### Étape 1 : Backup Automatique
Le script fait automatiquement un backup de vos données avant migration.

### Étape 2 : Lancer la Migration
```bash
# Migration complète JSON → Supabase
node scripts/migrate-users.js
```

**Le script va** :
- ✅ Vérifier la connexion Supabase
- 💾 Backup automatique de `data/users.json`
- 🔍 Valider chaque utilisateur
- 📤 Insérer dans Supabase par batch
- 📊 Rapport détaillé des résultats

### Étape 3 : Vérification
```bash
# Vérifier que les données sont bien migrées
curl "http://localhost:4321/api/users?stats=true"
```

## 🎛️ Test du Dashboard Admin (3 minutes)

### Nouvelle API Disponible

```bash
# Liste des utilisateurs (GET)
curl "http://localhost:4321/api/users"

# Créer un utilisateur (POST)
curl -X POST "http://localhost:4321/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Récupérer un utilisateur (GET)
curl "http://localhost:4321/api/users/1"

# Mettre à jour (PUT)
curl -X PUT "http://localhost:4321/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nom Modifié"}'

# Supprimer avec confirmation (DELETE)
curl -X DELETE "http://localhost:4321/api/users/1?confirmed=true"

# Bannir un utilisateur (PUT)
curl -X PUT "http://localhost:4321/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"action":"ban","reason":"Violation des règles"}'
```

## 🛡️ Sécurité Immédiate

### 1. Variables Sensibles
```env
# .env.production pour Hostinger
SUPABASE_SERVICE_KEY=votre-cle-service-production
# ⚠️ JAMAIS dans Git !
```

### 2. Policies Supabase
✅ **Déjà configurées** dans le script SQL :
- RLS activé
- Seuls les admins voient/modifient les users
- Audit trail automatique

## 📊 Dashboard Admin à Créer

### Prochaines Étapes (après migration réussie) :

1. **Interface Admin** :
   - `src/pages/admin-login/users/index.astro` - Liste
   - `src/pages/admin-login/users/new.astro` - Création
   - `src/pages/admin-login/users/[id]/edit.astro` - Édition

2. **Composants** :
   - `src/components/admin/UserTable.astro`
   - `src/components/admin/DeleteConfirmModal.astro`

3. **Scripts Client** :
   - `src/scripts/userManagement.js`
   - `src/scripts/deleteUser.js`

## ⚡ Avantages Immédiats

### ✅ Fini les Problèmes JSON :
- Plus de conflits local/production
- Plus de corruption de fichiers
- Plus de limites de taille

### ✅ Nouvelles Capacités :
- Recherche avancée en temps réel
- Pagination performante
- Audit trail complet
- Backup automatique
- Scalabilité illimitée

### ✅ Sécurité Renforcée :
- Row Level Security
- Validation stricte
- Logs d'audit
- Gestion des permissions

## 🆘 En Cas de Problème

### Rollback Rapide
```bash
# Si problème, vos données JSON sont intactes
# Les backups sont dans backup/
ls backup/users-backup-*.json
```

### Support Technique
```bash
# Vérifier la connexion
node -e "import('./lib/supabase.js')"

# Tester les services
node -e "import('./lib/services/userService.js').then(s => s.getUserStats())"

# Logs détaillés
DEBUG=true node scripts/migrate-users.js
```

## 🎯 Résultat Final

**Après cette migration vous aurez** :
- ✅ Base de données moderne et scalable
- ✅ API REST complète et sécurisée  
- ✅ Interface admin avec CRUD complet
- ✅ Suppression sécurisée avec double confirmation
- ✅ Audit trail de toutes les actions
- ✅ Backup et rollback automatiques
- ✅ Performance optimale (pagination, recherche)
- ✅ Code propre sans aucune référence JSON

**Temps total estimé : 15-20 minutes** ⏱️

---

🚀 **Prêt à commencer ? Suivez les étapes dans l'ordre !**
