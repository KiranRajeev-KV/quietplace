import { createFileRoute } from '@tanstack/react-router';
import { EditorPage } from '@/features/writing/studio/editor-page';
export const Route = createFileRoute('/studio/$id')({ component: EditorPage });
