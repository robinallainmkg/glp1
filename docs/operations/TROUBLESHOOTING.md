# 🚨 Guide de Dépannage - GLP-1 France

## 🎯 Vue d'ensemble
Guide complet de résolution des problèmes courants rencontrés avec TinaCMS, Astro, Supabase et le système de déploiement.

---

#### Cleanup Après Résolution
```bash
# Supprimer fichiers de debug
rm src/pages/api/test.js
rm src/pages/api/contact-simple.js
rm src/pages/api/contact-working.js

# Garder uniquement /api/contact.js fonctionnel
```

### ❌ Erreurs 404 Fréquentes

#### Symptômes
- Erreur `/.well-known/appspecific/com.chrome.devtools.json 1ms`
- Erreur `/favicon.svg 1ms`
- Chrome DevTools cherche des fichiers manquants

#### Causes
1. **Chrome DevTools** cherche automatiquement son fichier de configuration
2. **Favicon manquante** ou mal configurée
3. **Manifest PWA** non défini

#### Solution ✅
```bash
# 1. Créer le fichier Chrome DevTools
mkdir -p public/.well-known/appspecific/
cat > public/.well-known/appspecific/com.chrome.devtools.json << 'EOF'
{
  "name": "GLP-1 France",
  "description": "Site d'information sur les traitements GLP-1",
  "url": "https://glp1-france.fr",
  "developer": {
    "name": "GLP-1 France Team"
  }
}
EOF

# 2. Créer favicon SVG adaptée
cat > public/favicon.svg << 'EOF'
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16a34a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#15803d;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="16" cy="16" r="15" fill="url(#gradient)" stroke="#ffffff" stroke-width="1"/>
  <rect x="14" y="8" width="4" height="16" fill="white" rx="1"/>
  <rect x="8" y="14" width="16" height="4" fill="white" rx="1"/>
  <ellipse cx="8" cy="8" rx="2" ry="3" fill="white" opacity="0.8" transform="rotate(25 8 8)"/>
  <ellipse cx="24" cy="8" rx="2" ry="3" fill="white" opacity="0.8" transform="rotate(-25 24 8)"/>
  <ellipse cx="8" cy="24" rx="2" ry="3" fill="white" opacity="0.8" transform="rotate(-25 8 24)"/>
  <ellipse cx="24" cy="24" rx="2" ry="3" fill="white" opacity="0.8" transform="rotate(25 24 24)"/>
</svg>
EOF

# 3. Ajouter manifest PWA
cat > public/manifest.json << 'EOF'
{
  "name": "GLP-1 France",
  "short_name": "GLP-1 FR",
  "description": "Guide complet sur les traitements GLP-1",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
EOF
```

#### Configuration Layout (BaseLayout.astro)
```html
<!-- Dans <head> -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#16a34a">
```

#### Navigation Menu (**MIS À JOUR**)
Le menu principal a été réorganisé :
- **Contact**, **Nos Experts** et **Témoignages** déplacés dans le dropdown "Plus"
- Permet un menu principal plus épuré
- Menu mobile automatiquement synchronisé

```html
<!-- Structure menu dropdown -->
<li class="nav-item dropdown" id="more-dropdown">
  <a href="#" class="nav-link dropdown-toggle">Plus ▼</a>
  <ul class="dropdown-menu" id="overflow-menu">
    <li><a href="/contact/" class="dropdown-link">Contact</a></li>
    <li><a href="/guides/experts/" class="dropdown-link">Nos Experts</a></li>
    <li><a href="/temoignages/avant-apres-glp1/" class="dropdown-link">Témoignages</a></li>
    <!-- Autres liens... -->
  </ul>
</li>
```

### ❌ Simple Browser VS Code - Page Blanche

#### Symptômes
- Simple Browser affiche une page blanche
- Serveur fonctionne correctement (codes 200 dans les logs)
- Site accessible dans navigateur externe

