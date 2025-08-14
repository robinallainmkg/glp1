// 🛒 GESTIONNAIRE D'AFFILIATION MULTI-DEALS - GLP-1 FRANCE (Version Debug)
// Système générique supportant Talika, Nutrimuscle et futurs partenaires

// Déclarations TypeScript pour Google Analytics
declare global {
  function gtag(...args: any[]): void;
}

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
  trackingApp?: string;
  commissionRate?: string;
  placements?: {
    [key: string]: {
      enabled: boolean;
      priority: number;
    };
  };
}

export interface Deal {
  name: string;
  active: boolean;
  commission: string;
  trackingMethod: string;
  globalDiscount: string;
  globalCode: string;
}

// 📦 Données statiques intégrées pour éviter les problèmes d'import
const STATIC_PRODUCTS: Product[] = [
  {
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
  },
  {
    id: "nutrimuscle-whey-native",
    name: "Whey Native",
    brand: "Nutrimuscle",
    description: "Protéine Whey native ultra-pure, parfaite pour maintenir la masse musculaire pendant une perte de poids avec les GLP-1. Sans additifs artificiels.",
    benefits: [
      "Maintient la masse musculaire pendant la perte de poids",
      "Protéine native ultra-pure",
      "Digestion optimale",
      "Idéale post-GLP1 pour éviter la fonte musculaire",
      "Sans édulcorants artificiels"
    ],
    price: "59,90 €",
    originalPrice: "63,05 €",
    discount: "5%",
    discountCode: "NMA_GLP1",
    image: "/images/products/nutrimuscle-whey-native.jpg",
    affiliateUrl: "https://www.nutrimuscle.com/whey-native?ref=NMA_GLP1",
    tags: ["protéine", "whey", "masse-musculaire", "post-glp1", "native"],
    rating: 4.8,
    reviews: 892,
    categories: ["nutrition", "protéine", "complément-alimentaire"],
    targetCollections: [
      "effets-secondaires-glp1",
      "glp1-perte-de-poids",
      "nutrition-glp1",
      "sport-exercice-glp1"
    ],
    contextualKeywords: [
      "masse musculaire",
      "protéine",
      "fonte musculaire",
      "whey",
      "complément",
      "nutrition",
      "sport",
      "exercice",
      "muscles",
      "aminoacides",
      "récupération"
    ],
    isActive: true,
    priority: 2,
    ctaText: "Profiter de -5% avec NMA_GLP1",
    trackingApp: "NMSQUAD",
    commissionRate: "14%",
    placements: {
      "smart-content": { enabled: true, priority: 2 },
      "content-end": { enabled: true, priority: 1 },
      "banner": { enabled: true, priority: 2 },
      "grid": { enabled: true, priority: 1 }
    }
  },
  {
    id: "nutrimuscle-creatine-creapure",
    name: "Créatine Creapure®",
    brand: "Nutrimuscle",
    description: "Créatine monohydrate ultra-pure Creapure®. Améliore la force et l'endurance pendant l'activité physique recommandée avec les GLP-1.",
    benefits: [
      "Améliore la force et l'endurance",
      "Label Creapure® (pureté maximale)",
      "Optimise les performances sportives",
      "Favorise la récupération",
      "Soutient l'effort physique pendant GLP-1"
    ],
    price: "24,90 €",
    originalPrice: "26,21 €",
    discount: "5%",
    discountCode: "NMA_GLP1",
    image: "/images/products/nutrimuscle-creatine-creapure.jpg",
    affiliateUrl: "https://www.nutrimuscle.com/creatine-creapure?ref=NMA_GLP1",
    tags: ["créatine", "creapure", "force", "endurance", "sport"],
    rating: 4.9,
    reviews: 1247,
    categories: ["nutrition", "performance", "complément-alimentaire"],
    targetCollections: [
      "sport-exercice-glp1",
      "glp1-perte-de-poids",
      "nutrition-glp1"
    ],
    contextualKeywords: [
      "force",
      "endurance",
      "performance",
      "sport",
      "exercice",
      "entraînement",
      "récupération",
      "créatine"
    ],
    isActive: true,
    priority: 5,
    ctaText: "Profiter de -5% avec NMA_GLP1",
    trackingApp: "NMSQUAD",
    commissionRate: "14%",
    placements: {
      "smart-content": { enabled: true, priority: 5 }
    }
  }
];

/**
 * 🔍 Récupère tous les produits actifs
 */
export function getAllActiveProducts(): Product[] {
  console.log('🔍 getAllActiveProducts appelée');
  return STATIC_PRODUCTS.filter(product => product.isActive);
}

/**
 * 🎯 Récupère un produit par ID
 */
