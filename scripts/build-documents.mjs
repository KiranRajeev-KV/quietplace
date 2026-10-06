// Portfolio route heads remain prebuilt; Writing is rendered by the Worker.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { metadataFor } from '../src/lib/metadata.ts';
import { projects } from '../src/content/projects.ts';
import { defaultSiteUrl } from '../src/content/site.ts';
const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
const base = env.VITE_BASE_PATH || '/';
const origin = env.VITE_SITE_URL || defaultSiteUrl;
const output = 'dist/client';
const template = (await readFile(`${output}/index.html`, 'utf8')).replace(
  /<title data-static-head>.*?<\/title>\s*/,
  '',
);
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
  const filename = path === '/' ? `${output}/index.html` : `${output}${path}.html`;
  await mkdir(filename.slice(0, filename.lastIndexOf('/')), { recursive: true });
  await writeFile(filename, template.replace('<!-- page-head -->', tags));
}
// Discovery documents belong to the Worker. Sites dispatch serves matching
// assets first, so static copies would shadow the live publication archive.
await writeFile(
  `${output}/manifest.webmanifest`,
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
console.log(`Emitted ${paths.length} route documents, 404, and manifest.`);
