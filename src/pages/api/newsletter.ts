import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, source } = await request.json();
    
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log pour analytics
    console.log(`📧 Nouvelle inscription: ${email} via ${source}`);

    // Ici, intégration avec votre service d'email marketing
    // Exemples d'intégrations populaires :
    
    // MAILCHIMP
    /*
    const mailchimpResponse = await fetch(`https://us1.api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        tags: [source],
        merge_fields: {
          SOURCE: source,
          SIGNUP_DATE: new Date().toISOString()
        }
      })
    });
    */

    // CONVERTKIT
    /*
    const convertkitResponse = await fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.CONVERTKIT_API_KEY,
        email: email,
        tags: [source]
      })
    });
    */

    // SUPABASE (Stockage local)
    // Vous pouvez stocker les emails dans votre base Supabase existante
    
    // Pour l'instant, simulation d'un succès
    await new Promise(resolve => setTimeout(resolve, 500)); // Simule API call
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Inscription réussie',
      downloadUrl: '/guide-prix-glp1-2025.pdf'
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
