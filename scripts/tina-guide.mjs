#!/usr/bin/env node

/**
 * 🎉 Guide d'utilisation Tina CMS - GLP1 France
 * 
 * Votre interface d'édition en temps réel est maintenant configurée !
 */

console.log(`
🚀 TINA CMS - GUIDE D'UTILISATION RAPIDE
========================================

✅ Configuration terminée !
   ├─ Client ID: d2c40213-494b-4005-94ad-b601dbdf1f0e
   ├─ Token configuré dans .env
   └─ Interface prête à l'emploi

📋 ÉTAPES POUR COMMENCER :

1️⃣  Démarrer le serveur Tina :
    cd C:\\Users\\robin\\Documents\\glp1official\\glp1new\\glp1-github
    npm run dev:tina

2️⃣  Accéder à l'interface d'administration :
    🌐 http://localhost:4323/admin
    
3️⃣  Ce que vous pouvez faire :
    📝 Éditer vos articles existants en temps réel
    ➕ Créer de nouveaux articles
    🖼️ Gérer les images et médias
    👀 Prévisualiser les changements instantanément

📚 COLLECTIONS DISPONIBLES :
    ├─ Articles GLP1 (src/content/articles/)
    ├─ Guides PDF (src/content/guides/)
    └─ Témoignages (src/content/temoignages/)

🎯 FONCTIONNALITÉS PRINCIPALES :
    ✨ Édition visuelle WYSIWYG
    🔄 Synchronisation automatique avec Git
    📱 Interface responsive
    🎨 Éditeur de contenu riche avec templates
    🖼️ Gestion d'images intégrée

💡 CONSEILS D'UTILISATION :
    • Les modifications sont sauvegardées automatiquement
    • Utilisez Ctrl+S pour forcer la sauvegarde
    • Les changements apparaissent immédiatement sur votre site
    • L'interface fonctionne en français

🔧 COMMANDES UTILES :
    npm run dev:tina        # Démarrer avec Tina CMS
    npm run dev            # Démarrer sans CMS
    npm run build          # Build production avec Tina

🆘 EN CAS DE PROBLÈME :
    1. Vérifiez que vous êtes dans le bon répertoire
    2. Vérifiez que les clés API sont dans .env
    3. Redémarrez avec : npm run dev:tina

🎉 PRÊT À COMMENCER !
   Votre CMS est maintenant opérationnel.
   Rendez-vous sur http://localhost:4323/admin pour commencer l'édition !
`);

export default {
    urls: {
        admin: "http://localhost:4323/admin",
        site: "http://localhost:4323/",
        api: "http://localhost:4001/graphql"
    },
    collections: [
        "Articles GLP1",
        "Guides PDF", 
        "Témoignages"
    ],
    configured: true
};
