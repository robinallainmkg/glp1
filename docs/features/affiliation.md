# Système d'Affiliation - GLP-1 France

## 📋 Vue d'ensemble

Documentation complète du système d'affiliation intégré au site GLP-1 France, incluant la gestion des produits, le tracking et l'optimisation.

## 🎯 Objectifs du Système

### Monétisation
- **Produits ciblés** : Compléments minceur, balances connectées, appareils fitness
- **Taux de conversion** : Optimisation via placement stratégique
- **Revenus passifs** : Intégration naturelle dans le contenu

### User Experience
- **Intégration seamless** : Produits pertinents selon le contexte
- **Trust building** : Avis authentiques et transparence
- **Value-first** : Information avant vente

## 🛍️ Gestion des Produits

### Structure des Données

```typescript
interface AffiliateProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount_price?: number;
  affiliate_url: string;
  promo_code?: string;
  description: string;
  image_url: string;
  category: string;
  tags: string[];
  rating: number;
  reviews_count: number;
  placement_rules: PlacementRule[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlacementRule {
  pages: string[];           // Pages où afficher
  position: string;          // sidebar, inline, footer
  priority: number;          // Ordre d'affichage
  conditions?: Condition[];  // Conditions d'affichage
}
```

### Fichier de Configuration

```json
// data/affiliate-products.json
{
  "products": [
    {
      "id": "balance-xiaomi-s400",
      "name": "Balance Connectée Xiaomi Mi Body Composition Scale 2",
      "brand": "Xiaomi",
      "price": 39.99,
      "discount_price": 29.99,
      "affiliate_url": "https://amzn.to/3XYZ123",
      "promo_code": "GLPBALANCE",
      "description": "Balance intelligente avec analyse complète...",
      "image_url": "/images/products/xiaomi-balance.jpg",
      "category": "balance",
      "tags": ["suivi-poids", "connecte", "app"],
      "rating": 4.5,
      "reviews_count": 2847,
      "placement_rules": [
        {
          "pages": [
            "/collections/glp1-perte-de-poids/",
            "/collections/avant-apres-glp1/"
          ],
          "position": "sidebar",
          "priority": 1
        }
      ],
      "is_active": true
    }
  ]
}
```

## 🎨 Composants d'Affichage

### AffiliateProduct.astro

```astro
---
// components/AffiliateProduct.astro
interface Props {
  product: AffiliateProduct;
  placement: 'sidebar' | 'inline' | 'footer';
  showDiscount?: boolean;
  compact?: boolean;
}

const { product, placement, showDiscount = true, compact = false } = Astro.props;

const discountPercent = product.discount_price 
  ? Math.round((1 - product.discount_price / product.price) * 100)
  : 0;
---

<div class={`affiliate-product affiliate-product--${placement} ${compact ? 'affiliate-product--compact' : ''}`}>
  {showDiscount && product.discount_price && (
    <div class="affiliate-product__badge">
      -{discountPercent}%
    </div>
  )}
  
  <div class="affiliate-product__image">
    <img 
      src={product.image_url} 
      alt={product.name}
      loading="lazy"
    />
  </div>
  
  <div class="affiliate-product__content">
    <h3 class="affiliate-product__title">{product.name}</h3>
    <p class="affiliate-product__brand">{product.brand}</p>
    
    {!compact && (
      <p class="affiliate-product__description">
        {product.description}
      </p>
    )}
    
    <div class="affiliate-product__rating">
      <span class="stars">★★★★★</span>
      <span class="reviews">({product.reviews_count} avis)</span>
    </div>
    
    <div class="affiliate-product__pricing">
      {product.discount_price ? (
        <>
          <span class="price price--original">{product.price}€</span>
          <span class="price price--discount">{product.discount_price}€</span>
        </>
      ) : (
        <span class="price">{product.price}€</span>
      )}
    </div>
    
    {product.promo_code && (
      <div class="affiliate-product__promo">
        <span class="promo-label">Code promo :</span>
        <code class="promo-code">{product.promo_code}</code>
      </div>
    )}
    
    <a 
      href={product.affiliate_url}
      class="affiliate-product__cta"
      target="_blank"
      rel="noopener nofollow"
      data-product-id={product.id}
      data-placement={placement}
    >
      Voir le produit
      <svg class="icon-external" width="16" height="16">
        <use href="#icon-external"></use>
      </svg>
    </a>
  </div>
</div>

<style>
  .affiliate-product {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    position: relative;
  }
  
  .affiliate-product:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59,130,246,0.15);
  }
  
  .affiliate-product--sidebar {
    max-width: 300px;
    margin-bottom: 2rem;
  }
  
  .affiliate-product--inline {
    display: flex;
    gap: 1rem;
    max-width: 100%;
  }
  
  .affiliate-product--footer {
    text-align: center;
  }
  
  .affiliate-product--compact {
    padding: 1rem;
  }
  
  .affiliate-product__badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ef4444;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 1;
  }
  
  .affiliate-product__image img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .affiliate-product--inline .affiliate-product__image {
    flex: 0 0 120px;
  }
  
  .affiliate-product__title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #1f2937;
  }
  
  .affiliate-product__brand {
    color: #6b7280;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .affiliate-product__description {
    color: #4b5563;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
  
  .affiliate-product__rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .stars {
    color: #fbbf24;
    font-size: 0.9rem;
  }
  
  .reviews {
    color: #6b7280;
    font-size: 0.8rem;
  }
  
  .affiliate-product__pricing {
    margin-bottom: 1rem;
  }
  
  .price {
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  .price--original {
    text-decoration: line-through;
    color: #9ca3af;
    margin-right: 0.5rem;
  }
  
  .price--discount {
    color: #ef4444;
  }
  
  .affiliate-product__promo {
    background: #f3f4f6;
    padding: 0.5rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.85rem;
  }
  
  .promo-label {
    color: #6b7280;
    margin-right: 0.5rem;
  }
  
  .promo-code {
    background: #1f2937;
    color: white;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    font-weight: 600;
  }
  
  .affiliate-product__cta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
    width: 100%;
    justify-content: center;
  }
  
  .affiliate-product__cta:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
  
  .icon-external {
    opacity: 0.8;
  }
</style>
```

