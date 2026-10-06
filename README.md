# KR — Quiet systems

A complete, responsive personal portfolio shaped by Japanese editorial restraint: warm paper, charcoal ink, asymmetrical typography, and a woven line field that responds to the pointer and settles to rest.

Includes a home page, three independently addressable case studies with working local prototypes, a colophon, a designed 404, self-hosted licensed fonts, icons, a web manifest, canonical metadata, sitemap, and original social previews.

## Run

Node 22.13+ and pnpm are required. pnpm is the only JavaScript package manager used in this repository.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000.

```sh
pnpm build
pnpm start
```

The default build uses the provided Sites foundation: standard Next App Router APIs, React Server Components, and Vinext/Vite output for Cloudflare Workers. Vinext is beta. The application also passes a conventional Next production build:

```sh
pnpm dev:next
pnpm build:next
pnpm start:next
```

## Deploy

The private Sites project is recorded in `.openai/hosting.json`. In Codex, request publication through the Sites connector; it builds, packages, saves the source version, and deploys with the current audience. Credentials are never stored in the repository.

For conventional Next hosting on Vercel:

```sh
pnpm dlx vercel --prod
```

`vercel.json` selects `pnpm build:next`. Set `NEXT_PUBLIC_SITE_URL` to your final production origin in the deployment environment so canonical, sitemap, and social URLs use your domain. The current fallback is the private Sites preview origin. No API keys are required.

## Content to replace

- `content/profile.ts`: KR, India/IST, role, and optional email, GitHub, LinkedIn, résumé URLs. Missing destinations are omitted rather than guessed. Setting `email` enables mail links automatically.
- `components/about.tsx`: the provisional practice statement. There are no invented jobs, clients, awards, qualifications, or metrics.
- `content/projects.ts`: the three explicitly labeled independent concepts. These are real interface studies created for this portfolio, not claimed client projects. Each has a problem, approach, decisions, outcome, and functioning local demo.
- `content/knowledge.ts`: the original four-note collection behind Thread. The demo uses deterministic local retrieval, not an external language model.
- `components/demos/fieldnotes-demo.tsx`: the original reader essay.

A project record currently selects one of the three original visuals/demos. To add a different project, add its content record, extend the visual/demo registry, and supply a primary social image. The case-study route and sitemap already iterate over the collection. Standard App Router routes provide a clear place to add writing, experiments, or CMS adapters.

## Structure

- `app/`: routes, metadata, and centralized visual tokens/styles.
- `components/`: focused page sections and progressive interactive elements.
- `components/demos/`: each independent prototype, isolated from portfolio navigation.
- `content/`: typed profile, projects, retrieval data, and site origin.
- `lib/motion.ts`: shared timing/easing.
- `public/`: optimized fonts, original imagery, texture, and icons.
- `docs/design-notes.md`: sources, extracted principles, concept, plan, and refinements.
- `tests/`: browser behavior, accessibility, keyboard, responsive geometry, reduced motion, metadata, and link checks.

## Verify

With a development or production server running:

```sh
pnpm exec playwright install chromium
pnpm verify
```

To run tests against a different server:

```sh
TEST_URL=http://localhost:3001 pnpm test
```

```sh
pnpm format
pnpm assets:fonts
pnpm assets:projects
```

The asset export requires the local application to be running. It captures the actual project compositions for their social previews. Font files and SIL Open Font License texts are committed; browser visits never contact a font service. The home page loads approximately 49 kB of fonts; the reader's roman font is deferred to its route.

Motion respects reduced-motion preferences, preserves native scroll and the cursor, and animates transforms/opacity. The Canvas has no continuous idle animation, caps resolution at 2×, and releases listeners/frames when unmounted. The reader stores preferences locally and keeps working when storage is blocked. No analytics, accounts, or external AI requests are added.
