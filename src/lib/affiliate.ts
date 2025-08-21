// @ts-ignore: Astro content collections
import { getCollection } from 'astro:content';

export interface AffiliateProduct {
  productName: string;
  brand: string;
  productImage: string;
  discountPercent?: number;
  externalLink: string;
  category: string;
  targetAudience: string;
  priority?: number;
  featured?: boolean;
  benefitsText: any;
  slug?: string;
  id?: string;
  customNote?: string;
  displayOrder?: number;
}

export interface ArticleAffiliateProduct {
  product: any;
  displayOrder?: number;
  customNote?: string;
}

/**
 * Récupère tous les produits d'affiliation
 */
export async function getAllAffiliateProducts(): Promise<AffiliateProduct[]> {
  try {
    const products = await getCollection('affiliate-products');
    return products
      .map(product => ({
        ...product.data,
        slug: product.slug,
        id: product.id
      }))
      .sort((a, b) => (a.priority || 999) - (b.priority || 999));
  } catch (error) {
    console.warn('Erreur lors du chargement des produits d\'affiliation:', error);
    return [];
  }
}

/**
 * Récupère les produits d'affiliation par catégorie
 */
export async function getProductsByCategory(category: string): Promise<AffiliateProduct[]> {
  const allProducts = await getAllAffiliateProducts();
  return allProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Récupère les produits mis en avant
 */
export async function getFeaturedProducts(): Promise<AffiliateProduct[]> {
  const allProducts = await getAllAffiliateProducts();
  return allProducts.filter(product => product.featured === true);
}

/**
 * Récupère les produits pour un public cible spécifique
 */
export async function getProductsByTargetAudience(audience: string): Promise<AffiliateProduct[]> {
  const allProducts = await getAllAffiliateProducts();
  return allProducts.filter(product => 
    product.targetAudience.toLowerCase().includes(audience.toLowerCase())
  );
}

/**
 * Récupère les produits liés à un article spécifique
 */
export async function getArticleAffiliateProducts(
  articleAffiliateProducts: ArticleAffiliateProduct[]
): Promise<AffiliateProduct[]> {
  if (!articleAffiliateProducts || articleAffiliateProducts.length === 0) {
    return [];
  }

  const allProducts = await getAllAffiliateProducts();
  const linkedProducts: AffiliateProduct[] = [];

  for (const link of articleAffiliateProducts) {
    const product = allProducts.find(p => p.slug === link.product);
    if (product) {
      linkedProducts.push({
        ...product,
        customNote: link.customNote,
        displayOrder: link.displayOrder
      });
    }
  }

  // Trier par displayOrder si défini, sinon par priority
  return linkedProducts.sort((a, b) => {
    const orderA = a.displayOrder || a.priority || 999;
    const orderB = b.displayOrder || b.priority || 999;
    return orderA - orderB;
  });
}

/**
 * Récupère des produits recommandés basés sur le contenu de l'article
 */
export async function getRecommendedProducts(
  articleContent: string,
  articleCategory?: string,
  maxResults: number = 3
): Promise<AffiliateProduct[]> {
  const allProducts = await getAllAffiliateProducts();
  
  // Mots-clés liés aux GLP-1 et traitements diabète/obésité
  const keywords = [
    'ozempic', 'semaglutide', 'wegovy', 'mounjaro', 'tirzepatide',
    'diabète', 'diabetes', 'obésité', 'perte de poids', 'weight loss',
    'glycémie', 'insuline', 'métabolisme'
  ];

  const contentLower = articleContent.toLowerCase();
  const scored = allProducts.map(product => {
    let score = 0;
    
    // Score basé sur les mots-clés dans le contenu
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 1;
      }
    });
    
    // Score basé sur la catégorie
    if (articleCategory && product.category.toLowerCase() === articleCategory.toLowerCase()) {
      score += 3;
    }
    
    // Bonus pour les produits mis en avant
    if (product.featured) {
      score += 2;
    }
    
    // Bonus pour la priorité
    score += (10 - (product.priority || 10)) * 0.5;
    
    return { product, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.product);
}

/**
 * Formate le texte des bénéfices pour l'affichage
 */
export function formatBenefitsText(benefitsText: any): string {
  if (typeof benefitsText === 'string') {
    return benefitsText;
  }
  
  if (benefitsText && typeof benefitsText === 'object') {
    // Si c'est un objet rich text de TinaCMS, extraire le contenu
    if (benefitsText.children) {
      return extractTextFromRichText(benefitsText);
    }
  }
  
  return '';
}

/**
 * Extrait le texte d'un objet rich text TinaCMS
 */
function extractTextFromRichText(richText: any): string {
  if (!richText || !richText.children) return '';
  
  return richText.children
    .map((child: any) => {
      if (child.type === 'text') return child.text;
      if (child.children) return extractTextFromRichText(child);
      return '';
    })
    .join('');
}

/**
 * Génère l'URL d'affiliation avec tracking
 */
export function generateAffiliateUrl(
  baseUrl: string, 
  productName: string, 
  source: string = 'sidebar'
): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'glp1official');
    url.searchParams.set('utm_medium', 'affiliate');
    url.searchParams.set('utm_campaign', source);
    url.searchParams.set('utm_content', encodeURIComponent(productName));
    return url.toString();
  } catch (error) {
    console.warn('Erreur lors de la génération de l\'URL d\'affiliation:', error);
    return baseUrl;
  }
}

/**
 * Validation des données produit
 */
export function validateProductData(product: Partial<AffiliateProduct>): boolean {
  const required = ['productName', 'brand', 'externalLink', 'category'];
  return required.every(field => product[field as keyof AffiliateProduct]);
}

/**
 * Cache simple pour les produits d'affiliation
 */
const productCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedProducts(key: string, fetcher: () => Promise<any>): Promise<any> {
  const cached = productCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetcher();
  productCache.set(key, { data, timestamp: now });
  return data;
}

/**
 * Statistiques d'utilisation des produits d'affiliation
 */
export async function getProductStats() {
  const products = await getAllAffiliateProducts();
  
  return {
    total: products.length,
    featured: products.filter(p => p.featured).length,
    categories: [...new Set(products.map(p => p.category))],
    brands: [...new Set(products.map(p => p.brand))],
    withDiscount: products.filter(p => p.discountPercent && p.discountPercent > 0).length
  };
}
