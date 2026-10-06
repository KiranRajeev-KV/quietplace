# KR — Quiet systems

A finished, editorial portfolio with warm paper, charcoal typography, asymmetrical space, and a responsive woven line field. Its project artwork moves between the listing and case-study views through native View Transitions.

Built with React 19, Vite 8, strict TypeScript, file-based TanStack Router, and Tailwind CSS 4. There is no server framework or remote data dependency. The three local prototypes remain fully functional.

## Run

Node 22.18+ and pnpm are required.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Development: http://localhost:3000.

```sh
pnpm build
pnpm preview
```

Production preview: http://localhost:4173. `pnpm build` emits the Vite application, seven route documents with static social metadata, a 404 document, sitemap, robots file, and manifest.

## Quality gate

Install the browser once:

```sh
pnpm exec playwright install chromium
pnpm check
```

`check` generates the typed route tree, runs strict TypeScript, Oxlint, Oxfmt, Knip, a production build, the production browser suite, and a separate production build/test under `/portfolio/`. Browser checks cover geometry, WCAG AA, keyboard focus, reduced motion, native transitions, browser history, scroll restoration, direct loading, refresh, project switching, all demos, links, assets, and metadata.

Individual checks:

```sh
pnpm typecheck
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm knip
pnpm test
pnpm test:base-path
```

Tests start a production preview automatically. Set `TEST_URL` to test an already running server. `pnpm test:hosted` accepts one hidden JSON line containing the existing private Site URL and owner token. It does not create or rotate access tokens, persist credentials, or change the audience. Production QA uses the same browser suite against the deployed origin.

## Routes and hosting

- `/`: the original complete home composition.
- `/projects`: selected studies.
- `/projects/thread`, `/projects/relay`, `/projects/fieldnotes`: case studies and working local demos.
- `/about`: the practice statement and capabilities.
- `/colophon`: materials, independent-study disclosure, and contact.
- `/work` and `/work/:slug`: compatibility redirects for existing links.
- Unknown paths: the designed 404 with noindex metadata.

Every application link uses TanStack Router. Email, social, and résumé destinations remain ordinary links. Scroll restoration uses history-entry keys; in-page hashes use Router's native hash support.

The existing private [Sites portfolio](https://kr-quiet-systems.kiranrajeevkv.chatgpt.site) uses the explicit static `single-page-application` fallback in `.openai/hosting.json`. This permits clean history paths and direct nested-route loads. A normal owner visit still requires ChatGPT login. Unknown SPA paths can return HTTP 200 while rendering the 404; a static SPA cannot choose a different response status after client routing. No authentication or routing bypass is embedded in the application.

To publish updates in Codex, use the Sites connector for the existing project. It validates and publishes the current source, preserving the audience.

For Vercel:

```sh
pnpm dlx vercel --prod
```

`vercel.json` maps known routes to their static metadata documents and provides an SPA fallback. Set `VITE_SITE_URL` to your public origin before building. `VITE_BASE_PATH` defaults to `/`; it must include leading and trailing slashes, for example `/portfolio/`. The Vite base, Router basepath, asset URLs, manifest, and generated canonical URLs share that value. An alternate host must serve the build under that prefix and provide an SPA fallback there. Vercel's included configuration assumes root hosting.

## Architecture

- `src/routes/`: small route definitions; the Vite plugin generates and splits the route tree.
- `src/features/`: home, projects, about, colophon, and independently loaded demos.
- `src/components/`: shared navigation, footer, Canvas, route states, and lifecycle effects.
- `src/content/`: typed profile, projects, knowledge, and default origin.
- `src/lib/`: metadata and motion decisions.
- `src/styles/`: Tailwind theme/design tokens, established portfolio composition, and centralized motion.
- `scripts/`: static document generation, licensed font copying, project art export, base-path checks, and private hosted QA.
- `tests/`: production browser verification.

Add a project record, its visual/demo registry entry, and its social image. The parameter route and generated documents follow the collection automatically. Add writing or experiments as new route files and focused feature modules. Connect an API or CMS at a feature boundary when needed; add Query only when actual remote state warrants it.

## Replaceable content

`src/content/profile.ts` holds KR, India/IST, role, and optional email/GitHub/LinkedIn/résumé URLs. Missing destinations are omitted. `src/features/about/about.tsx` contains the provisional practice statement. The three entries in `src/content/projects.ts` are explicitly independent concepts created for this portfolio, with no invented client history or impact metrics.

Thread is deterministic local retrieval. Relay is a clearly labeled local workflow simulation. Fieldnotes has original writing and private local preferences, including a fallback when browser storage is blocked. No external AI requests or analytics are added.

```sh
pnpm assets:fonts
pnpm assets:projects
```

The project art export needs a running local application. Original assets and SIL font licenses are committed. Fonts are self-hosted; there is no third-party font request. The Canvas settles at rest, caps resolution at 2×, and stops when reduced motion is requested. Navigation preserves native scrolling and the cursor.

Research and decisions: `docs/design-notes.md`, `docs/architecture.md`, `docs/motion.md`, and `docs/verification.md`.
