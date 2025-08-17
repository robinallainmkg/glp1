// API pour la gestion des utilisateurs - Admin GLP-1
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, url }) => {
  console.log('🔥 API /users GET appelée');
  console.log('🔗 URL:', url.toString());
  
  try {
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const userId = searchParams.get('id');

    console.log('📊 Paramètres:', { page, limit, sortBy, sortOrder, userId });

    // Si un ID utilisateur spécifique est demandé
    if (userId) {
      console.log('🎯 Recherche utilisateur spécifique:', userId);
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Utilisateur non trouvé' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Utilisateur trouvé:', user.email);
      return new Response(JSON.stringify({
        success: true,
        user
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Pagination
    const offset = (page - 1) * limit;
    console.log('📄 Pagination:', { page, limit, offset });

    // Récupérer la liste des utilisateurs avec pagination
    console.log('🔍 Requête Supabase users...');
    const { data: users, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    console.log('📊 Résultat Supabase:');
    console.log('- Error:', error);
    console.log('- Count:', count);
    console.log('- Users length:', users?.length);
    console.log('- Users (first 2):', users?.slice(0, 2));

    if (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors du chargement des utilisateurs',
        debug: error 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Statistiques des utilisateurs
    console.log('📈 Calcul des statistiques...');
    const { data: statsData } = await supabaseAdmin
      .from('users')
      .select('created_at, email_confirmed_at');

    const stats = {
      total: count || 0,
      verified: statsData?.filter(u => u.email_confirmed_at).length || 0,
      unverified: statsData?.filter(u => !u.email_confirmed_at).length || 0,
      recent: statsData?.filter(u => {
        const created = new Date(u.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length || 0
    };

    console.log('📊 Stats calculées:', stats);

    const response = {
      success: true,
      data: users || [],
      count: count || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    };

    console.log('✅ Réponse finale:', {
      success: response.success,
      dataLength: response.data.length,
      count: response.count,
      pagination: response.pagination
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Erreur API users:', error);
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
    const userId = searchParams.get('id');

    console.log('🗑️ DELETE API - ID reçu:', userId, 'Type:', typeof userId);
    console.log('🔗 URL complète:', url.toString());
    console.log('📊 Tous les paramètres:', Object.fromEntries(searchParams.entries()));

    if (!userId || userId.trim() === '') {
      console.error('❌ ID utilisateur manquant ou vide');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID utilisateur manquant',
        debug: {
          received_id: userId,
          type: typeof userId,
          url: url.toString()
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier d'abord si l'utilisateur existe
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (checkError || !existingUser) {
      console.error('❌ Utilisateur non trouvé:', userId, checkError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Utilisateur non trouvé',
        debug: {
          user_id: userId,
          check_error: checkError?.message
        }
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Utilisateur trouvé:', existingUser.email);

    // Supprimer l'utilisateur
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la suppression',
        debug: {
          supabase_error: error.message,
          user_id: userId
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Utilisateur supprimé avec succès:', userId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      deleted_user_id: userId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur API delete user:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur interne',
      debug: {
        error_message: error.message
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;
