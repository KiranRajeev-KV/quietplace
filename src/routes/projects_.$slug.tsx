import { createFileRoute, notFound } from '@tanstack/react-router';
import { projects } from '@/content/projects';
import { ProjectPage } from '@/features/projects/project-page';
import { headFor } from '@/lib/metadata';
export const Route = createFileRoute('/projects_/$slug')({
  loader: ({ params }) => {
    const project = projects.find((entry) => entry.slug === params.slug);
    if (!project) throw notFound();
    return project;
  },
  head: ({ params }) => headFor(`/projects/${params.slug}`),
  component: Study,
});
function Study() {
  return <ProjectPage project={Route.useLoaderData()} />;
}