## 🎯 Système de Placement

### Logique de Placement Automatique

```typescript
// utils/affiliate-manager.ts
export class AffiliateManager {
  constructor(private products: AffiliateProduct[]) {}
  
  getProductsForPage(
    pageUrl: string, 
    placement: string = 'sidebar',
    limit: number = 3
  ): AffiliateProduct[] {
    return this.products
      .filter(product => {
        if (!product.is_active) return false;
        
        return product.placement_rules.some(rule => {
          return rule.pages.some(page => pageUrl.includes(page)) &&
                 rule.position === placement;
        });
      })
      .sort((a, b) => {
        const aPriority = this.getPlacementPriority(a, pageUrl, placement);
        const bPriority = this.getPlacementPriority(b, pageUrl, placement);
        return bPriority - aPriority;
      })
      .slice(0, limit);
  }
  
  private getPlacementPriority(
    product: AffiliateProduct, 
    pageUrl: string, 
    placement: string
  ): number {
    const rule = product.placement_rules.find(rule => 
      rule.pages.some(page => pageUrl.includes(page)) &&
      rule.position === placement
    );
    
    return rule?.priority || 0;
  }
  
  trackClick(productId: string, placement: string): void {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'affiliate_click', {
        product_id: productId,
        placement: placement,
        page_url: window.location.pathname
      });
    }
    
    // Local tracking
    this.recordClick(productId, placement);
  }
  
  private recordClick(productId: string, placement: string): void {
    const clicks = JSON.parse(
      localStorage.getItem('affiliate_clicks') || '[]'
    );
    
    clicks.push({
      product_id: productId,
      placement: placement,
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname
    });
    
    // Garder seulement les 100 derniers clics
    if (clicks.length > 100) {
      clicks.splice(0, clicks.length - 100);
    }
    
    localStorage.setItem('affiliate_clicks', JSON.stringify(clicks));
  }
}
```

### Intégration dans les Pages

