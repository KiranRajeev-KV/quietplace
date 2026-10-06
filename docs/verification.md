# Verification

Verified on 6 October 2026 against production builds, not only source code.

## Experience

Personally inspected the full home experience in the browser at 1920, 1366, 768, 390, and 320 CSS pixels. Reviewed all three case studies, exercised retrieval and source disclosure, workflow completion, reader controls, the colophon, and the designed 404. Refined mobile typography, project composition, line lengths, navigation, illustration overlaps, and page endings.

## Automated checks

- Both `pnpm build` (Sites/Vinext) and `pnpm build:next` (standard Next) succeed.
- Strict TypeScript, ESLint, and Prettier checks pass.
- 15 production browser tests cover five home viewports, narrow detail routes, WCAG AA checks with axe, keyboard focus and the skip link, reduced motion, all three demos, preference persistence, internal links, assets, metadata, and the 404.
- Production pages have no JavaScript page errors. Development HMR errors during framework restarts were resolved; the production experience was verified separately.
- Fonts are self-hosted with SIL licenses. Home font transfer is approximately 49 kB. The paper texture is a 6.6 kB WebP. Project/social graphics are original, optimized, and committed.
- Motion uses native scrolling, transforms/opacity, and Motion's mini entry point. Canvas interpolation stops at rest and caps resolution at 2×. Reduced-motion preferences disable entrances and smooth scrolling.

## Performance

Lighthouse 13.5, default mobile simulation, local production server, headless Chromium:

| Build                     | Performance | Accessibility | Best practices | SEO | FCP   | LCP   | TBT   | CLS |
| ------------------------- | ----------- | ------------- | -------------- | --- | ----- | ----- | ----- | --- |
| Standard Next             | 99          | 100           | 100            | 100 | 0.8 s | 2.0 s | 30 ms | 0   |
| Sites/Vinext local server | 83          | 100           | 100            | 100 | 2.8 s | 3.9 s | 0 ms  | 0   |

The local Vinext server serves text assets without compression; its simulated mobile loading cost is dominated by framework JavaScript and blocking CSS transfer. Standard Next enables compression and optimized delivery. The Vercel configuration uses that verified conventional Next build. Cloudflare edge delivery should be measured on the final public domain rather than assuming a localhost score applies. These are lab measurements, not field INP or real-user Core Web Vitals.

Optimizations made after the initial audit: reduced the paper texture from 39 kB PNG to 6.6 kB WebP; replaced the variable serif payload with small static roman/italic subsets; moved the opening reveal into CSS so it begins with the document; removed conflicting accessible link names; and preserved visible content before hydration.

## Content boundaries

KR and India/IST are provisional identity assumptions. Thread, Relay, and Fieldnotes are clearly labeled independent concepts with working local prototypes. No external language model or agent runs. Contact/social/résumé destinations are intentionally unset and documented for replacement. No invented professional history or impact metrics are published.
