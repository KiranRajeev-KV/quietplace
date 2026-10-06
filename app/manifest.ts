import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KR — Quiet systems',
    short_name: 'KR',
    description: 'Thoughtful interfaces. Intelligent systems.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f2eb',
    theme_color: '#f4f2eb',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
