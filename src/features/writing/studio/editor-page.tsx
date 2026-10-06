import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRouteApi, Link, useBlocker, useNavigate } from '@tanstack/react-router';
import { manuscriptQuery, invalidateWriting } from '../data/queries';
import { writingRepository } from '../data/repository';
import { kindLabels, writingKinds, slugify, type Writing } from '../domain/model';
import { ManuscriptEditor } from '../editor/manuscript-editor';
import { useAutosave } from './use-autosave';
import { DeskDialog } from './dialog';
import { downloadText } from './download';
import { titleTransition } from '../domain/document';
import { writingSchema } from '../domain/schema';
const route = getRouteApi('/studio/$id');
export function EditorPage() {
  const { id } = route.useParams(),
    query = useQuery(manuscriptQuery(id));
  if (query.isPending)
    return (
      <p className="wrap desk-loading" role="status">
        Opening the manuscript…
      </p>
    );
  if (query.error)
    return (
      <div className="wrap desk-loading">
        <p role="alert">{query.error.message}</p>
        <Link to="/studio">← The notebook</Link>
      </div>
    );
  return <WritingDesk key={id} initial={query.data} />;
}
function WritingDesk({ initial }: { initial: Writing }) {
  const save = useAutosave(initial),
    [editorKey, setEditorKey] = useState(0),
    [confirm, setConfirm] = useState<'unpublish' | 'archive' | 'delete' | null>(null),
    [actionError, setActionError] = useState(''),
    navigate = useNavigate(),
    client = useQueryClient();
  const suggestAddress = useRef(!initial.slugLocked && initial.slug.startsWith('untitled-'));
  const [topicsText, setTopicsText] = useState(initial.topics.join(', '));
  const blocker = useBlocker({
    shouldBlockFn: async () => save.isDirty() && !(await save.flush()),
    enableBeforeUnload: () => save.isDirty(),
    withResolver: true,
  });
  const action = useMutation({
    mutationFn: async (name: 'publish' | 'unpublish' | 'archive' | 'restore' | 'delete') => {
      if (!(await save.flush()))
        throw new Error('The manuscript needs to be saved before this action.');
      return writingRepository.action(initial.id, save.revision(), name);
    },
    onSuccess: async (result) => {
      if ('deleted' in result) {
        await navigate({ to: '/studio' });
      } else {
        save.accept(result);
        if (result.status === 'archived') await navigate({ to: '/studio' });
      }
      setConfirm(null);
      await invalidateWriting(client);
    },
  });
  async function preview() {
    setActionError('');
    if (await save.flush())
      await navigate({ to: '/studio/$id/preview', params: { id: initial.id } });
    else
      setActionError(
        'Preview opens once this revision is safely saved. Your local writing is preserved.',
      );
  }
  const stateText = {
    saved: 'Saved',
    dirty: 'Unsaved changes',
    saving: 'Saving…',
    error: save.localSafe ? 'Saved on this device' : 'Not saved',
    conflict: 'Revision conflict',
  }[save.state];
  const disabled = save.record.status === 'archived' || action.isPending;
  function exportCopy() {
    downloadText(
      `${save.manuscript.slug}.plate.json`,
      JSON.stringify({ schemaVersion: writingSchema.version, ...save.manuscript }, null, 2),
    );
  }
  return (
    <section className="writing-desk wrap">
      <div className="desk-topline">
        <Link to="/studio" className="desk-back">
          ← Notebook
        </Link>
        <span className={`desk-save-state micro ${save.state}`} role="status" aria-live="polite">
          {!save.ready ? 'Opening…' : stateText}
        </span>
        <div>
          <button type="button" onClick={() => void preview()} disabled={!save.ready || disabled}>
            Preview ↗
          </button>
          {save.record.status !== 'archived' && (
            <button
              type="button"
              className="desk-publish"
              disabled={!save.ready || disabled || initial.isSample}
              onClick={() => action.mutate('publish')}
            >
              {save.record.status === 'published' ? 'Publish changes' : 'Publish'}
            </button>
          )}
        </div>
      </div>
      {(save.error || save.storageError || action.error || actionError) && (
        <div className="desk-save-problem" role="alert">
          <p>{save.error || save.storageError || action.error?.message || actionError}</p>
          <div>
            {save.state === 'conflict' ? (
              <>
                <button onClick={() => void save.rebase().catch((e) => setActionError(e.message))}>
                  Replace saved version with this copy
                </button>
                <button
                  onClick={() =>
                    void save
                      .discardLocal()
                      .then(() => setEditorKey((k) => k + 1))
                      .catch((e) => setActionError(e.message))
                  }
                >
                  Use saved version
                </button>
              </>
            ) : (
              <button onClick={() => void save.flush()}>Retry save ↗</button>
            )}
            <button onClick={exportCopy}>Export local copy ↓</button>
          </div>
        </div>
      )}
      {initial.isSample && (
        <p className="desk-specimen-notice micro">
          PRIVATE DEVELOPMENT SPECIMEN / PUBLISHING DISABLED
        </p>
      )}
      {save.recovered && save.state !== 'conflict' && (
        <p className="desk-recovered micro">UNSAVED WRITING RECOVERED FROM THIS DEVICE</p>
      )}
      <div className="desk-manuscript-settings">
        <label className="micro">
          <span className="sr-only">Writing kind</span>
          <select
            aria-label="Writing kind"
            value={save.manuscript.kind}
            onChange={(e) => save.update({ kind: e.target.value as Writing['kind'] })}
            disabled={disabled}
          >
            {writingKinds.map((kind) => (
              <option value={kind} key={kind}>
                {kindLabels[kind]}
              </option>
            ))}
          </select>
        </label>
        <details className="desk-settings">
          <summary>Page details</summary>
          <div className="desk-settings-panel">
            <label className="desk-field">
              ADDRESS
              <input
                aria-label="Slug"
                value={save.manuscript.slug}
                disabled={save.record.slugLocked || disabled}
                maxLength={100}
                onChange={(e) => {
                  suggestAddress.current = false;
                  save.update({ slug: e.target.value });
                }}
              />
              <span className="desk-help">
                {save.record.slugLocked
                  ? 'The published address stays permanent.'
                  : 'Use lowercase words and hyphens. It locks on first publication.'}
              </span>
            </label>
            <label className="desk-field">
              DESCRIPTION
              <textarea
                aria-label="Description"
                value={save.manuscript.description}
                maxLength={600}
                onChange={(e) => save.update({ description: e.target.value })}
                disabled={disabled}
              />
            </label>
            <label className="desk-field">
              TOPICS
              <input
                aria-label="Topics"
                value={topicsText}
                onChange={(e) => {
                  setTopicsText(e.target.value);
                  save.update({
                    topics: e.target.value
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .slice(0, 8),
                  });
                }}
                disabled={disabled}
              />
              <span className="desk-help">A few topics, separated by commas.</span>
            </label>
            <label className="desk-field">
              SEARCH TITLE
              <input
                value={save.manuscript.seoTitle}
                aria-label="SEO title"
                maxLength={180}
                onChange={(e) => save.update({ seoTitle: e.target.value })}
                disabled={disabled}
              />
            </label>
            <label className="desk-field">
              SEARCH DESCRIPTION
              <textarea
                value={save.manuscript.seoDescription}
                aria-label="SEO description"
                maxLength={360}
                onChange={(e) => save.update({ seoDescription: e.target.value })}
                disabled={disabled}
              />
            </label>
          </div>
        </details>
      </div>
      <div className="desk-page">
        <label className="sr-only" htmlFor="manuscript-title">
          Title
        </label>
        <textarea
          id="manuscript-title"
          className="desk-title"
          style={{ viewTransitionName: titleTransition(initial.id) }}
          placeholder="An untitled thought"
          value={save.manuscript.title}
          maxLength={180}
          rows={1}
          disabled={disabled || !save.ready}
          onChange={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
            save.update({
              title: e.target.value,
              ...(!save.record.slugLocked && suggestAddress.current
                ? { slug: slugify(e.target.value) || save.manuscript.slug }
                : {}),
            });
          }}
        />
        <label className="sr-only" htmlFor="manuscript-subtitle">
          Subtitle
        </label>
        <textarea
          id="manuscript-subtitle"
          className="desk-subtitle"
          placeholder="A subtitle, if the thought needs one."
          value={save.manuscript.subtitle}
          maxLength={360}
          rows={1}
          onChange={(e) => save.update({ subtitle: e.target.value })}
          disabled={disabled || !save.ready}
        />
        {save.ready && (
          <ManuscriptEditor
            key={editorKey}
            id={initial.id}
            value={save.manuscript.content}
            onChange={(content) => save.update({ content })}
            disabled={disabled}
          />
        )}
      </div>
      <footer className="desk-page-end">
        <div className="micro">
          {save.record.status.toUpperCase()}
          {save.record.status === 'published' &&
          save.record.revision !== save.record.publishedRevision
            ? ' / PRIVATE CHANGES'
            : ''}
        </div>
        <div>
          <button onClick={exportCopy}>Export manuscript ↓</button>
          {save.record.status === 'published' && (
            <>
              <Link to="/writing/$slug" params={{ slug: save.record.slug }}>
                Read published edition ↗
              </Link>
              <button onClick={() => setConfirm('unpublish')} disabled={action.isPending}>
                Unpublish
              </button>
            </>
          )}
          {save.record.status === 'archived' ? (
            <button onClick={() => action.mutate('restore')} disabled={action.isPending}>
              Restore manuscript ↗
            </button>
          ) : (
            <button onClick={() => setConfirm('archive')} disabled={action.isPending}>
              Archive
            </button>
          )}
          <button onClick={() => setConfirm('delete')} disabled={action.isPending}>
            Delete
          </button>
        </div>
      </footer>
      {confirm && (
        <DeskDialog
          title={
            confirm === 'delete'
              ? 'Remove this manuscript?'
              : confirm === 'archive'
                ? 'Set this page aside?'
                : 'Return this piece to the notebook?'
          }
          onClose={() => setConfirm(null)}
        >
          <p>
            {confirm === 'delete'
              ? 'This removes the manuscript and its images permanently. Export a copy first if you want to keep it.'
              : confirm === 'archive'
                ? 'The page will leave the public notebook and move to your private archive. You can restore it later.'
                : 'The published page and its images will become private. Your manuscript stays at the desk.'}
          </p>
          {action.error && (
            <p className="desk-error" role="alert">
              {action.error.message}
            </p>
          )}
          <div className="desk-dialog-actions">
            <button onClick={() => setConfirm(null)}>Keep writing</button>
            <button
              className="desk-primary"
              disabled={action.isPending}
              onClick={() => action.mutate(confirm)}
            >
              {action.isPending
                ? 'Working…'
                : confirm === 'delete'
                  ? 'Delete permanently'
                  : confirm === 'archive'
                    ? 'Move to archive'
                    : 'Unpublish'}
            </button>
          </div>
        </DeskDialog>
      )}
      {blocker.status === 'blocked' && (
        <DeskDialog title="The page hasn’t reached the desk." onClose={blocker.reset}>
          <p>Your changes are still here. Try saving again before you leave.</p>
          <div className="desk-dialog-actions">
            <button onClick={blocker.reset}>Keep writing</button>
            <button
              onClick={() =>
                void save.flush().then((ok) => {
                  if (ok) blocker.proceed();
                })
              }
            >
              Retry & continue
            </button>
            <button onClick={exportCopy}>Export a copy ↓</button>
            <button
              disabled={!save.localSafe}
              onClick={() =>
                void save.checkpoint().then((ok) => {
                  if (ok) blocker.proceed();
                })
              }
            >
              Leave with device recovery
            </button>
          </div>
        </DeskDialog>
      )}
    </section>
  );
}
