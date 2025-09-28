-- =====================================================
-- SCRIPT DE CRÉATION DES TABLES ANNUAIRE GLP-1
-- Compatible Supabase PostgreSQL
-- =====================================================

-- 1. Table des villes françaises (améliorée)
CREATE TABLE IF NOT EXISTS french_cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    department_code VARCHAR(3) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    region_code VARCHAR(2),
    region_name VARCHAR(255),
    postal_codes JSONB DEFAULT '[]'::jsonb,
    population INTEGER NOT NULL DEFAULT 0,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_major_city BOOLEAN DEFAULT FALSE,
    seo_priority INTEGER DEFAULT 1 CHECK (seo_priority >= 1 AND seo_priority <= 10),
    insee_code VARCHAR(5) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_french_cities_slug ON french_cities(slug);
CREATE INDEX IF NOT EXISTS idx_french_cities_population ON french_cities(population DESC);
CREATE INDEX IF NOT EXISTS idx_french_cities_major ON french_cities(is_major_city);
CREATE INDEX IF NOT EXISTS idx_french_cities_seo_priority ON french_cities(seo_priority DESC);
CREATE INDEX IF NOT EXISTS idx_french_cities_department ON french_cities(department_code);
CREATE INDEX IF NOT EXISTS idx_french_cities_coords ON french_cities(latitude, longitude);

-- 2. Table des spécialités médicales
CREATE TABLE IF NOT EXISTS specialties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    seo_title_template TEXT NOT NULL,
    seo_description_template TEXT NOT NULL,
    intro_template TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'medical',
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
    keywords JSONB DEFAULT '[]'::jsonb,
    related_conditions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les spécialités
CREATE INDEX IF NOT EXISTS idx_specialties_slug ON specialties(slug);
CREATE INDEX IF NOT EXISTS idx_specialties_priority ON specialties(priority DESC);
CREATE INDEX IF NOT EXISTS idx_specialties_category ON specialties(category);
CREATE INDEX IF NOT EXISTS idx_specialties_active ON specialties(is_active);

-- 3. Table des professionnels de santé (améliorée)
CREATE TABLE IF NOT EXISTS health_professionals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE, -- ID Doctolib ou autre source
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    title VARCHAR(50) DEFAULT 'Dr.', -- Dr., Pr., etc.
    specialty_slug VARCHAR(255) NOT NULL REFERENCES specialties(slug) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES french_cities(id) ON DELETE CASCADE,
    
    -- Informations de contact
    address TEXT NOT NULL,
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website_url TEXT,
    doctolib_url TEXT,
    
    -- Informations géographiques
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Informations professionnelles
    consultation_price_min INTEGER, -- Prix en euros
    consultation_price_max INTEGER,
    accepts_new_patients BOOLEAN DEFAULT TRUE,
    accepts_glp1 BOOLEAN DEFAULT FALSE, -- Spécialisé GLP-1
    sector_type INTEGER DEFAULT 2 CHECK (sector_type IN (1, 2)), -- 1: conventionné, 2: libre
    languages_spoken JSONB DEFAULT '["Français"]'::jsonb,
    
    -- Informations complémentaires
    bio TEXT,
    photo_url TEXT,
    years_experience INTEGER,
    diplomas JSONB DEFAULT '[]'::jsonb,
    
    -- Statut et modération
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    moderation_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    
    -- Statistiques
    view_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2), -- Note moyenne sur 5
    review_count INTEGER DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    
    -- Contraintes
    CONSTRAINT valid_rating CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
    CONSTRAINT valid_prices CHECK (consultation_price_min IS NULL OR consultation_price_max IS NULL OR consultation_price_min <= consultation_price_max)
);

