# 🛠️ GUIDE TROUBLESHOOTING - GLP1 France

**Dernière mise à jour** : 31 août 2025  
**Statut** : ✅ Solutions testées et validées  

## 🎯 Problèmes Fréquents et Solutions

### 1. 🔧 Erreurs Build Astro/Vite

#### Problème : Null Bytes dans Modules Virtuels
**Symptômes** :
```bash
Error: ENOENT: no such file or directory, stat '/path/with/\x00/nullbytes'
Error: Virtual module generation failed
```

**Solution** (31/08/2025) :
1. **Patch Vite temporaire** : Le système skip automatiquement les paths avec null bytes
2. **Debug** : Utiliser `DEBUG_ASTRO=1` pour diagnostics détaillés
3. **Nettoyage** :
```bash
rm -rf node_modules dist .astro
npm install
npm run build
```

#### Problème : Build échoue après modifications
**Solution** :
```bash
# Nettoyage complet
rm -rf node_modules dist .astro package-lock.json
npm install
npm run build
```

### 2. 🔄 Problèmes SEO et Redirections

#### Problème : 404 sur anciennes URLs
**Exemple** : `/collections/medicaments-glp1/mounjaro-prix-france/` → 404

**Solution** : Créer une page de redirection 301
```astro
---
// src/pages/collections/medicaments-glp1/mounjaro-prix-france.astro
if (Astro.url.pathname === '/collections/medicaments-glp1/mounjaro-prix-france/') {
  return Astro.redirect('/collections/glp1-cout/prix-mounjaro-france/', 301);
}
---
```

#### Problème : Sitemap non synchronisé
**Solution** : Vérifier `/src/pages/sitemap.xml.ts`
```typescript
// S'assurer que toutes les nouvelles URLs sont incluses
const staticPages = [
  '/',
  '/guides/quel-traitement-glp1-choisir/', // Page diagnostic
  // ... autres pages
];
```

### 3. 📱 Problèmes Affiliation

#### Problème : Sidebar manquante sur une page
**Symptômes** : Page s'affiche sans produits affiliés

**Diagnostic** :
1. Vérifier le layout utilisé :
```astro
---
layout: '../../layouts/ArticleWithAffiliateSidebar.astro'  // ✅ Correct
---
```

2. Vérifier la configuration du composant :
```astro
<AdaptiveAffiliateDisplay 
  products={affiliateProducts}
  forceSidebar={true}      // ✅ Force sidebar
  disableInline={true}     // ✅ Désactive inline si souhaité
/>
```

#### Problème : Produits Supabase ne se chargent pas
**Diagnostic** :
1. **Tester la connexion** :
```bash
npm run dev
# Aller sur http://localhost:4321/api/test-supabase
```

2. **Vérifier les logs** :
```bash
🔍 Connexion à Supabase pour charger les produits...
✅ Produits Supabase chargés: 4 produits trouvés
```

**Solution** si échec :
- Vérifier variables environnement Supabase
- Vérifier connectivité réseau
- Consulter console pour erreurs JavaScript

### 4. 🎨 Problèmes de Style et Responsive

#### Problème : Sidebar casse le layout mobile
**Solution** : Vérifier classes Tailwind responsive
```astro
<div class="hidden lg:block lg:w-80">  <!-- Sidebar desktop uniquement -->
<div class="block lg:hidden">         <!-- Version mobile -->
```

#### Problème : Images produits ne s'affichent pas
**Solution** :
1. Vérifier chemin image : `/images/products/nom-produit.webp`
2. S'assurer que l'image existe dans `/public/images/products/`
3. Format recommandé : WebP pour performance

### 5. 📊 Problèmes Performance

#### Problème : Build lent (> 30 secondes)
**Solution** :
1. **Optimiser images** :
```bash
npm run optimize-images
```

2. **Paralléliser build** : Astro optimise automatiquement
3. **Vérifier taille assets** dans `/public/`

#### Problème : Pages lentes en production
**Diagnostic** :
- Vérifier Lighthouse scores
- Optimiser images WebP
- Minifier CSS/JS (automatique avec Astro)

## 🚨 Procédures d'Urgence

### Site Down - Checklist Rapide
1. **Vérifier build** : `npm run build` local
2. **Tester preview** : `npm run preview`
3. **Rollback git** si nécessaire :
```bash
git log --oneline -10          # Voir derniers commits
git revert <commit-hash>       # Annuler commit problématique
git push                       # Déployer correction
```

### Corruption Base Supabase
1. **Backup automatique** : Supabase fait des backups automatiques
2. **Vérifier intégrité** :
```sql
SELECT COUNT(*) FROM products WHERE featured = true;  -- Doit retourner 4
```
3. **Restaurer données** si nécessaire depuis scripts

## 🔍 Outils de Diagnostic

### Debug Mode Astro
```bash
DEBUG_ASTRO=1 npm run build     # Active logs détaillés
```

### Test Supabase
```bash
curl -X GET "http://localhost:4321/api/test-supabase"
```

### Vérification Build
```bash
npm run build                   # Build production
npm run preview                 # Test local du build
```

### Analyse Performance
```bash
npx lighthouse http://localhost:4321 --output=html
```

## 📝 Logs Utiles

### Build Success Normal
```
✓ Completed in 26.78s.
[build] 107 page(s) built in 26.78s
```

### Supabase Connection Success
```
✅ Supabase configuré pour GLP-1 France: OK
✅ Produits récupérés: 4
🔍 Premier produit complet: { title: 'Glutamine - Nutrimuscle', ... }
```

### Redirection Working
```
[301] /collections/medicaments-glp1/mounjaro-prix-france/ 3ms
[200] /collections/glp1-cout/prix-mounjaro-france/ 824ms
```

## 🎯 Préventions

### Avant Modification Importante
1. **Branch feature** :
```bash
git checkout -b feature/nom-modification
```

2. **Test local complet** :
```bash
npm run build && npm run preview
```

3. **Vérifier pages critiques** :
- Page d'accueil
- Page diagnostic
- Collections principales

### Monitoring Continu
- **Google Search Console** : Vérifier indexation
- **Analytics** : Surveiller trafic
- **Lighthouse** : Scores performance hebdomadaires

## 📞 Escalade

### Problème Non Résolu
1. **Documentation** : Créer issue GitHub avec logs complets
2. **Reproduction** : Steps précis pour reproduire
3. **Environment** : Node.js version, OS, navigateur
4. **Logs** : Copier logs complets build/runtime

### Contact Support
- **GitHub Issues** : Pour bugs techniques
- **Documentation** : Mettre à jour ce guide avec solution trouvée

---

**Maintenu par** : Équipe technique + Agent IA  
**Prochaine révision** : Septembre 2025
