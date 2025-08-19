#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, '..', 'src', 'content');

// Fonction pour extraire le frontmatter
function extractFrontmatter(content, filePath) {
  const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n/s);
  if (!frontmatterMatch) {
    return { error: 'Pas de frontmatter trouvé', frontmatter: null };
  }
  
  const frontmatter = {};
  const lines = frontmatterMatch[1].split('\n');
  
  for (const line of lines) {
    // Expression régulière améliorée pour gérer les guillemets, valeurs avec espaces et \r
    const cleanLine = line.replace(/\r$/g, ''); // Supprimer \r de fin
    const match = cleanLine.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Nettoyer les guillemets doubles et simples, et les espaces
      const cleanValue = value.replace(/^["'\s]+|["'\s]+$/g, '');
      if (cleanValue) {
        frontmatter[key] = cleanValue;
      }
    }
  }
  
  // Debug: afficher les clés trouvées pour le premier fichier problématique
  if (Object.keys(frontmatter).length === 0) {
    console.log(`    🔍 Debug ${filePath}:`);
    console.log(`    Lignes frontmatter: ${lines.length}`);
    console.log(`    Premières lignes:`, lines.slice(0, 3));
  }
  
  // Vérifier les champs requis
  const issues = [];
  
  if (!frontmatter.title) {
    issues.push('❌ title manquant (REQUIS)');
  }
  
  // Vérifier les champs communs attendus
  const expectedFields = ['metaTitle', 'description', 'metaDescription', 'author', 'date', 'keywords', 'keyword'];
  const missingFields = expectedFields.filter(field => !frontmatter[field]);
  
  if (missingFields.length > 0) {
    issues.push(`⚠️ Champs manquants: ${missingFields.join(', ')}`);
  }
  
  return { frontmatter, issues };
}

// Fonction principale
function checkAllFrontmatters() {
  console.log('🔍 Vérification du frontmatter de tous les articles...\n');
  
  const collections = fs.readdirSync(contentPath).filter(dir => 
    fs.statSync(path.join(contentPath, dir)).isDirectory()
  );
  
  let totalFiles = 0;
  let totalIssues = 0;
  let criticalIssues = 0;
  
  collections.forEach(collection => {
    const collectionPath = path.join(contentPath, collection);
    const files = fs.readdirSync(collectionPath).filter(file => 
      file.endsWith('.md') || file.endsWith('.mdx')
    );
    
    console.log(`📂 Collection: ${collection} (${files.length} fichiers)`);
    
    files.forEach(file => {
      const filePath = path.join(collectionPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, issues, error } = extractFrontmatter(content, filePath);
      
      totalFiles++;
      
      if (error) {
        console.log(`  ❌ ${file}: ${error}`);
        criticalIssues++;
        return;
      }
      
      if (issues.length > 0) {
        console.log(`  📄 ${file}:`);
        issues.forEach(issue => {
          console.log(`    ${issue}`);
          if (issue.includes('title manquant')) {
            criticalIssues++;
          } else {
            totalIssues++;
          }
        });
      } else {
        console.log(`  ✅ ${file}: Frontmatter OK`);
      }
    });
    
    console.log('');
  });
  
  console.log(`📊 Résumé:`);
  console.log(`   Fichiers analysés: ${totalFiles}`);
  console.log(`   Erreurs critiques: ${criticalIssues} (title manquant)`);
  console.log(`   Avertissements: ${totalIssues} (champs optionnels)`);
  
  if (criticalIssues === 0) {
    console.log(`✅ Aucune erreur critique ! Le site devrait fonctionner.`);
  } else {
    console.log(`❌ ${criticalIssues} erreurs critiques à corriger.`);
  }
}

// Exécution
checkAllFrontmatters();
