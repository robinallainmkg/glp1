// Test API pour vérifier la connexion Supabase
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    console.log('🔍 Test de connexion à Supabase...');
    
    // Test de base de la connexion
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de test Supabase:', testError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: testError.message,
        details: testError
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Récupération des produits
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Erreur lors de la récupération des produits:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

        console.log('✅ Produits récupérés:', products?.length ?? 0);
    console.log('🔍 Structure du premier produit:', products?.[0] ? Object.keys(products[0]) : 'Aucun produit');
    console.log('🔍 Premier produit complet:', products?.[0] ?? 'Aucun produit');
    
    return new Response(JSON.stringify({
      success: true,
      count: products?.length || 0,
      products: products || [],
      message: `${products?.length || 0} produits trouvés dans la table products`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur de connexion à Supabase',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
