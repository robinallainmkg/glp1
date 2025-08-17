-- Script d'insertion des produits pour le système d'affiliation
-- À exécuter APRÈS create-affiliate-tables.sql

-- Variables pour stocker les IDs (remplacez par les vrais IDs après création)
-- Vous devrez adapter ces IDs selon votre base de données

-- Insertion des produits Talika (cosmétiques pour effets secondaires GLP-1)
INSERT INTO products (name, brand_id, category_id, description, price, affiliate_url, image_url, is_glp1_recommended, tags, rating) 
SELECT 
  'Crème Réparatrice Peau Sèche Talika',
  b.id,
  c.id,
  'Crème hydratante intensive pour combattre la sécheresse cutanée liée aux traitements GLP-1. Formule riche en actifs réparateurs.',
  45.90,
  'https://talika.com/creme-reparatrice?ref=GLP1_GUIDE',
  '/images/products/talika-creme-reparatrice.jpg',
  true,
  ARRAY['peau sèche', 'hydratation', 'GLP-1', 'réparation'],
  4.3
FROM brands b, product_categories c 
WHERE b.name = 'Talika' AND c.name = 'Cosmétiques';

INSERT INTO products (name, brand_id, category_id, description, price, affiliate_url, image_url, is_glp1_recommended, tags, rating) 
SELECT 
  'Sérum Anti-Fatigue Talika',
  b.id,
  c.id,
  'Sérum revitalisant pour lutter contre la fatigue cutanée. Idéal pour retrouver un teint éclatant pendant les traitements.',
  52.00,
  'https://talika.com/serum-anti-fatigue?ref=GLP1_GUIDE',
  '/images/products/talika-serum-fatigue.jpg',
  true,
  ARRAY['anti-fatigue', 'éclat', 'sérum', 'GLP-1'],
  4.5
FROM brands b, product_categories c 
WHERE b.name = 'Talika' AND c.name = 'Cosmétiques';

INSERT INTO products (name, brand_id, category_id, description, price, affiliate_url, image_url, is_glp1_recommended, tags, rating) 
SELECT 
  'Masque Hydratant Intensif Talika',
  b.id,
  c.id,
  'Masque hydratant pour un soin intensif hebdomadaire. Compense la déshydratation liée aux effets secondaires.',
  38.50,
  'https://talika.com/masque-hydratant?ref=GLP1_GUIDE',
  '/images/products/talika-masque-hydratant.jpg',
  true,
  ARRAY['masque', 'hydratation intensive', 'soin hebdomadaire'],
  4.1
FROM brands b, product_categories c 
WHERE b.name = 'Talika' AND c.name = 'Cosmétiques';

-- Insertion des produits Nutrimuscle (nutrition pour effets secondaires GLP-1)
INSERT INTO products (name, brand_id, category_id, description, price, affiliate_url, image_url, is_glp1_recommended, tags, rating) 
SELECT 
  'Magnésium Bisglycinate Nutrimuscle',
  b.id,
  c.id,
  'Magnésium de haute qualité pour réduire la fatigue et les crampes musculaires liées aux traitements GLP-1.',
  24.90,
  'https://nutrimuscle.com/magnesium-bisglycinate?ref=GLP1_NUTRITION',
  '/images/products/nutrimuscle-magnesium.jpg',
  true,
  ARRAY['magnésium', 'fatigue', 'crampes', 'GLP-1', 'muscles'],
  4.6
FROM brands b, product_categories c 
WHERE b.name = 'Nutrimuscle' AND c.name = 'Nutrition';

INSERT INTO products (name, brand_id, category_id, description, price, affiliate_url, image_url, is_glp1_recommended, tags, rating) 
SELECT 
  'Probiotiques Nutrimuscle',
  b.id,
  c.id,
  'Complexe probiotique pour améliorer la digestion et réduire les troubles gastro-intestinaux des GLP-1.',
  32.50,
  'https://nutrimuscle.com/probiotiques?ref=GLP1_NUTRITION',
  '/images/products/nutrimuscle-probiotiques.jpg',
  true,
  ARRAY['probiotiques', 'digestion', 'intestin', 'GLP-1'],
  4.4
