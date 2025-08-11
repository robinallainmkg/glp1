import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';
const MIN_WORD_COUNT = 500;

// Templates d'enrichissement par thématique
const enrichmentTemplates = {
    "medicament": {
        sections: [
            "## Mécanisme d'action et efficacité",
            "## Posologie et administration",
            "## Effets secondaires et précautions",
            "## Contre-indications importantes",
            "## Suivi médical nécessaire",
            "## Alternatives thérapeutiques",
            "## Questions fréquentes"
        ],
        content: {
            "Mécanisme d'action et efficacité": `
Ces médicaments agissent en mimant l'action des hormones naturelles GLP-1 (peptide-1 analogue au glucagon), régulant ainsi la glycémie et favorisant la satiété. Les études cliniques démontrent une efficacité significative sur la perte de poids, avec des résultats observables dès les premières semaines de traitement.

L'efficacité de ces traitements repose sur plusieurs mécanismes complémentaires :
- Ralentissement de la vidange gastrique
- Réduction de l'appétit par action sur les centres de satiété
- Amélioration de la sensibilité à l'insuline
- Régulation des pics glycémiques post-prandiaux`,

            "Posologie et administration": `
La posologie doit être adaptée individuellement sous supervision médicale stricte. En général, le traitement débute par une dose faible qui est progressivement augmentée pour optimiser l'efficacité tout en minimisant les effets indésirables.

**Recommandations d'administration :**
- Respecter scrupuleusement les horaires de prise
- Administrer selon les recommandations du prescripteur
- Ne jamais modifier la posologie sans avis médical
- Conserver le médicament dans des conditions appropriées`,

            "Effets secondaires et précautions": `
Comme tout médicament actif, ces traitements peuvent occasionner des effets secondaires. Les plus fréquemment rapportés incluent des troubles gastro-intestinaux transitoires, généralement observés en début de traitement.

**Effets indésirables possibles :**
- Nausées et vomissements (souvent temporaires)
- Troubles digestifs légers
- Modifications de l'appétit
- Réactions au site d'injection (si applicable)

Il est essentiel de signaler tout effet indésirable persistant ou préoccupant à votre professionnel de santé.`,

            "Contre-indications importantes": `
Ces médicaments ne conviennent pas à tous les patients. Certaines conditions médicales constituent des contre-indications absolues ou relatives qu'il convient de respecter rigoureusement.

**Principales contre-indications :**
- Antécédents de réactions allergiques aux composants
- Certaines pathologies gastro-intestinales sévères
- Grossesse et allaitement (sauf indication spécifique)
- Interactions médicamenteuses significatives

Votre médecin évaluera soigneusement votre profil médical avant toute prescription.`,

            "Suivi médical nécessaire": `
Un suivi médical régulier est indispensable pour optimiser l'efficacité du traitement et prévenir d'éventuelles complications. Ce suivi permet d'ajuster la posologie et de détecter précocement tout signal d'alarme.

**Éléments de surveillance :**
- Évolution pondérale et composition corporelle
- Paramètres biologiques (glycémie, fonctions hépatique et rénale)
- Tolérance digestive et générale
- Observance thérapeutique
- Adaptation du mode de vie (alimentation, exercice physique)`,

            "Alternatives thérapeutiques": `
Plusieurs options thérapeutiques peuvent être envisagées selon le profil du patient et ses objectifs de santé. L'approche thérapeutique doit être personnalisée et peut combiner différentes stratégies.

**Options disponibles :**
- Modifications du mode de vie (diététique, activité physique)
- Autres classes médicamenteuses
- Approches chirurgicales (dans certains cas spécifiques)
- Thérapies comportementales et psychologiques
- Compléments nutritionnels adaptés

Le choix de la stratégie optimale nécessite une évaluation médicale approfondie.`,

            "Questions fréquentes": `
**Combien de temps avant de voir les premiers résultats ?**
Les premiers effets sont généralement observables dans les 2-4 premières semaines, avec une efficacité optimale atteinte après plusieurs mois de traitement régulier.

**Peut-on interrompre le traitement brutalement ?**
L'arrêt doit toujours se faire sous supervision médicale, avec une diminution progressive si nécessaire pour éviter un effet rebond.

**Quelles précautions alimentaires adopter ?**
Une alimentation équilibrée et adaptée optimise l'efficacité du traitement. Votre médecin ou un diététicien peut vous accompagner dans ces modifications.

**Le traitement est-il compatible avec d'autres médicaments ?**
Informez systématiquement votre médecin de tous vos traitements en cours pour éviter les interactions médicamenteuses.`
        }
    },
    "diabete": {
        sections: [
            "## Physiopathologie et mécanismes",
            "## Diagnostic et surveillance",
            "## Stratégies thérapeutiques",
            "## Prévention des complications",
            "## Éducation thérapeutique",
            "## Innovations récentes",
            "## Ressources et accompagnement"
        ],
        content: {
            "Physiopathologie et mécanismes": `
Le diabète résulte de dysfonctionnements complexes du métabolisme glucidique, impliquant diverses hormones et mécanismes de régulation. La compréhension de ces mécanismes est essentielle pour optimiser la prise en charge thérapeutique.

Les perturbations métaboliques incluent :
- Résistance à l'insuline au niveau des tissus cibles
- Dysfonctionnement des cellules β pancréatiques
- Altération de la sécrétion d'insuline
- Modifications du métabolisme hépatique du glucose
- Perturbations des hormones incrétines (GLP-1, GIP)`,

            "Diagnostic et surveillance": `
Le diagnostic repose sur des critères biologiques précis et standardisés internationalement. La surveillance régulière permet d'adapter la stratégie thérapeutique et de prévenir les complications.

**Paramètres diagnostiques :**
- Glycémie à jeun et post-prandiale
- Hémoglobine glyquée (HbA1c)
- Test de tolérance au glucose oral (si nécessaire)
- Dosages spécialisés (peptide C, auto-anticorps)

**Surveillance recommandée :**
- Contrôles glycémiques réguliers
- Surveillance de l'HbA1c trimestrielle
- Bilan annuel des complications potentielles
- Évaluation cardiovasculaire périodique`,

            "Stratégies thérapeutiques": `
La prise en charge thérapeutique moderne privilégie une approche personnalisée, intégrant les spécificités de chaque patient et l'évolution de sa pathologie.

**Approches thérapeutiques :**
- Modifications du mode de vie (nutrition, activité physique)
- Médicaments oraux de différentes classes
- Traitements injectables (insuline, agonistes GLP-1)
- Combinaisons thérapeutiques optimisées
- Technologies d'aide (pompes, capteurs de glucose)

L'objectif est d'atteindre un équilibre glycémique optimal tout en préservant la qualité de vie.`,

            "Prévention des complications": `
La prévention des complications constitue un enjeu majeur de la prise en charge diabétique. Une approche proactive permet de réduire significativement les risques à long terme.

**Complications à prévenir :**
- Complications microvasculaires (rétinopathie, néphropathie, neuropathie)
- Complications macrovasculaires (cardiovasculaires, cérébrovasculaires)
- Complications aiguës (hypoglycémies, acidocétose)
- Atteintes infectieuses (notamment podologiques)

**Stratégies préventives :**
- Contrôle glycémique optimal
- Gestion des facteurs de risque associés
- Dépistage systématique et régulier
- Éducation du patient et de son entourage`,

            "Éducation thérapeutique": `
L'éducation thérapeutique constitue un pilier fondamental de la prise en charge diabétique, permettant au patient de devenir acteur de sa santé et d'optimiser son autogestion.

**Objectifs éducatifs :**
- Compréhension de la pathologie et de ses enjeux
- Maîtrise des gestes techniques (autocontrôles, injections)
- Adaptation alimentaire et gestion des repas
- Reconnaissance et gestion des situations à risque
- Intégration du traitement dans la vie quotidienne

Les programmes d'éducation thérapeutique sont proposés par les équipes spécialisées et adaptés aux besoins individuels.`,

            "Innovations récentes": `
La recherche médicale propose régulièrement de nouvelles approches thérapeutiques et technologies innovantes pour améliorer la prise en charge diabétique.

**Avancées récentes :**
- Nouveaux médicaments à mécanismes d'action innovants
- Technologies de monitoring continu du glucose
- Systèmes de délivrance automatisée d'insuline
- Thérapies cellulaires et régénératives
- Applications mobiles d'aide à la gestion
- Intelligence artificielle pour la prédiction glycémique

Ces innovations visent à améliorer l'efficacité thérapeutique et la qualité de vie des patients.`,

            "Ressources et accompagnement": `
De nombreuses ressources sont disponibles pour accompagner les patients et leurs proches dans la gestion quotidienne du diabète.

**Ressources disponibles :**
- Équipes médicales spécialisées (diabétologues, éducateurs)
- Associations de patients et groupes de soutien
- Programmes d'éducation thérapeutique
- Outils numériques et applications dédiées
- Documentation et guides pratiques
- Formations pour l'entourage familial

L'accompagnement multidisciplinaire optimise les résultats thérapeutiques et le bien-être du patient.`
        }
    },
    "prix": {
        sections: [
            "## Coût du traitement et facteurs",
            "## Systèmes de remboursement",
            "## Comparaison des options",
            "## Optimisation financière",
            "## Aides et dispositifs sociaux",
            "## Perspectives d'évolution",
            "## Conseils pratiques"
        ],
        content: {
            "Coût du traitement et facteurs": `
Le coût des traitements varie considérablement selon plusieurs facteurs qu'il convient d'analyser pour une estimation précise. Ces variations reflètent la complexité du système de santé et la diversité des options thérapeutiques disponibles.

**Facteurs influençant le coût :**
- Type de médicament et innovation thérapeutique
- Posologie prescrite et durée de traitement
- Statut de remboursement par l'Assurance Maladie
- Couverture par les mutuelles complémentaires
- Négociations tarifaires entre laboratoires et autorités
- Disponibilité de génériques ou biosimilaires

Ces éléments déterminent le reste à charge pour le patient et l'accessibilité du traitement.`,

            "Systèmes de remboursement": `
Le système français de remboursement des médicaments repose sur plusieurs niveaux d'intervention qui se complètent pour optimiser l'accès aux soins.

**Mécanismes de remboursement :**
- Sécurité Sociale : remboursement de base selon le taux de référence
- Mutuelles complémentaires : prise en charge du ticket modérateur
- Dispositifs spécifiques : ALD, CMU-C, AME selon les situations
- Programmes d'aide des laboratoires pharmaceutiques
- Fonds spéciaux pour situations exceptionnelles

La combinaison de ces dispositifs peut considérablement réduire le reste à charge.`,

            "Comparaison des options": `
L'évaluation comparative des différentes options thérapeutiques intègre à la fois les aspects médicaux et économiques pour orienter les choix thérapeutiques.

**Critères de comparaison :**
- Efficacité thérapeutique démontrée
- Profil de tolérance et effets indésirables
- Coût total du traitement (direct et indirect)
- Modalités d'administration et observance
- Impact sur la qualité de vie
- Durée de traitement nécessaire

Cette analyse médico-économique guide les recommandations thérapeutiques et les décisions de remboursement.`,

            "Optimisation financière": `
Plusieurs stratégies permettent d'optimiser le coût du traitement tout en maintenant une efficacité thérapeutique optimale.

**Stratégies d'optimisation :**
- Choix de l'option thérapeutique la plus adaptée
- Négociation avec les organismes complémentaires
- Utilisation des dispositifs d'aide existants
- Planification des achats et approvisionnement
- Suivi de l'évolution des tarifs et remboursements
- Consultation des services sociaux hospitaliers

Une approche structurée permet de réduire significativement l'impact financier du traitement.`,

            "Aides et dispositifs sociaux": `
De nombreux dispositifs d'aide sociale peuvent contribuer à faciliter l'accès aux traitements pour les patients en situation de précarité financière.

**Dispositifs disponibles :**
- Couverture Maladie Universelle Complémentaire (CMU-C)
- Aide Médicale de l'État (AME) pour certaines populations
- Fonds de solidarité des mutuelles
- Programmes d'aide des associations caritatives
- Dispositifs d'exception des laboratoires pharmaceutiques
- Aides départementales et communales spécifiques

Ces aides nécessitent généralement une évaluation sociale préalable et des démarches administratives spécifiques.`,

            "Perspectives d'évolution": `
L'évolution du coût des traitements dépend de facteurs multiples qui influenceront l'accessibilité future des thérapies innovantes.

**Tendances d'évolution :**
- Arrivée de biosimilaires et génériques
- Négociations tarifaires européennes coordonnées
- Développement de nouveaux modèles de financement
- Évaluation médico-économique renforcée
- Pression budgétaire des systèmes de santé
- Innovation thérapeutique continue

Ces évolutions devraient globalement améliorer l'accessibilité financière des traitements.`,

            "Conseils pratiques": `
Des conseils pratiques peuvent aider les patients à mieux gérer les aspects financiers de leur traitement.

**Recommandations pratiques :**
- Se renseigner sur tous les dispositifs de prise en charge disponibles
- Conserver tous les justificatifs de dépenses de santé
- Anticiper les démarches administratives nécessaires
- Solliciter l'aide des services sociaux en cas de difficulté
- Comparer les offres des organismes complémentaires
- Maintenir un dialogue ouvert avec l'équipe soignante sur les contraintes financières

Une approche proactive permet d'optimiser la prise en charge financière du traitement.`
        }
    }
};

