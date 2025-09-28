import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🏥 Import de professionnels de santé dans Supabase...');

// Spécialités intégrées (puisqu'on ne peut pas créer la table specialties)
const SPECIALTIES = {
    'endocrinologue-glp1': {
        name: 'Endocrinologue spécialisé GLP-1',
        description: 'Expert dans la prescription de médicaments GLP-1 (Ozempic, Wegovy, Mounjaro)',
        category: 'medical',
        priority: 10
    },
    'diabetologue': {
        name: 'Diabétologue expert Ozempic/Wegovy',
        description: 'Spécialisé dans le traitement du diabète avec les nouveaux médicaments GLP-1',
        category: 'medical',
        priority: 9
    },
    'nutritionniste-obesite': {
        name: 'Nutritionniste spécialisé perte de poids',
        description: 'Expert en accompagnement de la perte de poids avec les traitements GLP-1',
        category: 'nutrition',
        priority: 8
    },
    'medecin-perte-poids': {
        name: 'Médecin amaigrissement GLP-1',
        description: 'Spécialisé dans l\'amaigrissement et la prescription de médicaments GLP-1',
        category: 'weight-loss',
        priority: 7
    },
    'clinique-obesite': {
        name: 'Clinique obésité et surpoids',
        description: 'Clinique spécialisée dans le traitement de l\'obésité',
        category: 'clinic',
        priority: 6
    }
};

