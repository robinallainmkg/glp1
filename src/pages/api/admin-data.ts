import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async ({ url }) => {
  try {
    // Authentification basique (à améliorer en production)
    const authHeader = url.searchParams.get('auth');
    if (authHeader !== 'admin-glp1-2025') {
      return new Response(JSON.stringify({ 
        error: 'Non autorisé' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const type = url.searchParams.get('type') || 'all';
    
    // Lire tous les fichiers de données
    const contactPath = path.join(process.cwd(), 'data', 'contact-submissions.json');
    const newsletterPath = path.join(process.cwd(), 'data', 'newsletter-subscribers.json');
    const guidePath = path.join(process.cwd(), 'data', 'guide-submissions.json');
    
    let contactData = [];
    let newsletterData = [];
    let guideData = [];
    
    try {
      const contactContent = await fs.readFile(contactPath, 'utf-8');
      contactData = JSON.parse(contactContent);
    } catch (error) {
      contactData = [];
    }
    
    try {
      const newsletterContent = await fs.readFile(newsletterPath, 'utf-8');
      newsletterData = JSON.parse(newsletterContent);
    } catch (error) {
      newsletterData = [];
    }
    
    try {
      const guideContent = await fs.readFile(guidePath, 'utf-8');
      guideData = JSON.parse(guideContent);
    } catch (error) {
      guideData = [];
    }
    
    // Calculer les statistiques
    const stats = {
      total_contacts: contactData.length,
      total_newsletter: newsletterData.length,
      total_guides: guideData.length,
      total_emails: new Set([
        ...contactData.map((c: any) => c.data.email),
        ...newsletterData.map((n: any) => n.email),
        ...guideData.map((g: any) => g.data.email)
      ]).size,
      last_7_days: {
        contacts: contactData.filter((c: any) => 
          new Date(c.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        newsletter: newsletterData.filter((n: any) => 
          new Date(n.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        guides: guideData.filter((g: any) => 
          new Date(g.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      }
    };
    
    // Retourner selon le type demandé
    switch (type) {
      case 'stats':
        return new Response(JSON.stringify({ stats }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'contacts':
        return new Response(JSON.stringify({ 
          data: contactData.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'newsletter':
        return new Response(JSON.stringify({ 
          data: newsletterData.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'guides':
        return new Response(JSON.stringify({ 
          data: guideData.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({
          stats,
          recent_contacts: contactData.slice(-10),
          recent_newsletter: newsletterData.slice(-10),
          recent_guides: guideData.slice(-10)
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('Erreur API admin:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
