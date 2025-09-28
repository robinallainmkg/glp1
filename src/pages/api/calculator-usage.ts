import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validation des données
    const { age, weight, height, imc, region, mutuelle } = data;
    
    if (!age || !weight || !height || !region) {
      return new Response(JSON.stringify({ error: 'Données manquantes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log pour analytics (remplacer par vraie base de données)
    console.log('📊 Usage Calculateur:', {
      imc: parseFloat(imc),
      region,
      mutuelle,
      age: parseInt(age),
      timestamp: new Date().toISOString()
    });

    // Ici vous pouvez :
    // 1. Stocker dans Supabase pour analytics
    // 2. Envoyer à Google Analytics via Measurement Protocol
    // 3. Créer des segments d'audience basés sur IMC/région
    
    /*
    // Exemple Supabase
    const { error } = await supabaseClient
      .from('calculator_usage')
      .insert([{
        imc: parseFloat(imc),
        region,
        mutuelle,
        age: parseInt(age),
        created_at: new Date().toISOString()
      }]);
    */

    // Analytics avancées - Segment utilisateurs
    let userSegment = '';
    if (parseFloat(imc) >= 35) userSegment = 'high-imc';
    else if (parseFloat(imc) >= 30) userSegment = 'medium-imc';
    else userSegment = 'low-imc';

    const insights = {
      segment: userSegment,
      recommendedTreatment: parseFloat(imc) >= 30 ? 'wegovy' : 'ozempic',
      eligibleForReimbursement: parseFloat(imc) >= 30,
      targetPrice: parseFloat(imc) >= 30 ? 272 : 89
    };

    return new Response(JSON.stringify({ 
      success: true,
      insights 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur analytics calculateur:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Erreur serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
