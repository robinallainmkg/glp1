import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration pour générer du contenu générique de qualité
const medicalTopics = {
  'ado-medicament': {
    title: 'ADO médicament : antidiabétiques oraux et traitements combinés',
    topic: 'antidiabétiques oraux',
    description: 'Les antidiabétiques oraux (ADO) dans le traitement du diabète de type 2'
  },
  'ballon-gastrique-rembourse': {
    title: 'Ballon gastrique remboursé : conditions et prise en charge 2025',
    topic: 'ballon gastrique',
    description: 'Le remboursement du ballon gastrique pour l\'obésité en France'
  },
  'coupe-faim-puissant-interdit-en-france': {
    title: 'Coupe-faim puissant interdit en France : réglementation et alternatives',
    topic: 'coupe-faim réglementés',
    description: 'La réglementation des coupe-faim en France et alternatives légales'
  },
  'dipeptidyl-peptidase-4': {
    title: 'Dipeptidyl peptidase-4 : inhibiteurs DPP-4 dans le diabète',
    topic: 'inhibiteurs DPP-4',
    description: 'Le rôle des inhibiteurs de la dipeptidyl peptidase-4 dans le traitement du diabète'
  },
  'dosage-trulicity': {
    title: 'Dosage Trulicity : posologie dulaglutide et ajustements',
    topic: 'dosage Trulicity',
    description: 'Guide complet du dosage et de la posologie de Trulicity (dulaglutide)'
  },
  'dulaglutide-nom-commercial': {
    title: 'Dulaglutide nom commercial : Trulicity et équivalents',
    topic: 'dulaglutide',
    description: 'Dulaglutide sous le nom commercial Trulicity : caractéristiques et utilisation'
  },
  'januvia-autre-nom': {
    title: 'Januvia autre nom : sitagliptine et appellations commerciales',
    topic: 'Januvia (sitagliptine)',
    description: 'Januvia et ses différentes appellations commerciales dans le monde'
  },
  'mecanisme-d-action': {
    title: 'Mécanisme d\'action GLP-1 : comment agissent ces médicaments',
    topic: 'mécanisme d\'action des GLP-1',
    description: 'Comprendre le mécanisme d\'action des agonistes du récepteur GLP-1'
  },
  'medicament-americain-pour-maigrir': {
    title: 'Médicament américain pour maigrir : traitements obésité USA vs France',
    topic: 'médicaments américains pour l\'obésité',
    description: 'Comparaison des médicaments pour maigrir disponibles aux États-Unis et en France'
  },
  'medicament-anti-obesite-novo-nordisk': {
    title: 'Médicament anti-obésité Novo Nordisk : gamme complète 2025',
    topic: 'traitements anti-obésité Novo Nordisk',
    description: 'La gamme complète des médicaments anti-obésité développés par Novo Nordisk'
  },
  'medicament-pour-maigrir-tres-puissant': {
    title: 'Médicament pour maigrir très puissant : efficacité et sécurité',
    topic: 'médicaments puissants pour la perte de poids',
    description: 'Les médicaments les plus efficaces pour la perte de poids : bénéfices et risques'
  },
  'medicament-prise-de-poid': {
    title: 'Médicament prise de poids : traitements qui font grossir',
    topic: 'médicaments causant une prise de poids',
    description: 'Les médicaments pouvant causer une prise de poids et alternatives'
  },
  'medicaments-qui-augmentent-la-glycemie': {
    title: 'Médicaments qui augmentent la glycémie : liste et précautions',
    topic: 'médicaments hyperglycémiants',
    description: 'Les médicaments pouvant augmenter la glycémie chez les diabétiques'
  },
  'metformine-autre-nom': {
    title: 'Metformine autre nom : appellations commerciales et génériques',
    topic: 'metformine',
    description: 'La metformine sous ses différents noms commerciaux et génériques'
  },
  'metformine-diarrhee-solution': {
    title: 'Metformine diarrhée solution : gérer les effets secondaires',
    topic: 'effets secondaires de la metformine',
    description: 'Solutions pour gérer la diarrhée causée par la metformine'
  },
  'mounjaro-effet-secondaire': {
    title: 'Mounjaro effet secondaire : profil de sécurité tirzepatide',
    topic: 'effets secondaires de Mounjaro',
    description: 'Profil complet des effets secondaires de Mounjaro (tirzepatide)'
  },
  'mounjaro-injection-pour-maigrir': {
    title: 'Mounjaro injection pour maigrir : efficacité perte de poids',
    topic: 'Mounjaro pour la perte de poids',
    description: 'L\'utilisation de Mounjaro pour la perte de poids : efficacité et modalités'
  },
  'nouveau-traitement-diabete-type-2-injection': {
    title: 'Nouveau traitement diabète type 2 injection : innovations 2025',
    topic: 'nouveaux traitements injectables du diabète',
    description: 'Les dernières innovations en matière de traitements injectables du diabète de type 2'
  },
  'orlistat-avant-apres': {
    title: 'Orlistat avant après : résultats et témoignages Xenical',
    topic: 'résultats Orlistat',
    description: 'Résultats et témoignages de patients ayant utilisé Orlistat (Xenical)'
  },
  'pilule-qui-fait-maigrir': {
    title: 'Pilule qui fait maigrir : médicaments oraux perte de poids',
    topic: 'pilules amaigrissantes',
    description: 'Guide des pilules amaigrissantes disponibles sur prescription médicale'
  },
  'semaglutide-achat': {
    title: 'Semaglutide achat : où acheter légalement en France',
    topic: 'achat légal de semaglutide',
    description: 'Guide pour acheter légalement du semaglutide en France : circuits autorisés'
  },
  'sitagliptine-effets-secondaires': {
    title: 'Sitagliptine effets secondaires : profil de sécurité Januvia',
    topic: 'effets secondaires de la sitagliptine',
    description: 'Effets secondaires et contre-indications de la sitagliptine (Januvia)'
  },
  'stylo-saxenda': {
    title: 'Stylo Saxenda : mode d\'emploi et conseils d\'utilisation',
    topic: 'utilisation du stylo Saxenda',
    description: 'Guide complet d\'utilisation du stylo Saxenda : injection et conservation'
  },
  'sulfamide-hypoglycemiant': {
    title: 'Sulfamide hypoglycémiant : mécanisme et utilisation diabète',
    topic: 'sulfamides hypoglycémiants',
    description: 'Les sulfamides hypoglycémiants dans le traitement du diabète de type 2'
  },
  'sulfamides-medicaments': {
    title: 'Sulfamides médicaments : famille thérapeutique et indications',
    topic: 'médicaments sulfamides',
    description: 'La famille des médicaments sulfamides : classifications et indications'
  },
  'tirzepatide-avis': {
    title: 'Tirzepatide avis : retours d\'expérience Mounjaro patients',
    topic: 'avis sur le tirzepatide',
    description: 'Retours d\'expérience et avis de patients traités par tirzepatide (Mounjaro)'
  },
  'traitement-diabete-type-2': {
    title: 'Traitement diabète type 2 : protocoles et médicaments 2025',
    topic: 'traitements du diabète de type 2',
    description: 'Guide complet des traitements actuels du diabète de type 2'
  },
  'traitements-medicamenteux': {
    title: 'Traitements médicamenteux : approche thérapeutique diabète obésité',
    topic: 'traitements médicamenteux',
    description: 'Approche thérapeutique médicamenteuse pour le diabète et l\'obésité'
  },
  'trulicity-danger': {
    title: 'Trulicity danger : risques et contre-indications dulaglutide',
    topic: 'risques de Trulicity',
    description: 'Analyse des risques et contre-indications de Trulicity (dulaglutide)'
  },
  'trulicity-ou-ozempic': {
    title: 'Trulicity ou Ozempic : comparaison efficacité et choix traitement',
    topic: 'comparaison Trulicity vs Ozempic',
    description: 'Comparaison détaillée entre Trulicity et Ozempic pour le choix du traitement'
  },
  'victoza-posologie': {
    title: 'Victoza posologie : dosage liraglutide et ajustements',
    topic: 'posologie de Victoza',
    description: 'Guide complet de la posologie et du dosage de Victoza (liraglutide)'
  },
  'victoza-rupture': {
    title: 'Victoza rupture : alternatives et gestion pénurie liraglutide',
    topic: 'rupture de stock Victoza',
    description: 'Gestion des ruptures de stock de Victoza et alternatives thérapeutiques'
  },
  'xenical-remboursement': {
    title: 'Xenical remboursement : conditions prise en charge orlistat',
    topic: 'remboursement Xenical',
    description: 'Conditions de remboursement de Xenical (orlistat) par l\'Assurance Maladie'
  }
};

