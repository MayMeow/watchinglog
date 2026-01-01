#!/usr/bin/env tsx
import { Command } from "commander";
import { select, intro, outro, cancel as cancelPrompt, isCancel } from "@clack/prompts";
import { mkdir, writeFile, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import dotenv from "dotenv";

type MediaType = "movie" | "tv";
type CliOptions = {
  title: string;
  mediaType: MediaType;
  status: string;
  rating?: string;
  progress?: string;
  watchDate?: string;
  tags?: string;
  tmdbId?: string;
  year?: string;
  posterUrl?: string;
  backdropUrl?: string;
  notes?: string;
  nonInteractive?: boolean;
};

type TmdbNormalized = {
  id: number;
  title: string;
  overview?: string;
  url: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate?: string;
};

const program = new Command();
program
  .description("Add a new watch entry sourced from TMDB")
  .requiredOption("--title <title>", "Title of the movie or series")
  .option("--media-type <type>", "movie or tv", "movie")
  .option("--status <status>", "Status text", "logged")
  .option("--rating <rating>", "Rating text")
  .option("--progress <progress>", "Progress description")
  .option("--watch-date <date>", "ISO date of viewing")
  .option("--tags <tags>", "Comma separated tags")
  .option("--tmdb-id <id>", "Explicit TMDB id")
  .option("--year <year>", "Release year used for search")
  .option("--poster-url <url>", "Override poster image URL")
  .option("--backdrop-url <url>", "Override backdrop image URL")
  .option("--non-interactive", "Skip TMDB selection prompts", false)
  .option("--notes <text>", "Body text for the Markdown entry", "")
  .parse(process.argv);

async function main() {
  const options = program.opts<CliOptions>();
  const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
  const contentDir = path.join(root, "src", "content", "watchlog");

  await ensureEnv(root);
  const apiKey = process.env.TMDB_API_KEY;

  const resolvedMediaType: MediaType = options.mediaType === "tv" ? "tv" : "movie";
  const interactive = isInteractiveTerminal() && !options.nonInteractive;

  const tmdbPayload = apiKey
    ? await pickTmdbEntry({
        apiKey,
        title: options.title,
        mediaType: resolvedMediaType,
        explicitId: options.tmdbId,
        year: options.year,
        interactive
      })
    : null;

  const entryTitle = tmdbPayload?.title ?? options.title;
  const slug = createSlug(entryTitle, options.watchDate ?? options.year);
  const now = new Date().toISOString();
  const noteBody = options.notes?.trim();
  const body = noteBody || tmdbPayload?.overview || "";
  const tags = parseTags(options.tags);
  const description = tmdbPayload?.overview ?? noteBody ?? undefined;

  const frontmatter = {
    title: entryTitle,
    mediaType: resolvedMediaType,
    status: options.status,
    rating: options.rating,
    progress: options.progress,
    watchDate: options.watchDate,
    tags,
    tmdbId: tmdbPayload?.id,
    tmdbUrl: tmdbPayload?.url,
    posterUrl: options.posterUrl ?? tmdbPayload?.posterUrl,
    backdropUrl: options.backdropUrl ?? tmdbPayload?.backdropUrl,
    description,
    createdAt: now,
    updatedAt: now
  };

  await mkdir(contentDir, { recursive: true });
  const targetPath = path.join(contentDir, `${slug}.md`);
  const serializedFrontmatter = serializeFrontmatter(frontmatter);
  const fileContents = `---\n${serializedFrontmatter}---\n${body}\n`;
  await writeFile(targetPath, fileContents, "utf8");

  console.log(`✓ Entry written to ${path.relative(root, targetPath)}`);
}

void main();

function parseTags(value?: string) {
  if (!value) return undefined;
  const parts = value
    .split(",")
    .map((token: string) => token.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

function createSlug(title: string, suffix?: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!suffix) return base;
  const cleanSuffix = String(suffix).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return cleanSuffix ? `${base}-${cleanSuffix.toLowerCase()}` : base;
}

async function ensureEnv(root: string) {
  const envPath = path.join(root, ".env");
  try {
    await access(envPath, fsConstants.F_OK);
    dotenv.config({ path: envPath });
  } catch {
    dotenv.config();
  }
}

function serializeFrontmatter(data: Record<string, unknown>) {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        const list = value.map((item) => `  - ${item}`).join("\n");
        return `${key}:\n${list}`;
      }
      if (typeof value === "string") {
        const sanitized = value.replace(/"/g, '\\"');
        return `${key}: "${sanitized}"`;
      }
      return `${key}: ${value}`;
    })
    .join("\n")
    .concat("\n");
}

