import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, source } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📧 Nouvelle inscription newsletter: ${email} via ${source}`);

    // Sauvegarde dans Supabase (table contacts avec flag newsletter)
    const { error } = await supabase
      .from('contacts')
      .insert({
        email,
        subject: 'Newsletter - Guide Prix GLP-1',
        message: `Inscription newsletter via ${source || 'homepage'}`,
        newsletter: true,
        status: 'new'
      });

    if (error) {
      console.error('❌ Erreur Supabase newsletter:', error);
      return new Response(JSON.stringify({
        error: 'Erreur lors de l\'inscription'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Email newsletter sauvegardé:', email);

    return new Response(JSON.stringify({
      success: true,
      message: 'Inscription réussie'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur inscription newsletter:', error);

    return new Response(JSON.stringify({
      error: 'Erreur serveur'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