```astro
---
// pages/collections/[collection].astro
import { AffiliateManager } from '../../utils/affiliate-manager';
import affiliateProducts from '../../data/affiliate-products.json';

const { collection } = Astro.params;
const pageUrl = Astro.url.pathname;

const affiliateManager = new AffiliateManager(affiliateProducts.products);
const sidebarProducts = affiliateManager.getProductsForPage(pageUrl, 'sidebar', 2);
const inlineProducts = affiliateManager.getProductsForPage(pageUrl, 'inline', 1);
---

<BaseLayout>
  <main class="collection-page">
    <div class="content-grid">
      <article class="main-content">
        <!-- Contenu principal -->
        
        {inlineProducts.length > 0 && (
          <section class="affiliate-section affiliate-section--inline">
            <h3>Produits recommandés</h3>
            {inlineProducts.map(product => (
              <AffiliateProduct 
                product={product} 
                placement="inline"
                showDiscount={true}
              />
            ))}
          </section>
        )}
      </article>
      
      <aside class="sidebar">
        {sidebarProducts.length > 0 && (
          <section class="affiliate-section affiliate-section--sidebar">
            <h3>Nos recommandations</h3>
            {sidebarProducts.map(product => (
              <AffiliateProduct 
                product={product} 
                placement="sidebar"
                showDiscount={true}
              />
            ))}
          </section>
        )}
      </aside>
    </div>
  </main>
</BaseLayout>
```

## 📊 Analytics et Tracking

### Métriques Clés

```typescript
interface AffiliateMetrics {
  impressions: number;      // Affichages produit
  clicks: number;          // Clics sur liens
  conversion_rate: number; // Taux de clic
  revenue: number;         // Revenus estimés
  top_products: string[];  // Produits performants
  best_placements: string[]; // Emplacements efficaces
}
```

### Dashboard Analytics

```typescript
// utils/affiliate-analytics.ts
export class AffiliateAnalytics {
  generateReport(period: 'day' | 'week' | 'month' = 'week'): AffiliateMetrics {
    const clicks = this.getClicksForPeriod(period);
    const impressions = this.getImpressionsForPeriod(period);
    
    return {
      impressions: impressions.length,
      clicks: clicks.length,
      conversion_rate: impressions.length > 0 
        ? (clicks.length / impressions.length) * 100 
        : 0,
      revenue: this.calculateRevenue(clicks),
      top_products: this.getTopProducts(clicks),
      best_placements: this.getBestPlacements(clicks)
    };
  }
  
  private calculateRevenue(clicks: ClickEvent[]): number {
    // Estimation basée sur taux de conversion moyen
    const avgConversionRate = 0.03; // 3%
    const avgCommission = 15; // 15€ par vente
    
    return clicks.length * avgConversionRate * avgCommission;
  }
}
```

## 🎨 Styles et Design

### Intégration Design System

```css
/* styles/affiliate.css */
.affiliate-section {
  margin: 3rem 0;
}

.affiliate-section--inline {
  border-top: 2px solid #e5e7eb;
  border-bottom: 2px solid #e5e7eb;
  padding: 2rem 0;
  background: #f9fafb;
}

.affiliate-section--sidebar {
  position: sticky;
  top: 2rem;
}

.affiliate-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

/* Responsive design */
@media (max-width: 768px) {
  .affiliate-product--inline {
    flex-direction: column;
  }
  
  .affiliate-section--sidebar {
    position: static;
    margin-top: 2rem;
  }
}

/* Performance optimizations */
.affiliate-product img {
  content-visibility: auto;
  contain-intrinsic-size: 200px 150px;
}
```

## 🔧 Configuration et Maintenance

### Ajout de Nouveaux Produits

1. **Recherche produit** : Amazon, partenaires directs
2. **Test lien affilié** : Vérification commission
3. **Création assets** : Images, descriptions
4. **Configuration placement** : Pages et positions
5. **Test intégration** : Affichage et tracking
6. **Monitoring performance** : Analytics et optimisation

### Optimisation Continue

```typescript
// scripts/optimize-affiliate.mjs
export async function optimizeAffiliateProducts() {
  const analytics = new AffiliateAnalytics();
  const report = analytics.generateReport('month');
  
  // Désactiver produits peu performants
  const lowPerformingProducts = report.top_products
    .filter(product => product.conversion_rate < 1)
    .map(product => product.id);
  
  await deactivateProducts(lowPerformingProducts);
  
  // Suggestions d'amélioration
  console.log('🎯 Optimizations suggérées:');
  console.log(`- Tester nouveaux emplacements pour: ${report.best_placements.join(', ')}`);
  console.log(`- Revoir pricing pour produits à faible conversion`);
  console.log(`- A/B tester descriptions produits populaires`);
}
```

### Compliance et Légal

- **Mentions légales** : Divulgation liens d'affiliation
- **RGPD** : Tracking anonymisé, opt-out possible
- **Transparence** : Prix actualisés, conditions claires
- **Performance** : Tests réguliers liens affiliés

---

> **Important** : Le système d'affiliation doit toujours prioriser l'expérience utilisateur et la valeur ajoutée avant la monétisation.
