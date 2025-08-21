// tina/config.ts
import { defineConfig } from "tinacms";
var staticPageFields = [
  {
    type: "string",
    name: "title",
    label: "Titre de la page",
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
    label: "URL de la page (slug)",
    required: true,
    description: "URL finale de la page (sans espaces, caract\xE8res sp\xE9ciaux)"
  },
  {
    type: "string",
    name: "pageType",
    label: "Type de page",
    options: [
      "Homepage",
      "Guide statique",
      "Page collection",
      "Page l\xE9gale",
      "Page contact",
      "Page outils",
      "Page t\xE9moignages",
      "Autre"
    ],
    description: "Type de page statique"
  },
  {
    type: "boolean",
    name: "noIndex",
    label: "Exclure des moteurs de recherche",
    description: "Cocher pour emp\xEAcher l'indexation (noindex)"
  },
  {
    type: "rich-text",
    name: "body",
    label: "Contenu de la page",
    isBody: true,
    description: "Contenu principal en Markdown"
  }
];
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
  // Produits d'affiliation liés
  {
    type: "object",
    name: "affiliateProducts",
    label: "Produits d'affiliation recommand\xE9s",
    list: true,
    fields: [
      {
        type: "reference",
        name: "product",
        label: "Produit",
        collections: ["affiliate_products"],
        description: "S\xE9lectionner un produit d'affiliation"
      },
      {
        type: "number",
        name: "displayOrder",
        label: "Ordre d'affichage",
        description: "Position dans la sidebar (1 = premier)"
      },
      {
        type: "string",
        name: "customNote",
        label: "Note personnalis\xE9e",
        description: "Contexte sp\xE9cifique \xE0 cet article (optionnel)"
      }
    ]
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
  branch: process.env.TINA_BRANCH || "production",
  // Configuration avec variables d'environnement sécurisées
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  // Configuration pour ajouter des liens "Voir l'article"
  cmsCallback: (cms) => {
    import("tinacms").then(({ RouteMappingPlugin }) => {
      const RouteMapping = new RouteMappingPlugin((collection, document) => {
        const slug = document._sys.filename.replace(/\.md$/, "");
        const collectionUrls = {
          "medicaments_glp1": `/medicaments-glp1/${slug}`,
          "glp1_perte_de_poids": `/glp1-perte-de-poids/${slug}`,
          "glp1_cout": `/glp1-cout/${slug}`,
          "glp1_diabete": `/glp1-diabete/${slug}`,
          "effets_secondaires_glp1": `/effets-secondaires-glp1/${slug}`,
          "medecins_glp1_france": `/medecins-glp1-france/${slug}`,
          "recherche_glp1": `/recherche-glp1/${slug}`,
          "regime_glp1": `/regime-glp1/${slug}`,
          "alternatives_glp1": `/alternatives-glp1/${slug}`,
          "pages_statiques": `/${slug}`
        };
        return collectionUrls[collection.name] || `/${slug}`;
      });
      cms.plugins.add(RouteMapping);
    });
    return cms;
  },
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
      // Collection Pages Statiques
      {
        name: "pages_statiques",
        label: "\u{1F4C4} Pages Statiques",
        path: "src/content/pages-statiques",
        format: "md",
        fields: staticPageFields
      },
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
      },
      // Collection Produits d'Affiliation
      {
        name: "affiliate_products",
        label: "\u{1F4B0} Produits d'Affiliation",
        path: "src/content/affiliate-products",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Nom du produit",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "productId",
            label: "ID unique du produit",
            required: true,
            description: "Identifiant unique (ex: ozempic-1mg, wegovy-semaglutide)"
          },
          {
            type: "string",
            name: "brand",
            label: "Marque/Laboratoire",
            required: true
          },
          {
            type: "string",
            name: "category",
            label: "Cat\xE9gorie",
            options: [
              "GLP-1",
              "GLP-1 + GIP",
              "Diab\xE8te",
              "Perte de poids",
              "Compl\xE9ment",
              "Accessoire",
              "Livre/Guide"
            ],
            required: true
          },
          {
            type: "image",
            name: "productImage",
            label: "Image du produit",
            required: true
          },
          {
            type: "string",
            name: "externalLink",
            label: "Lien d'affiliation",
            required: true,
            description: "URL compl\xE8te du lien d'affiliation"
          },
          {
            type: "number",
            name: "discountPercent",
            label: "R\xE9duction (%)",
            description: "Pourcentage de r\xE9duction (ex: 15 pour 15%)"
          },
          {
            type: "string",
            name: "discountCode",
            label: "Code promo",
            description: "Code de r\xE9duction \xE0 afficher"
          },
          {
            type: "rich-text",
            name: "benefitsText",
            label: "Texte des b\xE9n\xE9fices",
            description: "Description des avantages du produit"
          },
          {
            type: "rich-text",
            name: "description",
            label: "Description d\xE9taill\xE9e",
            description: "Description compl\xE8te du produit"
          },
          {
            type: "boolean",
            name: "featured",
            label: "Produit vedette",
            description: "Mettre en avant ce produit"
          },
          {
            type: "number",
            name: "priority",
            label: "Priorit\xE9 d'affichage",
            description: "Ordre d'affichage (1 = premier)"
          },
          {
            type: "object",
            name: "targeting",
            label: "Ciblage",
            fields: [
              {
                type: "string",
                name: "categories",
                label: "Cat\xE9gories d'articles",
                list: true,
                options: [
                  "GLP-1",
                  "Diab\xE8te",
                  "Perte de poids",
                  "Effets secondaires",
                  "Prix",
                  "T\xE9moignages",
                  "M\xE9decins",
                  "Recherche"
                ]
              },
              {
                type: "string",
                name: "keywords",
                label: "Mots-cl\xE9s de ciblage",
                list: true,
                description: "Mots-cl\xE9s pour cibler automatiquement les articles"
              }
            ]
          },
          {
            type: "datetime",
            name: "createdAt",
            label: "Date de cr\xE9ation"
          },
          {
            type: "datetime",
            name: "updatedAt",
            label: "Derni\xE8re modification"
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
