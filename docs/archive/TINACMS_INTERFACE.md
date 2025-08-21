# 📝 Interface TinaCMS - Guide d'utilisation

## 🎯 Vue d'ensemble
Guide complet d'utilisation de l'interface TinaCMS pour éditer le contenu du site GLP-1 France en toute sécurité et efficacité.

---

## 🚀 Accès à l'Interface

### URL d'accès
```
https://glp1-france.fr/admin/index.html
```

### Première connexion
1. **Accéder à l'URL admin**
2. **Authentification automatique** (si configurée)
3. **Interface principale** avec navigation collections

---

## 🏗️ Structure de l'Interface

### Navigation Principale
- **Collections** : Gestion des articles par catégorie
- **Media** : Gestion des images et fichiers
- **Config** : Configuration du site (accès limité)

### Collections Disponibles
| Collection | Description | Nombre d'articles |
|------------|-------------|-------------------|
| **Médicaments GLP-1** | Articles sur les médicaments | ~15 articles |
| **Recherche GLP-1** | Études scientifiques | ~8 articles |
| **Témoignages GLP-1** | Expériences patients | ~12 articles |
| **Guides Pratiques** | Guides d'utilisation | ~10 articles |
| **Actualités** | News médicales | ~5 articles |

---

## ✏️ Édition d'Articles

### Ouvrir un Article Existant
1. **Cliquer sur "Collections"** dans le menu
2. **Sélectionner la collection** appropriée
3. **Choisir l'article** dans la liste
4. **Interface d'édition** s'ouvre automatiquement

### Interface d'Édition
```
┌─────────────────────────────────────┐
│ [Save] [Preview] [Cancel]          │
├─────────────────────────────────────┤
│ FRONTMATTER FIELDS                  │
│ ┌─ Titre (obligatoire)             │
│ │ [_________________________]      │
│ ├─ Description                     │
│ │ [_________________________]      │
│ ├─ Auteur (liste déroulante)       │
│ │ [Dr. Sarah Martin ▼]             │
│ ├─ Catégorie (liste déroulante)    │
│ │ [Guide médical ▼]                │
│ ├─ Date de publication             │
│ │ [19/12/2024]                     │
│ └─ Tags                            │
│   [glp1] [ozempic] [+Add]          │
├─────────────────────────────────────┤
│ CONTENU MARKDOWN                    │
│ ┌─────────────────────────────────┐ │
│ │ # Titre Principal               │ │
│ │                                 │ │
│ │ ## Introduction                 │ │
│ │ Votre contenu ici...            │ │
│ │                                 │ │
│ │ [Mode Rich Text/Markdown ↔]    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 📋 Champs du Frontmatter

### Champs Obligatoires
#### 1. Titre
- **Type** : Texte libre
- **Validation** : Ne peut pas être vide
- **Exemple** : `"Ozempic : Guide Complet 2024"`
- **Impact SEO** : Titre principal de la page

#### 2. Description
- **Type** : Texte libre (multiline)
- **Longueur** : 120-160 caractères recommandés
- **Exemple** : `"Guide complet sur Ozempic : efficacité, effets secondaires, posologie et conseils d'utilisation pour le traitement du diabète."`
- **Impact SEO** : Meta description

#### 3. Auteur
- **Type** : Liste déroulante
- **Options disponibles** :
  - `Dr. Sarah Martin` (Endocrinologue)
  - `Dr. Pierre Dubois` (Diabétologue)
  - `Dr. Marie Rousseau` (Nutritionniste)
  - `Équipe GLP-1 France` (Contenu éditorial)

#### 4. Catégorie
- **Type** : Liste déroulante
- **Options disponibles** :
  - `Guide médical` - Articles informatifs médicaux
  - `Étude scientifique` - Recherches et études
  - `Témoignage patient` - Expériences vécues
  - `Guide pratique` - Instructions d'utilisation
  - `Actualité médicale` - News et nouveautés

#### 5. Date de Publication
- **Type** : Sélecteur de date
- **Format** : YYYY-MM-DD
- **Défaut** : Date du jour
- **Impact** : Classement chronologique

### Champs Optionnels

#### Tags
- **Type** : Liste de mots-clés
- **Recommandation** : 3-5 tags maximum
- **Exemples** : `glp1`, `ozempic`, `diabete`, `perte-de-poids`
- **Ajout** : Cliquer sur "+Add" après chaque tag

#### Article Mis en Avant
- **Type** : Bouton toggle (featured)
- **Usage** : Met l'article en vedette sur la page d'accueil
- **Limitation** : Maximum 3 articles en vedette

#### Brouillon
- **Type** : Bouton toggle (draft)
- **Usage** : Article non publié (invisible sur le site)
- **Défaut** : false (publié)

---

## ✍️ Édition du Contenu

### Mode d'Édition
TinaCMS propose deux modes :
1. **Mode Markdown** (recommandé) - Édition en syntaxe Markdown
2. **Mode Rich Text** - Éditeur visuel WYSIWYG

### Syntaxe Markdown Essentielle
```markdown
# Titre Principal (H1) - Un seul par article
## Titre de Section (H2) - Structure principale
### Sous-titre (H3) - Détails

