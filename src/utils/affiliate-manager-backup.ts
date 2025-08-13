// Gestionnaire d'affiliation pour GLP-1 France
// Gère les produits affiliés, placements et scoring contextuel

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  benefits: string[];
  price: string;
  originalPrice?: string;
  discount?: string;
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
  created: string;
  updated: string;
  ctaText?: string;
  placements?: {
    [key: string]: {
      enabled: boolean;
      priority: number;
    };
  };
}

export interface Placement {
  id: string;
  name: string;
  position: string;
  style: string;
  maxProducts: number;
}

export interface ContextualRule {
  id: string;
  conditions: {
    keywords: string[];
    categories: string[];
  };
  recommendedProducts: string[];
  priority: number;
}

export interface AffiliateData {
  products: Product[];
  placements: { [key: string]: Placement };
  contextualRules: ContextualRule[];
  settings: {
    globalEnabled: boolean;
    testMode: boolean;
    maxProductsPerPage: number;
    defaultPlacement: string;
    analyticsEnabled: boolean;
    utmSource: string;
    utmMedium: string;
  };
}

// Données statiques de fallback (utilisées quand le JSON n'est pas accessible)
function getStaticAffiliateData(): AffiliateData {
  return {
    products: [
      {
        id: "talika-bust-phytoserum",
        name: "Bust Phytoserum",
        brand: "Talika",
        description: "Sérum raffermissant professionnel pour le décolleté. Sa formule unique aux actifs naturels redonne volume, fermeté et tonicité à la poitrine. Idéal après une perte de poids rapide liée aux traitements GLP-1.",
        benefits: [
          "Redonne volume, fermeté et tonicité",
          "Formule aux ingrédients d'origine naturelle",
          "Texture non grasse, absorption rapide",
          "Résultats visibles dès 2 semaines d'utilisation",
          "Parfait après perte de poids GLP-1"
        ],
        price: "39,90 €",
        originalPrice: "49,90 €",
        discount: "20%",
        image: "/images/products/talika-bust-phytoserum.jpg",
        affiliateUrl: "https://talika.fr/products/bust-phytoserum?utm_source=glp1france",
        tags: ["raffermissant", "naturel", "décolleté", "volume", "fermeté"],
        rating: 4.7,
        reviews: 89,
        categories: ["soins-corps", "raffermissant", "post-traitement", "beaute"],
        targetCollections: ["perte-de-poids", "effets-secondaires", "beaute"],
        contextualKeywords: ["raffermissant", "peau", "décolleté", "fermeté", "volume", "tonicité", "glp1", "perte de poids", "poitrine", "buste"],
        isActive: true,
        priority: 1,
        created: "2025-08-12",
        updated: "2025-08-12",
        ctaText: "Découvrir sur Talika.fr",
        placements: {
          banner: { enabled: true, priority: 1 },
          sidebar: { enabled: true, priority: 2 },
          inline: { enabled: true, priority: 1 },
          grid: { enabled: true, priority: 1 },
          footer: { enabled: true, priority: 3 },
          content: { enabled: true, priority: 2 }
        }
      },
      {
        id: "collagene-marin",
        name: "Collagène Marin Premium",
        brand: "NutriBeauty",
        description: "Complément alimentaire au collagène marin pour maintenir l'élasticité de la peau pendant la perte de poids.",
        benefits: [
          "Maintient l'élasticité cutanée",
          "Collagène marin de haute qualité",
          "Enrichi en vitamine C et acide hyaluronique",
          "Idéal pendant un traitement GLP-1"
        ],
        price: "34,90 €",
        originalPrice: "42,90 €",
        discount: "19%",
        image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop",
        affiliateUrl: "https://example.com/collagene-marin?ref=glp1france",
        tags: ["collagène", "anti-âge", "complément", "peau"],
        rating: 4.4,
        reviews: 89,
        categories: ["compléments", "anti-age", "beaute"],
        targetCollections: ["perte-de-poids", "beaute"],
        contextualKeywords: ["collagène", "élasticité", "peau", "anti-âge", "beauté"],
        isActive: true,
        priority: 2,
        created: "2025-01-01",
        updated: "2025-01-01",
        ctaText: "Commander le Collagène",
        placements: {
          banner: { enabled: true, priority: 2 },
          sidebar: { enabled: true, priority: 1 },
          inline: { enabled: true, priority: 3 },
          grid: { enabled: true, priority: 2 },
          footer: { enabled: true, priority: 2 },
          content: { enabled: true, priority: 3 }
        }
      },
      {
        id: "probiotiques-digestifs",
        name: "Probiotiques Digestifs+",
        brand: "GutHealth Pro",
        description: "Complexe probiotique spécialement formulé pour accompagner les traitements GLP-1 et réduire les troubles digestifs.",
        benefits: [
          "Réduit les nausées et troubles digestifs",
          "10 milliards de CFU par gélule",
          "Souches spécifiques pour l'estomac",
          "Compatible avec les traitements GLP-1"
        ],
        price: "29,90 €",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        affiliateUrl: "https://example.com/probiotiques-digestifs?ref=glp1france",
        tags: ["probiotiques", "digestif", "nausées", "glp1"],
        rating: 4.7,
        reviews: 203,
        categories: ["compléments", "digestif", "probiotiques"],
        targetCollections: ["effets-secondaires", "medicaments-glp1"],
        contextualKeywords: ["probiotiques", "digestif", "nausées", "estomac", "troubles"],
        isActive: true,
        priority: 2,
        created: "2025-01-01",
        updated: "2025-01-01",
        ctaText: "Acheter les Probiotiques",
        placements: {
          banner: { enabled: true, priority: 3 },
          sidebar: { enabled: true, priority: 1 },
          inline: { enabled: true, priority: 2 },
          grid: { enabled: true, priority: 2 },
          footer: { enabled: true, priority: 1 },
          content: { enabled: true, priority: 1 }
        }
      },
      {
        id: "balance-connectee",
        name: "Balance Connectée Premium",
        brand: "HealthTrack",
        description: "Balance intelligente pour suivre précisément votre progression avec les traitements GLP-1. Analyse complète de la composition corporelle.",
        benefits: [
          "Suivi précis du poids et de la composition",
          "Application mobile dédiée",
          "Compatible avec Apple Health et Google Fit", 
          "Parfait pour monitorer les effets GLP-1"
        ],
        price: "79,90 €",
        originalPrice: "99,90 €",
        discount: "20%",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        affiliateUrl: "https://example.com/balance-connectee?ref=glp1france",
        tags: ["balance", "suivi", "connectée", "santé"],
        rating: 4.5,
        reviews: 156,
        categories: ["electronique", "suivi", "sante"],
        targetCollections: ["perte-de-poids", "suivi-medical"],
        contextualKeywords: ["balance", "poids", "suivi", "progression", "mesure"],
        isActive: true,
        priority: 3,
        created: "2025-01-01", 
        updated: "2025-01-01",
        ctaText: "Voir la Balance",
        placements: {
          banner: { enabled: false, priority: 5 },
          sidebar: { enabled: true, priority: 3 },
          inline: { enabled: false, priority: 5 },
          grid: { enabled: true, priority: 3 },
          footer: { enabled: true, priority: 4 },
          content: { enabled: true, priority: 4 }
        }
      }
    ],
    placements: {
      banner: {
        id: "banner",
        name: "Bannière principale",
        position: "top",
        style: "featured",
        maxProducts: 1
      },
      sidebar: {
        id: "sidebar", 
        name: "Barre latérale",
        position: "right",
        style: "compact",
        maxProducts: 2
      },
      inline: {
        id: "inline",
        name: "Dans le contenu",
        position: "content",
        style: "expanded", 
        maxProducts: 1
      },
      grid: {
        id: "grid",
        name: "Grille de produits",
        position: "bottom",
        style: "card",
        maxProducts: 4
      },
      footer: {
        id: "footer",
        name: "Pied de page",
        position: "bottom",
        style: "compact",
        maxProducts: 1
      }
    },
    contextualRules: [
      {
        id: "perte-de-poids-raffermissant",
        conditions: {
          keywords: ["perte de poids", "raffermissant", "glp1"],
          categories: ["perte-de-poids", "effets-secondaires"]
        },
        recommendedProducts: ["talika-bust-phytoserum", "collagene-marin"],
        priority: 1
      },
      {
        id: "effets-secondaires-soin", 
        conditions: {
          keywords: ["effets secondaires", "peau", "relâchement"],
          categories: ["effets-secondaires"]
        },
        recommendedProducts: ["talika-bust-phytoserum", "probiotiques-digestifs"],
        priority: 2
      },
      {
        id: "diabete-suivi",
        conditions: {
          keywords: ["diabète", "glycémie", "suivi"],
          categories: ["glp1-diabete"]
        },
        recommendedProducts: ["balance-connectee", "probiotiques-digestifs"],
        priority: 1
      }
    ],
    settings: {
      globalEnabled: true,
      testMode: false,
      maxProductsPerPage: 3,
      defaultPlacement: "inline",
      analyticsEnabled: true,
      utmSource: "glp1-france",
      utmMedium: "affiliate"
    }
  };
}

