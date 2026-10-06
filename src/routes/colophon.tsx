import { createFileRoute } from '@tanstack/react-router';
import { Colophon } from '@/features/colophon/colophon';
import { headFor } from '@/lib/metadata';
export const Route = createFileRoute('/colophon')({
  head: () => headFor('/colophon'),
  component: Colophon,
});
