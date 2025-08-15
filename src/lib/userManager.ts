import fs from 'fs/promises';
import path from 'path';

export interface UserEvent {
  type: 'newsletter_signup' | 'contact_form' | 'guide_download';
  timestamp: string;
  data: Record<string, any>;
  source: string;
  ip?: string;
  userAgent?: string;
}

export interface UnifiedUser {
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

export class UserManager {
  private static instance: UserManager;
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'users-unified.json');
  }

  static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  async loadUsers(): Promise<UnifiedUser[]> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.users || [];
    } catch (error) {
      return [];
    }
  }

  async saveUsers(users: UnifiedUser[]): Promise<void> {
    const dataToSave = { users };
    await fs.writeFile(this.dataPath, JSON.stringify(dataToSave, null, 2));
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
