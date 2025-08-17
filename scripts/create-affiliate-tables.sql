-- Script de création des tables pour le système d'affiliation
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des catégories de produits
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  is_glp1_related BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des marques partenaires
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  default_commission DECIMAL(5,2) DEFAULT 0,
  default_discount DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  partner_code VARCHAR(50),
  contact_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  description TEXT,
  price DECIMAL(10,2),
  affiliate_url VARCHAR(1000),
  image_url VARCHAR(500),
  is_glp1_recommended BOOLEAN DEFAULT false,
  stock_status VARCHAR(20) DEFAULT 'available' CHECK (stock_status IN ('available', 'low_stock', 'out_of_stock')),
  tags TEXT[],
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des deals/promotions
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  discount_percentage DECIMAL(5,2),
  promo_code VARCHAR(50),
  commission_percentage DECIMAL(5,2),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des statistiques d'affiliation
CREATE TABLE IF NOT EXISTS affiliate_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  commission DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, product_id, deal_id, date)
);

-- Création des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_glp1_recommended ON products(is_glp1_recommended);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_brand_id ON deals(brand_id);
CREATE INDEX IF NOT EXISTS idx_deals_product_id ON deals(product_id);
CREATE INDEX IF NOT EXISTS idx_deals_is_active ON deals(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_stats_date ON affiliate_stats(date);
CREATE INDEX IF NOT EXISTS idx_affiliate_stats_brand_id ON affiliate_stats(brand_id);

-- Création des triggers pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers sur toutes les tables
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activation de Row Level Security (RLS) pour sécuriser les données
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_stats ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour permettre l'accès aux administrateurs authentifiés
-- (à adapter selon vos besoins de sécurité)

-- Politique pour product_categories : lecture publique, écriture admin
CREATE POLICY "Allow public read access on product_categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on product_categories" ON product_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on product_categories" ON product_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on product_categories" ON product_categories FOR DELETE USING (auth.role() = 'authenticated');

-- Politique pour brands : lecture publique, écriture admin
CREATE POLICY "Allow public read access on brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on brands" ON brands FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on brands" ON brands FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on brands" ON brands FOR DELETE USING (auth.role() = 'authenticated');

-- Politique pour products : lecture publique, écriture admin
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Politique pour deals : lecture publique, écriture admin
CREATE POLICY "Allow public read access on deals" ON deals FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on deals" ON deals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on deals" ON deals FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on deals" ON deals FOR DELETE USING (auth.role() = 'authenticated');

-- Politique pour affiliate_stats : accès admin uniquement
CREATE POLICY "Allow authenticated access on affiliate_stats" ON affiliate_stats FOR ALL USING (auth.role() = 'authenticated');

-- Insertion des données initiales
-- Catégories de produits
INSERT INTO product_categories (name, description, icon, is_glp1_related) VALUES
('Cosmétiques', 'Produits de soin et cosmétiques', '💄', true),
('Nutrition', 'Compléments alimentaires et nutrition', '💊', true),
('Bien-être', 'Produits de bien-être général', '🧘', false),
('Sport', 'Équipements et nutrition sportive', '🏃', false)
ON CONFLICT (name) DO NOTHING;

-- Marques partenaires
INSERT INTO brands (name, description, logo_url, website_url, default_commission, default_discount, partner_code, contact_email) VALUES
('Talika', 'Marque française de cosmétiques innovants depuis 1948', '/images/brands/talika-logo.png', 'https://talika.com', 8.00, 10.00, 'TALIKA_GLP1', 'partenariat@talika.com'),
('Nutrimuscle', 'Spécialiste français de la nutrition sportive', '/images/brands/nutrimuscle-logo.png', 'https://nutrimuscle.com', 5.00, 5.00, 'NUTRI_GLP1', 'affiliation@nutrimuscle.com')
ON CONFLICT (name) DO NOTHING;

-- Récupération des IDs des catégories et marques pour les produits
-- (Cette partie sera adaptée lors de l'exécution réelle)
