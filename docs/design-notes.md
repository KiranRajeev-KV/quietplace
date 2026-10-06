# Quiet systems

Research and concept established October 6, 2026, before the first implementation.

## Reference study

- [Clément Grellier](https://clementgrellier.fr/), [ONTO case study](https://clementgrellier.fr/studio-onto): oversized identity, restrained navigation, visual work as the primary content, transitions that connect an overview with a study. Visually inspected the live portfolio. Take the editorial confidence, not its layout or artwork.
- [Eduard Bodak, SOTD June 14, 2025](https://www.awwwards.com/sites/eduard-bodak-portfolio): studied documented navigation microinteractions, minimap progress, copy feedback, transitions, mobile treatment. A cohesive interaction vocabulary matters more than the number of effects. Reject its loud palette and density for this brief.
- [Awwwards portfolio / single-page collection](https://www.awwwards.com/websites/single-page-1/): recent award references expose a common pattern: strong identity, memorable transitions, and careful image presentation. An award is a reference for craft, not permission to sacrifice usability.
- [Hara Design Institute — WHITE](https://hara.ndc.co.jp/en/books/shiro/): white as sensory material. Translate into warm paper, low-contrast rules, and useful empty space rather than symbolism.
- [JAPAN HOUSE](https://hara.ndc.co.jp/en/works/japanhouse/): precision, delicacy, and an identity system held together by restraint. Architectural materials inform palette and rhythm, not decorative motifs.
- [SIMOSE](https://hara.ndc.co.jp/en/works/simose/): a coherent identity across architecture, signage, graphics, and web. Use one grid and material language across overview, case studies, and reading prototype.
- [Irobe — TAKEO PAPER SHOW 2011](https://irobe.ndc.co.jp/en/work/takeo-paper-show-2011/): print, material, and exhibition form a complete system. Project imagery should feel composed rather than inserted.

## Principles extracted

1. Space has structure: a wide outer margin, displaced second headline, and staggered project positions establish rhythm.
2. Typography carries the identity. Manrope is precise; Newsreader italic lends warmth. Both use locally hosted Latin WOFF2 subsets under SIL OFL.
3. Paper, ink, stone, and muted sage, with one rust punctuation mark. Texture is a tiny static tiled bitmap, never an animated full-screen filter.
4. One recurring idea: order emerging from complexity. The woven Canvas line field reacts only to a mouse nearby and settles to rest. It is tied to the systems theme, not a decorative object.
5. Motion uses native scrolling, transform/opacity reveals, small image shifts, and restrained page fades. No cursor replacement, scroll-jacking, sound, or 3D.
6. Mobile is recomposed: headlines are scaled carefully, artwork has its own space, project studies become a full-width sequence, and the footer remains a considered final composition.

## Stack research and decision

- [Astro](https://docs.astro.build/en/concepts/why-astro/) was considered for static-first content and small islands.
- [Vinext](https://github.com/cloudflare/vinext), [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), and the provided Sites scaffold were studied. The project uses the Sites-supported Next App Router / React Server Components surface, with Vinext/Vite building for Cloudflare Workers. This provides an integrated preview/deployment path and independently addressable studies. Vinext is beta: keep the application on standard Next APIs so the project can be run with conventional Next if desired.
- [Motion animate](https://motion.dev/docs/animate) offers a native-animation mini entry point. Use `motion/mini`, documented at approximately 2.3 kB, rather than loading its React or hybrid layers. Plain CSS handles hover states and document transition fallback.
- GSAP, Lenis, Three.js, and React Three Fiber were considered unnecessary: there are no pinned timelines, artificial scrolling, or meaningful 3D needs.
- [Fontsource](https://fontsource.org/docs/getting-started/install) provides versioned, self-hosted font assets and license files. The home page loads a variable Manrope subset and a static Newsreader italic subset. A static roman Newsreader subset loads only in the reader.
- [Playwright](https://playwright.dev/docs/test-intro) and [axe-core](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) are development-only verification tools for responsive overflow, keyboard access, reduced motion, local prototypes, and WCAG fundamentals.

## Implementation plan

1. Establish profile and project content modules, a central token sheet and motion configuration.
2. Build the first coherent home composition: header, typographic introduction, line field, work, about, contact.
3. Run and inspect the first meaningful page before expanding implementation.
4. Add dedicated case-study pages and real local demos: knowledge retrieval, inspectable workflow, and adjustable reader.
5. Add a colophon, deliberate 404, icons, metadata, and original social imagery.
6. Inspect large desktop, laptop, tablet, mobile, and narrow mobile. Interact with each demo and refine the entire page.
7. Run strict type, lint, formatting, accessibility, link, production-build, and performance checks; publish a private preview where available.

## Content boundaries

KR and India are provisional identity/location assumptions derived from workspace initials and timezone. The biography is a practice statement, not an invented employment history. All projects are labeled independent concepts and have functioning browser-local prototypes. There are no fabricated metrics, client names, awards, external AI responses, or social destinations. Contact, GitHub, LinkedIn, and résumé are intentionally absent until supplied in `content/profile.ts`; a clear public contact note explains this.

## Final refinements

- Small-text contrast refined on paper, sage, and ink backgrounds.
- Mobile thumbnails simplify their internal content instead of allowing tiny elements to overlap.
- Opening type reveals run in CSS, avoiding a hydration-dependent largest paint. Motion mini handles section entrances.
- Newsreader reduced from variable subsets to the two static 400-weight styles actually used.
- Paper grain compressed from 39 kB PNG to 6.6 kB WebP.
- A standard Next production build and Vercel configuration provide a maintained hosting alternative to the Sites/Vinext build.
