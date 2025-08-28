// 🛒 GESTIONNAIRE D'AFFILIATION MULTI-DEALS - GLP-1 FRANCE (Version Clean)
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

// 📦 Données statiques intégrées - 4 PRODUITS OPTIMISÉS
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
      "corps",
      "peau"
    ],
    isActive: true,
    priority: 0, // Suppression des priorités - utilise le scoring contextuel
    ctaText: "Profiter de -10% avec GLP1",
    trackingApp: "TALIKA",
    commissionRate: "12%",
    placements: {
      "smart-content": { enabled: true, priority: 1 },
      "content-end": { enabled: true, priority: 1 },
      "banner": { enabled: true, priority: 1 },
      "grid": { enabled: true, priority: 1 }
    }
  },
  {
    id: "talika-time-control-7-plus",
    name: "Time Control 7+",
    brand: "Talika",
    description: "Soin anti-âge révolutionnaire qui cible 7 signes de vieillissement. Formule avancée pour une peau plus ferme et éclatante après une perte de poids.",
    benefits: [
      "Cible 7 signes de vieillissement simultanément",
      "Raffermit et tonifie la peau du visage",
      "Réduit les rides et ridules",
      "Améliore l'éclat et la luminosité",
      "Hydrate intensément",
      "Idéal après perte de poids GLP-1",
      "Formule concentrée en actifs anti-âge"
    ],
    price: "89,90 €",
    originalPrice: "99,90 €",
    discount: "15%",
    discountCode: "GLP1",
    image: "/images/products/talika-time-control-7.jpg",
    affiliateUrl: "https://talika.fr/GLP1",
    tags: ["anti-âge", "raffermissant", "anti-rides", "post-glp1", "beauté", "visage"],
    rating: 4.7,
    reviews: 189,
    categories: ["beaute", "anti-age", "soin-visage"],
    targetCollections: [
      "glp1-perte-de-poids",
      "effets-secondaires-glp1",
      "avant-apres-glp1",
      "guide-beaute-perte-de-poids-glp1"
    ],
    contextualKeywords: [
      "anti-âge",
      "rides",
      "raffermissement",
      "peau relâchée",
      "visage",
      "vieillissement",
      "fermeté",
      "éclat",
      "perte de poids",
      "beauté",
      "soin",
      "anti-rides",
      "élasticité",
      "peau",
      "âge"
    ],
    isActive: true,
    priority: 0, // Suppression des priorités - utilise le scoring contextuel
    ctaText: "Profiter de -15% avec GLP1",
    trackingApp: "TALIKA",
    commissionRate: "12%",
    placements: {
      "smart-content": { enabled: true, priority: 1 },
      "content-end": { enabled: true, priority: 1 },
      "banner": { enabled: true, priority: 1 },
      "grid": { enabled: true, priority: 1 }
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
    affiliateUrl: "https://www.nutrimuscle.com/NMA_GLP1?redirect=/whey-native",
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
      "récupération",
      "musculation",
      "force"
    ],
    isActive: true,
    priority: 0, // Suppression des priorités - utilise le scoring contextuel
    ctaText: "Profiter de -5% avec NMA_GLP1",
    trackingApp: "NMSQUAD",
    commissionRate: "14%",
    placements: {
      "smart-content": { enabled: true, priority: 1 },
      "content-end": { enabled: true, priority: 1 },
      "banner": { enabled: true, priority: 1 },
      "grid": { enabled: true, priority: 1 }
    }
  },
  {
    id: "nutrimuscle-glutamine",
    name: "Glutamine",
    brand: "Nutrimuscle",
    description: "L-Glutamine pure en poudre pour optimiser la récupération et préserver la masse musculaire pendant un traitement GLP-1. Améliore la récupération post-entraînement.",
    benefits: [
      "Préserve la masse musculaire pendant la perte de poids",
      "Améliore la récupération musculaire",
      "Soutient le système immunitaire",
      "Optimise la synthèse protéique",
      "Réduit la fatigue musculaire",
      "Idéale avec les traitements GLP-1"
    ],
    price: "34,90 €",
    originalPrice: "36,74 €",
    discount: "5%",
    discountCode: "NMA_GLP1",
    image: "/images/products/nutrimuscle-glutamine.jpg",
    affiliateUrl: "https://www.nutrimuscle.com/NMA_GLP1?redirect=/products/glutamine-l-glutamine-en-poudre",
    tags: ["glutamine", "récupération", "masse-musculaire", "post-glp1", "complément"],
    rating: 4.7,
    reviews: 654,
    categories: ["nutrition", "récupération", "complément-alimentaire"],
    targetCollections: [
      "effets-secondaires-glp1",
      "glp1-perte-de-poids",
      "nutrition-glp1",
      "sport-exercice-glp1"
    ],
    contextualKeywords: [
      "récupération",
      "masse musculaire",
      "glutamine",
      "complément",
      "nutrition",
      "sport",
      "exercice",
      "muscles",
      "fatigue",
      "immunitaire",
      "synthèse",
      "protéique",
      "musculation"
    ],
    isActive: true,
    priority: 0, // Suppression des priorités - utilise le scoring contextuel
    ctaText: "Profiter de -5% avec NMA_GLP1",
    trackingApp: "NMSQUAD",
    commissionRate: "14%",
    placements: {
      "smart-content": { enabled: true, priority: 1 },
      "content-end": { enabled: true, priority: 1 },
      "banner": { enabled: true, priority: 1 },
      "grid": { enabled: true, priority: 1 }
    }
  }
];