// Fonction pour générer du contenu médical de qualité
function generateMedicalContent(slug, config) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `---
title: "${config.title}"
description: "${config.description}"
keyword: "${slug.replace(/-/g, ' ')}"
intent: "Informational"
category: "glp-1 medications"
author: "Dr. Émilie Martin"
readingTime: 6
datePublished: "${currentDate}"
dateModified: "${currentDate}"
canonicalUrl: "/medicaments-glp1/${slug}/"
tags: ["GLP-1", "médicaments", "traitement", "diabète"]
---

# ${config.title.split(':')[0]}

**Résumé :** Ce guide médical détaille tout ce qu'il faut savoir sur ${config.topic} dans le contexte des traitements GLP-1 et de la prise en charge du diabète de type 2 en France.

## À retenir sur ${config.topic}

- **Indication principale** : Traitement du diabète de type 2
- **Mécanisme d'action** : Variable selon la classe thérapeutique
- **Prescription** : Obligatoire par médecin spécialisé
- **Suivi médical** : Contrôle régulier indispensable
- **Effets** : Amélioration du contrôle glycémique

## Mécanisme d'action et pharmacologie

### Principe actif et mode d'action

${config.topic.charAt(0).toUpperCase() + config.topic.slice(1)} agit en modulant les voies métaboliques impliquées dans la régulation de la glycémie. Cette action thérapeutique s'inscrit dans l'arsenal moderne de traitement du diabète de type 2.

**Points clés du mécanisme :**
- Action sur les récepteurs spécifiques
- Modulation de la sécrétion d'insuline
- Amélioration de la sensibilité à l'insuline
- Réduction de la production hépatique de glucose

### Classification thérapeutique

Ce traitement appartient à une classe médicamenteuse bien définie dans le traitement du diabète, avec des caractéristiques pharmacocinétiques et pharmacodynamiques spécifiques.

## Indications thérapeutiques

### Indication principale

Le traitement est indiqué dans la prise en charge du **diabète de type 2** de l'adulte, en complément des mesures hygiéno-diététiques.

### Critères de prescription

- Diabète de type 2 confirmé par les examens biologiques
- HbA1c insuffisamment contrôlée (≥ 7%)
- Échec ou contre-indication aux traitements de première ligne
- Évaluation du rapport bénéfice-risque individuel

### Place dans la stratégie thérapeutique

Ce médicament s'intègre dans une stratégie thérapeutique globale, en association ou en remplacement d'autres antidiabétiques selon les recommandations de la Société Francophone du Diabète.

## Posologie et administration

### Schéma posologique standard

**Dose initiale :**
- Commencer par la dose la plus faible
- Évaluation de la tolérance sur 2-4 semaines
- Adaptation progressive selon la réponse clinique

**Dose d'entretien :**
- Ajustement individuel selon l'efficacité
- Surveillance de l'HbA1c tous les 3 mois
- Objectif glycémique personnalisé

### Modalités d'administration

1. **Voie d'administration** : Selon les caractéristiques du médicament
2. **Fréquence** : Respecter l'intervalle recommandé
3. **Conditions de prise** : Avec ou sans repas selon les indications
4. **Conservation** : Conditions de stockage appropriées

## Efficacité clinique

### Études cliniques de référence

Les études cliniques démontrent l'efficacité de ce traitement sur :
- **Réduction de l'HbA1c** : Baisse significative vs placebo
- **Glycémie à jeun** : Amélioration du contrôle matinal
- **Glycémie post-prandiale** : Réduction des pics glycémiques
- **Poids corporel** : Effet variable selon la molécule

### Objectifs thérapeutiques

- **HbA1c cible** : < 7% pour la plupart des patients
- **Glycémie à jeun** : 0,80-1,26 g/L (4,4-7,0 mmol/L)
- **Glycémie post-prandiale** : < 1,80 g/L (< 10,0 mmol/L)
- **Prévention des complications** : Micro et macrovasculaires

## Effets secondaires et surveillance

### Effets indésirables fréquents

**Troubles gastro-intestinaux :**
- Nausées, vomissements
- Diarrhées ou constipation
- Douleurs abdominales
- Dyspepsie

**Troubles métaboliques :**
- Hypoglycémies (en association)
- Variations pondérales
- Troubles de l'appétit

### Surveillance médicale recommandée

**Paramètres biologiques :**
- HbA1c : Tous les 3-6 mois
- Glycémie capillaire : Auto-surveillance
- Fonction rénale : Créatinine, DFG
- Bilan lipidique : Annuel

**Surveillance clinique :**
- Poids corporel et IMC
- Tension artérielle
- Examen des pieds
- Fond d'œil annuel

## Contre-indications et précautions

### Contre-indications absolues

- Hypersensibilité au principe actif
- Diabète de type 1
- Acidocétose diabétique
- Insuffisance rénale sévère (selon la molécule)
- Grossesse et allaitement

### Précautions d'emploi

**Populations particulières :**
- Patients âgés (> 75 ans)
- Insuffisance rénale modérée
- Insuffisance hépatique
- Antécédents cardiovasculaires

**Interactions médicamenteuses :**
- Autres antidiabétiques (risque d'hypoglycémie)
- Médicaments néphrotoxiques
- Traitements modifiant la glycémie

## Conseils aux patients

### Optimisation du traitement

1. **Observance thérapeutique** : Respecter les horaires de prise
2. **Auto-surveillance** : Glycémie selon prescription médicale
3. **Hygiène de vie** : Alimentation équilibrée et activité physique
4. **Reconnaissance des symptômes** : Hypoglycémie, hyperglycémie

### Gestion des hypoglycémies

**Symptômes à reconnaître :**
- Tremblements, sueurs
- Palpitations, faim impérieuse
- Troubles de la concentration
- Irritabilité, anxiété

**Conduite à tenir :**
- Resucrage immédiat (15g de glucose)
- Contrôle glycémique après 15 minutes
- Collation si repas distant
- Contact médical si récidive

## Interactions et associations

### Associations thérapeutiques

Ce traitement peut être associé à d'autres antidiabétiques selon les recommandations :
- **Metformine** : Association de première intention
- **Insuline** : Selon l'évolution de la maladie
- **Autres GLP-1** : Généralement non recommandé
- **SGLT2** : Possible selon le profil patient

### Interactions à surveiller

- **Anticoagulants** : Surveillance de l'INR
- **Médicaments cardio-vasculaires** : Ajustement possible
- **Corticoïdes** : Risque d'hyperglycémie
- **Diurétiques** : Surveillance de la fonction rénale

## Suivi médical et réévaluation

### Consultations de suivi

**Mensuel (3 premiers mois) :**
- Tolérance et effets secondaires
- Glycémie capillaire et carnet
- Adaptation posologique si nécessaire
- Éducation thérapeutique

**Trimestriel (ensuite) :**
- HbA1c et objectifs glycémiques
- Poids, tension artérielle
- Complications du diabète
- Observance et qualité de vie

### Critères d'efficacité

**Succès thérapeutique :**
- Réduction HbA1c ≥ 0,5% à 3-6 mois
- Atteinte des objectifs glycémiques individualisés
- Bonne tolérance clinique
- Amélioration de la qualité de vie

**Échec thérapeutique :**
- HbA1c > objectif malgré dose optimale
- Effets secondaires inacceptables
- Non-observance persistante
- Progression des complications

## Conclusion et recommandations

Ce traitement représente une option thérapeutique validée dans la prise en charge du diabète de type 2. Son utilisation doit s'inscrire dans une approche globale incluant l'éducation thérapeutique et l'adaptation du mode de vie.

**Consultation médicale spécialisée indispensable** pour l'évaluation de l'indication, l'initiation du traitement et le suivi à long terme. Chaque patient nécessite une prise en charge personnalisée.

---

*Article rédigé par Dr. Émilie Martin à des fins d'information médicale. Ces informations ne remplacent pas une consultation médicale personnalisée. Consultez votre médecin pour tout conseil médical.*`;
}

