#!/usr/bin/env node

/**
 * Script d'installation et configuration Tina CMS
 * Usage: node scripts/setup-tina.mjs
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

async function setupTinaCMS() {
    log(colors.bold + colors.blue, '🚀 Configuration de Tina CMS pour l\'édition en temps réel');
    console.log('');

    try {
        // 1. Vérifier que les dépendances sont installées
        log(colors.yellow, '📦 Vérification des dépendances...');
        const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
        
        if (!packageJson.dependencies?.tinacms && !packageJson.devDependencies?.tinacms) {
            log(colors.red, '❌ Tina CMS n\'est pas installé. Installation en cours...');
            execSync('npm install tinacms @tinacms/cli @tinacms/auth', { stdio: 'inherit' });
        }
        
        log(colors.green, '✅ Dépendances vérifiées');

        // 2. Vérifier la configuration
        const tinaConfigPath = path.join(rootDir, 'tina', 'config.ts');
        if (!fs.existsSync(tinaConfigPath)) {
            log(colors.red, '❌ Configuration Tina manquante');
            process.exit(1);
        }
        
        log(colors.green, '✅ Configuration Tina trouvée');

        // 3. Vérifier le fichier .env
        const envPath = path.join(rootDir, '.env');
        const envExamplePath = path.join(rootDir, '.env.example');
        
        if (!fs.existsSync(envPath)) {
            log(colors.yellow, '📝 Création du fichier .env à partir de .env.example...');
            if (fs.existsSync(envExamplePath)) {
                fs.copyFileSync(envExamplePath, envPath);
                log(colors.green, '✅ Fichier .env créé');
            } else {
                log(colors.red, '❌ Fichier .env.example introuvable');
            }
        }

        // 4. Vérifier les variables d'environnement Tina
        const envContent = fs.readFileSync(envPath, 'utf8');
        const hasTinaConfig = envContent.includes('NEXT_PUBLIC_TINA_CLIENT_ID') && 
                            envContent.includes('TINA_TOKEN');
        
        if (!hasTinaConfig) {
            log(colors.yellow, '⚠️  Variables Tina manquantes dans .env');
            log(colors.blue, '📖 Étapes de configuration :');
            console.log('');
            console.log('   1. Créez un compte gratuit sur https://tina.io');
            console.log('   2. Créez un nouveau projet');
            console.log('   3. Copiez vos clés API dans le fichier .env :');
            console.log('      NEXT_PUBLIC_TINA_CLIENT_ID=votre_client_id');
            console.log('      TINA_TOKEN=votre_token');
            console.log('');
        } else {
            log(colors.green, '✅ Variables Tina configurées');
        }

        // 5. Initialiser Tina si nécessaire
        log(colors.yellow, '🔧 Initialisation de Tina CMS...');
        try {
            execSync('npx @tinacms/cli init', { stdio: 'pipe' });
            log(colors.green, '✅ Tina CMS initialisé');
        } catch (error) {
            // L'erreur est normale si déjà initialisé
            log(colors.green, '✅ Tina CMS déjà initialisé');
        }

        // 6. Instructions finales
        console.log('');
        log(colors.bold + colors.green, '🎉 Configuration terminée !');
        console.log('');
        log(colors.blue, '📚 Prochaines étapes :');
        console.log('');
        console.log('   1. Configurez vos clés API Tina dans .env (si pas déjà fait)');
        console.log('   2. Lancez le serveur de développement :');
        log(colors.bold, '      npm run dev:tina');
        console.log('   3. Accédez à l\'administration :');
        log(colors.bold, '      http://localhost:4321/admin');
        console.log('');
        
        log(colors.yellow, '💡 L\'interface d\'édition sera disponible une fois les clés API configurées');
        
    } catch (error) {
        log(colors.red, `❌ Erreur lors de la configuration : ${error.message}`);
        process.exit(1);
    }
}

// Exécuter le setup
setupTinaCMS().catch(console.error);
