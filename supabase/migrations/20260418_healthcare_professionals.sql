-- Healthcare professionals : endocrinologues, diabétologues, etc.
-- Source : data.gouv.fr RPPS (Annuaire Santé) + BAN (géocodage)

CREATE TABLE IF NOT EXISTS healthcare_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rpps TEXT UNIQUE NOT NULL,            -- identifiant national unique (11 chiffres)
  profession_type TEXT NOT NULL,        -- 'endocrinologue' | 'diabetologue' | 'diététicien' | etc
  civility TEXT,                        -- Dr / Pr / M / Mme
  first_name TEXT,
  last_name TEXT NOT NULL,
  specialties TEXT[],                   -- ['endocrinologie', 'métabolisme', ...]
  practice_mode TEXT,                   -- 'libéral' | 'salarié' | 'hospitalier'
  -- Adresse cabinet principal
  structure_name TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  city_slug TEXT,
  department TEXT,
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  geocode_quality TEXT,                 -- 'housenumber' | 'street' | 'locality' | 'fallback'
  phone TEXT,
  email TEXT,
  finess TEXT,                          -- si rattaché à un établissement
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pros_profession ON healthcare_professionals(profession_type);
CREATE INDEX IF NOT EXISTS idx_pros_city_slug ON healthcare_professionals(city_slug);
CREATE INDEX IF NOT EXISTS idx_pros_department ON healthcare_professionals(department);
CREATE INDEX IF NOT EXISTS idx_pros_lat_lng ON healthcare_professionals(lat, lng);

ALTER TABLE healthcare_professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pros_public_read" ON healthcare_professionals;
CREATE POLICY "pros_public_read"
  ON healthcare_professionals FOR SELECT
  USING (is_active = TRUE);

-- Centres Spécialisés de l'Obésité (CSO) — 37 centres agréés Ministère
CREATE TABLE IF NOT EXISTS obesity_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,            -- 'cso-pitie-salpetriere-paris'
  name TEXT NOT NULL,                   -- 'CSO Pitié-Salpêtrière'
  parent_hospital TEXT,                 -- 'AP-HP'
  is_pediatric BOOLEAN DEFAULT FALSE,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  city_slug TEXT,
  department TEXT,
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  phone TEXT,
  website TEXT,
  specialties TEXT[],
  finess TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cso_city_slug ON obesity_centers(city_slug);
CREATE INDEX IF NOT EXISTS idx_cso_department ON obesity_centers(department);

ALTER TABLE obesity_centers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cso_public_read" ON obesity_centers;
CREATE POLICY "cso_public_read"
  ON obesity_centers FOR SELECT
  USING (is_active = TRUE);

COMMENT ON TABLE healthcare_professionals IS 'Professionnels de santé spécialisés GLP-1 (endocrinologues, diabétologues, etc.) — source RPPS data.gouv.fr + géocodage BAN';
COMMENT ON TABLE obesity_centers IS 'Centres Spécialisés de l''Obésité (CSO) agréés par le Ministère de la Santé — 37 centres adultes + pédiatriques';
