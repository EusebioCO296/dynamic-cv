# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server at localhost:4321
pnpm build      # Build production site to ./dist/
pnpm preview    # Preview production build locally
pnpm format     # Format code with Prettier
```

No test suite is configured.

## Architecture

This is an **Astro 5 SSR site** using **Sanity** as a headless CMS, deployed to **Netlify**, styled with **Tailwind CSS**.

### Content Flow

All CV content lives in Sanity CMS. Pages fetch content via GROQ queries in `src/sanity/lib/load-query.ts`, which also wires up Sanity Visual Editing (live preview at `/studio`). Sanity schemas are defined in `src/sanity/schema-types/` and registered in `sanity.config.ts`.

### Pages & Layout

- `src/pages/resume.astro` — the main CV page; 2-column layout (sidebar + scrollable main), includes print-to-PDF A4 styling
- `src/pages/post/[slug].astro` — dynamic blog post pages from Sanity
- `src/layouts/Layout.astro` — root HTML shell with Sanity Visual Editing overlay support

### Components

Each CV section has a dedicated component in `src/components/` (e.g., `work-experience.astro`, `education.astro`). Rich text from Sanity is rendered via `portable-text.astro` using `astro-portabletext`.

### Key Utilities

- `src/utils/helpers/index.ts` — `formatDateRangeHelper` for CV date ranges, `checkContinentCodeHelper` for geolocation-based contact info
- `src/sanity/lib/url-for-image.ts` — Sanity image URL builder

### Environment Variables

Required in `.env`:
- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `PUBLIC_GEOLOCATION_API_KEY`

Basic Auth (protege `/resume/*` y sus redirects, ver `src/middleware.ts`). Una sola variable, solo contraseña:
- `PASSWORD_SITE`

Ponla en `.env.local` para desarrollo local (nunca en `.env`, que va versionado); en Netlify: Site settings → Environment variables. El campo usuario del diálogo Basic Auth del navegador se ignora — solo se valida la contraseña.

Si no está configurada: en dev el middleware deja pasar (con aviso en consola); en producción bloquea todo con 503.
