-- Migration 013 : Table agent_queue pour lancer les agents depuis le dashboard
-- Date: 2026-03-14

CREATE TABLE IF NOT EXISTS agent_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  agent_run_id UUID REFERENCES agent_runs(id)
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON agent_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_requested ON agent_queue(requested_at DESC);

ALTER TABLE agent_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "queue_read_all" ON agent_queue;
CREATE POLICY "queue_read_all" ON agent_queue FOR SELECT USING (true);
DROP POLICY IF EXISTS "queue_insert_all" ON agent_queue;
CREATE POLICY "queue_insert_all" ON agent_queue FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "queue_update_all" ON agent_queue;
CREATE POLICY "queue_update_all" ON agent_queue FOR UPDATE USING (true);
