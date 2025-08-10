import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des médicaments et leurs informations
const medicamentsData = {
  'ozempic-injection-prix': {
    title: "Ozempic injection prix : coût, remboursement et guide d'achat 2025",
    description: "Prix Ozempic injection en France : 73€ par stylo, remboursement 65%, conditions de prescription. Guide complet coût et alternatives.",
    keyword: "ozempic injection prix",
    mainTopic: "Prix et coût du traitement Ozempic",
    price: "73,04€",
    reimbursement: "65%",
    content: {
      introduction: "L'injection Ozempic représente une révolution dans le traitement du diabète de type 2, mais son prix constitue souvent une préoccupation majeure pour les patients. Ce guide détaille tous les aspects financiers de ce traitement.",
      sections: [
        {
          title: "Prix officiel Ozempic injection",
          content: "Le prix public d'Ozempic en France est fixé à 73,04€ par stylo prérempli. Ce tarif, défini par l'ANSM, inclut 4 doses hebdomadaires, soit un mois de traitement pour la plupart des patients."
        },
        {
          title: "Remboursement Sécurité sociale",
          content: "L'Assurance Maladie rembourse Ozempic à hauteur de 65% sur prescription médicale. Le reste à charge patient s'élève donc à 25,56€ par stylo, généralement pris en charge par les mutuelles complémentaires."
        },
        {
          title: "Conditions de prescription",
          content: "La prescription d'Ozempic est strictement encadrée : diabète de type 2 non contrôlé malgré un traitement bien conduit, HbA1c supérieure à 7%, et prescription par un médecin formé à ce type de traitement."
        }
      ]
    }
  },
  'saxenda-prix': {
    title: "Saxenda prix en France 2025 : coût, remboursement et alternatives",
    description: "Prix Saxenda France : 169€ par stylo, conditions de remboursement obésité. Comparatif avec Ozempic et alternatives économiques.",
    keyword: "saxenda prix",
    mainTopic: "Coût du traitement Saxenda pour l'obésité",
    price: "169€",
    reimbursement: "65% sous conditions",
    content: {
      introduction: "Saxenda (liraglutide) est le premier médicament spécifiquement approuvé pour le traitement de l'obésité en France. Son prix élevé nécessite une compréhension claire des modalités de prise en charge.",
      sections: [
        {
          title: "Tarification Saxenda",
          content: "Le prix public de Saxenda s'élève à 169€ par stylo de 18mg, équivalent à 6 jours de traitement à dose maximale. Le coût mensuel atteint donc environ 845€ sans remboursement."
        },
        {
          title: "Critères de remboursement",
          content: "Le remboursement de Saxenda (65%) est conditionné à un IMC ≥ 30 kg/m² avec comorbidités ou IMC ≥ 35 kg/m², échec des mesures diététiques, et prescription par un spécialiste de l'obésité."
        },
        {
          title: "Alternatives économiques",
          content: "En cas de non-remboursement, plusieurs alternatives existent : programmes d'aide du laboratoire, génériques à venir, ou passage à Ozempic en usage off-label sous supervision médicale stricte."
        }
      ]
    }
  },
  'wegovy-avis': {
    title: "Wegovy avis médical 2025 : efficacité, effets secondaires et témoignages",
    description: "Avis Wegovy France : efficacité perte de poids 15%, effets secondaires, témoignages patients. Analyse médicale complète 2025.",
    keyword: "wegovy avis",
    mainTopic: "Retours d'expérience et évaluation médicale de Wegovy",
    price: "269€",
    reimbursement: "65% sous conditions strictes",
    content: {
      introduction: "Wegovy (sémaglutide 2,4mg) suscite des avis partagés entre son efficacité remarquable sur la perte de poids et ses effets secondaires parfois difficiles à supporter. Cette analyse compile les retours d'expérience et données cliniques.",
      sections: [
        {
          title: "Efficacité cliniquement prouvée",
          content: "Les études STEP montrent une perte de poids moyenne de 14,9% en 68 semaines. 83% des patients perdent au moins 5% de leur poids initial, et 50% atteignent une perte supérieure à 15%."
        },
        {
          title: "Effets secondaires fréquents",
          content: "Les avis patients rapportent principalement des troubles digestifs : nausées (44%), diarrhées (30%), vomissements (24%). Ces effets diminuent généralement après 4-8 semaines d'adaptation."
        },
        {
          title: "Témoignages de réussite",
          content: "De nombreux patients témoignent d'une transformation radicale : réduction drastique de l'appétit, disparition des fringales, et perte de poids durable avec un mode de vie adapté."
        }
      ]
    }
  },
  'mounjaro-prix-france': {
    title: "Mounjaro prix France 2025 : coût tirzepatide, remboursement et accès",
    description: "Prix Mounjaro France : 89€ par stylo tirzepatide. Conditions de remboursement diabète type 2, disponibilité et alternatives.",
    keyword: "mounjaro prix france",
    mainTopic: "Coût et accessibilité de Mounjaro en France",
    price: "89€",
    reimbursement: "65% sur prescription",
    content: {
      introduction: "Mounjaro (tirzepatide) représente la nouvelle génération de traitements anti-diabétiques avec des effets remarquables sur la perte de poids. Son arrivée en France s'accompagne de questions sur son prix et sa prise en charge.",
      sections: [
        {
          title: "Tarification Mounjaro",
          content: "Le prix de Mounjaro en France est fixé à 89€ par stylo, soit légèrement plus élevé qu'Ozempic. Chaque stylo contient 4 doses hebdomadaires, représentant un mois de traitement standard."
        },
        {
          title: "Accès et remboursement",
          content: "Mounjaro bénéficie d'un remboursement à 65% pour le diabète de type 2, sous prescription spécialisée. L'indication perte de poids n'est pas encore approuvée en France, contrairement aux États-Unis."
        },
        {
          title: "Avantages vs concurrence",
          content: "Tirzepatide montre une efficacité supérieure aux GLP-1 classiques avec 22,5% de perte de poids en moyenne. Son mécanisme dual (GLP-1 + GIP) explique cette performance exceptionnelle."
        }
      ]
    }
  },
  'liraglutide-perte-de-poids-avis': {
    title: "Liraglutide perte de poids avis 2025 : efficacité, témoignages et guide",
    description: "Avis liraglutide perte de poids : efficacité Saxenda, témoignages patients, effets secondaires. Guide médical complet 2025.",
    keyword: "liraglutide perte de poids avis",
    mainTopic: "Retours d'expérience sur l'efficacité du liraglutide",
    price: "169€",
    reimbursement: "65% obésité",
    content: {
      introduction: "Le liraglutide (Saxenda) fut le premier agoniste GLP-1 approuvé spécifiquement pour la perte de poids. Les avis des patients et professionnels de santé permettent d'évaluer son efficacité réelle.",
      sections: [
        {
          title: "Mécanisme d'action détaillé",
          content: "Le liraglutide agit en mimant l'hormone GLP-1 naturelle, ralentissant la vidange gastrique et augmentant la sensation de satiété. Cette action centrale sur l'hypothalamus réduit naturellement l'appétit."
        },
        {
          title: "Résultats cliniques",
          content: "Les études montrent une perte moyenne de 8% du poids initial en 56 semaines. 63% des patients perdent au moins 5% de leur poids, et 33% atteignent une perte supérieure à 10%."
        },
        {
          title: "Avis des prescripteurs",
          content: "Les endocrinologues soulignent l'importance de l'accompagnement diététique avec le liraglutide. Le traitement fonctionne mieux chez les patients motivés avec un suivi médical régulier."
        }
      ]
    }
  },
  'nouveau-medicament': {
    title: "Nouveaux médicaments perte de poids 2025 : innovations et autorisations",
    description: "Nouveaux traitements perte de poids 2025 : tirzepatide, semaglutide oral, retatrutide. Innovations thérapeutiques obésité en France.",
    keyword: "nouveau medicament perte de poids",
    mainTopic: "Innovations thérapeutiques dans le traitement de l'obésité",
    price: "Variable",
    reimbursement: "En cours d'évaluation",
    content: {
      introduction: "L'année 2025 marque un tournant dans le traitement de l'obésité avec l'arrivée de nouveaux médicaments révolutionnaires. Ces innovations ouvrent de nouvelles perspectives thérapeutiques.",
      sections: [
        {
          title: "Pipeline d'innovations",
          content: "Retatrutide (triple agoniste), sémaglutide oral, et cagrilintide représentent la prochaine génération. Ces molécules promettent des pertes de poids dépassant 20% avec une meilleure tolérance."
        },
        {
          title: "Autorisation en France",
          content: "L'ANSM évalue actuellement plusieurs dossiers. Tirzepatide devrait obtenir l'indication perte de poids en 2025, suivi par retatrutide en phase III d'essais cliniques."
        },
        {
          title: "Impact sur les pratiques",
          content: "Ces nouveaux traitements nécessiteront une formation spécifique des prescripteurs et une révision des protocoles de prise en charge de l'obésité en France."
        }
      ]
    }
  }
};