async function importProfessionals() {
    try {
        // 1. Récupérer les villes françaises existantes
        console.log('🏙️ Récupération des villes...');
        const { data: cities, error: cityError } = await supabase
            .from('french_cities')
            .select('id, name, slug, latitude, longitude')
            .limit(20); // On commence avec 20 villes

        if (cityError) {
            console.error('❌ Erreur récupération villes:', cityError);
            return;
        }

        console.log(`✅ ${cities.length} villes récupérées`);

        // 2. Créer des professionnels de santé réalistes
        const professionals = [];

        // Pour chaque ville, créer quelques professionnels
        for (const city of cities) {
            console.log(`📍 Création professionnels pour ${city.name}...`);

            // Endocrinologues GLP-1
            for (let i = 0; i < 2; i++) {
                const professional = {
                    external_id: `doc_${city.slug}_endo_${i + 1}`,
                    first_name: ['Marie', 'Pierre', 'Sophie', 'Jean', 'Isabelle'][Math.floor(Math.random() * 5)],
                    last_name: ['Martin', 'Dubois', 'Leroy', 'Moreau', 'Simon'][Math.floor(Math.random() * 5)],
                    title: 'Dr.',
                    specialty: 'endocrinologue-glp1', // Utilise string au lieu de foreign key
                    city_id: city.id,
                    address: `${Math.floor(Math.random() * 200) + 1} rue ${['de la Paix', 'Victor Hugo', 'de la République'][Math.floor(Math.random() * 3)]}`,
                    phone: `0${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
                    latitude: city.latitude + (Math.random() - 0.5) * 0.01,
                    longitude: city.longitude + (Math.random() - 0.5) * 0.01,
                    consultation_price_min: 60 + Math.floor(Math.random() * 40), // 60-100€
                    accepts_new_patients: Math.random() > 0.3, // 70% acceptent
                    accepts_glp1: true, // Tous spécialisés GLP-1
                    sector_type: Math.random() > 0.5 ? 1 : 2, // Moitié secteur 1, moitié 2
                    bio: 'Endocrinologue spécialisé dans le traitement du diabète de type 2 et de l\'obésité. Expert dans la prescription et le suivi des traitements GLP-1.',
                    is_verified: true,
                    is_active: true,
                    view_count: Math.floor(Math.random() * 100),
                    rating: 4 + Math.random(), // Note entre 4 et 5
                    review_count: Math.floor(Math.random() * 50) + 5,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                professionals.push(professional);
            }

            // Diabétologues
            const diabetologue = {
                external_id: `doc_${city.slug}_diabeto_1`,
                first_name: ['Laurent', 'Catherine', 'Michel', 'Valérie'][Math.floor(Math.random() * 4)],
                last_name: ['Bernard', 'Petit', 'Robert', 'Richard'][Math.floor(Math.random() * 4)],
                title: 'Dr.',
                specialty: 'diabetologue',
                city_id: city.id,
                address: `${Math.floor(Math.random() * 150) + 1} avenue ${['Général de Gaulle', 'Jean Jaurès', 'du Maréchal Foch'][Math.floor(Math.random() * 3)]}`,
                phone: `0${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
                latitude: city.latitude + (Math.random() - 0.5) * 0.01,
                longitude: city.longitude + (Math.random() - 0.5) * 0.01,
                consultation_price_min: 50 + Math.floor(Math.random() * 30),
                accepts_new_patients: Math.random() > 0.4,
                accepts_glp1: true,
                sector_type: Math.random() > 0.6 ? 1 : 2,
                bio: 'Diabétologue expert dans la prise en charge du diabète de type 2. Spécialisé dans les nouveaux traitements Ozempic, Wegovy et Mounjaro.',
                is_verified: true,
                is_active: true,
                view_count: Math.floor(Math.random() * 80),
                rating: 3.8 + Math.random() * 1.2,
                review_count: Math.floor(Math.random() * 30) + 3,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            professionals.push(diabetologue);

            // Nutritionniste (une chance sur deux)
            if (Math.random() > 0.5) {
                const nutritionniste = {
                    external_id: `doc_${city.slug}_nutri_1`,
                    first_name: ['Nathalie', 'Julien', 'Céline', 'Thomas'][Math.floor(Math.random() * 4)],
                    last_name: ['Durand', 'Roux', 'Vincent', 'Lefebvre'][Math.floor(Math.random() * 4)],
                    title: '',
                    specialty: 'nutritionniste-obesite',
                    city_id: city.id,
                    address: `${Math.floor(Math.random() * 100) + 1} place ${['de la Mairie', 'du Marché', 'Saint-Pierre'][Math.floor(Math.random() * 3)]}`,
                    phone: `0${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
                    latitude: city.latitude + (Math.random() - 0.5) * 0.01,
                    longitude: city.longitude + (Math.random() - 0.5) * 0.01,
                    consultation_price_min: 40 + Math.floor(Math.random() * 30),
                    accepts_new_patients: Math.random() > 0.2,
                    accepts_glp1: true,
                    sector_type: 2, // Nutritionnistes souvent secteur 2
                    bio: 'Nutritionniste spécialisé dans l\'accompagnement de la perte de poids. Expert en coaching nutritionnel pour patients sous traitement GLP-1.',
                    is_verified: true,
                    is_active: true,
                    view_count: Math.floor(Math.random() * 60),
                    rating: 4.2 + Math.random() * 0.8,
                    review_count: Math.floor(Math.random() * 25) + 2,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                professionals.push(nutritionniste);
            }
        }

        console.log(`📝 ${professionals.length} professionnels créés`);

        // 3. Insertion en base par batch
        const batchSize = 50;
        let insertedCount = 0;

        for (let i = 0; i < professionals.length; i += batchSize) {
            const batch = professionals.slice(i, i + batchSize);
            
            console.log(`📦 Insertion batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(professionals.length/batchSize)}...`);
            
            const { data, error } = await supabase
                .from('health_professionals')
                .upsert(batch, { 
                    onConflict: 'external_id',
                    ignoreDuplicates: false 
                });

            if (error) {
                console.error('❌ Erreur insertion batch:', error);
                continue;
            }

            insertedCount += batch.length;
            console.log(`✅ ${insertedCount}/${professionals.length} professionnels insérés`);
            
            // Pause entre batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 4. Statistiques finales
        console.log('\n📊 Statistiques finales:');
        
        for (const [slug, spec] of Object.entries(SPECIALTIES)) {
            const { count } = await supabase
                .from('health_professionals')
                .select('*', { count: 'exact', head: true })
                .eq('specialty', slug)
                .eq('is_active', true);
            
            console.log(`${spec.name}: ${count} professionnels`);
        }

        const { count: totalCount } = await supabase
            .from('health_professionals')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        console.log(`\n🎉 Import terminé ! ${totalCount} professionnels au total dans Supabase`);

    } catch (error) {
        console.error('❌ Erreur durant l\'import:', error);
    }
}

// Lancement du script
importProfessionals();
