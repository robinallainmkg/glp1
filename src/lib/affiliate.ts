// @ts-ignore: Supabase client
import { supabase } from './supabase';

export interface AffiliateProduct {
  productName: string;
  brand: string;
  productImage: string;
  discountPercent?: number;
  discountCode?: string;
  promoCode?: string;
  externalLink: string;
  category: string;
  priority?: number;
  featured?: boolean;
  benefitsText?: string;
  description?: string;
  slug: string;
  id: string;
  displayOrder?: number;
  customNote?: string;
  saleBadgeText?: string;
  originalPrice?: number;
  discountedPrice?: number;
  isOnSale?: boolean;
}

export interface ArticleAffiliateProduct {
  product: string;
  displayOrder?: number;
  customNote?: string;
}

/**
 * Récupère tous les produits d'affiliation depuis Supabase
 */
export async function getAllAffiliateProducts(): Promise<AffiliateProduct[]> {
  try {
    console.log('🔍 Connexion à Supabase pour charger les produits...');

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('priority', { ascending: true });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return [];
    }

    console.log(`✅ Produits Supabase chargés: ${products?.length || 0} produits trouvés`);
    
    // Transformer les données pour correspondre à l'interface
    return products?.map(product => ({
      id: product.id,
      productName: product.title,
      brand: product.brand,
      externalLink: product.external_link,
      productImage: product.product_image,
      category: product.category,
      featured: product.featured || false,
      priority: product.priority || 999,
      description: product.description,
      benefitsText: product.benefits_text,
      discountPercent: product.discount_percent,
      discountCode: product.discount_code,
      promoCode: product.discount_code,
      saleBadgeText: generateSaleBadge(product.discount_percent, product.featured),
      originalPrice: product.price,
      discountedPrice: calculateDiscountedPrice(product.price, product.discount_percent),
      isOnSale: (product.discount_percent && product.discount_percent > 0) || false,
      slug: product.slug || generateSlug(product.title)
    })) || [];

// Fonctions utilitaires pour générer les données des produits
function generateSaleBadge(discountPercent?: number, featured?: boolean): string | undefined {
  if (discountPercent && discountPercent > 0) {
    return `Promo -${discountPercent}%`;
  }
  if (featured) {
    return 'RECOMMANDÉ';
  }
  return undefined;
}

function calculateDiscountedPrice(originalPrice?: number, discountPercent?: number): number | undefined {
  if (!originalPrice || !discountPercent) return undefined;
  return Math.round(originalPrice * (1 - discountPercent / 100) * 100) / 100;
}

function generateSlug(name?: string): string {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

  } catch (error) {
    console.warn("❌ Erreur lors du chargement des produits d'affiliation depuis Supabase:", error);
    return [];
  }
}/**
 * Récupère les produits d'affiliation par catégorie
 */
export async function getProductsByCategory(category: string): Promise<AffiliateProduct[]> {
  const allProducts = await getAllAffiliateProducts();
  return allProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Récupère les produits par marque
 */
export async function getProductsByBrand(brand: string, maxResults: number = 10): Promise<AffiliateProduct[]> {
  const allProducts = await getAllAffiliateProducts();
  return allProducts
    .filter(product => product.brand.toLowerCase() === brand.toLowerCase())
    .slice(0, maxResults);
}

/**
 * Récupère les produits mis en avant
 */
export async function getFeaturedProducts(): Promise<AffiliateProduct[]> {
  const allProducts = await getAllAffiliateProducts();
  return allProducts.filter(product => product.featured === true);
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
  try {
    const allProducts = await getAllAffiliateProducts();
    
    // Filtrer d'abord par catégorie si fournie
    let filteredProducts = allProducts;
    if (articleCategory) {
      const categoryMatches = allProducts.filter(product => 
        product.category.toLowerCase().includes(articleCategory.toLowerCase())
      );
      if (categoryMatches.length > 0) {
        filteredProducts = categoryMatches;
      }
    }
    
    // Prioriser les produits Talika et Nutrimuscle
    const talikaProducts = filteredProducts.filter(p => p.brand.toLowerCase() === 'talika');
    const nutrimuscleProducts = filteredProducts.filter(p => p.brand.toLowerCase() === 'nutrimuscle');
    const otherProducts = filteredProducts.filter(p => 
      p.brand.toLowerCase() !== 'talika' && p.brand.toLowerCase() !== 'nutrimuscle'
    );
    
    // Mélanger intelligemment : 1-2 Talika, 1-2 Nutrimuscle, puis autres
    const result = [
      ...talikaProducts.slice(0, 2),
      ...nutrimuscleProducts.slice(0, 2),
      ...otherProducts
    ].slice(0, maxResults);
    
    // Trier par priorité si pas assez de produits spécialisés
    if (result.length < maxResults) {
      const remainingProducts = allProducts
        .filter(p => !result.some(r => r.slug === p.slug))
        .sort((a, b) => (a.priority || 999) - (b.priority || 999));
      
      result.push(...remainingProducts.slice(0, maxResults - result.length));
    }
    
    return result;
  } catch (error) {
    console.warn('Erreur lors du chargement des produits recommandés:', error);
    return [];
  }
}

/**
 * Formate le texte des bénéfices pour l'affichage
 */
export function formatBenefitsText(benefitsText: any): string {
  if (typeof benefitsText === 'string') {
    return benefitsText;
  }
  
  if (benefitsText && typeof benefitsText === 'object') {
    // Si c'est un objet structuré, extraire le contenu
    if (benefitsText.children) {
      return extractTextFromRichText(benefitsText);
    }
  }
  
  return '';
}

/**
 * Extrait le texte d'un objet structuré
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

/**
 * Récupère un produit par son id/slug
 */
export async function getProductById(id: string): Promise<AffiliateProduct | null> {
  if (!id) return null;
  const all = await getAllAffiliateProducts();
  const found = all.find(p => p.id === id || p.slug === id || String(p.id) === String(id));
  return found || null;
}
