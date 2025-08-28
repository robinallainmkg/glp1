# 🎨 Génération d'Images Automatisée avec Grok

> **Système intelligent de génération d'images** pour les articles GLP-1  
> *Analyse automatique du contenu • Prompts adaptés • Images médicales réalistes*

---

## 🎯 Vue d'ensemble

Le système de génération d'images utilise **Grok (xAI)** pour créer automatiquement des images adaptées au contenu de chaque article. Le script analyse le contenu des articles Markdown et génère des prompts personnalisés pour créer des scènes médicales réalistes avec docteurs et patients.

### ✨ Fonctionnalités principales

- **Analyse automatique** du contenu des articles
- **Prompts intelligents** adaptés par type d'article
- **Images médicales réalistes** avec scènes authentiques
- **Gestion des erreurs** et reprise automatique
- **Format optimisé** pour le web (57-90KB)

---

## 🚀 Utilisation

### Prérequis

```bash
# Installation des dépendances
brew install jq  # Pour le parsing JSON

# Configuration de l'API Grok
export GROK_API_KEY="votre-cle-api-ici"
```

### Lancement de la génération

```bash
# Rendre le script exécutable
chmod +x generate-all-images.sh

# Lancer la génération
./generate-all-images.sh
```

---

## 🧠 Logique d'analyse des articles

Le script analyse automatiquement chaque article et crée des prompts adaptés selon le type de contenu :

### 📋 Types d'articles reconnus

| Type d'article | Prompt généré | Exemple visuel |
|---------------|---------------|----------------|
| **Prix/Coûts** | Scènes de consultation tarifaire | Médecin expliquant les prix à un patient |
| **Effets secondaires** | Consultations médicales | Médecin expliquant les effets à un patient |
| **Guides de traitement** | Consultations éducatives | Médecin présentant un traitement complet |
| **Médecins/Cliniques** | Portraits professionnels | Médecins en blouse blanche dans leur cabinet |
| **Régimes/Nutrition** | Consultations diététiques | Diététicienne expliquant un plan alimentaire |
| **Alternatives naturelles** | Consultations naturopathiques | Naturopathe présentant des compléments naturels |

### 🎨 Exemples de prompts générés

#### Pour un article de prix :
```
Scène réaliste en format paysage montrant un patient et son médecin discutant des coûts du traitement Ozempic en France. Au centre, un médecin d'âge mûr en blouse blanche explique les tarifs à un patient attentif assis à un bureau médical...
```

#### Pour un article d'effets secondaires :
```
Consultation médicale réaliste en format paysage montrant un médecin expliquant les effets secondaires du Wegovy à son patient. Au centre, un médecin expérimenté en blouse blanche, stéthoscope autour du cou, montre une brochure d'information patient...
```

---

## 📁 Structure des fichiers générés

```
public/images/thumbnails/
├── acheter-wegovy-en-france-illus.jpg
├── anneau-gastrique-prix-cmu-illus.jpg
├── chirurgie-bariatrique-illus.jpg
├── clinique-pour-obesite-illus.jpg
├── diabetologue-paris-illus.jpg
├── effets-secondaires-ozempic-illus.jpg
├── endocrinologue-pour-maigrir-illus.jpg
├── glp1-calories-journalieres-illus.jpg
├── guide-complet-ozempic-illus.jpg
├── homepage-illus.jpg
├── medicament-pour-maigrir-tres-puissant-illus.jpg
├── ozempic-danger-illus.jpg
├── ozempic-prix-illus.jpg
├── ozempic-regime-illus.jpg
├── partenaires-illus.jpg
├── personne-obese-illus.jpg
├── pilule-qui-fait-maigrir-illus.jpg
├── quel-traitement-glp1-choisir-illus.jpg
├── regime-cetogene-glp1-illus.jpg
├── recherche-clinique-glp1-illus.jpg
└── ... (62 images au total)
```

---

## ⚙️ Configuration technique

### Variables d'environnement

```bash
# Fichier .env.local
GROK_API_KEY=votre-cle-api-grok
```

### Paramètres du script

```bash
# Chemins configurables
OUTPUT_DIR="/Users/mac/Projet/glp1/public/images/thumbnails"
CONTENT_DIR="/Users/mac/Projet/glp1/src/content"
API_KEY="${GROK_API_KEY:-your-api-key-here}"
```

### Modèle IA utilisé

- **Modèle** : `grok-2-image-1212`
- **Format** : Paysage (16:9)
- **Style** : Photographique documentaire médical
- **Qualité** : Haute résolution, détails réalistes

---

## 🔧 Personnalisation des prompts

### Structure des fonctions de génération

```bash
# Fonction principale d'analyse
analyze_article_content() {
    local ARTICLE_PATH="$1"
    local ARTICLE_NAME="$2"
    
    # Extraction des métadonnées
    TITLE=$(grep -m 1 "^title:" "$ARTICLE_PATH" | sed 's/title: //')
    DESCRIPTION=$(grep -m 1 "^description:" "$ARTICLE_PATH" | sed 's/description: //')
    
    # Analyse du contenu
    CONTENT_SAMPLE=$(grep -A 10 "^---" "$ARTICLE_PATH" | tail -n +11 | head -n 20)
    
    # Routage vers la fonction appropriée
    case "$ARTICLE_NAME" in
        *prix*|*cout*) create_price_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE" ;;
        *effets*) create_side_effects_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE" ;;
        *guide*|*traitement*) create_guide_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE" ;;
        # ... autres cas
    esac
}
```

