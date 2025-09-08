import type { APIRoute } from 'astro';
import { ProfessionalsService } from '../../../lib/professionals';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { professionalId } = await request.json();
    
    if (!professionalId || typeof professionalId !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'ID du professionnel requis' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await ProfessionalsService.incrementProfileViews(professionalId);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Vue comptabilisée'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur lors du comptage des vues:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Erreur serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
