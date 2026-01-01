import type { CollectionEntry } from "astro:content";

export interface GenreStat {
  name: string;
  slug: string;
  count: number;
  entrySlugs: string[];
}

export function slugifyGenre(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized.length > 0 ? normalized : "genre";
}

export function extractGenres(entry: CollectionEntry<"watchlog">): string[] {
  const rawGenres = Array.isArray((entry.data.tmdbRaw as { genres?: unknown } | undefined)?.genres)
    ? ((entry.data.tmdbRaw as { genres?: Array<{ name?: unknown }> }).genres as Array<{ name?: unknown }>)
    : [];

  return rawGenres
    .map((genre) => (typeof genre?.name === "string" ? genre.name.trim() : ""))
    .filter((name): name is string => name.length > 0);
}

export function buildGenreStats(entries: CollectionEntry<"watchlog">[]): GenreStat[] {
  const genreMap = new Map<string, GenreStat>();

  for (const entry of entries) {
    const names = extractGenres(entry);
    for (const name of names) {
      const slug = slugifyGenre(name);
      const existing = genreMap.get(slug);
      if (existing) {
        existing.count += 1;
        if (!existing.entrySlugs.includes(entry.slug)) {
          existing.entrySlugs.push(entry.slug);
        }
      } else {
        genreMap.set(slug, {
          name,
          slug,
          count: 1,
          entrySlugs: [entry.slug]
        });
      }
    }
  }

  return Array.from(genreMap.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name);
  });
}
