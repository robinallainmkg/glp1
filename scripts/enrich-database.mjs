import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (utilise vos vraies clés existantes)
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// 🏥 DONNÉES PROFESSIONNELS SUPPLÉMENTAIRES RÉALISTES
const additionalProfessionals = [
  {
    first_name: 'Marie',
    last_name: 'Dupont',
    title: 'Dr.',
    specialty: 'Endocrinologie',
    sub_specialties: ['Diabétologie', 'Thyroïde', 'Obésité'],
    hospital_clinic: 'Hôpital Saint-Louis',
    address: '1 Avenue Claude Vellefaux',
    postal_code: '75010',
    phone: '01 42 49 49 49',
    email: 'marie.dupont@saintlouis.aphp.fr',
    accepts_glp1: true,
    accepts_new_patients: true,
    consultation_fee: 80,
    languages: ['Français', 'Anglais'],
    bio: 'Spécialiste en endocrinologie avec 15 ans d\'expérience dans le traitement du diabète et de l\'obésité. Expert en prescription de traitements GLP-1 (Ozempic, Wegovy).',
    certifications: ['DESC Endocrinologie', 'DU Diabétologie'],
    education: ['Faculté de Médecine Paris 7', 'Internat Paris'],
    experience_years: 15,
    verified: true,
    featured: true
  },
  {
    first_name: 'Jean',
    last_name: 'Martin',
    title: 'Dr.',
    specialty: 'Nutrition',
    sub_specialties: ['Obésité', 'Diabète', 'Troubles métaboliques'],
    hospital_clinic: 'Clinique de la Nutrition',
    address: '25 Rue de la Santé',
    postal_code: '75014',
    phone: '01 43 21 12 34',
    email: 'j.martin@nutrition-paris.fr',
    website: 'https://nutrition-paris.fr',
    accepts_glp1: true,
    accepts_new_patients: false,
    consultation_fee: 90,
    languages: ['Français'],
    bio: 'Nutritionniste spécialisé dans l\'accompagnement des patients sous traitement GLP-1. Approche personnalisée pour optimiser l\'efficacité du traitement.',
    certifications: ['DESC Nutrition', 'DU Obésité'],
    education: ['Faculté de Médecine Lyon'],
    experience_years: 12,
    verified: true,
    featured: false
  },
  {
    first_name: 'Sophie',
    last_name: 'Bernard',
    title: 'Dr.',
    specialty: 'Diabétologie',
    sub_specialties: ['Diabète type 2', 'Insulinothérapie', 'GLP-1'],
    hospital_clinic: 'Centre Hospitalier Universitaire',
    address: '5 Rue du Professeur Grillot',
    postal_code: '69500',
    phone: '04 72 11 22 33',
    email: 's.bernard@chu-lyon.fr',
    accepts_glp1: true,
    accepts_new_patients: true,
    consultation_fee: 75,
    languages: ['Français', 'Anglais', 'Espagnol'],
    bio: 'Diabétologue expérimentée, spécialiste des nouvelles thérapies dont les agonistes GLP-1. Suivi personnalisé et éducation thérapeutique.',
    certifications: ['DESC Diabétologie', 'DU Éducation thérapeutique'],
    education: ['Faculté de Médecine Lyon', 'Fellowship Harvard'],
    experience_years: 18,
    verified: true,
    featured: true
  },
  {
    first_name: 'Pierre',
    last_name: 'Durand',
    title: 'Dr.',
    specialty: 'Médecine générale',
    sub_specialties: ['Diabète', 'Obésité', 'Prévention'],
    hospital_clinic: 'Cabinet médical privé',
    address: '12 Boulevard de la République',
    postal_code: '13001',
    phone: '04 91 55 44 33',
    email: 'contact@dr-durand-marseille.fr',
    website: 'https://dr-durand-marseille.fr',
    accepts_glp1: true,
    accepts_new_patients: true,
    consultation_fee: 25,
    languages: ['Français'],
    bio: 'Médecin généraliste formé aux traitements anti-obésité dont les GLP-1. Approche globale de la prise en charge du surpoids.',
    certifications: ['DU Obésité', 'Formation GLP-1'],
    education: ['Faculté de Médecine Marseille'],
    experience_years: 8,
    verified: true,
    featured: false
  },
  {
    first_name: 'Anne',
    last_name: 'Rousseau',
    title: 'Dr.',
    specialty: 'Endocrinologie',
    sub_specialties: ['Obésité', 'Troubles hormonaux', 'GLP-1'],
    hospital_clinic: 'Clinique Saint-Georges',
    address: '8 Rue Saint-Georges',
    postal_code: '31000',
    phone: '05 61 22 33 44',
    email: 'anne.rousseau@endocrino-toulouse.fr',
    accepts_glp1: true,
    accepts_new_patients: true,
    consultation_fee: 85,
    languages: ['Français', 'Anglais'],
    bio: 'Endocrinologue spécialisée dans le traitement de l\'obésité. Large expérience avec Ozempic, Wegovy et autres agonistes GLP-1.',
    certifications: ['DESC Endocrinologie', 'DU Obésité sévère'],
    education: ['Faculté de Médecine Toulouse'],
    experience_years: 14,
    verified: true,
    featured: true
  }
];

