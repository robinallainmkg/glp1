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
    
    // Créer l'entrée de données
    const submission: GuideSubmission = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      source: 'guide-beauty-form',
      data: {
        name,
        email,
        treatment,
        concerns,
        newsletter_consent
      },
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    // Lire le fichier existant
    const dataPath = path.join(process.cwd(), 'data', 'guide-submissions.json');
    let submissions: GuideSubmission[] = [];
    
    try {
      const data = await fs.readFile(dataPath, 'utf-8');
      submissions = JSON.parse(data);
    } catch (error) {
      submissions = [];
    }
    
    // Ajouter la nouvelle soumission
    submissions.push(submission);
    
    // Sauvegarder
    await fs.writeFile(dataPath, JSON.stringify(submissions, null, 2));
    
    // Ajouter à la newsletter si consentement donné
    if (newsletter_consent) {
      try {
        const newsletterPath = path.join(process.cwd(), 'data', 'newsletter-subscribers.json');
        let subscribers: NewsletterSubscriber[] = [];
        
        try {
          const newsletterData = await fs.readFile(newsletterPath, 'utf-8');
          subscribers = JSON.parse(newsletterData);
        } catch (error) {
          subscribers = [];
        }
        
        // Vérifier si l'email n'existe pas déjà
        const existingSubscriber = subscribers.find(sub => sub.email.toLowerCase() === email.toLowerCase());
        if (!existingSubscriber) {
          subscribers.push({
            id: Date.now(),
            email: email.toLowerCase(),
            timestamp: new Date().toISOString(),
            source: 'guide-beauty-form',
            status: 'active'
          });
          
          await fs.writeFile(newsletterPath, JSON.stringify(subscribers, null, 2));
        }
      } catch (error) {
        console.error('Erreur ajout newsletter:', error);
      }
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
