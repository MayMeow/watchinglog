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
		"watchlog": {
"american-dad.md": {
	id: "american-dad.md";
  slug: "american-dad";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"back-to-the-future-part-ii.md": {
	id: "back-to-the-future-part-ii.md";
  slug: "back-to-the-future-part-ii";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"back-to-the-future-part-iii.md": {
	id: "back-to-the-future-part-iii.md";
  slug: "back-to-the-future-part-iii";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"back-to-the-future.md": {
	id: "back-to-the-future.md";
  slug: "back-to-the-future";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"family-guy.md": {
	id: "family-guy.md";
  slug: "family-guy";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"frieren-beyond-journey-s-end.md": {
	id: "frieren-beyond-journey-s-end.md";
  slug: "frieren-beyond-journey-s-end";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"futurama.md": {
	id: "futurama.md";
  slug: "futurama";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"harry-potter-and-the-chamber-of-secrets.md": {
	id: "harry-potter-and-the-chamber-of-secrets.md";
  slug: "harry-potter-and-the-chamber-of-secrets";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"harry-potter-and-the-deathly-hallows-part-1.md": {
	id: "harry-potter-and-the-deathly-hallows-part-1.md";
  slug: "harry-potter-and-the-deathly-hallows-part-1";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"harry-potter-and-the-deathly-hallows-part-2.md": {
	id: "harry-potter-and-the-deathly-hallows-part-2.md";
  slug: "harry-potter-and-the-deathly-hallows-part-2";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"harry-potter-and-the-goblet-of-fire.md": {
	id: "harry-potter-and-the-goblet-of-fire.md";
  slug: "harry-potter-and-the-goblet-of-fire";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"harry-potter-and-the-half-blood-prince.md": {
	id: "harry-potter-and-the-half-blood-prince.md";
  slug: "harry-potter-and-the-half-blood-prince";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"harry-potter-and-the-order-of-the-phoenix.md": {
	id: "harry-potter-and-the-order-of-the-phoenix.md";
  slug: "harry-potter-and-the-order-of-the-phoenix";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"harry-potter-and-the-philosopher-s-stone.md": {
	id: "harry-potter-and-the-philosopher-s-stone.md";
  slug: "harry-potter-and-the-philosopher-s-stone";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"harry-potter-and-the-prisoner-of-azkaban.md": {
	id: "harry-potter-and-the-prisoner-of-azkaban.md";
  slug: "harry-potter-and-the-prisoner-of-azkaban";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"my-teen-romantic-comedy-snafu.md": {
	id: "my-teen-romantic-comedy-snafu.md";
  slug: "my-teen-romantic-comedy-snafu";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"the-big-bang-theory.md": {
	id: "the-big-bang-theory.md";
  slug: "the-big-bang-theory";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"the-fragrant-flower-blooms-with-dignity.md": {
	id: "the-fragrant-flower-blooms-with-dignity.md";
  slug: "the-fragrant-flower-blooms-with-dignity";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
"the-simpsons.md": {
	id: "the-simpsons.md";
  slug: "the-simpsons";
  body: string;
  collection: "watchlog";
  data: InferEntrySchema<"watchlog">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
