-- Migration 016 : Permettre au validator/agents de créer des agent_runs avec la clé anon
-- Date: 2026-03-15
-- Description: Les agents tournent en local avec la clé anon (Claude Max, pas d'API key).
--   La politique actuelle exige service_role pour INSERT/UPDATE sur agent_runs.
--   Cette migration ajoute une politique anon pour INSERT et UPDATE.

-- INSERT policy pour anon
DROP POLICY IF EXISTS "agent_runs_insert_anon" ON agent_runs;
CREATE POLICY "agent_runs_insert_anon" ON agent_runs
  FOR INSERT WITH CHECK (true);

-- UPDATE policy pour anon
DROP POLICY IF EXISTS "agent_runs_update_anon" ON agent_runs;
CREATE POLICY "agent_runs_update_anon" ON agent_runs
  FOR UPDATE USING (true);