export function getProductById(id: string): Product | null {
  console.log('🎯 getProductById appelée avec:', id);
  return STATIC_PRODUCTS.find(product => product.id === id && product.isActive) || null;
}

/**
 * 🏢 Récupère les produits d'une marque spécifique
 */
export function getProductsByBrand(brand: string, limit: number = 3): Product[] {
  console.log('🏢 getProductsByBrand appelée avec:', brand, limit);
  return STATIC_PRODUCTS
    .filter(product => product.brand.toLowerCase() === brand.toLowerCase() && product.isActive)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
}

/**
 * 🏷️ Récupère les produits pour une collection donnée
 */
export function getProductsForCollection(collection: string, limit: number = 2): Product[] {
  console.log('🏷️ getProductsForCollection appelée avec:', collection, limit);
  const relevantProducts = STATIC_PRODUCTS.filter(product => 
    product.isActive && product.targetCollections.includes(collection)
  );
  
  return relevantProducts
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
}

/**
 * 🔤 Recherche contextuelle par mots-clés
 */
export function getProductsByKeywords(keywords: string[], collection?: string, limit: number = 2): Product[] {
  console.log('🔤 getProductsByKeywords appelée avec:', keywords, collection, limit);
  
  const scoredProducts = STATIC_PRODUCTS
    .filter(product => product.isActive)
    .map(product => {
      let relevanceScore = 0;
      
      keywords.forEach(keyword => {
        const isRelevant = product.contextualKeywords.some(productKeyword =>
          productKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(productKeyword.toLowerCase())
        );
        
        if (isRelevant) {
          relevanceScore += 1;
        }
      });
      
      return { product, relevanceScore };
    });

  return scoredProducts
    .filter(item => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore || a.product.priority - b.product.priority)
    .slice(0, limit)
    .map(item => item.product);
}

/**
 * 🎯 Récupère le meilleur produit pour un contexte donné
 */
export function getBestProductForContext(collection: string, keywords: string[] = []): Product | null {
  console.log('🎯 getBestProductForContext appelée avec:', collection, keywords);
  
  // Essayer d'abord par collection
  const collectionProducts = getProductsForCollection(collection, 1);
  if (collectionProducts.length > 0) {
    return collectionProducts[0];
  }
  
  // Puis par mots-clés si aucun produit trouvé par collection
  if (keywords.length > 0) {
    const keywordProducts = getProductsByKeywords(keywords, collection, 1);
    if (keywordProducts.length > 0) {
      return keywordProducts[0];
    }
  }
  
  // Enfin, le produit avec la plus haute priorité
  const allProducts = getAllActiveProducts();
  return allProducts.sort((a, b) => a.priority - b.priority)[0] || null;
}

/**
 * 🌐 Ajouter les paramètres UTM pour le tracking
 */
export function addTrackingParams(url: string, params: {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  productId?: string;
} = {}): string {
  try {
    const urlObj = new URL(url);
    
    // Paramètres UTM par défaut 
    urlObj.searchParams.set('utm_source', params.source || 'glp1-france');
    urlObj.searchParams.set('utm_medium', params.medium || 'affiliate'); 
    urlObj.searchParams.set('utm_campaign', params.campaign || 'glp1-affiliate');
    
    if (params.content) {
      urlObj.searchParams.set('utm_content', params.content);
    }
    
    if (params.productId) {
      urlObj.searchParams.set('product_id', params.productId);
    }
    
    return urlObj.toString();
  } catch (error) {
    console.error('Erreur ajout paramètres tracking:', error);
    return url;
  }
}

/**
 * 📈 Tracking des clics d'affiliation
 */
export function trackAffiliateClick(productId: string, placement: string, context?: string): void {
  // Tracking Google Analytics 
  if (typeof gtag !== 'undefined') {
    gtag('event', 'click', {
      event_category: 'affiliate',
      event_label: productId,
      event_context: placement,
      context: context || 'unknown',
      custom_map: { custom_parameter_1: 'affiliate_revenue' }
    });
  }
  
  // Tracking console pour debug
  console.log('🛒 Clic Affiliation:', {
    productId,
    placement, 
    context,
    timestamp: new Date().toISOString()
  });
}

// 🔄 COMPATIBILITÉ BACKWARDS - Fonctions legacy
/**
 * @deprecated Utiliser getBestProductForContext ou getProductsByBrand('Talika') à la place
 */
export function getTalikaProduct(): Product | null {
  const talikaProducts = getProductsByBrand('Talika', 1);
  return talikaProducts[0] || null;
}

/**
 * @deprecated Utiliser analyzeContentContext à la place
 */
export function analyzeContentRelevance(content: string): number {
  return 0; // Simplified for debug
}
