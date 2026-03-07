-- Migration 006 : Elargir la contrainte statut de fact_check_results
-- Le fact-checker peut renvoyer "A verifier" (sans accent) ou "À vérifier" (avec accent)

ALTER TABLE fact_check_results DROP CONSTRAINT IF EXISTS fact_check_results_statut_check;
ALTER TABLE fact_check_results ADD CONSTRAINT fact_check_results_statut_check
  CHECK (statut IN ('OK', 'À vérifier', 'A verifier', 'Urgent'));
