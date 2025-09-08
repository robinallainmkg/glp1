-- Table des professionnels de santé GLP-1
CREATE TABLE healthcare_professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informations personnelles
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(50) NOT NULL, -- Dr., Pr., etc.
  specialty VARCHAR(100) NOT NULL, -- Endocrinologue, Diabétologue, etc.
  
  -- Contact et localisation
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Adresse complète
  street_address VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  department VARCHAR(50), -- Département français
  region VARCHAR(50), -- Région française
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Informations professionnelles
  consultation_types TEXT[], -- ['GLP-1', 'Diabète', 'Obésité', 'Nutrition']
  languages TEXT[], -- ['Français', 'Anglais', 'Espagnol']
  accepts_new_patients BOOLEAN DEFAULT true,
  consultation_fee_range VARCHAR(50), -- '50-80€', '80-120€'
  
  -- Disponibilité
  availability_schedule JSONB, -- Horaires par jour
  next_available_date DATE,
  
  -- Qualifications
  medical_school VARCHAR(255),
  certifications TEXT[],
  years_experience INTEGER,
  glp1_specialist BOOLEAN DEFAULT false,
  
  -- Établissement
  practice_type VARCHAR(50), -- 'Cabinet privé', 'Hôpital public', 'Clinique'
  establishment_name VARCHAR(255),
  establishment_type VARCHAR(50), -- 'CHU', 'Clinique privée', 'Cabinet'
  
  -- Métadonnées
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2), -- Note sur 5
  reviews_count INTEGER DEFAULT 0,
  
  -- SEO
  slug VARCHAR(255) UNIQUE,
  meta_description TEXT,
  
  -- Statistiques
  profile_views INTEGER DEFAULT 0,
  contact_clicks INTEGER DEFAULT 0
);

-- Index pour les recherches géographiques
CREATE INDEX idx_professionals_city ON healthcare_professionals(city);
CREATE INDEX idx_professionals_postal_code ON healthcare_professionals(postal_code);
CREATE INDEX idx_professionals_department ON healthcare_professionals(department);
CREATE INDEX idx_professionals_region ON healthcare_professionals(region);
CREATE INDEX idx_professionals_specialty ON healthcare_professionals(specialty);
CREATE INDEX idx_professionals_glp1 ON healthcare_professionals(glp1_specialist);
CREATE INDEX idx_professionals_location ON healthcare_professionals(latitude, longitude);

-- Table des villes françaises pour le référencement
CREATE TABLE french_cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  department VARCHAR(50) NOT NULL,
  department_code VARCHAR(3) NOT NULL,
  region VARCHAR(50) NOT NULL,
  population INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- SEO
  slug VARCHAR(255) UNIQUE,
  seo_priority INTEGER DEFAULT 1, -- 1=Haute, 2=Moyenne, 3=Basse
  
  -- Statistiques
  professionals_count INTEGER DEFAULT 0,
  page_generated BOOLEAN DEFAULT false,
  
  UNIQUE(name, postal_code)
);

-- Index pour les villes
CREATE INDEX idx_cities_name ON french_cities(name);
CREATE INDEX idx_cities_department ON french_cities(department);
CREATE INDEX idx_cities_region ON french_cities(region);
CREATE INDEX idx_cities_seo_priority ON french_cities(seo_priority);

-- Table de liaison pour les spécialités par ville
CREATE TABLE city_specialties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID REFERENCES french_cities(id) ON DELETE CASCADE,
  specialty VARCHAR(100) NOT NULL,
  professionals_count INTEGER DEFAULT 0,
  page_url VARCHAR(255),
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  UNIQUE(city_id, specialty)
);

-- Fonction pour mettre à jour les compteurs
CREATE OR REPLACE FUNCTION update_city_professionals_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le compteur de professionnels par ville
  UPDATE french_cities 
  SET professionals_count = (
    SELECT COUNT(*) 
    FROM healthcare_professionals 
    WHERE city = french_cities.name
  );
  
  -- Mettre à jour les compteurs par spécialité
  INSERT INTO city_specialties (city_id, specialty, professionals_count)
  SELECT 
    fc.id,
    hp.specialty,
    COUNT(*)
  FROM healthcare_professionals hp
  JOIN french_cities fc ON hp.city = fc.name
  GROUP BY fc.id, hp.specialty
  ON CONFLICT (city_id, specialty) 
  DO UPDATE SET professionals_count = EXCLUDED.professionals_count;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour maintenir les compteurs à jour
CREATE TRIGGER trigger_update_city_counts
  AFTER INSERT OR UPDATE OR DELETE ON healthcare_professionals
  FOR EACH STATEMENT EXECUTE FUNCTION update_city_professionals_count();

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE healthcare_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE french_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_specialties ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public read access" ON healthcare_professionals
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON french_cities
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON city_specialties
  FOR SELECT USING (true);
