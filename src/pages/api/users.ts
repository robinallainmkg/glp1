import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('🔄 API users.ts - Début chargement des utilisateurs');
    
    // Détection de l'environnement
    const url = new URL(request.url);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    
    // Chemin du fichier de données unifié
    let dataFile: string;
    if (isLocal) {
      dataFile = path.join(process.cwd(), 'data', 'users-unified.json');
    } else {
      // Environnement Hostinger - chemin absolu
      dataFile = '/home/u574849695/domains/glp1-france.com/public_html/data/users-unified.json';
      
      // Fallback si le chemin absolu n'existe pas
      if (!fs.existsSync(dataFile)) {
        dataFile = path.join(process.cwd(), 'data', 'users-unified.json');
      }
    }
    
    console.log(`🔍 Environnement: ${isLocal ? 'LOCAL' : 'PRODUCTION'}`);
    console.log(`📁 Chemin fichier: ${dataFile}`);
    
    if (!fs.existsSync(dataFile)) {
      throw new Error(`Fichier de données utilisateurs introuvable: ${dataFile}`);
    }
    
    // Lire les données
    const jsonContent = fs.readFileSync(dataFile, 'utf-8');
    const allData = JSON.parse(jsonContent);
    
    // Vérifier la structure
    if (!allData.users || !Array.isArray(allData.users)) {
      throw new Error('Structure de données invalide - clé "users" manquante');
    }
    
    const users = allData.users;
    console.log(`👥 Nombre d'utilisateurs trouvés: ${users.length}`);
    
    // Calculer les statistiques
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalUsers = users.length;
    const newsletterSubscribers = users.filter(user => user.isNewsletterSubscriber).length;
    const recentUsers = users.filter(user => {
      if (!user.firstSeen) return false;
      try {
        const userDate = new Date(user.firstSeen);
        return userDate >= weekAgo;
      } catch {
        return false;
      }
    }).length;
    
    const stats = {
      totalUsers,
      newsletterSubscribers,
      recentUsers
    };
    
    // Trier les utilisateurs par date de première visite (plus récent en premier)
    users.sort((a, b) => {
      const dateA = a.firstSeen || '1970-01-01';
      const dateB = b.firstSeen || '1970-01-01';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    console.log('✅ Données utilisateurs préparées avec succès');
    
    return new Response(JSON.stringify({
      success: true,
      stats,
      users,
      environment: isLocal ? 'local' : 'production',
      dataFile: path.basename(dataFile),
      timestamp: now.toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur API users:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
