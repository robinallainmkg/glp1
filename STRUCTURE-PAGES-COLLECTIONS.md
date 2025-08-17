# 🎯 STRUCTURE PAGES COHÉRENTE AVEC COLLECTIONS ASTRO

## 📚 COLLECTIONS ASTRO EXISTANTES (src/content/)
```
src/content/
├── alternatives-glp1/      # Articles alternatives
├── effets-secondaires-glp1/ # Effets secondaires
├── glp1-cout/             # Prix et coûts
├── glp1-diabete/          # GLP-1 et diabète
├── glp1-perte-de-poids/   # Perte de poids
├── medecins-glp1-france/  # Médecins en France
├── medicaments-glp1/      # Médicaments
├── recherche-glp1/        # Recherches scientifiques
└── regime-glp1/           # Régimes
```

## 🎯 NOUVELLE STRUCTURE PAGES ALIGNÉE

```
src/pages/
├── 📁 api/ ✅ (garde)
├── 📁 admin/ ✅ (garde)
├── 📁 collections/ 🆕 (ALIGNÉ avec src/content/)
│   ├── 📁 alternatives-glp1/       # ← MOVE depuis racine
│   │   ├── index.astro             # Page liste collection
│   │   └── [slug].astro           # Page article individuel
│   ├── 📁 effets-secondaires-glp1/ # ← MOVE depuis racine
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── 📁 glp1-cout/              # ← MOVE depuis racine
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── 📁 glp1-diabete/           # ← MOVE depuis racine
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── 📁 glp1-perte-de-poids/    # ← MOVE depuis racine
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── 📁 medecins-glp1-france/   # ← MOVE depuis racine
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── 📁 medicaments-glp1/       # ← MOVE depuis racine
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── 📁 recherche-glp1/         # ← MOVE depuis racine
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── 📁 regime-glp1/            # ← MOVE depuis racine
│       ├── index.astro
│       └── [slug].astro
├── 📁 guides/ 🆕 (pages guides individuelles)
│   ├── qu-est-ce-que-glp1.astro
│   ├── quel-traitement-glp1-choisir.astro
│   ├── guide-beaute-perte-de-poids-glp1.astro
│   └── nouveaux-medicaments-perdre-poids.astro
├── 📁 temoignages/ 🆕 (témoignages individuels)
│   ├── laurent-transformation-glp1.astro
│   ├── marie-transformation-glp1.astro
│   └── sophie-transformation-glp1.astro
├── 📁 outils/ 🆕 (simulateurs & outils)
│   ├── avant-apres-glp1.astro
│   ├── obs-simulator/
│   └── produits-recommandes.astro
├── 📁 legal/ 🆕 (pages légales)
│   ├── mentions-legales.astro
│   ├── politique-confidentialite.astro
│   └── contact.astro
├── 📁 _utils/ 🆕 (utilitaires)
│   ├── sitemap.xml.ts
│   └── dashboard-users.html
├── experts.astro ✅ (garde racine)
├── articles/ (dossier existant)
├── produits/ (dossier existant)
└── index.astro ✅ (garde)
```

## 🎯 AVANTAGES DE CETTE STRUCTURE

### 1. **Cohérence Content ↔ Pages**
- Chaque collection `src/content/X/` a sa page `src/pages/collections/X/`
- Structure miroir parfaite
- Navigation intuitive

### 2. **URLs Logiques**
```
/collections/glp1-perte-de-poids/               # Liste collection
/collections/glp1-perte-de-poids/ozempic-prix  # Article individuel
/guides/qu-est-ce-que-glp1                      # Guide individuel
/temoignages/laurent-transformation-glp1       # Témoignage
```

### 3. **Maintenance Facilitée**
- Nouvelle collection → Ajouter dans content/ + pages/collections/
- Nouveau guide → pages/guides/
- Nouveau témoignage → pages/temoignages/

## 🚀 PLAN DE MIGRATION REVU

### Phase 1 : Créer Structure Alignée
```powershell
# Structure collections (miroir de content)
mkdir src/pages/collections

# Structure catégorisée pour autres pages
mkdir src/pages/{guides,temoignages,outils,legal,_utils}
```

### Phase 2 : Migration Collections (1:1 avec content)
```powershell
# Collections existantes → collections/
mv src/pages/alternatives-glp1/ src/pages/collections/
mv src/pages/effets-secondaires-glp1/ src/pages/collections/
mv src/pages/glp1-cout/ src/pages/collections/
mv src/pages/glp1-diabete/ src/pages/collections/
mv src/pages/glp1-perte-de-poids/ src/pages/collections/
mv src/pages/medecins-glp1-france/ src/pages/collections/
mv src/pages/medicaments-glp1/ src/pages/collections/
mv src/pages/recherche-glp1/ src/pages/collections/
mv src/pages/regime-glp1/ src/pages/collections/
```

### Phase 3 : Migration Pages Individuelles
```powershell
# Guides
mv src/pages/qu-est-ce-que-glp1.astro src/pages/guides/
mv src/pages/quel-traitement-glp1-choisir.astro src/pages/guides/
mv src/pages/guide-beaute-perte-de-poids-glp1.astro src/pages/guides/
mv src/pages/nouveaux-medicaments-perdre-poids.astro src/pages/guides/

# Témoignages
mv src/pages/temoignage-*.astro src/pages/temoignages/

# Outils
mv src/pages/avant-apres-glp1.astro src/pages/outils/
mv src/pages/obs-simulator/ src/pages/outils/
mv src/pages/produits-recommandes.astro src/pages/outils/

# Legal
mv src/pages/mentions-legales.astro src/pages/legal/
mv src/pages/politique-confidentialite.astro src/pages/legal/
mv src/pages/contact.astro src/pages/legal/

# Utils
mv src/pages/sitemap.xml.ts src/pages/_utils/
mv src/pages/dashboard-users.html src/pages/_utils/
```

## ✅ RÉSULTAT FINAL

### Structure Cohérente
```
src/content/glp1-perte-de-poids/     # Articles markdown
  ↕️ (correspondance parfaite)
src/pages/collections/glp1-perte-de-poids/  # Pages Astro
```

### Navigation Logique
- **Collections** → `/collections/nom-collection/`
- **Guides** → `/guides/nom-guide`
- **Témoignages** → `/temoignages/nom-temoignage`
- **Outils** → `/outils/nom-outil`

**Cette structure vous convient-elle mieux ?** 🎯