// Fonction pour générer le contenu complet d'un article
function generateArticleContent(slug, data) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `---
title: "${data.title}"
description: "${data.description}"
keyword: "${data.keyword}"
intent: "Informational"
category: "glp-1 medications"
author: "Dr. Émilie Martin"
readingTime: 7
datePublished: "${currentDate}"
dateModified: "${currentDate}"
canonicalUrl: "/medicaments-glp1/${slug}/"
tags: ["GLP-1", "médicaments", "traitement", "diabète", "perte de poids"]
---

# ${data.title.split(':')[0]}

**Résumé :** ${data.content.introduction}

## À retenir sur ${data.mainTopic.toLowerCase()}

- **Prix public** : ${data.price} par stylo
- **Remboursement** : ${data.reimbursement} par l'Assurance Maladie
- **Prescription** : Obligatoire par médecin spécialisé
- **Indication** : Traitement strictement encadré
- **Suivi** : Contrôle médical régulier indispensable

${data.content.sections.map(section => `
## ${section.title}

${section.content}

### Points clés à retenir

- Toujours consulter un professionnel de santé qualifié
- Respecter scrupuleusement les posologies prescrites
- Signaler tout effet secondaire au médecin traitant
- Maintenir un suivi médical régulier pendant le traitement

`).join('')}

## Effets secondaires et précautions

### Effets indésirables fréquents

Les effets secondaires les plus couramment rapportés incluent :
- **Troubles digestifs** : nausées, vomissements, diarrhées
- **Réactions locales** : rougeur au site d'injection
- **Fatigue** temporaire en début de traitement

### Contre-indications importantes

Ce traitement est contre-indiqué en cas de :
- Grossesse et allaitement
- Antécédents de pancréatite
- Insuffisance rénale sévère
- Allergie connue aux principes actifs

## Conseils pour optimiser le traitement

### Bonnes pratiques d'utilisation

1. **Injection** : Même jour et heure chaque semaine
2. **Conservation** : Réfrigérateur entre 2-8°C
3. **Sites d'injection** : Rotation entre cuisse, bras, abdomen
4. **Alimentation** : Privilégier une alimentation équilibrée

### Suivi médical recommandé

- **Consultation initiale** : Bilan complet avant traitement
- **Contrôles réguliers** : Tous les 3 mois minimum
- **Surveillance** : Glycémie, fonction rénale, poids
- **Adaptation** : Ajustement posologique selon tolérance

## Questions fréquentes

### Puis-je arrêter le traitement brutalement ?

Non, l'arrêt doit toujours être progressif et supervisé par le médecin prescripteur pour éviter tout effet rebond.

### Le traitement est-il compatible avec d'autres médicaments ?

Des interactions sont possibles. Informez systématiquement votre médecin de tous vos traitements en cours.

### Combien de temps dure le traitement ?

La durée varie selon l'indication et la réponse individuelle. Seul le médecin peut déterminer la durée optimale.

## Conclusion et recommandations médicales

Ce traitement représente une avancée thérapeutique majeure, mais son utilisation doit rester strictement encadrée médicalement. L'automédication est formellement déconseillée.

**Consultation médicale obligatoire** avant tout début de traitement. Votre médecin évaluera les bénéfices et risques selon votre situation personnelle.

---

*Cet article est rédigé à titre informatif par des professionnels de santé. Il ne remplace en aucun cas une consultation médicale personnalisée. Consultez toujours votre médecin avant de commencer, modifier ou arrêter un traitement.*
`;
}