-- Index pour les professionnels
CREATE INDEX IF NOT EXISTS idx_health_professionals_external_id ON health_professionals(external_id);
CREATE INDEX IF NOT EXISTS idx_health_professionals_specialty ON health_professionals(specialty_slug);
CREATE INDEX IF NOT EXISTS idx_health_professionals_city ON health_professionals(city_id);
CREATE INDEX IF NOT EXISTS idx_health_professionals_active ON health_professionals(is_active);
CREATE INDEX IF NOT EXISTS idx_health_professionals_verified ON health_professionals(is_verified);
CREATE INDEX IF NOT EXISTS idx_health_professionals_glp1 ON health_professionals(accepts_glp1);
CREATE INDEX IF NOT EXISTS idx_health_professionals_new_patients ON health_professionals(accepts_new_patients);
CREATE INDEX IF NOT EXISTS idx_health_professionals_coords ON health_professionals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_health_professionals_rating ON health_professionals(rating DESC);
CREATE INDEX IF NOT EXISTS idx_health_professionals_views ON health_professionals(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_health_professionals_specialty_city ON health_professionals(specialty_slug, city_id);

-- 4. Table des pages de destination générées
CREATE TABLE IF NOT EXISTS landing_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    specialty_slug VARCHAR(255) NOT NULL REFERENCES specialties(slug) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES french_cities(id) ON DELETE CASCADE,
    
    -- URL et SEO
    url_path VARCHAR(500) UNIQUE NOT NULL, -- /annuaire/endocrinologue-glp1/paris
    seo_title VARCHAR(255) NOT NULL,
    seo_description TEXT NOT NULL,
    seo_keywords JSONB DEFAULT '[]'::jsonb,
    
    -- Contenu généré
    intro_text TEXT NOT NULL,
    faq_content JSONB DEFAULT '[]'::jsonb, -- Questions/réponses
    
    -- Statistiques de la page
    professional_count INTEGER DEFAULT 0,
    avg_consultation_price DECIMAL(6, 2),
    avg_wait_time_days INTEGER,
    percentage_new_patients DECIMAL(5, 2),
    
    -- Statut de génération
    is_generated BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    generation_status VARCHAR(20) DEFAULT 'pending', -- pending, generating, completed, error
    
    -- Métriques SEO et trafic
    monthly_search_volume INTEGER DEFAULT 0,
    seo_difficulty INTEGER DEFAULT 0,
    current_ranking INTEGER,
    target_keywords JSONB DEFAULT '[]'::jsonb,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_generated_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Contrainte d'unicité
    UNIQUE(specialty_slug, city_id)
);

