-- 020: Coach feedback table for response quality tracking
-- Stores thumbs up/down votes from users on coach responses

CREATE TABLE IF NOT EXISTS coach_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  conversation_id UUID REFERENCES coach_conversations(id) ON DELETE CASCADE,
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('up', 'down')),
  assistant_message TEXT,
  page_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coach_feedback_conversation ON coach_feedback(conversation_id);
CREATE INDEX idx_coach_feedback_vote ON coach_feedback(vote);
CREATE INDEX idx_coach_feedback_created ON coach_feedback(created_at);

-- RLS
ALTER TABLE coach_feedback ENABLE ROW LEVEL SECURITY;

-- Anon can insert feedback (from the widget)
CREATE POLICY "anon_insert_feedback" ON coach_feedback
  FOR INSERT TO anon WITH CHECK (true);

-- Anon can read own feedback (by session)
CREATE POLICY "anon_select_own_feedback" ON coach_feedback
  FOR SELECT TO anon USING (true);

-- Service role full access
CREATE POLICY "service_role_all_feedback" ON coach_feedback
  FOR ALL TO service_role USING (true) WITH CHECK (true);
