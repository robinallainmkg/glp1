-- Migration 005 FIX : Indexes et policies pour correction_tickets
-- A executer si la table existe deja mais les index ont echoue

-- Drop indexes if they exist, then recreate
DROP INDEX IF EXISTS idx_tickets_statut;
DROP INDEX IF EXISTS idx_tickets_article_id;
DROP INDEX IF EXISTS idx_tickets_fact_check_id;
DROP INDEX IF EXISTS idx_tickets_urgence;
DROP INDEX IF EXISTS idx_tickets_type;
DROP INDEX IF EXISTS idx_tickets_created_at;

CREATE INDEX idx_tickets_statut ON correction_tickets(statut);
CREATE INDEX idx_tickets_article_id ON correction_tickets(article_id);
CREATE INDEX idx_tickets_fact_check_id ON correction_tickets(fact_check_result_id);
CREATE INDEX idx_tickets_urgence ON correction_tickets(urgence);
CREATE INDEX idx_tickets_type ON correction_tickets(ticket_type);
CREATE INDEX idx_tickets_created_at ON correction_tickets(created_at DESC);

-- Trigger (idempotent)
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ticket_updated_at ON correction_tickets;
CREATE TRIGGER trigger_ticket_updated_at
  BEFORE UPDATE ON correction_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_updated_at();

-- RLS
ALTER TABLE correction_tickets ENABLE ROW LEVEL SECURITY;

-- Policies (drop first to avoid duplicates)
DROP POLICY IF EXISTS "tickets_read_all" ON correction_tickets;
DROP POLICY IF EXISTS "tickets_write_service" ON correction_tickets;
DROP POLICY IF EXISTS "tickets_update_anon" ON correction_tickets;

CREATE POLICY "tickets_read_all" ON correction_tickets FOR SELECT USING (true);
CREATE POLICY "tickets_write_service" ON correction_tickets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "tickets_update_anon" ON correction_tickets
  FOR UPDATE
  USING (true)
  WITH CHECK (
    statut IN ('approved', 'rejected', 'revision_needed', 'pending_review')
  );
