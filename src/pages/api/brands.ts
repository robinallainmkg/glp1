// API pour la gestion des marques - Admin GLP-1
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, url }) => {
  console.log('🔥 API /brands GET appelée');
  console.log('🔗 URL:', url.toString());
  
  try {
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const brandId = searchParams.get('id');

    console.log('📊 Paramètres:', { page, limit, brandId });

    // Si un ID de marque spécifique est demandé
    if (brandId) {
      console.log('🎯 Recherche marque spécifique:', brandId);
      const { data: brand, error } = await supabaseAdmin
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération de la marque:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Marque non trouvée' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Marque trouvée:', brand.name);
      return new Response(JSON.stringify({
        success: true,
        brand
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Pagination
    const offset = (page - 1) * limit;
    console.log('📄 Pagination:', { page, limit, offset });

    // Récupérer la liste des marques avec pagination
    console.log('🔍 Requête Supabase brands...');
    const { data: brands, error, count } = await supabaseAdmin
      .from('brands')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    console.log('📊 Résultat Supabase:');
    console.log('- Error:', error);
    console.log('- Count:', count);
    console.log('- Brands length:', brands?.length);

    if (error) {
      console.error('❌ Erreur lors de la récupération des marques:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors du chargement des marques',
        debug: error 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = {
      success: true,
      data: brands || [],
      count: count || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    console.log('✅ Réponse finale:', {
      success: response.success,
      dataLength: response.data.length,
      count: response.count
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Erreur API brands:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne',
      debug: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('➕ Création marque:', body);

    const { name, description, logo_url, website_url, default_commission, default_discount, partner_code, contact_email } = body;

    if (!name || !description) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Nom et description requis' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabaseAdmin
      .from('brands')
      .insert([{
        name: name.trim(),
        description: description.trim(),
        logo_url: logo_url || null,
        website_url: website_url || null,
        default_commission: default_commission || 5,
        default_discount: default_discount || 0,
        partner_code: partner_code || null,
        contact_email: contact_email || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création marque:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la création',
        debug: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Marque créée:', data.name);
    return new Response(JSON.stringify({
      success: true,
      message: 'Marque créée avec succès',
      brand: data
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Erreur API POST brands:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne',
      debug: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, url }) => {
  try {
    const searchParams = url.searchParams;
    const brandId = searchParams.get('id');
    const body = await request.json();

    console.log('✏️ Modification marque:', brandId, body);

    if (!brandId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID marque manquant' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { name, description, logo_url, website_url, default_commission, default_discount, partner_code, contact_email, is_active } = body;

    const { data, error } = await supabaseAdmin
      .from('brands')
      .update({
        name: name?.trim(),
        description: description?.trim(),
        logo_url,
        website_url,
        default_commission,
        default_discount,
        partner_code,
        contact_email,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', brandId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur modification marque:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la modification',
        debug: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Marque modifiée:', data.name);
    return new Response(JSON.stringify({
      success: true,
      message: 'Marque modifiée avec succès',
      brand: data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Erreur API PUT brands:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne',
      debug: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    const searchParams = url.searchParams;
    const brandId = searchParams.get('id');

    console.log('🗑️ DELETE API brands - ID reçu:', brandId);

    if (!brandId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID marque manquant' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier que la marque existe
    const { data: existingBrand, error: checkError } = await supabaseAdmin
      .from('brands')
      .select('id, name')
      .eq('id', brandId)
      .single();

    if (checkError || !existingBrand) {
      console.error('❌ Marque non trouvée:', brandId);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Marque non trouvée' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Supprimer la marque
    const { error } = await supabaseAdmin
      .from('brands')
      .delete()
      .eq('id', brandId);

    if (error) {
      console.error('❌ Erreur suppression marque:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la suppression',
        debug: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Marque supprimée:', existingBrand.name);
    return new Response(JSON.stringify({
      success: true,
      message: 'Marque supprimée avec succès'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Erreur API DELETE brands:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne',
      debug: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;
