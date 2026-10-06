// Emit real route documents for static hosts and social crawlers; no server runtime.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { metadataFor } from '../src/lib/metadata.ts';
import { projects } from '../src/content/projects.ts';
import { defaultSiteUrl } from '../src/content/site.ts';
const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
const base = env.VITE_BASE_PATH || '/';
const origin = env.VITE_SITE_URL || defaultSiteUrl;
const template = await readFile('dist/index.html', 'utf8');
const paths = [
  '/',
  '/projects',
  '/about',
  '/colophon',
  ...projects.map(({ slug }) => `/projects/${slug}`),
];
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
for (const path of [...paths, '/404']) {
  const page = metadataFor(path, origin, base);
  const tags = [
    `<title data-static-head>${escape(page.title)}</title>`,
    ...Object.entries({
      description: page.description,
      robots: page.index ? 'index, follow' : 'noindex, follow',
      'twitter:card': 'summary_large_image',
      'twitter:title': page.title,
      'twitter:description': page.description,
      'twitter:image': page.image,
    }).map(
      ([name, content]) => `<meta data-static-head name="${name}" content="${escape(content)}" />`,
    ),
    ...Object.entries({
      'og:type': 'website',
      'og:title': page.title,
      'og:description': page.description,
      'og:url': page.url,
      'og:image': page.image,
      'og:image:width': '1200',
      'og:image:height': '630',
    }).map(
      ([property, content]) =>
        `<meta data-static-head property="${property}" content="${escape(content)}" />`,
    ),
    `<link data-static-head rel="canonical" href="${escape(page.url)}" />`,
  ].join('\n');
  const filename = path === '/' ? 'dist/index.html' : `dist${path}.html`;
  await mkdir(filename.slice(0, filename.lastIndexOf('/')), { recursive: true });
  await writeFile(filename, template.replace('<!-- page-head -->', tags));
}
await writeFile(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escape(metadataFor(path, origin, base).url)}</loc></url>`).join('')}</urlset>`,
);
await writeFile(
  'dist/robots.txt',
  `User-agent: *\nAllow: ${base}\nSitemap: ${new URL(`${base}sitemap.xml`, origin).href}\n`,
);
await writeFile(
  'dist/manifest.webmanifest',
  JSON.stringify({
    name: 'KR — Quiet systems',
    short_name: 'KR',
    description: 'Thoughtful interfaces. Intelligent systems.',
    start_url: base,
    scope: base,
    display: 'standalone',
    background_color: '#f4f2eb',
    theme_color: '#f4f2eb',
    icons: [192, 512].map((size) => ({
      src: `${base}icon-${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
    })),
  }),
);
console.log(`Emitted ${paths.length} route documents, 404, sitemap, robots, and manifest.`);
