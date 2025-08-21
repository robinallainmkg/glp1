# Système Utilisateurs et Données - GLP-1 France

## 📋 Vue d'ensemble

Documentation complète du système de gestion des utilisateurs, incluant la collecte de données, le stockage unifié, et la protection de la vie privée.

## 🎯 Architecture Globale

### Modèle de Données Unifié

```typescript
// Types principaux
interface User {
  id: string;                    // UUID unique
  email: string;                 // Email principal
  name?: string;                 // Nom complet (optionnel)
  source: UserSource;           // Source d'acquisition
  preferences: UserPreferences; // Préférences utilisateur
  metadata: UserMetadata;       // Métadonnées tracking
  created_at: string;           // Date création ISO
  updated_at: string;           // Dernière modification
  is_active: boolean;           // Statut actif
}

type UserSource = 
  | 'newsletter'          // Inscription newsletter
  | 'guide_download'      // Téléchargement guide
  | 'contact_form'        // Formulaire contact
  | 'affiliate_click'     // Clic produit affilié
  | 'expert_consult'      // Demande consultation
  | 'import';             // Import externe

interface UserPreferences {
  email_marketing: boolean;      // Accepte emails marketing
  data_processing: boolean;      // Accepte traitement données
  newsletter_frequency: 'daily' | 'weekly' | 'monthly';
  topics_interest: string[];     // Sujets d'intérêt
  language: 'fr' | 'en';        // Langue préférée
}

interface UserMetadata {
  ip_address?: string;           // IP lors inscription
  user_agent?: string;          // Navigateur/OS
  referrer?: string;            // Page de provenance
  utm_source?: string;          // Source campagne
  utm_medium?: string;          // Médium campagne
  utm_campaign?: string;        // Nom campagne
  pages_visited: string[];      // Historique navigation
  last_activity: string;       // Dernière activité
  total_sessions: number;       // Nombre de sessions
}
```

### Fichier de Données Principal

```json
// data/users-unified.json
{
  "users": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "email": "marie.dupont@email.com",
      "name": "Marie Dupont",
      "source": "guide_download",
      "preferences": {
        "email_marketing": true,
        "data_processing": true,
        "newsletter_frequency": "weekly",
        "topics_interest": ["glp1-diabete", "perte-de-poids"],
        "language": "fr"
      },
      "metadata": {
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "referrer": "https://google.com",
        "utm_source": "google",
        "utm_medium": "organic",
        "pages_visited": [
          "/collections/glp1-diabete/",
          "/guide-beaute-perte-de-poids-glp1/"
        ],
        "last_activity": "2024-01-15T14:30:00Z",
        "total_sessions": 3
      },
      "created_at": "2024-01-10T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      "is_active": true
    }
  ],
  "metadata": {
    "total_users": 1,
    "last_updated": "2024-01-15T14:30:00Z",
    "schema_version": "1.0"
  }
}
```

## 📝 Collecte de Données

### Sources de Données (**MIS À JOUR**)

#### 📧 Formulaire Contact (Résolu ✅)
- **Endpoint** : `/api/contact`
- **Méthode** : POST avec URLSearchParams
- **Storage** : Table `users` Supabase
- **Gestion duplicata** : Upsert par email

**Configuration technique** :
```javascript
export const prerender = false; // OBLIGATOIRE pour API routes Astro

export async function POST({ request }) {
  const body = await request.text();
  const params = new URLSearchParams(body);
  
  const userData = {
    name: params.get('name'),
    email: params.get('email'),
    preferences: {
      subject: params.get('subject'),
      message: params.get('message'),
      treatment: params.get('treatment'),
      concerns: params.getAll('concerns'),
      newsletter: params.get('newsletter') === 'on',
      contact_history: [{
        date: new Date().toISOString(),
        subject: params.get('subject'),
        message: params.get('message')
      }]
    }
  };

  // Upsert pour gérer les doublons
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(userData, { onConflict: 'email' });
}
```

**Côté client** (dans contact.astro) :
```javascript
// Conversion FormData → URLSearchParams
const params = new URLSearchParams();
for (const [key, value] of formData.entries()) {
  params.append(key, value);
}

await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params.toString()
});
```

#### 1. Newsletter (Homepage)

