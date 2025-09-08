import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validation des données requises
    const requiredFields = ['professional_id', 'rating', 'comment', 'patient_name'];
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
    
    // Validation du rating
    if (body.rating < 1 || body.rating > 5) {
      return new Response(JSON.stringify({
        error: 'La note doit être comprise entre 1 et 5'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Vérification que le professionnel existe
    const { data: professional, error: professionalError } = await supabase
      .from('health_professionals')
      .select('id')
      .eq('id', body.professional_id)
      .single();
    
    if (professionalError || !professional) {
      return new Response(JSON.stringify({
        error: 'Professionnel non trouvé'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insertion de l'avis
    const { data, error } = await supabase
      .from('professional_reviews')
      .insert([{
        ...body,
        approved: false, // Nécessite une modération
        helpful_count: 0
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur insertion avis:', error);
      return new Response(JSON.stringify({
        error: 'Erreur lors de l\'ajout de l\'avis',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Avis ajouté avec succès (en attente de modération)',
      review: data
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur API avis:', error);
    return new Response(JSON.stringify({
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const searchParams = new URL(request.url).searchParams;
    const professionalId = searchParams.get('professional_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!professionalId) {
      return new Response(JSON.stringify({
        error: 'ID du professionnel requis'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Récupération des avis approuvés
    const { data, error, count } = await supabase
      .from('professional_reviews')
      .select('*', { count: 'exact' })
      .eq('professional_id', professionalId)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Erreur récupération avis:', error);
      return new Response(JSON.stringify({
        error: 'Erreur lors de la récupération des avis',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Formatage des résultats
    const reviews = data?.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      patientName: review.patient_name,
      date: review.created_at,
      helpful: review.helpful_count || 0
    })) || [];
    
    return new Response(JSON.stringify({
      reviews,
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
    console.error('Erreur API récupération avis:', error);
    return new Response(JSON.stringify({
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
