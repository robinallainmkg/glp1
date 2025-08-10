import fs from 'fs';
import path from 'path';

// Plan de création d'articles selon l'analyse des collections
const articlesToCreate = {
  'glp1-diabete': [
    {
      slug: 'diabete-pied-glp1',
      title: 'diabète du pied et GLP-1',
      keywords: 'diabète pied glp1, ulcères diabétiques',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'glp1-neuropathie-diabetique',
      title: 'GLP-1 et neuropathie diabétique',
      keywords: 'glp1 neuropathie, douleurs diabète',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'diabete-retinopathie-glp1',
      title: 'diabète rétinopathie et GLP-1',
      keywords: 'rétinopathie diabétique glp1, vision',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'glp1-nephropathie',
      title: 'GLP-1 et néphropathie diabétique',
      keywords: 'néphropathie glp1, reins diabète',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'diabete-regime-glp1',
      title: 'diabète régime avec GLP-1',
      keywords: 'régime diabétique glp1, alimentation',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'glp1-auto-surveillance',
      title: 'GLP-1 et auto-surveillance glycémique',
      keywords: 'auto-surveillance glp1, lecteur glucose',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'diabete-urgence-glp1',
      title: 'diabète urgence et GLP-1',
      keywords: 'urgence diabétique glp1, hypoglycémie',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'glp1-carnet-diabetique',
      title: 'GLP-1 et carnet diabétique',
      keywords: 'carnet diabète glp1, suivi glycémique',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'diabete-sport-glp1',
      title: 'diabète sport et GLP-1',
      keywords: 'sport diabète glp1, activité physique',
      author: 'Dr. Émilie Martin'
    }
  ],
  'regime-glp1': [
    {
      slug: 'regime-paleo-glp1',
      title: 'régime paléo et GLP-1',
      keywords: 'régime paléolithique glp1, paleo diet',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'regime-mediterraneen-glp1',
      title: 'régime méditerranéen et GLP-1',
      keywords: 'régime méditerranéen glp1, crétois',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'glp1-proteines',
      title: 'GLP-1 et protéines alimentaires',
      keywords: 'protéines glp1, besoins nutritionnels',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'regime-sans-sucre-glp1',
      title: 'régime sans sucre et GLP-1',
      keywords: 'sans sucre glp1, édulcorants',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'glp1-index-glycemique',
      title: 'GLP-1 et index glycémique',
      keywords: 'index glycémique glp1, glucides',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'regime-dash-glp1',
      title: 'régime DASH et GLP-1',
      keywords: 'régime dash glp1, hypertension',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'glp1-portion-alimentaire',
      title: 'GLP-1 et portions alimentaires',
      keywords: 'portions glp1, satiété',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'regime-chrono-nutrition-glp1',
      title: 'chrono-nutrition et GLP-1',
      keywords: 'chrono-nutrition glp1, timing repas',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'glp1-micronutriments',
      title: 'GLP-1 et micronutriments',
      keywords: 'micronutriments glp1, vitamines minéraux',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'regime-detox-glp1',
      title: 'régime détox et GLP-1',
      keywords: 'détox glp1, cure détoxification',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'glp1-hydratation',
      title: 'GLP-1 et hydratation',
      keywords: 'hydratation glp1, eau quotidienne',
      author: 'Dr. Sophie Dubois'
    }
  ],
  'alternatives-glp1': [
    {
      slug: 'plantes-diabete',
      title: 'plantes anti-diabète naturelles',
      keywords: 'plantes diabète, phytothérapie glycémie',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'supplements-glp1',
      title: 'suppléments naturels type GLP-1',
      keywords: 'suppléments glp1, compléments naturels',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'homeopathie-diabete',
      title: 'homéopathie et diabète',
      keywords: 'homéopathie diabète, médecine douce',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'acupuncture-glp1',
      title: 'acupuncture pour diabète obésité',
      keywords: 'acupuncture diabète, médecine chinoise',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'meditation-glp1',
      title: 'méditation et gestion diabète',
      keywords: 'méditation diabète, stress glycémie',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'yoga-diabete',
      title: 'yoga thérapeutique diabète',
      keywords: 'yoga diabète, exercices doux',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'alternatives-bio-glp1',
      title: 'alternatives biologiques GLP-1',
      keywords: 'bio glp1, naturel biologique',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'berberine-glp1',
      title: 'berbérine alternative GLP-1',
      keywords: 'berbérine glp1, extrait naturel',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'chrome-diabete',
      title: 'chrome picolinate diabète',
      keywords: 'chrome diabète, oligo-élément',
      author: 'Dr. Émilie Martin'
    },
    {
      slug: 'cannelle-glp1',
      title: 'cannelle thérapeutique diabète',
      keywords: 'cannelle diabète, épice médicinale',
      author: 'Dr. Sophie Dubois'
    },
    {
      slug: 'vinaigre-cidre-glp1',
      title: 'vinaigre de cidre diabète',
      keywords: 'vinaigre cidre diabète, acide acétique',
      author: 'Dr. Émilie Martin'
    }
  ]
};

