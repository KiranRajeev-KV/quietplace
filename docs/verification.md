# Production verification

The quality gate runs against the Vite production artifact, with the same suite reusable against the private published Site.

## Checks

- Strict TypeScript, including unchecked indexing and unused declarations.
- Oxlint with zero warnings, Oxfmt, and Knip with no ignored dependencies.
- A Vite build plus generated route/social documents, manifest, sitemap, and robots.
- Responsive home checks at 1920, 1366, 768, 390, and 320 CSS pixels.
- Narrow case-study, project listing, about, and colophon geometry and WCAG AA checks.
- Keyboard skip navigation and visible focus.
- Native transitions that finish and cease entirely under reduced motion.
- Every registered route loaded directly and refreshed.
- Document titles remain populated throughout lazy route startup.
- Client navigation within one document, native back/forward, and scroll restoration.
- Project switching, hash links, compatibility redirects, and deliberate 404 content.
- All three working demos, source disclosure, unsupported query handling, workflow control, and persistent reader settings.
- Internal hrefs, fonts/icons/social assets, metadata, and one canonical per route.
- A separate production artifact at `/portfolio/`, including direct loading, refreshing, links, history, and font URLs.

Personally inspected the complete home experience, case studies, page endings, listing, About, colophon, and 404. Production browser checks capture JavaScript errors; hosted checks use the owner's existing API access token only in a test process, never in the app or a stored file.

## Hosted routing evidence

Before migration, the existing deployment returned HTTP 404 for `/projects` and `/about`, and 200 for `/work/thread`. The replacement declares both missing routes and uses Sites' supported static SPA fallback. Known routes have static HTML metadata documents; history matching belongs to TanStack Router.

Private access is preserved. Standard visits require ChatGPT sign-in. Unknown SPA paths may return HTTP 200 while displaying the noindex 404, which is a static-host limitation rather than a client-router status code.

## Performance boundaries

The application uses automatic route splitting and lazy demo chunks, self-hosted font preloads, a small WebP texture, and original optimized imagery. The main runtime bundle is approximately 94 kB gzip; route and demo chunks are small. Canvas has no idle loop, caps resolution at 2×, and cancels on reduced-motion changes.

Performance measurements should distinguish the actual edge delivery from Vite's local preview, which can serve uncompressed text. Lab results are not field INP or real-user Core Web Vitals. Hosted performance and transition behavior are audited against the deployed artifact.

The hosted home audit returned 99 performance / 100 accessibility / 100 SEO, with 1.8 s LCP, 60 ms TBT, and zero CLS. A repeat under the host's challenge script returned 90 performance with 1.7 s LCP and 0.002 CLS. The 81 best-practices score is caused by a deprecated storage API in Cloudflare's injected `/cdn-cgi/challenge-platform/` script; that code is outside this repository. These are lab samples, not a fixed performance guarantee.

## Writing production pass — 6 October 2026

The Writing gate adds protected-session and CSRF checks, forged-header rejection, draft/specimen exclusion, revision conflicts, permanent slugs, published-edition isolation, server HTML/metadata/feed/sitemap checks, the complete create-to-delete browser workflow, Plate Markdown/paste/keyboard instruments, media compression/captions/access revocation, network failure/recovery, and five reading/editor viewport sizes. Both preview and public reading use the same components. Code-copy success and its permission-denied fallback are exercised.

The base-path test now builds both the Worker and client using Vite's current builder API. It checks `/portfolio/` portfolio routes, Writing, Studio, an actual temporary publication, refresh, history, canonical URLs and RSS. The Worker strips the URL prefix before asset lookup; this fixes the production asset failure that a root-only preview would miss.

Personally inspected the populated chronological archive, empty archive, manuscript archive, long technical editor, preview, headings/contents, code and mobile reading. Private development specimens remain clearly labeled and cannot be published. Temporary automated publications are deleted after checks. The final deployment retains the existing owner-only Site audience.

Local Chromium observations show negligible layout movement (under 0.00003 CLS) across 1920, 1366, 768, 390 and 320 px. These are unthrottled local lab observations, not real-user vitals. Server-only validation was separated from the browser model, removing roughly 80 kB of decoded JavaScript from the public archive. Plate and code rendering remain lazy; the archive test rejects accidental editor/article bundle loading. The private editor's larger maintained Plate/Markdown bundle is an intentional author-only cost.

The performance scores above belong to the previous portfolio deployment. Hosted Writing and Studio verification is repeated after publishing the exact validated application; `test:hosted` keeps the existing owner access credential in process memory only. Platform access and app author authorization are separate boundaries.
