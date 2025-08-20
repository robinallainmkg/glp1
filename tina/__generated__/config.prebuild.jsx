// tina/config.ts
import { defineConfig } from "tinacms";
var standardArticleFields = [
  // Champs de base
  {
    type: "string",
    name: "title",
    label: "Titre de l'article",
    isTitle: true,
    required: true,
    description: "Titre principal qui appara\xEEtra dans le <h1> et le <title>"
  },
  {
    type: "string",
    name: "description",
    label: "Meta Description",
    required: true,
    description: "Description SEO (150-160 caract\xE8res recommand\xE9s)",
    ui: {
      component: "textarea"
    }
  },
  {
    type: "string",
    name: "slug",
    label: "URL de l'article (slug)",
    required: true,
    description: "URL finale de l'article (sans espaces, caract\xE8res sp\xE9ciaux)"
  },
  // Informations de publication
  {
    type: "datetime",
    name: "pubDate",
    label: "Date de publication",
    required: true
  },
  {
    type: "datetime",
    name: "updatedDate",
    label: "Date de mise \xE0 jour",
    description: "Date de derni\xE8re modification (optionnel)"
  },
  {
    type: "string",
    name: "author",
    label: "Auteur",
    options: [
      "Dr. Sarah Martin",
      "Dr. Pierre Dubois",
      "Dr. Marie Rousseau",
      "\xC9quipe GLP1-France"
    ],
    description: "Auteur de l'article"
  },
  // SEO et catégorisation
  {
    type: "string",
    name: "category",
    label: "Cat\xE9gorie principale",
    required: true,
    options: [
      "Guide m\xE9dical",
      "T\xE9moignage",
      "\xC9tude scientifique",
      "Comparatif",
      "FAQ",
      "Actualit\xE9"
    ]
  },
  {
    type: "string",
    name: "tags",
    label: 'Mots-cl\xE9s (format: ["mot1", "mot2", "mot3"])',
    description: "Mots-cl\xE9s au format tableau JSON pour le SEO",
    ui: {
      component: "textarea"
    }
  },
  {
    type: "string",
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
    description: "Collection \xE0 laquelle appartient l'article"
  },
  // Images et médias
  {
    type: "image",
    name: "thumbnail",
    label: "Image principale",
    description: "Image de couverture de l'article (format recommand\xE9: 1200x630px)"
  },
  {
    type: "string",
    name: "thumbnailAlt",
    label: "Texte alternatif de l'image",
    description: "Description de l'image pour l'accessibilit\xE9 et le SEO"
  },
  {
    type: "image",
    name: "ogImage",
    label: "Image Open Graph",
    description: "Image pour les r\xE9seaux sociaux (optionnel, utilise thumbnail par d\xE9faut)"
  },
  // SEO avancé
  {
    type: "boolean",
    name: "featured",
    label: "Article en vedette",
    description: "Mettre en avant cet article sur la page d'accueil"
  },
  {
    type: "number",
    name: "priority",
    label: "Priorit\xE9 d'affichage",
    description: "Ordre d'affichage (1 = plus haute priorit\xE9)"
  },
  {
    type: "string",
    name: "metaTitle",
    label: "Titre SEO personnalis\xE9",
    description: "Titre personnalis\xE9 pour le <title> (optionnel, utilise 'title' par d\xE9faut)"
  },
  {
    type: "string",
    name: "canonicalUrl",
    label: "URL canonique",
    description: "URL canonique si diff\xE9rente de l'URL actuelle"
  },
  // Configuration avancée
  {
    type: "boolean",
    name: "noIndex",
    label: "Exclure des moteurs de recherche",
    description: "Cocher pour emp\xEAcher l'indexation (noindex)"
  },
  {
    type: "string",
    name: "schema",
    label: "Type de contenu Schema.org",
    options: [
      "Article",
      "MedicalWebPage",
      "FAQPage",
      "HowTo",
      "Review"
    ],
    description: "Type de donn\xE9es structur\xE9es pour le SEO"
  },
  // Contenu
  {
    type: "rich-text",
    name: "body",
    label: "Contenu de l'article",
    isBody: true,
    description: "Contenu principal en Markdown"
  },
  // Informations complémentaires
  {
    type: "object",
    name: "readingTime",
    label: "Temps de lecture",
    fields: [
      {
        type: "number",
        name: "minutes",
        label: "Minutes"
      },
      {
        type: "string",
        name: "text",
        label: "Texte affich\xE9"
      }
    ]
  }
];
var config_default = defineConfig({
  branch: "main",
  // Configuration avec vos clés API
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      // Collection Médicaments GLP1
      {
        name: "medicaments_glp1",
        label: "\u{1F48A} M\xE9dicaments GLP1",
        path: "src/content/medicaments-glp1",
        format: "md",
        fields: standardArticleFields
      },
      // Collection Perte de Poids
      {
        name: "glp1_perte_de_poids",
        label: "\u2696\uFE0F GLP1 Perte de Poids",
        path: "src/content/glp1-perte-de-poids",
        format: "md",
        fields: standardArticleFields
      },
      // Collection Coût/Prix
      {
        name: "glp1_cout",
        label: "\u{1F4B0} Co\xFBt et Prix",
        path: "src/content/glp1-cout",
        format: "md",
        fields: standardArticleFields
      },
      // Collection Diabète
      {
        name: "glp1_diabete",
        label: "\u{1FA7A} GLP1 et Diab\xE8te",
        path: "src/content/glp1-diabete",
        format: "md",
        fields: standardArticleFields
      },
      // Collection Effets Secondaires
      {
        name: "effets_secondaires_glp1",
        label: "\u26A0\uFE0F Effets Secondaires",
        path: "src/content/effets-secondaires-glp1",
        format: "md",
        fields: standardArticleFields
      },
      // Collection Médecins
      {
        name: "medecins_glp1_france",
        label: "\u{1F468}\u200D\u2695\uFE0F M\xE9decins France",
        path: "src/content/medecins-glp1-france",
        format: "md",
        fields: standardArticleFields
      },
      // Collection Recherche
      {
        name: "recherche_glp1",
        label: "\u{1F52C} Recherche GLP1",
        path: "src/content/recherche-glp1",
        format: "md",
        fields: standardArticleFields
      },
      // Collection Régime
      {
        name: "regime_glp1",
        label: "\u{1F957} R\xE9gime GLP1",
        path: "src/content/regime-glp1",
        format: "md",
        fields: standardArticleFields
      },
      // Collection Alternatives
      {
        name: "alternatives_glp1",
        label: "\u{1F504} Alternatives GLP1",
        path: "src/content/alternatives-glp1",
        format: "md",
        fields: standardArticleFields
      }
    ]
  }
});
export {
  config_default as default
};
