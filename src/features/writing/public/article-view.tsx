import type { ReactNode } from 'react';
import type { Publication } from '../domain/model';
import { kindLabels } from '../domain/model';
import { headings, titleTransition } from '../domain/document';
import { DocumentRenderer } from './document-renderer';
import { formatDate } from '../domain/date';
export function ArticleView({
  piece,
  ending,
  preview = false,
}: {
  piece: Publication;
  ending?: ReactNode;
  preview?: boolean;
}) {
  const contents = headings(piece.content),
    showContents = piece.wordCount >= 800 && contents.filter((h) => h.level === 2).length >= 3;
  return (
    <article className="publication wrap">
      <header className="publication-heading">
        <div className="micro publication-label">
          {kindLabels[piece.kind]}
          <span>{preview ? 'PRIVATE PREVIEW' : formatDate(piece.publishedAt)}</span>
        </div>
        <h1 style={{ viewTransitionName: titleTransition(piece.id) }}>
          {piece.title || 'An untitled manuscript'}
        </h1>
        {piece.subtitle && <p className="publication-subtitle">{piece.subtitle}</p>}
        <div className="publication-byline micro">
          KR
          <span>
            {piece.readingMinutes > 1 ? `${piece.readingMinutes} MIN READ` : 'A SHORT READ'}
          </span>
        </div>
      </header>
      <div className={`publication-layout ${showContents ? 'has-contents' : ''}`}>
        {showContents && (
          <nav className="publication-contents" aria-label="Article contents">
            <p className="micro">ON THIS PAGE</p>
            {contents.map((h) => (
              <a key={h.id} href={`#${h.id}`} className={h.level === 3 ? 'subheading' : ''}>
                {h.title}
              </a>
            ))}
          </nav>
        )}
        <div className="publication-body">
          <DocumentRenderer content={piece.content} />
          <div className="publication-end" aria-hidden="true">
            <span />
          </div>
          {piece.topics.length > 0 && (
            <p className="publication-topics micro">{piece.topics.join(' · ')}</p>
          )}
        </div>
      </div>
      {ending && <footer className="publication-footer">{ending}</footer>}
    </article>
  );
}
