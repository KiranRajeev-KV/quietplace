import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { imageSize } from 'image-size';
import { z } from 'zod';
import type { Env } from './env';
import { authorSession, sameOriginMutation } from './auth';
import { WritingRepository, RepositoryError } from './writing-repository';
import { mediaIds, summaryOf } from '../features/writing/domain/model';
import { manuscriptSchema } from '../features/writing/domain/validation';
import { publicDocument } from './public-documents';
const app = new Hono<{ Bindings: Env }>();
app.use('*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  await next();
});
app.use(
  '/api/*',
  bodyLimit({
    maxSize: 3_000_000,
    onError: (c) => c.json({ error: 'This file or document is too large.' }, 413),
  }),
);
app.use('/api/studio/*', async (c, next) => {
  c.header('Cache-Control', 'private, no-store');
  const session = authorSession(c.req.raw, c.env);
  if (!session.authorized)
    return c.json(
      {
        error: session.authenticated
          ? 'This desk belongs to another author.'
          : 'Sign in to open your writing desk.',
      },
      session.authenticated ? 403 : 401,
    );
  if (!['GET', 'HEAD'].includes(c.req.method) && !sameOriginMutation(c.req.raw))
    return c.json({ error: 'This request must come from your writing desk.' }, 403);
  await next();
});
app.get('/api/session', (c) => {
  c.header('Cache-Control', 'private, no-store');
  return c.json(authorSession(c.req.raw, c.env));
});
app.get('/api/writing', async (c) => {
  c.header('Cache-Control', 'no-store');
  const records = await new WritingRepository(c.env.DB).published();
  return c.json(records.map(summaryOf));
});
app.get('/api/writing/:slug', async (c) => {
  c.header('Cache-Control', 'no-store');
  const piece = await new WritingRepository(c.env.DB).bySlug(c.req.param('slug'));
  return piece ? c.json(piece) : c.json({ error: 'This page has not been published.' }, 404);
});
app.get('/api/studio/writing', async (c) => c.json(await new WritingRepository(c.env.DB).list()));
app.get('/api/studio/writing/:id', async (c) =>
  c.json(await new WritingRepository(c.env.DB).get(c.req.param('id'))),
);
app.post('/api/studio/writing', async (c) => {
  const input = z
    .object({ manuscript: manuscriptSchema.optional(), sample: z.boolean().optional() })
    .parse(await c.req.json());
  if (input.manuscript && mediaIds(input.manuscript).length)
    throw new RepositoryError('Upload images after creating the manuscript.', 422);
  return c.json(await new WritingRepository(c.env.DB).create(input.manuscript, input.sample), 201);
});
app.put('/api/studio/writing/:id', async (c) => {
  const input = z
    .object({ revision: z.number().int().nonnegative(), manuscript: manuscriptSchema })
    .parse(await c.req.json());
  const id = c.req.param('id');
  for (const mediaId of mediaIds(input.manuscript)) {
    const owned = await c.env.DB.prepare('SELECT id FROM media WHERE id=? AND writing_id=?')
      .bind(mediaId, id)
      .first();
    if (!owned) throw new RepositoryError('An image does not belong to this manuscript.', 422);
  }
  return c.json(await new WritingRepository(c.env.DB).save(id, input.revision, input.manuscript));
});
app.post('/api/studio/writing/:id/media', async (c) => {
  const id = c.req.param('id');
  const manuscript = await new WritingRepository(c.env.DB).get(id);
  if (manuscript.status === 'archived')
    throw new RepositoryError('Restore this manuscript before adding images.', 409);
  const data = await c.req.parseBody();
  const file = data.file,
    alt = typeof data.alt === 'string' ? data.alt.trim() : '';
  if (
    !(file instanceof File) ||
    file.type !== 'image/webp' ||
    file.size > 2_000_000 ||
    !alt ||
    alt.length > 600
  )
    throw new RepositoryError(
      'Choose an optimized image under 2 MB and add an alt description.',
      422,
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  let dimensions;
  try {
    dimensions = imageSize(bytes);
  } catch {
    throw new RepositoryError('This file is not a readable WebP image.', 422);
  }
  if (
    dimensions.type !== 'webp' ||
    !dimensions.width ||
    !dimensions.height ||
    dimensions.width > 2400 ||
    dimensions.height > 2400
  )
    throw new RepositoryError('The image must be WebP, at most 2400 pixels on either side.', 422);
  const mediaId = crypto.randomUUID(),
    key = `writing/${id}/${mediaId}.webp`;
  await c.env.FILES.put(key, bytes, { httpMetadata: { contentType: 'image/webp' } });
  try {
    await c.env.DB.prepare(
      'INSERT INTO media (id,writing_id,key,width,height,size,alt,created_at) VALUES (?,?,?,?,?,?,?,?)',
    )
      .bind(
        mediaId,
        id,
        key,
        dimensions.width,
        dimensions.height,
        file.size,
        alt,
        new Date().toISOString(),
      )
      .run();
  } catch (error) {
    await c.env.FILES.delete(key);
    throw error;
  }
  return c.json(
    {
      id: mediaId,
      url: `${c.env.BASE_PATH ?? '/'}media/${mediaId}`,
      width: dimensions.width,
      height: dimensions.height,
      size: file.size,
      alt,
    },
    201,
  );
});
app.post('/api/studio/writing/:id/:action', async (c) => {
  const action = z
    .enum(['publish', 'unpublish', 'archive', 'restore', 'delete'])
    .parse(c.req.param('action'));
  const { revision } = z
    .object({ revision: z.number().int().nonnegative() })
    .parse(await c.req.json());
  const repository = new WritingRepository(c.env.DB),
    id = c.req.param('id');
  const result =
    action === 'publish'
      ? await repository.publish(id, revision)
      : await repository.action(id, action, revision);
  if (action === 'delete') {
    const { results } = await c.env.DB.prepare('SELECT key FROM media WHERE writing_id=?')
      .bind(id)
      .all<{ key: string }>();
    if (results.length) await c.env.FILES.delete(results.map((r) => r.key));
    await c.env.DB.prepare('DELETE FROM media WHERE writing_id=?').bind(id).run();
  }
  return c.json(result ?? { deleted: true });
});
app.get('/media/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM media WHERE id=?')
    .bind(id)
    .first<{ key: string; writing_id: string }>();
  if (!row) return c.notFound();
  const published = await c.env.DB.prepare(
    'SELECT media_id FROM published_media JOIN writing ON writing.id=published_media.writing_id WHERE media_id=? AND writing.publication IS NOT NULL AND writing.archived=0 AND writing.deleted_at IS NULL',
  )
    .bind(id)
    .first();
  if (!published && !authorSession(c.req.raw, c.env).authorized) return c.notFound();
  const object = await c.env.FILES.get(row.key);
  if (!object) return c.notFound();
  // Re-check publication on each request: unpublishing must revoke public media.
  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'private, no-store',
      ETag: object.httpEtag,
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
app.onError((error, c) => {
  if (error instanceof RepositoryError)
    return c.json({ error: error.message, code: error.code }, error.status);
  if (error instanceof z.ZodError)
    return c.json({ error: 'Check the manuscript fields and supported formatting.' }, 422);
  console.error('Writing request failed', error.name);
  return c.json(
    {
      error:
        'The writing desk could not complete this request. Your local changes are still available.',
    },
    500,
  );
});
export default {
  async fetch(
    request: Request,
    env: Env,
    context: import('@cloudflare/workers-types').ExecutionContext,
  ) {
    const original = new URL(request.url),
      base = env.BASE_PATH ?? '/';
    const path =
      base === '/'
        ? original.pathname
        : original.pathname.startsWith(base)
          ? `/${original.pathname.slice(base.length)}`
          : original.pathname;
    const routed = new URL(request.url);
    routed.pathname = path;
    if (path.startsWith('/api/') || path.startsWith('/media/'))
      return app.fetch(new Request(routed, request), env, context);
    if (
      path === '/writing' ||
      path.startsWith('/writing/') ||
      path === '/sitemap.xml' ||
      path === '/robots.txt'
    )
      return publicDocument(request, env, path);
    if (path === '/studio' || path.startsWith('/studio/')) {
      const response = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'private, no-store');
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      return new Response(response.body, { status: response.status, headers });
    }
    // Asset keys are rooted in dist/client, independent of the URL prefix.
    return env.ASSETS.fetch(new Request(routed, request));
  },
};
