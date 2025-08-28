import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

console.log('🔧 Correction des props d\'affiliation manquantes...');

const filesToFix = [
    'src/pages/temoignages/laurent.astro',
    'src/pages/temoignages/marie.astro',
    'src/pages/temoignages/sophie.astro'
];

function fixAffiliateProps(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent = content;
        
        // Chercher la balise ArticleWithAffiliateSidebar
        const layoutPattern = /<ArticleWithAffiliateSidebar\s+([\s\S]*?)>/;
        const match = newContent.match(layoutPattern);
        
        if (match) {
            const existingProps = match[1];
            
            // Vérifier et ajouter les props manquantes
            let newProps = existingProps;
            
            if (!existingProps.includes('affiliateProducts=')) {
                newProps += ' affiliateProducts={affiliateProducts}';
                modified = true;
            }
            
            if (!existingProps.includes('affiliateConfig=')) {
                newProps += ' affiliateConfig={affiliateConfig}';
                modified = true;
            }
            
            if (modified) {
                newContent = newContent.replace(layoutPattern, `<ArticleWithAffiliateSidebar ${newProps}>`);
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            return { success: true, modified: true };
        }
        
        return { success: true, modified: false };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Correction des fichiers
let fixedCount = 0;
let errorCount = 0;

for (const relativePath of filesToFix) {
    const fullPath = path.join(projectRoot, relativePath);
    console.log(`🔄 Correction: ${relativePath}`);
    
    const result = fixAffiliateProps(fullPath);
    
    if (result.success) {
        if (result.modified) {
            console.log(`  ✅ Props d'affiliation ajoutées`);
            fixedCount++;
        } else {
            console.log(`  ℹ️  Déjà correct`);
        }
    } else {
        console.log(`  ❌ Erreur: ${result.error}`);
        errorCount++;
    }
}

console.log('\n📊 Résumé:');
console.log(`  ✅ Fichiers corrigés: ${fixedCount}`);
console.log(`  ❌ Erreurs: ${errorCount}`);

if (fixedCount > 0) {
    console.log('\n🎉 Correction terminée ! Tous les articles ont maintenant l\'affiliation inline intégrée.');
}
