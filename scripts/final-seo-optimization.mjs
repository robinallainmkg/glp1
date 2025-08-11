import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';

// Script d'optimisation SEO finale
class FinalSEOOptimizer {
    constructor() {
        this.fixes = {
            metaDescriptionsFixed: 0,
            keywordsAdded: 0,
            titlesOptimized: 0,
            imagesAdded: 0
        };
    }

    // Générer une meta description optimisée
    generateMetaDescription(title, content, keywords = []) {
        const contentSample = content
            .replace(/^---[\s\S]*?---/, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '$1')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .trim()
            .slice(0, 300);

        const sentences = contentSample.split('.').filter(s => s.trim().length > 20);
        let description = sentences[0] || '';
        
        // Ajouter des phrases jusqu'à atteindre 150-160 caractères
        for (let i = 1; i < sentences.length && description.length < 140; i++) {
            const nextSentence = sentences[i].trim();
            if (description.length + nextSentence.length + 2 <= 160) {
                description += '. ' + nextSentence;
            } else {
                break;
            }
        }
        
        // Nettoyer et finaliser
        description = description
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\.$/, '');
        
        // S'assurer qu'on a au moins 120 caractères
        if (description.length < 120) {
            const keywordPhrase = keywords.length > 0 ? 
                ` Découvrez tout sur ${keywords[0]} en France.` : 
                ' Guide complet et conseils pratiques.';
            
            if (description.length + keywordPhrase.length <= 160) {
                description += keywordPhrase;
            }
        }
        
        // Ajouter un point final si nécessaire
        if (description.length > 0 && !description.endsWith('.')) {
            description += '.';
        }
        
