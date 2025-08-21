// Utilitaires pour l'injection automatique de produits d'affiliation dans le contenu

import type { AffiliateProduct } from './affiliate';

export interface ContentInjectionOptions {
  /** Nombre de paragraphes après lesquels injecter le premier produit */
  startAfterParagraphs?: number;
  /** Intervalle entre les injections de produits */
  intervalParagraphs?: number;
  /** Nombre maximum de produits à injecter */
  maxProducts?: number;
  /** Position préférée pour l'injection */
  preferredPosition?: 'left' | 'right' | 'center';
  /** Taille des produits injectés */
  productSize?: 'small' | 'medium' | 'large';
  /** Seuils responsive */
  mobileBreakpoint?: number;
}

const defaultOptions: Required<ContentInjectionOptions> = {
  startAfterParagraphs: 2,
  intervalParagraphs: 4,
  maxProducts: 3,
  preferredPosition: 'right',
  productSize: 'medium',
  mobileBreakpoint: 768
};

/**
 * Analyse le contenu HTML et trouve les points d'injection optimaux
 */
export function findInjectionPoints(htmlContent: string, options: ContentInjectionOptions = {}): number[] {
  const opts = { ...defaultOptions, ...options };
  const injectionPoints: number[] = [];
  
  // Regex pour trouver les paragraphes (simplifié pour l'exemple)
  const paragraphRegex = /<p[^>]*>.*?<\/p>/gs;
  const matches = Array.from(htmlContent.matchAll(paragraphRegex));
  
  if (matches.length < opts.startAfterParagraphs + 1) {
    return []; // Pas assez de contenu
  }
  
  // Premier point d'injection
  let currentPoint = opts.startAfterParagraphs;
  let productCount = 0;
  
  while (currentPoint < matches.length && productCount < opts.maxProducts) {
    injectionPoints.push(currentPoint);
    currentPoint += opts.intervalParagraphs;
    productCount++;
  }
  
  return injectionPoints;
}

/**
 * Génère le HTML d'un produit d'affiliation inline
 */
