import type { Metadata } from 'next';
import { MotionShell } from '@/components/motion-shell';
import { profile } from '@/content/profile';
import { siteUrl } from '@/content/site';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'KR — Developer & AI engineer', template: '%s — KR' },
  description: profile.description,
  openGraph: {
    title: 'KR — Quiet systems',
    description: profile.description,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'KR — Making complex feel simple.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KR — Quiet systems',
    description: profile.description,
    images: ['/og.png'],
  },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/manrope-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/newsreader-italic-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <meta name="theme-color" content="#f4f2eb" />
      </head>
      <body id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <MotionShell />
      </body>
    </html>
  );
}
