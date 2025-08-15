import type { APIRoute } from 'astro';

interface NewsletterData {
  email: string;
  source?: string;
}

// Fonction pour envoyer les données vers l'API user-management
async function saveToUserManagement(data: NewsletterData, request: Request): Promise<boolean> {
  try {
    const userManagementUrl = new URL('/api/user-management', request.url);
    
    const formData = new FormData();
    formData.append('type', 'newsletter');
    formData.append('email', data.email);
    formData.append('source', data.source || 'footer-newsletter');
    
    const response = await fetch(userManagementUrl.toString(), {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': request.headers.get('User-Agent') || '',
        'X-Forwarded-For': request.headers.get('X-Forwarded-For') || '',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde vers user-management:', error);
    return false;
  }
}

// Validation de l'email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  console.log('🔔 Newsletter API - Requête reçue');

  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString().trim();
    const source = formData.get('source')?.toString() || 'footer-newsletter';

    console.log('📧 Email reçu:', email);
    console.log('📍 Source:', source);

    // Validation
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email requis'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Format d\'email invalide'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sauvegarder via l'API user-management
    const saved = await saveToUserManagement({ email, source }, request);

    if (saved) {
      console.log('✅ Email newsletter sauvegardé avec succès');
      return new Response(JSON.stringify({
        success: true,
        message: 'Inscription réussie !'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.log('❌ Erreur lors de la sauvegarde');
      return new Response(JSON.stringify({
        success: false,
        error: 'Erreur de sauvegarde'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Erreur Newsletter API:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erreur serveur'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    message: 'Newsletter API - Utilisez POST pour vous inscrire'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
