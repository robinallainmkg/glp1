-- Script de maintenance pour mettre à jour les statistiques et optimiser les performances

-- Refresh de la vue matérialisée des statistiques par ville
-- (À exécuter périodiquement via un cron job)
CREATE OR REPLACE FUNCTION refresh_city_stats()
RETURNS void AS $$
BEGIN
  -- Mettre à jour les compteurs de professionnels
  UPDATE french_cities 
  SET updated_at = NOW();
  
  -- Log de l'exécution
  INSERT INTO maintenance_logs (operation, executed_at, details) 
  VALUES ('refresh_city_stats', NOW(), 'City statistics refreshed');
END;
$$ LANGUAGE plpgsql;

-- Table de logs de maintenance
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details TEXT,
  success BOOLEAN DEFAULT true
);

-- Fonction pour optimiser les index
CREATE OR REPLACE FUNCTION optimize_search_performance()
RETURNS void AS $$
BEGIN
  -- Recalculer les statistiques des tables
  ANALYZE health_professionals;
  ANALYZE french_cities;
  ANALYZE professional_reviews;
  
  -- Log de l'exécution
  INSERT INTO maintenance_logs (operation, executed_at, details) 
  VALUES ('optimize_search_performance', NOW(), 'Database statistics updated');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciennes données
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Supprimer les logs de maintenance de plus de 90 jours
  DELETE FROM maintenance_logs 
  WHERE executed_at < NOW() - INTERVAL '90 days';
  
  -- Supprimer les avis non vérifiés de plus de 30 jours
  DELETE FROM professional_reviews 
  WHERE verified = false 
  AND created_at < NOW() - INTERVAL '30 days';
  
  -- Log de l'exécution
  INSERT INTO maintenance_logs (operation, executed_at, details) 
  VALUES ('cleanup_old_data', NOW(), 'Old data cleaned up');
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux tables principales
DROP TRIGGER IF EXISTS update_health_professionals_updated_at ON health_professionals;
CREATE TRIGGER update_health_professionals_updated_at
  BEFORE UPDATE ON health_professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_french_cities_updated_at ON french_cities;
CREATE TRIGGER update_french_cities_updated_at
  BEFORE UPDATE ON french_cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index composites pour optimiser les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_professionals_city_specialty 
ON health_professionals(city_id, specialty);

CREATE INDEX IF NOT EXISTS idx_professionals_glp1_city 
ON health_professionals(accepts_glp1, city_id) 
WHERE accepts_glp1 = true;

CREATE INDEX IF NOT EXISTS idx_professionals_featured_rating 
ON health_professionals(featured DESC, rating DESC) 
WHERE verified = true;

-- Vue pour les recherches rapides
CREATE OR REPLACE VIEW professional_search_view AS
SELECT 
  hp.id,
  hp.first_name,
  hp.last_name,
  hp.title,
  hp.specialty,
  hp.sub_specialties,
  hp.hospital_clinic,
  hp.address,
  hp.postal_code,
  hp.phone,
  hp.email,
  hp.website,
  hp.accepts_glp1,
  hp.accepts_new_patients,
  hp.consultation_fee,
  hp.languages,
  hp.rating,
  hp.review_count,
  hp.verified,
  hp.featured,
  c.name as city_name,
  c.slug as city_slug,
  c.department,
  c.region,
  -- Champ de recherche texte combiné
  CONCAT(
    hp.first_name, ' ',
    hp.last_name, ' ',
    hp.specialty, ' ',
    COALESCE(hp.hospital_clinic, ''), ' ',
    c.name, ' ',
    c.region
  ) as search_text
FROM health_professionals hp
JOIN french_cities c ON hp.city_id = c.id
WHERE hp.verified = true;

-- Index de recherche textuelle
CREATE INDEX IF NOT EXISTS idx_professional_search_text 
ON health_professionals USING gin(to_tsvector('french', 
  CONCAT(first_name, ' ', last_name, ' ', specialty, ' ', COALESCE(hospital_clinic, ''))
));
