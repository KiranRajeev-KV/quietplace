import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const writing = sqliteTable(
  'writing',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    manuscript: text('manuscript').notNull(),
    publication: text('publication'),
    revision: integer('revision').notNull().default(0),
    publishedRevision: integer('published_revision'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    publishedAt: text('published_at'),
    lastPublishedAt: text('last_published_at'),
    archived: integer('archived').notNull().default(0),
    deletedAt: text('deleted_at'),
    sample: integer('sample').notNull().default(0),
    slugLocked: integer('slug_locked').notNull().default(0),
  },
  (table) => [
    index('writing_public_archive').on(table.archived, table.deletedAt, table.publishedAt),
  ],
);
export const media = sqliteTable(
  'media',
  {
    id: text('id').primaryKey(),
    writingId: text('writing_id')
      .notNull()
      .references(() => writing.id),
    key: text('key').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    size: integer('size').notNull(),
    alt: text('alt').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('media_writing').on(table.writingId)],
);
export const publishedMedia = sqliteTable(
  'published_media',
  {
    mediaId: text('media_id')
      .notNull()
      .references(() => media.id),
    writingId: text('writing_id')
      .notNull()
      .references(() => writing.id),
  },
  (table) => [index('published_media_lookup').on(table.mediaId)],
);
