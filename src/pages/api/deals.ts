// API pour la gestion des deals - Admin GLP-1
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, url }) => {
  console.log('🔥 API /deals GET appelée');
  
  try {
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const dealId = searchParams.get('id');

    // Si un ID de deal spécifique est demandé
    if (dealId) {
      const { data: deal, error } = await supabaseAdmin
        .from('deals')
        .select(`
          *,
          brands (
            id,
            name,
            logo_url
          ),
          products (
            id,
            name,
            image_url
          )
        `)
        .eq('id', dealId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération deal:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Deal non trouvé' 
        }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        success: true,
        deal
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Récupération de la liste avec pagination
    const offset = (page - 1) * limit;
    const { data: deals, error, count } = await supabaseAdmin
      .from('deals')
      .select(`
        *,
        brands (
          id,
          name,
          logo_url
        ),
        products (
          id,
          name,
          image_url
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erreur récupération deals:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors du chargement des deals' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      data: deals || [],
      count: count || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Erreur API deals:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('➕ Création deal:', body);

    const { 
      title, 
      brand_id, 
      product_id, 
      discount_percentage, 
      promo_code, 
      commission_percentage, 
      start_date, 
      end_date 
    } = body;

    if (!title || !brand_id || !discount_percentage || !commission_percentage) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Titre, marque, remise et commission requis' 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { data, error } = await supabaseAdmin
      .from('deals')
      .insert([{
        title: title.trim(),
        brand_id,
        product_id: product_id || null,
        discount_percentage: parseFloat(discount_percentage),
        promo_code: promo_code || null,
        commission_percentage: parseFloat(commission_percentage),
        start_date: start_date || new Date().toISOString(),
        end_date: end_date || null,
        is_active: true,
        click_count: 0,
        conversion_count: 0,
        revenue: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création deal:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la création' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('✅ Deal créé:', data.title);
    return new Response(JSON.stringify({
      success: true,
      message: 'Deal créé avec succès',
      deal: data
    }), { status: 201, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Erreur API POST deals:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const PUT: APIRoute = async ({ request, url }) => {
  try {
    const searchParams = url.searchParams;
    const dealId = searchParams.get('id');
    const body = await request.json();

    if (!dealId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID deal manquant' 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { 
      title, 
      brand_id, 
      product_id, 
      discount_percentage, 
      promo_code, 
      commission_percentage, 
      start_date, 
      end_date, 
      is_active 
    } = body;

    const { data, error } = await supabaseAdmin
      .from('deals')
      .update({
        title: title?.trim(),
        brand_id,
        product_id,
        discount_percentage: discount_percentage ? parseFloat(discount_percentage) : undefined,
        promo_code,
        commission_percentage: commission_percentage ? parseFloat(commission_percentage) : undefined,
        start_date,
        end_date,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur modification deal:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la modification' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Deal modifié avec succès',
      deal: data
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Erreur API PUT deals:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    const searchParams = url.searchParams;
    const dealId = searchParams.get('id');

    if (!dealId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID deal manquant' 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { error } = await supabaseAdmin
      .from('deals')
      .delete()
      .eq('id', dealId);

    if (error) {
      console.error('❌ Erreur suppression deal:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la suppression' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Deal supprimé avec succès'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Erreur API DELETE deals:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const prerender = false;
