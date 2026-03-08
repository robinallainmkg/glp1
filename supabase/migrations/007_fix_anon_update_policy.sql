-- Migration : Fix anon update policy pour correction_tickets
-- Date: 2026-03-08
-- Description: Permet aux dashboards admin (anon key) de mettre a jour
--   les tickets vers ready_to_deploy et deployed

DROP POLICY IF EXISTS "tickets_update_anon" ON correction_tickets;
CREATE POLICY "tickets_update_anon" ON correction_tickets
  FOR UPDATE
  USING (true)
  WITH CHECK (
    statut IN ('approved', 'rejected', 'revision_needed', 'pending_review', 'ready_to_deploy', 'deployed')
  );
