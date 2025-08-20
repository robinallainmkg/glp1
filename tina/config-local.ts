import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  
  // Configuration locale pour tests
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  
  // Configuration locale
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
      {
        name: "article",
        label: "Articles GLP1",
        path: "src/content/articles",
        format: "md",
        ui: {
          filename: {
            slugify: (values) => {
              return `${values?.slug?.toLowerCase().replace(/ /g, '-')}`
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre de l'article",
            isTitle: true,
            required: true,
            description: "Le titre principal de votre article"
          },
          {
            type: "string",
            name: "description",
            label: "Description courte",
            required: true,
            ui: {
              component: "textarea",
            },
            description: "Description qui apparaîtra dans les résultats de recherche"
          },
          {
            type: "string",
            name: "slug",
            label: "URL de l'article",
            required: true,
            description: "L'URL unique de votre article (sans espaces, utilisez des tirets)"
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
            ui: {
              dateFormat: 'DD/MM/YYYY',
              timeFormat: 'HH:mm'
            }
          },
          {
            type: "datetime",
            name: "updatedDate",
            label: "Dernière mise à jour",
            ui: {
              dateFormat: 'DD/MM/YYYY',
              timeFormat: 'HH:mm'
            }
          },
          {
            type: "string",
            name: "thumbnail",
            label: "Image miniature",
            description: "Nom du fichier image (ex: mon-article.svg)"
          },
          {
            type: "string",
            name: "category",
            label: "Catégorie",
            required: true,
            options: [
              { value: "injection", label: "💉 Injections" },
              { value: "comparaison", label: "⚖️ Comparaisons" },
              { value: "effets", label: "🎯 Effets" },
              { value: "prix", label: "💰 Prix" },
              { value: "temoignage", label: "👤 Témoignages" },
              { value: "guide", label: "📚 Guides" },
              { value: "achat", label: "🛒 Achat" },
              { value: "sante", label: "🏥 Santé" },
              { value: "nutrition", label: "🥗 Nutrition" }
            ]
          },
          {
            type: "boolean",
            name: "featured",
            label: "Article en vedette",
            description: "Cochez pour mettre cet article en avant sur la page d'accueil"
          },
          {
            type: "string",
            name: "author",
            label: "Auteur",
            options: [
              { value: "Dr. Sarah Martin", label: "Dr. Sarah Martin" },
              { value: "Dr. Pierre Dubois", label: "Dr. Pierre Dubois" },
              { value: "Équipe GLP1", label: "Équipe GLP1" }
            ]
          },
          {
            type: "number",
            name: "readingTime",
            label: "Temps de lecture",
            description: "Temps de lecture estimé en minutes"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu de l'article",
            isBody: true,
            templates: [
              {
                name: "CalloutBox",
                label: "Encadré d'information",
                fields: [
                  {
                    type: "string",
                    name: "type",
                    label: "Type d'encadré",
                    options: ["info", "warning", "success", "error"]
                  },
                  {
                    type: "rich-text",
                    name: "content",
                    label: "Contenu de l'encadré"
                  }
                ]
              },
              {
                name: "ImageGallery", 
                label: "Galerie d'images",
                fields: [
                  {
                    type: "object",
                    name: "images",
                    label: "Images",
                    list: true,
                    fields: [
                      {
                        type: "image",
                        name: "src",
                        label: "Image"
                      },
                      {
                        type: "string",
                        name: "alt",
                        label: "Texte alternatif"
                      }
                    ]
                  }
                ]
              }
            ]
          },
        ],
      },
      {
        name: "guide",
        label: "Guides PDF",
        path: "src/content/guides",
        format: "md",
        ui: {
          filename: {
            slugify: (values) => {
              return `${values?.slug?.toLowerCase().replace(/ /g, '-')}`
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre du guide",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "slug",
            label: "URL du guide",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
            ui: {
              dateFormat: 'DD/MM/YYYY'
            }
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
            options: [
              { value: "guide", label: "📚 Guide complet" },
              { value: "checklist", label: "✅ Liste de contrôle" },
              { value: "template", label: "📋 Modèle" }
            ]
          },
          {
            type: "string",
            name: "downloadUrl",
            label: "URL de téléchargement",
            description: "Lien vers le fichier PDF"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Description du guide",
            isBody: true,
          },
        ],
      },
      {
        name: "temoignage",
        label: "Témoignages",
        path: "src/content/temoignages",
        format: "md",
        ui: {
          filename: {
            slugify: (values) => {
              return `${values?.slug?.toLowerCase().replace(/ /g, '-')}`
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre du témoignage",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Résumé du témoignage",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "slug",
            label: "URL du témoignage",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date de publication",
            required: true,
            ui: {
              dateFormat: 'DD/MM/YYYY'
            }
          },
          {
            type: "string",
            name: "thumbnail",
            label: "Photo (optionnelle)",
          },
          {
            type: "string",
            name: "authorName",
            label: "Prénom de la personne",
            required: true,
          },
          {
            type: "number",
            name: "authorAge",
            label: "Âge",
          },
          {
            type: "string",
            name: "authorLocation",
            label: "Ville",
          },
          {
            type: "number",
            name: "weightLoss",
            label: "Perte de poids (kg)",
            description: "Nombre de kilos perdus"
          },
          {
            type: "number",
            name: "duration",
            label: "Durée du traitement",
            description: "Durée en mois"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Témoignage complet",
            isBody: true,
          },
        ],
      },
    ],
  },
});