**Texte en gras** - Pour emphase
*Texte en italique* - Pour nuance

[Lien vers article](../autre-article/)
[Lien externe](https://example.com)

- Liste à puces
- Élément 2
- Élément 3

1. Liste numérotée
2. Élément 2
3. Élément 3

> Citation ou information importante

```javascript
// Bloc de code si nécessaire
const example = "Rarement utilisé dans articles médicaux";
```
```

### Structure Recommandée
```markdown
# Titre Principal

## Introduction
Paragraphe d'accroche avec les mots-clés principaux.

## Qu'est-ce que [Sujet] ?
### Définition
### Mécanisme d'action

## Efficacité et Résultats
### Études cliniques
### Données chiffrées

## Mode d'emploi
### Posologie
### Administration

## Effets Secondaires
### Effets fréquents
### Effets rares
### Contre-indications

## Comparaison
[Tableau ou liste comparative si pertinent]

## Témoignages
[Liens vers témoignages patients]

## Conclusion
Synthèse et recommandations.
```

---

## 💾 Sauvegarde et Publication

### Processus de Sauvegarde
1. **Remplir tous les champs obligatoires**
   - Vérifier que le titre n'est pas vide
   - Sélectionner un auteur valide
   - Choisir une catégorie appropriée

2. **Cliquer sur "Save"**
   - Bouton devient vert si validation réussie
   - Message de confirmation apparaît
   - Fichier mis à jour automatiquement

3. **Validation automatique**
   - TinaCMS vérifie la conformité du schéma
   - Astro valide la structure au build
   - Erreurs affichées en cas de problème

### Indicateurs de Statut
- **✅ Bouton Save vert** : Prêt à sauvegarder
- **❌ Bouton Save grisé** : Validation échouée
- **⏳ Bouton Save orange** : Sauvegarde en cours
- **🔄 Icône reload** : Modification détectée

---

## 🖼️ Gestion des Médias

### Ajouter une Image
1. **Dans l'éditeur de contenu**
2. **Syntaxe Markdown** :
   ```markdown
   ![Texte alternatif](../images/nom-image.jpg)
   ```
3. **Via interface TinaCMS** :
   - Bouton "Insert Image"
   - Upload ou sélection fichier existant

### Bonnes Pratiques Images
- **Format** : JPG pour photos, PNG pour graphiques
- **Taille** : Maximum 500KB par image
- **Dimensions** : 800x600px recommandé
- **Alt text** : Toujours remplir pour SEO et accessibilité
- **Nommage** : `nom-descriptif-sans-espaces.jpg`

---

## 🔍 Prévisualisation

### Prévisualiser Pendant l'Édition
1. **Bouton "Preview"** dans la barre d'outils
2. **Nouvel onglet** avec aperçu en temps réel
3. **URL de preview** : `http://localhost:4321/...`

### Vérifications Avant Publication
- [ ] **Affichage correct** du titre et méta-données
- [ ] **Structure lisible** avec titres hiérarchisés
- [ ] **Liens fonctionnels** (internes et externes)
- [ ] **Images affichées** avec alt text
- [ ] **Responsive design** sur mobile

---

## ⚠️ Erreurs Courantes et Solutions

### Bouton Save Grisé
**Cause** : Validation échouée
**Solution** :
1. Vérifier tous les champs obligatoires
2. Contrôler la syntaxe Markdown
3. Recharger la page si nécessaire

### Contenu Non Sauvegardé
**Cause** : Erreur de réseau ou validation
**Solution** :
1. Copier le contenu en backup
2. Recharger l'interface TinaCMS
3. Coller le contenu et re-sauvegarder

### Images Non Affichées
**Cause** : Chemin incorrect ou fichier manquant
**Solution** :
1. Vérifier l'orthographe du nom fichier
2. Contrôler que l'image existe dans `/public/images/`
3. Utiliser le bon format : `../images/nom.jpg`

### Article Non Visible Sur le Site
**Cause** : Article en mode brouillon
**Solution** :
1. Décocher "Draft" dans les options
2. Sauvegarder l'article
3. Attendre la régénération du site

---

## 🎯 Workflow Recommandé

### Pour un Nouvel Article
1. **Planification**
   - Définir le sujet et l'angle
   - Identifier la collection cible
   - Rechercher mots-clés SEO

2. **Création dans TinaCMS**
   - Accéder à la collection appropriée
   - Cliquer "Create New"
   - Remplir le frontmatter complet

3. **Rédaction**
   - Utiliser la structure recommandée
   - Intégrer mots-clés naturellement
   - Ajouter liens internes pertinents

4. **Relecture et Validation**
   - Prévisualiser l'article
   - Vérifier orthographe et grammaire
   - Contrôler la validité médicale

5. **Publication**
   - Retirer le mode brouillon
   - Sauvegarder définitivement
   - Vérifier affichage sur le site

### Pour Modifier un Article Existant
1. **Backup du contenu** (copier-coller sécurité)
2. **Modifications ciblées** (éviter les changements majeurs)
3. **Test de la modification** via Preview
4. **Sauvegarde et vérification**

---

## 📊 Bonnes Pratiques SEO

### Optimisation Titres
- **H1 unique** par article (titre principal)
- **H2 pour sections** principales
- **H3 pour sous-sections** détaillées
- **Mots-clés naturels** dans les titres

### Meta-données
- **Title** : 50-60 caractères avec mot-clé principal
- **Description** : 150-160 caractères, accrocheur
- **Tags** : 3-5 mots-clés pertinents maximum

### Contenu
- **Longueur** : 1500+ mots pour articles médicaux
- **Densité mots-clés** : 1-2% naturelle
- **Liens internes** : 3-5 vers autres articles
- **Sources** : Citations d'études scientifiques

---

## 🔗 Raccourcis et Astuces

### Raccourcis Clavier
- **Ctrl+S** : Sauvegarde rapide
- **Ctrl+Z** : Annuler dernière action
- **Ctrl+Y** : Refaire action annulée
- **Tab** : Navigation entre champs

### Templates Rapides
```markdown
<!-- Template section standard -->
## [Titre Section]
### Points clés
- Point 1
- Point 2
- Point 3

### Détails
Explication détaillée avec [lien interne](../article-connexe/).

<!-- Template liste avantages/inconvénients -->
### ✅ Avantages
- Avantage 1
- Avantage 2

### ❌ Inconvénients  
- Inconvénient 1
- Inconvénient 2
```

### Liens Internes Utiles
```markdown
<!-- Vers autres médicaments -->
[Ozempic](../ozempic-guide-complet/)
[Trulicity](../trulicity-mode-emploi/)

<!-- Vers guides -->
[Guide diagnostic](../../guides/quel-traitement-choisir/)
[Effets secondaires](../../guides/effets-secondaires-glp1/)

<!-- Vers témoignages -->
[Témoignages patients](../../temoignages/)
```

---

## 📞 Support et Assistance

### En Cas de Problème
1. **Consulter** [Guide de Dépannage](../operations/TROUBLESHOOTING.md)
2. **Vérifier** la connexion internet
3. **Recharger** l'interface TinaCMS
4. **Contacter** l'équipe technique si persistant

### Ressources Utiles
- **Documentation TinaCMS** : https://tina.io/docs/
- **Markdown Guide** : https://www.markdownguide.org/
- **Validation SEO** : Tools intégrés au CMS

---

*Guide d'interface maintenu à jour - Dernière révision : 19 décembre 2024*
