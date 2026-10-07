# Production architecture

React + Vite + strict TypeScript + file-based TanStack Router remain the foundation. Tailwind supplies tokens/utilities while custom CSS owns the editorial composition. TanStack Query now has a real role: remote manuscripts, sessions, publication snapshots, mutations and invalidation. Plate is confined to the Writing domain and lazily loaded article/editor routes.

## Boundaries

- Routes own loaders, typed paths, head metadata and lazy presentation.
- Features own the existing portfolio and the new Writing domain.
- Writing's domain owns versioned structured documents, validation, kinds, slugs, excerpts, reading time, heading anchors and syntax grammars.
- Plate's React and static registries use the same canonical node vocabulary. Public reading and private preview share `ArticleView` and `DocumentRenderer`.
- A browser repository owns API transport. Query owns caching and mutations. An autosave coordinator owns serialized revisioned writes and local recovery.
- The Worker owns authorization, validation, prepared D1 queries, atomic publication/media changes and R2 access. Drizzle generates SQL migrations; runtime queries do not depend on its ORM.

The manuscript is the only editable representation. A publication is an immutable derived edition, not a second editable document. Public queries never select manuscript JSON. Device recovery is temporary protection, not production persistence.

## Delivery and routing

Cloudflare's maintained Vite plugin builds `dist/client` and `dist/server`. Wrangler binds provisioned D1/R2 resources as `DB` and `FILES`. Every application link uses TanStack Router; external links, RSS, and download destinations remain ordinary links. Sign-in and sign-out use same-origin API mutations. Browser history and scroll restoration use history-entry keys. Native View Transitions connect pages; CSS supplies a restrained fallback.

The Worker renders Writing with the actual Router shell, static Plate renderer and article components. It seeds public Query data into escaped JSON. The browser waits for its lazy route before committing the identical geometry; it does not claim experimental hydration support. Article HTML, metadata and readable content are available without JavaScript. Missing/draft articles return HTTP 404. Known portfolio route metadata remains prebuilt; interactive portfolio content remains client-rendered. Dynamic RSS and sitemap only use published editions.

Robots and sitemap belong exclusively to the Worker, with no static copies that could shadow live responses. New publications appear immediately and Studio stays excluded.

The Worker explicitly serves the app shell for missing HTML history routes, allowing legacy redirects and the Router's 404 to run. Missing asset requests retain their 404; known portfolio routes keep their prebuilt heads.

`VITE_BASE_PATH` controls Vite, Router, links and assets. The Vite plugin configures matching Worker `BASE_PATH`. A separate production test verifies `/portfolio/` without modifying the main artifact. Asset fallback preserves nested route refreshes.

## Authentication and safety

Studio uses one server-side passphrase and Hono's HMAC-signed cookie helpers. Seven-day sessions require a valid signature and expiry; HTTPS cookies use a host prefix, HttpOnly, Secure, and SameSite Strict. Passphrase rotation invalidates all sessions. Same-origin checks and a custom mutation header protect login, logout, and Studio operations. A Cloudflare rate-limiter binding throttles login attempts. The local example passphrase is rejected on non-local origins. Unconfigured authentication fails closed; there is no identity-header trust or development login bypass.

The optional deployment target is a standalone Cloudflare Worker with explicitly provisioned D1/R2. No deployment is currently running.

Revisions increment through conditional updates. Publication and public media membership change in atomic D1 batches. Slugs lock on first publication and remain reserved after deletion. Unpublish/archive remove snapshots and public media membership. The server checks media visibility on each request so revocation takes immediate effect.

## Tooling

Oxlint, Oxfmt and Knip provide a repository-wide gate, alongside strict TypeScript (including the Worker and database schema), production builds and browser verification. Dependencies serve specific features; no additional motion library, CMS framework, collaboration engine, or competing editor is installed. One accessibility lint exception permits keyboard scrolling in code regions; actual semantics, focus and WCAG AA are browser-tested.

Fonts are self-hosted; code grammars are limited to eight useful languages plus plain text. Archive routes do not import Plate. Author-only editor bundles include maintained rich-text and Markdown machinery; they do not load on the portfolio or Writing index.

Research links and schema/publishing decisions: [writing.md](writing.md). Router, Vite, native motion and original visual research remain documented in [design-notes.md](design-notes.md) and [motion.md](motion.md).
