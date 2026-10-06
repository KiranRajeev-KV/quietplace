# Motion: a sheet, an image, a line of ink

Navigation changes the composition while preserving its materials. The header stays in place; the next page settles as a sheet; project artwork and titles keep their identity across views. Native scrolling and the normal cursor remain.

## Vocabulary

All durations and easing live in `src/styles/tokens.css`; route decisions live in `src/lib/motion.ts`; animation definitions live in `src/styles/motion.css`.

- Ink: 180 ms. Active navigation, underlines, short exits, loading marks.
- Hover: 320 ms. Small link/arrow responses.
- Page: 560 ms. A 24 px vertical settling movement, reduced to 14 px on mobile.
- Artwork: 720 ms. Shared position/size changes use one editorial easing curve.

The first document has a short masked type entrance. Subsequent navigation suppresses that entrance so a captured shared title remains intact. Section entrances are selective, small, and triggered once by IntersectionObserver. Content is readable before the observer runs.

## Route choreography

TanStack's `defaultViewTransition` starts native same-document transitions. It chooses `study-open`, `study-close`, `study-switch`, `page-forward`, or `page-back` from the source/destination and history direction. Matching `art-*` and `title-*` names connect a study thumbnail to its case hero and back. Project switching uses a modest horizontal arrival.

The persistent header has its own transition name. The page sheet exits quickly and arrives more slowly. CSS handles all movement; no animation package is required. Unsupported browsers receive a small CSS entrance and fully working navigation. No animation is used to delay route commitment or to intercept wheel/touch scrolling.

Loading states are limited to genuine lazy-loading waits and use a thin ink line. The site keeps its four navigation links visible at narrow widths; a hamburger menu would add friction to this small information architecture.

Writing titles keep a stable identity between the archive and article. `writing-open`, `writing-close` and `writing-turn` extend the same sheet vocabulary; `manuscript-preview` and `manuscript-return` connect the writing desk to its final typesetting. Reading paragraphs remain still. Only navigation, contextual controls and genuine save/loading states move.

The shell follows TanStack's presented match lane, rather than the requested URL. During a lazy Studio/public navigation, this prevents both headers from entering the same snapshot. The route stage stays mounted so requesting another page cannot remount the current manuscript before the destination commits.

## Accessibility and performance

Reduced motion prevents View Transition API calls, disables CSS animation/transitions and smooth scrolling, and stops active Canvas interpolation. Route changes focus the main landmark without scrolling it; the initial document preserves the skip link as the first keyboard target. A live region announces the route.

Canvas draws on resize/pointer activity and settles rather than running an idle loop. Project effects use transforms, opacity, and native snapshots. Shared artwork is composited by the browser. The quality suite verifies that native transitions finish, history restoration works, and reduced-motion navigation creates no transition.

## References and extracted principles

- [Eduard Bodak's portfolio transition](https://www.awwwards.com/inspiration/page-transition-eduard-bodak-portfolio): treat navigation as a designed interval, while retaining this portfolio's quieter timing.
- [TanStack View Transition example](https://tanstack.com/router/latest/docs/framework/react/examples/view-transitions): use the Router's lifecycle and transition types rather than a second navigation manager.
- [Chrome's 2025 API update](https://developer.chrome.com/blog/view-transitions-in-2025): named snapshots and types offer native continuity; feature-detect for graceful fallback.
- [Same-document transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document): respect reduced motion and avoid a large animation dependency for a small composition.