        return description.slice(0, 160);
    }

    // Générer des mots-clés basés sur le contenu et le titre
    generateKeywords(title, content, filePath) {
        const commonKeywords = {
            'glp1': ['GLP-1', 'glp1', 'agoniste GLP-1'],
            'ozempic': ['Ozempic', 'semaglutide', 'diabète type 2'],
            'wegovy': ['Wegovy', 'perte de poids', 'obésité'],
            'trulicity': ['Trulicity', 'dulaglutide', 'diabète'],
            'tirzepatide': ['tirzepatide', 'Mounjaro', 'dual agonist'],
            'diabete': ['diabète', 'glycémie', 'insuline'],
            'perte-de-poids': ['perte de poids', 'amaigrissement', 'minceur'],
            'prix': ['prix', 'coût', 'remboursement'],
            'effets-secondaires': ['effets secondaires', 'effets indésirables', 'sécurité']
        };
        
        const pathParts = filePath.toLowerCase().split('/');
        const titleLower = title.toLowerCase();
        const contentLower = content.toLowerCase();
        
        let keywords = new Set();
        
        // Ajouter des mots-clés basés sur le chemin
        for (const [key, values] of Object.entries(commonKeywords)) {
            if (pathParts.some(part => part.includes(key)) || 
                titleLower.includes(key) || 
                contentLower.includes(key)) {
                values.forEach(kw => keywords.add(kw));
            }
        }
        
        // Ajouter des mots-clés spécifiques selon le contenu
        if (contentLower.includes('france') || titleLower.includes('france')) {
            keywords.add('France');
        }
        
        if (contentLower.includes('médicament') || titleLower.includes('médicament')) {
            keywords.add('médicament');
        }
        
        if (contentLower.includes('traitement') || titleLower.includes('traitement')) {
            keywords.add('traitement');
        }
        
        // Limiter à 5-7 mots-clés
        return Array.from(keywords).slice(0, 7);
    }

    // Optimiser le titre
    optimizeTitle(title, filePath) {
        if (!title) return title;
        
        // Si le titre est trop court
        if (title.length < 30) {
            const pathParts = path.basename(filePath, '.md').split('-');
            const suggestion = pathParts
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');
            
            if (title.length + suggestion.length + 5 <= 60) {
                return `${title} - ${suggestion}`;
            }
        }
        
        // Si le titre est trop long, le raccourcir intelligemment
        if (title.length > 70) {
            // Supprimer les parties redondantes
            let optimized = title
                .replace(/\s*-\s*Guide.*$/i, '')
                .replace(/\s*:\s*Tout.*$/i, '')
                .replace(/\s*\|\s*.*$/i, '')
                .trim();
            
            if (optimized.length > 60) {
                // Garder la partie la plus importante
                const parts = optimized.split(/[-:|]/);
                optimized = parts[0].trim();
                
                if (optimized.length < 30 && parts.length > 1) {
                    optimized += ' - ' + parts[1].trim();
                }
            }
            
            return optimized.slice(0, 60);
        }
        
        return title;
    }

    // Ajouter une image pertinente
    addImageToContent(content, filePath) {
        // Si une image est déjà présente, ne rien faire
        if (content.includes('![')) {
            return content;
        }
        
        const pathParts = path.dirname(filePath).split('/');
        const category = pathParts[pathParts.length - 1];
        
        const imageMap = {
            'medicaments-glp1': 'medicament-glp1-injection.jpg',
            'glp1-perte-de-poids': 'perte-poids-glp1.jpg',
            'glp1-diabete': 'diabete-traitement-glp1.jpg',
            'glp1-cout': 'prix-medicament-glp1.jpg',
            'effets-secondaires-glp1': 'effets-secondaires-glp1.jpg',
            'alternatives-glp1': 'alternatives-naturelles-glp1.jpg',
            'regime-glp1': 'regime-alimentaire-glp1.jpg',
            'recherche-glp1': 'recherche-scientifique-glp1.jpg'
        };
        
        const imageName = imageMap[category] || 'glp1-general.jpg';
        const imageAlt = this.generateImageAlt(filePath);
        
        // Insérer l'image après le premier paragraphe
        const lines = content.split('\n');
        let insertIndex = -1;
        let inFrontmatter = false;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                inFrontmatter = !inFrontmatter;
                continue;
            }
            
            if (!inFrontmatter && lines[i].trim() !== '' && !lines[i].startsWith('#')) {
                // Trouver la fin du premier paragraphe
                for (let j = i; j < lines.length; j++) {
                    if (lines[j].trim() === '' || lines[j].startsWith('#')) {
                        insertIndex = j;
                        break;
                    }
                }
                break;
            }
        }
        
        if (insertIndex > 0) {
            const imageMarkdown = `\n![${imageAlt}](/images/${imageName})\n`;
            lines.splice(insertIndex, 0, imageMarkdown);
            return lines.join('\n');
        }
        
        return content;
    }

    // Générer un alt text pour l'image
    generateImageAlt(filePath) {
        const fileName = path.basename(filePath, '.md');
        const pathParts = path.dirname(filePath).split('/');
        const category = pathParts[pathParts.length - 1];
        
        const altMap = {
            'medicaments-glp1': 'Injection de médicament GLP-1',
            'glp1-perte-de-poids': 'Perte de poids avec GLP-1',
            'glp1-diabete': 'Traitement diabète GLP-1',
            'glp1-cout': 'Prix médicament GLP-1',
            'effets-secondaires-glp1': 'Effets secondaires GLP-1',
            'alternatives-glp1': 'Alternatives naturelles GLP-1',
            'regime-glp1': 'Régime alimentaire GLP-1',
            'recherche-glp1': 'Recherche scientifique GLP-1'
        };
        
        return altMap[category] || 'Médicament GLP-1 France';
    }

    // Optimiser un article
    optimizeArticle(filePath, content) {
        const fixes = {
            metaDescriptionFixed: false,
            keywordsAdded: false,
            titleOptimized: false,
            imageAdded: false
        };
        
        // Extraire le frontmatter et le contenu
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) return { content, fixes };
        
        const frontmatter = frontmatterMatch[1];
        const articleContent = content.replace(/^---[\s\S]*?---/, '');
        
        // Parser le frontmatter
        const frontmatterLines = frontmatter.split('\n');
        const frontmatterObj = {};
        
        frontmatterLines.forEach(line => {
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) {
                frontmatterObj[match[1]] = match[2].replace(/^["']|["']$/g, '');
            }
        });
        
        // Optimiser le titre
        if (frontmatterObj.title) {
            const optimizedTitle = this.optimizeTitle(frontmatterObj.title, filePath);
            if (optimizedTitle !== frontmatterObj.title) {
                frontmatterObj.title = optimizedTitle;
                fixes.titleOptimized = true;
            }
        }
        
        // Optimiser la meta description
        if (!frontmatterObj.metaDescription || frontmatterObj.metaDescription.length < 120) {
            const keywords = this.generateKeywords(frontmatterObj.title || '', content, filePath);
            frontmatterObj.metaDescription = this.generateMetaDescription(
                frontmatterObj.title || '', 
                content, 
                keywords
            );
            fixes.metaDescriptionFixed = true;
        }
        
        // Ajouter des mots-clés si manquants
        if (!frontmatterObj.keywords) {
            const keywords = this.generateKeywords(frontmatterObj.title || '', content, filePath);
            frontmatterObj.keywords = keywords.join(', ');
            fixes.keywordsAdded = true;
        }
        
        // Ajouter une image si manquante
        let newArticleContent = articleContent;
        if (!articleContent.includes('![')) {
            newArticleContent = this.addImageToContent(articleContent, filePath);
            if (newArticleContent !== articleContent) {
                fixes.imageAdded = true;
            }
        }
        
        // Reconstruire le frontmatter
        const newFrontmatter = Object.entries(frontmatterObj)
            .map(([key, value]) => `${key}: "${value}"`)
            .join('\n');
        
        const optimizedContent = `---\n${newFrontmatter}\n---${newArticleContent}`;
        
        return { content: optimizedContent, fixes };
    }

    // Analyser récursivement un dossier
    optimizeDirectory(dir) {
        const results = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                results.push(...this.optimizeDirectory(fullPath));
            } else if (item.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const relativePath = path.relative(CONTENT_DIR, fullPath);
                
                const { content: optimizedContent, fixes } = this.optimizeArticle(relativePath, content);
                
                // Sauvegarder si des modifications ont été apportées
                const hasChanges = Object.values(fixes).some(fix => fix);
                if (hasChanges) {
                    fs.writeFileSync(fullPath, optimizedContent);
                    
                    // Mettre à jour les compteurs
                    if (fixes.metaDescriptionFixed) this.fixes.metaDescriptionsFixed++;
                    if (fixes.keywordsAdded) this.fixes.keywordsAdded++;
                    if (fixes.titleOptimized) this.fixes.titlesOptimized++;
                    if (fixes.imageAdded) this.fixes.imagesAdded++;
                    
                    results.push({
                        path: relativePath,
                        fixes: fixes
                    });
                }
            }
        }
        
        return results;
    }

    // Exécuter l'optimisation finale
    async run() {
        console.log('🔧 Optimisation SEO finale en cours...\n');
        
        const optimizedFiles = this.optimizeDirectory(CONTENT_DIR);
        
        console.log('✅ OPTIMISATION TERMINÉE :');
        console.log(`   Fichiers modifiés : ${optimizedFiles.length}`);
        console.log(`   Meta descriptions corrigées : ${this.fixes.metaDescriptionsFixed}`);
        console.log(`   Mots-clés ajoutés : ${this.fixes.keywordsAdded}`);
        console.log(`   Titres optimisés : ${this.fixes.titlesOptimized}`);
        console.log(`   Images ajoutées : ${this.fixes.imagesAdded}`);
        
        // Détail des modifications
        if (optimizedFiles.length > 0) {
            console.log('\n📝 DÉTAIL DES MODIFICATIONS :');
            optimizedFiles.forEach(file => {
                console.log(`\n${file.path}:`);
                Object.entries(file.fixes).forEach(([fix, applied]) => {
                    if (applied) {
                        const fixLabels = {
                            metaDescriptionFixed: '   ✅ Meta description corrigée',
                            keywordsAdded: '   ✅ Mots-clés ajoutés',
                            titleOptimized: '   ✅ Titre optimisé',
                            imageAdded: '   ✅ Image ajoutée'
                        };
                        console.log(fixLabels[fix]);
                    }
                });
            });
        }
        
        // Nouveau monitoring après optimisation
        console.log('\n🔍 Nouveau monitoring SEO recommandé...');
        
        return {
            totalOptimized: optimizedFiles.length,
            fixes: this.fixes,
            optimizedFiles: optimizedFiles
        };
    }
}

// Exécution
const optimizer = new FinalSEOOptimizer();
optimizer.run().catch(console.error);
