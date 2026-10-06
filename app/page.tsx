import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { SelectedWork } from '@/components/selected-work';
import { About } from '@/components/about';
import { Footer } from '@/components/footer';
export const metadata: Metadata = { alternates: { canonical: '/' } };
export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <SelectedWork />
        <About />
      </main>
      <Footer />
    </>
  );
}
