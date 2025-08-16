import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

interface UserEvent {
  type: 'newsletter_signup' | 'contact_form' | 'guide_download';
  timestamp: string;
  data: Record<string, any>;
  source: string;
  ip?: string;
  userAgent?: string;
}

interface UnifiedUser {
  id: string;
  email: string;
  name?: string;
  firstSeen: string;
  lastSeen: string;
  totalEvents: number;
  isNewsletterSubscriber: boolean;
  events: UserEvent[];
  tags: string[];
  analytics: {
    sources: string[];
    preferredTopics?: string[];
    treatmentInterest?: string;
  };
}

class UserManager {
  private static instance: UserManager;
  public dataPath: string;  // Changed to public for debugging

  constructor() {
    // Détecter l'environnement de production Hostinger
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.cwd().includes('/home/u403023291/') ||
                        process.cwd().includes('domains/glp1-france.fr');
    
    if (isProduction) {
      // Sur Hostinger, utiliser chemin relatif depuis public_html
      this.dataPath = path.join(process.cwd(), '..', 'data', 'users-unified.json');
    } else {
      // En développement local
      this.dataPath = path.join(process.cwd(), 'data', 'users-unified.json');
    }
    
    console.log('📁 UserManager - Chemin data:', this.dataPath);
    console.log('📁 Process CWD:', process.cwd());
  }

  static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  async ensureDataFile(): Promise<void> {
    try {
      console.log('🔍 Vérification existence fichier:', this.dataPath);
      await fs.access(this.dataPath);
      console.log('✅ Fichier existe');
    } catch (error) {
      console.log('⚠️ Fichier inexistant, tentative de création...');
      
      // Essayer plusieurs emplacements possibles sur Hostinger
      const possiblePaths = [
        this.dataPath,
        path.join(process.cwd(), '..', 'data', 'users-unified.json'),
        '/home/u403023291/domains/glp1-france.fr/data/users-unified.json',
        path.join(process.cwd(), 'data', 'users-unified.json'),
        path.join(process.cwd(), '..', '..', 'data', 'users-unified.json')
      ];
      
      let success = false;
      
      for (const testPath of possiblePaths) {
        try {
          console.log('� Test chemin:', testPath);
          const dir = path.dirname(testPath);
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(testPath, JSON.stringify({ users: [] }, null, 2));
          
          // Vérifier que le fichier a bien été créé
          await fs.access(testPath);
          this.dataPath = testPath;
          console.log('✅ Fichier créé avec succès à:', testPath);
          success = true;
          break;
        } catch (createError) {
          console.log('❌ Échec pour:', testPath, createError.message);
        }
      }
      
      if (!success) {
        throw new Error('Impossible de créer le fichier data dans tous les emplacements testés');
      }
    }
  }

  async loadUsers(): Promise<UnifiedUser[]> {
    try {
      await this.ensureDataFile();
      console.log('📖 Chargement des utilisateurs depuis:', this.dataPath);
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsed = JSON.parse(data);
      console.log('✅ Utilisateurs chargés:', parsed.users?.length || 0);
      return parsed.users || [];
    } catch (error) {
      console.log('⚠️ Erreur chargement utilisateurs:', error.message);
      console.log('🔄 Retour tableau vide');
      return [];
    }
  }

  async saveUsers(users: UnifiedUser[]): Promise<void> {
    try {
      await this.ensureDataFile();
      console.log('💾 Sauvegarde vers:', this.dataPath);
      console.log('👥 Nombre d\'utilisateurs à sauvegarder:', users.length);
      const dataToSave = { users };
      await fs.writeFile(this.dataPath, JSON.stringify(dataToSave, null, 2));
      console.log('✅ Sauvegarde réussie');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      throw error;
    }
  }

  generateUserId(email: string): string {
    return `user_${Buffer.from(email).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)}_${Date.now()}`;
  }