// ⚡ CONFIGURATION DES PARTENAIRES - Deals multiples
const AFFILIATE_DEALS: { [key: string]: Deal } = {
  TALIKA: {
    name: "Talika",
    active: true,
    commission: "12%",
    trackingMethod: "UTM",
    globalDiscount: "15%",
    globalCode: "GLP1"
  },
  NMSQUAD: {
    name: "Nutrimuscle",
    active: true,
    commission: "14%",
    trackingMethod: "UTM",
    globalDiscount: "5%",
    globalCode: "NMA_GLP1"
  }
};

// 📊 Fonctions de scoring contextuel avancées
function calculateContextualScore(product: Product, content: string, collection: string): number {
  let score = 0;
  const normalizedContent = content.toLowerCase();
  const normalizedCollection = collection.toLowerCase();

  // Score basé sur la collection cible (25%)
  const collectionMatch = product.targetCollections.some(col => 
    normalizedCollection.includes(col.toLowerCase())
  );
  if (collectionMatch) score += 25;

  // Score basé sur les mots-clés contextuels (40%)
  const keywordMatches = product.contextualKeywords.filter(keyword => 
    normalizedContent.includes(keyword.toLowerCase())
  ).length;
  const maxKeywords = product.contextualKeywords.length;
  const keywordScore = Math.min((keywordMatches / maxKeywords) * 40, 40);
  score += keywordScore;

  // Score basé sur les tags (20%)
  const tagMatches = product.tags.filter(tag => 
    normalizedContent.includes(tag.toLowerCase())
  ).length;
  const maxTags = product.tags.length;
  const tagScore = Math.min((tagMatches / maxTags) * 20, 20);
  score += tagScore;

  // Score basé sur les catégories (15%)
  const categoryMatch = product.categories.some(cat => 
    normalizedContent.includes(cat.toLowerCase())
  );
  if (categoryMatch) score += 15;

  return Math.round(score);
}

// 🛒 Récupération des produits actifs
export function getAllActiveProducts(): Product[] {
  return STATIC_PRODUCTS.filter(product => product.isActive);
}

// 🎯 Récupération par marque
export function getProductsByBrand(brand: string): Product[] {
  return STATIC_PRODUCTS.filter(product => 
    product.isActive && product.brand.toLowerCase() === brand.toLowerCase()
  );
}

// 🎲 Sélection contextuelle intelligente
export function getRecommendedProducts(
  content: string,
  collection: string,
  limit: number = 2
): Product[] {
  const activeProducts = getAllActiveProducts();
  
  // Calcul du score contextuel pour chaque produit
  const scoredProducts = activeProducts.map(product => ({
    ...product,
    contextScore: calculateContextualScore(product, content, collection)
  }));

  // Tri par score contextuel décroissant
  scoredProducts.sort((a, b) => b.contextScore - a.contextScore);

  return scoredProducts.slice(0, limit);
}

// 📈 Tracking et analytics
export function trackAffiliateClick(product: Product, placement: string): void {
  if (typeof gtag === 'function') {
    gtag('event', 'affiliate_click', {
      product_id: product.id,
      product_name: product.name,
      brand: product.brand,
      placement: placement,
      tracking_app: product.trackingApp,
      commission_rate: product.commissionRate
    });
  }
  
  console.log(`🔗 Affiliate click tracked: ${product.name} (${placement})`);
}

// 🏷️ Récupération d'un produit par ID
export function getProductById(id: string): Product | undefined {
  return STATIC_PRODUCTS.find(product => product.id === id && product.isActive);
}

// 🔍 Recherche de produits
export function searchProducts(query: string): Product[] {
  const normalizedQuery = query.toLowerCase();
  
  return STATIC_PRODUCTS.filter(product => {
    if (!product.isActive) return false;
    
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
      product.contextualKeywords.some(keyword => keyword.toLowerCase().includes(normalizedQuery))
    );
  });
}

// 💰 Récupération des informations sur les deals
export function getAffiliateDeals(): { [key: string]: Deal } {
  return AFFILIATE_DEALS;
}

// Export par défaut
export { STATIC_PRODUCTS };
