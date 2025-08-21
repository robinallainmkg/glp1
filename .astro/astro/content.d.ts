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
"yoga-diabete.md": {
	id: "yoga-diabete.md";
  slug: "yoga-diabete";
  body: string;
  collection: "alternatives-glp1";
  data: InferEntrySchema<"alternatives-glp1">
} & { render(): Render[".md"] };
};
"effets-secondaires-glp1": {
"insulevel-effet-indesirable.md": {
	id: "insulevel-effet-indesirable.md";
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
"saxenda-prix-pharmacie.md": {
	id: "saxenda-prix-pharmacie.md";
  slug: "saxenda-prix-pharmacie";
  body: string;
  collection: "glp1-cout";
  data: InferEntrySchema<"glp1-cout">
} & { render(): Render[".md"] };
"wegovy-prix-pharmacie.md": {
	id: "wegovy-prix-pharmacie.md";
  slug: "wegovy-prix-pharmacie";
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
"glp1-diabete": {
"diabete-complications-glp1.md": {
	id: "diabete-complications-glp1.md";
  slug: "diabete-complications-glp1";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"diabete-gestationnel-glp1.md": {
	id: "diabete-gestationnel-glp1.md";
  slug: "diabete-gestationnel-glp1";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"diabete-pied-glp1.md": {
	id: "diabete-pied-glp1.md";
  slug: "diabete-pied-glp1";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"diabete-regime-glp1.md": {
	id: "diabete-regime-glp1.md";
  slug: "diabete-regime-glp1";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"diabete-retinopathie-glp1.md": {
	id: "diabete-retinopathie-glp1.md";
  slug: "diabete-retinopathie-glp1";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"diabete-sport-glp1.md": {
	id: "diabete-sport-glp1.md";
  slug: "diabete-sport-glp1";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"diabete-urgence-glp1.md": {
	id: "diabete-urgence-glp1.md";
  slug: "diabete-urgence-glp1";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"glp1-auto-surveillance.md": {
	id: "glp1-auto-surveillance.md";
  slug: "glp1-auto-surveillance";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"glp1-carnet-diabetique.md": {
	id: "glp1-carnet-diabetique.md";
  slug: "glp1-carnet-diabetique";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"glp1-diabete-type-1.md": {
	id: "glp1-diabete-type-1.md";
  slug: "glp1-diabete-type-1";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"glp1-hba1c-reduction.md": {
	id: "glp1-hba1c-reduction.md";
  slug: "glp1-hba1c-reduction";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"glp1-insuline-interaction.md": {
	id: "glp1-insuline-interaction.md";
  slug: "glp1-insuline-interaction";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"glp1-nephropathie.md": {
	id: "glp1-nephropathie.md";
  slug: "glp1-nephropathie";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"glp1-neuropathie-diabetique.md": {
	id: "glp1-neuropathie-diabetique.md";
  slug: "glp1-neuropathie-diabetique";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
"traitement-insulinique.md": {
	id: "traitement-insulinique.md";
  slug: "traitement-insulinique";
  body: string;
  collection: "glp1-diabete";
  data: InferEntrySchema<"glp1-diabete">
} & { render(): Render[".md"] };
};
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
"ozempic-prix.md": {
	id: "ozempic-prix.md";
  slug: "ozempic-prix";
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
"medicaments-glp1": {
"ado-medicament.md": {
	id: "ado-medicament.md";
  slug: "ado-medicament";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"ballon-gastrique-rembourse.md": {
	id: "ballon-gastrique-rembourse.md";
  slug: "ballon-gastrique-rembourse";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"coupe-faim-puissant-interdit-en-france.md": {
	id: "coupe-faim-puissant-interdit-en-france.md";
  slug: "coupe-faim-puissant-interdit-en-france";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"dipeptidyl-peptidase-4.md": {
	id: "dipeptidyl-peptidase-4.md";
  slug: "dipeptidyl-peptidase-4";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"dosage-trulicity.md": {
	id: "dosage-trulicity.md";
  slug: "dosage-trulicity";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"dulaglutide-nom-commercial.md": {
	id: "dulaglutide-nom-commercial.md";
  slug: "dulaglutide-nom-commercial";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"januvia-autre-nom.md": {
	id: "januvia-autre-nom.md";
  slug: "januvia-autre-nom";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"liraglutide-perte-de-poids-avis.md": {
	id: "liraglutide-perte-de-poids-avis.md";
  slug: "liraglutide-perte-de-poids-avis";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"mecanisme-d-action.md": {
	id: "mecanisme-d-action.md";
  slug: "mecanisme-d-action";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"medicament-americain-pour-maigrir.md": {
	id: "medicament-americain-pour-maigrir.md";
  slug: "medicament-americain-pour-maigrir";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"medicament-anti-obesite-novo-nordisk.md": {
	id: "medicament-anti-obesite-novo-nordisk.md";
  slug: "medicament-anti-obesite-novo-nordisk";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"medicament-pour-maigrir-tres-puissant.md": {
	id: "medicament-pour-maigrir-tres-puissant.md";
  slug: "medicament-pour-maigrir-tres-puissant";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"medicament-prise-de-poid.md": {
	id: "medicament-prise-de-poid.md";
  slug: "medicament-prise-de-poid";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"medicaments-qui-augmentent-la-glycemie.md": {
	id: "medicaments-qui-augmentent-la-glycemie.md";
  slug: "medicaments-qui-augmentent-la-glycemie";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"metformine-autre-nom.md": {
	id: "metformine-autre-nom.md";
  slug: "metformine-autre-nom";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"metformine-diarrhee-solution.md": {
	id: "metformine-diarrhee-solution.md";
  slug: "metformine-diarrhee-solution";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"mounjaro-effet-secondaire.md": {
	id: "mounjaro-effet-secondaire.md";
  slug: "mounjaro-effet-secondaire";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"mounjaro-injection-pour-maigrir.md": {
	id: "mounjaro-injection-pour-maigrir.md";
  slug: "mounjaro-injection-pour-maigrir";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"mounjaro-prix-france.md": {
	id: "mounjaro-prix-france.md";
  slug: "mounjaro-prix-france";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"nouveau-medicament.md": {
	id: "nouveau-medicament.md";
  slug: "nouveau-medicament";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"nouveau-traitement-diabete-type-2-injection.md": {
	id: "nouveau-traitement-diabete-type-2-injection.md";
  slug: "nouveau-traitement-diabete-type-2-injection";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"orlistat-avant-apres.md": {
	id: "orlistat-avant-apres.md";
  slug: "orlistat-avant-apres";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"ozempic-injection-prix.md": {
	id: "ozempic-injection-prix.md";
  slug: "ozempic-injection-prix";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"pilule-qui-fait-maigrir.md": {
	id: "pilule-qui-fait-maigrir.md";
  slug: "pilule-qui-fait-maigrir";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"saxenda-prix.md": {
	id: "saxenda-prix.md";
  slug: "saxenda-prix";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"semaglutide-achat.md": {
	id: "semaglutide-achat.md";
  slug: "semaglutide-achat";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"sitagliptine-effets-secondaires.md": {
	id: "sitagliptine-effets-secondaires.md";
  slug: "sitagliptine-effets-secondaires";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"stylo-saxenda.md": {
	id: "stylo-saxenda.md";
  slug: "stylo-saxenda";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"sulfamide-hypoglycemiant.md": {
	id: "sulfamide-hypoglycemiant.md";
  slug: "sulfamide-hypoglycemiant";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"sulfamides-medicaments.md": {
	id: "sulfamides-medicaments.md";
  slug: "sulfamides-medicaments";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"tirzepatide-avis.md": {
	id: "tirzepatide-avis.md";
  slug: "tirzepatide-avis";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"traitement-diabete-type-2.md": {
	id: "traitement-diabete-type-2.md";
  slug: "traitement-diabete-type-2";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"traitements-medicamenteux.md": {
	id: "traitements-medicamenteux.md";
  slug: "traitements-medicamenteux";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"trulicity-danger.md": {
	id: "trulicity-danger.md";
  slug: "trulicity-danger";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"trulicity-ou-ozempic.md": {
	id: "trulicity-ou-ozempic.md";
  slug: "trulicity-ou-ozempic";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"victoza-posologie.md": {
	id: "victoza-posologie.md";
  slug: "victoza-posologie";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"victoza-rupture.md": {
	id: "victoza-rupture.md";
  slug: "victoza-rupture";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"wegovy-avis.md": {
	id: "wegovy-avis.md";
  slug: "wegovy-avis";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
"xenical-remboursement.md": {
	id: "xenical-remboursement.md";
  slug: "xenical-remboursement";
  body: string;
  collection: "medicaments-glp1";
  data: InferEntrySchema<"medicaments-glp1">
} & { render(): Render[".md"] };
};
"pages-statiques": {
"collection-medicaments-glp1.md": {
	id: "collection-medicaments-glp1.md";
  slug: "/collections/medicaments-glp1";
  body: string;
  collection: "pages-statiques";
  data: InferEntrySchema<"pages-statiques">
} & { render(): Render[".md"] };
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
"glp-1.md": {
	id: "glp-1.md";
  slug: "glp-1";
  body: string;
  collection: "recherche-glp1";
  data: InferEntrySchema<"recherche-glp1">
} & { render(): Render[".md"] };
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
"glp1-hydratation.md": {
	id: "glp1-hydratation.md";
  slug: "glp1-hydratation";
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

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("./../../src/content/config.js");
}
