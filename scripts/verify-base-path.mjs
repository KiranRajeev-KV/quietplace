import { createBuilder, preview } from 'vite';
import { chromium } from '@playwright/test';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const directory = await mkdtemp(join(tmpdir(), 'quiet-systems-base-'));
const previous = process.env.VITE_BASE_PATH;
const deployConfig = '.wrangler/deploy/config.json';
const originalDeployConfig = await readFile(deployConfig);
process.env.VITE_BASE_PATH = '/portfolio/';
let server;
let browser;
let manuscriptId;
let api;
try {
  const builder = await createBuilder({
    build: { outDir: directory, emptyOutDir: true },
    logLevel: 'silent',
  });
  await builder.buildApp();
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
  api = page.request;
  for (const path of [
    '',
    'projects',
    'projects/thread',
    'about',
    'colophon',
    'writing',
    'studio',
  ]) {
    console.log(`Checking /portfolio/${path}`);
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
  await api.get(`${origin}/signin-with-chatgpt?return_to=/portfolio/studio`);
  const headers = { 'X-Writing-Request': '1' };
  const slug = `base-${crypto.randomUUID()}`;
  const created = await api.post(`${origin}/portfolio/api/studio/writing`, {
    headers,
    data: {
      manuscript: {
        title: 'QA — Base path publication',
        slug,
        subtitle: '',
        description: 'Temporary local verification.',
        kind: 'note',
        topics: [],
        content: [
          {
            type: 'p',
            children: [{ text: 'Development verification of nested publication routes.' }],
          },
        ],
        coverId: null,
        seoTitle: '',
        seoDescription: '',
      },
    },
  });
  assert.equal(created.status(), 201);
  const manuscript = await created.json();
  manuscriptId = manuscript.id;
  assert.equal(
    (
      await api.post(`${origin}/portfolio/api/studio/writing/${manuscriptId}/publish`, {
        headers,
        data: { revision: manuscript.revision },
      })
    ).status(),
    200,
  );
  await page.goto(`${origin}/portfolio/writing/${slug}`);
  await page.locator('.publication h1').waitFor();
  await page.reload();
  await page.locator('html[data-ready=true]').waitFor();
  assert.ok(
    (await page.locator('link[rel=canonical]').getAttribute('href')).endsWith(
      `/portfolio/writing/${slug}`,
    ),
  );
  assert.ok(
    (await (await api.get(`${origin}/portfolio/writing/feed.xml`)).text()).includes(
      `/portfolio/writing/${slug}`,
    ),
  );
  await page.getByRole('link', { name: '← All writing', exact: true }).click();
  assert.equal(new URL(page.url()).pathname, '/portfolio/writing');
  await page.goBack();
  await page.locator('.publication h1').waitFor();
  assert.deepEqual(errors, []);
  console.log(
    'Base path /portfolio/: direct loads, refresh, internal links, history, and fonts pass.',
  );
} finally {
  if (manuscriptId && api) {
    const record = await (
      await api.get(`http://127.0.0.1:4174/portfolio/api/studio/writing/${manuscriptId}`)
    ).json();
    await api.post(`http://127.0.0.1:4174/portfolio/api/studio/writing/${manuscriptId}/delete`, {
      headers: { 'X-Writing-Request': '1' },
      data: { revision: record.revision },
    });
  }
  await browser?.close();
  await server?.close();
  await writeFile(deployConfig, originalDeployConfig);
  await rm(directory, { recursive: true, force: true });
  if (previous === undefined) delete process.env.VITE_BASE_PATH;
  else process.env.VITE_BASE_PATH = previous;
}
