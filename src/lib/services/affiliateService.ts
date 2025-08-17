import { supabase } from '../supabase.ts';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website_url?: string;
  discount_percentage: number;
  commission_percentage: number;
  affiliate_code?: string;
  description?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  glp1_relevant: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  brand_id: string;
  category_id?: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  currency: string;
  image_url?: string;
  affiliate_url?: string;
  glp1_benefit?: string;
  side_effects_help: boolean;
  recommended_for?: string[];
  stock_status: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  brand?: Brand;
  category?: ProductCategory;
}

export interface Deal {
  id: string;
  brand_id: string;
  product_id?: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'code';
  discount_value: number;
  promo_code?: string;
  start_date?: string;
  end_date?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  brand?: Brand;
  product?: Product;
}

export interface AffiliateStats {
  id: string;
  product_id?: string;
  brand_id: string;
  deal_id?: string;
  click_count: number;
  conversion_count: number;
  revenue: number;
  date: string;
  created_at: string;
}

// Service pour les marques
export class BrandService {
  static async getAll(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getActive(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getBySlug(slug: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .insert(brand)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<Brand>): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

// Service pour les produits
export class ProductService {
  static async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*)
      `)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getActive(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*)
      `)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getFeatured(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getByBrand(brandId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*)
      `)
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getForSideEffects(sideEffect: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*)
      `)
      .eq('is_active', true)
      .eq('side_effects_help', true)
      .contains('recommended_for', [sideEffect])
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'brand' | 'category'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

// Service pour les deals
export class DealService {
  static async getAll(): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        brand:brands(*),
        product:products(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getActive(): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        brand:brands(*),
        product:products(*)
      `)
      .eq('is_active', true)
      .or('end_date.is.null,end_date.gte.now()')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getByBrand(brandId: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        brand:brands(*),
        product:products(*)
      `)
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async create(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'brand' | 'product'>): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .insert(deal)
      .select(`
        *,
        brand:brands(*),
        product:products(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<Deal>): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        brand:brands(*),
        product:products(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

// Service pour les catégories
export class CategoryService {
  static async getAll(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getGLP1Relevant(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('glp1_relevant', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
}

// Service pour les statistiques
export class StatsService {
  static async trackClick(productId: string, brandId: string, dealId?: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase.rpc('increment_click_count', {
      p_product_id: productId,
      p_brand_id: brandId,
      p_deal_id: dealId,
      p_date: today
    });
    
    if (error) throw error;
  }

  static async trackConversion(productId: string, brandId: string, revenue: number, dealId?: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase.rpc('track_conversion', {
      p_product_id: productId,
      p_brand_id: brandId,
      p_revenue: revenue,
      p_deal_id: dealId,
      p_date: today
    });
    
    if (error) throw error;
  }

  static async getStatsByDateRange(startDate: string, endDate: string): Promise<AffiliateStats[]> {
    const { data, error } = await supabase
      .from('affiliate_stats')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}