#### Causes Communes
1. **Problème IPv6/IPv4** - Astro écoute sur IPv6, Simple Browser utilise IPv4
2. **Cache Simple Browser** corrompu
3. **Restrictions de sécurité** VS Code
4. **Conflit de ports** multiples

#### Solutions ✅

**1. Forcer IPv4 dans Astro (config/astro.config.mjs)** :
```javascript
export default defineConfig({
  server: {
    port: 4321,
    host: '127.0.0.1',  // Force IPv4 explicitement
    open: true
  },
  // ... reste de la config
});
```

**2. Utiliser l'adresse IPv4 directe** :
- Au lieu de `http://localhost:4327/`
- Utiliser `http://127.0.0.1:4321/`

**3. Alternative : Navigateur système** :
```powershell
# Ouvrir dans navigateur par défaut
Start-Process "http://127.0.0.1:4321/"
```

**4. Redémarrer Simple Browser** :
- Fermer tous les onglets Simple Browser
- `Ctrl+Shift+P` → "Simple Browser: Show"
- Entrer la nouvelle URL IPv4

**5. Vider cache VS Code** :
```powershell
# Fermer VS Code et supprimer cache
Remove-Item "$env:APPDATA\Code\User\workspaceStorage" -Recurse -Force
```

---

## 🛠️ Problèmes TinaCMStic Rapide

### Checklist Première Intervention
1. **Vérifier l'état système**
   - [ ] Site en ligne : https://glp1-france.fr
   - [ ] TinaCMS accessible : `/admin/index.html`
   - [ ] Build local réussi : `npm run build`
   - [ ] Logs d'erreur dans la console

2. **Identifier le scope du problème**
   - [ ] Problème TinaCMS (édition)
   - [ ] Problème Astro (build/affichage)
   - [ ] Problème Supabase (données)
   - [ ] Problème déploiement (production)

---

## � Problèmes Formulaires et APIs

### ❌ Formulaire de Contact - Erreurs 500/400

#### Symptômes
- Formulaire de contact retourne erreur 500 ou 400
- Message "aide moi" ou autres erreurs de transmission
- Données non reçues côté serveur (body vide)
- Échecs répétés de soumission

#### Causes Communes
1. **Problème de transmission de données** (FormData/JSON incompatible)
2. **API routes non server-side rendered** (manque `prerender=false`)
3. **Mismatch entre Content-Type et parsing**
4. **Problèmes Supabase (table inexistante, contraintes)**

#### Solution Complète ✅
```bash
# 1. Diagnostic API - Créer endpoint de test
cat > src/pages/api/test.js << 'EOF'
export const prerender = false;

export async function POST({ request }) {
  try {
    console.log('🔍 Headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.text();
    console.log('📦 Raw body:', body);
    
    return new Response(JSON.stringify({ 
      success: true, 
      received: body,
      length: body.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
EOF

# 2. API Contact fonctionnelle avec URLSearchParams
cat > src/pages/api/contact.js << 'EOF'
export const prerender = false;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST({ request }) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    const userData = {
      name: params.get('name'),
      email: params.get('email'),
      preferences: {
        phone: params.get('phone'),
        age: params.get('age'),
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

    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(userData, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      message: 'Message envoyé avec succès',
      data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur contact:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
EOF

# 3. Mise à jour côté client pour URLSearchParams
# Dans le formulaire contact.astro, section <script>:
```

#### Côté Client - Transmission URLSearchParams
```javascript
// Dans src/pages/_utils/contact.astro ou contact.astro
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(form);
  
  // Conversion FormData → URLSearchParams
  const params = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    params.append(key, value);
  }
  
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  });
  
  const result = await response.json();
  // Gestion succès/erreur...
});
```

#### Vérification Supabase
```sql
-- Vérifier table users existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Structure minimale requise :
-- id (uuid, primary key)
-- email (text, unique)
-- name (text)
-- preferences (jsonb)
-- created_at (timestamp)
```