```astro
---
// components/NewsletterSignup.astro
import { userManager } from '../utils/user-manager';
---

<form class="newsletter-form" id="newsletter-form">
  <div class="form-group">
    <label for="email">Votre email :</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      required 
      placeholder="votre@email.com"
    />
  </div>
  
  <div class="form-group">
    <label for="name">Votre prénom (optionnel) :</label>
    <input 
      type="text" 
      id="name" 
      name="name" 
      placeholder="Marie"
    />
  </div>
  
  <div class="form-group form-group--checkboxes">
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        name="email_marketing" 
        checked 
        required
      />
      J'accepte de recevoir des conseils par email
    </label>
    
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        name="data_processing" 
        required
      />
      J'accepte le traitement de mes données personnelles
    </label>
  </div>
  
  <button type="submit" class="btn btn--primary">
    S'inscrire à la newsletter
  </button>
  
  <p class="form-disclaimer">
    Vos données sont protégées et ne seront jamais partagées. 
    <a href="/privacy">Politique de confidentialité</a>
  </p>
</form>

<script>
  document.getElementById('newsletter-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string || undefined,
      source: 'newsletter',
      preferences: {
        email_marketing: formData.get('email_marketing') === 'on',
        data_processing: formData.get('data_processing') === 'on',
        newsletter_frequency: 'weekly',
        topics_interest: ['general'],
        language: 'fr'
      }
    };
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        showSuccessMessage('Inscription réussie ! Vérifiez votre email.');
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Erreur inscription');
      }
    } catch (error) {
      showErrorMessage('Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  });
  
  function showSuccessMessage(message: string) {
    // Animation success
  }
  
  function showErrorMessage(message: string) {
    // Animation erreur
  }
</script>

<style>
  .newsletter-form {
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid #bae6fd;
    max-width: 500px;
    margin: 2rem auto;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #1e40af;
  }
  
  .form-group input[type="email"],
  .form-group input[type="text"] {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #cbd5e1;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  
  .form-group--checkboxes {
    background: rgba(255,255,255,0.5);
    padding: 1rem;
    border-radius: 8px;
  }
  
  .checkbox-label {
    display: flex !important;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem !important;
    font-size: 0.9rem;
    cursor: pointer;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: auto !important;
    margin: 0;
  }
  
  .btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn--primary {
    background: #3b82f6;
    color: white;
  }
  
  .btn--primary:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
  
  .form-disclaimer {
    font-size: 0.8rem;
    color: #6b7280;
    text-align: center;
    margin-top: 1rem;
    margin-bottom: 0;
  }
  
  .form-disclaimer a {
    color: #3b82f6;
    text-decoration: none;
  }
</style>
```

#### 2. Téléchargement Guide

```astro
---
// components/GuideDownload.astro
---

<div class="guide-download">
  <div class="guide-preview">
    <img 
      src="/images/guide-preview.jpg" 
      alt="Aperçu du guide GLP-1"
      class="guide-image"
    />
    
    <div class="guide-info">
      <h3>Guide Gratuit : Beauté et Perte de Poids avec GLP-1</h3>
      <ul class="guide-features">
        <li>✅ 50 pages d'expertise médicale</li>
        <li>✅ Plans alimentaires personnalisés</li>
        <li>✅ Conseils beauté et bien-être</li>
        <li>✅ Témoignages de patients</li>
      </ul>
    </div>
  </div>
  
  <form class="guide-form" id="guide-form">
    <h4>Recevez votre guide gratuitement</h4>
    
    <div class="form-group">
      <input 
        type="email" 
        name="email" 
        placeholder="Votre email"
        required
      />
    </div>
    
    <div class="form-group">
      <input 
        type="text" 
        name="name" 
        placeholder="Votre prénom"
      />
    </div>
    
    <div class="form-group">
      <select name="main_interest" required>
        <option value="">Votre objectif principal ?</option>
        <option value="perte-de-poids">Perte de poids</option>
        <option value="diabete">Gestion du diabète</option>
        <option value="bien-etre">Bien-être général</option>
        <option value="information">Information médicale</option>
      </select>
    </div>
    
    <label class="checkbox-label">
      <input type="checkbox" name="newsletter" checked />
      Recevoir des conseils personnalisés par email
    </label>
    
    <label class="checkbox-label">
      <input type="checkbox" name="data_processing" required />
      J'accepte le traitement de mes données *
    </label>
    
    <button type="submit" class="btn btn--download">
      📥 Télécharger le guide gratuit
    </button>
  </form>
</div>

<script>
  document.getElementById('guide-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string || undefined,
      source: 'guide_download',
      preferences: {
        email_marketing: formData.get('newsletter') === 'on',
        data_processing: formData.get('data_processing') === 'on',
        newsletter_frequency: 'weekly',
        topics_interest: [formData.get('main_interest') as string],
        language: 'fr'
      },
      metadata: {
        guide_requested: 'glp1-beauty-guide',
        main_interest: formData.get('main_interest') as string
      }
    };
    
    try {
      const response = await fetch('/api/guide-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Déclencher téléchargement
        window.open(result.download_url, '_blank');
        showSuccessMessage('Guide envoyé ! Vérifiez aussi vos emails.');
      }
    } catch (error) {
      showErrorMessage('Erreur lors du téléchargement.');
    }
  });
</script>
```

