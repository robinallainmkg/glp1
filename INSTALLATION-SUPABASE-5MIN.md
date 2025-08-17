# 🚀 Installation Supabase - 5 Minutes Chrono

## Étape 1 : Créer le Projet Supabase (2 minutes)

### 1.1 Aller sur Supabase
🌐 **Ouvrez** [supabase.com](https://supabase.com) dans votre navigateur

### 1.2 Se connecter/S'inscrire
- **Si vous avez déjà un compte** : Cliquez "Sign In"
- **Sinon** : Cliquez "Start your project" puis "Sign Up"

### 1.3 Créer un nouveau projet
1. **Cliquez** "New Project"
2. **Remplissez** :
   - **Name** : `glp1-france`
   - **Database Password** : Cliquez "Generate a password" et **SAUVEGARDEZ-LE**
   - **Region** : `West Europe (Ireland)` (plus proche de la France)
3. **Cliquez** "Create new project"
4. **Attendez** 1-2 minutes (création de la base)

## Étape 2 : Récupérer les Credentials (1 minute)

### 2.1 Aller dans les paramètres API
1. **Dans votre projet** → **Settings** (⚙️ en bas à gauche)
2. **Cliquez** "API" dans le menu

### 2.2 Copier les 3 valeurs importantes
📋 **Copiez ces 3 valeurs** (gardez cet onglet ouvert) :

1. **URL du projet** (commence par `https://xxx.supabase.co`)
2. **anon/public key** (clé publique - commence par `eyJhbGci...`)
3. **service_role key** (clé secrète - commence par `eyJhbGci...`) ⚠️ **SENSIBLE**

## Étape 3 : Configurer votre Projet (1 minute)

### 3.1 Modifier le fichier .env
**Ouvrez** `c:\Users\robin\Documents\glp1official\glp1\.env`

**Remplacez ces 3 lignes** :
```env
# AVANT
SUPABASE_URL=your-project-url-here
SUPABASE_ANON_KEY=your-anon-key-here  
SUPABASE_SERVICE_KEY=your-service-key-here

# APRÈS (avec VOS vraies valeurs)
SUPABASE_URL=https://votre-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre-cle-publique...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre-cle-service...
```

### 3.2 Sauvegarder le fichier
**Sauvegardez** le fichier `.env` avec `Ctrl+S`

## Étape 4 : Créer la Table Users (1 minute)

### 4.1 Aller dans l'éditeur SQL
1. **Dans Supabase** → **SQL Editor** (🗄️ dans le menu gauche)
2. **Cliquez** "New Query"

### 4.2 Copier-coller le script SQL
1. **Ouvrez** `c:\Users\robin\Documents\glp1official\glp1\database\create-users-table.sql`
2. **Sélectionnez tout** (`Ctrl+A`) et **copiez** (`Ctrl+C`)
3. **Dans Supabase SQL Editor** → **Collez** (`Ctrl+V`)
4. **Cliquez** "Run" (▶️)

✅ **Vous devriez voir** "Success. No rows returned" (c'est normal !)

## Étape 5 : Tester la Configuration (30 secondes)

### 5.1 Retour dans VS Code
**Dans votre terminal VS Code** :

```bash
npm run db:test
```

### 5.2 Résultat attendu
✅ **Si tout fonctionne, vous verrez** :
```
🎉 4. Configuration Supabase complète !
==================================================
✅ Variables d'environnement configurées
✅ Connexion Supabase fonctionnelle
✅ Table users accessible
✅ Permissions admin validées

📋 Prochaines étapes:
   ✅ Configuration Supabase terminée
   🔄 Lancer la migration: npm run db:migrate
   🧪 Tester les API: npm run dev
```

## 🎉 Félicitations ! 

**Votre Supabase est configuré !** Vous pouvez maintenant :

### ➡️ Lancer la migration de vos données
```bash
npm run db:migrate
```

### ➡️ Tester les nouvelles API
```bash
npm run dev
# Puis dans un autre terminal :
curl "http://localhost:4321/api/users?stats=true"
```

---

## 🆘 En Cas de Problème

### ❌ "Variables non configurées"
- Vérifiez que vous avez bien modifié le fichier `.env`
- Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
- Redémarrez VS Code si nécessaire

### ❌ "Table users n'existe pas"
- Retournez dans Supabase SQL Editor
- Vérifiez que le script SQL a bien été exécuté
- Relancez le script si nécessaire

### ❌ "Clés API invalides"
- Vérifiez que vous avez copié les bonnes clés depuis Supabase
- Vérifiez qu'il n'y a pas de caractères en trop

---

⏱️ **Temps total : ~5 minutes**
🎯 **Prêt pour la migration complète !**