#### Tests de Validation
```bash
# 1. Test endpoint fonctionnel
curl -X POST http://localhost:4327/api/test \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Test&email=test@example.com"

# 2. Vérifier logs serveur
# Terminal développement doit afficher données reçues

# 3. Test complet formulaire
# Remplir formulaire → F12 Console → Vérifier requête/réponse
```

#### Cleanup Après Résolution
```bash
# Supprimer fichiers de debug
rm src/pages/api/test.js
rm src/pages/api/contact-simple.js
rm src/pages/api/contact-working.js

# Garder uniquement /api/contact.js fonctionnel
```

---

## �🛠️ Problèmes TinaCMS

### ❌ Bouton Save Désactivé/Grisé

#### Symptômes
- Interface TinaCMS chargée mais bouton "Save" inactif
- Champs remplis mais impossible de sauvegarder
- Messages d'erreur dans la console F12

#### Causes Communes
1. **Frontmatter invalide ou incomplet**
2. **Champ `title` manquant ou vide**
3. **Auteur non validé dans le schéma**
4. **Format de date incorrect**
5. **Caractères spéciaux dans le contenu**

#### Solution Étape par Étape
```bash
# 1. Diagnostic initial
# Ouvrir F12 > Console
# Chercher erreurs TinaCMS/React

# 2. Vérifier schéma
# Comparer avec article fonctionnel
cat src/content/medicaments-glp1/traitement-diabete-type-2.md

# 3. Validation manuelle frontmatter
---
title: "Titre Non Vide"          # ✅ OBLIGATOIRE
description: "Description"        # ✅ OBLIGATOIRE  
author: "Dr. Sarah Martin"        # ✅ DANS LA LISTE VALIDÉE
category: "Guide médical"         # ✅ DANS LA LISTE VALIDÉE
publishDate: 2024-12-19          # ✅ FORMAT CORRECT
tags: ["glp1", "medicament"]     # ✅ ARRAY VALIDE
---

# 4. Si problème persiste : recréer le fichier
# Copier contenu -> Supprimer fichier -> Recréer via TinaCMS
```

#### Test de Validation
```bash
# Test build après correction
npm run build

# Résultat attendu
✅ Building static entrypoints...
✅ Completed in XX.XXs

# Si échec, vérifier logs détaillés
npm run build --verbose
```

### ❌ TinaCMS Interface ne Charge Pas

#### Symptômes
- Page `/admin/index.html` blanche ou erreur 404
- Erreurs JavaScript dans la console
- Interface partiellement chargée

#### Solutions
```bash
# 1. Rebuild TinaCMS
npm run tina:build

# 2. Clear cache et rebuild
rm -rf .tina/
rm -rf admin/
npm run build

# 3. Vérifier variables d'environnement
echo $TINA_CLIENT_ID
# Doit afficher : d2c40213-494b-4005-94ad-b601dbdf1f0e

# 4. Redémarrer serveur développement
npm run dev
```

#### Vérification Configuration
```typescript
// Vérifier tina/config.ts
export default defineConfig({
  clientId: "d2c40213-494b-4005-94ad-b601dbdf1f0e", // ✅ Correct
  build: {
    outputFolder: "admin",     // ✅ Dossier correct
    publicFolder: "public",    // ✅ Dossier correct
  },
  // ...
});
```

---

## 🏗️ Problèmes Astro Build

### ❌ Build Failed - Schema Validation

#### Symptômes
```bash
npm run build
❌ Error: Content collection validation failed
❌ ZodError: Invalid type in collection entry
```

#### Diagnostic
```bash
# Identifier le fichier problématique dans les logs
npm run build 2>&1 | grep -E "Error|Failed|Invalid"

# Example de log d'erreur :
# src/content/medicaments-glp1/problematic-article.md
# ZodError: Required field 'title' is missing
```

#### Solutions par Type d'Erreur
```bash
# 1. Champ requis manquant
# Ajouter le champ manquant dans le frontmatter

# 2. Type de données incorrect
# Corriger le format (date, boolean, array)

# 3. Collection mal configurée
# Vérifier src/content/config.ts

# 4. Fichier corrompu
# Supprimer et recréer l'article
```

