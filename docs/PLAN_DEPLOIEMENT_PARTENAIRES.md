# Plan de Déploiement - Page Partenaires
*Date : 21 août 2025*
*Version : 1.0*

## 🎯 Objectif
Déployer avec succès la nouvelle page partenaires accessible à `/partenaires` avec tous les liens partenaires intégrés dans le footer.

## 📋 Checklist Pré-Déploiement

### ✅ Fichiers Créés et Modifiés
- [x] `src/content/pages-statiques/partenaires.md` - Contenu de la page
- [x] `public/images/thumbnails/partenaires-glp1-illus.svg` - Illustration personnalisée
- [x] `src/pages/partenaires.astro` - Route de la page
- [x] `src/layouts/BaseLayout.astro` - Lien ajouté dans le footer

### ✅ Tests Effectués
- [x] Build Astro réussi (`npm run astro:build`)
- [x] Page accessible en local à `/partenaires`
- [x] Tous les 7 liens partenaires fonctionnels
- [x] Footer mis à jour avec le lien "Partenaires"

## 🚀 Étapes de Déploiement

### Phase 1 : Validation Finale (5 min)
```bash
# 1. Vérifier que tous les fichiers sont présents
git status

# 2. Test build complet (TinaCMS + Astro)
npm run build

# 3. Vérifier le serveur local
npm run dev
# Tester : http://localhost:4321/partenaires
```

### Phase 2 : Commit et Push (5 min)
```bash
# 1. Ajouter tous les nouveaux fichiers
git add .

# 2. Commit avec message descriptif
git commit -m "feat: Ajout page partenaires avec 7 liens + intégration footer

- Création page /partenaires avec contenu complet
- Ajout illustration SVG personnalisée
- Intégration lien partenaires dans footer
- SEO optimisé avec métadonnées et structured data"

# 3. Push vers la branche production
git push origin production
```

### Phase 3 : Déploiement Automatique (2-5 min)
- Le déploiement se fait automatiquement via Vercel/Netlify
- Surveiller les logs de déploiement
- Vérifier que le build passe sans erreur

### Phase 4 : Validation Post-Déploiement (10 min)
```bash
# Tests à effectuer sur le site en production :
```

#### 🌐 Tests de Navigation
- [ ] Page d'accueil → footer → lien "Partenaires" fonctionne
- [ ] URL directe `https://votre-domaine.com/partenaires` accessible
- [ ] Tous les 7 liens partenaires sont cliquables et ouvrent en nouvelle fenêtre

#### 📱 Tests Responsive
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### 🔍 Tests SEO
- [ ] Métadonnées présentes (title, description, Open Graph)
- [ ] Structured data validé avec Google Rich Snippets
- [ ] Sitemap.xml mis à jour automatiquement

#### ⚡ Tests Performance
- [ ] Temps de chargement < 3 secondes
- [ ] Image SVG se charge correctement
- [ ] Pas d'erreurs console

## 🎯 Liens Partenaires à Valider

### 📍 Liste des 7 Partenaires
1. **Secous.com** - https://www.secous.com
2. **TopLien.fr** - https://www.toplien.fr
3. **Infobel.com** - https://www.infobel.com
4. **FaitesVousConnaitre.com** - https://www.faitesvousconnaitre.com
5. **WebWiki.fr** - https://www.webwiki.fr
6. **Le-Bottin.com** - https://www.le-bottin.com
7. **MeilleurDuWeb.com** - https://www.meilleurduweb.com

### ✅ Vérifications à Effectuer
- [ ] Chaque lien s'ouvre en nouvelle fenêtre (`target="_blank"`)
- [ ] Attribut `rel="noopener noreferrer"` présent pour la sécurité
- [ ] Tous les liens sont valides et accessibles

## 🚨 Plan de Rollback

En cas de problème pendant le déploiement :

### Option 1 : Rollback Git
```bash
# Revenir au commit précédent
git log --oneline -5
git revert HEAD
git push origin production
```

### Option 2 : Rollback Vercel/Netlify
- Aller dans le dashboard de déploiement
- Sélectionner le déploiement précédent stable
- Effectuer un rollback en un clic

## 📊 Métriques de Succès

### Critères de Validation
- [ ] Page partenaires accessible sans erreur 404
- [ ] Temps de chargement < 3 secondes
- [ ] 0 erreur dans les logs de production
- [ ] Footer mis à jour sur toutes les pages
- [ ] Tous les liens partenaires fonctionnels

### Monitoring Post-Déploiement
- Surveiller les analytics pour les visites sur `/partenaires`
- Vérifier les erreurs 404 dans les logs
- Monitorer les performances via Lighthouse

## 🔧 Commandes Utiles

### Build et Test
```bash
# Build Astro seul (plus rapide pour test)
npm run astro:build

# Build complet avec TinaCMS
npm run build

# Serveur de développement
npm run dev

# Vérifier les erreurs TypeScript
npm run astro:check
```

### Git et Déploiement
```bash
# Statut des fichiers modifiés
git status

# Voir les différences
git diff

# Push vers production
git push origin production

# Vérifier l'historique
git log --oneline -10
```

## 📝 Notes Importantes

### ⚠️ Points d'Attention
1. **TinaCMS Schema** : Peut prendre quelques minutes pour indexer la nouvelle collection
2. **Cache Browser** : Vider le cache pour voir les changements du footer
3. **SEO** : La page sera indexée automatiquement via le sitemap.xml

### 🔄 Maintenance Future
- Surveiller la validité des liens partenaires (scan mensuel)
- Mettre à jour les descriptions si nécessaire
- Ajouter de nouveaux partenaires selon les besoins

## ✅ Validation Finale

Une fois le déploiement terminé, cocher cette liste :

- [ ] **Page accessible** : https://votre-domaine.com/partenaires
- [ ] **Footer mis à jour** : Lien "Partenaires" visible sur toutes les pages
- [ ] **7 liens partenaires** : Tous fonctionnels et en nouvelle fenêtre
- [ ] **SEO optimisé** : Métadonnées et structured data présents
- [ ] **Performance OK** : Lighthouse score > 90
- [ ] **Mobile friendly** : Responsive design validé
- [ ] **Analytics tracking** : Suivi des visites activé

---

**✨ Déploiement Réussi !**

La page partenaires est maintenant live et accessible à vos utilisateurs. Tous les partenaires bénéficient d'une visibilité optimale via le footer présent sur chaque page du site.
