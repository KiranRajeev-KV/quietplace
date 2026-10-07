# A notebook and a press

Writing is one domain, from a small observation to a technical essay. The public archive is chronological and typographic; the private Studio is a manuscript index and a quiet writing desk. Newsreader carries sustained reading, Manrope carries navigation, and IBM Plex Mono carries code. No article-card grid, analytics dashboard, or animated paragraphs.

## Decisions

- Plate 53's high-level React/editor and static APIs, with basic nodes, feature-owned Markdown input rules, links, code, lists/indent, images/captions, and Markdown interoperability. No full demo kit, collaboration, tables, AI toolbar, or competing editor.
- Structured Plate JSON is the editable authority. Publishing creates a read-only snapshot; editing a published piece cannot expose unfinished changes. Plain text, excerpts, reading time, Markdown, feeds, HTML, and metadata are derived.
- Cloudflare D1 stores manuscripts, publication snapshots, revision numbers, and media metadata. R2 stores compressed raster images. Prepared queries and conditional revision updates prevent silent overwrites. Drizzle generates reviewed SQL migrations; it is not required by runtime queries.
- One server-side Studio passphrase and Hono-signed seven-day session cookies keep authoring private. Login is rate-limited; mutations have a same-origin/custom-header boundary. Local and deployed installations use the same authentication flow, with no header-based identity bypass. See the README for setup and session limitations.
- TanStack Query manages genuine remote state. Autosave serializes writes after a pause, retains edits made during a request, exposes errors/retry, and keeps a device-local IndexedDB recovery copy. The database remains authoritative. Navigation flushes or blocks; visibility loss attempts a bounded keepalive save.
- Public Writing routes render on the Worker using the same Plate static schema and article components used for browser reading and private preview. Known portfolio static metadata is preserved. Dynamic article metadata, JSON-LD, RSS, and sitemap read only published snapshots. Draft media requires owner authorization.
- Samples are explicitly marked private specimens. Publishing samples is rejected by the server. They exist to test typesetting and editor behavior, not to impersonate the author.

## Research and extracted principles

- [Maggie Appleton's garden](https://maggieappleton.com/garden): small notes and essays can share one collection without identical visual weight.
- [Simon Willison](https://simonwillison.net/): chronological writing, descriptive titles, durable links, and readable technical examples.
- [Andy Matuschak's notes](https://notes.andymatuschak.org/About_these_notes): authoring should remain a thinking environment.
- [Practical Typography](https://practicaltypography.com/websites.html): sustained reading depends on measure, size, rhythm, and restraint.
- [Plate React](https://platejs.org/docs/installation/react), [static rendering](https://platejs.org/docs/static), [controlled values](https://platejs.org/docs/controlled), [input rules](https://platejs.org/docs/plugin-input-rules), [code](https://platejs.org/docs/code-block), [lists](https://platejs.org/docs/list), [media](https://platejs.org/docs/media), [captions](https://platejs.org/docs/caption), [Markdown](https://platejs.org/docs/markdown).
- [Query mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations): serialize revisioned writes and invalidate committed remote state.
- [D1](https://developers.cloudflare.com/d1/worker-api/d1-database/), [R2](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/), [Worker practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/).
- [RSS](https://www.rssboard.org/rss-specification), [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article).

## Implementation order

Shared schema and repository → protected API and storage → public archive slice → shared static typesetting → manuscript desk and Plate → autosave/recovery → preview/publishing → media and code → security, workflow, accessibility, and visual audits.

## Editorial details and practical limits

Reading is set in Newsreader at 20–23 px with a 680 px measure, generous paragraph rhythm, and Manrope headings. IBM Plex Mono provides eight explicitly registered highlighting grammars and plain text. Code has a quiet filename/language line, keyboard-scrollable overflow, and a copy action. Images keep intrinsic dimensions and accessible descriptions; captions belong to the canonical document.

The contents margin appears only on a piece with at least 800 words and three section headings. Mobile turns it into a compact index above the reading column. Short notes have no contents, progress meter, or collection of reading widgets. Public search is intentionally deferred; the private archive enables search once eight manuscripts justify it.

Native View Transitions carry title identity from archive to article and between the manuscript and its actual preview. The existing paper/ink timing tokens remain authoritative. Reading content stays still. No scroll library or new animation framework was added.

Public article social metadata uses a cover or first publication image when available. Text-only pieces use text summaries rather than an unrelated inherited portfolio image. A standalone Worker serves public writing and feeds without platform sign-in. The Studio and unpublished media require a valid author session.

The private editor includes Plate's maintained rich-text/Markdown machinery in an author-only lazy bundle. Archive routes avoid importing it. Local Chromium measurements are lab observations, not field-vitals guarantees; verification notes record the actual inspected artifact and limitations.
