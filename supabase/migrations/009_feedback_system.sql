-- Migration pour la table de feedback utilisateur (homepage)
-- Date: 2026-03-08

-- Table pour les feedbacks (sondages + témoignages)
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('survey', 'testimonial')),
  -- Champs sondage
  discovery VARCHAR(50),
  interest VARCHAR(50),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  -- Champs témoignage
  name VARCHAR(255),
  email VARCHAR(255),
  story TEXT,
  -- Métadonnées
  page_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'published', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Policy : anon peut INSERT (soumettre un feedback)
CREATE POLICY "Allow anon insert feedback" ON user_feedback
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy : service_role a accès complet (admin)
CREATE POLICY "Allow service role full access on feedback" ON user_feedback
  FOR ALL USING (auth.role() = 'service_role');

-- Index
CREATE INDEX idx_user_feedback_type ON user_feedback(type);
CREATE INDEX idx_user_feedback_status ON user_feedback(status);
CREATE INDEX idx_user_feedback_created_at ON user_feedback(created_at);