### ❌ Build Successful mais Page 404

#### Symptômes
- Build réussit sans erreur
- Page article inaccessible (404)
- Autres pages fonctionnent

#### Diagnostic
```bash
# 1. Vérifier génération du fichier
ls -la dist/collections/medicaments-glp1/
# Le fichier HTML doit être présent

# 2. Vérifier le slug dans frontmatter
# Le slug doit correspondre au nom de fichier

# 3. Vérifier la collection dans config
# Collection doit être définie dans src/content/config.ts
```

#### Solution
```typescript
// Vérifier src/content/config.ts
export const collections = {
  'medicaments-glp1': medicamentsGlp1,  // ✅ Nom exact
  // ...
};

// Vérifier le routing dans pages/
// src/pages/collections/medicaments-glp1/[slug].astro
```

---

## 🗄️ Problèmes Supabase

### ❌ Database Connection Failed

#### Symptômes
- Erreurs dans console : "Failed to connect to Supabase"
- Dashboard admin ne charge pas les données
- Formulaires ne soumettent pas

#### Diagnostic
```javascript
// Test connexion dans console navigateur
const { data, error } = await supabase.from('users_extended').select('count');
console.log('Supabase test:', { data, error });
```

#### Solutions
```bash
# 1. Vérifier variables d'environnement
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# 2. Vérifier statut Supabase
# https://status.supabase.com/

# 3. Test avec curl
curl -H "apikey: YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/users_extended?select=count"

# 4. Régénérer clés API si nécessaire
# Via dashboard Supabase > Settings > API
```

### ❌ RLS (Row Level Security) Bloque Accès

#### Symptômes
- Requêtes retournent des résultats vides
- Erreur : "Row-level security policy violation"

#### Solution
```sql
-- Vérifier politiques RLS dans Supabase SQL Editor
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'your_table_name';

-- Exemple de politique publique nécessaire
CREATE POLICY "Public read access" ON guide_submissions
  FOR SELECT TO anon USING (true);
```

---

## 🚀 Problèmes Déploiement

### ❌ Deploy Script Failed

#### Symptômes
```bash
npm run deploy
❌ Error: SFTP connection failed
❌ Error: Build failed before deploy
```

#### Diagnostic et Solutions
```bash
# 1. Vérifier build local d'abord
npm run build
# Doit réussir avant déploiement

# 2. Vérifier credentials SFTP
# Variables d'environnement ou config script

# 3. Test connexion SFTP manuelle
# Utiliser client SFTP (FileZilla, WinSCP)

# 4. Vérifier espace disque serveur
# Via cPanel ou dashboard hébergeur
```

### ❌ Site en Production Affiche Anciennes Données

#### Symptômes
- Déploiement réussi mais contenu non mis à jour
- Cache navigateur ou CDN

#### Solutions
```bash
# 1. Clear cache navigateur
# Ctrl+Shift+R (hard refresh)

# 2. Vérifier timestamp fichiers serveur
# Via SFTP ou cPanel File Manager

# 3. Purge CDN cache si utilisé
# Via dashboard CDN (Cloudflare, etc.)

# 4. Forcer rebuild complet
rm -rf dist/
npm run build
npm run deploy
```

---

## 🔧 Outils de Diagnostic

### Scripts de Test Automatisés

#### Test Complet Système
```bash
#!/bin/bash
# scripts/test-system.sh

echo "🔍 Testing GLP-1 System Health..."

# Test 1: Build
echo "📦 Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build: OK"
else
    echo "❌ Build: FAILED"
fi

# Test 2: TinaCMS
echo "📝 Testing TinaCMS..."
if [ -f "admin/index.html" ]; then
    echo "✅ TinaCMS: OK"
else
    echo "❌ TinaCMS: Missing admin interface"
fi

# Test 3: Supabase
echo "🗄️ Testing Supabase..."
curl -s -H "apikey: $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Supabase: OK"
else
    echo "❌ Supabase: Connection failed"
fi

# Test 4: Production
echo "🌐 Testing production..."
curl -s -o /dev/null -w "%{http_code}" https://glp1-france.fr/ | grep -q "200"
if [ $? -eq 0 ]; then
    echo "✅ Production: OK"
else
    echo "❌ Production: Site unreachable"
fi
```

