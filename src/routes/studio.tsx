import { createFileRoute } from '@tanstack/react-router';
import { sessionQuery } from '@/features/writing/data/queries';
import { StudioBoundary } from '@/features/writing/studio/studio-boundary';
import { siteName } from '@/content/site';
export const Route = createFileRoute('/studio')({
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionQuery()),
  head: () => ({
    meta: [
      { title: `The private notebook — ${siteName}` },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: StudioBoundary,
});
