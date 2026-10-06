import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router';
import { manuscriptQuery, invalidateWriting } from '../data/queries';
import { writingRepository } from '../data/repository';
import { toManuscript, readingStats, excerpt, type Publication } from '../domain/model';
import { ArticleView } from '../public/article-view';
const route = getRouteApi('/studio/$id_/preview');
export function PreviewPage() {
  const { id } = route.useParams(),
    query = useQuery(manuscriptQuery(id)),
    client = useQueryClient(),
    navigate = useNavigate();
  const publish = useMutation({
    mutationFn: () => writingRepository.action(id, query.data!.revision, 'publish'),
    onSuccess: async (piece) => {
      if ('deleted' in piece) return;
      await invalidateWriting(client);
      await navigate({ to: '/writing/$slug', params: { slug: piece.slug } });
    },
  });
  if (query.isPending)
    return (
      <p className="wrap desk-loading" role="status">
        Setting the page…
      </p>
    );
  if (query.error)
    return (
      <p className="wrap desk-loading" role="alert">
        {query.error.message}
      </p>
    );
  const draft = query.data,
    piece: Publication = {
      ...toManuscript(draft),
      id,
      publishedAt: draft.publishedAt ?? draft.createdAt,
      updatedAt: draft.updatedAt,
      description: excerpt(draft),
      ...readingStats(draft.content),
    };
  return (
    <>
      <div className="preview-strip wrap">
        <Link to="/studio/$id" params={{ id }}>
          ← Return to writing
        </Link>
        <span className="micro">PRIVATE PREVIEW{draft.isSample ? ' / SPECIMEN' : ''}</span>
        <button
          className="desk-publish"
          disabled={draft.isSample || publish.isPending || draft.status === 'archived'}
          onClick={() => publish.mutate()}
        >
          {publish.isPending ? 'Publishing…' : 'Publish this edition ↗'}
        </button>
      </div>
      {publish.error && (
        <p className="wrap desk-error" role="alert">
          {publish.error.message}
        </p>
      )}
      <ArticleView
        piece={piece}
        preview
        ending={
          <Link className="text-link" to="/studio/$id" params={{ id }}>
            ← Return to the manuscript
          </Link>
        }
      />
    </>
  );
}
