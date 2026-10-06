# Production architecture

## Foundation

React + Vite + TypeScript + file-based TanStack Router. Tailwind 4 supplies the theme and utility layer; existing custom composition CSS stays intact. A preflight reset is deliberately omitted to preserve the established controls and editorial typography. All runtime state is browser-local, so Query is unnecessary.

The Vite Router plugin precedes React, generates typed routes, and automatically splits route components. Route definitions own matching, validation, head metadata, and redirects. Feature modules own presentation. Each demonstration is a separate React lazy chunk.

`src/routes/projects_.$slug.tsx` uses TanStack's non-nested filename convention: it shares the persistent root shell while remaining independent of the listing component. The legacy `work_.$slug.tsx` also remains non-nested so the `/work` listing redirect cannot intercept detail URLs.

## Routing failure and correction

The prior deployed origin returned HTTP 404 for `/projects` and `/about`; neither was a registered route. `/work/thread` returned 200. The migration adds real listing/about routes and replaces the server routing stack with a history SPA.

Sites' packager explicitly accepts `static.not_found_handling: "single-page-application"`. The application therefore uses browser history, not hash routing or path-shaped external anchors. Static metadata documents are emitted as `projects.html`, `about.html`, and `projects/thread.html`; Cloudflare's normal HTML handling serves these through clean paths. The explicit SPA fallback handles unlisted paths and compatibility links.

Internal links use typed `Link`, including hashes. External and mail links use ordinary anchors. TanStack stores scroll positions by history entry, resets new pages, and restores previous entries before paint. Native back/forward uses the same transition policy. The previous `/work` URLs replace their history entry when redirecting.

## Metadata and delivery

A small build script emits known HTML route documents from the Vite template, with static title, description, canonical, Open Graph, and Twitter metadata. Social crawlers receive metadata without running JavaScript. The interactive content is client-rendered; this does not pretend to be full SSR or a prerendered content site.

Static head tags are removed once during startup. TanStack `HeadContent` then owns current metadata. The root supplies only default meta tags; canonicals belong to leaf routes to avoid duplicate links. Unknown routes inherit noindex defaults.

The build also generates the sitemap, robots file, and manifest. A shared metadata function keeps content and canonical decisions consistent between the app and build script. Node's supported type stripping runs this small TypeScript helper directly; no extra script transpiler is installed.

`VITE_BASE_PATH` controls Vite, Router, asset URLs, manifest scope, and canonical prefixes. The quality gate builds a separate temporary `/portfolio/` artifact and checks navigation, refresh, history, links, and fonts. Main build output is unaffected.

## Tooling and hygiene

Oxlint enables TypeScript, React/hooks, imports, accessibility, and correctness rules. The preference-only `prefer-tag-over-role` rule is disabled because structured result/status containers and grouped controls legitimately use ARIA roles; WCAG behavior is verified with axe and keyboard tests. Oxfmt owns formatting. Knip scans routes, scripts, CSS, and tests without ignored dependencies or blanket source exclusions.

Strict TypeScript includes unchecked-index access, unused declarations/parameters, consistent casing, and erasable syntax. Path alias `@/` refers only to `src/`.

Only React, React DOM, and TanStack Router are direct runtime dependencies. There is no server framework, RSC pipeline, scroll library, animation library, WebGL library, or remote-query layer. Licensed Fontsource packages and image tooling are development dependencies used by reproducible asset scripts.

## Research

- [TanStack file routing](https://tanstack.com/router/latest/docs/routing/file-based-routing)
- [Automatic splitting](https://tanstack.com/router/latest/docs/guide/automatic-code-splitting)
- [Head management](https://tanstack.com/router/latest/docs/guide/document-head-management)
- [Scroll restoration](https://tanstack.com/router/latest/docs/guide/scroll-restoration)
- [Vite production/base paths](https://vite.dev/guide/build)
- [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite)
- [Oxlint configuration](https://oxc.rs/docs/guide/usage/linter/config)
- [Oxfmt configuration](https://oxc.rs/docs/guide/usage/formatter/config)
- [Knip configuration](https://knip.dev/reference/configuration)
- [Cloudflare SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Cloudflare HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
