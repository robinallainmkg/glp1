import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

console.log('🔗 Vérification de l\'intégration de l\'affiliation inline sur tous les articles...');

// Fonction pour trouver tous les fichiers .astro qui sont des articles
function findAllArticleFiles() {
    const searchDirs = [
        path.join(projectRoot, 'src/pages/collections'),
        path.join(projectRoot, 'src/pages/temoignages'),
        path.join(projectRoot, 'src/pages/guides'),
        path.join(projectRoot, 'src/pages/articles')
    ];
    
    const articleFiles = [];
    
    for (const searchDir of searchDirs) {
        if (fs.existsSync(searchDir)) {
            const files = findAstroFiles(searchDir);
            articleFiles.push(...files);
        }
    }
    
    // Filtrer pour ne garder que les articles individuels
    return articleFiles.filter(file => {
        const basename = path.basename(file);
        return basename.includes('[slug]') || (!basename.includes('index') && basename !== '[slug].astro');
    });
}

function findAstroFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...findAstroFiles(fullPath));
        } else if (item.isFile() && item.name.endsWith('.astro')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Fonction pour vérifier si un fichier utilise ArticleWithAffiliateSidebar
function checkArticleLayout(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Vérifier si le fichier utilise ArticleWithAffiliateSidebar
        const hasCorrectLayout = content.includes('ArticleWithAffiliateSidebar');
        
        // Vérifier si il y a des props d'affiliation
        const hasAffiliateProps = content.includes('affiliateProducts') || content.includes('affiliateConfig');
        
        // Vérifier si le contenu est injecté via <Content /> ou slot
        const hasSlotContent = content.includes('<Content') || content.includes('<slot');
        
        return {
            hasCorrectLayout,
            hasAffiliateProps,
            hasSlotContent,
            needsUpdate: !hasCorrectLayout || !hasAffiliateProps
        };
        
    } catch (error) {
        return { 
            error: error.message,
            needsUpdate: true
        };
    }
}

// Fonction principale
function main() {
    const articleFiles = findAllArticleFiles();
    
    console.log(`📁 ${articleFiles.length} fichiers d'articles trouvés`);
    
    let correctCount = 0;
    let needsUpdateCount = 0;
    let errorCount = 0;
    
    const problemFiles = [];
    
    for (const filePath of articleFiles) {
        const relativePath = path.relative(projectRoot, filePath);
        console.log(`🔍 Vérification: ${relativePath}`);
        
        const result = checkArticleLayout(filePath);
        
        if (result.error) {
            console.log(`  ❌ Erreur: ${result.error}`);
            errorCount++;
            problemFiles.push({ path: relativePath, issue: result.error });
        } else if (result.needsUpdate) {
            console.log(`  ⚠️  Mise à jour nécessaire:`);
            if (!result.hasCorrectLayout) console.log(`    - Layout: ArticleWithAffiliateSidebar manquant`);
            if (!result.hasAffiliateProps) console.log(`    - Props d'affiliation manquantes`);
            needsUpdateCount++;
            problemFiles.push({ 
                path: relativePath, 
                issue: `Layout: ${result.hasCorrectLayout ? '✓' : '✗'}, Props: ${result.hasAffiliateProps ? '✓' : '✗'}` 
            });
        } else {
            console.log(`  ✅ Configuration correcte`);
            correctCount++;
        }
    }
    
    console.log('\n📊 Résumé:');
    console.log(`  ✅ Articles corrects: ${correctCount}`);
    console.log(`  ⚠️  Articles à mettre à jour: ${needsUpdateCount}`);
    console.log(`  ❌ Erreurs: ${errorCount}`);
    
    if (problemFiles.length > 0) {
        console.log('\n🔧 Articles nécessitant une attention:');
        problemFiles.forEach(file => {
            console.log(`  - ${file.path}: ${file.issue}`);
        });
    }
    
    if (needsUpdateCount === 0 && errorCount === 0) {
        console.log('\n🎉 Parfait ! Tous les articles utilisent ArticleWithAffiliateSidebar avec l\'affiliation inline.');
    } else {
        console.log('\n💡 Les scripts précédents devraient avoir corrigé la plupart des problèmes.');
        console.log('   Vérifiez manuellement les fichiers listés ci-dessus si nécessaire.');
    }
}

main();
