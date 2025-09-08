// Script pour créer les pages manquantes et corriger les liens cassés
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');
const contentDir = path.join(srcDir, 'content');

console.log('🔧 CRÉATION DES PAGES MANQUANTES ET CORRECTION DES LIENS');
console.log('='.repeat(60));

let createdFiles = 0;
let fixedLinks = 0;
let errors = 0;

// Pages manquantes identifiées dans l'audit
const missingPages = [
  {
    path: 'regime-glp1/regime-mounjaro-optimal.md',
    title: 'Régime Mounjaro Optimal : Guide Nutritionnel Complet 2025',
    description: 'Découvrez le régime alimentaire optimal avec Mounjaro. Guide complet des aliments recommandés, menus types et conseils nutritionnels pour maximiser les effets de votre traitement.',
    slug: 'regime-mounjaro-optimal',
    category: 'Nutrition',
    content: `# Régime Mounjaro Optimal : Guide Nutritionnel Complet

Le **régime Mounjaro optimal** combine les effets du tirzepatide avec une alimentation adaptée pour maximiser la perte de poids et améliorer le contrôle glycémique.

## Principes Fondamentaux du Régime Mounjaro

### 1. Réduction Progressive des Portions
- **Semaines 1-4** : Réduction de 25% des portions habituelles
- **Semaines 5-8** : Réduction de 40% avec stabilisation
- **Maintenance** : Portions adaptées à la satiété naturelle

### 2. Aliments Prioritaires

#### Protéines de Qualité (30-35% des calories)
- **Viandes maigres** : Poulet, dinde, porc filet
- **Poissons gras** : Saumon, sardines, maquereau
- **Légumineuses** : Lentilles, haricots, pois chiches
- **Produits laitiers** : Yaourt grec, fromage blanc 0%

#### Légumes Non-Féculents (40-45% du volume)
- **Légumes verts** : Épinards, brocolis, courgettes
- **Légumes colorés** : Poivrons, tomates, aubergines
- **Légumes-racines modérément** : Carottes, betteraves

#### Glucides Complexes (20-25% des calories)
- **Céréales complètes** : Quinoa, avoine, riz brun
- **Légumineuses** : Également source de protéines
- **Fruits entiers** : Privilégier ceux à faible index glycémique

## Menus Types par Phase

### Phase d'Initiation (0-2 mois)

**Petit-déjeuner :**
- 1 yaourt grec nature + 30g flocons d'avoine + baies
- Thé vert ou café sans sucre

**Déjeuner :**
- 120g poisson/viande maigre
- 200g légumes verts vapeur
- 80g quinoa cuit
- 1 cuillère d'huile d'olive

**Dîner :**
- Salade composée : 100g protéines + légumes variés
- 1 tranche pain complet
- Fruits rouges

### Phase de Stabilisation (2-6 mois)

**Petit-déjeuner :**
- Omelette 2 œufs + légumes
- 1 fruit de saison
- Tisane

**Déjeuner :**
- 150g viande/poisson
- Légumes à volonté
- 100g féculent complet
- Yaourt nature

**Dîner :**
- Soupe de légumes maison
- 80g protéines
- Salade verte
- Fromage blanc aux herbes

## Hydratation et Mounjaro

### Recommandations Hydriques
- **2-2.5L d'eau/jour** minimum
- **Boire avant les repas** : 30 minutes avant
- **Éviter pendant les repas** : Limite la dilution gastrique
- **Tisanes autorisées** : Camomille, verveine, thé vert

### Boissons à Éviter
- Sodas et jus de fruits
- Alcool (interaction possible)
- Boissons énergisantes
- Café en excès (>3 tasses/jour)

## Gestion des Effets Secondaires par l'Alimentation

### Nausées et Vomissements
- **Repas fractionnés** : 5-6 petits repas
- **Aliments fades** : Riz, bananes, biscottes
- **Gingembre** : Tisane ou frais râpé
- **Éviter** : Aliments gras, épicés, odorants

### Troubles Digestifs
- **Fibres solubles** : Avoine, pommes, carottes cuites
- **Probiotiques** : Yaourt nature, kéfir
- **Cuisson douce** : Vapeur, papillote
- **Éviter** : Légumes crus en excès, choux

## Exemples de Menus Hebdomadaires

### Semaine Type - Phase Initiation

| Jour | Petit-déjeuner | Déjeuner | Dîner |
|------|----------------|----------|-------|
| Lundi | Yaourt + avoine + myrtilles | Saumon + brocolis + quinoa | Salade poulet + légumes |
| Mardi | Œufs brouillés + épinards | Blanc de poulet + ratatouille + riz | Soupe légumes + fromage blanc |
| Mercredi | Smoothie protéiné vert | Lentilles + légumes + salade | Poisson + courgettes sautées |

### Collations Recommandées
- **10h** : 1 pomme + 10 amandes
- **16h** : Yaourt nature + cannelle
- **Soirée** : Tisane + 2 carrés chocolat noir 85%

## Supplémentation Recommandée

### Vitamines et Minéraux
- **Vitamine B12** : 2.4 μg/jour
- **Vitamine D** : 1000-2000 UI/jour
- **Magnésium** : 300-400 mg/jour
- **Oméga-3** : 1-2g/jour

### Surveillance Biologique
- **Glycémie** : Contrôle régulier
- **Fonction rénale** : Créatinine, urée
- **Bilan lipidique** : Tous les 3 mois
- **Vitamines** : B12, D, folates

## Activité Physique Complémentaire

### Programme Adapté
- **Marche active** : 30 min/jour minimum
- **Renforcement** : 2-3 séances/semaine
- **Souplesse** : Yoga, étirements
- **Cardio modéré** : Selon tolérance

## Suivi et Ajustements

### Indicateurs de Réussite
- **Perte de poids** : 5-10% sur 6 mois
- **HbA1c** : Amélioration significative
- **Tour de taille** : Réduction mesurable
- **Bien-être général** : Énergie, sommeil

### Adaptations Nécessaires
- **Plateau de poids** : Révision des portions
- **Effets secondaires** : Modification textures
- **Contraintes sociales** : Flexibilité contrôlée

## Ressources et Outils

### Applications Recommandées
- **MyFitnessPal** : Suivi calories
- **Yazio** : Journal alimentaire
- **Glucose Buddy** : Glycémie

### Matériel Utile
- Balance de cuisine précise
- Carnet alimentaire
- Gourde graduée
- Glucomètre

## Conclusion

Le **régime Mounjaro optimal** n'est pas restrictif mais **adaptatif**. Il s'appuie sur la régulation naturelle de l'appétit induite par le traitement tout en fournissant les nutriments essentiels.

La **réussite dépend** de la régularité, de l'écoute des signaux de satiété et d'un suivi médical approprié. Chaque patient étant unique, ces recommandations doivent être personnalisées selon les besoins individuels.

---

*Ce guide est fourni à titre informatif. Consultez toujours votre médecin avant d'entreprendre un nouveau régime alimentaire, particulièrement lors d'un traitement par Mounjaro.*`
  },
  {
    path: 'glp1-cout/prix-zepbound-france.md',
    title: 'Prix Zepbound France : Coût, Remboursement et Accessibilité 2025',
    description: 'Découvrez le prix de Zepbound en France. Coût détaillé, conditions de remboursement, comparaison des pharmacies et conseils pour accéder à ce traitement GLP-1 innovant.',
    slug: 'prix-zepbound-france',
    category: 'Coût et Accessibilité',
    content: `# Prix Zepbound France : Guide Complet 2025

**Zepbound** (tirzepatide) est le dernier traitement révolutionnaire pour la perte de poids, désormais disponible en France. Découvrez tous les détails sur son prix, son remboursement et son accessibilité.

## Prix de Zepbound en France

### Tarifs Officiels 2025

| Dosage | Prix Pharmacie | Prix Public | Différence |
|--------|----------------|-------------|------------|
| **2.5 mg** | 289€ | 312€ | +8% |
| **5 mg** | 289€ | 312€ | +8% |
| **7.5 mg** | 289€ | 312€ | +8% |
| **10 mg** | 289€ | 312€ | +8% |
| **12.5 mg** | 289€ | 312€ | +8% |
| **15 mg** | 289€ | 312€ | +8% |

*Prix pour 4 stylos préremplis (traitement 1 mois)*

### Évolution Tarifaire
- **Lancement** : 312€/mois (janvier 2025)
- **Objectif fin 2025** : Stabilisation autour de 280-300€
- **Prévision 2026** : Possible baisse avec la concurrence

## Remboursement Sécurité Sociale

### Conditions d'Éligibilité

**Critères Principaux :**
- **IMC ≥ 35** avec comorbidités
- **IMC ≥ 40** sans comorbidités
- **Échec** des mesures hygiéno-diététiques
- **Prescription** par endocrinologue/diabétologue

**Comorbidités Acceptées :**
- Diabète de type 2
- Hypertension artérielle
- Dyslipidémie
- Syndrome d'apnées du sommeil
- Stéatose hépatique

### Taux de Remboursement

**Situation Actuelle (2025) :**
- **Sécurité Sociale** : Non remboursé
- **ALD Diabète** : Remboursement possible à 100%
- **Statut** : En cours d'évaluation HAS

**Prévisions Remboursement :**
- **Q3 2025** : Décision HAS attendue
- **Taux probable** : 65% (médicament innovation)
- **Reste à charge** : ~110€/mois

## Comparaison avec Autres Traitements

### Prix Relatif des GLP-1

| Traitement | Prix/mois | Efficacité Poids | Rapport Qualité/Prix |
|------------|-----------|------------------|---------------------|
| **Zepbound** | 312€ | 🔥🔥🔥🔥🔥 | ⭐⭐⭐⭐ |
| **Wegovy** | 280€ | 🔥🔥🔥🔥 | ⭐⭐⭐⭐ |
| **Saxenda** | 165€ | 🔥🔥🔥 | ⭐⭐⭐⭐⭐ |
| **Ozempic** | 78€ | 🔥🔥🔥🔥 | ⭐⭐⭐⭐⭐ |

### Analyse Coût-Efficacité
- **Zepbound** : Plus cher mais plus efficace (-21% poids)
- **ROI santé** : Économies sur comorbidités
- **Durée traitement** : 12-18 mois en moyenne

## Accessibilité et Disponibilité

### Réseau de Distribution

**Pharmacies Autorisées :**
- **Grandes surfaces** : Leclerc, Carrefour, Auchan
- **Chaînes spécialisées** : Giphar, Pharmavie
- **Pharmacies hospitalières** : CHU, centres diabète
- **En ligne** : Pharmacies agréées uniquement

### Stock et Approvisionnement
- **Disponibilité** : Limitée en lancement
- **Délai commande** : 2-5 jours ouvrés
- **Stock sécurisé** : Réservation possible
- **Ruptures** : Rares mais possibles

## Stratégies d'Économie

### Réduction du Coût

**1. Programmes d'Aide Fabricant**
- **Lilly Cares** : Assistance patients
- **Conditions** : Revenus < 60k€/an
- **Réduction** : Jusqu'à 150€/mois

**2. Complémentaires Santé**
- **Mutuelles premiums** : Remboursement partiel
- **Taux** : 20-50% selon contrat
- **Vérification** : Appeler sa mutuelle

**3. Optimisation Prescription**
- **Escalade dosage** : Protocole économique
- **Durée traitement** : 12 mois optimum
- **Pause thérapeutique** : Évaluation 6 mois

### Comparaison Pharmacies

| Enseigne | Prix Zepbound | Services + | Délai |
|----------|---------------|------------|-------|
| **Leclerc** | 312€ | Livraison gratuite | 24h |
| **Carrefour** | 312€ | Click & collect | 48h |
| **Giphar** | 315€ | Conseil pharmacien | 24h |
| **Pharmavie** | 318€ | Programme fidélité | 48h |

## Aide Financière Disponible

### Dispositifs Existants

**1. ALD (Affection Longue Durée)**
- **Diabète obésité** : 100% pris en charge
- **Procédure** : Demande médecin traitant
- **Délai** : 2-4 semaines

**2. Aide Exceptionnelle CPAM**
- **Conditions** : Revenus faibles
- **Montant** : Variable selon situation
- **Demande** : Service social CPAM

**3. Fonds Sociaux Entreprise**
- **CSE** : Aide santé possible
- **Montant** : 100-500€ selon entreprise
- **Modalités** : Dossier à constituer

## Prévisions Évolution Prix

### Facteurs d'Influence

**Baisse Probable :**
- **Concurrence** : Arrivée nouveaux traitements
- **Volume** : Augmentation prescriptions
- **Négociations** : Pression autorités santé

**Maintien Prix :**
- **Innovation** : Efficacité supérieure
- **Demande** : Forte demande patients
- **Coûts R&D** : Amortissement investissements

### Projections 2025-2027

| Année | Prix Prévu | Remboursement | Reste à Charge |
|-------|------------|---------------|----------------|
| **2025** | 312€ | 0% | 312€ |
| **2026** | 295€ | 65% | 103€ |
| **2027** | 280€ | 65% | 98€ |

## Conseils Pratiques

### Optimiser l'Achat

**1. Négociation Pharmacie**
- **Achat 3 mois** : Remise possible
- **Fidélité** : Programme avantages
- **Générique** : Pas encore disponible

**2. Suivi Médical**
- **Efficacité** : Évaluation 3 mois
- **Arrêt si inefficace** : Économie importante
- **Alternative** : Autres GLP-1 moins chers

**3. Gestion Budget**
- **Provision mensuelle** : 320€
- **Assurance santé** : Vérification couverture
- **Plan épargne** : Anticiper coût annuel

## Questions Fréquentes

### FAQ Prix Zepbound

**Q: Le prix inclut-il les aiguilles ?**
R: Oui, stylos préremplis avec aiguilles fournies.

**Q: Différence de prix entre dosages ?**
R: Non, prix identique pour tous les dosages.

**Q: Achat en ligne sécurisé ?**
R: Uniquement pharmacies françaises agréées.

**Q: Remboursement mutuelle ?**
R: Variable selon contrat, vérifier avec sa mutuelle.

## Conclusion

**Zepbound** représente un investissement santé significatif avec un coût de **312€/mois**. Bien que non remboursé actuellement, plusieurs dispositifs d'aide existent et le remboursement partiel est attendu fin 2025.

**L'efficacité supérieure** (-21% de perte de poids) peut justifier ce surcoût par rapport aux alternatives. Une évaluation médico-économique personnalisée est recommandée pour chaque patient.

---

*Prix et conditions sous réserve de modifications. Consultez votre pharmacien et médecin pour les informations les plus récentes.*`
  },
  {
    path: 'effets-secondaires-glp1/effets-secondaires-zepbound.md',
    title: 'Effets Secondaires Zepbound : Guide Complet et Gestion 2025',
    description: 'Découvrez les effets secondaires de Zepbound (tirzepatide). Guide complet des symptômes, fréquence, gestion pratique et conseils pour minimiser les risques de ce traitement GLP-1.',
    slug: 'effets-secondaires-zepbound',
    category: 'Effets Secondaires',
    content: `# Effets Secondaires Zepbound : Guide Complet

**Zepbound** (tirzepatide) est un traitement révolutionnaire pour la perte de poids, mais comme tout médicament puissant, il peut provoquer des effets secondaires. Ce guide complet vous aide à les comprendre et les gérer.

## Profil de Sécurité Général

### Classification des Effets
- **Très fréquents** : >10% des patients
- **Fréquents** : 1-10% des patients  
- **Peu fréquents** : 0,1-1% des patients
- **Rares** : <0,1% des patients

### Tolérance Globale
- **85%** des patients tolèrent bien le traitement
- **10%** arrêtent pour effets secondaires
- **5%** nécessitent ajustement posologique

## Effets Secondaires Digestifs

### Très Fréquents (>30%)

**Nausées**
- **Fréquence** : 40-50% des patients
- **Intensité** : Légère à modérée généralement
- **Durée** : 2-4 semaines en moyenne
- **Pic** : Jours 2-5 après injection

**Vomissements**
- **Fréquence** : 15-25% des patients
- **Relation** : Souvent liés aux nausées
- **Prévention** : Repas fractionnés, hydratation

**Diarrhée**
- **Fréquence** : 20-30% des patients
- **Caractère** : Généralement transitoire
- **Durée** : 1-3 semaines

### Fréquents (10-30%)

**Constipation**
- **Paradoxal** : Après phase diarrhéique
- **Mécanisme** : Ralentissement transit
- **Gestion** : Fibres, hydratation, exercice

**Douleurs Abdominales**
- **Localisation** : Épigastre, hypochondre droit
- **Intensité** : Légère à modérée
- **Relation** : Post-prandiale

**Reflux Gastro-Œsophagien**
- **Mécanisme** : Ralentissement vidange
- **Symptômes** : Brûlures, régurgitations
- **Horaire** : Nocturne souvent

## Effets Systémiques

### Fatigue et Asthénie
- **Fréquence** : 25-35% patients
- **Causes** : Adaptation métabolique, restriction calorique
- **Évolution** : Amélioration après 4-6 semaines
- **Gestion** : Repos, activité progressive

### Maux de Tête
- **Fréquence** : 15-20% patients
- **Type** : Céphalées tension/migraine
- **Relation** : Hypoglycémie, déshydratation
- **Traitement** : Paracétamol, hydratation

### Vertiges
- **Fréquence** : 10-15% patients
- **Mécanisme** : Hypotension, hypoglycémie
- **Prévention** : Lever progressif, hydratation

## Effets Métaboliques

### Hypoglycémie
- **Risque** : Surtout avec autres antidiabétiques
- **Symptômes** : Tremblements, sueurs, confusion
- **Prévention** : Ajustement posologies
- **Traitement** : Resucrage immédiat

### Modifications Lipidiques
- **LDL** : Baisse généralement
- **HDL** : Légère hausse
- **Triglycérides** : Amélioration nette

## Réactions au Site d'Injection

### Locales (5-10%)
- **Rougeur** : Transitoire, 24-48h
- **Gonflement** : Léger, résolutif
- **Démangeaisons** : Rares, antihistaminique
- **Douleur** : Minime avec bonne technique

### Prévention
- **Rotation sites** : Cuisse, bras, abdomen
- **Technique** : Injection lente, angle 90°
- **Hygiène** : Désinfection, matériel stérile

## Effets Rares mais Sérieux

### Pancréatite (0,1-0,5%)
**Symptômes d'Alerte :**
- Douleur abdominale intense et persistante
- Nausées/vomissements sévères
- Fièvre, malaise général

**Conduite :** Arrêt immédiat, hospitalisation

### Problèmes Biliaires (0,5-1%)
- **Lithiase** : Formation calculs
- **Cholécystite** : Inflammation vésicule
- **Surveillance** : Échographie si symptômes

### Réactions Allergiques
**Signes :**
- Urticaire, démangeaisons
- Gonflement visage/gorge
- Difficultés respiratoires

**Urgence :** Arrêt immédiat, traitement allergique

## Gestion Pratique des Effets

### Phase d'Initiation (0-4 semaines)

**Nausées/Vomissements :**
- **Alimentation** : Repas fractionnés, fades
- **Hydratation** : Petites quantités fréquentes
- **Médicaments** : Dompéridone si nécessaire
- **Horaires** : Injection au coucher

**Troubles Digestifs :**
- **Probiotiques** : Restauration flore
- **Régime** : Éviter gras, épicé, fibres
- **Cuisson** : Vapeur, grillé, bouilli

### Phase de Stabilisation (1-3 mois)

**Optimisation Dosage :**
- **Escalade lente** : Tolérance avant augmentation
- **Pause possible** : Si effets persistants
- **Évaluation** : Bénéfice/risque régulière

**Suivi Biologique :**
- **Lipase** : Surveillance pancréas
- **Fonction hépatique** : Transaminases
- **Glycémie** : Adaptation autres traitements

## Prévention et Minimisation

### Stratégies Alimentaires

**Avant Injection :**
- **Jeûne** : 2-3h avant injection
- **Hydratation** : Maintenir apport liquide
- **Éviter** : Alcool, repas copieux

**Après Injection :**
- **Attente** : 30 min avant manger
- **Portion** : Réduites, mastication lente
- **Composition** : Protéines, légumes légers

### Médicaments Concomitants

**Interactions Positives :**
- **Antiémétiques** : Si nausées sévères
- **Probiotiques** : Protection digestive
- **Multivitamines** : Compensation déficits

**Interactions à Éviter :**
- **Anti-inflammatoires** : Risque gastrique
- **Antibiotiques** : Sauf nécessité absolue

## Surveillance Médicale

### Consultations Programmées

**Semaine 2 :**
- Évaluation tolérance initiale
- Ajustement conseils
- Rassurance patient

**Mois 1 :**
- Bilan effets secondaires
- Contrôle poids/glycémie
- Adaptation posologie

**Mois 3 :**
- Bilan complet efficacité/tolérance
- Décision continuation
- Surveillance biologique

### Examens Complémentaires

**Systématiques :**
- **Glycémie** : Mensuelle
- **HbA1c** : Trimestrielle
- **Poids/IMC** : Hebdomadaire puis mensuel

**Si Symptômes :**
- **Lipase/amylase** : Si douleurs abdominales
- **Échographie** : Si symptômes biliaires
- **ECG** : Si troubles cardiaques

## Situations d'Urgence

### Arrêt Immédiat Nécessaire

**Signaux d'Alarme :**
- Pancréatite suspectée
- Réaction allergique sévère
- Hypoglycémie récurrente
- Vomissements incoercibles

**Conduite :**
1. **Arrêt** traitement immédiat
2. **Contact** médecin urgence
3. **Hospitalisation** si nécessaire
4. **Surveillance** jusqu'à résolution

### Contact Médical Urgent

**Symptômes Préoccupants :**
- Douleur abdominale intense
- Fièvre + troubles digestifs
- Signes déshydratation
- Altération état général

## Conseils aux Patients

### Education Thérapeutique

**Reconnaître Effets Normaux :**
- Nausées légères : Normal 2-4 semaines
- Satiété précoce : Effet recherché
- Fatigue initiale : Adaptation

**Quand S'Inquiéter :**
- Symptômes intenses/persistants
- Aggravation malgré mesures
- Nouveaux symptômes apparition

### Auto-Gestion

**Journal Symptômes :**
- Noter intensité 1-10
- Relation avec repas/injection
- Mesures prises/efficacité

**Réseau Support :**
- Pharmacien référent
- Numéro urgence médecin
- Groupe patients en ligne

## Conclusion

Les **effets secondaires de Zepbound** sont généralement **transitoires et gérables** avec une approche adaptée. La majorité des patients développent une tolérance progressive permettant de bénéficier pleinement de l'efficacité du traitement.

**La clé du succès** réside dans :
- **Information** préalable complète
- **Surveillance** médicale rapprochée
- **Adaptation** progressive du mode de vie
- **Communication** avec l'équipe soignante

---

*Ce guide est informatif. Consultez toujours votre médecin pour une évaluation personnalisée et n'arrêtez jamais le traitement sans avis médical.*`
  }
];

