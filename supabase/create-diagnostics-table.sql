-- Table pour stocker les résultats des diagnostics GLP-1
CREATE TABLE IF NOT EXISTS diagnostics (
  id BIGSERIAL PRIMARY KEY,
  answers JSONB NOT NULL,
  recommendation TEXT NOT NULL,
  scores JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_diagnostics_completed_at ON diagnostics(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostics_recommendation ON diagnostics(recommendation);

-- RLS (Row Level Security) - Permettre les inserts anonymes
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre les inserts sans authentification
CREATE POLICY "Allow anonymous inserts" ON diagnostics
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy pour permettre la lecture (pour les stats futures)
CREATE POLICY "Allow read for service role" ON diagnostics
  FOR SELECT
  TO service_role
  USING (true);

-- Commentaires pour documentation
COMMENT ON TABLE diagnostics IS 'Stocke les résultats des diagnostics personnalisés GLP-1';
COMMENT ON COLUMN diagnostics.answers IS 'Réponses au questionnaire (JSONB)';
COMMENT ON COLUMN diagnostics.recommendation IS 'Type de recommandation: ozempic, wegovy, both, effets-secondaires';
COMMENT ON COLUMN diagnostics.scores IS 'Scores calculés pour chaque traitement (JSONB)';
COMMENT ON COLUMN diagnostics.completed_at IS 'Date et heure de complétion du diagnostic';
COMMENT ON COLUMN diagnostics.user_agent IS 'User agent du navigateur';
COMMENT ON COLUMN diagnostics.page_url IS 'URL de la page du diagnostic';
