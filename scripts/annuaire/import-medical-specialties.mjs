import 'dotenv/config';
#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Spécialités médicales prioritaires avec templates SEO
 */
const medicalSpecialties = [
  {
    slug: 'endocrinologue-glp1',
    name: 'Endocrinologue spécialisé GLP-1',
    display_name: 'Endocrinologue GLP-1',
    description: 'Médecin spécialisé dans les troubles hormonaux et la prescription de médicaments GLP-1 (Ozempic, Wegovy, Mounjaro) pour le diabète et l\'obésité.',
    keywords: ['endocrinologue', 'glp1', 'ozempic', 'wegovy', 'mounjaro', 'diabète', 'obésité'],
    doctolib_specialty: 'endocrinologue',
    seo_priority: 10,
    is_primary: true,
    
    // Templates SEO
    page_title_template: '{count} Endocrinologues GLP-1 à {city} | Ozempic Wegovy Mounjaro',
    meta_description_template: 'Trouvez un endocrinologue spécialisé GLP-1 à {city}. Consultation pour Ozempic, Wegovy, Mounjaro. RDV en ligne, tarifs, avis patients.',
    h1_template: '{count} Endocrinologues spécialisés GLP-1 à {city}',
    
    intro_template: `À {city}, {count} endocrinologues sont spécialisés dans la prescription de médicaments GLP-1 comme l'Ozempic, le Wegovy et le Mounjaro pour le traitement du diabète de type 2 et de l'obésité. Le délai moyen pour obtenir un rendez-vous est de {avg_wait_time} jours.`,
    
    faq_templates: [
      {
        question: 'Combien coûte une consultation endocrinologue à {city} ?',
        answer: 'Le tarif d\'une consultation d\'endocrinologie à {city} varie entre {price_min}€ et {price_max}€. Les consultations en secteur 1 sont remboursées à 70% par la Sécurité Sociale.'
      },
      {
        question: 'Quels endocrinologues prescrivent Ozempic à {city} ?',
        answer: 'Les {count} endocrinologues référencés à {city} peuvent prescrire l\'Ozempic selon votre profil médical. Une consultation préalable est nécessaire pour évaluer l\'indication.'
      },
      {
        question: 'Délai pour un RDV endocrinologue à {city} ?',
        answer: 'Le délai moyen pour obtenir un rendez-vous avec un endocrinologue à {city} est de {avg_wait_time} jours. Certains praticiens proposent des créneaux d\'urgence.'
      }
    ]
  },
  
  {
    slug: 'diabetologue',
    name: 'Diabétologue expert Ozempic/Wegovy',
    display_name: 'Diabétologue',
    description: 'Médecin spécialisé dans la prise en charge du diabète et des complications métaboliques, expert en traitements GLP-1.',
    keywords: ['diabétologue', 'diabète', 'ozempic', 'glycémie', 'insuline'],
    doctolib_specialty: 'diabetologue',
    seo_priority: 9,
    is_primary: true,
    
    page_title_template: '{count} Diabétologues à {city} | Ozempic Victoza Trulicity',
    meta_description_template: 'Consultez un diabétologue à {city}. Spécialistes du diabète type 1 et 2, prescription Ozempic, suivi glycémique personnalisé.',
    h1_template: '{count} Diabétologues experts à {city}',
    
    intro_template: `{count} diabétologues exercent à {city} pour le suivi et traitement du diabète de type 1 et 2. Ces spécialistes peuvent prescrire les nouveaux traitements GLP-1 et assurent un suivi personnalisé de votre glycémie.`,
    
    faq_templates: [
      {
        question: 'Quand consulter un diabétologue à {city} ?',
        answer: 'Il est recommandé de consulter un diabétologue à {city} en cas de diabète mal équilibré, complications, ou pour l\'initiation de nouveaux traitements comme l\'Ozempic.'
      }
    ]
  },
  
  {
    slug: 'nutritionniste-obesite',
    name: 'Nutritionniste spécialisé perte de poids',
    display_name: 'Nutritionniste Obésité',
    description: 'Diététicien-nutritionniste spécialisé dans la prise en charge de l\'obésité et l\'accompagnement des patients sous GLP-1.',
    keywords: ['nutritionniste', 'obésité', 'perte de poids', 'régime', 'diététicien'],
    doctolib_specialty: 'nutritionniste',
    seo_priority: 8,
    is_primary: true,
    
    page_title_template: '{count} Nutritionnistes Obésité à {city} | Perte de Poids GLP-1',
    meta_description_template: 'Nutritionnistes spécialisés obésité à {city}. Accompagnement perte de poids, suivi patients sous GLP-1, régimes personnalisés.',
    h1_template: '{count} Nutritionnistes spécialisés obésité à {city}',
    
    intro_template: `{count} nutritionnistes à {city} sont spécialisés dans la prise en charge de l\'obésité et l\'accompagnement nutritionnel des patients sous traitements GLP-1. Un suivi personnalisé vous aide à optimiser votre perte de poids.`,
    
    faq_templates: [
      {
        question: 'Quel régime avec Ozempic à {city} ?',
        answer: 'Les nutritionnistes de {city} recommandent un régime équilibré, riche en protéines et fibres, adapté aux effets de l\'Ozempic pour optimiser la perte de poids.'
      }
    ]
  },
  
  {
    slug: 'medecin-perte-poids',
    name: 'Médecin amaigrissement GLP-1',
    display_name: 'Médecin Perte de Poids',
    description: 'Médecin généraliste ou spécialiste formé à la prise en charge médicale de l\'obésité et prescription de GLP-1.',
    keywords: ['médecin', 'perte de poids', 'amaigrissement', 'obésité', 'wegovy'],
    doctolib_specialty: 'medecin-generaliste',
    seo_priority: 7,
    is_primary: true,
    
    page_title_template: '{count} Médecins Perte de Poids à {city} | Wegovy Saxenda',
    meta_description_template: 'Médecins spécialisés perte de poids à {city}. Prescription Wegovy, Saxenda, suivi médical personnalisé pour maigrir durablement.',
    h1_template: '{count} Médecins spécialisés perte de poids à {city}',
    
    intro_template: `{count} médecins à {city} sont formés à la prise en charge médicale de l\'obésité. Ils peuvent prescrire Wegovy, Saxenda et autres traitements pour une perte de poids durable et sécurisée.`,
    
    faq_templates: [
      {
        question: 'Qui peut prescrire Wegovy à {city} ?',
        answer: 'Les médecins généralistes et spécialistes formés à l\'obésité peuvent prescrire Wegovy à {city} après évaluation de votre IMC et facteurs de risque.'
      }
    ]
  },
  
  {
    slug: 'clinique-obesite',
    name: 'Clinique obésité et surpoids',
    display_name: 'Clinique Obésité',
    description: 'Centre médical spécialisé dans la prise en charge globale de l\'obésité : consultation, chirurgie, suivi nutritionnel.',
    keywords: ['clinique', 'obésité', 'chirurgie bariatrique', 'sleeve', 'bypass'],
    doctolib_specialty: 'clinique',
    seo_priority: 6,
    is_primary: false,
    
    page_title_template: '{count} Cliniques Obésité à {city} | Chirurgie Bariatrique',
    meta_description_template: 'Cliniques spécialisées obésité à {city}. Chirurgie bariatrique, sleeve, bypass, suivi post-opératoire, équipes multidisciplinaires.',
    h1_template: '{count} Cliniques spécialisées obésité à {city}',
    
    intro_template: `{count} cliniques à {city} proposent une prise en charge globale de l\'obésité : consultations spécialisées, chirurgie bariatrique, suivi nutritionnel et psychologique par des équipes multidisciplinaires.`,
    
    faq_templates: [
      {
        question: 'Quand envisager la chirurgie bariatrique à {city} ?',
        answer: 'La chirurgie bariatrique est envisagée à {city} pour un IMC > 40 ou > 35 avec comorbidités, après échec des traitements médicaux incluant les GLP-1.'
      }
    ]
  }
];

