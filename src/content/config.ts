import { defineCollection, z } from 'astro:content';

// Schéma unifié (sans fusion des dossiers) - champs optionnels pour transition
const unifiedSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  readingTime: z.number().optional(),
  pubDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
  ogImage: z.string().optional(),
  published: z.boolean().default(true).optional(),
  featured: z.boolean().default(false).optional(),
  // Champs SEO ajoutés
  mainKeyword: z.string().optional(),
  secondaryKeywords: z.array(z.string()).optional(),
});

const alternativesGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const glp1PerteDepoids = defineCollection({ type: 'content', schema: unifiedSchema });
const effetsSecondairesGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const glp1Cout = defineCollection({ type: 'content', schema: unifiedSchema });
const glp1Diabete = defineCollection({ type: 'content', schema: unifiedSchema });
const medecinsGlp1France = defineCollection({ type: 'content', schema: unifiedSchema });
const medicamentsGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const rechercheGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });
const regimeGlp1 = defineCollection({ type: 'content', schema: unifiedSchema });

export const collections = {
  'alternatives-glp1': alternativesGlp1,
  'glp1-perte-de-poids': glp1PerteDepoids,
  'effets-secondaires-glp1': effetsSecondairesGlp1,
  'glp1-cout': glp1Cout,
  'glp1-diabete': glp1Diabete,
  'medecins-glp1-france': medecinsGlp1France,
  'medicaments-glp1': medicamentsGlp1,
  'recherche-glp1': rechercheGlp1,
  'regime-glp1': regimeGlp1,
};
