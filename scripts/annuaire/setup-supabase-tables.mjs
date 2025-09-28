import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🏗️ Création des tables manquantes dans Supabase...');

async function createMissingTables() {
    try {
        // 1. Créer la table specialties
        console.log('📋 Création de la table specialties...');
        
        const { error: specialtiesError } = await supabase.rpc('exec_sql', {
            query: `
                CREATE TABLE IF NOT EXISTS specialties (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    seo_title_template TEXT NOT NULL,
                    seo_description_template TEXT NOT NULL,
                    intro_template TEXT NOT NULL,
                    category VARCHAR(50) NOT NULL DEFAULT 'medical',
                    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
                    keywords JSONB DEFAULT '[]'::jsonb,
                    related_conditions JSONB DEFAULT '[]'::jsonb,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_specialties_slug ON specialties(slug);
                CREATE INDEX IF NOT EXISTS idx_specialties_priority ON specialties(priority DESC);
            `
        });

        if (specialtiesError) {
            console.log('ℹ️ Table specialties existe déjà ou erreur RPC:', specialtiesError.message);
        } else {
            console.log('✅ Table specialties créée');
        }

        // 2. Insérer les spécialités de base directement
        console.log('📝 Insertion des spécialités...');
        
        const specialtiesData = [
            {
                slug: 'endocrinologue-glp1',
                name: 'Endocrinologue spécialisé GLP-1',
                description: 'Endocrinologue expert dans la prescription de médicaments GLP-1 (Ozempic, Wegovy, Mounjaro) pour le diabète et l\'obésité',
                seo_title_template: '{count} Endocrinologues GLP-1 à {city} | Ozempic Wegovy Mounjaro',
                seo_description_template: 'Trouvez un endocrinologue spécialisé GLP-1 à {city}. Consultation pour Ozempic, Wegovy, Mounjaro. RDV en ligne, tarifs, avis patients.',
                intro_template: 'À {city}, {count} endocrinologues sont spécialisés dans la prescription de médicaments GLP-1 comme l\'Ozempic, le Wegovy et le Mounjaro pour le traitement du diabète de type 2 et de l\'obésité.',
                category: 'medical',
                priority: 10,
                keywords: ['ozempic', 'wegovy', 'mounjaro', 'glp-1', 'diabète', 'obésité', 'endocrinologue'],
                related_conditions: ['diabete-type-2', 'obesite', 'surpoids']
            },
            {
                slug: 'diabetologue',
                name: 'Diabétologue expert Ozempic/Wegovy',
                description: 'Diabétologue spécialisé dans le traitement du diabète avec les nouveaux médicaments GLP-1',
                seo_title_template: '{count} Diabétologues à {city} | Experts Ozempic Wegovy',
                seo_description_template: 'Consultez un diabétologue expert à {city}. Spécialistes Ozempic, Wegovy pour diabète type 2. Prise en charge complète.',
                intro_template: 'Les {count} diabétologues de {city} vous accompagnent dans la gestion de votre diabète avec les traitements GLP-1 les plus récents.',
                category: 'medical',
                priority: 9,
                keywords: ['diabétologue', 'diabète', 'ozempic', 'trulicity'],
                related_conditions: ['diabete-type-2', 'hyperglycemie']
            },
            {
                slug: 'nutritionniste-obesite',
                name: 'Nutritionniste spécialisé perte de poids',
                description: 'Nutritionniste expert en accompagnement de la perte de poids avec les traitements GLP-1',
                seo_title_template: '{count} Nutritionnistes Obésité à {city} | Accompagnement GLP-1',
                seo_description_template: 'Nutritionniste spécialisé obésité à {city}. Accompagnement perte de poids avec Ozempic, Wegovy.',
                intro_template: 'À {city}, {count} nutritionnistes accompagnent les patients sous traitement GLP-1 dans leur perte de poids.',
                category: 'nutrition',
                priority: 8,
                keywords: ['nutritionniste', 'obésité', 'perte de poids', 'wegovy'],
                related_conditions: ['obesite', 'surpoids']
            },
            {
                slug: 'medecin-perte-poids',
                name: 'Médecin amaigrissement GLP-1',
                description: 'Médecin spécialisé dans l\'amaigrissement et la prescription de médicaments GLP-1',
                seo_title_template: '{count} Médecins Perte de Poids à {city} | Traitement GLP-1',
                seo_description_template: 'Médecin spécialisé perte de poids à {city}. Prescription Ozempic, Wegovy, Mounjaro.',
                intro_template: 'Les {count} médecins spécialisés en amaigrissement de {city} proposent une prise en charge complète avec les nouveaux traitements GLP-1.',
                category: 'weight-loss',
                priority: 7,
                keywords: ['médecin', 'amaigrissement', 'mounjaro'],
                related_conditions: ['obesite', 'amaigrissement']
            },
            {
                slug: 'clinique-obesite',
                name: 'Clinique obésité et surpoids',
                description: 'Clinique spécialisée dans le traitement de l\'obésité avec approche multidisciplinaire',
                seo_title_template: '{count} Cliniques Obésité à {city} | Centre Spécialisé GLP-1',
                seo_description_template: 'Clinique spécialisée obésité à {city}. Centre expert en traitement GLP-1.',
                intro_template: 'À {city}, {count} cliniques offrent une prise en charge multidisciplinaire de l\'obésité avec les traitements GLP-1.',
                category: 'clinic',
                priority: 6,
                keywords: ['clinique', 'centre', 'obésité'],
                related_conditions: ['obesite-severe', 'suivi-medical']
            }
        ];

        const { data: insertedSpecialties, error: insertError } = await supabase
            .from('specialties')
            .upsert(specialtiesData, { onConflict: 'slug' });

        if (insertError) {
            console.error('❌ Erreur insertion specialties:', insertError);
        } else {
            console.log('✅ 5 spécialités insérées dans Supabase');
        }

        // 3. Créer la table landing_pages (si possible)
        console.log('📄 Tentative de création table landing_pages...');
        
        const { error: landingError } = await supabase.rpc('exec_sql', {
            query: `
                CREATE TABLE IF NOT EXISTS landing_pages (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    specialty_slug VARCHAR(255) NOT NULL,
                    city_id UUID,
                    url_path VARCHAR(500) UNIQUE NOT NULL,
                    seo_title VARCHAR(255) NOT NULL,
                    seo_description TEXT NOT NULL,
                    intro_text TEXT NOT NULL,
                    professional_count INTEGER DEFAULT 0,
                    is_published BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });

        if (landingError) {
            console.log('ℹ️ RPC non disponible pour landing_pages:', landingError.message);
        } else {
            console.log('✅ Table landing_pages créée');
        }

        // 4. Vérification finale
        console.log('\n🔍 Vérification des tables...');
        const tables = ['health_professionals', 'french_cities', 'specialties'];
        
        for (const table of tables) {
            const { count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            console.log(`${table}: ${count} entrées`);
        }

        console.log('\n🎉 Base de données Supabase prête pour l\'annuaire !');

    } catch (error) {
        console.error('❌ Erreur setup:', error);
    }
}

createMissingTables();
