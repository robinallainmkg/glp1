#!/usr/bin/env node

/**
 * Script pour basculer entre les configurations Tina
 * Usage: node scripts/tina-switch.mjs [local|production]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const mode = args[0] || 'local';

const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

function switchTinaConfig() {
    const tinaDir = path.join(rootDir, 'tina');
    const configPath = path.join(tinaDir, 'config.ts');
    
    let sourceConfig;
    if (mode === 'local') {
        sourceConfig = path.join(tinaDir, 'config-local.ts');
        log(colors.blue, '🔧 Basculement vers la configuration locale (sans auth)');
    } else {
        sourceConfig = path.join(tinaDir, 'config.ts');
        log(colors.blue, '🚀 Basculement vers la configuration production');
    }
    
    if (!fs.existsSync(sourceConfig)) {
        log(colors.red, `❌ Fichier de configuration introuvable: ${sourceConfig}`);
        process.exit(1);
    }
    
    try {
        if (mode === 'local') {
            // Copier la config locale
            fs.copyFileSync(sourceConfig, configPath);
            log(colors.green, '✅ Configuration locale activée');
            log(colors.yellow, '💡 Vous pouvez maintenant tester Tina sans clés API');
        } else {
            log(colors.green, '✅ Configuration production déjà en place');
            log(colors.yellow, '💡 N\'oubliez pas de configurer vos clés API dans .env');
        }
        
        console.log('');
        log(colors.blue, '🚀 Démarrage du serveur :');
        console.log('   npm run dev:tina');
        console.log('');
        log(colors.blue, '🌐 Interface d\'administration :');
        console.log('   http://localhost:4321/admin');
        
    } catch (error) {
        log(colors.red, `❌ Erreur lors du changement de configuration: ${error.message}`);
        process.exit(1);
    }
}

switchTinaConfig();
