import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, getRouteApi } from '@tanstack/react-router';
import { articleQuery, publishedQuery } from '../data/queries';
import { ArticleView } from './article-view';
const route = getRouteApi('/writing_/$slug');
export function WritingArticle() {
  const { slug } = route.useParams(),
    { data: piece } = useSuspenseQuery(articleQuery(slug)),
    { data: archive } = useSuspenseQuery(publishedQuery());
  const index = archive.findIndex((p) => p.id === piece.id),
    next = archive[index + 1];
  return (
    <ArticleView
      piece={piece}
      ending={
        <>
          <Link to="/writing" className="text-link">
            ← All writing
          </Link>
          {next && (
            <Link to="/writing/$slug" params={{ slug: next.slug }} className="publication-next">
              <span className="micro">ANOTHER PAGE</span>
              <span>{next.title} ↗</span>
            </Link>
          )}
        </>
      }
    />
  );
}
