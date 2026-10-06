import { createFileRoute } from '@tanstack/react-router';
import { NewManuscript } from '@/features/writing/studio/new-manuscript';
export const Route = createFileRoute('/studio/new')({ component: NewManuscript });
