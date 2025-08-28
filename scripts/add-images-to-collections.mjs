import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

console.log('🖼️ Ajout de la prop image aux collections dynamiques...');

// Fonction pour trouver tous les fichiers [slug].astro dans les collections
function findCollectionSlugFiles() {
    const collectionsDir = path.join(projectRoot, 'src/pages/collections');
    const slugFiles = [];
    
    if (fs.existsSync(collectionsDir)) {
        const collections = fs.readdirSync(collectionsDir, { withFileTypes: true });
        
        for (const collection of collections) {
            if (collection.isDirectory()) {
                const slugFile = path.join(collectionsDir, collection.name, '[slug].astro');
                if (fs.existsSync(slugFile)) {
                    slugFiles.push(slugFile);
                }
            }
        }
    }
    
    return slugFiles;
}

// Fonction pour ajouter la prop image à un fichier collection
function addImagePropToCollection(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent = content;
        
        // Chercher la balise ArticleWithAffiliateSidebar
        const layoutPattern = /<ArticleWithAffiliateSidebar\s+([\s\S]*?)>/;
        const match = newContent.match(layoutPattern);
        
        if (match) {
            const existingProps = match[1];
            
            // Vérifier si image= est déjà présent
            if (!existingProps.includes('image=')) {
                // Ajouter la prop image avec la logique pour récupérer depuis le frontmatter
                const imageLogic = `image={entry.data.image || entry.data.thumbnail || \`/images/thumbnails/\${entry.collection}.svg\`}`;
                
                // Insérer la prop image après title ou description
                let newProps = existingProps;
                
                // Chercher un bon endroit pour insérer (après title ou description)
                if (newProps.includes('description=')) {
                    newProps = newProps.replace(
                        /(description=\{[^}]+\})/,
                        `$1\n  ${imageLogic}`
                    );
                } else if (newProps.includes('title=')) {
                    newProps = newProps.replace(
                        /(title=\{[^}]+\})/,
                        `$1\n  ${imageLogic}`
                    );
                } else {
                    // Si ni title ni description trouvés, ajouter au début
                    newProps = `${imageLogic}\n  ${newProps}`;
                }
                
                newContent = newContent.replace(layoutPattern, `<ArticleWithAffiliateSidebar ${newProps}>`);
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
    const slugFiles = findCollectionSlugFiles();
    
    console.log(`📁 ${slugFiles.length} fichiers [slug].astro trouvés`);
    
    let updatedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;
    
    for (const filePath of slugFiles) {
        const relativePath = path.relative(projectRoot, filePath);
        console.log(`🔄 Traitement: ${relativePath}`);
        
        const result = addImagePropToCollection(filePath);
        
        if (result.success) {
            if (result.modified) {
                console.log(`  ✅ Prop image ajoutée`);
                updatedCount++;
            } else {
                console.log(`  ℹ️  Déjà configuré`);
                alreadyCorrectCount++;
            }
        } else {
            console.log(`  ❌ Erreur: ${result.error}`);
            errorCount++;
        }
    }
    
    console.log('\n📊 Résumé:');
    console.log(`  ✅ Collections mises à jour: ${updatedCount}`);
    console.log(`  ℹ️  Déjà configurées: ${alreadyCorrectCount}`);
    console.log(`  ❌ Erreurs: ${errorCount}`);
    
    if (updatedCount > 0) {
        console.log('\n🎉 Configuration terminée ! Les collections dynamiques récupèrent maintenant les images du frontmatter.');
    }
}

main();
