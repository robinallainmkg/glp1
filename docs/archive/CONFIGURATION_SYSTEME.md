# ⚙️ Configuration Système - TinaCMS, Supabase & Infrastructure

## 🎯 Vue d'ensemble
Configuration complète de l'infrastructure GLP-1 France : TinaCMS, Supabase, Astro, et services tiers pour l'édition de contenu et la gestion des données utilisateurs.

---

## 🏗️ Architecture Système

### Stack Technique
- **Frontend** : Astro.js (Static Site Generation)
- **CMS** : TinaCMS (Client-side editing)
- **Base de données** : Supabase (PostgreSQL)
- **Déploiement** : Hostinger SFTP
- **CDN/Images** : Système local + optimisation

### Environnements
- **Développement** : `localhost:4321`
- **TinaCMS Admin** : `/admin/index.html`
- **Production** : `https://glp1-france.fr`

---

## 🔧 Configuration TinaCMS

### Variables d'environnement
```bash
# .env.local
TINA_CLIENT_ID="d2c40213-494b-4005-94ad-b601dbdf1f0e"
TINA_TOKEN="your_tina_token_here"
TINA_BRANCH="main"
```

### Configuration principale (`tina/config.ts`)
```typescript
import { defineConfig } from "tinacms";

export default defineConfig({
  // Configuration branche Git
  branch: process.env.TINA_BRANCH || "main",
  
  // Client ID TinaCMS Cloud
  clientId: process.env.TINA_CLIENT_ID,
  
  // Token d'authentification
  token: process.env.TINA_TOKEN,

  // Configuration build
  build: {
    outputFolder: "admin",          // Dossier interface admin
    publicFolder: "public",         // Assets publics
  },

  // Configuration média
  media: {
    tina: {
      mediaRoot: "",                // Racine médias
      publicFolder: "public",       // Dossier public
    },
  },

  // Configuration collections
  schema: {
    collections: [
      // Collections articles définies
      {
        name: "medicaments-glp1",
        label: "Médicaments GLP-1", 
        path: "src/content/medicaments-glp1",
        fields: standardArticleFields,
      },
      // ... autres collections
    ],
  },
});
```

### Configuration Astro pour TinaCMS
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  
  // Configuration pour TinaCMS
  vite: {
    define: {
      'process.env.TINA_CLIENT_ID': JSON.stringify(process.env.TINA_CLIENT_ID),
    },
  },
  
  // Output configuration
  output: 'static',
  build: {
    format: 'directory',
  },
});
```

---

## 🗄️ Configuration Supabase

### Variables d'environnement
```bash
# .env.local
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_service_key_here"
```

### Configuration client (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client avec privilèges service (backend only)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### Structure Base de Données

#### Tables Principales
```sql
-- Table utilisateurs étendus
CREATE TABLE users_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table soumissions guide
CREATE TABLE guide_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table téléchargements
CREATE TABLE guide_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  guide_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table newsletter
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table contacts
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Politiques RLS (Row Level Security)
```sql
-- Enable RLS sur toutes les tables
ALTER TABLE users_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_submissions ENABLE ROW LEVEL SECURITY;

-- Politique lecture publique pour stats
CREATE POLICY "Public read access" ON guide_submissions
  FOR SELECT TO anon USING (true);

-- Politique insertion publique 
CREATE POLICY "Public insert access" ON guide_submissions
  FOR INSERT TO anon WITH CHECK (true);
```

---

## 📦 Configuration des Packages

### Dependencies principales (`package.json`)
```json
{
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/react": "^3.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "tinacms": "^1.5.0",
    "@tinacms/cli": "^1.5.0",
    "@supabase/supabase-js": "^2.38.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0"
  },
  "scripts": {
    "dev": "tinacms dev -c \"astro dev\"",
    "build": "tinacms build && astro build",
    "preview": "astro preview",
    "tina:build": "tinacms build",
    "tina:dev": "tinacms dev"
  }
}
```

### Configuration Tailwind (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563eb',
          green: '#059669',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          // ... autres nuances
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

## 🚀 Configuration Déploiement

### Variables Hostinger SFTP
```bash
# Credentials SFTP (sécurisés)
SFTP_HOST="your-host.hostinger.com"
SFTP_USERNAME="your_username"
SFTP_PASSWORD="your_password"
SFTP_PATH="/public_html/"
```