#### 3. Formulaire de Contact

```astro
---
// components/ContactForm.astro
---

<form class="contact-form" id="contact-form">
  <div class="form-row">
    <div class="form-group">
      <label for="contact-name">Nom complet *</label>
      <input 
        type="text" 
        id="contact-name"
        name="name" 
        required
      />
    </div>
    
    <div class="form-group">
      <label for="contact-email">Email *</label>
      <input 
        type="email" 
        id="contact-email"
        name="email" 
        required
      />
    </div>
  </div>
  
  <div class="form-group">
    <label for="contact-subject">Sujet</label>
    <select id="contact-subject" name="subject">
      <option value="information">Demande d'information</option>
      <option value="consultation">Consultation médicale</option>
      <option value="partnership">Partenariat</option>
      <option value="technical">Support technique</option>
      <option value="other">Autre</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="contact-message">Message *</label>
    <textarea 
      id="contact-message"
      name="message" 
      rows="5"
      required
      placeholder="Décrivez votre demande..."
    ></textarea>
  </div>
  
  <div class="form-group">
    <label class="checkbox-label">
      <input type="checkbox" name="newsletter" />
      Recevoir notre newsletter avec des conseils exclusifs
    </label>
  </div>
  
  <div class="form-group">
    <label class="checkbox-label">
      <input type="checkbox" name="data_processing" required />
      J'accepte le traitement de mes données personnelles *
    </label>
  </div>
  
  <button type="submit" class="btn btn--primary">
    Envoyer le message
  </button>
</form>

<script>
  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const contactData = {
      user: {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        source: 'contact_form',
        preferences: {
          email_marketing: formData.get('newsletter') === 'on',
          data_processing: formData.get('data_processing') === 'on',
          newsletter_frequency: 'weekly',
          topics_interest: [formData.get('subject') as string],
          language: 'fr'
        }
      },
      message: {
        subject: formData.get('subject') as string,
        content: formData.get('message') as string,
        submitted_at: new Date().toISOString()
      }
    };
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      
      if (response.ok) {
        showSuccessMessage('Message envoyé ! Nous vous répondrons rapidement.');
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      showErrorMessage('Erreur lors de l\'envoi. Veuillez réessayer.');
    }
  });
</script>
```

## 🔧 Gestionnaire de Données

### Classe UserManager

