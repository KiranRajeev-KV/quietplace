import type { D1Database } from '@cloudflare/workers-types';
import {
  newManuscript,
  excerpt,
  readingStats,
  mediaIds,
  type Manuscript,
  type Writing,
  type Publication,
} from '../features/writing/domain/model';
interface Row {
  id: string;
  slug: string;
  manuscript: string;
  publication: string | null;
  revision: number;
  published_revision: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  last_published_at: string | null;
  archived: number;
  sample: number;
  slug_locked: number;
}
const decode = (row: Row): Writing => ({
  ...(JSON.parse(row.manuscript) as Manuscript),
  id: row.id,
  slug: row.slug,
  revision: row.revision,
  publishedRevision: row.published_revision,
  status: row.archived ? 'archived' : row.publication ? 'published' : 'draft',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  publishedAt: row.published_at,
  lastPublishedAt: row.last_published_at,
  isSample: !!row.sample,
  slugLocked: !!row.slug_locked,
});
export class RepositoryError extends Error {
  status: 404 | 409 | 422;
  code: string;
  constructor(
    message: string,
    status: 404 | 409 | 422,
    code = status === 409 ? 'revision_conflict' : 'invalid_manuscript',
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export class WritingRepository {
  private db: D1Database;
  constructor(db: D1Database) {
    this.db = db;
  }
  async list() {
    const { results } = await this.db
      .prepare('SELECT * FROM writing WHERE deleted_at IS NULL ORDER BY updated_at DESC')
      .all<Row>();
    return results.map(decode);
  }
  async get(id: string) {
    const row = await this.db
      .prepare('SELECT * FROM writing WHERE id = ? AND deleted_at IS NULL')
      .bind(id)
      .first<Row>();
    if (!row) throw new RepositoryError('This manuscript could not be found.', 404);
    return decode(row);
  }
  async create(manuscript?: Manuscript, sample = false) {
    const id = crypto.randomUUID(),
      now = new Date().toISOString();
    const value = manuscript ?? newManuscript(id);
    await this.db
      .prepare(
        'INSERT INTO writing (id,slug,manuscript,created_at,updated_at,sample) VALUES (?,?,?,?,?,?)',
      )
      .bind(id, value.slug, JSON.stringify(value), now, now, sample ? 1 : 0)
      .run();
    return this.get(id);
  }
  async save(id: string, revision: number, value: Manuscript) {
    const current = await this.get(id);
    if (current.status === 'archived')
      throw new RepositoryError('Restore this manuscript before editing.', 409);
    if (current.slugLocked && value.slug !== current.slug)
      throw new RepositoryError(
        'A published address is permanent. Keep its original slug.',
        409,
        'invalid_address',
      );
    try {
      const result = await this.db
        .prepare(
          'UPDATE writing SET manuscript=?,slug=?,revision=revision+1,updated_at=? WHERE id=? AND revision=? AND deleted_at IS NULL',
        )
        .bind(JSON.stringify(value), value.slug, new Date().toISOString(), id, revision)
        .run();
      if (result.meta.changes !== 1)
        throw new RepositoryError(
          'A newer revision exists. Your local writing is preserved; reload the saved version or export your local copy.',
          409,
        );
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      if (String(error).includes('UNIQUE'))
        throw new RepositoryError(
          'That address belongs to another piece. Choose a different slug.',
          409,
          'slug_conflict',
        );
      throw error;
    }
    return this.get(id);
  }
  async publish(id: string, revision: number) {
    const current = await this.get(id);
    if (current.revision !== revision)
      throw new RepositoryError('Save the latest changes before publishing.', 409);
    if (current.isSample)
      throw new RepositoryError(
        'Private specimens cannot be published. Create your own manuscript.',
        422,
      );
    if (
      current.status === 'archived' ||
      !current.title.trim() ||
      readingStats(current.content).wordCount === 0
    )
      throw new RepositoryError('A title and some writing are needed before publishing.', 422);
    for (const node of current.content)
      if (node.type === 'img' && (!(typeof node.alt === 'string') || !node.alt.trim()))
        throw new RepositoryError(
          'Give each image a useful alt description before publishing.',
          422,
        );
    const now = new Date().toISOString();
    const {
      id: _,
      revision: __,
      publishedRevision: ___,
      status: ____,
      createdAt: _____,
      updatedAt: ______,
      publishedAt: _______,
      lastPublishedAt: ________,
      isSample: _________,
      slugLocked: __________,
      ...manuscript
    } = current;
    const publication: Publication = {
      ...manuscript,
      id,
      publishedAt: current.publishedAt ?? now,
      updatedAt: now,
      description: excerpt(current),
      ...readingStats(current.content),
    };
    const ids = mediaIds(current);
    const statements = [
      this.db
        .prepare(
          'DELETE FROM published_media WHERE writing_id=? AND EXISTS (SELECT 1 FROM writing WHERE id=? AND revision=? AND archived=0 AND deleted_at IS NULL)',
        )
        .bind(id, id, revision),
      ...ids.map((mediaId) =>
        this.db
          .prepare(
            'INSERT INTO published_media (media_id,writing_id) SELECT ?,? WHERE EXISTS (SELECT 1 FROM writing WHERE id=? AND revision=? AND archived=0 AND deleted_at IS NULL)',
          )
          .bind(mediaId, id, id, revision),
      ),
      this.db
        .prepare(
          'UPDATE writing SET publication=?,published_revision=revision+1,revision=revision+1,published_at=COALESCE(published_at,?),last_published_at=?,slug_locked=1 WHERE id=? AND revision=? AND archived=0 AND deleted_at IS NULL',
        )
        .bind(JSON.stringify(publication), now, now, id, revision),
    ];
    const results = await this.db.batch(statements);
    if (results.at(-1)?.meta.changes !== 1)
      throw new RepositoryError('A newer revision exists. Save and try again.', 409);
    return this.get(id);
  }
  async action(
    id: string,
    action: 'unpublish' | 'archive' | 'restore' | 'delete',
    revision: number,
  ) {
    const current = await this.get(id);
    if (current.revision !== revision)
      throw new RepositoryError('The manuscript changed. Reload before changing its status.', 409);
    const now = new Date().toISOString();
    const sql =
      action === 'restore'
        ? 'UPDATE writing SET archived=0,revision=revision+1,updated_at=? WHERE id=? AND revision=?'
        : action === 'delete'
          ? "UPDATE writing SET deleted_at=?,publication=NULL,manuscript='{}',revision=revision+1 WHERE id=? AND revision=?"
          : action === 'archive'
            ? 'UPDATE writing SET archived=1,publication=NULL,published_revision=NULL,revision=revision+1,updated_at=? WHERE id=? AND revision=?'
            : 'UPDATE writing SET publication=NULL,published_revision=NULL,revision=revision+1,updated_at=? WHERE id=? AND revision=?';
    const results = await this.db.batch([
      this.db
        .prepare(
          'DELETE FROM published_media WHERE writing_id=? AND EXISTS (SELECT 1 FROM writing WHERE id=? AND revision=?)',
        )
        .bind(id, id, revision),
      this.db.prepare(sql).bind(now, id, revision),
    ]);
    if (results[1]?.meta.changes !== 1)
      throw new RepositoryError('The manuscript changed. Please reload.', 409);
    return action === 'delete' ? null : this.get(id);
  }
  async published() {
    const { results } = await this.db
      .prepare(
        'SELECT publication FROM writing WHERE publication IS NOT NULL AND archived=0 AND deleted_at IS NULL AND sample=0 ORDER BY published_at DESC,id DESC',
      )
      .all<{ publication: string }>();
    return results.map((row) => JSON.parse(row.publication) as Publication);
  }
  async bySlug(slug: string) {
    const row = await this.db
      .prepare(
        'SELECT publication FROM writing WHERE slug=? AND publication IS NOT NULL AND archived=0 AND deleted_at IS NULL AND sample=0',
      )
      .bind(slug)
      .first<{ publication: string }>();
    return row ? (JSON.parse(row.publication) as Publication) : null;
  }
}
