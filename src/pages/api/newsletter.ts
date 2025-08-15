import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const NEWSLETTER_FILE = path.join(process.cwd(), 'data', 'newsletter-subscribers.json');

// Interface pour les abonnés
interface NewsletterSubscriber {
  id?: number;
  email: string;
  name?: string;
  subscribedAt?: string;
  timestamp?: string;
  source?: string;
  status?: string;
  ip?: string;
  userAgent?: string;
}

// Fonction pour charger les abonnés existants
function loadSubscribers(): NewsletterSubscriber[] {
  try {
    if (fs.existsSync(NEWSLETTER_FILE)) {
      const data = fs.readFileSync(NEWSLETTER_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.subscribers || parsed || [];
    }
  } catch (error) {
    console.error('Erreur lors du chargement des abonnés:', error);
  }
  return [];
}

// Fonction pour sauvegarder les abonnés
function saveSubscribers(subscribers: NewsletterSubscriber[]): boolean {
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(NEWSLETTER_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dataToSave = {
      subscribers: subscribers
    };
    
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(dataToSave, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des abonnés:', error);
    return false;
  }
}

// Fonction pour valider l'email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString()?.trim().toLowerCase();

    // Validation de l'email
    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email invalide' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Charger les abonnés existants
    const subscribers = loadSubscribers();
    
    // Vérifier si l'email existe déjà
    const existingSubscriber = subscribers.find(sub => sub.email === email);
    if (existingSubscriber) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Vous êtes déjà inscrit à notre newsletter !' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ajouter le nouvel abonné
    const newSubscriber: NewsletterSubscriber = {
      id: Date.now(),
      email,
      timestamp: new Date().toISOString(),
      subscribedAt: new Date().toISOString(),
      source: 'footer-newsletter',
      status: 'active',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    subscribers.push(newSubscriber);

    // Sauvegarder
    if (saveSubscribers(subscribers)) {
      // Log pour suivi
      console.log(`📧 Nouvel abonné newsletter: ${email} à ${new Date().toLocaleString('fr-FR')}`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Inscription réussie !',
        email 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Erreur de sauvegarde');
    }

  } catch (error) {
    console.error('Erreur API newsletter:', error);
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
    headers: { 'Content-Type': 'application/json' }
  });
};
