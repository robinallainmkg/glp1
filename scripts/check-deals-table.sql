-- Script de sauvegarde avant migration
-- À exécuter AVANT le script principal

-- 1. Vérifier le contenu de la table deals
SELECT 'Table deals - Contenu actuel:' as info;
SELECT * FROM public.deals LIMIT 10;

-- 2. Vérifier la structure de la table deals
SELECT 'Table deals - Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'deals' AND table_schema = 'public';

-- 3. Vérifier les contraintes
SELECT 'Contraintes sur deals:' as info;
SELECT conname, contype, confrelid::regclass, conkey, confkey
FROM pg_constraint 
WHERE conrelid = 'public.deals'::regclass;

-- 4. Sauvegarder les données deals si nécessaire
-- (Décommentez si vous voulez sauvegarder)
-- CREATE TABLE deals_backup AS SELECT * FROM public.deals;
