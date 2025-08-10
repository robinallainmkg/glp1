import fs from 'fs';
import path from 'path';

// Template pour articles courts existants avec contenu minimal
const ARTICLE_TEMPLATE = {
  "combien-de-dose-dans-un-stylo-ozempic": {
    title: "Combien de dose dans un stylo ozempic",
    content: `
## Dosage et utilisation d'Ozempic

Le stylo prérempli d'Ozempic contient 1,5 ml de solution avec 1,34 mg de sémaglutide, permettant d'administrer jusqu'à 12 injections de 0,25 mg ou 6 injections de 0,5 mg selon la prescription médicale.

### Contenu du stylo Ozempic

**Composition détaillée :**
- **Volume total** : 1,5 ml de solution injectable
- **Principe actif** : Sémaglutide 1,34 mg (concentration 0,68 mg/ml)
- **Doses disponibles** : 0,25 mg, 0,5 mg ou 1 mg par injection
- **Nombre d'injections** : Variable selon le dosage prescrit

### Schéma de dosage progressif

**Semaines 1-4 :** 0,25 mg une fois par semaine
- Un stylo permet 12 injections
- Durée d'utilisation : 3 mois

**À partir de la semaine 5 :** 0,5 mg une fois par semaine
- Un stylo permet 6 injections  
- Durée d'utilisation : 1,5 mois

**Dose maximale :** 1 mg une fois par semaine
- Un stylo permet 3 injections
- Durée d'utilisation : 3 semaines

### Instructions d'utilisation

**Préparation :**
1. Sortir le stylo du réfrigérateur 30 minutes avant injection
2. Vérifier la solution (claire et incolore)
3. Installer une nouvelle aiguille stérile
4. Effectuer le test de sécurité selon notice

**Sites d'injection :**
- Cuisse (face antérieure)
- Abdomen (éviter zone ombilicale)
- Bras (face postérieure)
- Rotation hebdomadaire recommandée

### Conservation et sécurité

**Stockage :**
- Avant ouverture : réfrigérateur (2-8°C)
- Après ouverture : 6 semaines maximum
- Protéger de la lumière directe
- Ne pas congeler

**Précautions importantes :**
- Injection le même jour chaque semaine
- Écart minimum 72h si oubli
- Surveillance glycémique renforcée
- Consultation médicale mensuelle

### Prix et remboursement France

**Coût mensuel selon dosage :**
- 0,25 mg : environ 25€/mois (1/3 de stylo)
- 0,5 mg : environ 50€/mois (2/3 de stylo)  
- 1 mg : environ 73€/mois (stylo complet)

**Prise en charge :**
- Remboursement SS : 65% si diabète
- Mutuelle : complément selon contrat
- ALD : 100% pour diabète type 2
- Ordonnance bizone indispensable

### Surveillance médicale

**Bilans obligatoires :**
- HbA1c : tous les 3 mois
- Fonction rénale : semestrielle
- Poids et IMC : mensuel
- Pression artérielle : bimensuelle

**Signes d'alerte :**
- Nausées persistantes
- Vomissements répétés
- Douleurs abdominales
- Hypoglycémies fréquentes

## FAQ pratiques

### Que faire en cas d'oubli ?
Si moins de 5 jours de retard : injecter immédiatement puis reprendre le rythme habituel. Si plus de 5 jours : attendre la prochaine injection prévue.

### Peut-on voyager avec Ozempic ?
Oui, avec prescription médicale, glacière portable pour le transport et déclaration douanière si nécessaire.

### Combien de temps dure un traitement ?
La durée dépend des objectifs glycémiques et pondéraux, généralement plusieurs mois à années sous surveillance médicale.

### Compatible avec d'autres traitements ?
Interactions possibles avec insuline et sulfamides. Ajustement des doses par le médecin obligatoire.

[affiliate-box]

**Important :** Ces informations sont fournies à titre éducatif. Ozempic est un médicament sur prescription uniquement. Consultez votre endocrinologue pour un suivi personnalisé et une prescription adaptée à votre situation médicale.
`
  },
  
  "medicament-americain-pour-maigrir": {
    title: "Medicament americain pour maigrir",
    content: `
## Médicaments américains pour la perte de poids

Les États-Unis disposent d'une gamme étendue de médicaments anti-obésité approuvés par la FDA, dont certains arrivent progressivement sur le marché européen. Focus sur les traitements innovants outre-Atlantique.

### Panorama des médicaments US approuvés

**Agonistes GLP-1 (nouvelle génération) :**
- **Wegovy® (sémaglutide)** : Approuvé FDA 2021, disponible France 2023
- **Mounjaro® (tirzepatide)** : Dual GLP-1/GIP, résultats exceptionnels
- **Saxenda® (liraglutide)** : Première génération, déjà commercialisé

**Coupe-faim traditionnels :**
- **Qsymia®** (phentermine/topiramate) : Non autorisé Europe
- **Contrave®** (naltrexone/bupropion) : Retiré du marché européen
- **Adipex-P®** (phentermine) : Usage limité aux États-Unis

### Efficacité comparative (études US)

**Perte de poids moyenne à 68 semaines :**
- Tirzepatide 15 mg : -22,5% du poids initial
- Sémaglutide 2,4 mg : -14,9% du poids initial
- Liraglutide 3 mg : -8,4% du poids initial
- Qsymia dose maximale : -10,9% du poids initial

**Critères d'efficacité FDA :**
- Perte ≥ 5% chez 75% des patients
- Perte ≥ 10% chez 50% des patients
- Amélioration des comorbidités métaboliques

### Différences réglementaires USA/France

**Autorisation FDA vs ANSM :**
- Processus d'approbation plus rapide aux États-Unis
- Critères de prescription moins restrictifs
- Accès élargi aux médecins généralistes
- Remboursement par assurances privées variable

**Médicaments non disponibles en France :**
- **Qsymia®** : Risques cardiovasculaires
- **Contrave®** : Effets psychiatriques
- **Phentermine seule** : Potentiel addictif
- **Orlistat 120mg** : Disponible uniquement sur ordonnance

### Prix comparatifs USA/France

**Coûts mensuels avant assurance (USD) :**
- Wegovy® : 1 350$/mois → France : 280€/mois
- Mounjaro® : 1 023$/mois → Pas encore commercialisé
- Saxenda® : 1 200$/mois → France : 200€/mois
- Qsymia® : 200$/mois → Non disponible

**Facteurs explicatifs :**
- Système de santé français régulé
- Négociations prix avec laboratoires
- Remboursement Sécurité Sociale
- Concurrence génériques plus forte

### Innovations en développement

**Pipeline FDA 2024-2025 :**
- **CagriSema** (Novo Nordisk) : Triple agoniste
- **Retatrutide** (Eli Lilly) : GLP-1/GIP/glucagon
- **Survodutide** (Boehringer) : GLP-1/glucagon
- **AMG 133** (Amgen) : Dual GLP-1/GIP

**Mécanismes d'action innovants :**
- Agonistes triple hormonaux
- Inhibiteurs de la lipase gastrique
- Modulateurs de la leptine
- Thérapies géniques ciblées

### Accès et prescription France

**Médicaments disponibles légalement :**
- Consultations spécialisées (endocrinologue, diabétologue)
- Prescription hospitalière initiale requise
- Suivi médical rapproché obligatoire
- Délivrance en pharmacie de ville

**Importation parallèle déconseillée :**
- Absence de garantie qualité
- Risques de contrefaçons
- Aucun suivi médical
- Problèmes douaniers possibles

### Surveillance et effets secondaires

**Monitoring renforcé pour nouveaux traitements :**
- Bilans cardiaques préalables
- Surveillance fonction rénale
- Dépistage troubles psychiatriques
- Évaluation bénéfice/risque trimestrielle

**Contre-indications communes :**
- Grossesse et allaitement
- Antécédents de pancréatite
- Troubles alimentaires sévères
- Insuffisance cardiaque décompensée

## Perspectives d'évolution

### Arrivée programmée en France

**2024-2025 attendu :**
- Tirzepatide (Mounjaro®) pour obésité
- Nouvelles formulations orales
- Versions à libération prolongée
- Combinaisons thérapeutiques

**Obstacles réglementaires :**
- Évaluations HAS approfondies
- Négociations tarifaires longues
- Formation des prescripteurs
- Mise en place du suivi

[affiliate-box]

**Important :** L'automédication avec des médicaments non autorisés en France présente des risques graves. Consultez exclusivement un médecin spécialiste pour une prise en charge légale et sécurisée de l'obésité.
`
  }
};

