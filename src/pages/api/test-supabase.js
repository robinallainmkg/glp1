// Test simple de l'API Supabase
import { supabaseAdmin } from '../../lib/supabase.ts';

export const GET = async () => {
  try {
    console.log('🧪 [TEST] Test connexion Supabase...');
    
    const { data, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('❌ [TEST] Erreur Supabase:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`✅ [TEST] Connexion réussie: ${data?.length} utilisateurs trouvés (total: ${count})`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Connexion Supabase réussie',
      count: count,
      sample: data?.slice(0, 2) || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ [TEST] Erreur:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