// Fonction pour charger les données d'affiliation
async function loadAffiliateData(): Promise<AffiliateData> {
  // Pour l'instant, on utilise les données statiques
  // Dans le futur, on pourrait charger depuis une API ou une base de données
  return getStaticAffiliateData();
}

/**
 * Récupère un produit par son ID
 */
export async function getProductById(productId: string): Promise<Product | undefined> {
  const data = await loadAffiliateData();
  return data.products.find(product => product.id === productId && product.isActive);
}

/**
 * Récupère les produits par mots-clés avec scoring
 */
export async function getProductsByKeywords(
  keywords: string[], 
  category?: string, 
  limit: number = 3
): Promise<Product[]> {
  const data = await loadAffiliateData();
  
  const scoredProducts = data.products
    .filter(product => product.isActive)
    .map(product => ({
      ...product,
      score: calculateProductScore(product, keywords, category)
    }))
    .filter(product => product.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scoredProducts;
}

/**
 * Récupère les produits pour une collection spécifique
 */
export async function getProductsForCollection(
  collectionSlug: string, 
  limit: number = 3
): Promise<Product[]> {
  const data = await loadAffiliateData();
  
  const products = data.products
    .filter(product => 
      product.isActive && 
      product.targetCollections.includes(collectionSlug)
    )
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
  
  return products;
}

/**
 * Récupère les produits recommandés selon les mots-clés et la catégorie
 */
export async function getRecommendedProducts(
  keywords: string[], 
  category?: string, 
  limit: number = 3
): Promise<Product[]> {
  const data = await loadAffiliateData();
  
  const scoredProducts = data.products
    .map(product => ({
      ...product,
      score: calculateProductScore(product, keywords, category)
    }))
    .filter(product => product.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scoredProducts;
}

/**
 * Calcule le score de pertinence d'un produit
 */
export function calculateProductScore(
  product: Product, 
  keywords: string[], 
  category?: string
): number {
  let score = 0;
  
  // Score basé sur les mots-clés
  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    
    // Correspondance exacte dans les mots-clés du produit
    if (product.contextualKeywords.some(k => k.toLowerCase() === lowerKeyword)) {
      score += 10;
    }
    
    // Correspondance partielle dans les mots-clés
    if (product.contextualKeywords.some(k => k.toLowerCase().includes(lowerKeyword))) {
      score += 5;
    }
    
    // Correspondance dans le nom du produit
    if (product.name.toLowerCase().includes(lowerKeyword)) {
      score += 7;
    }
    
    // Correspondance dans la description
    if (product.description.toLowerCase().includes(lowerKeyword)) {
      score += 3;
    }
  });
  
  // Score basé sur la catégorie
  if (category && product.categories.includes(category)) {
    score += 8;
  }
  
  // Bonus pour les produits avec de bonnes évaluations
  if (product.rating && product.rating >= 4.5) {
    score += 2;
  }
  
  // Bonus pour les produits en promotion
  if (product.discount) {
    score += 1;
  }
  
  return score;
}

