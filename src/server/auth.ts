import type { Env } from './env';
import type { AuthorSession } from '../features/writing/domain/model';
export function authorSession(request: Request, env: Env): AuthorSession {
  const url = new URL(request.url);
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const owner = (env.STUDIO_OWNER_EMAIL || (isLocal ? 'seedy@sites.test' : '')).toLowerCase();
  const id = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email')?.toLowerCase();
  const authorized = !!id && !!email && !!owner && email === owner;
  return { authenticated: !!id, authorized, displayName: authorized ? 'KR' : null };
}
export function sameOriginMutation(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  // JSON/XHR mutations carry a non-simple header as an additional CSRF boundary.
  return (
    (!origin || origin === new URL(request.url).origin) &&
    request.headers.get('x-writing-request') === '1'
  );
}
