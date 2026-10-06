import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { publishedQuery } from '../data/queries';
import { kindLabels } from '../domain/model';
import { titleTransition } from '../domain/document';
import { formatDate } from '../domain/date';
export function WritingIndex() {
  const { data: pieces } = useSuspenseQuery(publishedQuery());
  return (
    <section className="writing-index wrap" aria-labelledby="writing-title">
      <div className="writing-intro">
        <span className="micro">02 / AN OPEN NOTEBOOK</span>
        <h1 id="writing-title">
          Thinking,
          <br />
          <em>in writing.</em>
        </h1>
        <p>
          Notes on making, learning,
          <br />
          and paying attention.
        </p>
      </div>
      {pieces.length === 0 ? (
        <div className="writing-empty">
          <span className="micro">THE FIRST PAGE</span>
          <h2>
            A little room
            <br />
            <em>for a first thought.</em>
          </h2>
          <p>Nothing published yet. This is where the notes will gather.</p>
        </div>
      ) : (
        <div className="writing-archive">
          {pieces.map((piece, index) => {
            const year = piece.publishedAt.slice(0, 4),
              previousYear = pieces[index - 1]?.publishedAt.slice(0, 4);
            return (
              <div key={piece.id}>
                {year !== previousYear && <h2 className="writing-year micro">{year}</h2>}
                <article className="writing-entry">
                  <time className="micro" dateTime={piece.publishedAt}>
                    {formatDate(piece.publishedAt, false)}
                  </time>
                  <Link
                    to="/writing/$slug"
                    params={{ slug: piece.slug }}
                    className="writing-entry-link"
                  >
                    <h3 style={{ viewTransitionName: titleTransition(piece.id) }}>
                      {piece.title}
                      <span aria-hidden="true">↗</span>
                    </h3>
                    {piece.description && <p>{piece.description}</p>}
                    <span className="micro">
                      {kindLabels[piece.kind]}
                      {piece.readingMinutes > 1 ? ` / ${piece.readingMinutes} MIN` : ''}
                    </span>
                  </Link>
                </article>
              </div>
            );
          })}
        </div>
      )}
      <div className="writing-index-ending micro">
        <a href={`${import.meta.env.BASE_URL}writing/feed.xml`}>FOLLOW BY RSS ↗</a>
        <Link to="/projects">BACK TO THE WORK ↗</Link>
      </div>
    </section>
  );
}
