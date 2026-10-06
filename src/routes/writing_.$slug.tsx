import { createFileRoute, notFound } from '@tanstack/react-router';
import { articleQuery } from '@/features/writing/data/queries';
import { WritingRequestError } from '@/features/writing/data/repository';
import { WritingArticle } from '@/features/writing/public/writing-article';
import { articleHead } from '@/features/writing/public/metadata';
export const Route = createFileRoute('/writing_/$slug')({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(articleQuery(params.slug));
    } catch (error) {
      if (error instanceof WritingRequestError && error.status === 404) throw notFound();
      throw error;
    }
  },
  head: ({ loaderData }) => (loaderData ? articleHead(loaderData) : {}),
  component: WritingArticle,
});