async function pickTmdbEntry({
  apiKey,
  title,
  mediaType,
  explicitId,
  year,
  interactive
}: {
  apiKey: string;
  title: string;
  mediaType: MediaType;
  explicitId?: string;
  year?: string;
  interactive: boolean;
}): Promise<TmdbNormalized | null> {
  if (!apiKey) return null;
  if (explicitId) {
    return fetchDetails(apiKey, mediaType, explicitId);
  }
  const matches = await searchTmdb({ apiKey, mediaType, title, year });
  if (matches.length === 0) {
    console.warn(`No TMDB matches found for "${title}".`);
    return null;
  }
  if (!interactive || matches.length === 1) {
    if (matches.length > 1 && !interactive) {
      console.warn(
        `Multiple TMDB matches found for "${title}". Using the first result. Re-run without --non-interactive to choose manually.`
      );
    }
    return matches[0];
  }
  return promptForMatch(matches);
}

async function promptForMatch(matches: TmdbNormalized[]): Promise<TmdbNormalized> {
  intro("TMDB search results");
  const choice = await select({
    message: "Pick the correct title",
    options: matches.slice(0, 8).map((match) => ({
      value: match.id,
      label: formatMatchLabel(match)
    })),
    initialValue: matches[0].id
  });
  if (isCancel(choice)) {
    cancelPrompt("Selection cancelled.");
    process.exit(1);
  }
  const selected = matches.find((match) => match.id === choice) ?? matches[0];
  outro(`Selected ${selected.title}.`);
  return selected;
}

function formatMatchLabel(match: TmdbNormalized) {
  const year = match.releaseDate ? new Date(match.releaseDate).getFullYear() : null;
  return year ? `${match.title} (${year})` : match.title;
}

async function searchTmdb({
  apiKey,
  mediaType,
  title,
  year
}: {
  apiKey: string;
  mediaType: MediaType;
  title: string;
  year?: string;
}): Promise<TmdbNormalized[]> {
  const search = new URL(`https://api.themoviedb.org/3/search/${mediaType}`);
  search.searchParams.set("query", title);
  if (year) {
    search.searchParams.set(mediaType === "movie" ? "year" : "first_air_date_year", year);
  }
  const res = await fetch(search, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!res.ok) {
    console.warn(`TMDB search failed: ${res.status}`);
    return [];
  }
  const data = (await res.json()) as { results?: Array<any> };
  return (data.results ?? []).map((result) => normalizePayload(mediaType, result));
}

async function fetchDetails(apiKey: string, mediaType: MediaType, id: string): Promise<TmdbNormalized | null> {
  const url = `https://api.themoviedb.org/3/${mediaType}/${id}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!res.ok) {
    console.warn(`TMDB lookup failed: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return normalizePayload(mediaType, data);
}

function normalizePayload(mediaType: MediaType, payload: any): TmdbNormalized {
  const title = mediaType === "movie" ? payload.title : payload.name;
  const releaseDate = mediaType === "movie" ? payload.release_date : payload.first_air_date;
  return {
    id: payload.id,
    title,
    overview: payload.overview,
    releaseDate,
    url: `https://www.themoviedb.org/${mediaType}/${payload.id}`,
    posterUrl: buildImageUrl(payload.poster_path, "w500"),
    backdropUrl: buildImageUrl(payload.backdrop_path, "w1280")
  };
}

function buildImageUrl(pathValue?: string, size: "w500" | "w780" | "w1280" = "w500") {
  if (!pathValue) return undefined;
  return `https://image.tmdb.org/t/p/${size}${pathValue}`;
}

function isInteractiveTerminal() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
