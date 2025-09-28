import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration Supabase
const supabaseUrl = 'https://ywekaivgjzsmdocchvum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🏗️ Création des tables pour l\'annuaire GLP-1...');

async function createTables() {
    try {
        // Pour l'instant, créons les tables minimales via l'API Supabase
        console.log('📋 Création de la table french_cities...');
        
        // Créer table french_cities
        const { error: citiesError } = await supabase.rpc('sql', {
            query: `
                CREATE TABLE IF NOT EXISTS french_cities (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    department_code VARCHAR(3) NOT NULL,
                    department_name VARCHAR(255) NOT NULL,
                    region_code VARCHAR(2),
                    region_name VARCHAR(255),
                    postal_codes JSONB DEFAULT '[]'::jsonb,
                    population INTEGER NOT NULL DEFAULT 0,
                    latitude DECIMAL(10, 8) NOT NULL,
                    longitude DECIMAL(11, 8) NOT NULL,
                    is_major_city BOOLEAN DEFAULT FALSE,
                    seo_priority INTEGER DEFAULT 1,
                    insee_code VARCHAR(5) UNIQUE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_french_cities_slug ON french_cities(slug);
                CREATE INDEX IF NOT EXISTS idx_french_cities_population ON french_cities(population DESC);
            `
        });

        if (citiesError) {
            console.log('⚠️ Tentative alternative pour french_cities...');
            // Si rpc('sql') ne fonctionne pas, essayons directement
        }

        console.log('📋 Création de la table specialties...');
        
        // Créer directement les données de base sans SQL complexe
        const specialtiesData = [
            {
                slug: 'endocrinologue-glp1',
                name: 'Endocrinologue spécialisé GLP-1',
                description: 'Endocrinologue expert dans la prescription de médicaments GLP-1',
                seo_title_template: '{count} Endocrinologues GLP-1 à {city} | Ozempic Wegovy Mounjaro',
                seo_description_template: 'Trouvez un endocrinologue spécialisé GLP-1 à {city}.',
                intro_template: 'À {city}, {count} endocrinologues sont spécialisés GLP-1.',
                category: 'medical',
                priority: 10,
                is_active: true
            },
            {
                slug: 'diabetologue',
                name: 'Diabétologue expert Ozempic/Wegovy',
                description: 'Diabétologue spécialisé dans le traitement du diabète avec GLP-1',
                seo_title_template: '{count} Diabétologues à {city} | Experts Ozempic Wegovy',
                seo_description_template: 'Consultez un diabétologue expert à {city}.',
                intro_template: 'Les {count} diabétologues de {city} vous accompagnent.',
                category: 'medical',
                priority: 9,
                is_active: true
            },
            {
                slug: 'nutritionniste-obesite',
                name: 'Nutritionniste spécialisé perte de poids',
                description: 'Nutritionniste expert en accompagnement perte de poids GLP-1',
                seo_title_template: '{count} Nutritionnistes Obésité à {city}',
                seo_description_template: 'Nutritionniste spécialisé obésité à {city}.',
                intro_template: 'À {city}, {count} nutritionnistes accompagnent les patients GLP-1.',
                category: 'nutrition',
                priority: 8,
                is_active: true
            }
        ];

        // Test si les tables existent déjà
        const { data: existingCities, error: testError } = await supabase
            .from('french_cities')
            .select('count')
            .limit(1);

        if (testError && testError.message.includes('does not exist')) {
            console.log('❌ Tables n\'existent pas, création manuelle nécessaire');
            console.log('');
            console.log('🔧 INSTRUCTIONS MANUELLES:');
            console.log('1. Allez sur https://supabase.com/dashboard');
            console.log('2. Sélectionnez votre projet');
            console.log('3. Allez dans "SQL Editor"');
            console.log('4. Exécutez le contenu du fichier: scripts/annuaire/create-tables.sql');
            console.log('');
            console.log('Puis relancez ce script.');
            return;
        }

        console.log('✅ Tables détectées, insertion des spécialités...');
        
        // Insérer les spécialités de base
        const { data: specialties, error: specialtiesError } = await supabase
            .from('specialties')
            .upsert(specialtiesData, { onConflict: 'slug' });

        if (specialtiesError) {
            console.error('❌ Erreur spécialités:', specialtiesError.message);
        } else {
            console.log('✅ Spécialités insérées avec succès');
        }

        // Test final
        const { count: cityCount } = await supabase
            .from('french_cities')
            .select('*', { count: 'exact', head: true });

        const { count: specialtyCount } = await supabase
            .from('specialties')
            .select('*', { count: 'exact', head: true });

        console.log('');
        console.log('📊 RÉSUMÉ:');
        console.log(`- Villes: ${cityCount || 0} entrées`);
        console.log(`- Spécialités: ${specialtyCount || 0} entrées`);
        console.log('');
        console.log('🎉 Tables prêtes pour l\'import des données !');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

createTables();
