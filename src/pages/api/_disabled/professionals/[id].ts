import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ params, url, request }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'ID du professionnel requis' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Récupération du professionnel avec ses avis
    const { data: professional, error: professionalError } = await supabase
      .from('professional_search_view')
      .select('*')
      .eq('id', id)
      .single();
    
    if (professionalError || !professional) {
      return new Response(JSON.stringify({ 
        error: 'Professionnel non trouvé' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Récupération des avis
    const { data: reviews, error: reviewsError } = await supabase
      .from('professional_reviews')
      .select('*')
      .eq('professional_id', id)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (reviewsError) {
      console.error('Erreur récupération avis:', reviewsError);
    }
    
    // Formatage du résultat
    const result = {
      id: professional.id,
      name: `${professional.title} ${professional.first_name} ${professional.last_name}`,
      title: professional.title,
      firstName: professional.first_name,
      lastName: professional.last_name,
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
      featured: professional.featured,
      bio: professional.bio,
      certifications: professional.certifications || [],
      education: professional.education || [],
      experience: professional.experience || [],
      reviews: reviews?.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        patientName: review.patient_name,
        date: review.created_at,
        helpful: review.helpful_count || 0
      })) || []
    };
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600' // Cache 10 minutes
      }
    });
    
  } catch (error) {
    console.error('Erreur API professionnel:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'ID du professionnel requis' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Mise à jour du professionnel
    const { data, error } = await supabase
      .from('health_professionals')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur mise à jour professionnel:', error);
      return new Response(JSON.stringify({
        error: 'Erreur lors de la mise à jour',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!data) {
      return new Response(JSON.stringify({ 
        error: 'Professionnel non trouvé' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Professionnel mis à jour avec succès',
      professional: data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur API mise à jour:', error);
    return new Response(JSON.stringify({
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'ID du professionnel requis' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Suppression du professionnel (cascade sur les avis)
    const { error } = await supabase
      .from('health_professionals')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erreur suppression professionnel:', error);
      return new Response(JSON.stringify({
        error: 'Erreur lors de la suppression',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Professionnel supprimé avec succès'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur API suppression:', error);
    return new Response(JSON.stringify({
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
