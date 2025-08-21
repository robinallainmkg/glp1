# 🔧 Résolution Problème Formulaire de Contact - GLP-1 France

## 📋 Problème résolu
**Date** : 21 août 2025  
**Symptôme** : Formulaire de contact retournait des erreurs 500/400 avec "Aucune donnée reçue"  
**Cause** : Problème de transmission de données entre client et serveur Astro  
**Solution** : API avec `prerender = false` + URLSearchParams + gestion utilisateurs existants  

---

## 🚨 Problèmes identifiés

### 1. Transmission de données vide
- **Symptôme** : API recevait un body vide malgré l'envoi côté client
- **Cause** : Configuration Astro hybride + mauvais Content-Type
- **Solution** : Utiliser `URLSearchParams` avec `application/x-www-form-urlencoded`

### 2. API routes pas server-side
- **Symptôme** : APIs ne recevaient pas les données POST
- **Cause** : Routes API en mode statique au lieu de server-side
- **Solution** : Ajouter `export const prerender = false;` dans les APIs

### 3. Tables Supabase inexistantes
- **Symptôme** : Erreurs "table not found" ou "column not found"
- **Cause** : APIs tentaient d'utiliser des tables/colonnes qui n'existaient pas
- **Solution** : Utiliser la table `users` existante avec structure minimale

### 4. Contrainte d'unicité email
- **Symptôme** : Erreur "duplicate key value violates unique constraint"
- **Cause** : Tentative de créer un utilisateur avec un email déjà existant
- **Solution** : Vérifier l'existence + mise à jour au lieu de création

---

## ✅ Solution finale qui fonctionne

### API `/api/contact-working.js`
```javascript
// API endpoint qui fonctionne à coup sûr - Server-side uniquement
import { supabaseAdmin } from '../../lib/supabase.js';

// OBLIGATOIRE : Forcer cette route à être server-side rendered
export const prerender = false;

export async function POST({ request }) {
  try {
    // 1. Lire les données comme URLSearchParams
    const bodyText = await request.text();
    const params = new URLSearchParams(bodyText);
    
    // 2. Convertir en objet avec gestion des arrays
    const data = {};
    for (const [key, value] of params.entries()) {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }
    
    // 3. Préparer les données pour la table users
    const userData = {
      name: data.name,
      email: data.email,
      preferences: {
        // Toutes les données du formulaire ici
        contact_form: true,
        phone: data.phone,
        age: data.age,
        subject: data.subject,
        message: data.message,
        treatment: data.treatment,
        concerns: Array.isArray(data.concerns) ? data.concerns : [data.concerns].filter(Boolean),
        newsletter_signup: data.newsletter === 'yes',
        source: 'contact_form',
        submission_date: new Date().toISOString()
      }
    };
    
    // 4. Vérifier si l'utilisateur existe (gestion email unique)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email, preferences')
      .eq('email', userData.email)
      .single();
    
    let result;
    
    if (existingUser) {
      // Mettre à jour utilisateur existant avec historique
      const updatedPreferences = {
        ...existingUser.preferences,
        ...userData.preferences,
        contact_history: [
          ...(existingUser.preferences?.contact_history || []),
          {
            date: new Date().toISOString(),
            subject: userData.preferences.subject,
            message: userData.preferences.message,
            treatment: userData.preferences.treatment,
            concerns: userData.preferences.concerns
          }
        ]
      };
      
      const { data: updateData, error } = await supabaseAdmin
        .from('users')
        .update({ 
          name: userData.name,
          preferences: updatedPreferences 
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (error) throw error;
      result = updateData;
      
    } else {
      // Créer nouvel utilisateur
      const { data: newData, error } = await supabaseAdmin
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      result = newData;
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Contact enregistré avec succès',
      data: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Erreur API Contact:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erreur serveur',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Côté client (contact.astro)
```javascript
// Créer URLSearchParams au lieu de JSON
const params = new URLSearchParams();
for (const [key, value] of Object.entries(formData)) {
    if (Array.isArray(value)) {
        value.forEach(item => params.append(key, item));
    } else {
        params.append(key, value);
    }
}

// Envoyer avec le bon Content-Type
const response = await fetch('/api/contact-working', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: params.toString()
});
```

---

## 📚 Structure Supabase utilisée

### Table `users` (minimale qui fonctionne)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Données stockées dans `preferences`
```json
{
  "contact_form": true,
  "phone": "0679430759",
  "age": "26-35",
  "subject": "effets-secondaires",
  "message": "Message du contact",
  "treatment": "saxenda",
  "concerns": ["efficacite", "prix"],
  "newsletter_signup": true,
  "source": "contact_form",
  "submission_date": "2025-08-21T10:35:28.000Z",
  "contact_history": [
    {
      "date": "2025-08-21T10:35:28.000Z",
      "subject": "effets-secondaires",
      "message": "Premier contact",
      "treatment": "saxenda",
      "concerns": ["efficacite", "prix"]
    }
  ]
}
```

---

## 🔍 Tests et diagnostics

### API de test simple
```javascript
// /api/test-contact.js
export const prerender = false;

export async function POST({ request }) {
  try {
    const bodyText = await request.text();
    console.log('Body reçu:', bodyText);
    
    return new Response(JSON.stringify({ 
      success: true,
      received: bodyText,
      length: bodyText.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Commande de test Supabase
```bash
# Tester la connexion
node scripts/database/test-supabase-users.mjs

# Vérifier les tables disponibles
node scripts/database/audit-supabase-tables.mjs
```

---

## 🚀 Checklist de déploiement

### ✅ Avant de créer une API contact
1. **Vérifier les tables Supabase existantes**
   ```bash
   node scripts/database/audit-supabase-tables.mjs
   ```

2. **Tester la connexion Supabase**
   ```bash
   node scripts/database/test-supabase-users.mjs
   ```

3. **Créer une API de test d'abord**
   - Créer `/api/test-contact.js` avec `prerender = false`
   - Tester avec URLSearchParams
   - Vérifier les logs serveur

4. **Une fois le test OK, créer l'API finale**
   - Copier la structure qui fonctionne
   - Ajouter la logique métier
   - Gérer les utilisateurs existants

### ✅ Configuration Astro requise
```javascript
// astro.config.mjs
export default defineConfig({
  output: 'hybrid', // OBLIGATOIRE pour les API routes
  // ... autres configs
});
```

### ✅ Structure API qui fonctionne
1. `export const prerender = false;` en première ligne
2. Lire avec `request.text()` puis `URLSearchParams`
3. Content-Type `application/x-www-form-urlencoded`
4. Gestion des erreurs complète
5. Logs détaillés pour debugging

---

## 🎯 Résultat final

✅ **Formulaire fonctionnel**  
✅ **Données sauvegardées en base**  
✅ **Gestion utilisateurs existants**  
✅ **Historique des contacts**  
✅ **Gestion d'erreurs robuste**  

---

## 📞 Support

Si le problème se reproduit :
1. Vérifier les logs serveur dans la console
2. Tester avec l'API `/api/test-contact.js`
3. Vérifier la connexion Supabase
4. S'assurer que `prerender = false` est présent
5. Utiliser URLSearchParams, pas JSON

**Dernière mise à jour** : 21 août 2025  
**Status** : ✅ RÉSOLU ET TESTÉ
