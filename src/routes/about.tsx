import { createFileRoute } from '@tanstack/react-router';
import { About } from '@/features/about/about';
import { headFor } from '@/lib/metadata';
export const Route = createFileRoute('/about')({
  head: () => headFor('/about'),
  component: AboutPage,
});
function AboutPage() {
  return (
    <div className="about-page">
      <About standalone />
    </div>
  );
}