```typescript
// utils/user-manager.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class UserManager {
  private dataPath: string;
  private users: User[] = [];
  
  constructor(dataPath: string = 'data/users-unified.json') {
    this.dataPath = dataPath;
    this.loadUsers();
  }
  
  // Charger les utilisateurs depuis le fichier
  private loadUsers(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        this.users = data.users || [];
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      this.users = [];
    }
  }
  
  // Sauvegarder les utilisateurs
  private saveUsers(): void {
    try {
      // Créer backup avant modification
      this.createBackup();
      
      const data = {
        users: this.users,
        metadata: {
          total_users: this.users.length,
          last_updated: new Date().toISOString(),
          schema_version: '1.0'
        }
      };
      
      // Créer le dossier si nécessaire
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erreur sauvegarde utilisateurs:', error);
      throw error;
    }
  }
  
  // Créer un backup automatique
  private createBackup(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const timestamp = new Date().toISOString().split('T')[0];
        const backupPath = `data/backups/users-${timestamp}.json`;
        
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        
        fs.copyFileSync(this.dataPath, backupPath);
      }
    } catch (error) {
      console.warn('Impossible de créer le backup:', error);
    }
  }
  
  // Ajouter ou mettre à jour un utilisateur
  async upsertUser(userData: Partial<User>): Promise<User> {
    if (!userData.email) {
      throw new Error('Email requis');
    }
    
    // Chercher utilisateur existant
    let existingUser = this.users.find(u => u.email === userData.email);
    
    if (existingUser) {
      // Mettre à jour utilisateur existant
      existingUser = this.updateUser(existingUser, userData);
    } else {
      // Créer nouvel utilisateur
      existingUser = this.createUser(userData);
      this.users.push(existingUser);
    }
    
    this.saveUsers();
    return existingUser;
  }
  
  // Créer un nouvel utilisateur
  private createUser(userData: Partial<User>): User {
    const now = new Date().toISOString();
    
    return {
      id: uuidv4(),
      email: userData.email!,
      name: userData.name,
      source: userData.source || 'unknown',
      preferences: {
        email_marketing: false,
        data_processing: false,
        newsletter_frequency: 'weekly',
        topics_interest: [],
        language: 'fr',
        ...userData.preferences
      },
      metadata: {
        pages_visited: [],
        total_sessions: 1,
        last_activity: now,
        ...userData.metadata,
        ...this.getRequestMetadata()
      },
      created_at: now,
      updated_at: now,
      is_active: true
    };
  }
  
  // Mettre à jour utilisateur existant
  private updateUser(existingUser: User, userData: Partial<User>): User {
    const now = new Date().toISOString();
    
    return {
      ...existingUser,
      name: userData.name || existingUser.name,
      preferences: {
        ...existingUser.preferences,
        ...userData.preferences
      },
      metadata: {
        ...existingUser.metadata,
        ...userData.metadata,
        total_sessions: existingUser.metadata.total_sessions + 1,
        last_activity: now
      },
      updated_at: now
    };
  }
  
  // Extraire métadonnées de la requête
  private getRequestMetadata(): Partial<UserMetadata> {
    // Dans un contexte Astro/Node.js
    // Adapté selon l'environnement d'exécution
    return {
      ip_address: 'hidden', // Respecter RGPD
      user_agent: 'browser',
      referrer: undefined,
      utm_source: undefined,
      utm_medium: undefined,
      utm_campaign: undefined
    };
  }
  
  // Récupérer un utilisateur par email
  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }
  
  // Récupérer tous les utilisateurs
  getAllUsers(): User[] {
    return this.users;
  }
  
  // Supprimer un utilisateur (RGPD)
  async deleteUser(email: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.email === email);
    
    if (index === -1) {
      return false;
    }
    
    this.users.splice(index, 1);
    this.saveUsers();
    return true;
  }
  
  // Exporter données utilisateur (RGPD)
  exportUserData(email: string): User | null {
    const user = this.getUserByEmail(email);
    return user || null;
  }
  
  // Statistiques
  getStats(): {
    total: number;
    active: number;
    by_source: Record<string, number>;
    by_month: Record<string, number>;
  } {
    const stats = {
      total: this.users.length,
      active: this.users.filter(u => u.is_active).length,
      by_source: {} as Record<string, number>,
      by_month: {} as Record<string, number>
    };
    
    this.users.forEach(user => {
      // Par source
      stats.by_source[user.source] = (stats.by_source[user.source] || 0) + 1;
      
      // Par mois
      const month = user.created_at.substring(0, 7); // YYYY-MM
      stats.by_month[month] = (stats.by_month[month] || 0) + 1;
    });
    
    return stats;
  }
}

// Instance globale
export const userManager = new UserManager();
```

### APIs de Gestion

```typescript
// pages/api/users.ts (développement)
import { userManager } from '../../utils/user-manager';

export async function POST({ request }: { request: Request }) {
  try {
    const userData = await request.json();
    
    // Validation
    if (!userData.email || !userData.preferences?.data_processing) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes ou consentement requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Créer/mettre à jour utilisateur
    const user = await userManager.upsertUser(userData);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: user.id,
        message: 'Utilisateur enregistré avec succès'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Erreur API users:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE({ request }: { request: Request }) {
  try {
    const { email } = await request.json();
    
    const deleted = await userManager.deleteUser(email);
    
    if (deleted) {
      return new Response(
        JSON.stringify({ success: true, message: 'Utilisateur supprimé' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non trouvé' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  try {
    const stats = userManager.getStats();
    
    return new Response(
      JSON.stringify(stats),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

## 🔒 Conformité RGPD

### Politique de Confidentialité

```astro
---
// pages/privacy.astro
---

