import type { Publication } from '../domain/model';
import { defaultSiteUrl, siteName } from '@/content/site';
export function articleMetadata(
  piece: Publication,
  origin = import.meta.env.VITE_SITE_URL ?? defaultSiteUrl,
  base = import.meta.env.BASE_URL,
) {
  const url = new URL(`${base}writing/${piece.slug}`, origin).href;
  const mediaId = piece.coverId || piece.content.find((node) => node.type === 'img')?.mediaId;
  return {
    title: `${piece.seoTitle || piece.title} — ${siteName}`,
    description: piece.seoDescription || piece.description,
    url,
    image:
      typeof mediaId === 'string' ? new URL(`${base}media/${mediaId}`, origin).href : undefined,
  };
}
export function articleHead(piece: Publication) {
  const m = articleMetadata(piece);
  return {
    meta: [
      { title: m.title },
      { name: 'description', content: m.description },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: m.title },
      { property: 'og:description', content: m.description },
      { property: 'og:url', content: m.url },
      ...(m.image
        ? [
            { property: 'og:image', content: m.image },
            { name: 'twitter:image', content: m.image },
          ]
        : []),
      { property: 'article:published_time', content: piece.publishedAt },
      { property: 'article:modified_time', content: piece.updatedAt },
      { name: 'twitter:card', content: m.image ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: m.title },
      { name: 'twitter:description', content: m.description },
    ],
    links: [
      { rel: 'canonical', href: m.url },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: `${siteName} — Writing`,
        href: `${import.meta.env.BASE_URL}writing/feed.xml`,
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: piece.title,
          description: m.description,
          datePublished: piece.publishedAt,
          dateModified: piece.updatedAt,
          author: { '@type': 'Person', name: 'KR' },
          mainEntityOfPage: m.url,
          image: m.image,
        }).replace(/</g, '\\u003c'),
      },
    ],
  };
}
