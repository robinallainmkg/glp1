// ========================================
// API USERS - ENDPOINT SPÉCIFIQUE PAR ID
// Gestion d'un utilisateur spécifique (GET, PUT, DELETE)
// ========================================

import { getUserById, updateUser, deleteUser } from '../../../lib/services/userService.js';

export const GET = async ({ params }) => {
  try {
    const userId = parseInt(params.id);
    console.log('📥 [API] GET /api/users/[id] - ID:', userId);
    
    if (!userId || isNaN(userId)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID utilisateur invalide'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { data: user, error } = await getUserById(userId);
    
    if (error) {
      console.error('❌ [API] Erreur getUserById:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Erreur lors de la récupération de l\'utilisateur',
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Utilisateur non trouvé'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ [API] Utilisateur récupéré:', user.id);
    return new Response(JSON.stringify({
      success: true,
      data: user
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ [API] Erreur GET /api/users/[id]:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT = async ({ params, request }) => {
  try {
    const userId = parseInt(params.id);
    console.log('📥 [API] PUT /api/users/[id] - ID:', userId);
    
    if (!userId || isNaN(userId)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID utilisateur invalide'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userData = await request.json();
    console.log('📋 [API] Données de mise à jour:', { userId, updates: Object.keys(userData) });
    
    const { data: updatedUser, error } = await updateUser(userId, userData);
    
    if (error) {
      console.error('❌ [API] Erreur updateUser:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'utilisateur',
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!updatedUser) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Utilisateur non trouvé'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ [API] Utilisateur mis à jour:', updatedUser.id);
    return new Response(JSON.stringify({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ [API] Erreur PUT /api/users/[id]:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE = async ({ params }) => {
  try {
    const userId = parseInt(params.id);
    console.log('📥 [API] DELETE /api/users/[id] - ID:', userId);
    
    if (!userId || isNaN(userId)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID utilisateur invalide'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { error } = await deleteUser(userId);
    
    if (error) {
      console.error('❌ [API] Erreur deleteUser:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Erreur lors de la suppression de l\'utilisateur',
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
    }
    
    console.log('✅ [API] Utilisateur supprimé:', userId);
    return new Response(JSON.stringify({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ [API] Erreur DELETE /api/users/[id]:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