/**
 * Import des spécialités médicales dans Supabase
 */
async function importMedicalSpecialties() {
  console.log('🏥 IMPORT DES SPÉCIALITÉS MÉDICALES - PHASE 1.2\n');
  console.log('🚀 Début de l\'import des spécialités...');
  
  try {
    // Ajout des timestamps
    const specialtiesWithTimestamps = medicalSpecialties.map(specialty => ({
      ...specialty,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert avec upsert pour éviter les doublons
    const { data, error } = await supabase
      .from('specialties')
      .upsert(specialtiesWithTimestamps, { 
        onConflict: 'slug',
        ignoreDuplicates: false 
      });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ ${medicalSpecialties.length} spécialités insérées avec succès`);
    
    // Affichage des spécialités importées
    console.log('\n📋 SPÉCIALITÉS IMPORTÉES:');
    medicalSpecialties.forEach((specialty, index) => {
      console.log(`${index + 1}. ${specialty.name} (${specialty.slug})`);
      console.log(`   • Priorité SEO: ${specialty.seo_priority}`);
      console.log(`   • Doctolib: ${specialty.doctolib_specialty}`);
      console.log(`   • Primary: ${specialty.is_primary ? '✅' : '❌'}`);
      console.log('');
    });
    
    // Statistiques
    const primaryCount = medicalSpecialties.filter(s => s.is_primary).length;
    const avgPriority = (medicalSpecialties.reduce((sum, s) => sum + s.seo_priority, 0) / medicalSpecialties.length).toFixed(1);
    
    console.log('📊 STATISTIQUES:');
    console.log(`• Spécialités primaires: ${primaryCount}/${medicalSpecialties.length}`);
    console.log(`• Priorité SEO moyenne: ${avgPriority}/10`);
    console.log(`• Templates FAQ total: ${medicalSpecialties.reduce((sum, s) => sum + s.faq_templates.length, 0)}`);
    
    return { success: true, count: medicalSpecialties.length };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import des spécialités:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Vérification et validation des spécialités
 */
async function validateSpecialties() {
  console.log('\n🔍 Validation des spécialités...');
  
  try {
    const { data: specialties, error } = await supabase
      .from('specialties')
      .select('*')
      .order('seo_priority', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ ${specialties.length} spécialités trouvées dans la base`);
    
    // Vérifications
    const validations = [
      {
        check: 'Slugs uniques',
        passed: new Set(specialties.map(s => s.slug)).size === specialties.length
      },
      {
        check: 'Templates SEO présents',
        passed: specialties.every(s => s.page_title_template && s.meta_description_template)
      },
      {
        check: 'Au moins 3 spécialités primaires',
        passed: specialties.filter(s => s.is_primary).length >= 3
      },
      {
        check: 'Keywords définis',
        passed: specialties.every(s => s.keywords && s.keywords.length > 0)
      }
    ];
    
    console.log('\n✅ VALIDATIONS:');
    validations.forEach(validation => {
      console.log(`${validation.passed ? '✅' : '❌'} ${validation.check}`);
    });
    
    const allPassed = validations.every(v => v.passed);
    
    if (allPassed) {
      console.log('\n🎉 Toutes les validations sont passées !');
    } else {
      console.log('\n⚠️  Certaines validations ont échoué');
    }
    
    return { success: allPassed, validations };
    
  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error);
    return { success: false, error: error.message };
  }
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await importMedicalSpecialties();
  
  if (result.success) {
    await validateSpecialties();
    
    console.log('\n🎉 Import des spécialités terminé avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('   • npm run scrape:doctolib (Phase 2.1)');
    console.log('   • npm run generate:landing-pages (Phase 3)');
    
  } else {
    console.log('\n💥 L\'import a échoué. Vérifiez les logs ci-dessus.');
    process.exit(1);
  }
}

export { importMedicalSpecialties, medicalSpecialties, validateSpecialties };
