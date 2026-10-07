import { createHash, timingSafeEqual } from 'node:crypto';
import { Hono, type Context } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { z } from 'zod';
import type { Env } from './env';
import type { AuthorSession } from '../features/writing/domain/model';
import { siteName } from '../content/site';

type AuthEnv = Pick<Env, 'STUDIO_PASSWORD' | 'AUTH_LIMITER'>;

const lifetime = 7 * 24 * 60 * 60;
const localOnlyPassword = 'local-development-only-change-before-deploy';

function cookieOptions<E extends AuthEnv>(c: Context<{ Bindings: E }>) {
  const url = new URL(c.req.url);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  return {
    name: url.protocol === 'https:' ? `__Host-${siteName}-session` : `${siteName}-session`,
    secure: url.protocol === 'https:',
    local,
    path: '/' as const,
    httpOnly: true,
    sameSite: 'Strict' as const,
  };
}

function configuredPassword<E extends AuthEnv>(c: Context<{ Bindings: E }>) {
  const password = c.env.STUDIO_PASSWORD;
  const options = cookieOptions(c);
  if (
    !password ||
    password.length < 32 ||
    password.length > 512 ||
    (!options.local && (!options.secure || password === localOnlyPassword))
  )
    return null;
  return password;
}

export async function authorSession<E extends AuthEnv>(
  c: Context<{ Bindings: E }>,
): Promise<AuthorSession> {
  const password = configuredPassword(c);
  const anonymous = { authenticated: false, authorized: false, displayName: null };
  if (!password) return anonymous;
  const token = await getSignedCookie(c, `${siteName}:studio:${password}`, cookieOptions(c).name);
  if (!token || !/^\d{13}\.[\da-f-]{36}$/.test(token)) return anonymous;
  const expiry = Number(token.split('.')[0]);
  const now = Date.now();
  if (expiry <= now || expiry > now + lifetime * 1000) return anonymous;
  return { authenticated: true, authorized: true, displayName: 'Author' };
}
export function sameOriginMutation(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  return (
    (!origin || origin === new URL(request.url).origin) &&
    request.headers.get('x-writing-request') === '1'
  );
}

export const authRoutes = new Hono<{ Bindings: AuthEnv }>();
authRoutes.use(
  '*',
  bodyLimit({
    maxSize: 2048,
    onError: (c) => c.json({ error: 'This sign-in request is too large.' }, 413),
  }),
);
authRoutes.use('*', async (c, next) => {
  c.header('Cache-Control', 'private, no-store');
  if (!sameOriginMutation(c.req.raw))
    return c.json({ error: 'Use the sign-in form on this site.' }, 403);
  await next();
});
authRoutes.post('/login', async (c) => {
  const password = configuredPassword(c);
  if (!password) return c.json({ error: 'Studio sign-in has not been configured.' }, 503);
  if (!c.env.AUTH_LIMITER)
    return c.json({ error: 'Studio sign-in is temporarily unavailable.' }, 503);
  const { success } = await c.env.AUTH_LIMITER.limit({
    key: `studio:${c.req.header('cf-connecting-ip') ?? 'local'}`,
  });
  if (!success) {
    c.header('Retry-After', '60');
    return c.json({ error: 'Too many attempts. Wait a minute and try again.' }, 429);
  }
  const input = z
    .object({ password: z.string().max(512) })
    .safeParse(await c.req.json().catch(() => null));
  if (!input.success) return c.json({ error: 'Enter your Studio passphrase.' }, 400);
  const digest = (value: string) => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(digest(input.data.password), digest(password)))
    return c.json({ error: 'That passphrase did not open the desk.' }, 401);
  const options = cookieOptions(c);
  await setSignedCookie(
    c,
    options.name,
    `${Date.now() + lifetime * 1000}.${crypto.randomUUID()}`,
    `${siteName}:studio:${password}`,
    { ...options, maxAge: lifetime },
  );
  return c.json({ authenticated: true, authorized: true, displayName: 'Author' });
});
authRoutes.post('/logout', (c) => {
  const options = cookieOptions(c);
  deleteCookie(c, options.name, options);
  return c.json({ authenticated: false, authorized: false, displayName: null });
});
