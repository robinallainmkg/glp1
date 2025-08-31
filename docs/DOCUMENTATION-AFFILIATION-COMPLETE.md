# 📖 DOCUMENTATION COMPLÈTE - Système d'Affiliation GLP1

**Dernière mise à jour** : 31 août 2025  
**Statut** : ✅ Opérationnel en production  

## 🎯 Vue d'Ensemble

Le système d'affiliation GLP1 permet d'afficher des produits partenaires de manière intelligente et dynamique dans les articles. Il combine une **sidebar responsive** et des **produits inline** configurables avec des données stockées dans **Supabase**.

### 🔧 Nouveautés (31/08/2025)
- ✅ **AdaptiveAffiliateDisplay** : Composant unifié avec logique sidebar + inline
- ✅ **Configuration flexible** : Props `forceSidebar` et `disableInline`
- ✅ **Page diagnostic optimisée** : Sidebar uniquement, sans produits inline
- ✅ **4 produits actifs** : Base Supabase opérationnelle

## 🏗️ Architecture Technique

### Sources de Données
- **Base principale** : Table `products` dans Supabase (4 produits actifs)
- **Fallback** : Collection TinaCMS `affiliate_products` (legacy)
- **Images** : Stockées dans `/public/images/products/` ou URLs externes

### Composants Principaux
```
src/
├── components/
│   ├── AffiliateSidebar.astro           # Sidebar responsive (4 produits)
│   ├── InlineAffiliateProduct.astro     # Produits inline optimisés
│   └── AdaptiveAffiliateDisplay.astro   # ⭐ NOUVEAU - Logique unifiée
├── layouts/
│   └── ArticleWithAffiliateSidebar.astro # Layout avec affiliation (sidebar seule)
└── lib/
    └── affiliate.ts                      # Fonctions de récupération données
```

## 🗄️ Structure des Données Supabase (Actuelle - 31/08/2025)

### Table `products` - Structure Réelle
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,                   -- '7813acb7-0a63-4dab-98b8-5c9b91844dff'
  title TEXT NOT NULL,                   -- 'Glutamine - Nutrimuscle'
  product_id TEXT UNIQUE,                -- 'nutrimuscle-glutamine'
  brand TEXT,                            -- 'Nutrimuscle'
  category TEXT,                         -- 'Complément'
  product_image TEXT,                    -- '/images/products/glutamine.webp'
  external_link TEXT,                    -- URL avec tracking affilié
  price DECIMAL(10,2),                   -- 34.9
  discount_percent INTEGER,              -- 5
  discount_code TEXT,                    -- 'NMA_GLP1'
  featured BOOLEAN,                      -- true
  priority INTEGER,                      -- 4 (ordre affichage)
  slug TEXT,                             -- 'nutrimuscle-glutamine'
  benefits_text TEXT,                    -- HTML formaté avantages
  description TEXT,                      -- Description produit
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### 📊 Données Actuelles (4 Produits Actifs)
```json
{
  "id": "7813acb7-0a63-4dab-98b8-5c9b91844dff",
  "title": "Glutamine - Nutrimuscle",
  "product_id": "nutrimuscle-glutamine",
  "brand": "Nutrimuscle",
  "category": "Complément",
  "product_image": "/images/products/glutamine.webp",
  "external_link": "https://www.nutrimuscle.com/NMA_GLP1?redirect=/products/glutamine-l-glutamine-en-poudre",
  "price": 34.9,
  "discount_percent": 5,
  "discount_code": "NMA_GLP1",
  "featured": true,
  "priority": 4,
  "benefits_text": "<div class=\"benefits-highlight\">\n    <p><strong>💪 Récupération optimale :</strong> Aide à la récupération et au maintien de la masse musculaire.</p>\n    <ul class=\"benefits-list\">\n      <li>✅ <strong>Récupération accélérée</strong></li>\n      <li>✅ <strong>Protection musculaire</strong></li>\n      <li>✅ <strong>Digestion améliorée</strong></li>\n      <li>✅ <strong>Qualité pharmaceutique</strong></li>\n    </ul>\n  </div>",
  "description": "Glutamine de qualité pharmaceutique pour optimiser la récupération et préserver la masse musculaire."
}
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

### 3. AdaptiveAffiliateDisplay.astro ⭐ NOUVEAU
**Usage** : Composant unifié avec logique d'affichage intelligente (31/08/2025)

```astro
<AdaptiveAffiliateDisplay 
  products={affiliateProducts}
  forceSidebar={true}              // Force affichage sidebar
  disableInline={true}             // Désactive produits inline
  maxSidebarProducts={4}           // Limite produits sidebar (optionnel)
  maxInlineProducts={2}            // Limite inline si activés (optionnel)
/>
```

**Props disponibles** :
- `products` : Array des produits Supabase
- `forceSidebar` : Boolean - Force l'affichage de la sidebar
- `disableInline` : Boolean - Désactive l'affichage inline
- `maxSidebarProducts` : Number - Limite produits sidebar (défaut: tous)
- `maxInlineProducts` : Number - Limite produits inline (défaut: 2)

**Cas d'usage** :
- **Page diagnostic** : `forceSidebar={true}` + `disableInline={true}`
- **Articles standards** : `forceSidebar={false}` + `disableInline={false}`
- **Pages spéciales** : Configuration personnalisée selon besoin
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

### 🎯 Layouts Disponibles

#### 1. ArticleWithAffiliateSidebar.astro
**Usage** : Pages nécessitant sidebar uniquement (comme page diagnostic)
```astro
---
// src/pages/guides/quel-traitement-glp1-choisir.astro
layout: '../../layouts/ArticleWithAffiliateSidebar.astro'
title: "Quel traitement GLP-1 choisir ?"
---

<h1>Contenu de votre page</h1>
<p>La sidebar sera automatiquement ajoutée avec les 4 produits Supabase</p>
```

**Configuration automatique** :
- `forceSidebar={true}` : Sidebar toujours affichée
- `disableInline={true}` : Pas de produits inline dans le contenu
- Chargement automatique des produits Supabase

#### 2. Layout Standard avec Affiliation
**Usage** : Articles avec sidebar + produits inline
```astro
---
import AdaptiveAffiliateDisplay from '../components/AdaptiveAffiliateDisplay.astro';
import { getAffiliateProducts } from '../lib/affiliate.ts';

const affiliateProducts = await getAffiliateProducts();
---

<article>
  <h1>Votre article</h1>
  <p>Contenu...</p>
  
  <AdaptiveAffiliateDisplay 
    products={affiliateProducts}
    forceSidebar={false}
    disableInline={false}
  />
</article>
```

### Ajouter un Nouveau Produit
1. **Insérer en base** :
```sql
INSERT INTO products (title, product_id, brand, category, description, price, external_link, product_image, discount_percent, discount_code, featured, priority)
VALUES (
  'Nouveau Produit Complément',
  'nouveau-produit-slug',
  'Marque',
  'Complément',
  'Description du produit...',
  59.90,
  'https://exemple.com/produit?ref=GLP1&promo=CODE',
  '/images/products/nouveau-produit.webp',
  10,
  'CODE',
  true,
  5
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
