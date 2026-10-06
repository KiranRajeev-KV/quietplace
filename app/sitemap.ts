import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { siteUrl } from '@/content/site';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, priority: 1 },
    ...projects.map(({ slug }) => ({
      url: `${siteUrl}/work/${slug}`,
      priority: 0.8,
    })),
    { url: `${siteUrl}/colophon`, priority: 0.3 },
  ];
}