// 📝 AVIS PATIENTS RÉALISTES
const sampleReviews = [
  {
    rating: 5,
    comment: 'Excellent médecin, très à l\'écoute. Le traitement GLP-1 a vraiment changé ma vie. J\'ai perdu 15kg en 6 mois avec un suivi parfait.',
    patient_name: 'Sophie M.'
  },
  {
    rating: 4,
    comment: 'Très professionnel, explique bien les traitements. Le suivi avec Ozempic est régulier et efficace. Recommande vivement.',
    patient_name: 'Marc D.'
  },
  {
    rating: 5,
    comment: 'Suivi parfait, résultats impressionnants avec Wegovy. Docteur très compétent qui prend le temps d\'expliquer. Merci !',
    patient_name: 'Catherine L.'
  },
  {
    rating: 4,
    comment: 'Bon accompagnement dans la prescription de GLP-1. Quelques effets secondaires au début mais bien gérés par le médecin.',
    patient_name: 'Thomas R.'
  },
  {
    rating: 5,
    comment: 'Expertise remarquable en diabétologie. Le traitement combiné insuline + GLP-1 a stabilisé mon diabète. Excellent !',
    patient_name: 'Françoise B.'
  },
  {
    rating: 4,
    comment: 'Médecin à l\'écoute, cabinet bien organisé. Prescription d\'Ozempic avec suivi nutritionnel. Très satisfait du résultat.',
    patient_name: 'Philippe G.'
  }
];

