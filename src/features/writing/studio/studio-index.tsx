import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { manuscriptsQuery } from '../data/queries';
import { writingRepository } from '../data/repository';
import { kindLabels } from '../domain/model';
import { formatDate } from '../domain/date';
import { sampleLabels, sampleManuscript } from './samples';
export function StudioIndex() {
  const { data: pieces, isPending, error } = useQuery(manuscriptsQuery()),
    [filter, setFilter] = useState('active'),
    [search, setSearch] = useState(''),
    navigate = useNavigate();
  const createSample = useMutation({
    mutationFn: (kind: keyof typeof sampleLabels) =>
      writingRepository.create(sampleManuscript(kind), true),
    onSuccess: (piece) => navigate({ to: '/studio/$id', params: { id: piece.id } }),
  });
  const visible = pieces?.filter(
    (p) =>
      (filter === 'active' ? p.status !== 'archived' : p.status === filter) &&
      `${p.title} ${p.kind}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="desk-index wrap">
      <div className="desk-index-heading">
        <div>
          <p className="micro">MANUSCRIPT ARCHIVE</p>
          <h1>
            Thoughts,
            <br />
            <em>in progress.</em>
          </h1>
        </div>
        <Link to="/studio/new" className="text-link">
          A fresh page <span>＋</span>
        </Link>
      </div>
      <div className="desk-index-tools">
        <nav aria-label="Manuscript filter">
          {[
            ['active', 'All writing'],
            ['draft', 'Drafts'],
            ['published', 'Published'],
            ['archived', 'Archive'],
          ].map(([value, label]) => (
            <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value!)}>
              {label}
            </button>
          ))}
        </nav>
        {pieces && pieces.length >= 8 && (
          <input
            type="search"
            aria-label="Find a manuscript"
            placeholder="Find a thought…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>
      {isPending && (
        <p className="desk-archive-state" role="status">
          Opening the notebook…
        </p>
      )}
      {error && (
        <p role="alert" className="desk-archive-state desk-error">
          {error.message}
        </p>
      )}
      {visible && visible.length === 0 && (
        <div className="desk-archive-state">
          <span className="micro">A LITTLE SPACE</span>
          <h2>{filter === 'active' ? 'The notebook is open.' : 'No pages here, yet.'}</h2>
          <p>
            {filter === 'active'
              ? 'A sentence is enough to begin.'
              : 'Your manuscripts will gather here.'}
          </p>
          {filter === 'active' && (
            <Link to="/studio/new" className="text-link">
              Write a first thought ↗
            </Link>
          )}
        </div>
      )}
      <div className="desk-manuscripts">
        {visible?.map((piece) => (
          <Link
            key={piece.id}
            to="/studio/$id"
            params={{ id: piece.id }}
            className="desk-manuscript"
          >
            <span className={`micro manuscript-status ${piece.status}`}>
              {piece.status}
              {piece.isSample ? ' / SPECIMEN' : ''}
            </span>
            <div>
              <h2>
                {piece.title || 'An untitled thought'}
                <span aria-hidden="true">↗</span>
              </h2>
              <p>
                {kindLabels[piece.kind]}
                {piece.status === 'published' && piece.revision !== piece.publishedRevision
                  ? ' · Private changes'
                  : ''}
              </p>
            </div>
            <time className="micro" dateTime={piece.updatedAt}>
              {formatDate(piece.updatedAt)}
            </time>
          </Link>
        ))}
      </div>
      <details className="desk-specimens">
        <summary>Private typesetting specimens</summary>
        <p>
          Development writing for trying the instrument. These pages are marked and cannot be
          published.
        </p>
        <div>
          {Object.entries(sampleLabels).map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              onClick={() => createSample.mutate(kind as keyof typeof sampleLabels)}
              disabled={createSample.isPending}
            >
              {label} ↗
            </button>
          ))}
        </div>
        {createSample.error && <p role="alert">{createSample.error.message}</p>}
      </details>
      <footer className="desk-index-end micro">
        <span>KEEP A NOTE. LET IT BECOME SOMETHING.</span>
        <Link to="/writing">THE OPEN NOTEBOOK ↗</Link>
      </footer>
    </section>
  );
}
