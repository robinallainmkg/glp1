import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

interface GuideSubmission {
  id: number;
  timestamp: string;
  source: string;
  data: {
    name: string;
    email: string;
    treatment: string;
    concerns: string[];
    newsletter_consent: boolean;
  };
  ip: string;
  userAgent: string;
}

interface NewsletterSubscriber {
  id: number;
  email: string;
  timestamp: string;
  source: string;
  status: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const treatment = formData.get('treatment')?.toString() || '';
    const concerns = formData.getAll('concerns').map(c => c.toString());
    const newsletter_consent = formData.get('newsletter_consent') === 'on';
    
    // Validation basique
    if (!name || !email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Le nom et l\'email sont obligatoires' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Format d\'email invalide' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('📝 Guide Beauty Form - Données reçues:', {
      name, email, treatment, concerns, newsletter_consent
    });
    
    // Envoyer vers l'API user-management unifié
    try {
      const userManagementUrl = new URL('/api/user-management', request.url);
      
      const formData = new FormData();
      formData.append('action', 'guide_download');
      formData.append('email', email);
      formData.append('name', name);
      formData.append('treatment', treatment);
      concerns.forEach(concern => formData.append('concerns', concern));
      formData.append('newsletter_consent', newsletter_consent ? 'on' : 'off');
      
      const response = await fetch(userManagementUrl.toString(), {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': request.headers.get('User-Agent') || '',
          'X-Forwarded-For': request.headers.get('X-Forwarded-For') || '',
        }
      });
      
      if (!response.ok) {
        console.error('Erreur sauvegarde user-management:', await response.text());
      }
    } catch (error) {
      console.error('Erreur API user-management:', error);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Guide envoyé avec succès ! Vérifiez votre boîte email.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur guide form:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