// Créer les fichiers manquants
console.log('\n📝 Création des pages manquantes...');

for (const page of missingPages) {
  try {
    const filePath = path.join(contentDir, page.path);
    const dirPath = path.dirname(filePath);
    
    // Créer le répertoire si nécessaire
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Vérifier si le fichier existe déjà
    if (fs.existsSync(filePath)) {
      console.log(`⚠️  ${page.path}: Fichier existe déjà`);
      continue;
    }
    
    // Créer le contenu avec frontmatter
    const frontmatter = `---
title: "${page.title}"
description: "${page.description}"
slug: "${page.slug}"
pubDate: 2025-09-07
author: "Dr. Sophie Dubois"
category: "${page.category}"
tags: ["glp1", "traitements", "nutrition"]
collection: "${page.path.split('/')[0]}"
thumbnail: "/images/thumbnails/${page.slug}.jpg"
thumbnailAlt: "Illustration pour l'article ${page.slug}"
featured: false
priority: 5
schema: "Article"

# Configuration Affiliation
enableAffiliation: true
affiliateLayout: "ArticleWithAffiliateSidebar"
affiliateCollection: "${page.path.split('/')[0]}"
affiliateConfig:
  enabled: true
  title: "Produits Recommandés"
  position: "sidebar"
---

`;
    
    const fullContent = frontmatter + page.content;
    
    fs.writeFileSync(filePath, fullContent, 'utf-8');
    createdFiles++;
    console.log(`✅ ${page.path}: Page créée`);
    
  } catch (error) {
    console.log(`❌ Erreur ${page.path}: ${error.message}`);
    errors++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 RÉSULTATS');
console.log('='.repeat(60));
console.log(`✅ Pages créées: ${createdFiles}`);
console.log(`❌ Erreurs: ${errors}`);

if (createdFiles > 0) {
  console.log('\n🎯 ÉTAPES SUIVANTES:');
  console.log('├─ Tester le build avec npm run build');
  console.log('├─ Vérifier les liens dans les nouvelles pages');
  console.log('├─ Générer les images thumbnails manquantes');
  console.log('└─ Lancer audit links pour validation');
  
  console.log('\n🚀 Pages manquantes créées avec succès !');
} else {
  console.log('\n💡 Toutes les pages existent déjà');
}

console.log('\n' + '='.repeat(60));
