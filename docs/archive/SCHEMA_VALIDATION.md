# 🔍 Validation des Schémas - TinaCMS & Astro

## 🎯 Vue d'ensemble
Ce guide détaille les systèmes de validation des schémas pour TinaCMS et Astro, essentiels pour le bon fonctionnement de l'interface d'édition et la génération du site.

---

## 🛠️ Architecture Validation

### Dual Schema System
Le projet utilise **deux systèmes de validation** complémentaires :

1. **TinaCMS Schema** (`tina/config.ts`)
   - Validation interface d'édition
   - Champs obligatoires et optionnels
   - Types de données et formats
   - Listes déroulantes validées

2. **Astro Content Schema** (`src/content/config.ts`)
   - Validation génération statique
   - Types TypeScript
   - Validation build-time
   - Schema Zod unifié

---

## 📋 Configuration TinaCMS Schema

### Fichier : `tina/config.ts`

#### Structure Principale
```typescript
export default defineConfig({
  branch: "main",
  clientId: "d2c40213-494b-4005-94ad-b601dbdf1f0e",
  token: process.env.TINA_TOKEN,
  
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  
  schema: {
    collections: [
      // Collections définies ici
    ],
  },
});
```

#### Champs Standardisés (`standardArticleFields`)
```typescript
const standardArticleFields = [
  {
    type: "string",
    name: "title",
    label: "Titre",
    required: true,  // ⚠️ OBLIGATOIRE
  },
  {
    type: "string",
    name: "description", 
    label: "Description",
    required: true,  // ⚠️ OBLIGATOIRE
  },
  {
    type: "string",
    name: "author",
    label: "Auteur",
    required: true,  // ⚠️ OBLIGATOIRE
    options: [
      "Dr. Sarah Martin",
      "Dr. Pierre Dubois", 
      "Dr. Marie Rousseau",
      "Équipe GLP-1 France"
    ]
  },
  {
    type: "string",
    name: "category",
    label: "Catégorie",
    required: true,  // ⚠️ OBLIGATOIRE
    options: [
      "Guide médical",
      "Étude scientifique",
      "Témoignage patient",
      "Guide pratique",
      "Actualité médicale"
    ]
  },
  {
    type: "datetime",
    name: "publishDate",
    label: "Date de publication",
    required: true,  // ⚠️ OBLIGATOIRE
  },
  {
    type: "string",
    name: "tags",
    label: "Tags",
    list: true,
    required: false,
  }
  // ... autres champs
];
```

#### Collections TinaCMS
```typescript
{
  name: "medicaments-glp1",
  label: "Médicaments GLP-1",
  path: "src/content/medicaments-glp1",
  fields: standardArticleFields,
},
{
  name: "recherche-glp1", 
  label: "Recherche GLP-1",
  path: "src/content/recherche-glp1",
  fields: standardArticleFields,
}
// ... autres collections
```

---

## 🎲 Configuration Astro Schema

### Fichier : `src/content/config.ts`

#### Schema Unifié
```typescript
import { defineCollection, z } from 'astro:content';

// Schema unifié pour toutes les collections
const unifiedSchema = z.object({
  title: z.string(),           // ⚠️ OBLIGATOIRE
  description: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  publishDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  draft: z.boolean().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// Collections définies
const medicamentsGlp1 = defineCollection({
  type: 'content',
  schema: unifiedSchema,
});

const rechercheGlp1 = defineCollection({
  type: 'content', 
  schema: unifiedSchema,
});

export const collections = {
  'medicaments-glp1': medicamentsGlp1,
  'recherche-glp1': rechercheGlp1,
  // ... autres collections
};
```

---

## ⚠️ Règles de Validation Critique

### Champs Obligatoires Absolus

#### TinaCMS (Interface)
- ✅ `title` : **required: true**
- ✅ `description` : **required: true** 
- ✅ `author` : **required: true** + liste validée
- ✅ `category` : **required: true** + liste validée
- ✅ `publishDate` : **required: true**

#### Astro (Build)
- ✅ `title` : **z.string()** (sans .optional())
- ⚠️ Autres champs : **z.string().optional()**

### Synchronisation Critiques
```typescript
// ❌ DANGER : Incohérence qui cause des erreurs
// TinaCMS : required: true
// Astro : z.string().optional()

// ✅ CORRECT : Cohérence
// TinaCMS : required: true  
// Astro : z.string()
```

---

## 🔧 Diagnostic et Débogage

### Test de Validation TinaCMS

#### Vérification Interface
1. **Accéder à TinaCMS**
   ```
   URL: /admin/index.html
   ```

2. **Tester création article**
   - Créer nouvel article
   - Vérifier champs obligatoires
   - Tester bouton "Save"

