import type { D1Database, R2Bucket, RateLimit } from '@cloudflare/workers-types';
export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  SITE_URL?: string;
  BASE_PATH?: string;
  STUDIO_PASSWORD?: string;
  AUTH_LIMITER: RateLimit;
}
