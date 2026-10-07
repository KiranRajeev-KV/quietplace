import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Hono } from 'hono';
import { generateSignedCookie } from 'hono/cookie';
import { authorSession, authRoutes } from '../src/server/auth';
import type { Env } from '../src/server/env';
import { localPassword } from './auth-helper';

const password = 'test-only-random-passphrase-for-cookie-verification';
type AuthEnv = Pick<Env, 'STUDIO_PASSWORD' | 'AUTH_LIMITER'>;
const env: AuthEnv = {
  STUDIO_PASSWORD: password,
  AUTH_LIMITER: { limit: async () => ({ success: true }) },
};
const app = new Hono<{ Bindings: AuthEnv }>();
app.route('/api/auth', authRoutes);
app.get('/api/session', async (c) => c.json(await authorSession(c)));
const headers = { 'X-Writing-Request': '1', 'Content-Type': 'application/json' };

async function session(token: string, secret = password) {
  const cookie = await generateSignedCookie(
    '__Host-quietplace-session',
    token,
    `quietplace:studio:${password}`,
    { secure: true, path: '/', httpOnly: true },
  );
  const response = await app.request(
    'https://example.com/api/session',
    {
      headers: { Cookie: cookie.split(';')[0] ?? '' },
    },
    { ...env, STUDIO_PASSWORD: secret },
  );
  return response.json();
}

test('signed sessions enforce expiry, signature, passphrase rotation and deployment configuration', async () => {
  const valid = `${Date.now() + 60_000}.${crypto.randomUUID()}`;
  expect((await session(valid)).authorized).toBe(true);
  expect((await session(`${Date.now() - 1_000}.${crypto.randomUUID()}`)).authorized).toBe(false);
  expect((await session(valid, `${password}-rotated`)).authorized).toBe(false);
  expect((await session(valid, '')).authorized).toBe(false);
  expect((await session(valid, 'short')).authorized).toBe(false);
  expect((await session(valid, localPassword)).authorized).toBe(false);
  const forged = await app.request(
    'https://example.com/api/session',
    {
      headers: {
        Cookie: `__Host-quietplace-session=${valid}.forged`,
        'oai-authenticated-user-id': 'forged',
        'oai-authenticated-user-email': 'forged@example.com',
      },
    },
    env,
  );
  expect((await forged.json()).authorized).toBe(false);
});

test('login fails closed, rejects cross-origin requests and rate-limits attempts', async () => {
  const options = { method: 'POST', headers, body: JSON.stringify({ password }) };
  expect(
    (
      await app.request(
        'https://example.com/api/auth/login',
        {
          ...options,
          body: '{',
        },
        env,
      )
    ).status,
  ).toBe(400);
  expect(
    (
      await app.request(
        'https://example.com/api/auth/login',
        {
          ...options,
          body: JSON.stringify({ password: 'x'.repeat(3000) }),
        },
        env,
      )
    ).status,
  ).toBe(413);
  expect(
    (
      await app.request('https://example.com/api/auth/login', options, {
        ...env,
        STUDIO_PASSWORD: '',
      })
    ).status,
  ).toBe(503);
  expect((await app.request('http://example.com/api/auth/login', options, env)).status).toBe(503);
  expect(
    (
      await app.request(
        'https://example.com/api/auth/login',
        { ...options, headers: { ...headers, Origin: 'https://other.example' } },
        env,
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await app.request(
        'https://example.com/api/auth/login',
        { ...options, headers: { 'Content-Type': 'application/json' } },
        env,
      )
    ).status,
  ).toBe(403);
  const limited = await app.request('https://example.com/api/auth/login', options, {
    ...env,
    AUTH_LIMITER: { limit: async () => ({ success: false }) },
  });
  expect(limited.status).toBe(429);
  expect(limited.headers.get('retry-after')).toBe('60');
  const wrong = await app.request(
    'https://example.com/api/auth/login',
    {
      ...options,
      body: JSON.stringify({ password: 'wrong' }),
    },
    env,
  );
  expect(wrong.status).toBe(401);
  const signedIn = await app.request('https://example.com/api/auth/login', options, env);
  expect(signedIn.status).toBe(200);
  const cookie = signedIn.headers.get('set-cookie') ?? '';
  for (const attribute of [
    '__Host-quietplace-session',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=604800',
  ])
    expect(cookie).toContain(attribute);
  expect(cookie).not.toContain(password);
});

test('the actual Studio form signs in, persists across reload, and signs out', async ({
  page,
  request,
}) => {
  await page.goto('/studio');
  await page.getByLabel('STUDIO PASSPHRASE').fill('incorrect');
  await page.getByRole('button', { name: 'Open the desk ↗', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('That passphrase');
  await page.getByLabel('STUDIO PASSPHRASE').fill(localPassword ?? '');
  await page.getByRole('button', { name: 'Open the desk ↗', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByLabel('STUDIO PASSPHRASE')).toBeVisible();
  expect((await page.request.get('/api/studio/writing')).status()).toBe(401);
  expect((await request.get('/api/studio/writing')).status()).toBe(401);
});

test('Studio sign-in remains accessible and usable at narrow and wide sizes', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1920, 1366, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.goto('/studio');
    await expect(page.getByLabel('STUDIO PASSPHRASE')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const violations = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(violations.violations.map((v) => v.id)).toEqual([]);
    await page.getByLabel('STUDIO PASSPHRASE').focus();
    await expect(page.getByLabel('STUDIO PASSPHRASE')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Open the desk ↗', exact: true })).toBeFocused();
    if (width === 1920 || width === 320)
      await page.screenshot({
        path: testInfo.outputPath(`studio-signin-${width}.png`),
        fullPage: true,
      });
  }
});
