#!/bin/bash

echo "🛍️ Démarrage du serveur de test Shopify Collabs..."
echo "📱 Pages de test disponibles :"
echo "   • http://localhost:4321/test-shopify-collabs"
echo "   • http://localhost:4321/admin-dashboard (onglet Affiliation)"
echo "   • http://localhost:4321/test-placement-intelligent"
echo "   • http://localhost:4321/test-affiliation"
echo ""
echo "✅ Vérifications à faire :"
echo "   • Code promo GLP1 visible en noir/doré"
echo "   • Badge de réduction -10% en rouge" 
echo "   • Prix barré 55,45 € → 49,90 €"
echo "   • Bouton CTA avec code intégré"
echo "   • Tracking Shopify Collabs dans console"
echo ""
echo "🚀 Lancement du serveur..."

npm run dev
