import type {
  AuthorSession,
  Manuscript,
  Publication,
  Writing,
  WritingSummary,
} from '../domain/model';
export class WritingRequestError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code = '') {
    super(message);
    this.status = status;
    this.code = code;
  }
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`, {
    signal: AbortSignal.timeout(20_000),
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      'X-Writing-Request': '1',
      ...options.headers,
    },
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok)
    throw new WritingRequestError(
      data && typeof data === 'object' && 'error' in data
        ? String(data.error)
        : 'The connection did not complete. Your writing is kept on this device.',
      response.status,
      data && typeof data === 'object' && 'code' in data ? String(data.code) : '',
    );
  return data as T;
}
export const writingRepository = {
  session: () => request<AuthorSession>('api/session'),
  published: () => request<WritingSummary[]>('api/writing'),
  article: (slug: string) => request<Publication>(`api/writing/${encodeURIComponent(slug)}`),
  manuscripts: () => request<Writing[]>('api/studio/writing'),
  manuscript: (id: string) => request<Writing>(`api/studio/writing/${encodeURIComponent(id)}`),
  create: (manuscript?: Manuscript, sample = false) =>
    request<Writing>('api/studio/writing', {
      method: 'POST',
      body: JSON.stringify({ manuscript, sample }),
    }),
  save: (id: string, revision: number, manuscript: Manuscript) =>
    request<Writing>(`api/studio/writing/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ revision, manuscript }),
      keepalive:
        typeof document !== 'undefined' &&
        document.visibilityState === 'hidden' &&
        new TextEncoder().encode(JSON.stringify({ revision, manuscript })).length < 60_000,
    }),
  action: (
    id: string,
    revision: number,
    action: 'publish' | 'unpublish' | 'archive' | 'restore' | 'delete',
  ) =>
    request<Writing | { deleted: true }>(`api/studio/writing/${id}/${action}`, {
      method: 'POST',
      body: JSON.stringify({ revision }),
    }),
};
