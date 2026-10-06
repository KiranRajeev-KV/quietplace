import { createFileRoute } from '@tanstack/react-router';
import { PreviewPage } from '@/features/writing/studio/preview-page';
export const Route = createFileRoute('/studio/$id_/preview')({ component: PreviewPage });
