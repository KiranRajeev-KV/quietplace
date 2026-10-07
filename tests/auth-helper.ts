import { readFileSync } from 'node:fs';
import { expect, type APIRequestContext } from '@playwright/test';

export const localPassword = readFileSync('.dev.vars', 'utf8')
  .split('\n')
  .find((line) => line.startsWith('STUDIO_PASSWORD='))
  ?.slice('STUDIO_PASSWORD='.length)
  .replace(/^(['"])(.*)\1$/, '$2');
export async function signIn(api: APIRequestContext, prefix = '') {
  if (!localPassword) throw new Error('Copy .dev.vars.example to .dev.vars before testing.');
  const response = await api.post(`${prefix}/api/auth/login`, {
    headers: { 'X-Writing-Request': '1' },
    data: { password: localPassword },
  });
  expect(response.status()).toBe(200);
  expect((await (await api.get(`${prefix}/api/session`)).json()).authorized).toBe(true);
}
