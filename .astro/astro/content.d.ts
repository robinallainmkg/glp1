declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"alternatives-glp1": {
"acupuncture-glp1.md": {
	id: "acupuncture-glp1.md";
  slug: "acupuncture-glp1";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"alternatives-bio-glp1.md": {
	id: "alternatives-bio-glp1.md";
  slug: "alternatives-bio-glp1";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"alternatives-naturelles-ozempic.md": {
	id: "alternatives-naturelles-ozempic.md";
  slug: "alternatives-naturelles-ozempic";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"berberine-glp1.md": {
	id: "berberine-glp1.md";
  slug: "berberine-glp1";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"cannelle-glp1.md": {
	id: "cannelle-glp1.md";
  slug: "cannelle-glp1";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"chrome-diabete.md": {
	id: "chrome-diabete.md";
  slug: "chrome-diabete";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"homeopathie-diabete.md": {
	id: "homeopathie-diabete.md";
  slug: "homeopathie-diabete";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"meditation-glp1.md": {
	id: "meditation-glp1.md";
  slug: "meditation-glp1";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"peut-on-guerir-du-diabete.md": {
	id: "peut-on-guerir-du-diabete.md";
  slug: "peut-on-guerir-du-diabete";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"phytotherapie-glp1.md": {
	id: "phytotherapie-glp1.md";
  slug: "phytotherapie-glp1";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"plantes-diabete.md": {
	id: "plantes-diabete.md";
  slug: "plantes-diabete";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"semaglutide-naturel.md": {
	id: "semaglutide-naturel.md";
  slug: "semaglutide-naturel";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"supplements-glp1.md": {
	id: "supplements-glp1.md";
  slug: "supplements-glp1";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
"vinaigre-cidre-glp1.md": {
	id: "vinaigre-cidre-glp1.md";
  slug: "vinaigre-cidre-glp1";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
};
"effets-secondaires-glp1": {
"effets-secondaires-mounjaro.md": {
	id: "effets-secondaires-mounjaro.md";
  slug: "effets-secondaires-mounjaro";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"effets-secondaires-ozempic.md": {
	id: "effets-secondaires-ozempic.md";
  slug: "effets-secondaires-ozempic";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"effets-secondaires-rybelsus.md": {
	id: "effets-secondaires-rybelsus.md";
  slug: "effets-secondaires-rybelsus";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"effets-secondaires-saxenda.md": {
	id: "effets-secondaires-saxenda.md";
  slug: "effets-secondaires-saxenda";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"effets-secondaires-trulicity.md": {
	id: "effets-secondaires-trulicity.md";
  slug: "effets-secondaires-trulicity";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"effets-secondaires-victoza.md": {
	id: "effets-secondaires-victoza.md";
  slug: "effets-secondaires-victoza";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"effets-secondaires-wegovy.md": {
	id: "effets-secondaires-wegovy.md";
  slug: "effets-secondaires-wegovy";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"insulevel-effet-indesirable-new.md": {
	id: "insulevel-effet-indesirable-new.md";
  slug: "insulevel-effet-indesirable";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"ozempic-danger.md": {
	id: "ozempic-danger.md";
  slug: "ozempic-danger";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"wegovy-danger.md": {
	id: "wegovy-danger.md";
  slug: "wegovy-danger";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
"wegovy-dosage.md": {
	id: "wegovy-dosage.md";
  slug: "wegovy-dosage";
  body: string;
  collection: "effets-secondaires-glp1";
  data: InferEntrySchema<"effets-secondaires-glp1">
} & { render(): Render[".md"] };
};
"glp1-cout": {
"acheter-wegovy-en-france.md": {
	id: "acheter-wegovy-en-france.md";
  slug: "acheter-wegovy-en-france";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"anneau-gastrique-prix-cmu.md": {
	id: "anneau-gastrique-prix-cmu.md";
  slug: "anneau-gastrique-prix-cmu";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"operation-pour-maigrir-prix.md": {
	id: "operation-pour-maigrir-prix.md";
  slug: "operation-pour-maigrir-prix";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"prix-mounjaro-france.md": {
	id: "prix-mounjaro-france.md";
  slug: "prix-mounjaro-france";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"prix-ozempic-france.md": {
	id: "prix-ozempic-france.md";
  slug: "prix-ozempic-france";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"prix-rybelsus-france.md": {
	id: "prix-rybelsus-france.md";
  slug: "prix-rybelsus-france";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"prix-saxenda-france.md": {
	id: "prix-saxenda-france.md";
  slug: "prix-saxenda-france";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"prix-trulicity-france.md": {
	id: "prix-trulicity-france.md";
  slug: "prix-trulicity-france";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"prix-victoza-france.md": {
	id: "prix-victoza-france.md";
  slug: "prix-victoza-france";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"prix-wegovy-france.md": {
	id: "prix-wegovy-france.md";
  slug: "prix-wegovy-france";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"saxenda-prix-pharmacie.md": {
	id: "saxenda-prix-pharmacie.md";
  slug: "saxenda-prix-pharmacie";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"wegovy-prix.md": {
	id: "wegovy-prix.md";
  slug: "wegovy-prix";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"wegovy-remboursement-mutuelle.md": {
	id: "wegovy-remboursement-mutuelle.md";
  slug: "wegovy-remboursement-mutuelle";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
};
"glp1-diabete": Record<string, {
  id: string;
  slug: string;
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">;
  render(): Render[".md"];
}>;
"glp1-perte-de-poids": {
"avant-apres-glp1.md": {
	id: "avant-apres-glp1.md";
  slug: "avant-apres-glp1";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"chirurgie-bariatrique.md": {
	id: "chirurgie-bariatrique.md";
  slug: "chirurgie-bariatrique";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"combien-de-dose-dans-un-stylo-ozempic.md": {
	id: "combien-de-dose-dans-un-stylo-ozempic.md";
  slug: "combien-de-dose-dans-un-stylo-ozempic";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"diabete-amaigrissement-rapide.md": {
	id: "diabete-amaigrissement-rapide.md";
  slug: "diabete-amaigrissement-rapide";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"glp1-perte-de-poids.md": {
	id: "glp1-perte-de-poids.md";
  slug: "glp1-perte-de-poids";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"medicament-americain-pour-maigrir.md": {
	id: "medicament-americain-pour-maigrir.md";
  slug: "medicament-americain-pour-maigrir";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"medicament-pour-maigrir-tres-puissant-en-pharmacie.md": {
	id: "medicament-pour-maigrir-tres-puissant-en-pharmacie.md";
  slug: "medicament-pour-maigrir-tres-puissant-en-pharmacie";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"medicament-pour-maigrir-tres-puissant.md": {
	id: "medicament-pour-maigrir-tres-puissant.md";
  slug: "medicament-pour-maigrir-tres-puissant";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"medicament-pour-perdre-du-ventre-en-1-semaine.md": {
	id: "medicament-pour-perdre-du-ventre-en-1-semaine.md";
  slug: "medicament-pour-perdre-du-ventre-en-1-semaine";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"obesite-severe-prise-en-charge.md": {
	id: "obesite-severe-prise-en-charge.md";
  slug: "obesite-severe-prise-en-charge";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"ou-trouver-ozempic.md": {
	id: "ou-trouver-ozempic.md";
  slug: "ou-trouver-ozempic";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"ozempic-effets-secondaires-forum.md": {
	id: "ozempic-effets-secondaires-forum.md";
  slug: "ozempic-effets-secondaires-forum";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"ozempic-regime.md": {
	id: "ozempic-regime.md";
  slug: "ozempic-regime";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"personne-obese.md": {
	id: "personne-obese.md";
  slug: "personne-obese";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
"pilule-qui-fait-maigrir.md": {
	id: "pilule-qui-fait-maigrir.md";
  slug: "pilule-qui-fait-maigrir";
  body: string;
  collection: "glp1-perte-de-poids";
  data: InferEntrySchema<"glp1-perte-de-poids">
} & { render(): Render[".md"] };
};
"medecins-glp1-france": {
"clinique-pour-obesite-new.md": {
	id: "clinique-pour-obesite-new.md";
  slug: "clinique-pour-obesite-new";
  body: string;
  collection: "medecins-glp1-france";
  data: InferEntrySchema<"medecins-glp1-france">
} & { render(): Render[".md"] };
"clinique-pour-obesite.md": {
	id: "clinique-pour-obesite.md";
  slug: "clinique-pour-obesite";
  body: string;
  collection: "medecins-glp1-france";
  data: InferEntrySchema<"medecins-glp1-france">
} & { render(): Render[".md"] };
"diabetologue-paris.md": {
	id: "diabetologue-paris.md";
  slug: "diabetologue-paris";
  body: string;
  collection: "medecins-glp1-france";
  data: InferEntrySchema<"medecins-glp1-france">
} & { render(): Render[".md"] };
"endocrinologue-pour-maigrir-new.md": {
	id: "endocrinologue-pour-maigrir-new.md";
  slug: "endocrinologue-pour-maigrir-new";
  body: string;
  collection: "medecins-glp1-france";
  data: InferEntrySchema<"medecins-glp1-france">
} & { render(): Render[".md"] };
"endocrinologue-pour-maigrir.md": {
	id: "endocrinologue-pour-maigrir.md";
  slug: "endocrinologue-pour-maigrir";
  body: string;
  collection: "medecins-glp1-france";
  data: InferEntrySchema<"medecins-glp1-france">
} & { render(): Render[".md"] };
};
"pages-statiques": {
"homepage.md": {
	id: "homepage.md";
  slug: "/";
  body: string;
  collection: "pages-statiques";
  data: InferEntrySchema<"pages-statiques">
} & { render(): Render[".md"] };
"partenaires.md": {
	id: "partenaires.md";
  slug: "partenaires";
  body: string;
  collection: "pages-statiques";
  data: InferEntrySchema<"pages-statiques">
} & { render(): Render[".md"] };
"quel-traitement-glp1-choisir.md": {
	id: "quel-traitement-glp1-choisir.md";
  slug: "/quel-traitement-glp1-choisir";
  body: string;
  collection: "pages-statiques";
  data: InferEntrySchema<"pages-statiques">
} & { render(): Render[".md"] };
};
"recherche-glp1": {
"glp-inhibitors.md": {
	id: "glp-inhibitors.md";
  slug: "glp-inhibitors";
  body: string;
  collection: "recherche-glp1";
  data: InferEntrySchema<"recherche-glp1">
} & { render(): Render[".md"] };
"recherche-clinique-glp1.md": {
	id: "recherche-clinique-glp1.md";
  slug: "recherche-clinique-glp1";
  body: string;
  collection: "recherche-glp1";
  data: InferEntrySchema<"recherche-glp1">
} & { render(): Render[".md"] };
};
"regime-glp1": {
"glp1-calories-journalieres.md": {
	id: "glp1-calories-journalieres.md";
  slug: "glp1-calories-journalieres";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"glp1-index-glycemique.md": {
	id: "glp1-index-glycemique.md";
  slug: "glp1-index-glycemique";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"glp1-micronutriments.md": {
	id: "glp1-micronutriments.md";
  slug: "glp1-micronutriments";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"glp1-portion-alimentaire.md": {
	id: "glp1-portion-alimentaire.md";
  slug: "glp1-portion-alimentaire";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"glp1-proteines.md": {
	id: "glp1-proteines.md";
  slug: "glp1-proteines";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"isglt2-liste.md": {
	id: "isglt2-liste.md";
  slug: "isglt2-liste";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"jeune-intermittent-glp1.md": {
	id: "jeune-intermittent-glp1.md";
  slug: "jeune-intermittent-glp1";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"regime-cetogene-glp1.md": {
	id: "regime-cetogene-glp1.md";
  slug: "regime-cetogene-glp1";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"regime-chrono-nutrition-glp1.md": {
	id: "regime-chrono-nutrition-glp1.md";
  slug: "regime-chrono-nutrition-glp1";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"regime-dash-glp1.md": {
	id: "regime-dash-glp1.md";
  slug: "regime-dash-glp1";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"regime-detox-glp1.md": {
	id: "regime-detox-glp1.md";
  slug: "regime-detox-glp1";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"regime-mediterraneen-glp1.md": {
	id: "regime-mediterraneen-glp1.md";
  slug: "regime-mediterraneen-glp1";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"regime-paleo-glp1.md": {
	id: "regime-paleo-glp1.md";
  slug: "regime-paleo-glp1";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
"regime-sans-sucre-glp1.md": {
	id: "regime-sans-sucre-glp1.md";
  slug: "regime-sans-sucre-glp1";
  body: string;
  collection: "regime-glp1";
  data: InferEntrySchema<"regime-glp1">
} & { render(): Render[".md"] };
};
"traitements-glp1": {
"guide-complet-mounjaro.md": {
	id: "guide-complet-mounjaro.md";
  slug: "guide-complet-mounjaro";
  body: string;
  collection: "traitements-glp1";
  data: InferEntrySchema<"traitements-glp1">
} & { render(): Render[".md"] };
"guide-complet-ozempic.md": {
	id: "guide-complet-ozempic.md";
  slug: "guide-complet-ozempic";
  body: string;
  collection: "traitements-glp1";
  data: InferEntrySchema<"traitements-glp1">
} & { render(): Render[".md"] };
"guide-complet-rybelsus.md": {
	id: "guide-complet-rybelsus.md";
  slug: "guide-complet-rybelsus";
  body: string;
  collection: "traitements-glp1";
  data: InferEntrySchema<"traitements-glp1">
} & { render(): Render[".md"] };
"guide-complet-saxenda.md": {
	id: "guide-complet-saxenda.md";
  slug: "guide-complet-saxenda";
  body: string;
  collection: "traitements-glp1";
  data: InferEntrySchema<"traitements-glp1">
} & { render(): Render[".md"] };
"guide-complet-trulicity.md": {
	id: "guide-complet-trulicity.md";
  slug: "guide-complet-trulicity";
  body: string;
  collection: "traitements-glp1";
  data: InferEntrySchema<"traitements-glp1">
} & { render(): Render[".md"] };
"guide-complet-victoza.md": {
	id: "guide-complet-victoza.md";
  slug: "guide-complet-victoza";
  body: string;
  collection: "traitements-glp1";
  data: InferEntrySchema<"traitements-glp1">
} & { render(): Render[".md"] };
"guide-complet-wegovy.md": {
	id: "guide-complet-wegovy.md";
  slug: "guide-complet-wegovy";
  body: string;
  collection: "traitements-glp1";
  data: InferEntrySchema<"traitements-glp1">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		"avant-apres-glp1": Record<string, {
  id: string;
  collection: "avant-apres-glp1";
  data: any;
}>;

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