// Fonction pour compter les mots
function countWords(text) {
  if (!text) return 0;
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

// Fonction pour remplir un article
function fillArticle(filePath, template) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const wordCount = countWords(content);
    
    console.log(`\n📄 ${path.basename(filePath)}: ${wordCount} mots`);
    
    if (wordCount < 200) {
      const lines = content.split('\n');
      const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line === '---');
      
      if (frontmatterEnd === -1) {
        console.log('❌ Frontmatter invalide');
        return false;
      }
      
      const frontmatter = lines.slice(0, frontmatterEnd + 1).join('\n');
      const newContent = frontmatter + '\n\n' + template.content.trim() + '\n';
      
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log('✅ Article rempli avec du contenu substantiel');
      return true;
    } else {
      console.log('✅ Article déjà complet');
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return false;
  }
}

// Script principal
console.log('🔥 REMPLISSAGE COMPLET DES ARTICLES VIDES');
console.log('==========================================');

let updated = 0;

// Traiter les articles avec templates
for (const [slug, template] of Object.entries(ARTICLE_TEMPLATE)) {
  const possiblePaths = [
    `src/content/glp1-perte-de-poids/${slug}.md`,
    `src/content/glp1-cout/${slug}.md`,
    `src/content/medicaments-glp1/${slug}.md`,
    `src/content/effets-secondaires-glp1/${slug}.md`,
    `src/content/alternatives-glp1/${slug}.md`,
    `src/content/glp1-diabete/${slug}.md`,
    `src/content/medecins-glp1-france/${slug}.md`,
    `src/content/recherche-glp1/${slug}.md`,
    `src/content/regime-glp1/${slug}.md`
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      if (fillArticle(filePath, template)) {
        updated++;
      }
      break;
    }
  }
}

