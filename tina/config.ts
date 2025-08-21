import { defineConfig } from "tinacms";

// Template de champs pour les pages statiques
const staticPageFields = [
  {
    type: "string" as const,
    name: "title",
    label: "Titre de la page",
    isTitle: true,
    required: true,
    description: "Titre principal qui apparaîtra dans le <h1> et le <title>",
  },
  {
    type: "string" as const,
    name: "description",
    label: "Meta Description",
    required: true,
    description: "Description SEO (150-160 caractères recommandés)",
    ui: {
      component: "textarea",
    },
  },
  {
    type: "string" as const,
    name: "slug",
    label: "URL de la page (slug)",
    required: true,
    description: "URL finale de la page (sans espaces, caractères spéciaux)",
  },
  {
    type: "string" as const,
    name: "pageType",
    label: "Type de page",
    options: [
      "Homepage",
      "Guide statique", 
      "Page collection",
      "Page légale",
      "Page contact",
      "Page outils",
      "Page témoignages",
      "Autre"
    ],
    description: "Type de page statique",
  },
  {
    type: "boolean" as const,
    name: "noIndex",
    label: "Exclure des moteurs de recherche",
    description: "Cocher pour empêcher l'indexation (noindex)",
  },
  {
    type: "rich-text" as const,
    name: "body",
    label: "Contenu de la page",
    isBody: true,
    description: "Contenu principal en Markdown",
  },
];

// Template de champs standardisé pour toutes les collections
const standardArticleFields = [
  // Champs de base
  {
    type: "string" as const,
    name: "title",
    label: "Titre de l'article",
    isTitle: true,
    required: true,
    description: "Titre principal qui apparaîtra dans le <h1> et le <title>",
  },
  {
    type: "string" as const,
    name: "description",
    label: "Meta Description",
    required: true,
    description: "Description SEO (150-160 caractères recommandés)",
    ui: {
      component: "textarea",
    },
  },
  {
    type: "string" as const,
    name: "slug",
    label: "URL de l'article (slug)",
    required: true,
    description: "URL finale de l'article (sans espaces, caractères spéciaux)",
  },
  
  // Informations de publication
  {
    type: "datetime" as const,
    name: "pubDate",
    label: "Date de publication",
    required: true,
  },
  {
    type: "datetime" as const,
    name: "updatedDate",
    label: "Date de mise à jour",
    description: "Date de dernière modification (optionnel)",
  },
  {
    type: "string" as const,
    name: "author",
    label: "Auteur",
    options: [
      "Dr. Sarah Martin",
      "Dr. Pierre Dubois", 
      "Dr. Marie Rousseau",
      "Équipe GLP1-France"
    ],
    description: "Auteur de l'article",
  },
  
  // SEO et catégorisation
  {
    type: "string" as const,
    name: "category",
    label: "Catégorie principale",
    required: true,
    options: [
      "Guide médical",
      "Témoignage",
      "Étude scientifique",
      "Comparatif",
      "FAQ",
      "Actualité"
    ],
  },
  {
    type: "string" as const,
    name: "tags",
    label: "Mots-clés (format: [\"mot1\", \"mot2\", \"mot3\"])",
    description: "Mots-clés au format tableau JSON pour le SEO",
    ui: {
      component: "textarea",
    },
  },
  {
    type: "string" as const,
    name: "collection",
    label: "Collection",
    required: true,
    options: [
      "medicaments-glp1",
      "glp1-perte-de-poids", 
      "glp1-cout",
      "glp1-diabete",
      "effets-secondaires-glp1",
      "medecins-glp1-france",
      "recherche-glp1",
      "regime-glp1",
      "alternatives-glp1"
    ],
    description: "Collection à laquelle appartient l'article",
  },
  
  // Images et médias
  {
    type: "image" as const,
    name: "thumbnail",
    label: "Image principale",
    description: "Image de couverture de l'article (format recommandé: 1200x630px)",
  },
  {
    type: "string" as const,
    name: "thumbnailAlt",
    label: "Texte alternatif de l'image",
    description: "Description de l'image pour l'accessibilité et le SEO",
  },
  {
    type: "image" as const,
    name: "ogImage",
    label: "Image Open Graph",
    description: "Image pour les réseaux sociaux (optionnel, utilise thumbnail par défaut)",
  },
  
  // SEO avancé
  {
    type: "boolean" as const,
    name: "featured",
    label: "Article en vedette",
    description: "Mettre en avant cet article sur la page d'accueil",
  },
  {
    type: "number" as const,
    name: "priority",
    label: "Priorité d'affichage",
    description: "Ordre d'affichage (1 = plus haute priorité)",
  },
  {
    type: "string" as const,
    name: "metaTitle",
    label: "Titre SEO personnalisé",
    description: "Titre personnalisé pour le <title> (optionnel, utilise 'title' par défaut)",
  },
  {
    type: "string" as const,
    name: "canonicalUrl",
    label: "URL canonique",
    description: "URL canonique si différente de l'URL actuelle",
  },
  
  // Configuration avancée
  {
    type: "boolean" as const,
    name: "noIndex",
    label: "Exclure des moteurs de recherche",
    description: "Cocher pour empêcher l'indexation (noindex)",
  },
  {
    type: "string" as const,
    name: "schema",
    label: "Type de contenu Schema.org",
    options: [
      "Article",
      "MedicalWebPage", 
      "FAQPage",
      "HowTo",
      "Review"
    ],
    description: "Type de données structurées pour le SEO",
  },
  
  // Contenu
  {
    type: "rich-text" as const,
    name: "body",
    label: "Contenu de l'article",
    isBody: true,
    description: "Contenu principal en Markdown",
  },
  
  // Informations complémentaires
  {
    type: "object" as const,
    name: "readingTime",
    label: "Temps de lecture",
    fields: [
      {
        type: "number" as const,
        name: "minutes",
        label: "Minutes",
      },
      {
        type: "string" as const, 
        name: "text",
        label: "Texte affiché",
      }
    ]
  }
];

