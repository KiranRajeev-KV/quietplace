# Quiet systems — design notes

## Concept

The identity remains a practice in thoughtful technology: warm paper, charcoal ink, a restrained rust accent, Manrope paired with Newsreader, and a woven field that responds and settles. Japanese restraint informs the negative space and precision without literal symbols or decorative cultural shorthand.

The opening has a deliberately displaced second line. The work sequence follows an editorial rhythm: one wide study, then two asymmetrically balanced studies. The about statement is set as a large idea with a quieter supporting column. Page endings receive the same attention as the hero.

The next production pass preserves these materials while making navigation part of the composition. A thumbnail becomes a case hero, a title carries its identity across views, and the header stays still. More effects would weaken this direction.

## References and principles

- [Clément Grellier](https://www.clementgrellier.fr/): typography-led developer identity and purposeful interaction. Preserve a readable first impression.
- [Awwwards portfolio transitions](https://www.awwwards.com/inspiration/page-transition-eduard-bodak-portfolio): a transition can communicate continuity and pace. Avoid borrowing its spectacle or recreating a specific site.
- [Hara Design Institute](https://www.ndc.co.jp/hara/en/): emptiness and material attention guide the hierarchy and warm surface.
- [JAPAN HOUSE London](https://www.japanhouselondon.uk/): editorial treatment and considered visual relationships, rather than arbitrary cultural motifs.
- [SIMOSE](https://simose-museum.jp/en/): a useful architectural reference for movement, intervals, and framing.
- [Irobe Design Institute](https://www.ndc.co.jp/irobe/): clear graphic systems and intentional small details.

## Production choices

File-based TanStack Router organizes real routes for the listing, about page, case studies, and colophon. The header and navigation live in a persistent root. Existing case links remain compatible through redirects. Native View Transitions and centralized CSS supply the complete movement language; no motion package is needed.

Tailwind's current Vite integration provides the theme and focused layout utilities. The established bespoke composition CSS remains. Typography and spacing take priority over a new component system. Self-hosted font files and their SIL licenses remain committed; images, paper texture, icons, and social artwork are reused and optimized.

The application has browser-local demonstrations and static content, so TanStack Query would add no value. React, React DOM, and Router are the only direct runtime packages. Oxc tools and Knip replace the previous lint/format setup, with strict TypeScript and production browser checks.

## Execution and refinements

Audited the deployed routes before changing the stack. `/projects` and `/about` returned 404 because they did not exist. Added both as actual routes. Research of the current Sites packager and Cloudflare asset routing confirmed an explicit SPA fallback, permitting normal history navigation.

Reviewed the composition in the browser at large desktop, laptop, tablet, mobile, and very narrow mobile widths. Kept the always-visible three-link navigation, restored appropriate heading hierarchy on standalone pages, preserved mobile illustration simplifications, and made focus/active states intentional.

Refined transitions in both directions and caught two implementation details through tests: a parent legacy redirect intercepted detail URLs, and root/leaf head definitions emitted duplicate canonicals. Legacy detail routes now use the non-nested filename convention; leaf routes own canonicals.

First-document type entrances stay separate from route snapshots. Initial keyboard focus starts at the skip link; route changes focus the main landmark without changing scroll position. A frame at rest has no continuous Canvas or route animation. Unsupported View Transition browsers keep a subtle CSS entrance and complete navigation. Reduced motion disables the transition call itself.

Further architecture and motion details are in `architecture.md` and `motion.md`.
