# 🚀 Commandes Disponibles - Migration Supabase

## 🔧 Configuration et Test

```bash
# Tester la connexion Supabase
npm run db:test

# Voir les statistiques utilisateurs
npm run db:stats
```

## 📦 Migration Complète

```bash
# Migration JSON → Supabase (avec backup automatique)
npm run db:migrate
```

## 🧪 Test des API

```bash
# Démarrer le serveur de dev
npm run dev

# Dans un autre terminal, tester les API :

# Statistiques
curl "http://localhost:4321/api/users?stats=true"

# Liste paginée
curl "http://localhost:4321/api/users?page=0&limit=10"

# Recherche
curl "http://localhost:4321/api/users?search=admin"

# Créer utilisateur
curl -X POST "http://localhost:4321/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }'

# Récupérer utilisateur avec audit
curl "http://localhost:4321/api/users/1?audit=true"

# Mettre à jour
curl -X PUT "http://localhost:4321/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Nom Modifié"}'

# Bannir
curl -X PUT "http://localhost:4321/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"action": "ban", "reason": "Test ban"}'

# Réactiver
curl -X PUT "http://localhost:4321/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"action": "unban"}'

# Supprimer (avec confirmation obligatoire)
curl -X DELETE "http://localhost:4321/api/users/1?confirmed=true"
```

## 📊 Résultats Attendus

### ✅ Test Connexion Réussi
```
✅ Supabase OK
```

### ✅ Statistiques
```json
{
  "total": 150,
  "byStatus": {
    "active": 140,
    "suspended": 8,
    "banned": 2
  },
  "byRole": {
    "user": 145,
    "moderator": 4,
    "admin": 1
  },
  "recent": 5
}
```

### ✅ Migration Réussie
```
🚀 Début de la migration JSON → Supabase
================================================
📋 1. Vérifications préalables...
✅ Connexion Supabase OK
📊 Utilisateurs actuels dans Supabase: 0

💾 2. Backup des données existantes...
✅ Backup JSON créé: backup/users-backup-1234567890.json

📥 3. Chargement des données JSON...
📊 150 utilisateurs trouvés dans le JSON
✅ 148 utilisateurs valides
⚠️ 2 utilisateurs invalides

📤 4. Insertion dans Supabase...
📦 Batch 1/2 (100 utilisateurs)
✅ Batch 1 inséré: 100 utilisateurs
📦 Batch 2/2 (48 utilisateurs)
✅ Batch 2 inséré: 48 utilisateurs

📊 5. Rapport de migration
================================================
📥 Utilisateurs dans JSON: 150
✅ Utilisateurs valides: 148
❌ Utilisateurs invalides: 2
📤 Utilisateurs insérés: 148
⚠️ Erreurs d'insertion: 0

🔍 6. Vérification post-migration...
📊 Total utilisateurs dans Supabase: 148

💡 7. Recommandations post-migration
================================================
🎉 Migration réussie à 100% !

📋 Prochaines étapes:
   1. Tester les nouvelles API Supabase
   2. Mettre à jour le dashboard admin
   3. Supprimer les références au JSON
   4. Deployer en production
```

## 🆘 En Cas d'Erreur

### Erreur de Connexion
```bash
# Vérifier les variables d'environnement
cat .env | grep SUPABASE

# Tester manuellement
node -e "
  import('./lib/supabase.js').then(s => 
    console.log('Config:', s.supabaseConfig)
  ).catch(console.error)
"
```

### Erreur de Migration
```bash
# Voir les logs détaillés
DEBUG=true npm run db:migrate

# Vérifier les backups
ls -la backup/
```

### API qui ne répond pas
```bash
# Vérifier que le serveur est démarré
npm run dev

# Tester la route de base
curl "http://localhost:4321/api/users" -v
```

---

**🎯 Vous êtes maintenant prêt pour la migration complète JSON → Supabase !**
