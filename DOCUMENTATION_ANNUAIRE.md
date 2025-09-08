# 📋 Documentation Système Annuaire Professionnels GLP-1

## 🏗️ Structure de la Base de Données

### **Table `french_cities`**
Structure des villes françaises avec géolocalisation :
```sql
- id (UUID, Primary Key)
- name (VARCHAR) - Nom de la ville
- department (VARCHAR) - Code département (ex: "75", "69")
- region (VARCHAR) - Région française
- postal_code (VARCHAR) - Code postal
- latitude/longitude (DECIMAL) - Coordonnées GPS
- population (INTEGER) - Nombre d'habitants
- slug (VARCHAR) - URL-friendly (ex: "paris", "lyon")
- created_at/updated_at (TIMESTAMP)
```

### **Table `health_professionals`**
Profils complets des professionnels de santé :
```sql
- id (UUID, Primary Key)
- first_name, last_name, title (VARCHAR) - Identité
- specialty (VARCHAR) - Spécialité principale
- sub_specialties (TEXT[]) - Sous-spécialités (array)
- hospital_clinic (VARCHAR) - Établissement
- address, postal_code (TEXT) - Adresse complète
- city_id (UUID) - Référence vers french_cities
- phone, email, website (VARCHAR) - Contact
- accepts_glp1 (BOOLEAN) - Prescrit GLP-1
- accepts_new_patients (BOOLEAN) - Accepte nouveaux patients
- consultation_fee (DECIMAL) - Tarif consultation
- languages (TEXT[]) - Langues parlées
- certifications, education (TEXT[]) - Formation
- bio (TEXT) - Présentation
- rating, review_count (DECIMAL/INTEGER) - Notes
- verified, featured (BOOLEAN) - Statut
```

### **Table `professional_reviews`**
Système d'avis patients :
```sql
- id (UUID, Primary Key)
- professional_id (UUID) - Référence professionnel
- patient_name (VARCHAR) - Nom du patient
- rating (INTEGER 1-5) - Note
- comment (TEXT) - Commentaire
- verified (BOOLEAN) - Modération
- created_at (TIMESTAMP) - Date
```

---

## 🔍 Configuration Supabase Existante

**Variables d'environnement trouvées :**
```bash
PUBLIC_SUPABASE_URL="https://htdlypqjtpxhzmiwgwlt.supabase.co"
PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpUIn0..."
```

**Fichiers de configuration existants :**
- `src/lib/supabase.js` (à créer)
- Variables dans plusieurs scripts de validation
- 8 produits Supabase déjà actifs sur le projet

---

## 🚀 Méthodes d'Enrichissement de la Base de Données

### **Méthode 1: Interface Supabase Dashboard (Recommandée)**

1. **Connexion à Supabase**
   ```
   URL: https://supabase.com/dashboard
   Projet: https://htdlypqjtpxhzmiwgwlt.supabase.co
   ```

2. **Exécution des scripts SQL** (dans l'ordre)
   - `scripts/database/create-professionals-tables.sql` → Tables et structure
   - `scripts/database/seed-french-cities.sql` → 50+ villes françaises  
   - `scripts/database/seed-professionals.sql` → Professionnels d'exemple
   - `scripts/database/optimize-performance.sql` → Index et optimisations

3. **Navigation dans Supabase**
   ```
   Dashboard → Votre Projet → SQL Editor → New Query
   Coller le contenu de chaque fichier SQL
   Cliquer "Run" pour chaque script
   ```

### **Méthode 2: Script d'Enrichissement Automatique**

**Script créé :** `scripts/setup-database-enrichment.ps1`

**Exécution :**
```powershell
# Lancer le script de setup
.\scripts\setup-database-enrichment.ps1

# Puis exécuter l'enrichissement automatique
node scripts/enrich-database.mjs
```

**Fonctionnalités du script :**
- ✅ Ajoute des professionnels dans toutes les villes
- ✅ Génère des avis patients réalistes
- ✅ Calcule automatiquement les statistiques
- ✅ Vérifie la cohérence des données

### **Méthode 3: API REST Supabase**

**Import via API directement :**
```javascript
// Exemple d'ajout via l'API
const { data, error } = await supabase
  .from('health_professionals')
  .insert([{
    first_name: 'Marie',
    last_name: 'Dupont',
    title: 'Dr.',
    specialty: 'Endocrinologie',
    city_id: 'uuid-de-la-ville',
    accepts_glp1: true
  }]);
```

---

## 📊 Structure des Données d'Exemple

### **Villes incluses** (50+ villes)
```
Paris, Lyon, Marseille, Toulouse, Bordeaux, Lille, Nice, Nantes,
Strasbourg, Montpellier, Rennes, Reims, Saint-Étienne, Toulon,
Le Havre, Grenoble, Dijon, Angers, Villeurbanne, Saint-Denis...
```

### **Spécialités couvertes**
```
- Endocrinologie
- Diabétologie  
- Nutrition
- Médecine générale
- Médecine de l'obésité
- Médecine interne
```

### **Données professionnels**
```
- 10+ professionnels d'exemple par spécialité
- Profils complets avec contact et bio
- Certifications et formations
- Tarifs et disponibilités
- Status vérifié/recommandé
```

---

## 🎯 Pages Générées par le Système

### **URLs dynamiques créées**
```
/annuaire-professionnels                    → Index principal
/annuaire-professionnels/paris              → Professionnels à Paris  
/annuaire-professionnels/lyon               → Professionnels à Lyon
/annuaire-professionnels/paris/uuid-123     → Profil détaillé
```

### **SEO optimisé pour**
```
- "Médecin GLP-1 à [ville]"
- "Endocrinologue [ville]" 
- "Prescription Ozempic [ville]"
- "Diabétologue près de moi"
```

---

## ⚡ Performance et Optimisations

### **Index de base de données**
```sql
- idx_professionals_city_id (recherche par ville)
- idx_professionals_specialty (filtrage spécialité)  
- idx_professionals_accepts_glp1 (filtrage GLP-1)
- idx_french_cities_slug (URLs optimisées)
```

### **Vues matérialisées**
```sql
- city_professional_stats (statistiques par ville)
- professional_search_view (recherche optimisée)
```

### **Cache et performances**
```javascript
- Cache API 5-10 minutes
- Pagination automatique
- Lazy loading des résultats
- Optimisation images
```
