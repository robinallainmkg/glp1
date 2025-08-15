import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { UserManager } from '../../lib/userManager';

interface ContactSubmission {
  id: number;
  timestamp: string;
  source: string;
  data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    newsletter_signup: boolean;
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
    const subject = formData.get('subject')?.toString() || '';
    const message = formData.get('message')?.toString() || '';
    const newsletter = formData.get('newsletter')?.toString() === 'on';
    
    // Validation basique
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Tous les champs obligatoires doivent être remplis' 
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

    // Import dynamique du UserManager
    const userManager = UserManager.getInstance();
    
    // Ajouter à la base unifiée
    await userManager.addEvent(email, {
      type: 'contact_form',
      data: { name, subject, message, newsletter },
      source: 'contact-form',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }, name);

    // Maintenir la compatibilité avec l'ancien système
    const submission: ContactSubmission = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      source: 'contact-form',
      data: {
        name,
        email,
        subject,
        message,
        newsletter_signup: newsletter
      },
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Sauvegarder dans l'ancien format pour compatibilité
    const dataPath = path.join(process.cwd(), 'data', 'contact-submissions.json');
    let submissions: ContactSubmission[] = [];
    
    try {
      const data = await fs.readFile(dataPath, 'utf-8');
      const parsed = JSON.parse(data);
      submissions = parsed.submissions || parsed || [];
    } catch (error) {
      submissions = [];
    }
    
    submissions.push(submission);
    const dataToSave = { submissions: submissions };
    await fs.writeFile(dataPath, JSON.stringify(dataToSave, null, 2));

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Message envoyé avec succès' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur contact form:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