/**
 * Ajoute les paramètres UTM à une URL d'affiliation
 */
export function addUtmParameters(
  url: string, 
  params: {
    source: string;
    medium: string;
    campaign: string;
    content?: string;
  }
): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', params.source);
    urlObj.searchParams.set('utm_medium', params.medium);
    urlObj.searchParams.set('utm_campaign', params.campaign);
    
    if (params.content) {
      urlObj.searchParams.set('utm_content', params.content);
    }
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Erreur lors de l\'ajout des paramètres UTM:', error);
    return url;
  }
}

/**
 * Récupère les placements disponibles
 */
export async function getAvailablePlacements(): Promise<Placement[]> {
  const data = await loadAffiliateData();
  return Object.values(data.placements);
}

/**
 * Récupère les règles contextuelles
 */
export async function getContextualRules(): Promise<ContextualRule[]> {
  const data = await loadAffiliateData();
  return data.contextualRules;
}

/**
 * Vérifie si l'affiliation est activée globalement
 */
export async function isAffiliationEnabled(): Promise<boolean> {
  const data = await loadAffiliateData();
  return data.settings.globalEnabled;
}

/**
 * Récupère tous les produits
 */
export async function getAllProducts(): Promise<Product[]> {
  const data = getStaticAffiliateData();
  return data.products;
}

export async function getActiveProducts(): Promise<Product[]> {
  const allProducts = await getAllProducts();
  return allProducts.filter(product => product.isActive);
}
