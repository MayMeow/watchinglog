# Watching Log

Static Astro site that records every movie and series I log. Entries live as Markdown content collections, enriched via the TMDB API, styled with Bootstrap, and shipped inside a node:20-alpine container for Coolify.

## Stack
- [Astro 4](https://astro.build/) with Markdown content collections
- Bootstrap 5 + custom SCSS tokens
- CLI entry generator powered by TMDB and `tsx`
- Docker (node:20-alpine) build ready for Coolify deployment

## Getting Started
```bash
cp .env.example .env               # add TMDB Read Access Token (v4)
npm install
npm run dev
```
Visit http://localhost:4321 for the dev server.

## Adding Entries
The CLI accepts non-interactive flags for automation pipelines.
```bash
npm run add -- --title "Severance" --media-type tv --status "mid-season" \
  --watch-date 2025-12-28 --tags thriller,sci-fi --rating "10/10"
```
Flags:
- `--title` (required)
- `--media-type` (`movie` | `tv`, default `movie`)
- `--status`, `--rating`, `--progress`, `--watch-date`
- `--tags` comma separated
- `--tmdb-id` optional explicit TMDB id
- `--year` hint for TMDB search
- `--poster-url`, `--backdrop-url` manual overrides when TMDB art is missing
- `--notes` Markdown body fallback

With a TMDB API key configured the CLI searches (or looks up an explicit id), pulls overview text, poster/backdrop art, and hyperlinks to TMDB, then writes Markdown files into `src/content/watchlog/`. When run in an interactive terminal the CLI will show the top TMDB matches so you can pick the exact title; add `--non-interactive` (or pass `--tmdb-id`) to skip the prompt for CI pipelines.

## Content Schema
Located in `src/content/config.ts`. Required fields: `title`, `mediaType`, `status`. Everything else is optional free text (strings, arrays, or URLs) so the CLI can stay flexible.

## Docker
```bash
npm run build
docker build -t watchinglog:latest .
docker run -p 4173:4173 watchinglog:latest
```
The container serves the static `dist/` output with `serve` listening on port 4173, matching Astro preview defaults. Configure Coolify to pull the repo, run `npm install && npm run build`, and expose port 4173.

## Project Scripts
- `npm run dev` – Astro dev server
- `npm run build` – static build into `dist/`
- `npm run preview` – preview server
- `npm run check` – Astro type + content checks
- `npm run add` – TMDB-backed CLI

## Roadmap
- Add RSS/JSON feeds for updates
- Better tag filtering UI
- Deploy pipeline definition for Coolify
