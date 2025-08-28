import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

console.log('🖼️ Ajout des images aux layouts d\'articles...');

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

// Fonction pour extraire le slug d'un fichier article
function extractSlugFromPath(filePath) {
    const relativePath = path.relative(projectRoot, filePath);
    
    // Pour les fichiers [slug].astro, on utilise le nom du dossier parent
    if (path.basename(filePath) === '[slug].astro') {
        return path.basename(path.dirname(filePath));
    }
    
    // Pour les fichiers statiques, on utilise le nom du fichier sans extension
    return path.basename(filePath, '.astro');
}

// Fonction pour trouver l'image associée à un article
function findArticleImage(slug, collection) {
    const thumbnailsDir = path.join(projectRoot, 'public/images/thumbnails');
    
    // Patterns d'images à rechercher (priorité décroissante)
    const imagePatterns = [
        `${slug}.jpg`,           // Image TinaCMS uploadée
        `${slug}.jpeg`,
        `${slug}.png`,
        `${slug}.webp`,
        `${collection}.svg`,     // Image générique de collection
        `${slug}.svg`            // Image SVG générique
    ];
    
    for (const pattern of imagePatterns) {
        const imagePath = path.join(thumbnailsDir, pattern);
        if (fs.existsSync(imagePath)) {
            return `/images/thumbnails/${pattern}`;
        }
    }
    
    return null;
}

// Fonction pour corriger un fichier article en ajoutant l'image
function addImageToArticle(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let newContent = content;
        
        // Extraire le slug et la collection
        const relativePath = path.relative(projectRoot, filePath);
        const pathParts = relativePath.split('/');
        
        let collection = '';
        let slug = '';
        
        if (pathParts.includes('collections')) {
            const collectionIndex = pathParts.indexOf('collections');
            collection = pathParts[collectionIndex + 1];
            slug = extractSlugFromPath(filePath);
        } else {
            slug = extractSlugFromPath(filePath);
            collection = pathParts[2] || 'general'; // temoignages, guides, etc.
        }
        
        // Trouver l'image associée
        const imageUrl = findArticleImage(slug, collection);
        
        // Chercher la balise ArticleWithAffiliateSidebar
        const layoutPattern = /<ArticleWithAffiliateSidebar([^>]*)>/;
        const match = newContent.match(layoutPattern);
        
        if (match) {
            const existingProps = match[1];
            
            // Vérifier si image= est déjà présent
            if (!existingProps.includes('image=')) {
                let newProps = existingProps;
                
                if (imageUrl) {
                    // Ajouter la prop image
                    newProps += ` image="${imageUrl}"`;
                    modified = true;
                }
                
                newContent = newContent.replace(layoutPattern, `<ArticleWithAffiliateSidebar${newProps}>`);
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            return { success: true, modified: true, image: imageUrl };
        }
        
        return { success: true, modified: false, image: imageUrl };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Fonction principale
function main() {
    const articleFiles = findAllArticleFiles();
    
    console.log(`📁 ${articleFiles.length} fichiers d'articles trouvés`);
    
    let updatedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;
    let imagesFound = 0;
    
    for (const filePath of articleFiles) {
        const relativePath = path.relative(projectRoot, filePath);
        console.log(`🔄 Traitement: ${relativePath}`);
        
        const result = addImageToArticle(filePath);
        
        if (result.success) {
            if (result.modified) {
                console.log(`  ✅ Image ajoutée: ${result.image}`);
                updatedCount++;
                if (result.image) imagesFound++;
            } else {
                console.log(`  ℹ️  Déjà configuré`);
                alreadyCorrectCount++;
                if (result.image) imagesFound++;
            }
        } else {
            console.log(`  ❌ Erreur: ${result.error}`);
            errorCount++;
        }
    }
    
    console.log('\n📊 Résumé:');
    console.log(`  ✅ Articles mis à jour: ${updatedCount}`);
    console.log(`  ℹ️  Déjà configurés: ${alreadyCorrectCount}`);
    console.log(`  🖼️  Images trouvées: ${imagesFound}`);
    console.log(`  ❌ Erreurs: ${errorCount}`);
    
    if (updatedCount > 0) {
        console.log('\n🎉 Configuration terminée ! Les articles affichent maintenant leurs images.');
    }
}

main();