  async findOrCreateUser(email: string, name?: string): Promise<UnifiedUser> {
    const users = await this.loadUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: this.generateUserId(email),
        email: email.toLowerCase(),
        name,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        totalEvents: 0,
        isNewsletterSubscriber: false,
        events: [],
        tags: [],
        analytics: {
          sources: []
        }
      };
      users.push(user);
    } else {
      // Mettre à jour le nom si fourni et pas encore défini
      if (name && !user.name) {
        user.name = name;
      }
      user.lastSeen = new Date().toISOString();
    }

    await this.saveUsers(users);
    return user;
  }

  async addEvent(email: string, event: Omit<UserEvent, 'timestamp'>, name?: string): Promise<UnifiedUser> {
    const user = await this.findOrCreateUser(email, name);
    
    const fullEvent: UserEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    user.events.push(fullEvent);
    user.totalEvents = user.events.length;
    
    // Marquer comme abonné newsletter si applicable
    if (event.type === 'newsletter_signup' || event.data.newsletter === true) {
      user.isNewsletterSubscriber = true;
      if (!user.tags.includes('newsletter')) {
        user.tags.push('newsletter');
      }
    }

    // Ajouter la source si pas déjà présente
    if (event.source && !user.analytics.sources.includes(event.source)) {
      user.analytics.sources.push(event.source);
    }

    // Analyser les intérêts selon le type d'événement
    if (event.type === 'guide_download' && event.data.concerns) {
      user.analytics.preferredTopics = event.data.concerns;
    }
    if (event.data.treatment) {
      user.analytics.treatmentInterest = event.data.treatment;
    }

    const users = await this.loadUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex >= 0) {
      users[userIndex] = user;
    }
    
    await this.saveUsers(users);
    return user;
  }

  async getAnalytics(): Promise<{
    totalUsers: number;
    newsletterSubscribers: number;
    averageEventsPerUser: number;
    topSources: Array<{source: string, count: number}>;
    topConcerns: Array<{concern: string, count: number}>;
  }> {
    const users = await this.loadUsers();
    
    const totalUsers = users.length;
    const newsletterSubscribers = users.filter(u => u.isNewsletterSubscriber).length;
    const totalEvents = users.reduce((sum, u) => sum + u.totalEvents, 0);
    const averageEventsPerUser = totalUsers > 0 ? totalEvents / totalUsers : 0;

    // Analyser les sources
    const sourceCounts: Record<string, number> = {};
    users.forEach(user => {
      user.analytics.sources.forEach(source => {
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });
    });

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyser les préoccupations
    const concernCounts: Record<string, number> = {};
    users.forEach(user => {
      if (user.analytics.preferredTopics) {
        user.analytics.preferredTopics.forEach(concern => {
          concernCounts[concern] = (concernCounts[concern] || 0) + 1;
        });
      }
    });

    const topConcerns = Object.entries(concernCounts)
      .map(([concern, count]) => ({ concern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalUsers,
      newsletterSubscribers,
      averageEventsPerUser,
      topSources,
      topConcerns
    };
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('🔧 User-management API - Requête reçue');
    
    const formData = await request.formData();
    const action = formData.get('action')?.toString() || formData.get('type')?.toString();
    const email = formData.get('email')?.toString()?.trim()?.toLowerCase();
    
    console.log('🎬 Action:', action);
    console.log('📧 Email:', email);
    
    if (!email || !action) {
      console.log('❌ Email ou action manquant');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email et action requis' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userManager = UserManager.getInstance();
    let user: UnifiedUser;

    switch (action) {
      case 'newsletter_signup':
      case 'newsletter':
        console.log('📨 Traitement inscription newsletter');
        const source = formData.get('source')?.toString() || 'footer-newsletter';
        console.log('📍 Source newsletter:', source);
        user = await userManager.addEvent(email, {
          type: 'newsletter_signup',
          data: { source },
          source: source,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });
        console.log('✅ Utilisateur newsletter créé/mis à jour:', user.email);
        break;

      case 'contact_form':
        const name = formData.get('name')?.toString();
        const subject = formData.get('subject')?.toString();
        const message = formData.get('message')?.toString();
        const newsletter = formData.get('newsletter') === 'on';

        user = await userManager.addEvent(email, {
          type: 'contact_form',
          data: { name, subject, message, newsletter },
          source: 'contact-form',
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }, name);
        break;

      case 'guide_download':
        const guideName = formData.get('name')?.toString();
        const treatment = formData.get('treatment')?.toString();
        const concerns = formData.getAll('concerns').map(c => c.toString());
        const newsletterConsent = formData.get('newsletter_consent') === 'on';

        user = await userManager.addEvent(email, {
          type: 'guide_download',
          data: { name: guideName, treatment, concerns, newsletter_consent: newsletterConsent },
          source: 'guide-beauty-form',
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }, guideName);
        break;

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Action non supportée' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Événement enregistré avec succès',
      user: {
        id: user.id,
        email: user.email,
        totalEvents: user.totalEvents,
        isNewsletterSubscriber: user.isNewsletterSubscriber
      },
      debug: {
        dataPath: userManager.dataPath,
        cwd: process.cwd(),
        action: action
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur user-management:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    console.log('📨 GET user-management - URL complète:', request.url);
    console.log('📨 GET user-management - Action extraite:', action);
    console.log('📨 GET user-management - Tous les paramètres:', Object.fromEntries(url.searchParams.entries()));

    const userManager = UserManager.getInstance();

    if (action === 'analytics') {
      const analytics = await userManager.getAnalytics();
      return new Response(JSON.stringify(analytics), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'users') {
      const users = await userManager.loadUsers();
      return new Response(JSON.stringify({ users }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Traitement newsletter en GET pour contourner le problème serveur
    if (action === 'newsletter' || action === 'newsletter_signup') {
      console.log('📨 Traitement inscription newsletter via GET');
      const email = url.searchParams.get('email')?.trim()?.toLowerCase();
      const source = url.searchParams.get('source') || 'footer-newsletter-get';
      
      console.log('📧 Email:', email);
      console.log('📍 Source:', source);
      
      if (!email) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Email requis' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const user = await userManager.addEvent(email, {
        type: 'newsletter_signup',
        data: { source },
        source: source,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      console.log('✅ Utilisateur newsletter créé/mis à jour via GET:', user.email);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Inscription newsletter réussie',
        user: {
          id: user.id,
          email: user.email,
          totalEvents: user.totalEvents,
          isNewsletterSubscriber: user.isNewsletterSubscriber
        },
        debug: {
          dataPath: userManager.dataPath,
          cwd: process.cwd(),
          action: action,
          method: 'GET'
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Action non supportée' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur get user-management:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
