-- Migration des produits d'affiliation vers Supabase
-- Script à exécuter dans l'éditeur SQL de Supabase

-- 0. Sauvegarder la table deals si elle existe et contient des données importantes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals' AND table_schema = 'public') THEN
        -- Créer une sauvegarde
        DROP TABLE IF EXISTS deals_backup;
        CREATE TABLE deals_backup AS SELECT * FROM public.deals;
        RAISE NOTICE 'Table deals sauvegardée dans deals_backup';
    END IF;
END $$;

-- 1. Supprimer la table existante et ses dépendances si elles existent
DROP TABLE IF EXISTS public.products CASCADE;

-- 2. Créer la nouvelle table products avec tous les champs nécessaires
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informations de base
    title TEXT NOT NULL,
    product_id TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    
    -- Images et liens
    product_image TEXT,
    external_link TEXT NOT NULL,
    
    -- Pricing et promo
    price DECIMAL(10,2),
    discount_percent INTEGER,
    discount_code TEXT,
    
    -- Metadata
    featured BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 999,
    slug TEXT,
    
    -- Rich content
    benefits_text TEXT, -- HTML content
    description TEXT,   -- Plain text description
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Créer les index pour les performances
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_priority ON public.products(priority);
CREATE INDEX idx_products_product_id ON public.products(product_id);

-- 4. Activer Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS
-- Lecture publique (pour le site web)
CREATE POLICY "Allow public read access" ON public.products
    FOR SELECT USING (true);

-- Écriture pour les utilisateurs authentifiés seulement
CREATE POLICY "Allow authenticated users to insert" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Insérer les données existantes des fichiers MD
INSERT INTO public.products (
    title,
    product_id,
    brand,
    category,
    product_image,
    external_link,
    price,
    discount_percent,
    discount_code,
    featured,
    priority,
    slug,
    benefits_text,
    description
) VALUES 
-- Talika Time Control 7+
(
    'Time Control 7+ - Talika',
    'talika-time-control-7-plus',
    'Talika',
    'Soin anti-âge',
    '/images/products/talika-time-control-7.jpg',
    'https://talika.fr/GLP1',
    52.00,
    15,
    'GLP1',
    true,
    2,
    'talika-time-control-7-plus',
    '<div class="benefits-highlight">
    <p><strong>⏰ Anti-âge révolutionnaire :</strong> Corrige tous les signes de l''âge pendant votre transformation.</p>
    <ul class="benefits-list">
      <li>✅ <strong>7 actions anti-âge</strong> ciblées</li>
      <li>✅ <strong>Rides et ridules</strong> atténuées</li>
      <li>✅ <strong>Fermeté retrouvée</strong> visiblement</li>
      <li>✅ <strong>Éclat jeunesse</strong> instantané</li>
    </ul>
  </div>',
    'Soin anti-âge révolutionnaire qui cible 7 signes de vieillissement. Formule avancée pour une peau plus ferme et éclatante après une perte de poids.'
),

-- Talika Bust Phytoserum
(
    'Bust Phytoserum - Talika',
    'talika-bust-phytoserum',
    'Talika',
    'Soin raffermissant',
    '/images/products/talika-bust-phytoserum.jpg',
    'https://talika.fr/GLP1',
    45.90,
    15,
    'GLP1',
    true,
    3,
    'talika-bust-phytoserum',
    '<div class="benefits-highlight">
    <p><strong>🌿 Sérum raffermissant :</strong> Redonne fermeté et tonicité au décolleté après perte de poids.</p>
    <ul class="benefits-list">
      <li>✅ <strong>Raffermissement visible</strong></li>
      <li>✅ <strong>Extraits végétaux</strong> actifs</li>
      <li>✅ <strong>Élasticité retrouvée</strong></li>
      <li>✅ <strong>Zone décolleté tonifiée</strong></li>
    </ul>
  </div>',
    'Sérum raffermissant spécialement formulé pour tonifier et raffermir la peau du décolleté après une perte de poids importante.'
),

-- Nutrimuscle Whey Native
(
    'Whey Native - Nutrimuscle',
    'nutrimuscle-whey-native',
    'Nutrimuscle',
    'Complément',
    '/images/products/whey-native.webp',
    'https://nutrimuscle.fr/GLP1',
    89.90,
    12,
    'GLP1',
    true,
    3,
    'nutrimuscle-whey-native',
    '<div class="benefits-highlight">
    <p><strong>🏆 Protéine premium :</strong> Préserve et développe la masse musculaire pendant la perte de poids.</p>
    <ul class="benefits-list">
      <li>✅ <strong>Protéine native</strong> non dénaturée</li>
      <li>✅ <strong>Préservation musculaire</strong> garantie</li>
      <li>✅ <strong>Digestion facile</strong> avec GLP-1</li>
      <li>✅ <strong>Sans additifs</strong> artificiels</li>
    </ul>
  </div>',
    'Protéine de lactosérum native premium pour préserver la masse musculaire pendant la perte de poids avec les GLP-1.'
),

-- Nutrimuscle Glutamine
(
    'Glutamine - Nutrimuscle',
    'nutrimuscle-glutamine',
    'Nutrimuscle',
    'Complément',
    '/images/products/glutamine.webp',
    'https://nutrimuscle.fr/GLP1',
    34.90,
    12,
    'GLP1',
    true,
    4,
    'nutrimuscle-glutamine',
    '<div class="benefits-highlight">
    <p><strong>💪 Récupération optimale :</strong> Aide à la récupération et au maintien de la masse musculaire.</p>
    <ul class="benefits-list">
      <li>✅ <strong>Récupération accélérée</strong></li>
      <li>✅ <strong>Protection musculaire</strong></li>
      <li>✅ <strong>Digestion améliorée</strong></li>
      <li>✅ <strong>Qualité pharmaceutique</strong></li>
    </ul>
  </div>',
    'Glutamine de qualité pharmaceutique pour optimiser la récupération et préserver la masse musculaire.'
);

-- 7. Créer une vue pour faciliter les requêtes (optionnel)
CREATE VIEW public.products_display AS
SELECT 
    id,
    title,
    product_id,
    brand,
    category,
    product_image,
    external_link,
    price,
    discount_percent,
    discount_code,
    featured,
    priority,
    slug,
    benefits_text,
    description,
    -- Prix calculé avec remise
    CASE 
        WHEN discount_percent IS NOT NULL AND discount_percent > 0 
        THEN ROUND(price * (1 - discount_percent::decimal / 100), 2)
        ELSE price
    END AS discounted_price,
    -- Badge de promotion
    CASE 
        WHEN discount_percent IS NOT NULL AND discount_percent > 0 
        THEN CONCAT('-', discount_percent, '%')
        ELSE NULL
    END AS discount_badge,
    -- Statut promo
    CASE 
        WHEN discount_percent IS NOT NULL AND discount_percent > 0 
        THEN true
        ELSE false
    END AS is_on_sale,
    created_at,
    updated_at
FROM public.products
ORDER BY priority ASC, featured DESC, created_at DESC;

-- 8. Créer une fonction pour auto-update des timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Créer le trigger pour auto-update
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Afficher les données insérées pour vérification
SELECT 
    title,
    brand,
    price,
    discount_percent,
    ROUND(price * (1 - COALESCE(discount_percent, 0)::decimal / 100), 2) as discounted_price,
    featured
FROM public.products 
ORDER BY priority ASC;