// 🏙️ FONCTION D'ENRICHISSEMENT PRINCIPALE
async function enrichDatabase() {
  console.log('🚀 Début de l\'enrichissement de la base de données annuaire professionnels...');
  console.log('📊 Configuration Supabase:', supabaseUrl);
  
  try {
    // 1. Vérification de la connexion Supabase
    console.log('🔗 Test de connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('french_cities')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur connexion Supabase:', testError.message);
      console.log('💡 Vérifiez que les tables ont été créées avec create-professionals-tables.sql');
      return;
    }
    
    console.log('✅ Connexion Supabase réussie');
    
    // 2. Récupérer les villes existantes
    console.log('📍 Récupération des villes françaises...');
    const { data: cities, error: citiesError } = await supabase
      .from('french_cities')
      .select('id, name, slug, postal_code, department')
      .order('name')
      .limit(20); // Limiter pour éviter la surcharge
    
    if (citiesError) {
      console.error('❌ Erreur récupération villes:', citiesError.message);
      console.log('💡 Exécutez d\'abord seed-french-cities.sql dans Supabase');
      return;
    }
    
    if (!cities || cities.length === 0) {
      console.log('⚠️ Aucune ville trouvée. Exécutez seed-french-cities.sql d\'abord.');
      return;
    }
    
    console.log(`✅ ${cities.length} villes trouvées`);
    cities.slice(0, 5).forEach(city => {
      console.log(`   - ${city.name} (${city.postal_code}) - ${city.department}`);
    });
    
    // 3. Vérifier les professionnels existants
    console.log('👨‍⚕️ Vérification des professionnels existants...');
    const { data: existingProfs, error: existingError } = await supabase
      .from('health_professionals')
      .select('id, first_name, last_name, city_id')
      .limit(5);
    
    if (existingError) {
      console.error('❌ Erreur vérification professionnels:', existingError.message);
      return;
    }
    
    console.log(`📊 ${existingProfs?.length || 0} professionnels déjà présents`);
    
    // 4. Ajouter des professionnels dans chaque ville majeure
    let addedProfessionals = 0;
    const majorCities = cities.slice(0, 10); // Top 10 villes
    
    for (const city of majorCities) {
      console.log(`🏥 Ajout de professionnels pour ${city.name}...`);
      
      for (const [index, professional] of additionalProfessionals.entries()) {
        // Personnaliser l'adresse selon la ville
        const customizedProfessional = {
          ...professional,
          city_id: city.id,
          postal_code: city.postal_code,
          address: `${index + 10} ${professional.address.split(' ').slice(1).join(' ')}`,
          // Varier légèrement les tarifs selon les villes
          consultation_fee: professional.consultation_fee + (Math.random() * 20 - 10),
          phone: professional.phone.replace('01', city.postal_code.startsWith('75') ? '01' : 
                                                   city.postal_code.startsWith('69') ? '04' : 
                                                   city.postal_code.startsWith('13') ? '04' : '05')
        };
        
        // Vérifier que le professionnel n'existe pas déjà
        const { data: existing } = await supabase
          .from('health_professionals')
          .select('id')
          .eq('last_name', professional.last_name)
          .eq('city_id', city.id)
          .single();
        
        if (!existing) {
          const { data, error } = await supabase
            .from('health_professionals')
            .insert([customizedProfessional])
            .select()
            .single();
          
          if (error) {
            console.error(`❌ Erreur ajout Dr. ${professional.last_name} à ${city.name}:`, error.message);
          } else {
            console.log(`✅ Ajouté: Dr. ${professional.last_name} (${professional.specialty}) à ${city.name}`);
            addedProfessionals++;
          }
        } else {
          console.log(`⚠️ Dr. ${professional.last_name} existe déjà à ${city.name}`);
        }
      }
    }
    
    // 5. Ajouter des avis d'exemple
    console.log('⭐ Ajout d\'avis patients...');
    
    const { data: allProfessionals, error: profError } = await supabase
      .from('health_professionals')
      .select('id, first_name, last_name, specialty')
      .limit(15);
    
    if (!profError && allProfessionals && allProfessionals.length > 0) {
      let addedReviews = 0;
      
      for (const prof of allProfessionals) {
        // Ajouter 2-4 avis par professionnel
        const reviewCount = Math.floor(Math.random() * 3) + 2;
        const selectedReviews = sampleReviews
          .sort(() => 0.5 - Math.random())
          .slice(0, reviewCount);
        
        for (const review of selectedReviews) {
          // Vérifier que l'avis n'existe pas déjà
          const { data: existingReview } = await supabase
            .from('professional_reviews')
            .select('id')
            .eq('professional_id', prof.id)
            .eq('patient_name', review.patient_name)
            .single();
          
          if (!existingReview) {
            const { error: reviewError } = await supabase
              .from('professional_reviews')
              .insert([{
                ...review,
                professional_id: prof.id,
                verified: true
              }]);
            
            if (!reviewError) {
              addedReviews++;
            }
          }
        }
      }
      
      console.log(`✅ ${addedReviews} avis ajoutés`);
    }
    
    // 6. Statistiques finales
    console.log('📊 Calcul des statistiques finales...');
    
    const { data: finalStats } = await supabase
      .from('health_professionals')
      .select('id', { count: 'exact' });
    
    const { data: reviewStats } = await supabase
      .from('professional_reviews')
      .select('id', { count: 'exact' });
    
    const { data: cityStats } = await supabase
      .from('french_cities')
      .select('id', { count: 'exact' });
    
    // 7. Test de recherche
    console.log('🔍 Test de recherche...');
    const { data: searchTest } = await supabase
      .from('health_professionals')
      .select(`
        id, first_name, last_name, specialty,
        french_cities!inner(name, slug)
      `)
      .eq('accepts_glp1', true)
      .limit(3);
    
    // 8. Résultats finaux
    console.log('\n🎉 ENRICHISSEMENT TERMINÉ AVEC SUCCÈS !');
    console.log('==========================================');
    console.log(`🏙️ Villes dans la base: ${cityStats?.length || 0}`);
    console.log(`👨‍⚕️ Total professionnels: ${finalStats?.length || 0}`);
    console.log(`⭐ Total avis: ${reviewStats?.length || 0}`);
    console.log(`🆕 Professionnels ajoutés: ${addedProfessionals}`);
    console.log('');
    
    if (searchTest && searchTest.length > 0) {
      console.log('🔍 Exemple de recherche GLP-1:');
      searchTest.forEach(prof => {
        console.log(`   - Dr. ${prof.first_name} ${prof.last_name} (${prof.specialty})`);
      });
    }
    
    console.log('\n✨ PROCHAINES ÉTAPES:');
    console.log('1. Testez l\'annuaire: npm run dev');
    console.log('2. Allez sur: http://localhost:3000/annuaire-professionnels');
    console.log('3. Vérifiez les données dans Supabase Dashboard');
    console.log('');
    console.log('🚀 Votre annuaire professionnel est maintenant opérationnel !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.log('\n💡 SOLUTIONS POSSIBLES:');
    console.log('1. Vérifiez vos variables d\'environnement Supabase');
    console.log('2. Exécutez d\'abord les scripts SQL dans Supabase Dashboard');
    console.log('3. Vérifiez les permissions de votre clé API');
  }
}

// 🚀 EXÉCUTION DU SCRIPT
console.log('🎯 SCRIPT D\'ENRICHISSEMENT ANNUAIRE PROFESSIONNELS GLP-1');
console.log('======================================================');
enrichDatabase();
