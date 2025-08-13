// Import du JSON en tant que module statique
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuration pour l'import du JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fonction pour charger les données d'affiliation
async function loadAffiliateData() {
  try {
    // En développement, on peut lire le fichier directement
    if (typeof window === 'undefined') {
      const filePath = join(__dirname, '../../data/affiliate-products.json');
      const data = readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    
    // Fallback avec données statiques pour le client-side
    return getStaticAffiliateData();
  } catch (error) {
    console.warn('Erreur lors du chargement des données d\'affiliation:', error);
    return getStaticAffiliateData();
  }
}

// Données statiques de fallback
function getStaticAffiliateData() {
  return {
    products: [
      {
        id: "talika-bust-phytoserum",
        name: "Bust Phytoserum",
        brand: "Talika",
        description: "Sérum raffermissant naturel pour le buste, particulièrement adapté après une perte de poids rapide avec les traitements GLP-1.",
        benefits: [
          "Raffermit et tonifie la peau du décolleté",
          "Formule naturelle aux extraits végétaux",
          "Adapté aux effets secondaires des GLP-1",
          "Application facile et absorption rapide"
        ],
        price: "49,90 €",
        originalPrice: "59,90 €",
        discount: "17%",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
        affiliateUrl: "https://example.com/talika-bust-phytoserum?ref=glp1france",
        tags: ["raffermissant", "naturel", "post-glp1", "décolleté"],
        rating: 4.6,
        reviews: 127,
        categories: ["soins-corps", "raffermissant", "post-traitement"],
        targetCollections: ["perte-de-poids", "effets-secondaires"],
        contextualKeywords: ["raffermissant", "peau", "décolleté", "fermeté", "glp1", "perte de poids"],
        isActive: true,
        priority: 1,
        created: "2025-01-01",
        updated: "2025-01-01",
        ctaText: "Découvrir Talika Bust",
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
}

export interface Placement {
  id: string;
  name: string;
  position: string;
  style: string;
  priority: number;
  collections: string[];
  isActive: boolean;
}

export interface Rule {
  condition: 'collection' | 'keyword' | 'tag' | 'path';
  value: string;
  products: string[];
  priority: number;
}

/**
 * Récupère tous les produits actifs
 */
export function getActiveProducts(): Product[] {
  return affiliateData.products.filter(product => product.isActive);
}

/**
 * Récupère un produit par son ID
 */
export function getProductById(id: string): Product | null {
  return affiliateData.products.find(product => product.id === id) || null;
}

/**
 * Récupère les produits recommandés pour une collection
 */
export function getProductsForCollection(collectionSlug: string, limit = 3): Product[] {
  const rules = affiliateData.rules.filter(rule => 
    rule.condition === 'collection' && rule.value === collectionSlug
  );
  
  if (rules.length === 0) {
    // Fallback: produits génériques
    return getActiveProducts()
      .sort((a, b) => a.priority - b.priority)
      .slice(0, limit);
  }
  
  const productIds = rules[0].products;
  const products = productIds
    .map(id => getProductById(id))
    .filter(Boolean) as Product[];
  
  return products.slice(0, limit);
}

/**
 * Récupère les produits basés sur des mots-clés contextuels
 */
export function getProductsByKeywords(keywords: string[], collection?: string, limit = 2): Product[] {
  const activeProducts = getActiveProducts();
  
  // Score chaque produit selon la pertinence des mots-clés
  const scoredProducts = activeProducts.map(product => {
    let score = 0;
    
    // Points pour collection correspondante
    if (collection && product.targetCollections.includes(collection)) {
      score += 10;
    }
    
    // Points pour mots-clés correspondants
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // Mots-clés contextuels
      if (product.contextualKeywords.some(pk => pk.toLowerCase().includes(keywordLower))) {
        score += 5;
      }
      
      // Tags
      if (product.tags.some(tag => tag.toLowerCase().includes(keywordLower))) {
        score += 3;
      }
      
      // Description
      if (product.description.toLowerCase().includes(keywordLower)) {
        score += 2;
      }
      
      // Nom du produit
      if (product.name.toLowerCase().includes(keywordLower)) {
        score += 8;
      }
    });
    
    return { product, score };
  });
  
  // Trier par score décroissant et priorité
  return scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.product.priority - b.product.priority;
    })
    .slice(0, limit)
    .map(item => item.product);
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
    if (product.keywords.some(k => k.toLowerCase() === lowerKeyword)) {
      score += 10;
    }
    
    // Correspondance partielle dans les mots-clés
    if (product.keywords.some(k => k.toLowerCase().includes(lowerKeyword))) {
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
 * Récupère les emplacements actifs pour une collection
 */
export function getActivePlacementsForCollection(collectionSlug: string): Placement[] {
  return affiliateData.placements.filter(placement => 
    placement.isActive && 
    (placement.collections.includes('all') || placement.collections.includes(collectionSlug))
  );
}

/**
 * Détermine si un produit doit être affiché selon le contexte
 */
export function shouldDisplayProduct(
  product: Product, 
  context: {
    collection?: string;
    keywords?: string[];
    path?: string;
    position?: string;
  }
): boolean {
  if (!product.isActive) return false;
  
  // Vérifier les règles applicables
  const applicableRules = affiliateData.rules.filter(rule => {
    switch (rule.condition) {
      case 'collection':
        return context.collection === rule.value;
      case 'keyword':
        return context.keywords?.some(k => k.toLowerCase().includes(rule.value.toLowerCase()));
      case 'path':
        return context.path?.includes(rule.value);
      default:
        return false;
    }
  });
  
  // Si des règles s'appliquent, vérifier si le produit est inclus
  if (applicableRules.length > 0) {
    return applicableRules.some(rule => rule.products.includes(product.id));
  }
  
  // Sinon, vérifier la compatibilité générale
  if (context.collection) {
    return product.targetCollections.includes(context.collection);
  }
  
  return true;
}

/**
 * Génère l'URL de tracking pour un produit
 */
export function getTrackingUrl(product: Product, position: string, additionalParams?: Record<string, string>): string {
  const url = new URL(product.affiliateUrl);
  
  // Ajouter les paramètres de tracking
  url.searchParams.set('utm_source', 'glp1-france');
  url.searchParams.set('utm_medium', 'affiliate');
  url.searchParams.set('utm_campaign', product.id);
  url.searchParams.set('utm_content', position);
  
  // Ajouter les paramètres additionnels
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

/**
 * Extrait les mots-clés d'un contenu markdown
 */
export function extractKeywordsFromContent(content: string): string[] {
  const keywords: string[] = [];
  
  // Mots-clés prédéfinis liés aux GLP-1
  const glp1Keywords = [
    'perte de poids', 'raffermissement', 'décolleté', 'seins', 
    'nausées', 'digestion', 'probiotiques', 'collagène',
    'élasticité', 'peau', 'fermeté', 'troubles digestifs',
    'ozempic', 'wegovy', 'saxenda', 'mounjaro', 'trulicity',
    'balance', 'suivi', 'progression', 'mesure'
  ];
  
  const contentLower = content.toLowerCase();
  
  glp1Keywords.forEach(keyword => {
    if (contentLower.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  });
  
  return keywords;
}

/**
 * Formate le prix d'un produit
 */
export function formatPrice(price: string): { 
  value: number; 
  formatted: string; 
  currency: string; 
} {
  const match = price.match(/(\d+[,.]?\d*)\s*€/);
  if (!match) return { value: 0, formatted: price, currency: 'EUR' };
  
  const value = parseFloat(match[1].replace(',', '.'));
  return {
    value,
    formatted: `${value.toFixed(2).replace('.', ',')} €`,
    currency: 'EUR'
  };
}

/**
 * Calcule la réduction d'un produit
 */
export function calculateDiscount(originalPrice: string, currentPrice: string): {
  percentage: number;
  amount: string;
} {
  const original = formatPrice(originalPrice);
  const current = formatPrice(currentPrice);
  
  if (original.value === 0 || current.value === 0) {
    return { percentage: 0, amount: '0 €' };
  }
  
  const percentage = Math.round(((original.value - current.value) / original.value) * 100);
  const amount = `${(original.value - current.value).toFixed(2).replace('.', ',')} €`;
  
  return { percentage, amount };
}

/**
 * Récupère les recommandations intelligentes pour un article
 */
export function getSmartRecommendations(
  collection: string,
  content: string,
  limit = 2
): Product[] {
  const extractedKeywords = extractKeywordsFromContent(content);
  const collectionProducts = getProductsForCollection(collection, limit + 1);
  const keywordProducts = getProductsByKeywords(extractedKeywords, collection, limit + 1);
  
  // Fusionner et dédupliquer
  const allProducts = [...collectionProducts, ...keywordProducts];
  const uniqueProducts = allProducts.filter((product, index, self) => 
    index === self.findIndex(p => p.id === product.id)
  );
  
  return uniqueProducts.slice(0, limit);
}

/**
 * Validation d'un produit
 */
export function validateProduct(product: Partial<Product>): { 
  isValid: boolean; 
  errors: string[]; 
} {
  const errors: string[] = [];
  
  if (!product.id) errors.push('ID manquant');
  if (!product.name) errors.push('Nom manquant');
  if (!product.brand) errors.push('Marque manquante');
  if (!product.description) errors.push('Description manquante');
  if (!product.price) errors.push('Prix manquant');
  if (!product.affiliateUrl) errors.push('URL d\'affiliation manquante');
  if (!product.image) errors.push('Image manquante');
  
  if (product.affiliateUrl && !isValidUrl(product.affiliateUrl)) {
    errors.push('URL d\'affiliation invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validation d'URL
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Statistiques des produits
 */
export function getProductStats(): {
  total: number;
  active: number;
  byCategory: Record<string, number>;
  byCollection: Record<string, number>;
} {
  const products = affiliateData.products;
  const active = products.filter(p => p.isActive);
  
  const byCategory: Record<string, number> = {};
  const byCollection: Record<string, number> = {};
  
  products.forEach(product => {
    product.categories.forEach(category => {
      byCategory[category] = (byCategory[category] || 0) + 1;
    });
    
    product.targetCollections.forEach(collection => {
      byCollection[collection] = (byCollection[collection] || 0) + 1;
    });
  });
  
  return {
    total: products.length,
    active: active.length,
    byCategory,
    byCollection
  };
}
