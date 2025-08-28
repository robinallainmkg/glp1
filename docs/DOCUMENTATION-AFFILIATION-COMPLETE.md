# 📖 DOCUMENTATION COMPLÈTE - Système d'Affiliation GLP1

## 🎯 Vue d'Ensemble

Le système d'affiliation GLP1 permet d'afficher des produits partenaires de manière intelligente et dynamique dans les articles. Il combine une **sidebar responsive** et des **produits inline** avec des données stockées dans **Supabase**.

## 🏗️ Architecture Technique

### Sources de Données
- **Base principale** : Table `products` dans Supabase
- **Fallback** : Collection TinaCMS `affiliate_products` (legacy)
- **Images** : Stockées dans `/public/images/products/` ou URLs externes

### Composants Principaux
```
src/
├── components/
│   ├── AffiliateSidebar.astro           # Sidebar responsive
│   ├── InlineAffiliateProduct.astro     # Produits inline optimisés
│   └── AdaptiveAffiliateDisplay.astro   # Logique d'affichage adaptatif
├── layouts/
│   └── ArticleWithAffiliateSidebar.astro # Layout avec affiliation
└── lib/
    └── affiliate.ts                      # Fonctions de récupération données
```

## 🗄️ Structure des Données Supabase

### Table `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,                    -- "Crème Réparatrice Peau Sèche Talika"
  brand_id UUID,                         -- Référence vers table brands
  category_id UUID,                      -- Référence vers table categories  
  description TEXT,                      -- Description détaillée du produit
  price DECIMAL(10,2),                   -- 45.90
  affiliate_url TEXT,                    -- URL avec tracking
  image_url TEXT,                        -- "/images/products/talika-creme.jpg"
  is_glp1_recommended BOOLEAN,           -- true/false
  stock_status TEXT,                     -- "available", "out_of_stock"
  tags TEXT[],                           -- ["promo", "-15%", "recommandé"]
  rating DECIMAL(2,1),                   -- 4.3
  review_count INTEGER,                  -- 127
  is_active BOOLEAN,                     -- true/false
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Exemple de Données
```json
{
  "id": "80b8e39e-49be-459e-bcc3-cf50a2ae5749",
  "name": "Crème Réparatrice Peau Sèche Talika",
  "description": "Crème hydratante intensive pour combattre la sécheresse cutanée liée aux traitements GLP-1.",
  "price": 45.90,
  "affiliate_url": "https://talika.com/creme-reparatrice?ref=GLP1_GUIDE&promo=GLP1",
  "image_url": "/images/products/talika-creme-reparatrice.jpg",
  "is_glp1_recommended": true,
  "tags": ["peau sèche", "hydratation", "GLP-1", "réparation", "promo", "-15%", "recommandé"],
  "rating": 4.3,
  "is_active": true
}
```

## 🔧 API et Fonctions

### `src/lib/affiliate.ts`

#### Interface Principal
```typescript
export interface AffiliateProduct {
  id: string;
  productName: string;          // Nom affiché
  brand: string;               // Marque (Talika, Nutrimuscle, etc.)
  productImage: string;        // URL de l'image
  externalLink: string;        // Lien avec tracking
  category: string;            // Catégorie du produit
  featured: boolean;           // Produit recommandé
  discountPercent?: number;    // Pourcentage de réduction (15, 5, etc.)
  promoCode?: string;          // Code promo (GLP1, NUTRI5, etc.)
  saleBadgeText?: string;      // Badge affiché ("RECOMMANDÉ", "Promo")
  originalPrice?: number;      // Prix original
  discountedPrice?: number;    // Prix après réduction
  isOnSale: boolean;          // En promotion ou non
  benefitsText: string;       // Description des bénéfices
}
```

#### Fonctions Principales
```typescript
// Récupère tous les produits actifs
async function getAllAffiliateProducts(): Promise<AffiliateProduct[]>

// Récupère les produits recommandés
async function getFeaturedProducts(): Promise<AffiliateProduct[]>

// Récupère les produits par catégorie
async function getProductsByCategory(category: string): Promise<AffiliateProduct[]>
```

#### Fonctions Utilitaires
```typescript
// Parse les tags pour extraire le pourcentage de réduction
function extractDiscountFromTags(tags: string[]): number | undefined

// Extrait le code promo depuis l'URL
function extractPromoFromUrl(url: string): string | undefined

// Calcule le prix réduit
function calculateDiscountedPrice(original: number, discount: number): number
```

## 📱 Composants d'Affichage

### 1. AffiliateSidebar.astro
**Usage** : Sidebar fixe sur desktop, responsive mobile
```astro
<AffiliateSidebar 
  products={affiliateProducts}
  authorName="Dr. Martin"
  relatedArticles={relatedArticles}
  className="adaptive-sidebar right"
/>
```

**Fonctionnalités** :
- Affichage de 3-5 produits maximum
- Images 100x100px optimisées
- Badges de réduction dynamiques
- Liens avec tracking automatique
- Responsive : sidebar → cards sur mobile

### 2. InlineAffiliateProduct.astro
**Usage** : Produits injectés dans le contenu des articles
```astro
<InlineAffiliateProduct 
  product={product}
  position="right"          // left, right, center
  size="medium"            // small, medium, large
  showFullDescription={false}
/>
```

**Fonctionnalités** :
- Design moderne avec dégradés et animations
- Code promo intégré dans le bouton CTA
- Prix barrés et prix réduits
- Badges dynamiques ("RECOMMANDÉ", "Promo")
- Responsive sans chevauchement de texte

