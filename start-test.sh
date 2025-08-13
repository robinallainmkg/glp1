#!/bin/bash

echo "🛍️ LANCEMENT DU SERVEUR DE TEST SHOPIFY COLLABS"
echo "=============================================="
echo ""
echo "📋 Pages de test à vérifier :"
echo "   → http://localhost:4321/test-nouveau-placement"
echo "   → http://localhost:4321/test-shopify-collabs"
echo "   → http://localhost:4321/admin-dashboard (onglet Affiliation)"
echo ""
echo "✅ Vérifications à faire :"
echo "   • Code promo GLP1 affiché UNE SEULE FOIS"
echo "   • Bannière APRÈS 2 PARAGRAPHES (pas en bas)"
echo "   • Prix côte à côte avec code promo"
echo "   • Design simplifié sans doublons"
echo ""
echo "🚀 Démarrage du serveur..."
echo ""

npm run dev
