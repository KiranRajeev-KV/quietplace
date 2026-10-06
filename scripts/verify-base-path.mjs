import { build, preview } from 'vite';
import { chromium } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const directory = await mkdtemp(join(tmpdir(), 'quiet-systems-base-'));
const previous = process.env.VITE_BASE_PATH;
process.env.VITE_BASE_PATH = '/portfolio/';
let server;
let browser;
try {
  await build({ build: { outDir: directory, emptyOutDir: true }, logLevel: 'silent' });
  server = await preview({
    build: { outDir: directory },
    preview: { host: '127.0.0.1', port: 4174, strictPort: true },
    logLevel: 'silent',
  });
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const origin = 'http://127.0.0.1:4174';
  for (const path of ['', 'projects', 'projects/thread', 'about', 'colophon']) {
    assert.equal((await page.goto(`${origin}/portfolio/${path}`)).status(), 200);
    await page.locator('main h1').waitFor();
    assert.ok(await page.locator('main h1').isVisible());
    await page.reload();
    await page.locator('main h1').waitFor();
  }
  await page.goto(`${origin}/portfolio/`);
  await page.getByRole('link', { name: 'Work 01', exact: true }).click();
  assert.equal(new URL(page.url()).pathname, '/portfolio/projects');
  await page.locator('.project-thread .project-link').click();
  assert.equal(new URL(page.url()).pathname, '/portfolio/projects/thread');
  await page.goBack();
  assert.equal(new URL(page.url()).pathname, '/portfolio/projects');
  const hrefs = await page
    .locator('a')
    .evaluateAll((elements) =>
      elements
        .map((element) => element.getAttribute('href'))
        .filter((href) => href?.startsWith('/')),
    );
  assert.ok(hrefs.every((href) => href.startsWith('/portfolio/')));
  const resources = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((resource) => resource.name),
  );
  assert.ok(resources.some((url) => url.includes('/portfolio/fonts/manrope-latin.woff2')));
  assert.deepEqual(errors, []);
  console.log(
    'Base path /portfolio/: direct loads, refresh, internal links, history, and fonts pass.',
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => (server ? server.httpServer.close(resolve) : resolve()));
  await rm(directory, { recursive: true, force: true });
  if (previous === undefined) delete process.env.VITE_BASE_PATH;
  else process.env.VITE_BASE_PATH = previous;
}
