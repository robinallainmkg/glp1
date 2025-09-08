import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const searchParams = new URL(request.url).searchParams;
    
    // Paramètres de recherche
    const query = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const specialty = searchParams.get('specialty') || '';
    const glp1Only = searchParams.get('glp1') === 'true';
    const newPatientsOnly = searchParams.get('new_patients') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Construction de la requête Supabase
    let supabaseQuery = supabase
      .from('professional_search_view')
      .select('*');
    
    // Filtres
    if (query) {
      supabaseQuery = supabaseQuery.ilike('search_text', `%${query}%`);
    }
    
    if (city) {
      supabaseQuery = supabaseQuery.eq('city_slug', city);
    }
    
    if (specialty) {
      supabaseQuery = supabaseQuery.ilike('specialty', `%${specialty}%`);
    }
    
    if (glp1Only) {
      supabaseQuery = supabaseQuery.eq('accepts_glp1', true);
    }
    
    if (newPatientsOnly) {
      supabaseQuery = supabaseQuery.eq('accepts_new_patients', true);
    }
    
    if (featured) {
      supabaseQuery = supabaseQuery.eq('featured', true);
    }
    
    // Tri et pagination
    supabaseQuery = supabaseQuery
      .order('featured', { ascending: false })
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await supabaseQuery;
    
    if (error) {
      console.error('Erreur recherche professionnels:', error);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la recherche',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Formatage des résultats
    const results = data?.map(professional => ({
      id: professional.id,
      name: `${professional.title} ${professional.first_name} ${professional.last_name}`,
      specialty: professional.specialty,
      subSpecialties: professional.sub_specialties || [],
      hospitalClinic: professional.hospital_clinic,
      address: professional.address,
      city: professional.city_name,
      citySlug: professional.city_slug,
      postalCode: professional.postal_code,
      department: professional.department,
      region: professional.region,
      phone: professional.phone,
      email: professional.email,
      website: professional.website,
      acceptsGlp1: professional.accepts_glp1,
      acceptsNewPatients: professional.accepts_new_patients,
      consultationFee: professional.consultation_fee,
      languages: professional.languages || [],
      rating: professional.rating || 0,
      reviewCount: professional.review_count || 0,
      verified: professional.verified,
      featured: professional.featured
    })) || [];
    
    return new Response(JSON.stringify({
      results,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache 5 minutes
      }
    });
    
  } catch (error) {
    console.error('Erreur API recherche:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validation des données requises
    const requiredFields = ['first_name', 'last_name', 'title', 'specialty', 'address', 'city_id', 'postal_code'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({
        error: 'Champs manquants',
        missing: missingFields
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insertion du nouveau professionnel
    const { data, error } = await supabase
      .from('health_professionals')
      .insert([{
        ...body,
        verified: false, // Nécessite une vérification manuelle
        featured: false,
        rating: 0,
        review_count: 0
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur insertion professionnel:', error);
      return new Response(JSON.stringify({
        error: 'Erreur lors de l\'ajout',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Professionnel ajouté avec succès (en attente de vérification)',
      professional: data
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur API ajout:', error);
    return new Response(JSON.stringify({
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
