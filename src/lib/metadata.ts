import { projects } from '../content/projects.ts';
import { defaultSiteUrl, siteName, siteDescription } from '../content/site.ts';
export function metadataFor(
  path: string,
  origin = import.meta.env?.VITE_SITE_URL ?? defaultSiteUrl,
  base = import.meta.env?.BASE_URL ?? '/',
) {
  const project = projects.find(
    (entry) => path === `/projects/${entry.slug}` || path === `/work/${entry.slug}`,
  );
  const pages: Record<string, { title: string; description: string }> = {
    '/': { title: siteName, description: siteDescription },
    '/projects': {
      title: `Selected studies — ${siteName}`,
      description:
        'Independent studies in thoughtful interfaces, intelligent systems, and editorial design.',
    },
    '/about': {
      title: `A quiet practice — ${siteName}`,
      description:
        'An engineer’s mind. A maker’s sensibility. A practice in software engineering, AI, and thoughtful interface design.',
    },
    '/colophon': {
      title: `Colophon — ${siteName}`,
      description: 'The ideas, materials, and T3 Code experiment behind quietplace.',
    },
    '/writing': {
      title: `Writing — ${siteName}`,
      description:
        'Notes on making, learning, and paying attention. An open notebook for thoughts in progress.',
    },
  };
  const page = project
    ? { title: `${project.title} — ${siteName}`, description: project.description }
    : pages[path];
  const canonical = project ? `/projects/${project.slug}` : path;
  const asset = project ? `projects/${project.slug}.png` : 'og.png';
  const absolute = (relative: string) =>
    new URL(`${base}${relative.replace(/^\//, '')}`, origin).href;
  return {
    title: page?.title ?? `A little off the path — ${siteName}`,
    description: page?.description ?? 'Nothing here. Room to return.',
    url: absolute(canonical),
    image: absolute(asset),
    index: !!page,
  };
}
export function headFor(path: string) {
  const page = metadataFor(path);
  return {
    meta: [
      { title: page.title },
      { name: 'description', content: page.description },
      { name: 'robots', content: page.index ? 'index, follow' : 'noindex, follow' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: page.title },
      { property: 'og:description', content: page.description },
      { property: 'og:url', content: page.url },
      { property: 'og:image', content: page.image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: page.title },
      { name: 'twitter:description', content: page.description },
      { name: 'twitter:image', content: page.image },
    ],
    links: [{ rel: 'canonical', href: page.url }],
  };
}
