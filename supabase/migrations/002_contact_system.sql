-- Migration pour les tables de contact et utilisateurs
-- Date: 2025-08-21

-- Table pour les soumissions de contact
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  age VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  treatment VARCHAR(100),
  concerns TEXT[], -- Array pour les préoccupations multiples
  newsletter_signup BOOLEAN DEFAULT false,
  source VARCHAR(50) DEFAULT 'contact_form',
  ip_address VARCHAR(45),
  status VARCHAR(20) DEFAULT 'new', -- new, read, responded, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table unifiée des utilisateurs
CREATE TABLE users_unified (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(20),
  age VARCHAR(20),
  treatment VARCHAR(100),
  concerns TEXT[],
  newsletter_subscribed BOOLEAN DEFAULT false,
  contact_submissions_count INTEGER DEFAULT 0,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  source VARCHAR(50),
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les abonnés newsletter
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(50),
  ip_address VARCHAR(45)
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER contact_submissions_updated_at 
  BEFORE UPDATE ON contact_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_unified_updated_at 
  BEFORE UPDATE ON users_unified 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index pour améliorer les performances
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX idx_users_unified_email ON users_unified(email);
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);

-- RLS (Row Level Security)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_unified ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins seulement (contacts sensibles)
CREATE POLICY "Allow service role full access" ON contact_submissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON users_unified FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON newsletter_subscribers FOR ALL USING (auth.role() = 'service_role');
