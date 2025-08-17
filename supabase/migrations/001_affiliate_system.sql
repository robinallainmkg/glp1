-- Migration pour le système d'affiliation
-- Date: 2025-08-17

-- Table des marques/brands
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  discount_percentage INTEGER DEFAULT 0,
  commission_percentage INTEGER DEFAULT 0,
  affiliate_code VARCHAR(100),
  description TEXT,
  contact_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories de produits
CREATE TABLE product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  glp1_relevant BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  image_url TEXT,
  affiliate_url TEXT,
  glp1_benefit TEXT, -- Bénéfice spécifique pour les utilisateurs GLP-1
  side_effects_help BOOLEAN DEFAULT false, -- Aide-t-il avec les effets secondaires
  recommended_for TEXT[], -- Array des effets secondaires qu'il aide
  stock_status VARCHAR(50) DEFAULT 'in_stock',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des deals/promotions
CREATE TABLE deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE, -- NULL si deal sur toute la marque
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'code')),
  discount_value DECIMAL(10,2) NOT NULL,
  promo_code VARCHAR(100),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour tracker les clics et conversions
CREATE TABLE affiliate_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, brand_id, date)
);

-- Insertion des données initiales
INSERT INTO brands (name, slug, discount_percentage, commission_percentage, affiliate_code, website_url, description, is_active) VALUES
('Talika', 'talika', 10, 15, 'TALIKA10', 'https://www.talika.com', 'Marque de cosmétiques spécialisée dans les soins post-perte de poids', true),
('Nutrimuscle', 'nutrimuscle', 5, 15, 'NUTRI5', 'https://www.nutrimuscle.com', 'Compléments alimentaires de qualité pour la nutrition et la récupération', true);

-- Insertion des catégories
INSERT INTO product_categories (name, slug, description, glp1_relevant) VALUES
('Soins de la peau', 'soins-peau', 'Produits pour maintenir l''élasticité de la peau pendant la perte de poids', true),
('Compléments digestifs', 'complements-digestifs', 'Aides pour gérer les effets secondaires digestifs', true),
('Vitamines et minéraux', 'vitamines-mineraux', 'Suppléments pour éviter les carences nutritionnelles', true),
('Hydratation', 'hydratation', 'Produits pour maintenir une bonne hydratation', true),
('Bien-être général', 'bien-etre', 'Produits pour le bien-être global pendant le traitement', true);

-- Insertion du produit Talika existant
INSERT INTO products (
  brand_id, 
  category_id, 
  name, 
  slug, 
  description, 
  price, 
  image_url, 
  affiliate_url,
  glp1_benefit,
  side_effects_help,
  recommended_for,
  is_featured
) VALUES (
  (SELECT id FROM brands WHERE slug = 'talika'),
  (SELECT id FROM product_categories WHERE slug = 'soins-peau'),
  'Bust Phytoserum',
  'talika-bust-phytoserum',
  'Sérum raffermissant pour maintenir l''élasticité de la peau du décolleté pendant la perte de poids',
  89.00,
  '/images/uploads/talika-bust-phytoserum.jpg',
  'https://www.talika.com/fr/bust-phytoserum',
  'Maintient l''élasticité et la fermeté de la peau pendant la perte de poids rapide',
  true,
  ARRAY['perte d''élasticité', 'vergetures', 'relâchement cutané'],
  true
);

-- Deal pour Talika
INSERT INTO deals (
  brand_id,
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  is_active
) VALUES (
  (SELECT id FROM brands WHERE slug = 'talika'),
  'Réduction Talika - Soins post-GLP1',
  '10% de réduction sur tous les produits Talika avec le code TALIKA10',
  'percentage',
  10.00,
  'TALIKA10',
  true
);

-- Deal pour Nutrimuscle
INSERT INTO deals (
  brand_id,
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  is_active
) VALUES (
  (SELECT id FROM brands WHERE slug = 'nutrimuscle'),
  'Réduction Nutrimuscle - Compléments GLP1',
  '5% de réduction sur tous les compléments Nutrimuscle avec le code NUTRI5',
  'percentage',
  5.00,
  'NUTRI5',
  true
);

-- Triggers pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index pour améliorer les performances
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_deals_brand_id ON deals(brand_id);
CREATE INDEX idx_deals_active ON deals(is_active);
CREATE INDEX idx_affiliate_stats_date ON affiliate_stats(date);

-- RLS (Row Level Security) pour sécuriser l'accès
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_stats ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public read access" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON deals FOR SELECT USING (is_active = true);

-- Politique pour les admins (à adapter selon votre système d'auth)
CREATE POLICY "Allow admin full access" ON brands FOR ALL USING (auth.role() = 'admin');
CREATE POLICY "Allow admin full access" ON product_categories FOR ALL USING (auth.role() = 'admin');
CREATE POLICY "Allow admin full access" ON products FOR ALL USING (auth.role() = 'admin');
CREATE POLICY "Allow admin full access" ON deals FOR ALL USING (auth.role() = 'admin');
CREATE POLICY "Allow admin full access" ON affiliate_stats FOR ALL USING (auth.role() = 'admin');
