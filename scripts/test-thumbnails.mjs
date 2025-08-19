#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Démarrage du générateur de thumbnails...');
console.log('📁 Répertoire du script:', __dirname);

const contentPath = path.join(__dirname, '..', 'src', 'content');
const publicImagesPath = path.join(__dirname, '..', 'public', 'images', 'thumbnails');

console.log('📂 Chemin du contenu:', contentPath);
console.log('📂 Chemin des images:', publicImagesPath);

// Vérifier que le dossier de contenu existe
if (!fs.existsSync(contentPath)) {
  console.log('❌ Le dossier de contenu n\'existe pas:', contentPath);
  process.exit(1);
}

// Créer le dossier d'images si nécessaire
if (!fs.existsSync(publicImagesPath)) {
  console.log('📁 Création du dossier thumbnails...');
  fs.mkdirSync(publicImagesPath, { recursive: true });
} else {
  console.log('✅ Dossier thumbnails existe déjà');
}

// Lister les collections disponibles
console.log('📋 Collections disponibles:');
const collections = fs.readdirSync(contentPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

collections.forEach(collection => {
  console.log('  -', collection);
});

console.log('✅ Test terminé avec succès !');