3. **Indicateurs problème**
   - ❌ Bouton "Save" grisé/inactif
   - ❌ Messages d'erreur rouges
   - ❌ Champs marqués requis non remplis

#### Erreurs TinaCMS Communes
```typescript
// ❌ Erreur : Champ requis manquant
{
  type: "string",
  name: "title", 
  // required: true MANQUANT
}

// ✅ Correct
{
  type: "string",
  name: "title",
  required: true,
}
```

### Test de Validation Astro

#### Build Test
```bash
# Test validation complète
npm run build

# Résultats attendus
✅ Building static entrypoints...
✅ Completed in 45.67s
✅ Built 475 files...

# Erreurs possibles
❌ Error: [field] is required
❌ ZodError: Invalid schema
❌ Content collection validation failed
```

#### Diagnostic Erreurs Build
```bash
# Build avec détails d'erreur
npm run build --verbose

# Logs spécifiques content collections
# Vérifier les erreurs Zod
```

---

## 🛠️ Procédures de Correction

### Erreur 1 : Save Button TinaCMS Inactif

#### Diagnostic
```typescript
// Vérifier tina/config.ts
const standardArticleFields = [
  {
    type: "string",
    name: "title",
    required: true,  // ⚠️ Vérifier présence
  }
  // ... autres champs requis
];
```

#### Solution
1. **Vérifier champs requis** dans `tina/config.ts`
2. **Redémarrer serveur TinaCMS**
   ```bash
   npm run dev
   ```
3. **Vider cache navigateur** (Ctrl+Shift+R)

### Erreur 2 : Build Astro Failed

#### Diagnostic
```typescript
// Vérifier src/content/config.ts
const unifiedSchema = z.object({
  title: z.string(),  // ⚠️ Sans .optional() si requis
  // ...
});
```

#### Solution
1. **Corriger schema Astro** pour cohérence avec TinaCMS
2. **Test build local**
   ```bash
   npm run build
   ```
3. **Vérifier frontmatter articles** existants

### Erreur 3 : Incohérence Schémas

#### Diagnostic Manuel
```yaml
# Article problématique - frontmatter
---
title: "Test"  # ✅ Présent
# author: ""   # ❌ Manquant mais requis TinaCMS
---
```

#### Solution Systématique
1. **Audit complet schémas**
   ```bash
   # Comparer tina/config.ts et src/content/config.ts
   # Vérifier cohérence required/optional
   ```

2. **Template de référence**
   ```typescript
   // Utiliser un article fonctionnel comme base
   // Copier frontmatter exact
   ```

3. **Recréation si nécessaire**
   ```bash
   # Supprimer article problématique
   # Recréer avec template validé
   ```

---

## 📊 Matrices de Validation

### Correspondance TinaCMS ↔ Astro

| Champ | TinaCMS | Astro | Status |
|-------|---------|-------|--------|
| `title` | `required: true` | `z.string()` | ✅ Synchro |
| `description` | `required: true` | `z.string().optional()` | ⚠️ Vérifier |
| `author` | `required: true` + options | `z.string().optional()` | ⚠️ Vérifier |
| `category` | `required: true` + options | `z.string().optional()` | ⚠️ Vérifier |
| `publishDate` | `required: true` | `z.date().optional()` | ⚠️ Vérifier |
| `tags` | `required: false` | `z.array().optional()` | ✅ Synchro |

### Actions Correctives
```typescript
// Solution recommandée : Rendre optionnel dans TinaCMS
// Sauf pour 'title' qui reste obligatoire partout

const standardArticleFields = [
  {
    type: "string",
    name: "title",
    required: true,     // Obligatoire partout
  },
  {
    type: "string", 
    name: "description",
    required: false,    // Optionnel pour flexibilité
  }
  // ...
];
```

---

## 🎯 Bonnes Pratiques

### Développement Schémas
1. **Toujours tester localement** avant production
2. **Maintenir cohérence** TinaCMS ↔ Astro
3. **Documenter modifications** dans ce guide
4. **Utiliser templates validés** pour nouveaux articles

### Maintenance
1. **Audit mensuel** des schémas
2. **Backup avant modifications** majeures
3. **Test systematique** après changements
4. **Validation articles** existants après updates

### Débogage
1. **Logs détaillés** avec `--verbose`
2. **Tests isolés** par collection
3. **Validation manuelle** frontmatter
4. **Comparaison** avec articles fonctionnels

---

## 🔗 Ressources

### Liens Utiles
- [TinaCMS Schema Documentation](https://tina.io/docs/schema/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Zod Validation](https://zod.dev/)

### Fichiers Clés
- `tina/config.ts` - Configuration TinaCMS
- `src/content/config.ts` - Schema Astro
- `src/content/medicaments-glp1/` - Articles de référence

---

*Guide technique maintenu à jour - Dernière révision : 19 décembre 2024*
