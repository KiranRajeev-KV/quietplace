import { renderToString } from 'react-dom/server';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { createPortfolioRouter } from '../router';
import { createQueryClient, writingKeys } from '../features/writing/data/queries';
import { WritingRepository } from './writing-repository';
import { articleMetadata } from '../features/writing/public/metadata';
import { metadataFor } from '../lib/metadata';
import { projects } from '../content/projects';
import { plainText, summaryOf } from '../features/writing/domain/model';
import type { Env } from './env';
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
export async function publicDocument(request: Request, env: Env, path: string): Promise<Response> {
  const repository = new WritingRepository(env.DB),
    pieces = await repository.published(),
    base = env.BASE_PATH ?? '/',
    origin = env.SITE_URL ?? new URL(request.url).origin;
  if (path === '/writing/feed.xml') {
    const url = new URL(`${base}writing`, origin).href;
    const items = pieces
      .map((p) => {
        const link = new URL(`${base}writing/${p.slug}`, origin).href;
        return `<item><title>${escape(p.title)}</title><link>${escape(link)}</link><guid isPermaLink="true">${escape(link)}</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate><description>${escape(p.description)}</description><content:encoded>${escape(plainText(p.content))}</content:encoded>${p.topics.map((t) => `<category>${escape(t)}</category>`).join('')}</item>`;
      })
      .join('');
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>KR — Writing</title><link>${escape(url)}</link><description>Notes on making, learning, and paying attention.</description><language>en</language><atom:link href="${escape(`${url}/feed.xml`)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`,
      {
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    );
  }
  if (path === '/sitemap.xml') {
    const paths = [
      '/',
      '/projects',
      '/about',
      '/colophon',
      '/writing',
      ...projects.map((p) => `/projects/${p.slug}`),
    ];
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${escape(metadataFor(p, origin, base).url)}</loc></url>`).join('')}${pieces.map((p) => `<url><loc>${escape(new URL(`${base}writing/${p.slug}`, origin).href)}</loc><lastmod>${p.updatedAt}</lastmod></url>`).join('')}</urlset>`,
      {
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' },
      },
    );
  }
  if (path === '/robots.txt')
    return new Response(
      `User-agent: *\nAllow: ${base}\nDisallow: ${base}studio\nDisallow: ${base}api/studio/\nSitemap: ${new URL(`${base}sitemap.xml`, origin).href}\n`,
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  const piece =
    path === '/writing'
      ? null
      : await repository.bySlug(decodeURIComponent(path.slice('/writing/'.length)));
  const queryClient = createQueryClient(),
    archive = pieces.map(summaryOf),
    bootstrap: { key: string[]; data: unknown }[] = [
      { key: [...writingKeys.public], data: archive },
    ];
  queryClient.setQueryData(writingKeys.public, archive);
  if (piece) {
    queryClient.setQueryData(writingKeys.article(piece.slug), piece);
    bootstrap.push({ key: [...writingKeys.article(piece.slug)], data: piece });
  }
  // Seed a 404 locally so missing/draft URLs never fetch or serialize a manuscript.
  if (path !== '/writing' && !piece) {
    queryClient.setQueryDefaults(writingKeys.article(decodeURIComponent(path.slice(9))), {
      retry: false,
      queryFn: async () => {
        throw new Error('Unpublished page');
      },
    });
  }
  const history = createMemoryHistory({ initialEntries: [new URL(request.url).pathname] }),
    router = createPortfolioRouter(queryClient, history);
  if (!piece && path !== '/writing') history.replace(`${base}404`);
  await router.load();
  let body = renderToString(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  // React hoists metadata into the string preamble. The Worker owns the actual
  // document head; the same route components own the visible page.
  body = body.replace(/<title>.*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>/gs, '');
  const templateURL = new URL('/', request.url),
    template = await env.ASSETS.fetch(new Request(templateURL, request));
  let html = await template.text();
  html = html.replace(
    /<title\b[^>]*data-static-head[^>]*>.*?<\/title>|<(?:meta|link)\b[^>]*data-static-head[^>]*>/gs,
    '',
  );
  const meta = piece
    ? articleMetadata(piece, origin, base)
    : metadataFor(path === '/writing' ? path : '/404', origin, base);
  const head = `<title data-static-head>${escape(meta.title)}</title><meta data-static-head name="description" content="${escape(meta.description)}"/><meta data-static-head name="robots" content="${piece || path === '/writing' ? 'index, follow' : 'noindex, follow'}"/><link data-static-head rel="canonical" href="${escape(meta.url)}"/><meta data-static-head property="og:type" content="${piece ? 'article' : 'website'}"/><meta data-static-head property="og:title" content="${escape(meta.title)}"/><meta data-static-head property="og:description" content="${escape(meta.description)}"/><meta data-static-head property="og:url" content="${escape(meta.url)}"/>${meta.image ? `<meta data-static-head property="og:image" content="${escape(meta.image)}"/><meta data-static-head name="twitter:image" content="${escape(meta.image)}"/>` : ''}<meta data-static-head name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}"/><meta data-static-head name="twitter:title" content="${escape(meta.title)}"/><meta data-static-head name="twitter:description" content="${escape(meta.description)}"/><link data-static-head rel="alternate" type="application/rss+xml" title="KR — Writing" href="${base}writing/feed.xml"/><link rel="preload" href="${base}fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin/>${piece ? `<script data-static-head type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: piece.title, description: meta.description, datePublished: piece.publishedAt, dateModified: piece.updatedAt, author: { '@type': 'Person', name: 'KR' }, mainEntityOfPage: meta.url, image: meta.image }).replace(/</g, '\\u003c')}</script>` : ''}`;
  html = html
    .replace('</head>', `${head}</head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root">${body}</div><script id="writing-bootstrap" type="application/json">${JSON.stringify(bootstrap).replace(/</g, '\\u003c')}</script>`,
    )
    .replace(/<noscript[\s\S]*?<\/noscript>/, '');
  queryClient.clear();
  return new Response(html, {
    status: piece || path === '/writing' ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