-- Index pour les pages de destination
CREATE INDEX IF NOT EXISTS idx_landing_pages_url_path ON landing_pages(url_path);
CREATE INDEX IF NOT EXISTS idx_landing_pages_specialty ON landing_pages(specialty_slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_city ON landing_pages(city_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_published ON landing_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_landing_pages_generated ON landing_pages(is_generated);
CREATE INDEX IF NOT EXISTS idx_landing_pages_search_volume ON landing_pages(monthly_search_volume DESC);

-- 5. Table des liens internes pour le maillage SEO
CREATE TABLE IF NOT EXISTS internal_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
    target_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
    
    -- Informations du lien
    anchor_text VARCHAR(255) NOT NULL,
    link_type VARCHAR(50) NOT NULL, -- nearby_city, other_specialty, related_content
    position_in_page VARCHAR(50), -- header, content, sidebar, footer
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
    
    -- Métadonnées
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Éviter les liens vers soi-même
    CONSTRAINT no_self_link CHECK (source_page_id != target_page_id),
    
    -- Contrainte d'unicité pour éviter les doublons
    UNIQUE(source_page_id, target_page_id, anchor_text)
);

-- Index pour les liens internes
CREATE INDEX IF NOT EXISTS idx_internal_links_source ON internal_links(source_page_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_target ON internal_links(target_page_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_type ON internal_links(link_type);
CREATE INDEX IF NOT EXISTS idx_internal_links_priority ON internal_links(priority DESC);

-- 6. Table des templates FAQ pour génération automatique
CREATE TABLE IF NOT EXISTS faq_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    specialty_slug VARCHAR(255) NOT NULL REFERENCES specialties(slug) ON DELETE CASCADE,
    
    -- Template de question et réponse
    question_template TEXT NOT NULL, -- "Combien coûte une consultation {specialty} à {city} ?"
    answer_template TEXT NOT NULL, -- "Le tarif varie entre {minPrice}€ et {maxPrice}€..."
    
    -- Catégorisation
    category VARCHAR(50) NOT NULL, -- pricing, appointment, selection, treatment
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
    
    -- Variables disponibles dans le template
    available_variables JSONB DEFAULT '[]'::jsonb, -- ['city', 'specialty', 'minPrice', 'maxPrice']
    
    -- Métadonnées
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Éviter les doublons
    UNIQUE(specialty_slug, question_template)
);

-- Index pour les templates FAQ
CREATE INDEX IF NOT EXISTS idx_faq_templates_specialty ON faq_templates(specialty_slug);
CREATE INDEX IF NOT EXISTS idx_faq_templates_category ON faq_templates(category);
CREATE INDEX IF NOT EXISTS idx_faq_templates_priority ON faq_templates(priority DESC);

-- 7. Table des avis et évaluations (pour future extension)
CREATE TABLE IF NOT EXISTS professional_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES health_professionals(id) ON DELETE CASCADE,
    
    -- Informations de l'avis
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    reviewer_name VARCHAR(255),
    reviewer_initial VARCHAR(10), -- "M. D." pour anonymisation
    
    -- Validation et modération
    is_verified BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'pending',
    
    -- Source de l'avis
    source VARCHAR(50) DEFAULT 'website', -- website, google, doctolib, etc.
    external_review_id VARCHAR(255),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les avis
CREATE INDEX IF NOT EXISTS idx_professional_reviews_professional ON professional_reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_reviews_rating ON professional_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_professional_reviews_published ON professional_reviews(is_published);

-- =====================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_french_cities_updated_at BEFORE UPDATE ON french_cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON specialties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_professionals_updated_at BEFORE UPDATE ON health_professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON landing_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VUES UTILES POUR L'ANNUAIRE
-- =====================================================

-- Vue des professionnels avec informations complètes
CREATE OR REPLACE VIEW professional_complete AS
SELECT 
    hp.*,
    fc.name as city_name,
    fc.slug as city_slug,
    fc.department_name,
    fc.population as city_population,
    s.name as specialty_name,
    s.category as specialty_category,
    CONCAT(hp.first_name, ' ', hp.last_name) as full_name
FROM health_professionals hp
JOIN french_cities fc ON hp.city_id = fc.id
JOIN specialties s ON hp.specialty_slug = s.slug
WHERE hp.is_active = TRUE;

-- Vue des statistiques par ville/spécialité
CREATE OR REPLACE VIEW city_specialty_stats AS
SELECT 
    fc.id as city_id,
    fc.name as city_name,
    fc.slug as city_slug,
    s.slug as specialty_slug,
    s.name as specialty_name,
    COUNT(hp.id) as professional_count,
    AVG(hp.consultation_price_min) as avg_price_min,
    AVG(hp.consultation_price_max) as avg_price_max,
    AVG(hp.rating) as avg_rating,
    COUNT(CASE WHEN hp.accepts_new_patients THEN 1 END) as accepting_new_patients,
    COUNT(CASE WHEN hp.accepts_glp1 THEN 1 END) as glp1_specialists
FROM french_cities fc
CROSS JOIN specialties s
LEFT JOIN health_professionals hp ON fc.id = hp.city_id AND s.slug = hp.specialty_slug AND hp.is_active = TRUE
GROUP BY fc.id, fc.name, fc.slug, s.slug, s.name;

-- =====================================================
-- DONNÉES INITIALES (EXEMPLES)
-- =====================================================

-- Insertion des spécialités de base (si elles n'existent pas)
INSERT INTO specialties (slug, name, description, seo_title_template, seo_description_template, intro_template, category, priority) VALUES
('endocrinologue-glp1', 'Endocrinologue spécialisé GLP-1', 'Endocrinologue expert dans la prescription de médicaments GLP-1', '{count} Endocrinologues GLP-1 à {city} | Ozempic Wegovy Mounjaro', 'Trouvez un endocrinologue spécialisé GLP-1 à {city}. Consultation pour Ozempic, Wegovy, Mounjaro.', 'À {city}, {count} endocrinologues sont spécialisés dans la prescription de médicaments GLP-1.', 'medical', 10),
('diabetologue', 'Diabétologue expert Ozempic/Wegovy', 'Diabétologue spécialisé dans le traitement du diabète avec les nouveaux médicaments GLP-1', '{count} Diabétologues à {city} | Experts Ozempic Wegovy', 'Consultez un diabétologue expert à {city}. Spécialistes Ozempic, Wegovy pour diabète type 2.', 'Les {count} diabétologues de {city} vous accompagnent dans la gestion de votre diabète.', 'medical', 9),
('nutritionniste-obesite', 'Nutritionniste spécialisé perte de poids', 'Nutritionniste expert en accompagnement de la perte de poids avec les traitements GLP-1', '{count} Nutritionnistes Obésité à {city} | Accompagnement GLP-1', 'Nutritionniste spécialisé obésité à {city}. Accompagnement perte de poids avec Ozempic, Wegovy.', 'À {city}, {count} nutritionnistes accompagnent les patients sous traitement GLP-1.', 'nutrition', 8)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE french_cities IS 'Villes françaises avec informations géographiques et démographiques pour l''annuaire';
COMMENT ON TABLE specialties IS 'Spécialités médicales avec templates SEO pour génération automatique de contenu';
COMMENT ON TABLE health_professionals IS 'Professionnels de santé spécialisés GLP-1 avec informations complètes';
COMMENT ON TABLE landing_pages IS 'Pages de destination générées automatiquement par combinaison ville/spécialité';
COMMENT ON TABLE internal_links IS 'Système de maillage interne pour optimisation SEO';
COMMENT ON TABLE faq_templates IS 'Templates pour génération automatique de FAQ personnalisées';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Affichage du résumé
SELECT 'Tables créées avec succès pour l''annuaire GLP-1' as message;