export default defineConfig({
  branch: process.env.TINA_BRANCH || "main",
  
  // Configuration avec vos clés API
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  
  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public",
    },
  },
  
  schema: {
    collections: [
      // Collection Pages Statiques
      {
        name: "pages_statiques",
        label: "📄 Pages Statiques",
        path: "src/content/pages-statiques",
        format: "md",
        fields: staticPageFields,
      },
      // Collection Médicaments GLP1
      {
        name: "medicaments_glp1",
        label: "💊 Médicaments GLP1",
        path: "src/content/medicaments-glp1",
        format: "md",
        fields: standardArticleFields,
      },
      // Collection Perte de Poids
      {
        name: "glp1_perte_de_poids",
        label: "⚖️ GLP1 Perte de Poids",
        path: "src/content/glp1-perte-de-poids",
        format: "md",
        fields: standardArticleFields,
      },
      // Collection Coût/Prix
      {
        name: "glp1_cout",
        label: "💰 Coût et Prix",
        path: "src/content/glp1-cout",
        format: "md",
        fields: standardArticleFields,
      },
      // Collection Diabète
      {
        name: "glp1_diabete",
        label: "🩺 GLP1 et Diabète",
        path: "src/content/glp1-diabete",
        format: "md",
        fields: standardArticleFields,
      },
      // Collection Effets Secondaires
      {
        name: "effets_secondaires_glp1",
        label: "⚠️ Effets Secondaires",
        path: "src/content/effets-secondaires-glp1",
        format: "md",
        fields: standardArticleFields,
      },
      // Collection Médecins
      {
        name: "medecins_glp1_france",
        label: "👨‍⚕️ Médecins France",
        path: "src/content/medecins-glp1-france",
        format: "md",
        fields: standardArticleFields,
      },
      // Collection Recherche
      {
        name: "recherche_glp1",
        label: "🔬 Recherche GLP1",
        path: "src/content/recherche-glp1",
        format: "md",
        fields: standardArticleFields,
      },
      // Collection Régime
      {
        name: "regime_glp1",
        label: "🥗 Régime GLP1",
        path: "src/content/regime-glp1",
        format: "md",
        fields: standardArticleFields,
      },
      // Collection Alternatives
      {
        name: "alternatives_glp1",
        label: "🔄 Alternatives GLP1",
        path: "src/content/alternatives-glp1",
        format: "md",
        fields: standardArticleFields,
      },
    ],
  },
});
