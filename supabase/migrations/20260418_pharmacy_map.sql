-- Pharmacy map — crowdsourcing prix GLP-1 dans les officines françaises
-- Deux tables : pharmacies (référentiel ~22k depuis data.gouv.fr)
--               pharmacy_prices (prix soumis, scrapés, ou officiels CEPS)

-- ─────────────────────────────────────────────────────────────
-- Table : pharmacies
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finess TEXT UNIQUE NOT NULL,              -- identifiant national
  name TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  city_slug TEXT,                           -- slugifié pour SEO (/pharmacies/lyon/)
  department TEXT,                          -- "69", "75"
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pharmacies_city_slug ON pharmacies(city_slug);
CREATE INDEX IF NOT EXISTS idx_pharmacies_department ON pharmacies(department);
CREATE INDEX IF NOT EXISTS idx_pharmacies_lat_lng ON pharmacies(lat, lng);

ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

-- Lecture publique du référentiel
DROP POLICY IF EXISTS "pharmacies_public_read" ON pharmacies;
CREATE POLICY "pharmacies_public_read"
  ON pharmacies FOR SELECT
  USING (is_active = TRUE);

-- ─────────────────────────────────────────────────────────────
-- Table : pharmacy_prices
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  drug_slug TEXT NOT NULL,                  -- 'ozempic' | 'wegovy' | 'mounjaro' | 'saxenda'
  dose TEXT,                                -- '0.25mg' / '1mg' / '2.5mg' etc. NULL = non précisé
  price_eur NUMERIC(7, 2) NOT NULL,
  source TEXT NOT NULL,                     -- 'user' | 'scraped' | 'official_ceps'
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  display BOOLEAN DEFAULT TRUE,             -- false = doublon ou refusé
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_by_session TEXT,
  scraped_from TEXT,                        -- URL source si scraped
  notes TEXT,
  CONSTRAINT chk_price_positive CHECK (price_eur > 0 AND price_eur < 2000),
  CONSTRAINT chk_source_values CHECK (source IN ('user', 'scraped', 'official_ceps')),
  CONSTRAINT chk_drug_values CHECK (drug_slug IN ('ozempic', 'wegovy', 'mounjaro', 'saxenda'))
);

CREATE INDEX IF NOT EXISTS idx_prices_pharmacy ON pharmacy_prices(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_prices_drug ON pharmacy_prices(drug_slug);
CREATE INDEX IF NOT EXISTS idx_prices_submitted_at ON pharmacy_prices(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_prices_verified_display ON pharmacy_prices(drug_slug, verified, display) WHERE verified = TRUE AND display = TRUE;

ALTER TABLE pharmacy_prices ENABLE ROW LEVEL SECURITY;

-- Lecture publique : uniquement les prix vérifiés et affichables
DROP POLICY IF EXISTS "prices_public_read_verified" ON pharmacy_prices;
CREATE POLICY "prices_public_read_verified"
  ON pharmacy_prices FOR SELECT
  USING (verified = TRUE AND display = TRUE);

-- Insertion publique : autorisée (anon users peuvent soumettre), défaut verified=FALSE
DROP POLICY IF EXISTS "prices_public_insert" ON pharmacy_prices;
CREATE POLICY "prices_public_insert"
  ON pharmacy_prices FOR INSERT
  WITH CHECK (verified = FALSE AND source = 'user');

-- ─────────────────────────────────────────────────────────────
-- Vue : dernier prix par (pharmacie, drug, dose) vérifié
-- Utilisée par la map + les pages villes pour n'afficher que le prix le + récent
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW pharmacy_latest_prices AS
SELECT DISTINCT ON (pp.pharmacy_id, pp.drug_slug, COALESCE(pp.dose, ''))
  pp.id,
  pp.pharmacy_id,
  pp.drug_slug,
  pp.dose,
  pp.price_eur,
  pp.source,
  pp.submitted_at,
  p.finess,
  p.name,
  p.city,
  p.city_slug,
  p.department,
  p.lat,
  p.lng
FROM pharmacy_prices pp
JOIN pharmacies p ON p.id = pp.pharmacy_id
WHERE pp.verified = TRUE AND pp.display = TRUE AND p.is_active = TRUE
ORDER BY pp.pharmacy_id, pp.drug_slug, COALESCE(pp.dose, ''), pp.submitted_at DESC;

COMMENT ON TABLE pharmacies IS 'Référentiel national des pharmacies (data.gouv.fr FINESS + géocodage)';
COMMENT ON TABLE pharmacy_prices IS 'Prix GLP-1 crowdsourcés / scrapés / officiels CEPS. display=FALSE = doublon/refusé.';
COMMENT ON VIEW pharmacy_latest_prices IS 'Dernier prix vérifié par (pharmacie, drug, dose) — source principale pour la carte.';
