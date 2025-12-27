-- Table pour stocker les soumissions du formulaire de contact
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  nom TEXT,
  telephone TEXT,
  age TEXT,
  subject TEXT,
  message TEXT,
  treatment TEXT,
  newsletter BOOLEAN DEFAULT false,
  concerns JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new',
  notes TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

-- RLS (Row Level Security) - Permettre les inserts anonymes
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre les inserts sans authentification
CREATE POLICY "Allow anonymous contact inserts" ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy pour permettre la lecture (service role uniquement)
CREATE POLICY "Allow read for service role" ON contacts
  FOR SELECT
  TO service_role
  USING (true);

-- Commentaires pour documentation
COMMENT ON TABLE contacts IS 'Stocke les soumissions du formulaire de contact';
COMMENT ON COLUMN contacts.email IS 'Email du contact (obligatoire)';
COMMENT ON COLUMN contacts.nom IS 'Nom du contact';
COMMENT ON COLUMN contacts.telephone IS 'Numéro de téléphone';
COMMENT ON COLUMN contacts.age IS 'Âge du contact';
COMMENT ON COLUMN contacts.subject IS 'Sujet du message';
COMMENT ON COLUMN contacts.message IS 'Message du contact';
COMMENT ON COLUMN contacts.treatment IS 'Traitement GLP-1 concerné';
COMMENT ON COLUMN contacts.newsletter IS 'Inscription à la newsletter';
COMMENT ON COLUMN contacts.concerns IS 'Préoccupations (array JSONB)';
COMMENT ON COLUMN contacts.status IS 'Statut du contact: new, read, replied, archived';
