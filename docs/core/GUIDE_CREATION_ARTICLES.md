# 📝 Guide Complet - Création d'Articles GLP-1

## 🎯 Objectif
Ce guide détaille toutes les étapes pour créer, éditer et publier des articles sur le site GLP-1 France avec TinaCMS, en respectant les schémas de validation Astro et les bonnes pratiques SEO.

---

## 🔧 Prérequis Système

### TinaCMS Configuration
- **Version** : 1.5+  
- **Client ID** : `d2c40213-494b-4005-94ad-b601dbdf1f0e`
- **Interface** : `/admin/index.html`
- **Schema Config** : `tina/config.ts`

### Astro Content Collections
- **Schema Config** : `src/content/config.ts`
- **Collections disponibles** :
  - `medicaments-glp1` - Articles sur les médicaments
  - `recherche-glp1` - Articles de recherche scientifique
  - `temoignages-glp1` - Témoignages patients
  - `guides-pratiques` - Guides pratiques
  - Et 5 autres collections...

---

## 📋 Structure Frontmatter Obligatoire

### Champs Requis (Validation TinaCMS + Astro)
```yaml
---
title: "Titre de l'article (obligatoire)"
description: "Description SEO claire et concise"
author: "Dr. Sarah Martin"  # Ou autre auteur validé
category: "Guide médical"    # Catégorie validée
publishDate: 2024-12-19      # Format YYYY-MM-DD
tags: ["glp1", "semaglutide", "ozempic"]  # 3-5 tags max
featured: false              # true/false
draft: false                 # true/false
seoTitle: "Titre SEO optimisé"
metaDescription: "Meta description 150-160 caractères"
---
```

### Auteurs Validés
- `"Dr. Sarah Martin"` - Médecin endocrinologue
- `"Dr. Pierre Dubois"` - Spécialiste diabète
- `"Dr. Marie Rousseau"` - Nutritionniste
- `"Équipe GLP-1 France"` - Équipe éditoriale

### Catégories Validées
- `"Guide médical"` - Articles médicaux
- `"Étude scientifique"` - Recherche et études
- `"Témoignage patient"` - Expériences patients
- `"Guide pratique"` - Guides d'utilisation
- `"Actualité médicale"` - News médicales

---

## 🚀 Processus Création Article

### Étape 1 : Préparation
1. **Identifier la collection cible**
   ```bash
   # Collections disponibles dans src/content/
   - medicaments-glp1/     # Articles médicaments
   - recherche-glp1/       # Études scientifiques  
   - temoignages-glp1/     # Témoignages
   - guides-pratiques/     # Guides pratiques
   ```

2. **Définir le slug URL**
   - Format : `nom-article-sans-accents`
   - Exemple : `ozempic-effets-secondaires.md`

### Étape 2 : Interface TinaCMS
1. **Accéder à TinaCMS**
   ```
   URL : /admin/index.html
   ```

2. **Créer un nouvel article**
   - Cliquer sur "Collections"
   - Sélectionner la collection appropriée
   - Cliquer sur "Create New"

3. **Remplir le frontmatter**
   - ✅ Titre (obligatoire)
   - ✅ Description
   - ✅ Auteur (liste déroulante)
   - ✅ Catégorie (liste déroulante)
   - ✅ Date de publication
   - ✅ Tags (2-5 recommandés)

### Étape 3 : Rédaction Contenu
1. **Structure Markdown recommandée**
   ```markdown
   # Titre Principal (H1)
   
   ## Introduction
   Paragraphe d'accroche avec mots-clés principaux.
   
   ## Sommaire
   - Point 1
   - Point 2
   - Point 3
   
   ## Section 1 (H2)
   ### Sous-section (H3)
   Contenu détaillé...
   
   ## Section 2 (H2)
   ### Sous-section (H3)
   
   ## Conclusion
   Synthèse et call-to-action
   ```

2. **Bonnes pratiques contenu**
   - **Mots-clés** : Intégrer naturellement les termes GLP-1
   - **Longueur** : 1500-3000 mots minimum
   - **Paragraphes** : 3-4 lignes maximum
   - **Liens internes** : 3-5 liens vers autres articles
   - **Expertise** : Citations d'études, données chiffrées

### Étape 4 : Validation et Test
1. **Validation automatique TinaCMS**
   - ✅ Champs obligatoires remplis
   - ✅ Format frontmatter correct
   - ✅ Auteur dans la liste validée
   - ✅ Catégorie dans la liste validée

2. **Test build local**
   ```bash
   npm run build
   # Vérifier qu'aucune erreur de validation Astro
   ```

3. **Prévisualisation**
   ```bash
   npm run dev
   # Vérifier l'affichage sur http://localhost:4321
   ```

---

## ⚠️ Erreurs Courantes et Solutions

### Erreur 1 : Save Button Désactivé (TinaCMS)
**Symptôme** : Bouton "Save" grisé/non fonctionnel
**Causes principales** :
- Frontmatter invalide ou incomplet
- Champ `title` manquant
- Auteur non validé dans le schéma
- Format de date incorrect

