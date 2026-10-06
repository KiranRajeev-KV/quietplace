import { createFileRoute } from '@tanstack/react-router';
import { WritingIndex } from '@/features/writing/public/writing-index';
import { publishedQuery } from '@/features/writing/data/queries';
import { headFor } from '@/lib/metadata';
export const Route = createFileRoute('/writing')({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedQuery()),
  head: () => headFor('/writing'),
  component: WritingIndex,
});
