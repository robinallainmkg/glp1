import { defineCollection, z } from 'astro:content';

// Schéma unifié (sans fusion des dossiers) - champs optionnels pour transition
const unifiedSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  readingTime: z.number().optional(),
  pubDate: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(), // Thumbnail généré automatiquement
  ogImage: z.string().optional(), // meta image
  published: z.boolean().default(true).optional(),
  featured: z.boolean().default(false).optional(),
  // Champs SEO ajoutés
  mainKeyword: z.string().optional(),
  secondaryKeywords: z.array(z.string()).optional(),
  // SEO title/description : presents dans les frontmatters depuis des mois mais
  // strippes par zod car non declares — les templates ne les recevaient JAMAIS.
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  publishedAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  priority: z.number().optional(),
  affiliateCollection: z.string().optional(),
  // Nouveaux champs pour l'amélioration
  thumbnail: z.string().optional(), // Alternative pour image
  relatedArticles: z.array(z.string()).optional(), // Articles similaires manuels
  imageAlt: z.string().optional(), // Texte alternatif pour l'image
  thumbnailAlt: z.string().optional(), // Texte alternatif pour thumbnail
  // FAQ Schema pour rich snippets Google
  faqSchema: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  // Champs legacy (transition)
  date: z.coerce.date().optional(), // Alias pour pubDate (migration en cours)
  collection: z.string().optional(), // Collection explicite dans le frontmatter
  // slug est réservé par Astro — ne pas le déclarer dans le schéma
});

const alternativesGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const glp1PerteDepoids = defineCollection({ type: 'content', schema: unifiedSchema });
const effetsSecondairesGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const glp1Cout = defineCollection({ type: 'content', schema: unifiedSchema });
const glp1Diabete = defineCollection({ type: 'content', schema: unifiedSchema });
const medecinsGlp1France = defineCollection({ type: 'content', schema: unifiedSchema });
const traitementsGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const rechercheGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const regimeGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const pagesStatiques = defineCollection({ type: 'content', schema: unifiedSchema });
const temoignages = defineCollection({ type: 'content', schema: unifiedSchema });
const avantApresGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const retraitesBienEtre = defineCollection({ type: 'content', schema: unifiedSchema });

export const collections = {
  'alternatives-glp1': alternativesGlp1,
  'glp1-perte-de-poids': glp1PerteDepoids,
  'effets-secondaires-glp1': effetsSecondairesGlp1,
  'glp1-cout': glp1Cout,
  'glp1-diabete': glp1Diabete,
  'medecins-glp1-france': medecinsGlp1France,
  'traitements-glp1': traitementsGlp1,
  'recherche-glp1': rechercheGlp1,
  'regime-glp1': regimeGlp1,
  'pages-statiques': pagesStatiques,
  'temoignages': temoignages,
  'avant-apres-glp1': avantApresGlp1,
  'retraites-bien-etre': retraitesBienEtre,
};