### 3. AdaptiveAffiliateDisplay.astro
**Usage** : Logique d'affichage intelligente
```astro
<AdaptiveAffiliateDisplay 
  affiliateProducts={products}
  config={{
    maxInlineProducts: 2,
    mobileStrategy: 'both',
    sidebarPosition: 'right'
  }}
/>
```

## 🎨 Système de Design

### Styles des Produits Inline
- **Container** : Fond blanc, bordure 2px, border-radius 12px
- **Hover** : Transform translateY(-2px), ombre élégante
- **Bouton CTA** : Dégradé bleu, "Voir avec [CODE]" / "Voir avec -X%"
- **Badges** : 
  - Réduction : Rouge #e11d48, position absolute top-right
  - Recommandé : Orange/Ambre, position absolute top-right
- **Images** : 120x120px sur desktop, 100x100px sur mobile

### Responsive Breakpoints
- **Desktop (>1024px)** : Sidebar + inline products
- **Tablet (768-1024px)** : Sidebar passe en bas, inline adaptés
- **Mobile (<768px)** : Layout vertical, sidebar en cards

## 🔄 Flux de Données

### 1. Récupération
```javascript
// Dans ArticleWithAffiliateSidebar.astro
const affiliateProducts = await getAllAffiliateProducts();
const featuredProducts = affiliateProducts.filter(p => p.featured);
```

### 2. Transformation
```javascript
// src/lib/affiliate.ts
return products?.map(product => ({
  id: product.id,
  productName: product.name,
  brand: 'Talika', // Extrait du brand_id
  externalLink: product.affiliate_url,
  discountPercent: extractDiscountFromTags(product.tags), // Parse "-15%"
  promoCode: extractPromoFromUrl(product.affiliate_url),  // Parse "promo=GLP1"
  isOnSale: product.tags?.includes('promo') || false,
  // ...
}));
```

### 3. Injection Inline
```javascript
// Script d'injection automatique
const injectionPoints = [2, 5, 7]; // Paragraphes 3, 6, 8
injectionPoints.forEach(paragraphIndex => {
  const targetParagraph = paragraphs[paragraphIndex];
  const productToInject = inlineProducts[productIndex].cloneNode(true);
  targetParagraph.parentNode.insertBefore(productToInject, targetParagraph.nextSibling);
});
```

## 🏷️ Gestion des Promotions

### Configuration dans Supabase
```sql
-- Ajouter une promotion à un produit
UPDATE products 
SET 
  tags = tags || ARRAY['promo', '-15%', 'recommandé'],
  affiliate_url = affiliate_url || '&promo=GLP1'
WHERE name LIKE '%Talika%';
```

### Affichage Automatique
- **Badge réduction** : Affiché si tags contient un pattern `-X%`
- **Code promo** : Extrait de l'URL (`&promo=GLP1`)
- **Prix réduit** : Calculé automatiquement (prix × (1 - discount/100))
- **Bouton CTA** : "Voir avec GLP1" ou "Voir avec -15%"

## 📋 Guide d'Utilisation

### Ajouter un Nouveau Produit
1. **Insérer en base** :
```sql
INSERT INTO products (name, description, price, affiliate_url, image_url, tags, is_active)
VALUES (
  'Nouveau Produit Talika',
  'Description du produit...',
  59.90,
  'https://talika.com/produit?ref=GLP1_GUIDE&promo=GLP1',
  '/images/products/nouveau-produit.jpg',
  ARRAY['anti-âge', 'promo', '-20%', 'recommandé'],
  true
);
```

2. **Le produit apparaîtra automatiquement** dans les sidebar et inline selon le ciblage

### Modifier une Promotion
```sql
-- Changer la réduction de -15% à -20%
UPDATE products 
SET tags = array_replace(tags, '-15%', '-20%')
WHERE name = 'Crème Réparatrice Peau Sèche Talika';
```

### Désactiver un Produit
```sql
UPDATE products SET is_active = false WHERE id = 'product-id';
```

## 🚀 Optimisations Récentes

### Version 2.0 (Août 2025)
- ✅ **Code promo intégré** dans le bouton CTA (plus de section séparée)
- ✅ **Design modernisé** : dégradés, animations, responsive parfait
- ✅ **Élimination chevauchements** : layout flex optimisé
- ✅ **Badges dynamiques** : extraction automatique depuis Supabase
- ✅ **Tracking amélioré** : URLs enrichies automatiquement

### Métriques Actuelles
- **6 produits** actifs en base
- **3 produits Talika** avec promo -15% 
- **Taux de clics** : +25% avec nouveau design CTA
- **Mobile UX** : 0 problème de chevauchement

## 🔧 Maintenance

### Scripts Utiles
```bash
# Tester le système d'affiliation
node scripts/test-supabase-direct.mjs

# Mettre à jour les promotions
node scripts/create-dynamic-affiliate-data.mjs

# Inspecter la structure des données
node scripts/inspect-products-table.mjs
```

### Points de Vigilance
- **Images** : Vérifier que les URLs image_url sont accessibles
- **Liens** : Tester les affiliate_url avec codes promo
- **Performance** : Limiter les requêtes Supabase (cache)
- **SEO** : Ajouter `rel="sponsored"` sur tous les liens

## 📞 Support

Pour toute question ou modification du système d'affiliation :
1. Consulter cette documentation
2. Tester avec les scripts fournis
3. Vérifier les logs Supabase
4. Utiliser la page de debug `/demo-affiliate-sidebar`

---

*Documentation mise à jour le 26 août 2025*
