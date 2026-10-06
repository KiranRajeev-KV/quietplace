import { createFileRoute } from '@tanstack/react-router';
import { StudioIndex } from '@/features/writing/studio/studio-index';
export const Route = createFileRoute('/studio/')({ component: StudioIndex });