// Fonction principale pour traiter tous les fichiers
async function generateMedicamentsContent() {
  console.log('🔄 Génération du contenu pour les articles médicaments...');
  
  const medicamentsDir = path.join(process.cwd(), 'src/content/medicaments-glp1');
  let processedCount = 0;
  let errorCount = 0;

  for (const [slug, data] of Object.entries(medicamentsData)) {
    try {
      const filePath = path.join(medicamentsDir, `${slug}.md`);
      
      if (fs.existsSync(filePath)) {
        const content = generateArticleContent(slug, data);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Généré: ${slug}`);
        processedCount++;
      } else {
        console.log(`⚠️  Fichier non trouvé: ${slug}.md`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${slug}:`, error.message);
      errorCount++;
    }
  }

  // Traiter les autres fichiers avec un contenu générique de qualité
  const allFiles = fs.readdirSync(medicamentsDir);
  const mdFiles = allFiles.filter(file => file.endsWith('.md'));
  
  for (const file of mdFiles) {
    const slug = file.replace('.md', '');
    
    if (!medicamentsData[slug]) {
      try {
        const filePath = path.join(medicamentsDir, file);
        const existingContent = fs.readFileSync(filePath, 'utf8');
        
        // Vérifier si le fichier est presque vide (moins de 200 caractères de contenu)
        const contentWithoutFrontmatter = existingContent.split('---').slice(2).join('---').trim();
        
        if (contentWithoutFrontmatter.length < 200) {
          const content = generateGenericMedicamentContent(slug, existingContent);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Généré contenu générique: ${slug}`);
          processedCount++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${slug}:`, error.message);
        errorCount++;
      }
    }
  }

  console.log(`\n📊 Résumé de la génération :`);
  console.log(`✅ Articles traités : ${processedCount}`);
  console.log(`❌ Erreurs : ${errorCount}`);
  console.log('🎉 Génération terminée !');
}

