import { createFileRoute } from '@tanstack/react-router';
import { Hero } from '@/features/home/hero';
import { SelectedWork } from '@/features/projects/selected-work';
import { About } from '@/features/about/about';
import { headFor } from '@/lib/metadata';
export const Route = createFileRoute('/')({ head: () => headFor('/'), component: Home });
function Home() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <About />
    </>
  );
}