### Ajout de nouveaux types d'articles

Pour ajouter un nouveau type d'article :

1. **Créer une fonction de prompt** :
```bash
create_new_type_prompt() {
    local TITLE="$1"
    local DESCRIPTION="$2" 
    local CONTENT="$3"
    
    echo "Votre prompt personnalisé ici..."
}
```

2. **Ajouter le cas dans la logique de routage** :
```bash
*nouveau-type*) create_new_type_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE" ;;
```

---

## 📊 Statistiques de génération

### Session du 28 août 2025

- **Articles analysés** : 62 articles sans images
- **Images générées** : 62 images réussies
- **Taille moyenne** : 57-90KB par image
- **Temps de génération** : ~15 minutes
- **Taux de succès** : 100%

### Types d'images générées

| Catégorie | Nombre | Exemples |
|-----------|--------|----------|
| **Prix/Coûts** | 5 | Prix Ozempic, Wegovy, Saxenda |
| **Effets secondaires** | 9 | Danger Ozempic, Dosage Wegovy |
| **Guides de traitement** | 6 | Guides complets Ozempic, Wegovy, Saxenda |
| **Médecins/Cliniques** | 5 | Cliniques, Diabetologues, Endocrinologues |
| **Régimes/Nutrition** | 12 | Régimes cétogène, méditerranéen, DASH |
| **Perte de poids** | 15 | Médicaments, dosages, effets |
| **Alternatives** | 7 | Naturelles, phytothérapie |
| **Recherche** | 2 | Inhibiteurs GLP-1, clinique |
| **Pages générales** | 1 | Homepage, Partenaires |

---

## 🎨 Qualité des images générées

### Caractéristiques techniques

- **Format** : JPEG optimisé
- **Résolution** : Adaptée au web
- **Taille** : 57-90KB (chargement rapide)
- **Ratio** : 16:9 paysage
- **Style** : Photographique documentaire

### Contenu médical authentique

- **Environnements** : Cabinets médicaux, salles d'examen
- **Personnages** : Médecins en blouse blanche, patients
- **Accessoires** : Stéthoscopes, dossiers médicaux, médicaments
- **Ambiance** : Professionnelle, rassurante, éducative

---

## 🚨 Dépannage

### Erreurs communes

#### 1. Clé API manquante
```bash
❌ Veuillez configurer votre GROK_API_KEY
export GROK_API_KEY='votre-cle-api'
```

#### 2. jq non installé
```bash
brew install jq
```

#### 3. Permissions insuffisantes
```bash
chmod +x generate-all-images.sh
```

#### 4. Crédits API épuisés
- Vérifier les crédits Grok disponibles
- Attendre la recharge ou upgrade du plan

### Logs de débogage

Le script fournit des informations détaillées :
```bash
🎨 Génération d'image pour: guide-complet-ozempic
Prompt créé: Scène éducative réaliste en format paysage...
✅ Généré: guide-complet-ozempic-illus.jpg
```

---

## 🔄 Maintenance et évolution

### Mise à jour des prompts

Pour améliorer la qualité des images :
1. **Tester de nouveaux prompts** sur quelques articles
2. **Analyser les résultats** et ajuster les formulations
3. **Mettre à jour les fonctions** de génération

### Optimisation des performances

- **Cache des prompts** pour éviter les recalculs
- **Génération parallèle** pour plusieurs articles
- **Compression optimisée** des images finales

### Nouvelles fonctionnalités

- **Variations d'images** pour A/B testing
- **Génération conditionnelle** selon les métadonnées
- **Intégration multi-modèles** (différents IA)

---

## 📈 Impact SEO

### Avantages pour le référencement

- **Images optimisées** : Chargement rapide, format adapté
- **Contenu cohérent** : Images adaptées au texte
- **Engagement utilisateur** : Visuels professionnels et médicaux
- **Crawling amélioré** : Sitemap mis à jour avec toutes les images

### Métriques d'amélioration

- **Temps de chargement** : Images optimisées (57-90KB)
- **Core Web Vitals** : Amélioration du LCP et CLS
- **Taux de conversion** : Visuels médicaux rassurants
- **Positionnement** : Contenu visuel de qualité

---

## 🎯 Recommandations

### Pour les développeurs

1. **Sauvegarder les prompts** qui fonctionnent bien
2. **Documenter les améliorations** apportées
3. **Monitorer la consommation** d'API
4. **Tester régulièrement** la génération

### Pour le contenu

1. **Rédiger des titres** descriptifs pour de meilleurs prompts
2. **Ajouter des métadonnées** riches dans les articles
3. **Vérifier la cohérence** image-texte
4. **Optimiser les descriptions** pour le SEO

---

*Documentation créée le 28 août 2025 • Système de génération d'images Grok v1.0*
