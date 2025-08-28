# 🚀 Migration vers Supabase - Instructions

## ✅ Actions Terminées

1. **Structure de données** - Nouveau schéma Supabase créé
2. **Code modifié** - affiliate.ts utilise maintenant Supabase
3. **Fichiers supprimés** - Collections Astro et fichiers MD supprimés
4. **Composants mis à jour** - AdaptiveAffiliateDisplay charge depuis Supabase
5. **Scripts créés** - Outils de test et d'ajout de produits
6. **Documentation** - Guide développeur mis à jour

## 🔧 Actions Requises (À faire maintenant)

### 1. Exécuter le script SQL dans Supabase

1. **Connectez-vous à Supabase** → Votre projet GLP1
2. **Allez dans "SQL Editor"**
3. **Copiez-collez** le contenu de `scripts/migrate-to-supabase.sql`
4. **Exécutez** le script (cela créera la table et insérera les 4 produits)

### 2. Tester la migration

```bash
# Test que tout fonctionne
npm run dev
node scripts/test-supabase-migration.mjs
```

### 3. Vérifier sur le site

1. **Allez sur** : http://localhost:4321/collections/glp1-cout/acheter-wegovy-en-france/
2. **Vérifiez** que les produits s'affichent dans la sidebar et inline
3. **Testez** sur mobile et desktop

## 🎯 Avantages de la Migration

### ✅ Avant (Fichiers MD)
- ❌ Données statiques
- ❌ Modification = redéploiement
- ❌ Pas de gestion centralisée
- ❌ Difficile d'ajouter des produits

### ✅ Après (Supabase)
- ✅ **Données dynamiques** - Changements en temps réel
- ✅ **Interface Supabase** - Ajout/modification facile
- ✅ **API REST** - Intégration possible avec d'autres outils
- ✅ **Scripts d'aide** - `add-product.mjs` pour ajouter rapidement
- ✅ **Évolutif** - Facile d'ajouter des champs (stock, notes, etc.)

## 📋 Structure de la Table

```sql
products (
  id                → UUID auto-généré
  title            → "Time Control 7+ - Talika"
  product_id       → "talika-time-control-7-plus" (slug unique)
  brand            → "Talika"
  category         → "Soin anti-âge"
  product_image    → "/images/products/talika-time-control-7.jpg"
  external_link    → "https://talika.fr/GLP1"
  price            → 52.00
  discount_percent → 15
  discount_code    → "GLP1"
  featured         → true
  priority         → 2 (ordre d'affichage)
  benefits_text    → HTML riche pour les bénéfices
  description      → Description simple
  slug             → "talika-time-control-7-plus"
  created_at       → Timestamp auto
  updated_at       → Timestamp auto
)
```

## 🆕 Ajouter un Nouveau Produit

### Méthode 1: Interface Supabase
1. **Table Editor** → `products`
2. **Insert** → **Row**
3. **Remplir** tous les champs
4. **Save**

### Méthode 2: Script Interactif
```bash
node scripts/add-product.mjs
# Suivre les instructions
```

### Méthode 3: SQL Direct
```sql
INSERT INTO products (title, product_id, brand, category, price, external_link, discount_percent, discount_code, featured, priority)
VALUES ('Nouveau Produit', 'nouveau-produit', 'Marque', 'Catégorie', 49.90, 'https://link.com', 10, 'CODE', true, 5);
```

## 🧪 Tests Disponibles

```bash
# Test complet de la migration
node scripts/test-supabase-migration.mjs

# Test direct Supabase (legacy)
node scripts/test-supabase-direct.mjs

# Ajouter un produit interactif
node scripts/add-product.mjs
```

## 🔍 Debug

### Produits ne s'affichent pas ?
1. **Vérifiez** les variables d'environnement Supabase
2. **Testez** : `node scripts/test-supabase-migration.mjs`
3. **Consultez** la console browser pour erreurs

### Erreur de connexion Supabase ?
1. **Vérifiez** `PUBLIC_SUPABASE_URL` et `PUBLIC_SUPABASE_ANON_KEY`
2. **Testez** la connexion dans Supabase Dashboard
3. **Vérifiez** les politiques RLS (Row Level Security)

## 📈 Évolutions Possibles

Avec cette base Supabase, vous pouvez facilement ajouter :
- **Stock/Disponibilité** → `stock_quantity`
- **Dates de promotion** → `promo_start_date`, `promo_end_date`
- **Notes internes** → `internal_notes`
- **Analytics** → `click_count`, `conversion_rate`
- **Multi-langues** → `title_en`, `description_en`
- **Images multiples** → Table séparée `product_images`

---

💡 **La migration est prête !** Exécutez le script SQL et testez le système.
