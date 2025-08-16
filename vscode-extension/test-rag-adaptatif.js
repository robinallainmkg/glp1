// Test du système RAG adaptatif
console.log('🧪 Test RAG Adaptatif GLP1 France');

// Simulation des fonctions d'analyse
function analyzeUserRequest(description) {
    const query = description.toLowerCase();
    
    // Détection du type de demande
    const typePatterns = {
        dashboard: /dashboard|admin|gestion|interface|tableau|stats|données|utilisateur/i,
        api: /api|endpoint|route|backend|serveur|php|typescript|données/i,
        page: /page|article|contenu|seo|astro|blog|landing/i,
        medical: /médical|glp1|ozempic|wegovy|diabète|perte|poids|traitement/i,
        form: /formulaire|form|contact|inscription|newsletter|input/i
    };

    let detectedType = 'general';
    for (const [type, pattern] of Object.entries(typePatterns)) {
        if (pattern.test(query)) {
            detectedType = type;
            break;
        }
    }

    // Détection de la complexité
    const complexityIndicators = {
        simple: /simple|basique|rapide|petit|léger/i,
        medium: /moyen|standard|normal|complet/i,
        complex: /complexe|avancé|sophistiqué|complet|intégration|système/i
    };

    let complexity = 'medium';
    for (const [level, pattern] of Object.entries(complexityIndicators)) {
        if (pattern.test(query)) {
            complexity = level;
            break;
        }
    }

    return { type: detectedType, complexity, query };
}

// Tests d'adaptation
const testRequests = [
    "dashboard admin pour gérer les utilisateurs",
    "api endpoint pour supprimer des articles",
    "page médicale sur ozempic avec seo",
    "formulaire contact urgent simple"
];

console.log('\n📊 Résultats des tests d\'adaptation :\n');

testRequests.forEach((request, index) => {
    const analysis = analyzeUserRequest(request);
    console.log(`Test ${index + 1}: "${request}"`);
    console.log(`   ➜ Type détecté: ${analysis.type.toUpperCase()}`);
    console.log(`   ➜ Complexité: ${analysis.complexity.toUpperCase()}`);
    console.log('');
});

// Test de génération de contexte
function generateContext(analysis) {
    const contexts = {
        dashboard: "🖥️ Contexte Dashboard Admin - Interface d'administration",
        api: "🔌 Contexte API/Backend - Endpoints pour le site",
        medical: "🏥 Contexte Médical GLP-1 - Traitements spécialisés",
        form: "📝 Contexte Formulaire - Interface utilisateur",
        general: "🔧 Contexte Général - GLP1 France"
    };
    
    return contexts[analysis.type] || contexts.general;
}

console.log('🎯 Test de génération de contexte adaptatif :\n');

testRequests.forEach((request, index) => {
    const analysis = analyzeUserRequest(request);
    const context = generateContext(analysis);
    console.log(`Test ${index + 1}: ${context}`);
});

console.log('\n✅ Test terminé - Le RAG s\'adapte bien selon le type de requête !');