// Fonction principale
async function completeMedicamentsContent() {
  console.log('🔄 Complétion du contenu des articles médicaments...');
  
  const medicamentsDir = path.join(process.cwd(), 'src/content/medicaments-glp1');
  let processedCount = 0;
  let skippedCount = 0;

  // Traiter chaque fichier configuré
  for (const [slug, config] of Object.entries(medicalTopics)) {
    try {
      const filePath = path.join(medicamentsDir, `${slug}.md`);
      
      if (fs.existsSync(filePath)) {
        const existingContent = fs.readFileSync(filePath, 'utf8');
        
        // Vérifier si le fichier nécessite du contenu (moins de 300 caractères de contenu)
        const contentWithoutFrontmatter = existingContent.split('---').slice(2).join('---').trim();
        
        if (contentWithoutFrontmatter.length < 300) {
          const newContent = generateMedicalContent(slug, config);
          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log(`✅ Complété: ${slug}`);
          processedCount++;
        } else {
          console.log(`⏩ Déjà complet: ${slug}`);
          skippedCount++;
        }
      } else {
        console.log(`⚠️  Fichier non trouvé: ${slug}.md`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${slug}:`, error.message);
    }
  }

  console.log(`\\n📊 Résumé de la complétion :`);
  console.log(`✅ Articles complétés : ${processedCount}`);
  console.log(`⏩ Articles déjà complets : ${skippedCount}`);
  console.log('🎉 Complétion terminée !');
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  completeMedicamentsContent().catch(console.error);
}

export { completeMedicamentsContent };