// Fonction pour détecter la thématique d'un article
function detectTheme(filePath, content) {
    const path = filePath.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (path.includes('prix') || path.includes('cout') || path.includes('remboursement') || 
        contentLower.includes('prix') || contentLower.includes('coût') || contentLower.includes('remboursement')) {
        return 'prix';
    }
    if (path.includes('diabete') || contentLower.includes('diabète') || contentLower.includes('glycémie')) {
        return 'diabete';
    }
    return 'medicament';
}

// Fonction pour enrichir un article
function enrichArticle(filePath, content) {
    const theme = detectTheme(filePath, content);
    const template = enrichmentTemplates[theme];
    
    // Extraire le frontmatter et le contenu
    const frontmatterMatch = content.match(/^---[\s\S]*?---/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[0] : '';
    const articleContent = content.replace(/^---[\s\S]*?---/, '').trim();
    
    // Identifier les sections manquantes
    const existingSections = [];
    template.sections.forEach(section => {
        const sectionTitle = section.replace('## ', '');
        if (content.includes(section) || content.toLowerCase().includes(sectionTitle.toLowerCase())) {
            existingSections.push(section);
        }
    });
    
    // Ajouter les sections manquantes
    let enrichedContent = articleContent;
    
    template.sections.forEach(section => {
        if (!existingSections.includes(section)) {
            const sectionTitle = section.replace('## ', '');
            const sectionContent = template.content[sectionTitle];
            
            if (sectionContent) {
                enrichedContent += `\n\n${section}\n${sectionContent.trim()}`;
            }
        }
    });
    
    // Ajouter une conclusion si pas présente
    if (!content.toLowerCase().includes('conclusion') && !content.toLowerCase().includes('pour conclure')) {
        enrichedContent += `\n\n## Conclusion

En résumé, cette approche thérapeutique nécessite une évaluation médicale appropriée et un suivi personnalisé. Il est essentiel de maintenir un dialogue constant avec votre équipe soignante pour optimiser les bénéfices du traitement tout en minimisant les risques potentiels.

Pour toute question spécifique à votre situation, n'hésitez pas à consulter votre professionnel de santé qui saura vous orienter selon vos besoins particuliers et votre profil médical.`;
    }
    
    return frontmatter + '\n\n' + enrichedContent.trim();
}

// Fonction pour compter les mots
function countWords(content) {
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---/, '');
    const textContent = contentWithoutFrontmatter
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\n+/g, ' ')
        .trim();
    
    return textContent.split(/\s+/).filter(word => word.length > 0).length;
}