### Script de déploiement (`scripts/deployment/deploy.ps1`)
```powershell
# Configuration déploiement
$REMOTE_HOST = "your-host.hostinger.com"
$REMOTE_USER = "your_username"
$REMOTE_PATH = "/public_html/"
$LOCAL_BUILD = "./dist"

# Build complet
Write-Host "🏗️ Building site..." -ForegroundColor Blue
npm run build

# Validation build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Upload SFTP
Write-Host "📤 Uploading to production..." -ForegroundColor Green
# [Commandes SFTP sécurisées]
```

### Configuration Git Hooks
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Validation avant commit
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed - commit aborted"
  exit 1
fi

echo "✅ Build successful - proceeding with commit"
```

---

## 🔐 Sécurité et Authentification

### Variables sensibles (`.env.local`)
```bash
# ⚠️ NE JAMAIS COMMITER CES VARIABLES
TINA_TOKEN="your_secure_token"
SUPABASE_SERVICE_ROLE_KEY="your_service_key"
SFTP_PASSWORD="your_sftp_password"

# Variables publiques (OK dans repo)
TINA_CLIENT_ID="d2c40213-494b-4005-94ad-b601dbdf1f0e"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your_anon_key"
```

### Configuration `.gitignore`
```bash
# Secrets
.env.local
.env.production

# Build
dist/
.astro/

# Dependencies  
node_modules/

# TinaCMS
admin/
.tina/

# Logs
*.log
```

### Sécurité Supabase
```sql
-- Limitation accès par IP (optionnel)
-- Configuration dans Supabase Dashboard

-- Rotation clés d'API régulière
-- Monitoring logs d'accès
-- Backup automatique quotidien
```

---

## 📊 Monitoring et Logs

### Configuration Analytics
```javascript
// Google Analytics (si utilisé)
const GA_TRACKING_ID = 'G-XXXXXXXXXX';

// Supabase Analytics
const trackEvent = async (event, data) => {
  await supabase.from('analytics_events').insert({
    event_name: event,
    event_data: data,
    timestamp: new Date()
  });
};
```

### Logs et Debugging
```javascript
// Configuration logs développement
const isDev = import.meta.env.DEV;

const logger = {
  info: (msg) => isDev && console.log(`ℹ️ ${msg}`),
  warn: (msg) => isDev && console.warn(`⚠️ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
};

// Usage
logger.info('TinaCMS initialized');
logger.warn('Deprecated API used');
logger.error('Build failed');
```

---

## 🔧 Maintenance et Updates

### Procédure de mise à jour
```bash
# 1. Backup avant update
npm run backup

# 2. Update dependencies
npm update

# 3. Test local
npm run dev
npm run build

# 4. Deploy si tests OK
npm run deploy
```

### Monitoring santé système
```bash
# Vérification quotidienne
./scripts/monitoring.sh

# Checks inclus :
# - Build status
# - Supabase connectivity
# - TinaCMS accessibility
# - Production uptime
```

---

## 🎯 Troubleshooting Configuration

### TinaCMS Issues
```bash
# Clear TinaCMS cache
rm -rf .tina/
npm run tina:build

# Reset TinaCMS config
npm run tina:dev --clear
```

### Supabase Connectivity
```javascript
// Test connection
const testSupabase = async () => {
  try {
    const { data, error } = await supabase.from('users_extended').select('count');
    console.log('✅ Supabase connected:', data);
  } catch (err) {
    console.error('❌ Supabase error:', err);
  }
};
```

### Build Issues
```bash
# Clear all caches
rm -rf node_modules/
rm -rf dist/
rm -rf .astro/
npm install
npm run build
```

---

## 📚 Ressources Configuration

### Documentation officielle
- [TinaCMS Config](https://tina.io/docs/setup-overview/)
- [Supabase Setup](https://supabase.com/docs/guides/getting-started)
- [Astro Configuration](https://docs.astro.build/en/guides/configuring-astro/)

### Outils de développement
- **TinaCMS CLI** : `npx @tinacms/cli@latest init`
- **Supabase CLI** : `npm install -g @supabase/cli`
- **Astro CLI** : `npm create astro@latest`

---

*Configuration système maintenue à jour - Dernière révision : 19 décembre 2024*
