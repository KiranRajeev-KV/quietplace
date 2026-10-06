import { createFileRoute } from '@tanstack/react-router';
import { SelectedWork } from '@/features/projects/selected-work';
import { headFor } from '@/lib/metadata';
export const Route = createFileRoute('/projects')({
  head: () => headFor('/projects'),
  component: Projects,
});
function Projects() {
  return (
    <div className="projects-page">
      <SelectedWork standalone />
    </div>
  );
}