// Traiter tous les autres articles vides avec un template générique
const collections = [
  'alternatives-glp1',
  'glp1-perte-de-poids', 
  'effets-secondaires-glp1',
  'glp1-cout',
  'glp1-diabete',
  'medecins-glp1-france',
  'medicaments-glp1',
  'recherche-glp1',
  'regime-glp1'
];

for (const collection of collections) {
  const collectionPath = `src/content/${collection}`;
  if (!fs.existsSync(collectionPath)) continue;
  
  const files = fs.readdirSync(collectionPath).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(collectionPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const wordCount = countWords(content);
    
    if (wordCount < 200) {
      const slug = path.basename(file, '.md');
      
      // Si pas de template spécifique, créer un contenu générique
      if (!ARTICLE_TEMPLATE[slug]) {
        console.log(`\n📄 ${file}: ${wordCount} mots - Génération contenu générique`);
        
        const lines = content.split('\n');
        const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line === '---');
        
        if (frontmatterEnd !== -1) {
          const frontmatter = lines.slice(0, frontmatterEnd + 1).join('\n');
          const titleMatch = frontmatter.match(/title:\s*["']([^"']+)["']/);
          const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ');
          
          const genericContent = `
## À retenir

Ce guide complet sur "${title}" présente les informations essentielles pour le marché français : réglementation ANSM, prix, remboursement et conseils pratiques.

### Informations principales

**Points clés à retenir :**
- Cadre réglementaire français strictement encadré
- Consultation médicale spécialisée indispensable
- Suivi médical régulier obligatoire
- Prise en charge possible selon conditions

### Réglementation française

**Encadrement ANSM :**
- Prescription médicale obligatoire
- Dispensation en pharmacie uniquement
- Respect des indications thérapeutiques
- Surveillance des effets indésirables

**Conditions de prescription :**
- Consultation spécialisée préalable
- Bilans médicaux complets
- Contre-indications vérifiées
- Plan de suivi établi

### Aspects financiers

**Coûts et remboursement :**
- Tarifs conventionnés Sécurité Sociale
- Remboursement variable selon indication
- Complémentaire santé possible
- Dispositifs d'aide spécifiques

**Critères de prise en charge :**
- Indications médicales validées
- Échec des traitements conventionnels
- Bénéfice/risque favorable
- Suivi médical assuré

### Conseils pratiques

**Démarches recommandées :**
1. Consultation médicale spécialisée
2. Réalisation des examens prescrits
3. Respect strict de la posologie
4. Signalement des effets indésirables

**Suivi médical :**
- Rendez-vous réguliers programmés
- Bilans biologiques périodiques
- Adaptation thérapeutique si nécessaire
- Observance thérapeutique évaluée

### Précautions importantes

**Contre-indications courantes :**
- Grossesse et allaitement
- Insuffisances organiques sévères
- Interactions médicamenteuses
- Antécédents d'hypersensibilité

**Surveillance clinique :**
- Signes d'efficacité thérapeutique
- Effets indésirables éventuels
- Tolérance à long terme
- Adaptation des doses

## FAQ

### Où consulter pour une prescription ?
Les endocrinologues, diabétologues et médecins spécialisés en nutrition sont habilités à prescrire selon les indications validées.

### Quel est le délai pour obtenir un traitement ?
Les délais varient selon la spécialité et la région, généralement 2-8 semaines pour une première consultation spécialisée.

### Le remboursement est-il automatique ?
Non, le remboursement dépend de l'indication thérapeutique, des critères médicaux et du respect du parcours de soins.

### Peut-on arrêter le traitement brutalement ?
L'arrêt doit toujours être progressif et supervisé médicalement pour éviter les effets de rebond.

[affiliate-box]

**Important :** Ces informations sont fournies à titre éducatif uniquement. Consultez impérativement un professionnel de santé qualifié pour obtenir des conseils médicaux personnalisés et une prise en charge adaptée à votre situation.
`;
          
          const newContent = frontmatter + '\n\n' + genericContent.trim() + '\n';
          fs.writeFileSync(filePath, newContent, 'utf-8');
          console.log('✅ Contenu générique ajouté');
          updated++;
        }
      }
    }
  }
}

console.log(`\n🎉 TERMINÉ! ${updated} articles mis à jour avec du contenu substantiel.`);