**Solution** :
1. Vérifier tous les champs obligatoires
2. Copier la structure d'un article fonctionnel
3. Recréer le fichier si nécessaire

### Erreur 2 : Build Astro Failed
**Symptôme** : `npm run build` échoue
**Causes principales** :
- Schema Astro non respecté
- Caractères spéciaux dans le frontmatter
- Collections mal configurées

**Solution** :
```bash
# Vérifier les erreurs détaillées
npm run build --verbose

# Validation manuelle du schema
# Comparer avec un article fonctionnel
```

### Erreur 3 : Article Non Visible
**Symptôme** : Article créé mais absent du site
**Causes principales** :
- `draft: true` dans le frontmatter
- Collection mal configurée
- Erreur de routing Astro

**Solution** :
1. Vérifier `draft: false`
2. Vérifier le nom de la collection
3. Rebuild complet du site

---

## 🔍 Templates et Exemples

### Template Article Médicament
```markdown
---
title: "Nom du Médicament GLP-1 : Guide Complet"
description: "Guide complet sur [médicament] : efficacité, effets secondaires, dosage et conseils d'utilisation"
author: "Dr. Sarah Martin"
category: "Guide médical"
publishDate: 2024-12-19
tags: ["glp1", "médicament", "diabète"]
featured: false
draft: false
seoTitle: "Nom du Médicament : Tout Savoir | Guide GLP-1"
metaDescription: "Découvrez notre guide complet sur [médicament] : mécanisme d'action, efficacité, effets secondaires et conseils d'utilisation."
---

# Nom du Médicament : Guide Complet

## Introduction
[Médicament] est un agoniste des récepteurs GLP-1...

## Qu'est-ce que [Médicament] ?
### Mécanisme d'action
### Indications thérapeutiques

## Efficacité et Résultats
### Études cliniques
### Perte de poids moyenne
### Contrôle glycémique

## Posologie et Administration
### Dosage recommandé
### Mode d'administration
### Progression du traitement

## Effets Secondaires
### Effets fréquents
### Effets rares
### Contre-indications

## Comparaison avec d'autres GLP-1
[Tableau comparatif]

## Témoignages Patients
[Liens vers témoignages]

## Conclusion
```

### Template Article Recherche
```markdown
---
title: "Nouvelle Étude : [Sujet de l'étude]"
description: "Analyse détaillée de l'étude [nom] sur les GLP-1 : résultats, implications et perspectives"
author: "Dr. Pierre Dubois"
category: "Étude scientifique"
publishDate: 2024-12-19
tags: ["recherche", "glp1", "étude"]
featured: true
draft: false
seoTitle: "Étude [nom] sur les GLP-1 : Résultats et Analyse"
metaDescription: "Découvrez l'analyse complète de l'étude [nom] sur les GLP-1 : méthodologie, résultats et implications cliniques."
---

# Nouvelle Étude : [Sujet]

## Résumé Exécutif
### Points clés
### Implications pratiques

## Méthodologie de l'Étude
### Participants
### Protocole
### Durée

## Résultats Principaux
### Efficacité mesurée
### Données statistiques
### Graphiques et tableaux

## Analyse et Interprétation
### Signification clinique
### Limitations de l'étude
### Biais potentiels

## Comparaison Littérature Existante
### Études similaires
### Cohérence des résultats

## Implications Pratiques
### Pour les patients
### Pour les médecins
### Recommandations

## Conclusion et Perspectives
```

---

## 📊 Checklist Pré-Publication

### ✅ Validation Technique
- [ ] Frontmatter complet et valide
- [ ] Build Astro sans erreur
- [ ] TinaCMS save fonctionnel
- [ ] Prévisualisation correcte

### ✅ Qualité Contenu
- [ ] Titre accrocheur et SEO
- [ ] Introduction claire
- [ ] Structure logique (H2, H3)
- [ ] Longueur suffisante (1500+ mots)
- [ ] Liens internes pertinents
- [ ] Sources et références

### ✅ SEO et Accessibilité
- [ ] Meta description optimisée
- [ ] Tags pertinents (3-5 max)
- [ ] Alt text pour les images
- [ ] URLs propres et lisibles
- [ ] Mots-clés naturellement intégrés

### ✅ Validation Médicale
- [ ] Informations médicalement exactes
- [ ] Sources scientifiques citées
- [ ] Avertissements appropriés
- [ ] Ton professionnel et accessible

---

## 🔗 Ressources et Outils

### Documentation Technique
- [Schema TinaCMS](../core/SCHEMA_VALIDATION.md)
- [Configuration Astro](../core/CONFIGURATION_SYSTEME.md)
- [Troubleshooting](../operations/TROUBLESHOOTING.md)

### Outils SEO
- **Yoast SEO** (WordPress) pour analyse
- **Google Search Console** pour performance
- **Semrush** pour recherche mots-clés

### Validation Médicale
- **PubMed** pour sources scientifiques
- **HAS** (Haute Autorité de Santé) pour recommandations
- **EMA** (European Medicines Agency) pour données médicaments

---

*Guide maintenu à jour - Dernière révision : 19 décembre 2024*
