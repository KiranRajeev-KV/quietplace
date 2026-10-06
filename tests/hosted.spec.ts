import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.skip(!process.env.TEST_URL, 'Live dispatch checks use the deployed Site.');
test('live Writing documents, feeds and draft exclusions work through Sites dispatch', async ({
  page,
  request,
}) => {
  const session = await (await request.get('/api/session')).json();
  expect(session.authorized).toBe(false);
  expect((await request.get('/api/studio/writing')).status()).toBe(401);
  expect(
    (
      await request.get('/api/studio/writing', {
        headers: {
          'oai-authenticated-user-id': 'forged',
          'oai-authenticated-user-email': 'seedy@sites.test',
        },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post('/api/studio/writing', { headers: { 'X-Writing-Request': '1' }, data: {} })
    ).status(),
  ).toBe(401);
  const pieces = await (await request.get('/api/writing')).json();
  expect(
    pieces.every(
      (p: { title: string }) => !p.title.startsWith('QA') && !p.title.startsWith('Specimen'),
    ),
  ).toBe(true);
  const writing = await request.get('/writing');
  expect(writing.status()).toBe(200);
  expect(await writing.text()).toContain('AN OPEN NOTEBOOK');
  const missing = await request.get('/writing/qa-unpublished-address');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('noindex');
  expect((await request.get('/writing/feed.xml')).headers()['content-type']).toContain(
    'application/rss+xml',
  );
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/studio');
  expect(sitemap).toContain('/writing</loc>');
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /studio');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Writing 02', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Thinking,');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto('/writing');
  await page.setViewportSize({ width: 320, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  expect(errors).toEqual([]);
});
