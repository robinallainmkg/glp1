// Gestionnaire d'affiliation simplifié - Focus Talika Bust Phytoserum
// Version optimisée pour un seul produit avec placement intelligent

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  benefits: string[];
  price: string;
  originalPrice?: string;
  discount?: string;
  discountCode?: string;
  image: string;
  affiliateUrl: string;
  tags: string[];
  rating?: number;
  reviews?: number;
  categories: string[];
  targetCollections: string[];
  contextualKeywords: string[];
  isActive: boolean;
  priority: number;
  ctaText?: string;
  placements?: {
    [key: string]: {
      enabled: boolean;
      priority: number;
    };
  };
}

// Données statiques simplifiées pour éviter les erreurs d'import
const TALIKA_PRODUCT: Product = {
  id: "talika-bust-phytoserum",
  name: "Bust Phytoserum",
  brand: "Talika",
  description: "Sérum raffermissant naturel pour le buste. Formule exclusive aux extraits végétaux pour tonifier et raffermir la peau après une perte de poids.",
  benefits: [
    "Raffermit la peau du décolleté",
    "Améliore l'élasticité cutanée", 
    "Formule naturelle aux phytonutriments",
    "Adapté après perte de poids GLP-1",
    "Résultats visibles en 4 semaines"
  ],
  price: "49,90 €",
  originalPrice: "55,45 €",
  discount: "10%",
  discountCode: "GLP1",
  image: "/images/products/talika-bust-phytoserum.jpg",
  affiliateUrl: "https://talika.fr/GLP1",
  tags: ["raffermissant", "naturel", "décolleté", "post-glp1"],
  rating: 4.6,
  reviews: 247,
  categories: ["beaute", "raffermissant", "soin-corps"],
  targetCollections: [
    "glp1-perte-de-poids",
    "effets-secondaires-glp1",
    "avant-apres-glp1",
    "guide-beaute-perte-de-poids-glp1"
  ],
  contextualKeywords: [
    "perte de poids",
    "raffermissement", 
    "fermeté",
    "peau relâchée",
    "décolleté",
    "poitrine",
    "seins",
    "élasticité",
    "relâchement",
    "amaigrissement",
    "beauté",
    "soin",
    "corps"
  ],
  isActive: true,
  priority: 1,
  ctaText: "Profiter de -10% avec GLP1",
  placements: {
    "smart-content": { enabled: true, priority: 1 },
    "content-end": { enabled: true, priority: 2 },
    "banner": { enabled: true, priority: 3 },
    "grid": { enabled: true, priority: 4 }
  }
};

/**
 * Récupère le produit Talika si actif
 */
export async function getTalikaProduct(): Promise<Product | null> {
  return TALIKA_PRODUCT.isActive ? TALIKA_PRODUCT : null;
}

/**
 * Récupère un produit par ID (seulement Talika)
 */
export async function getProductById(id: string): Promise<Product | null> {
  if (id === TALIKA_PRODUCT.id && TALIKA_PRODUCT.isActive) {
    return TALIKA_PRODUCT;
  }
  return null;
}

/**
 * Vérifie si Talika est pertinent pour une collection
 */
export async function getProductsForCollection(collection: string, maxProducts: number = 1): Promise<Product[]> {
  if (TALIKA_PRODUCT.isActive && TALIKA_PRODUCT.targetCollections.includes(collection)) {
    return [TALIKA_PRODUCT];
  }
  return [];
}

/**
 * Vérifie si Talika est pertinent selon les mots-clés du contenu
 */
export async function getProductsByKeywords(keywords: string[], collection?: string, maxProducts: number = 1): Promise<Product[]> {
  if (!TALIKA_PRODUCT.isActive) return [];
  
  // Calculer le score de pertinence
  const relevanceScore = keywords.reduce((score, keyword) => {
    const keywordLower = keyword.toLowerCase();
    const isRelevant = TALIKA_PRODUCT.contextualKeywords.some(productKeyword => 
      productKeyword.toLowerCase().includes(keywordLower) ||
      keywordLower.includes(productKeyword.toLowerCase())
    );
    return score + (isRelevant ? 1 : 0);
  }, 0);
  
  // Retourner Talika si score de pertinence > 0
  return relevanceScore > 0 ? [TALIKA_PRODUCT] : [];
}

/**
 * Analyser la pertinence du contenu pour Talika
 */
export function analyzeContentRelevance(content: string): number {
  const contentLower = content.toLowerCase();
  let score = 0;
  
  TALIKA_PRODUCT.contextualKeywords.forEach(keyword => {
    if (contentLower.includes(keyword.toLowerCase())) {
      score += 1;
      // Bonus si le mot-clé apparaît plusieurs fois
      const matches = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      if (matches > 1) score += 0.5;
    }
  });
  
  return score;
}

/**
 * Ajouter les paramètres UTM pour le tracking Shopify Collabs
 */
export function addUtmParameters(baseUrl: string, params: {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
}): string {
  const url = new URL(baseUrl);
  
  // Paramètres UTM par défaut pour Shopify Collabs
  const utmParams = {
    utm_source: params.source || 'glp1-france',
    utm_medium: params.medium || 'shopify-collabs', 
    utm_campaign: params.campaign || 'talika-glp1',
    utm_content: params.content || 'article-placement'
  };
  
  // Ajouter les paramètres UTM
  Object.entries(utmParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.toString();
}

/**
 * Fonctions legacy maintenues pour compatibilité (retournent toujours Talika ou vide)
 */
export async function getAllProducts(): Promise<Product[]> {
  return TALIKA_PRODUCT.isActive ? [TALIKA_PRODUCT] : [];
}

export async function getActiveProducts(): Promise<Product[]> {
  return TALIKA_PRODUCT.isActive ? [TALIKA_PRODUCT] : [];
}

/**
 * Tracking Shopify Collabs des clics
 */
export function trackAffiliateClick(productId: string, placement: string, context?: any): void {
  // Tracking Google Analytics pour Shopify Collabs
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'affiliate_click', {
      event_category: 'shopify_collabs',
      event_label: productId,
      placement: placement,
      discount_code: 'GLP1',
      partner: 'talika',
      custom_map: { custom_parameter_1: 'shopify_affiliate_revenue' }
    });
  }
  
  // Tracking console pour debug Shopify Collabs
  console.log('�️ Clic Shopify Collabs:', {
    product: productId,
    placement: placement,
    discountCode: 'GLP1',
    affiliateUrl: 'talika.fr/GLP1',
    timestamp: new Date().toISOString(),
    context: context
  });
  
  // Ici tu peux ajouter le tracking spécifique à Shopify
  // Exemple : Shopify analytics, Facebook Pixel, etc.
}

/**
 * Vérification de la santé du système Shopify Collabs
 */
export function getAffiliateSystemHealth(): {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  productCount: number;
  discountCode?: string;
  affiliateUrl?: string;
} {
  const isHealthy = TALIKA_PRODUCT.isActive && 
                    TALIKA_PRODUCT.affiliateUrl && 
                    TALIKA_PRODUCT.image &&
                    TALIKA_PRODUCT.discountCode;
  
  return {
    status: isHealthy ? 'healthy' : 'warning',
    message: isHealthy ? 'Shopify Collabs Talika prêt' : 'Configuration Shopify Collabs incomplète',
    productCount: isHealthy ? 1 : 0,
    discountCode: TALIKA_PRODUCT.discountCode,
    affiliateUrl: TALIKA_PRODUCT.affiliateUrl
  };
}