// Traitement principal
async function enrichShortArticles() {
    console.log('🚀 Enrichissement automatique des articles courts...\n');
    
    // Lire le rapport d'analyse précédent
    let articlesToEnrich = [];
    try {
        const report = JSON.parse(fs.readFileSync('./content-length-analysis.json', 'utf-8'));
        articlesToEnrich = report.articles.filter(article => article.needsEnrichment);
    } catch (error) {
        console.log('⚠️  Rapport d\'analyse non trouvé, recherche des articles courts...');
        // Fallback : rechercher manuellement
        const findShortArticles = (dir) => {
            const results = [];
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    results.push(...findShortArticles(fullPath));
                } else if (item.endsWith('.md')) {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const wordCount = countWords(content);
                    const relativePath = path.relative(CONTENT_DIR, fullPath);
                    
                    if (wordCount < MIN_WORD_COUNT) {
                        results.push({
                            path: relativePath,
                            wordCount,
                            needsEnrichment: true
                        });
                    }
                }
            }
            return results;
        };
        
        articlesToEnrich = findShortArticles(CONTENT_DIR);
    }
    
    if (articlesToEnrich.length === 0) {
        console.log('✅ Aucun article court trouvé ! Tous les articles ont plus de 500 mots.');
        return;
    }
    
    console.log(`📝 ${articlesToEnrich.length} articles à enrichir :\n`);
    
    let enrichedCount = 0;
    let totalWordsAdded = 0;
    
    for (const article of articlesToEnrich) {
        const fullPath = path.join(CONTENT_DIR, article.path);
        
        try {
            console.log(`🔄 Enrichissement de : ${article.path} (${article.wordCount} mots)`);
            
            const originalContent = fs.readFileSync(fullPath, 'utf-8');
            const enrichedContent = enrichArticle(article.path, originalContent);
            
            const newWordCount = countWords(enrichedContent);
            const wordsAdded = newWordCount - article.wordCount;
            
            // Sauvegarder l'article enrichi
            fs.writeFileSync(fullPath, enrichedContent);
            
            console.log(`   ✅ ${article.path} : ${article.wordCount} → ${newWordCount} mots (+${wordsAdded})`);
            enrichedCount++;
            totalWordsAdded += wordsAdded;
            
        } catch (error) {
            console.log(`   ❌ Erreur lors de l'enrichissement de ${article.path} : ${error.message}`);
        }
    }
    
    console.log(`\n🎉 ENRICHISSEMENT TERMINÉ :`);
    console.log(`   Articles enrichis : ${enrichedCount}/${articlesToEnrich.length}`);
    console.log(`   Mots ajoutés au total : ${totalWordsAdded}`);
    console.log(`   Moyenne de mots ajoutés par article : ${Math.round(totalWordsAdded / enrichedCount)}`);
    
    // Nouvelle analyse après enrichissement
    console.log('\n🔍 Nouvelle analyse après enrichissement...');
    setTimeout(() => {
        const { exec } = require('child_process');
        exec('node scripts/audit-content-length.mjs', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ Erreur lors de la nouvelle analyse :', error.message);
            } else {
                console.log(stdout);
            }
        });
    }, 1000);
}

enrichShortArticles().catch(console.error);
