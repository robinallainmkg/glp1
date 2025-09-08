import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const searchParams = new URL(request.url).searchParams;
    const region = searchParams.get('region') || '';
    
    // Construction de la requête
    let supabaseQuery = supabase
      .from('city_stats_view')
      .select('*');
    
    if (region) {
      supabaseQuery = supabaseQuery.eq('region', region);
    }
    
    supabaseQuery = supabaseQuery.order('professional_count', { ascending: false });
    
    const { data, error } = await supabaseQuery;
    
    if (error) {
      console.error('Erreur récupération villes:', error);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la récupération des villes',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Formatage des résultats
    const cities = data?.map(city => ({
      id: city.id,
      name: city.name,
      slug: city.slug,
      postalCode: city.postal_code,
      department: city.department,
      departmentCode: city.department_code,
      region: city.region,
      latitude: city.latitude,
      longitude: city.longitude,
      professionalCount: city.professional_count || 0,
      glp1ProfessionalCount: city.glp1_professional_count || 0,
      averageRating: city.average_rating || 0,
      newPatientsCount: city.new_patients_count || 0
    })) || [];
    
    // Statistiques globales
    const totalProfessionals = cities.reduce((sum, city) => sum + city.professionalCount, 0);
    const totalGlp1Professionals = cities.reduce((sum, city) => sum + city.glp1ProfessionalCount, 0);
    const citiesWithProfessionals = cities.filter(city => city.professionalCount > 0).length;
    
    return new Response(JSON.stringify({
      cities,
      stats: {
        totalCities: cities.length,
        citiesWithProfessionals,
        totalProfessionals,
        totalGlp1Professionals,
        averageRating: cities.length > 0 
          ? cities.reduce((sum, city) => sum + city.averageRating, 0) / cities.length 
          : 0
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache 1 heure
      }
    });
    
  } catch (error) {
    console.error('Erreur API villes:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
