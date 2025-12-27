🔍 FIX FORMULAIRES - RÉSUMÉ
===========================

## PROBLÈME IDENTIFIÉ
Le formulaire de contact essayait d'insérer dans la table "users" qui:
- Est dédiée aux comptes utilisateurs (login/profils)
- N'a pas les bonnes colonnes (email, name, role, etc.)
- N'a pas la colonne "age", "subject", "message", etc.

## SOLUTION
Créer une table "contacts" dédiée aux formulaires de contact

## ÉTAPES À SUIVRE

### 1. Créer la table "contacts" dans Supabase
```bash
# Va sur: https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum/editor
# SQL Editor → Nouveau Query
# Copie le contenu de: supabase/create-contacts-table.sql
# RUN
```

### 2. Tester l'insertion
```bash
node scripts/test-contact-insert.mjs
```
Résultat attendu: ✅ SUCCÈS ! Données insérées

### 3. Déployer
```bash
git add src/pages/contact.astro scripts/
git commit -m "fix: formulaire contact utilise table contacts dédiée"
git push
```

### 4. Vérifier en production
- Va sur https://glp1-france.fr/contact/
- Remplis et soumets le formulaire
- Vérifie dans Supabase → contacts table

### 5. Tester la réception
```bash
node scripts/test-contacts.mjs
```

## FICHIERS MODIFIÉS
- ✅ src/pages/contact.astro → utilise table "contacts" au lieu de "users"
- ✅ scripts/test-contacts.mjs → lit depuis "contacts"
- ✅ scripts/test-contact-insert.mjs → teste insertion dans "contacts"
- ✅ supabase/create-contacts-table.sql → SQL pour créer la table

## FICHIERS CRÉÉS POUR DIAGNOSTIC
- ✅ supabase/create-diagnostics-table.sql → Table pour diagnostic GLP-1
- ✅ scripts/test-diagnostics.mjs → Tester les diagnostics
- ✅ src/pages/guides/quel-traitement-glp1-choisir.astro → Import Supabase + sauvegarde

## PROCHAINES ÉTAPES
1. Exécuter create-contacts-table.sql dans Supabase
2. Exécuter create-diagnostics-table.sql dans Supabase
3. Déployer sur Vercel
4. Tester formulaire contact
5. Tester diagnostic GLP-1