#### Test Articles Individuels
```bash
#!/bin/bash
# scripts/test-articles.sh

echo "📄 Testing articles validation..."

for file in src/content/**/*.md; do
    echo "Testing: $file"
    # Test frontmatter YAML validity
    head -20 "$file" | grep -E "^---$" | wc -l | grep -q "2"
    if [ $? -eq 0 ]; then
        echo "✅ $file: Valid frontmatter"
    else
        echo "❌ $file: Invalid frontmatter"
    fi
done
```

### Monitoring en Temps Réel
```javascript
// scripts/monitor.js
const fs = require('fs');
const path = require('path');

// Monitor changes in content
fs.watch('src/content', { recursive: true }, (eventType, filename) => {
    console.log(`📝 Content changed: ${filename}`);
    // Auto-test changed file
    if (filename.endsWith('.md')) {
        testArticle(filename);
    }
});

function testArticle(filename) {
    // Test frontmatter validity
    // Test build with only this file
    console.log(`🔍 Testing ${filename}...`);
}
```

---

## 📚 Procédures d'Urgence

### Restauration Rapide
```bash
# 1. Rollback dernier commit stable
git log --oneline -10
git reset --hard <commit_stable>

# 2. Rebuild et redeploy
npm run build
npm run deploy

# 3. Vérifier restauration
curl -I https://glp1-france.fr/
```

### Récupération Article Corrompu
```bash
# 1. Backup avant intervention
cp src/content/medicaments-glp1/problematic-article.md backup/

# 2. Restaurer version Git précédente
git checkout HEAD~1 -- src/content/medicaments-glp1/problematic-article.md

# 3. Ou copier depuis template
cp src/content/medicaments-glp1/traitement-diabete-type-2.md \
   src/content/medicaments-glp1/new-article.md

# 4. Éditer avec nouveau contenu via TinaCMS
```

### Contact Urgence
```bash
# Escalation si problème critique :
# 1. Vérifier status des services tiers
# 2. Contacter hébergeur si problème serveur
# 3. Rollback automatique si disponible
# 4. Documentation de l'incident
```

---

## 🎯 Prévention

### Checklist Pré-Déploiement
- [ ] Tests locaux réussis (`npm run build`)
- [ ] Articles testés manuellement
- [ ] Backup base de données
- [ ] Vérification espace disque serveur
- [ ] Test sur environnement de staging si disponible

### Monitoring Proactif
```bash
# Script monitoring quotidien
# Cron job : 0 8 * * * /path/to/daily-check.sh

#!/bin/bash
# daily-check.sh
echo "📊 Daily Health Check - $(date)"
./scripts/test-system.sh >> logs/daily-health.log 2>&1
```

---

## 🔗 Ressources et Contacts

### Documentation Technique
- [Schema Validation Guide](../core/SCHEMA_VALIDATION.md)
- [Configuration Système](../core/CONFIGURATION_SYSTEME.md)
- [Guide Création Articles](../core/GUIDE_CREATION_ARTICLES.md)

### Outils de Debug
- **TinaCMS Logs** : Console navigateur F12
- **Astro Logs** : Terminal `npm run build --verbose`
- **Supabase Logs** : Dashboard > Logs
- **Production Logs** : Via cPanel ou hébergeur

### Services Status
- **Supabase Status** : https://status.supabase.com/
- **TinaCMS Status** : https://status.tina.io/
- **Hostinger Status** : Dashboard hébergeur

---

*Guide de dépannage maintenu à jour - Dernière révision : 19 décembre 2024*
