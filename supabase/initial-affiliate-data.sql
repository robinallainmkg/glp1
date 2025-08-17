-- Script SQL pour créer les données initiales d'affiliation
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Insérer les catégories de produits
INSERT INTO product_categories (name, slug, description, glp1_relevant) VALUES
('Compléments Digestifs', 'complements-digestifs', 'Produits pour améliorer la digestion et réduire les troubles gastro-intestinaux', true),
('Anti-nausées', 'anti-nausees', 'Produits naturels pour lutter contre les nausées et vomissements', true),
('Soins de la Peau', 'soins-peau', 'Cosmétiques et produits de beauté', false),
('Nutrition Sportive', 'nutrition-sportive', 'Compléments alimentaires pour le sport et la performance', false)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insérer les marques partenaires
INSERT INTO brands (name, slug, website_url, discount_percentage, commission_percentage, affiliate_code, description, contact_email, is_active) VALUES
('Talika', 'talika', 'https://www.talika.com', 10, 15, 'GLP1FRANCE', 'Leader mondial en cosmétique et compléments beauté premium. Spécialisé dans les soins anti-âge et les cils.', 'partenariat@talika.com', true),
('Nutrimuscle', 'nutrimuscle', 'https://www.nutrimuscle.com', 5, 15, 'GLP1FRANCE', 'Compléments alimentaires de qualité pharmaceutique pour la nutrition sportive et la santé.', 'partenariat@nutrimuscle.com', true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insérer les produits (avec les IDs des marques et catégories)
WITH brand_talika AS (SELECT id FROM brands WHERE slug = 'talika'),
     brand_nutrimuscle AS (SELECT id FROM brands WHERE slug = 'nutrimuscle'),
     cat_digestif AS (SELECT id FROM product_categories WHERE slug = 'complements-digestifs'),
     cat_anti_nausees AS (SELECT id FROM product_categories WHERE slug = 'anti-nausees'),
     cat_soins AS (SELECT id FROM product_categories WHERE slug = 'soins-peau'),
     cat_nutrition AS (SELECT id FROM product_categories WHERE slug = 'nutrition-sportive')

INSERT INTO products (brand_id, category_id, name, slug, description, price, currency, affiliate_url, glp1_benefit, side_effects_help, recommended_for, stock_status, is_featured, is_active) VALUES
-- Produits Talika
((SELECT id FROM brand_talika), (SELECT id FROM cat_soins), 'Talika Lash Conditioning Cleanser', 'talika-lash-conditioning-cleanser', 'Démaquillant doux qui fortifie les cils tout en nettoyant. Idéal pendant les traitements GLP-1 pour maintenir une routine beauté simple.', 24.90, 'EUR', 'https://www.talika.com/fr/lash-conditioning-cleanser', 'Routine beauté simplifiée, évite les irritations oculaires', true, ARRAY['fatigue', 'yeux-secs'], 'in_stock', true, true),

((SELECT id FROM brand_talika), (SELECT id FROM cat_soins), 'Talika Bio Enzymes Mask', 'talika-bio-enzymes-mask', 'Masque anti-âge aux bio-enzymes. Parfait pour revitaliser la peau fatiguée pendant les traitements.', 39.90, 'EUR', 'https://www.talika.com/fr/bio-enzymes-mask', 'Redonne éclat et tonus à la peau fatiguée', true, ARRAY['fatigue', 'peau-terne'], 'in_stock', false, true),

-- Produits Nutrimuscle
((SELECT id FROM brand_nutrimuscle), (SELECT id FROM cat_digestif), 'Nutrimuscle Probiotiques', 'nutrimuscle-probiotiques', 'Probiotiques de qualité pharmaceutique pour restaurer la flore intestinale. Spécialement recommandé avec les traitements GLP-1.', 29.90, 'EUR', 'https://www.nutrimuscle.com/probiotiques', 'Améliore la digestion et réduit les troubles intestinaux', true, ARRAY['ballonnements', 'diarrhée', 'constipation'], 'in_stock', true, true),

((SELECT id FROM brand_nutrimuscle), (SELECT id FROM cat_anti_nausees), 'Nutrimuscle Gingembre Bio', 'nutrimuscle-gingembre-bio', 'Gingembre bio en gélules pour lutter naturellement contre les nausées. Très efficace avec les GLP-1.', 19.90, 'EUR', 'https://www.nutrimuscle.com/gingembre-bio', 'Réduit significativement les nausées', true, ARRAY['nausées', 'vomissements'], 'in_stock', true, true),

((SELECT id FROM brand_nutrimuscle), (SELECT id FROM cat_nutrition), 'Nutrimuscle Multivitamines', 'nutrimuscle-multivitamines', 'Complexe multivitaminé pour compenser les carences nutritionnelles pendant la perte de poids.', 24.90, 'EUR', 'https://www.nutrimuscle.com/multivitamines', 'Prévient les carences pendant la perte de poids', true, ARRAY['fatigue', 'carences'], 'in_stock', false, true)

ON CONFLICT (slug) DO NOTHING;

-- 4. Créer les deals
WITH brand_talika AS (SELECT id FROM brands WHERE slug = 'talika'),
     brand_nutrimuscle AS (SELECT id FROM brands WHERE slug = 'nutrimuscle')

INSERT INTO deals (brand_id, title, description, discount_type, discount_value, promo_code, is_active) VALUES
((SELECT id FROM brand_talika), 'Talika - 10% de réduction', 'Profitez de 10% de réduction sur tous les produits Talika avec notre code partenaire', 'percentage', 10, 'GLP1FRANCE10', true),
((SELECT id FROM brand_nutrimuscle), 'Nutrimuscle - 5% de réduction', 'Économisez 5% sur vos compléments Nutrimuscle avec notre partenariat exclusif', 'percentage', 5, 'GLP1FRANCE5', true);

-- 5. Vérifier les données insérées
SELECT 'Marques' as type, COUNT(*) as count FROM brands WHERE is_active = true
UNION ALL
SELECT 'Catégories' as type, COUNT(*) as count FROM product_categories
UNION ALL
SELECT 'Produits' as type, COUNT(*) as count FROM products WHERE is_active = true
UNION ALL
SELECT 'Deals' as type, COUNT(*) as count FROM deals WHERE is_active = true;
