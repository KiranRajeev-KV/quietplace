import { queryOptions, QueryClient } from '@tanstack/react-query';
import { writingRepository, WritingRequestError } from './repository';
export const writingKeys = {
  public: ['writing', 'published'] as const,
  article: (slug: string) => ['writing', 'article', slug] as const,
  studio: ['studio', 'writing'] as const,
  manuscript: (id: string) => ['studio', 'manuscript', id] as const,
  session: ['author-session'] as const,
};
export const publishedQuery = () =>
  queryOptions({
    queryKey: writingKeys.public,
    queryFn: writingRepository.published,
    staleTime: 30_000,
  });
export const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: writingKeys.article(slug),
    queryFn: () => writingRepository.article(slug),
    staleTime: 30_000,
  });
export const manuscriptsQuery = () =>
  queryOptions({
    queryKey: writingKeys.studio,
    queryFn: writingRepository.manuscripts,
    staleTime: 10_000,
  });
export const manuscriptQuery = (id: string) =>
  queryOptions({
    queryKey: writingKeys.manuscript(id),
    queryFn: () => writingRepository.manuscript(id),
    staleTime: 10_000,
  });
export const sessionQuery = () =>
  queryOptions({
    queryKey: writingKeys.session,
    queryFn: writingRepository.session,
    staleTime: 30_000,
    retry: false,
  });
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (count, error) =>
          !(error instanceof WritingRequestError && error.status < 500) && count < 2,
      },
      mutations: { retry: false },
    },
  });
}
export async function invalidateWriting(client: QueryClient) {
  await Promise.all([
    client.invalidateQueries({ queryKey: ['writing'] }),
    client.invalidateQueries({ queryKey: writingKeys.studio }),
  ]);
}
