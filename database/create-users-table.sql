-- ========================================
-- SCRIPT CRÉATION TABLE USERS - GLP-1 FRANCE
-- ========================================

-- Création de la table users avec structure complète
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  profile_image TEXT,
  permissions JSONB DEFAULT '{}'::jsonb,
  
  -- Métadonnées supplémentaires pour GLP-1
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'pro')),
  glp1_treatments JSONB DEFAULT '[]'::jsonb, -- Traitements GLP-1 suivis
  medical_data JSONB DEFAULT '{}'::jsonb,     -- Données médicales (anonymisées)
  preferences JSONB DEFAULT '{}'::jsonb,      -- Préférences utilisateur
  notes TEXT,                                 -- Notes admin
  banned_reason TEXT,                         -- Raison du ban si applicable
  banned_at TIMESTAMP,                        -- Date du ban
  banned_by TEXT                              -- Admin qui a effectué le ban
);

-- ========================================
-- INDEX POUR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_type);

-- ========================================
-- FONCTION DE MISE À JOUR AUTO updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour auto-update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- ACTIVATION ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy : Seuls les admins peuvent voir tous les users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );

-- Policy : Seuls les admins peuvent modifier les users
CREATE POLICY "Admins can modify users" ON users
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );

-- Policy : Les users peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- ========================================
-- DONNÉES DE TEST INITIALES
-- ========================================

-- Admin par défaut pour les tests
INSERT INTO users (name, email, role, status, permissions) VALUES 
('Admin GLP-1', 'admin@glp1france.com', 'admin', 'active', '{"all": true}'),
('Modérateur Test', 'moderator@glp1france.com', 'moderator', 'active', '{"moderate": true, "view_users": true}'),
('Utilisateur Test', 'user@glp1france.com', 'user', 'active', '{}')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- AUDIT TABLE (OPTIONNEL)
-- ========================================

CREATE TABLE IF NOT EXISTS user_audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'ban', 'unban'
  performed_by TEXT NOT NULL, -- Email de l'admin qui a fait l'action
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON user_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON user_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON user_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON user_audit_log(created_at DESC);

-- ========================================
-- COMMENTAIRES DE DOCUMENTATION
-- ========================================

COMMENT ON TABLE users IS 'Table des utilisateurs GLP-1 France avec gestion complète des rôles et permissions';
COMMENT ON COLUMN users.glp1_treatments IS 'Array JSON des traitements GLP-1 suivis par l''utilisateur';
COMMENT ON COLUMN users.medical_data IS 'Données médicales anonymisées (poids, objectifs, etc.)';
COMMENT ON COLUMN users.permissions IS 'Permissions spécifiques en JSON (format: {"permission": true})';

-- ========================================
-- VERIFICATION FINALE
-- ========================================

-- Vérifier que la table est créée
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
