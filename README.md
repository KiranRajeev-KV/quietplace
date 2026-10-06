# KR — Quiet systems

A paper-toned editorial portfolio with selected work, an independent Writing publication, and a private Plate writing Studio. Built with React 19, Vite 8, strict TypeScript, file-based TanStack Router, Tailwind 4, and a Cloudflare-compatible Worker. Next.js is absent.

## Run and verify

Node 22.18+ and pnpm are required.

```sh
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

Development runs at http://localhost:3000. Local ChatGPT sign-in is simulated by the official Sites Vite helper; it never enters the production Worker.

```sh
pnpm exec playwright install chromium
pnpm check
pnpm build
pnpm preview
```

Production preview runs at http://localhost:4173. `check` runs route generation, strict TypeScript, Oxlint, Oxfmt, Knip, production builds, browser tests, and a separate `/portfolio/` deployment test. Browser tests cover the portfolio and complete writing workflows, authorization, draft exclusion, concurrency, recovery, media, accessible reading, keyboard use, reduced motion, refresh, and history. Temporary test publications are removed; specimens cannot be published.

Other commands: `pnpm typecheck`, `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`, `pnpm knip`, `pnpm test`, `pnpm test:base-path`, `pnpm db:generate`.

## Writing

- `/writing`: chronological publication archive.
- `/writing/:slug`: readable published edition, rendered on the Worker and in React.
- `/writing/feed.xml`: RSS for published editions.
- `/studio`: protected manuscript archive.
- `/studio/new`: a fresh manuscript.
- `/studio/:id`: Plate writing desk with autosave.
- `/studio/:id/preview`: the actual public renderer, privately previewed.

Plate JSON is the editable authority. Publishing creates a read-only edition. Further edits stay private until republished. First publication permanently locks the slug. Unpublish and archive revoke public text and image access. Permanent deletion erases manuscript content and media while reserving its address. Drafts and private specimens never enter the public repository, server-rendered HTML, feed, or sitemap.

Autosave debounces typing, serializes requests, and checks revisions. A small IndexedDB recovery copy protects unfinished work during outages; D1 is the durable authority. Navigation flushes pending work or offers a recovery/export path. Images are resized, compressed to WebP, validated on the server, and stored in R2. Alt text is required; captions remain editable.

## Hosting

The existing [Sites portfolio](https://kr-quiet-systems.kiranrajeevkv.chatgpt.site) uses Sites-managed D1 (`DB`), R2 (`FILES`), assets, and dispatch-owned ChatGPT authentication. Use the Sites connector to publish this project's validated source and packaged Worker output; it preserves the existing audience. The Site currently has owner-only platform access. Public Writing is an unauthenticated application surface, but anonymous visitors and crawlers still require the platform audience to be public. Studio stays author-only even on a public Site.

Runtime configuration:

- `STUDIO_OWNER_EMAIL`: server-side owner allowlist, configured as a Sites secret; never `VITE_`-prefixed.
- `SITE_URL`: the trusted canonical origin.
- `BASE_PATH`: the deployed prefix, normally `/`.

`VITE_SITE_URL` and `VITE_BASE_PATH` configure matching browser/build URLs. Prefixes require leading and trailing slashes. The Vite plugin gives the Worker the same base path. Root and nested routes use browser history, native View Transitions, and SPA fallback; Writing receives real article HTML and 404 statuses. RSS, sitemap, JSON-LD, canonical and social metadata derive exclusively from publication snapshots.

This is a full-stack Worker application. A static-only Vercel upload cannot provide Studio persistence or authentication. To move off Sites, provision D1/R2 and replace the trusted dispatch identity adapter with a verified identity provider before using `pnpm exec wrangler deploy`. Never expose a directly reachable Worker that trusts arbitrary identity headers.

## Structure and replaceable content

`src/routes` owns matching and lazy route boundaries. `src/features/writing` contains the domain/schema, remote repository and queries, static publication renderer, Plate instrument, and Studio. `src/server` owns authorization, API, durable queries, media, server-rendered publication documents, and feeds. `db/schema.ts` and `drizzle/` own reviewed migrations. Design and motion tokens remain centralized in `src/styles` and `src/lib/motion.ts`.

`src/content/profile.ts` still holds provisional KR, India/IST, role, and optional contact/social/résumé destinations. The three project studies are explicitly independent concepts. No writing is invented and published under the author's name. Four optional private specimens exercise short notes, weeknotes, essays, and technical articles.

Fonts are self-hosted Manrope, Newsreader, and IBM Plex Mono with licenses. `pnpm assets:fonts` refreshes them. `pnpm assets:projects` exports original portfolio artwork from a running app.

Research, architecture, typography, safety, and motion decisions: [docs/writing.md](docs/writing.md), [docs/architecture.md](docs/architecture.md), [docs/motion.md](docs/motion.md), and [docs/verification.md](docs/verification.md).
