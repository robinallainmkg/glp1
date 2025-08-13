# 🧪 GUIDE DE TEST LOCAL - SHOPIFY COLLABS

## 🚀 Démarrer le serveur

1. **Via VS Code Tasks :**
   - Ouvrir la palette de commandes (`Cmd+Shift+P`)
   - Taper "Tasks: Run Task"
   - Choisir "🛍️ Test Shopify Collabs Local"

2. **Via Terminal :**
   ```bash
   npm run dev
   ```

3. **Le serveur démarre sur :** http://localhost:4321

## 📱 Pages à tester

### 1. Page de test principale
**URL :** http://localhost:4321/test-shopify-collabs

**À vérifier :**
- [ ] Code promo `GLP1` visible en noir/doré
- [ ] Badge de réduction `-10%` en rouge
- [ ] Prix barré `55,45 €` → `49,90 €`
- [ ] Bouton CTA avec "Profiter de -10% avec GLP1"
- [ ] Animation hover sur code promo
- [ ] Affichage responsive mobile/desktop

### 2. Dashboard admin
**URL :** http://localhost:4321/admin-dashboard
**Mot de passe :** `12031990Robin!`

**Onglet Affiliation à vérifier :**
- [ ] Métriques : 1 produit actif, code GLP1, -10%
- [ ] Tableau avec données Shopify Collabs réelles
- [ ] URL `talika.fr/GLP1` affichée
- [ ] Statut "Shopify Collabs Talika prêt"

### 3. Articles avec placement intelligent
**URL :** http://localhost:4321/test-placement-intelligent

**À vérifier :**
- [ ] Produit Talika s'affiche après 2 paragraphes
- [ ] Code promo visible dans l'article
- [ ] Placement contextuel selon mots-clés

### 4. Page corrigée (ancienne)
**URL :** http://localhost:4321/test-affiliation

**À vérifier :**
- [ ] Plus d'erreur de build
- [ ] Toutes les sections fonctionnelles
- [ ] Talika s'affiche dans tous les variants

## 🔍 Tests détaillés

### Design du code promo
- **Featured variant :** Grande section promo avec badge
- **Expanded variant :** Code promo compact intégré
- **Compact variant :** Badge une ligne `-10% • GLP1`
- **Card variant :** Code sous le prix

### Tracking et analytics
1. **Ouvrir DevTools (F12)**
2. **Onglet Console**
3. **Cliquer sur un bouton Talika**
4. **Vérifier :** Événement `🛍️ Clic Shopify Collabs` avec :
   - `product: "talika-bust-phytoserum"`
   - `discountCode: "GLP1"`
   - `affiliateUrl: "talika.fr/GLP1"`

### Lien de redirection
- **Clic sur bouton** → Redirection vers `https://talika.fr/GLP1`
- **Nouvel onglet** avec `rel="sponsored nofollow"`
- **UTM paramètres** automatiques ajoutés

## ✅ Checklist complète

### Visual
- [ ] Code promo `GLP1` noir/doré visible
- [ ] Badge `-10%` rouge accrocheur
- [ ] Prix barré `55,45 €` affiché
- [ ] Nouveau prix `49,90 €` mis en avant
- [ ] Bouton "Profiter de -10% avec GLP1"
- [ ] Responsive mobile parfait

### Fonctionnel
- [ ] Lien vers `talika.fr/GLP1` fonctionne
- [ ] Tracking Shopify Collabs actif
- [ ] Placement intelligent contextuel
- [ ] Dashboard admin avec vraies données
- [ ] Aucune erreur console
- [ ] Build sans erreur

### Performance
- [ ] Chargement rapide des images
- [ ] Animations fluides
- [ ] Responsive instantané
- [ ] SEO schema.org intact

## 🐛 Dépannage

### Si erreur de build :
```bash
npm run build
```

### Si problème d'import :
- Vérifier `/src/utils/affiliate-manager.ts`
- Toutes les fonctions exportées sont disponibles

### Si code promo pas visible :
- Vérifier `discountCode: "GLP1"` dans la data
- CSS charge bien les nouveaux styles

## 🎯 Prêt pour production

Une fois tous les tests ✅, tu peux déployer :
```bash
npm run build
node deploy-auto.js
```

Le système Shopify Collabs sera alors actif en production ! 🚀
