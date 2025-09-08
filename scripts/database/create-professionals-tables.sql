-- Table des villes françaises
CREATE TABLE french_cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(3) NOT NULL,
  region VARCHAR(255) NOT NULL,
  postal_code VARCHAR(5) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  population INTEGER,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX idx_french_cities_name ON french_cities(name);
CREATE INDEX idx_french_cities_postal_code ON french_cities(postal_code);
CREATE INDEX idx_french_cities_slug ON french_cities(slug);

-- Table des professionnels de santé
CREATE TABLE health_professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(50) NOT NULL, -- Dr., Pr., etc.
  specialty VARCHAR(255) NOT NULL,
  sub_specialties TEXT[], -- Tableau des sous-spécialités
  hospital_clinic VARCHAR(255),
  address TEXT NOT NULL,
  city_id UUID REFERENCES french_cities(id),
  postal_code VARCHAR(5) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(500),
  accepts_glp1 BOOLEAN DEFAULT true,
  accepts_new_patients BOOLEAN DEFAULT true,
  consultation_fee DECIMAL(6,2),
  languages TEXT[] DEFAULT ARRAY['Français'],
  certifications TEXT[],
  education TEXT[],
  experience_years INTEGER,
  bio TEXT,
  profile_image VARCHAR(500),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX idx_professionals_city_id ON health_professionals(city_id);
CREATE INDEX idx_professionals_specialty ON health_professionals(specialty);
CREATE INDEX idx_professionals_postal_code ON health_professionals(postal_code);
CREATE INDEX idx_professionals_accepts_glp1 ON health_professionals(accepts_glp1);
CREATE INDEX idx_professionals_featured ON health_professionals(featured);

-- Table des avis patients
CREATE TABLE professional_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES health_professionals(id) ON DELETE CASCADE,
  patient_name VARCHAR(100),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  treatment_type VARCHAR(100),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour mettre à jour la note moyenne
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE health_professionals 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM professional_reviews 
      WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM professional_reviews 
      WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
    )
  WHERE id = COALESCE(NEW.professional_id, OLD.professional_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON professional_reviews
  FOR EACH ROW EXECUTE FUNCTION update_professional_rating();

-- Vue pour les statistiques par ville
CREATE VIEW city_professional_stats AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.postal_code,
  c.department,
  c.region,
  COUNT(hp.id) as professional_count,
  COUNT(CASE WHEN hp.specialty LIKE '%Endocrinologue%' THEN 1 END) as endocrinologist_count,
  COUNT(CASE WHEN hp.specialty LIKE '%Diabétologue%' THEN 1 END) as diabetologist_count,
  COUNT(CASE WHEN hp.specialty LIKE '%Nutritionniste%' THEN 1 END) as nutritionist_count,
  COUNT(CASE WHEN hp.accepts_glp1 = true THEN 1 END) as glp1_specialists_count,
  AVG(hp.rating) as avg_rating
FROM french_cities c
LEFT JOIN health_professionals hp ON c.id = hp.city_id
GROUP BY c.id, c.name, c.slug, c.postal_code, c.department, c.region;
