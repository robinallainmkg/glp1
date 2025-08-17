import { supabaseAdmin } from '../../../lib/supabase';

export async function GET({ request }) {
  try {
    console.log('📊 API Stats - Récupération des statistiques d\'affiliation');

    // Compter les marques
    const { count: brandsCount, error: brandsError } = await supabaseAdmin
      .from('brands')
      .select('*', { count: 'exact', head: true });

    if (brandsError) {
      console.error('❌ Erreur comptage marques:', brandsError);
      throw brandsError;
    }

    // Compter les produits
    const { count: productsCount, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      console.error('❌ Erreur comptage produits:', productsError);
      throw productsError;
    }

    // Compter les deals
    const { count: dealsCount, error: dealsError } = await supabaseAdmin
      .from('deals')
      .select('*', { count: 'exact', head: true });

    if (dealsError) {
      console.error('❌ Erreur comptage deals:', dealsError);
      throw dealsError;
    }

    // Calculer le revenu total des deals
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('deals')
      .select('revenue')
      .not('revenue', 'is', null);

    if (revenueError) {
      console.error('❌ Erreur calcul revenus:', revenueError);
      throw revenueError;
    }

    const totalRevenue = revenueData?.reduce((sum, deal) => sum + (deal.revenue || 0), 0) || 0;

    // Compter les deals actifs (non expirés)
    const now = new Date().toISOString();
    const { count: activeDealsCount, error: activeDealsError } = await supabaseAdmin
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .or(`end_date.is.null,end_date.gte.${now}`);

    if (activeDealsError) {
      console.error('❌ Erreur comptage deals actifs:', activeDealsError);
      throw activeDealsError;
    }

    const stats = {
      brands: brandsCount || 0,
      products: productsCount || 0,
      deals: dealsCount || 0,
      activeDeals: activeDealsCount || 0,
      totalRevenue: totalRevenue,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Statistiques récupérées:', stats);

    return new Response(JSON.stringify({
      success: true,
      data: stats,
      message: 'Statistiques récupérées avec succès'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Erreur API Stats:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur interne du serveur',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