FROM brands b, product_categories c 
WHERE b.name = 'Nutrimuscle' AND c.name = 'Nutrition';

INSERT INTO products (name, brand_id, category_id, description, price, affiliate_url, image_url, is_glp1_recommended, tags, rating) 
SELECT 
  'Vitamine B Complex Nutrimuscle',
  b.id,
  c.id,
  'Complexe de vitamines B pour soutenir le métabolisme énergétique pendant les traitements de perte de poids.',
  18.90,
  'https://nutrimuscle.com/vitamine-b-complex?ref=GLP1_NUTRITION',
  '/images/products/nutrimuscle-vitamine-b.jpg',
  true,
  ARRAY['vitamines B', 'énergie', 'métabolisme', 'fatigue'],
  4.2
FROM brands b, product_categories c 
WHERE b.name = 'Nutrimuscle' AND c.name = 'Nutrition';

INSERT INTO products (name, brand_id, category_id, description, price, affiliate_url, image_url, is_glp1_recommended, tags, rating) 
SELECT 
  'Oméga 3 EPA/DHA Nutrimuscle',
  b.id,
  c.id,
  'Oméga 3 de qualité pharmaceutique pour soutenir la santé cardiovasculaire pendant la perte de poids.',
  29.90,
  'https://nutrimuscle.com/omega-3?ref=GLP1_NUTRITION',
  '/images/products/nutrimuscle-omega3.jpg',
  true,
  ARRAY['oméga 3', 'cardiovasculaire', 'EPA', 'DHA'],
  4.7
FROM brands b, product_categories c 
WHERE b.name = 'Nutrimuscle' AND c.name = 'Nutrition';

-- Insertion des deals/promotions actives
INSERT INTO deals (title, brand_id, product_id, discount_percentage, promo_code, commission_percentage, end_date) 
SELECT 
  'Promotion Talika - Soins GLP-1',
  b.id,
  NULL, -- Promotion sur toute la marque
  10.00,
  'GLP1SOIN',
  8.00,
  NOW() + INTERVAL '3 months'
FROM brands b 
WHERE b.name = 'Talika';

INSERT INTO deals (title, brand_id, product_id, discount_percentage, promo_code, commission_percentage, end_date) 
SELECT 
  'Offre Nutrimuscle - Nutrition GLP-1',
  b.id,
  NULL, -- Promotion sur toute la marque
  5.00,
  'GLP1NUTRI',
  5.00,
  NOW() + INTERVAL '2 months'
FROM brands b 
WHERE b.name = 'Nutrimuscle';

-- Deal spécifique sur le magnésium (produit populaire)
INSERT INTO deals (title, brand_id, product_id, discount_percentage, promo_code, commission_percentage, end_date) 
SELECT 
  'Magnésium Spécial GLP-1',
  b.id,
  p.id,
  15.00,
  'MAGNESIUM15',
  7.00,
  NOW() + INTERVAL '1 month'
FROM brands b, products p 
WHERE b.name = 'Nutrimuscle' AND p.name = 'Magnésium Bisglycinate Nutrimuscle';

-- Insertion de quelques statistiques d'exemple (données des 30 derniers jours)
INSERT INTO affiliate_stats (brand_id, date, clicks, conversions, revenue, commission)
SELECT 
  b.id,
  CURRENT_DATE - INTERVAL '1 day' * generate_series(1, 30),
  floor(random() * 100 + 10)::INTEGER,
  floor(random() * 5 + 1)::INTEGER,
  round((random() * 500 + 50)::NUMERIC, 2),
  round((random() * 40 + 5)::NUMERIC, 2)
FROM brands b;

-- Mise à jour des compteurs sur les deals
UPDATE deals SET 
  click_count = floor(random() * 500 + 50),
  conversion_count = floor(random() * 25 + 5),
  revenue = round((random() * 2000 + 200)::NUMERIC, 2)
WHERE is_active = true;