// Template de base pour un article
function generateArticleContent(category, article) {
  return `---
title: "${article.title}"
description: "${article.title} — Guide marché français."
author: "${article.author}"
date: 2025-08-10
keywords: "${article.keywords}"
---

**Résumé :** Cet article explique « ${article.title} » pour le marché français : prix en €, cadre ANSM, conseils pratiques.

## À retenir

[Contenu spécialisé sur ${article.title} dans le contexte du marché français avec focus sur la réglementation ANSM, les prix en euros, et les conseils pratiques adaptés.]

## Prix, disponibilité et variations en France

### Coûts et tarification
- **Prix principal** : XX-XX€/mois
- **Alternatives** : XX-XX€/mois  
- **Consultations spécialisées** : 60-80€/consultation
- **Suivi complémentaire** : XX€/mois

### Disponibilité marché français
- **Pharmacies** : Disponible sur ordonnance/conseil
- **Centres spécialisés** : Accès réglementé
- **E-commerce** : Selon réglementation
- **Délais moyens** : 2-4 semaines

## Remboursement et prise en charge (France)

### Critères remboursement
1. **Indication médicale** validée
2. **Prescription spécialisée** requise
3. **Suivi médical** obligatoire
4. **Critères HAS** respectés

### Prise en charge spécifique
- **Sécurité Sociale** : Remboursement selon indication
- **Mutuelles** : Prise en charge complémentaire variable
- **ALD** : 100% si diabète/obésité sévère
- **Aide sociale** : Dispositifs spécifiques

## Comparaison rapide (France vs autres pays)

| Pays | Disponibilité | Prix moyen | Remboursement |
|------|--------------|------------|---------------|
| **France** | Réglementée | XX€/mois | 65-100% |
| **États-Unis** | Large accès | $XX/mois | Variable |
| **Allemagne** | Encadrée | XX€/mois | GKV standard |
| **Royaume-Uni** | NHS contrôlé | NHS gratuit | NHS complet |

## Conseils pratiques

### Mise en œuvre optimale
- **Phase initiation** : Démarrage progressif supervisé
- **Surveillance** : Contrôles réguliers nécessaires
- **Adaptation** : Personnalisation selon réponse
- **Compliance** : Observance facteur clé succès

### Précautions importantes
- **Contre-indications** : Vérification préalable obligatoire
- **Interactions** : Attention médicaments concomitants
- **Effets secondaires** : Surveillance symptômes
- **Urgences** : Protocoles d'action définis

### Optimisation résultats
- **Hygiène de vie** : Alimentation exercice complémentaires
- **Suivi biologique** : Bilans réguliers programmés
- **Education thérapeutique** : Formation patient essentielle
- **Soutien psychologique** : Accompagnement si nécessaire

## Produits cosmétiques recommandés

### Soins complémentaires
- **Produits spécialisés** : Selon indication thérapeutique
- **Soins de confort** : Amélioration tolérance
- **Hygiène spécifique** : Protocoles adaptés

### Accessoires utiles
- **Matériel suivi** : Outils mesure/surveillance
- **Applications mobiles** : Aide observance
- **Documentation** : Carnets suivi personnalisés

## FAQ

### Question fréquente 1 sur ${article.title} ?
Réponse détaillée adaptée au contexte français avec références réglementaires ANSM et recommandations HAS.

### Question fréquente 2 sur l'efficacité ?
Explication basée sur données scientifiques françaises et comparaison internationale des pratiques.

### Question fréquente 3 sur la sécurité ?
Information sécurité basée pharmacovigilance française et surveillance post-marketing ANSM.

### Question fréquente 4 sur le suivi ?
Protocoles de suivi selon recommandations sociétés savantes françaises (SFD, SFE, etc.).

## Conclusion

[affiliate-box]

${article.title.charAt(0).toUpperCase() + article.title.slice(1)} représente une approche thérapeutique importante dans le contexte français. Cette option, encadrée par la réglementation ANSM, nécessite un suivi médical approprié pour optimiser bénéfices et minimiser risques. L'accompagnement professionnel guide la mise en œuvre sécurisée.

**Important :** Ces informations sont fournies à titre éducatif uniquement. Consultez toujours un professionnel de santé qualifié pour un avis médical personnalisé concernant ${article.title}.`;
}

// Fonction pour créer les fichiers
async function createArticles() {
  let totalCreated = 0;
  
  for (const [category, articles] of Object.entries(articlesToCreate)) {
    console.log(`\n🔄 Création des articles pour ${category}...`);
    
    const categoryPath = path.join('src', 'content', category);
    
    // Vérifier que le dossier existe
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
    }
    
    for (const article of articles) {
      const filePath = path.join(categoryPath, `${article.slug}.md`);
      
      // Vérifier si le fichier existe déjà
      if (fs.existsSync(filePath)) {
        console.log(`⏭️  ${article.slug}.md existe déjà`);
        continue;
      }
      
      const content = generateArticleContent(category, article);
      
      try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Créé: ${article.slug}.md`);
        totalCreated++;
      } catch (error) {
        console.error(`❌ Erreur création ${article.slug}.md:`, error.message);
      }
    }
  }
  
  console.log(`\n🎉 Création terminée! ${totalCreated} nouveaux articles créés.`);
  
  // Régénérer la base de données
  console.log('\n🔄 Régénération de la base de données...');
  const { execSync } = await import('child_process');
  try {
    execSync('node scripts/generate-database-v2.mjs', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Erreur régénération base:', error.message);
  }
}

// Exécuter la création
createArticles().catch(console.error);
