#!/usr/bin/env node

/**
 * Script pour tester directement si le formulaire fonctionne en production
 * ET afficher la config RLS de Supabase
 */

console.log(`
🔍 DIAGNOSTIC FORMULAIRES DE CONTACT
=====================================

PROBLÈME: Les données des formulaires n'arrivent pas

CAUSES POSSIBLES:
1. ❌ RLS (Row Level Security) bloque les inserts anonymes
2. ❌ Table "users" n'existe pas ou mauvaise structure
3. ❌ Permissions Supabase mal configurées
4. ❌ Le JS du formulaire ne s'exécute pas côté client

SOLUTIONS:

📋 ÉTAPE 1: Vérifier la table Supabase
--------------------------------------
1. Va sur https://supabase.com/dashboard
2. Connecte-toi à ton projet: ywekaivgjzsmdocchvum
3. Va dans "Table Editor" → cherche la table "users"
4. Vérifie qu'elle a ces colonnes:
   - email (text, primary key ou unique)
   - nom (text)
   - telephone (text, nullable)
   - age (text, nullable)  
   - subject (text, nullable)
   - message (text, nullable)
   - treatment (text, nullable)
   - newsletter (boolean)
   - concerns (text[] ou jsonb)
   - created_at (timestamp)
   - updated_at (timestamp)

📋 ÉTAPE 2: Configurer les RLS (Row Level Security)
---------------------------------------------------
Dans Supabase Dashboard → Table Editor → "users" → RLS:

DÉSACTIVE temporairement RLS pour tester:
1. Clique sur "RLS" à côté de "users"
2. Si RLS est activé (Enable RLS), désactive-le temporairement

OU crée une policy pour permettre les inserts anonymes:

Policy Name: "Allow anonymous contact inserts"
Allowed operation: INSERT
Policy definition: true
With check: true

SQL pour créer la policy:
\`\`\`sql
-- Désactiver RLS pour la table users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- OU créer une policy permissive
CREATE POLICY "Allow anonymous inserts" ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow read own data" ON users
  FOR SELECT
  TO anon
  USING (true);
\`\`\`

📋 ÉTAPE 3: Tester dans la console navigateur
---------------------------------------------
1. Va sur https://glp1-france.fr/contact
2. Ouvre DevTools (F12) → Console
3. Remplis le formulaire et soumets
4. Regarde les logs dans la console:
   - "📧 Contact form submitted" = formulaire soumis
   - "✅ Supabase connection OK" = connexion réussie
   - "✅ Contact form success" = données insérées
   - "❌ Supabase error" = erreur (regarde le message)

📋 ÉTAPE 4: Vérifier les données dans Supabase
----------------------------------------------
Après avoir soumis un formulaire test:
1. Va dans Supabase → Table Editor → "users"
2. Regarde si une nouvelle ligne apparaît
3. Si oui: ✅ Le formulaire fonctionne !
4. Si non: regarde les logs API dans Supabase → Logs

📋 ÉTAPE 5: Test du diagnostic
------------------------------
Le diagnostic utilise probablement le même système.
Cherche dans le code:
- File avec "diagnostic" dans le nom
- Formulaire qui envoie à Supabase ou une API

Exécute:
\`\`\`bash
grep -r "diagnostic" src/pages/*.astro
grep -r "form.*submit.*diagnostic" src/ 
\`\`\`

💡 RECOMMANDATION IMMÉDIATE:
---------------------------
Va maintenant sur Supabase Dashboard et:
1. Vérifie que la table "users" existe
2. DÉSACTIVE temporairement RLS sur "users" 
3. Test un formulaire de contact
4. Regarde si les données arrivent
5. Si oui: configure les policies RLS proprement
6. Si non: regarde les logs Supabase → Logs → API

🔗 LIENS RAPIDES:
----------------
Dashboard: https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum
Table Editor: https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum/editor
API Logs: https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum/logs/api-logs
RLS: https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum/auth/policies

`);