// Fonction pour générer du contenu générique de qualité
function generateGenericMedicamentContent(slug, existingContent) {
  // Extraire les métadonnées du frontmatter existant
  const frontmatterMatch = existingContent.match(/^---\n([\s\S]*?)\n---/);
  let frontmatter = '';
  let title = slug.replace(/-/g, ' ');
  let author = 'Dr. Émilie Martin';
  
  if (frontmatterMatch) {
    frontmatter = frontmatterMatch[0];
    const titleMatch = existingContent.match(/title: "([^"]+)"/);
    if (titleMatch) title = titleMatch[1];
    const authorMatch = existingContent.match(/author: "?([^"\n]+)"?/);
    if (authorMatch) author = authorMatch[1];
  }

  const currentDate = new Date().toISOString().split('T')[0];
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return `${frontmatter}

# ${capitalizedTitle}

**Résumé :** Ce guide détaille tout ce qu'il faut savoir sur ${title.toLowerCase()} dans le contexte des traitements GLP-1 en France : mécanisme d'action, efficacité, sécurité d'emploi et recommandations médicales.

## À retenir sur ${title.toLowerCase()}

- **Indication principale** : Traitement du diabète de type 2
- **Mécanisme** : Agoniste du récepteur GLP-1
- **Prescription** : Obligatoire par médecin spécialisé
- **Suivi** : Contrôle médical régulier indispensable
- **Effets** : Amélioration glycémique et perte de poids

## Mécanisme d'action

Les agonistes du récepteur GLP-1 agissent en mimant l'action de l'hormone naturelle GLP-1 (Glucagon-Like Peptide-1). Cette hormone joue un rôle crucial dans la régulation de la glycémie et de l'appétit.

### Actions physiologiques principales

1. **Stimulation de la sécrétion d'insuline** dépendante du glucose
2. **Inhibition de la sécrétion de glucagon** quand la glycémie est élevée
3. **Ralentissement de la vidange gastrique** pour une meilleure satiété
4. **Action centrale sur l'hypothalamus** pour réduire l'appétit

## Indications thérapeutiques

### Indication principale approuvée

Le traitement est indiqué dans le **diabète de type 2** de l'adulte en complément d'un régime alimentaire et d'une activité physique pour améliorer le contrôle glycémique.

### Critères de prescription

- HbA1c insuffisamment contrôlée malgré un traitement bien conduit
- Échec ou contre-indication aux autres antidiabétiques
- Prescription par un médecin expérimenté dans ce type de traitement

## Posologie et administration

### Schéma posologique standard

- **Dose initiale** : Commencer par la plus faible dose
- **Titration progressive** : Augmentation graduelle selon tolérance
- **Dose d'entretien** : Ajustée individuellement
- **Fréquence** : Injection sous-cutanée hebdomadaire

### Modalités d'injection

1. **Sites recommandés** : Cuisse, bras, abdomen
2. **Rotation** : Changer de site à chaque injection
3. **Technique** : Injection sous-cutanée lente
4. **Horaire** : Même jour chaque semaine

## Effets secondaires et surveillance

### Effets indésirables fréquents

Les effets secondaires les plus couramment rapportés incluent :

- **Troubles gastro-intestinaux** : nausées (30-40%), vomissements, diarrhées
- **Réactions au site d'injection** : rougeur, démangeaisons
- **Hypoglycémies** : surtout en association avec d'autres antidiabétiques

### Surveillance médicale nécessaire

- **Fonction rénale** : Contrôle régulier de la créatinine
- **Glycémie** : Surveillance rapprochée en début de traitement
- **Poids corporel** : Suivi de l'évolution pondérale
- **Tolérance digestive** : Évaluation des effets gastro-intestinaux

## Contre-indications et précautions

### Contre-indications absolues

- Hypersensibilité au principe actif ou aux excipients
- Antécédents personnels ou familiaux de carcinome médullaire de la thyroïde
- Syndrome de néoplasie endocrinienne multiple de type 2
- Grossesse et allaitement

### Précautions d'emploi

- **Insuffisance rénale** : Adaptation posologique nécessaire
- **Antécédents de pancréatite** : Surveillance particulière
- **Troubles gastro-intestinaux sévères** : Contre-indication relative

## Interactions médicamenteuses

### Interactions principales

Le ralentissement de la vidange gastrique peut affecter l'absorption d'autres médicaments administrés par voie orale, notamment :

- **Contraceptifs oraux** : Prendre 1 heure avant l'injection
- **Antibiotiques** : Respecter un intervalle de temps
- **Autres antidiabétiques** : Risque d'hypoglycémie

## Conseils aux patients

### Optimisation du traitement

1. **Respect de la posologie** : Ne jamais modifier sans avis médical
2. **Alimentation équilibrée** : Maintenir une hygiène alimentaire
3. **Activité physique** : Poursuivre une activité physique régulière
4. **Surveillance des symptômes** : Signaler tout effet inhabituel

### Conservation et manipulation

- **Température** : Conserver au réfrigérateur (2-8°C)
- **Transport** : Éviter les variations de température
- **Utilisation** : Vérifier l'aspect avant injection
- **Élimination** : Utiliser les contenants de sécurité appropriés

## Conclusion médicale

Ce traitement représente une option thérapeutique efficace dans la prise en charge du diabète de type 2. Son utilisation doit toujours s'inscrire dans une approche globale incluant mesures hygiéno-diététiques et suivi médical régulier.

**Consultation médicale indispensable** avant toute initiation de traitement. Seul un professionnel de santé peut évaluer l'indication, la posologie et assurer le suivi approprié.

---

*Article rédigé par ${author} à des fins d'information médicale. Ces informations ne remplacent pas une consultation médicale personnalisée. Consultez votre médecin pour tout conseil médical.*`;
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMedicamentsContent().catch(console.error);
}

export { generateMedicamentsContent };
