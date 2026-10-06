import { createFileRoute, redirect } from '@tanstack/react-router';
export const Route = createFileRoute('/work_/$slug')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/projects/$slug', params, replace: true });
  },
});