export function generateProductHTML(
  product: AffiliateProduct, 
  position: 'left' | 'right' | 'center' = 'right',
  size: 'small' | 'medium' | 'large' = 'medium',
  showFullDescription: boolean = false
): string {
  const featuredLabel = product.featured ? 
    `<div class="featured-label">⭐ Recommandé</div>` : '';
  
  const discountBadge = product.discountPercent ? 
    `<div class="discount-badge">-${product.discountPercent}%</div>` : '';
  
  const benefitsText = showFullDescription ? 
    product.benefitsText : 
    `Solution recommandée pour ${product.category.toLowerCase()}. Résultats cliniquement prouvés.`;
  
  return `
    <div class="inline-affiliate-product ${position} ${size}" data-product="${product.productName}">
      ${featuredLabel}
      
      <div class="product-container">
        <div class="product-visual">
          <div class="image-wrapper">
            <img 
              src="${product.productImage}" 
              alt="${product.productName} - ${product.brand}"
              width="120"
              height="120"
              loading="lazy"
            />
            ${discountBadge}
          </div>
        </div>
        
        <div class="product-content">
          <div class="product-header">
            <h4 class="product-name">${product.productName}</h4>
            <p class="product-brand">Par ${product.brand}</p>
          </div>
          
          <div class="product-summary">
            <p>${benefitsText}</p>
          </div>
          
          <div class="product-actions">
            <a 
              href="${product.externalLink}"
              class="cta-button primary"
              target="_blank"
              rel="noopener sponsored"
              aria-label="Voir les détails de ${product.productName}"
            >
              <span class="cta-text">Voir les détails</span>
              <span class="cta-icon">→</span>
            </a>
            
            <span class="sponsored-label">Lien sponsorisé</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Injecte automatiquement les produits d'affiliation dans le contenu HTML
 */
export function injectProductsInContent(
  htmlContent: string, 
  products: AffiliateProduct[], 
  options: ContentInjectionOptions = {}
): string {
  if (!products.length) return htmlContent;
  
  const opts = { ...defaultOptions, ...options };
  const injectionPoints = findInjectionPoints(htmlContent, opts);
  
  if (!injectionPoints.length) return htmlContent;
  
  // Diviser le contenu par paragraphes
  const paragraphRegex = /(<p[^>]*>.*?<\/p>)/gs;
  const parts = htmlContent.split(paragraphRegex).filter(part => part.trim());
  
  let paragraphCount = 0;
  let productIndex = 0;
  let result = '';
  
  for (const part of parts) {
    result += part;
    
    // Si c'est un paragraphe
    if (part.match(/^<p[^>]*>/)) {
      paragraphCount++;
      
      // Vérifier si on doit injecter un produit
      if (injectionPoints.includes(paragraphCount) && productIndex < products.length) {
        const position = paragraphCount % 2 === 0 ? 'right' : 'left'; // Alternance
        const product = products[productIndex];
        
        result += generateProductHTML(product, position, opts.productSize, false);
        productIndex++;
      }
    }
  }
  
  return result;
}

/**
 * Version alternative utilisant des marqueurs dans le contenu Markdown
 */
export function processMarkdownMarkers(
  markdownContent: string, 
  products: AffiliateProduct[]
): string {
  // Remplace les marqueurs [PRODUCT:index] par le HTML approprié
  return markdownContent.replace(/\[PRODUCT:(\d+)(?::([a-z]+))?(?::([a-z]+))?\]/g, 
    (match, index, position = 'right', size = 'medium') => {
      const productIndex = parseInt(index);
      if (productIndex >= 0 && productIndex < products.length) {
        return generateProductHTML(
          products[productIndex], 
          position as any, 
          size as any, 
          false
        );
      }
      return match; // Garder le marqueur si produit introuvable
    }
  );
}

/**
 * Génère des marqueurs pour insertion manuelle dans le contenu
 */
export function generateInsertionMarkers(products: AffiliateProduct[]): string[] {
  return products.map((product, index) => {
    return [
      `[PRODUCT:${index}]`, // Position par défaut
      `[PRODUCT:${index}:left]`, // À gauche
      `[PRODUCT:${index}:right]`, // À droite
      `[PRODUCT:${index}:center]`, // Centré
      `[PRODUCT:${index}:left:small]`, // Petite taille à gauche
    ];
  }).flat();
}

/**
 * Configuration responsive automatique
 */
export function getResponsiveOptions(deviceWidth: number): ContentInjectionOptions {
  if (deviceWidth < 768) {
    // Mobile
    return {
      startAfterParagraphs: 1,
      intervalParagraphs: 3,
      maxProducts: 2,
      preferredPosition: 'center',
      productSize: 'small'
    };
  } else if (deviceWidth < 1024) {
    // Tablette
    return {
      startAfterParagraphs: 2,
      intervalParagraphs: 3,
      maxProducts: 2,
      preferredPosition: 'center',
      productSize: 'medium'
    };
  } else {
    // Desktop
    return {
      startAfterParagraphs: 2,
      intervalParagraphs: 4,
      maxProducts: 3,
      preferredPosition: 'right',
      productSize: 'medium'
    };
  }
}

/**
 * Détecte le contexte de l'article pour optimiser les placements
 */
export function analyzeContentContext(content: string): {
  wordCount: number;
  paragraphCount: number;
  hasLists: boolean;
  hasTables: boolean;
  hasImages: boolean;
  recommendedInjections: number;
} {
  const wordCount = content.split(/\s+/).length;
  const paragraphCount = (content.match(/<p[^>]*>/g) || []).length;
  const hasLists = /<[uo]l[^>]*>/i.test(content);
  const hasTables = /<table[^>]*>/i.test(content);
  const hasImages = /<img[^>]*>/i.test(content);
  
  // Recommandation basée sur la longueur
  let recommendedInjections = 0;
  if (wordCount > 500) recommendedInjections = 1;
  if (wordCount > 1000) recommendedInjections = 2;
  if (wordCount > 1500) recommendedInjections = 3;
  
  return {
    wordCount,
    paragraphCount,
    hasLists,
    hasTables,
    hasImages,
    recommendedInjections
  };
}

/**
 * Validation de la qualité des placements
 */
export function validatePlacements(
  content: string, 
  injectionPoints: number[]
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const context = analyzeContentContext(content);
  
  // Vérifier si trop de produits pour la taille du contenu
  if (injectionPoints.length > context.recommendedInjections) {
    warnings.push(`Trop de produits (${injectionPoints.length}) pour la longueur du contenu (${context.wordCount} mots)`);
  }
  
  // Vérifier la distance minimale entre les placements
  for (let i = 1; i < injectionPoints.length; i++) {
    if (injectionPoints[i] - injectionPoints[i-1] < 2) {
      warnings.push(`Placements trop rapprochés aux positions ${injectionPoints[i-1]} et ${injectionPoints[i]}`);
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}

// Export des styles CSS pour injection
export const inlineProductCSS = `
<style>
/* Styles pour les produits d'affiliation inline - Version embarquée */
.inline-affiliate-product {
  margin: 2rem 0;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  max-width: 100%;
}

.inline-affiliate-product:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #2563eb;
  transform: translateY(-2px);
}

.inline-affiliate-product.right { 
  float: right; 
  margin: 1rem 0 1rem 2rem; 
  max-width: 450px; 
}

.inline-affiliate-product.left { 
  float: left; 
  margin: 1rem 2rem 1rem 0; 
  max-width: 450px; 
}

.inline-affiliate-product.center { 
  margin: 2rem auto; 
  clear: both; 
}

.product-container {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  align-items: flex-start;
}

.image-wrapper {
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.image-wrapper img {
  border-radius: 6px;
  object-fit: cover;
}

.product-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.product-brand {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.product-summary {
  color: #374151;
  line-height: 1.6;
  font-size: 0.95rem;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #2563eb;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  color: white;
  text-decoration: none;
}

.sponsored-label {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  font-style: italic;
}

@media (max-width: 768px) {
  .inline-affiliate-product.left,
  .inline-affiliate-product.right {
    float: none;
    margin: 2rem 0;
    max-width: 100%;
  }
  
  .product-container {
    flex-direction: column;
    text-align: center;
  }
}

@media (prefers-color-scheme: dark) {
  .inline-affiliate-product {
    background: #1e293b;
    border-color: #475569;
  }
  
  .product-name {
    color: #e2e8f0;
  }
  
  .product-summary {
    color: #cbd5e1;
  }
  
  .image-wrapper {
    background: #334155;
  }
  
  .sponsored-label {
    color: #94a3b8;
  }
}
</style>
`;
