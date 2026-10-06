import { createFileRoute } from '@tanstack/react-router';
import { sessionQuery } from '@/features/writing/data/queries';
import { StudioBoundary } from '@/features/writing/studio/studio-boundary';
export const Route = createFileRoute('/studio')({
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionQuery()),
  head: () => ({
    meta: [
      { title: 'The private notebook — KR' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: StudioBoundary,
});
