import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  
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
      // Collection Médicaments GLP1
      {
        name: "medicaments",
        label: "💊 Médicaments GLP1",
        path: "src/content/medicaments-glp1",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre de l'article",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description courte",
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL de l'article",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
          },
          {
            type: "string",
            name: "thumbnail",
            label: "Image miniature",
          },
          {
            type: "string",
            name: "category",
            label: "Catégorie",
          },
          {
            type: "boolean",
            name: "featured",
            label: "Article en vedette",
          },
          {
            type: "string",
            name: "author",
            label: "Auteur",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu de l'article",
            isBody: true,
          },
        ],
      },
      // Collection Perte de Poids
      {
        name: "perte-poids",
        label: "⚖️ GLP1 Perte de Poids",
        path: "src/content/glp1-perte-de-poids",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
          },
          {
            type: "string",
            name: "thumbnail",
            label: "Image",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
          },
        ],
      },
      // Collection Coût/Prix
      {
        name: "cout-prix",
        label: "💰 Coût et Prix",
        path: "src/content/glp1-cout",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
          },
        ],
      },
      // Collection Diabète
      {
        name: "diabete",
        label: "🩺 GLP1 et Diabète",
        path: "src/content/glp1-diabete",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
          },
        ],
      },
      // Collection Effets Secondaires
      {
        name: "effets-secondaires",
        label: "⚠️ Effets Secondaires",
        path: "src/content/effets-secondaires-glp1",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
          },
        ],
      },
      // Collection Médecins
      {
        name: "medecins",
        label: "👨‍⚕️ Médecins France",
        path: "src/content/medecins-glp1-france",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
          },
        ],
      },
      // Collection Recherche
      {
        name: "recherche",
        label: "🔬 Recherche GLP1",
        path: "src/content/recherche-glp1",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
          },
        ],
      },
      // Collection Régime
      {
        name: "regime",
        label: "🥗 Régime GLP1",
        path: "src/content/regime-glp1",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
          },
        ],
      },
      // Collection Alternatives
      {
        name: "alternatives",
        label: "🔄 Alternatives GLP1",
        path: "src/content/alternatives-glp1",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
          },
        ],
      },
    ],
  },
});
