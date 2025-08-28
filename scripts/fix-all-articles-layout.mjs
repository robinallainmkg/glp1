import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

console.log('🔧 Correction de tous les articles pour utiliser ArticleWithAffiliateSidebar...');

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
    
    // Filtrer pour ne garder que les articles individuels (pas les pages d'index)
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

// Fonction pour corriger un fichier article
function fixArticleFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent = content;
        
        // Pattern pour détecter les différents layouts d'articles
        const layoutPatterns = [
            /import\s+Layout\s+from\s+['"](.*?Layout\.astro)['"];?/g,
            /import\s+ArticleLayout\s+from\s+['"](.*?)['"];?/g,
            /import\s+BaseLayout\s+from\s+['"](.*?)['"];?/g
        ];
        
        // Remplacer l'import du layout par ArticleWithAffiliateSidebar
        for (const pattern of layoutPatterns) {
            if (pattern.test(content)) {
                newContent = newContent.replace(pattern, 
                    'import ArticleWithAffiliateSidebar from "../../../layouts/ArticleWithAffiliateSidebar.astro";'
                );
                modified = true;
                break;
            }
        }
        
        // Si aucun layout n'est trouvé, ajouter l'import
        if (!newContent.includes('ArticleWithAffiliateSidebar') && !newContent.includes('import')) {
            newContent = 'import ArticleWithAffiliateSidebar from "../../../layouts/ArticleWithAffiliateSidebar.astro";\n' + newContent;
            modified = true;
        }
        
        // Corriger l'usage du layout dans le template
        const layoutUsagePatterns = [
            /<Layout[^>]*>/g,
            /<ArticleLayout[^>]*>/g,
            /<BaseLayout[^>]*>/g
        ];
        
        for (const pattern of layoutUsagePatterns) {
            if (pattern.test(newContent)) {
                // Extraire les props existantes
                const match = newContent.match(pattern);
                if (match) {
                    const existingTag = match[0];
                    const propsMatch = existingTag.match(/\s+(\w+)=\{([^}]+)\}/g);
                    
                    let newProps = '';
                    if (propsMatch) {
                        // Conserver les props existantes et mapper correctement
                        const propMappings = {
                            'title': 'title',
                            'description': 'description',
                            'frontmatter': 'articleContent',
                            'entry': 'articleContent',
                            'article': 'articleContent'
                        };
                        
                        for (const prop of propsMatch) {
                            const propMatch = prop.match(/\s+(\w+)=\{([^}]+)\}/);
                            if (propMatch) {
                                const [, propName, propValue] = propMatch;
                                const mappedName = propMappings[propName] || propName;
                                newProps += ` ${mappedName}={${propValue}}`;
                            }
                        }
                    }
                    
                    // Ajouter les props par défaut si manquantes
                    if (!newProps.includes('articleContent')) {
                        newProps += ' articleContent={frontmatter || entry}';
                    }
                    if (!newProps.includes('affiliateProducts')) {
                        newProps += ' affiliateProducts={affiliateProducts}';
                    }
                    if (!newProps.includes('affiliateConfig')) {
                        newProps += ' affiliateConfig={affiliateConfig}';
                    }
                    
                    newContent = newContent.replace(pattern, `<ArticleWithAffiliateSidebar${newProps}>`);
                    modified = true;
                }
                break;
            }
        }
        
        // Remplacer les balises de fermeture
        newContent = newContent.replace(/<\/Layout>/g, '</ArticleWithAffiliateSidebar>');
        newContent = newContent.replace(/<\/ArticleLayout>/g, '</ArticleWithAffiliateSidebar>');
        newContent = newContent.replace(/<\/BaseLayout>/g, '</ArticleWithAffiliateSidebar>');
        
        // Vérifier que <Content /> est bien présent dans le slot
        if (newContent.includes('<Content') && !newContent.includes('<ArticleWithAffiliateSidebar')) {
            // S'assurer que Content est dans le slot du layout
            if (!newContent.match(/<ArticleWithAffiliateSidebar[^>]*>[\s\S]*<Content[^>]*\/>[\s\S]*<\/ArticleWithAffiliateSidebar>/)) {
                // Ajouter Content dans le slot si pas déjà présent
                newContent = newContent.replace(
                    /(<ArticleWithAffiliateSidebar[^>]*>)/,
                    '$1\n  <Content />'
                );
                modified = true;
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

// Fonction principale
function main() {
    const articleFiles = findAllArticleFiles();
    
    console.log(`📁 ${articleFiles.length} fichiers d'articles trouvés`);
    
    let correctedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;
    
    for (const filePath of articleFiles) {
        const relativePath = path.relative(projectRoot, filePath);
        console.log(`🔄 Traitement: ${relativePath}`);
        
        const result = fixArticleFile(filePath);
        
        if (result.success) {
            if (result.modified) {
                console.log(`  ✅ Corrigé`);
                correctedCount++;
            } else {
                console.log(`  ℹ️  Déjà correct`);
                alreadyCorrectCount++;
            }
        } else {
            console.log(`  ❌ Erreur: ${result.error}`);
            errorCount++;
        }
    }
    
    console.log('\n📊 Résumé:');
    console.log(`  ✅ Articles corrigés: ${correctedCount}`);
    console.log(`  ℹ️  Déjà corrects: ${alreadyCorrectCount}`);
    console.log(`  ❌ Erreurs: ${errorCount}`);
    
    if (correctedCount > 0) {
        console.log('\n🎉 Correction terminée ! Tous les articles utilisent maintenant ArticleWithAffiliateSidebar.');
    }
}

main();
