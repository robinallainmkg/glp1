// API pour la gestion des produits - Admin GLP-1
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, url }) => {
  console.log('🔥 API /products GET appelée');
  
  try {
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const productId = searchParams.get('id');
    const brandId = searchParams.get('brand_id');

    // Si un ID de produit spécifique est demandé
    if (productId) {
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .select(`
          *,
          brands (
            id,
            name,
            logo_url
          ),
          product_categories (
            id,
            name
          )
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération produit:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Produit non trouvé' 
        }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        success: true,
        product
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Construire la requête avec filtres
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        brands (
          id,
          name,
          logo_url
        ),
        product_categories (
          id,
          name
        )
      `, { count: 'exact' })
      .order('name', { ascending: true });

    // Filtre par marque si spécifié
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    // Pagination
    const offset = (page - 1) * limit;
    const { data: products, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erreur récupération produits:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors du chargement des produits' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      data: products || [],
      count: count || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Erreur API products:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('➕ Création produit:', body);

    const { 
      name, 
      brand_id, 
      category_id, 
      description, 
      price, 
      affiliate_url, 
      image_url, 
      is_glp1_recommended, 
      tags 
    } = body;

    if (!name || !brand_id || !description || !price) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Nom, marque, description et prix requis' 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{
        name: name.trim(),
        brand_id,
        category_id: category_id || null,
        description: description.trim(),
        price: parseFloat(price),
        affiliate_url: affiliate_url || null,
        image_url: image_url || null,
        is_glp1_recommended: is_glp1_recommended || false,
        stock_status: 'available',
        tags: tags || [],
        rating: 0,
        review_count: 0,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création produit:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la création' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('✅ Produit créé:', data.name);
    return new Response(JSON.stringify({
      success: true,
      message: 'Produit créé avec succès',
      product: data
    }), { status: 201, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Erreur API POST products:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const PUT: APIRoute = async ({ request, url }) => {
  try {
    const searchParams = url.searchParams;
    const productId = searchParams.get('id');
    const body = await request.json();

    if (!productId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID produit manquant' 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { 
      name, 
      brand_id, 
      category_id, 
      description, 
      price, 
      affiliate_url, 
      image_url, 
      is_glp1_recommended, 
      stock_status, 
      tags, 
      is_active 
    } = body;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name: name?.trim(),
        brand_id,
        category_id,
        description: description?.trim(),
        price: price ? parseFloat(price) : undefined,
        affiliate_url,
        image_url,
        is_glp1_recommended,
        stock_status,
        tags,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur modification produit:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la modification' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Produit modifié avec succès',
      product: data
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Erreur API PUT products:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    const searchParams = url.searchParams;
    const productId = searchParams.get('id');

    if (!productId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID produit manquant' 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('❌ Erreur suppression produit:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la suppression' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Produit supprimé avec succès'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Erreur API DELETE products:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const prerender = false;