<BaseLayout title="Politique de Confidentialité - GLP-1 France">
  <main class="privacy-page">
    <div class="container">
      <h1>Politique de Confidentialité</h1>
      
      <section class="privacy-section">
        <h2>1. Données Collectées</h2>
        <p>Nous collectons uniquement les données nécessaires :</p>
        <ul>
          <li><strong>Email</strong> : Pour vous envoyer nos contenus</li>
          <li><strong>Prénom</strong> : Pour personnaliser nos communications (optionnel)</li>
          <li><strong>Préférences</strong> : Pour adapter le contenu à vos intérêts</li>
          <li><strong>Données techniques</strong> : Pages visitées, source de trafic (anonymisées)</li>
        </ul>
      </section>
      
      <section class="privacy-section">
        <h2>2. Utilisation des Données</h2>
        <ul>
          <li>Envoi de notre newsletter (avec votre consentement)</li>
          <li>Réponse à vos demandes de contact</li>
          <li>Amélioration de nos contenus</li>
          <li>Respect de nos obligations légales</li>
        </ul>
      </section>
      
      <section class="privacy-section">
        <h2>3. Vos Droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Accès</strong> : Consulter vos données</li>
          <li><strong>Rectification</strong> : Corriger vos données</li>
          <li><strong>Suppression</strong> : Effacer vos données</li>
          <li><strong>Opposition</strong> : Refuser certains traitements</li>
          <li><strong>Portabilité</strong> : Récupérer vos données</li>
        </ul>
        
        <div class="rights-actions">
          <button class="btn btn--secondary" onclick="requestDataExport()">
            📥 Exporter mes données
          </button>
          <button class="btn btn--danger" onclick="requestDataDeletion()">
            🗑️ Supprimer mes données
          </button>
        </div>
      </section>
      
      <section class="privacy-section">
        <h2>4. Contact</h2>
        <p>
          Pour exercer vos droits ou pour toute question : 
          <a href="/contact">nous contacter</a>
        </p>
      </section>
    </div>
  </main>
</BaseLayout>

<script>
  async function requestDataExport() {
    const email = prompt('Votre email :');
    if (!email) return;
    
    try {
      const response = await fetch('/api/user-data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mes-donnees-glp1-france.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('Utilisateur non trouvé ou erreur.');
      }
    } catch (error) {
      alert('Erreur lors de l\'export.');
    }
  }
  
  async function requestDataDeletion() {
    const email = prompt('Votre email :');
    if (!email) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement toutes vos données ?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        alert('Vos données ont été supprimées avec succès.');
      } else {
        alert('Utilisateur non trouvé ou erreur.');
      }
    } catch (error) {
      alert('Erreur lors de la suppression.');
    }
  }
</script>

<style>
  .privacy-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
    line-height: 1.7;
  }
  
  .privacy-section {
    margin-bottom: 3rem;
  }
  
  .privacy-section h2 {
    color: #1e40af;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .privacy-section ul {
    margin: 1rem 0;
    padding-left: 2rem;
  }
  
  .privacy-section li {
    margin-bottom: 0.5rem;
  }
  
  .rights-actions {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn--secondary {
    background: #6b7280;
    color: white;
  }
  
  .btn--danger {
    background: #ef4444;
    color: white;
  }
  
  .btn:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
</style>
```

### Outils de Conformité

```typescript
// utils/gdpr-tools.ts
export class GDPRManager {
  constructor(private userManager: UserManager) {}
  
  // Export données utilisateur
  async exportUserData(email: string): Promise<Blob | null> {
    const user = this.userManager.getUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const exportData = {
      user_data: user,
      export_date: new Date().toISOString(),
      format_version: '1.0'
    };
    
    return new Blob(
      [JSON.stringify(exportData, null, 2)], 
      { type: 'application/json' }
    );
  }
  
  // Anonymiser données (soft delete)
  async anonymizeUser(email: string): Promise<boolean> {
    const user = this.userManager.getUserByEmail(email);
    
    if (!user) {
      return false;
    }
    
    // Remplacer données sensibles
    user.email = `anonymized_${user.id}@deleted.local`;
    user.name = undefined;
    user.metadata.ip_address = undefined;
    user.metadata.user_agent = undefined;
    user.is_active = false;
    
    return true;
  }
  
  // Vérifier consentement
  hasValidConsent(user: User): boolean {
    return user.preferences.data_processing === true;
  }
  
  // Audit trail
  logDataAccess(email: string, action: string, source: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      email_hash: this.hashEmail(email),
      action,
      source,
      ip: 'hidden' // Respecter RGPD
    };
    
    // Sauvegarder dans fichier de logs
    this.appendToAuditLog(logEntry);
  }
  
  private hashEmail(email: string): string {
    // Hash simple pour les logs (production: utiliser crypto.createHash)
    return btoa(email).substring(0, 10);
  }
  
  private appendToAuditLog(entry: any): void {
    // Implémenter sauvegarde audit trail
    console.log('GDPR Audit:', entry);
  }
}
```

---

> **Important** : Le respect de la vie privée et la conformité RGPD sont prioritaires dans toute collecte et traitement de données utilisateur.
