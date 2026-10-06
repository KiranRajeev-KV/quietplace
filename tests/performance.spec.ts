// Isolated Chromium lab measurements; no field-vitals or Lighthouse claims.
import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { sampleManuscript } from '../src/features/writing/studio/samples';
test('publication layout stability, route isolation and responsive typesetting', async ({
  context,
  request,
}, testInfo) => {
  test.setTimeout(60000);
  test.skip(
    !!process.env.TEST_URL,
    'Private specimens are measured locally; hosted QA uses actual publications.',
  );
  const origin = testInfo.project.use.baseURL;
  const api = request;
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await api.get(`${origin}/signin-with-chatgpt?return_to=/studio`);
  const headers = { 'X-Writing-Request': '1' };
  const records: string[] = [];
  let articleSlug = '';
  await mkdir('/tmp/quiet-writing-review', { recursive: true });
  try {
    for (const kind of ['note', 'weeknote', 'essay', 'technical'] as const) {
      const manuscript = sampleManuscript(kind);
      manuscript.title = `QA specimen — ${kind}`;
      manuscript.subtitle = 'Development typesetting audit. Temporary local content.';
      const response = await api.post(`${origin}/api/studio/writing`, {
        headers,
        data: { manuscript, sample: false },
      });
      if (!response.ok()) throw new Error('Cannot create audit specimen.');
      let record = await response.json();
      records.push(record.id);
      record = await (
        await api.post(`${origin}/api/studio/writing/${record.id}/publish`, {
          headers,
          data: { revision: record.revision },
        })
      ).json();
      if (kind === 'technical') articleSlug = record.slug;
    }
    for (const width of [1920, 1366, 768, 390, 320]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const network = await context.newCDPSession(page);
      await network.send('Network.setCacheDisabled', { cacheDisabled: true });
      await page.addInitScript(() => {
        (
          window as typeof window & {
            __readingMetrics: { cls: number; lcp: number; tbt: number };
          }
        ).__readingMetrics = { cls: 0, lcp: 0, tbt: 0 };
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            if (!(e as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput)
              (
                window as typeof window & {
                  __readingMetrics: { cls: number; lcp: number; tbt: number };
                }
              ).__readingMetrics.cls += (e as PerformanceEntry & { value: number }).value;
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            (
              window as typeof window & {
                __readingMetrics: { cls: number; lcp: number; tbt: number };
              }
            ).__readingMetrics.lcp = e.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            (
              window as typeof window & {
                __readingMetrics: { cls: number; lcp: number; tbt: number };
              }
            ).__readingMetrics.tbt += Math.max(0, e.duration - 50);
        }).observe({ type: 'longtask', buffered: true });
      });
      for (const route of ['/writing', `/writing/${articleSlug}`]) {
        const samples = { cls: 0, lcp: 0, tbt: 0 };
        await page.goto(`${origin}${route}`);
        await page.locator('html[data-ready=true]').waitFor();
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1500);
        Object.assign(
          samples,
          await page.evaluate(
            () =>
              (
                window as typeof window & {
                  __readingMetrics: { cls: number; lcp: number; tbt: number };
                }
              ).__readingMetrics,
          ),
        );
        const bundles = await page.evaluate(() =>
          performance
            .getEntriesByType('resource')
            .filter(
              (e) =>
                (e as PerformanceResourceTiming).initiatorType === 'script' ||
                e.name.endsWith('.js'),
            )
            .map((e) => ({
              name: new URL(e.name).pathname,
              size: (e as PerformanceResourceTiming).decodedBodySize,
            })),
        );
        console.log(
          JSON.stringify({
            width,
            route: route === '/writing' ? 'archive' : 'article',
            ...samples,
            jsBytes: bundles.reduce((sum, e) => sum + e.size, 0),
            scriptCount: bundles.length,
          }),
        );
        await page.screenshot({
          path: `/tmp/quiet-writing-review/${width}-${route === '/writing' ? 'archive' : 'article'}.png`,
          fullPage: route === '/writing',
        });
        expect(samples.cls).toBeLessThan(0.1);
        if (route !== '/writing') {
          await page.getByRole('button', { name: 'Copy code' }).first().click();
          await expect(page.getByRole('button', { name: 'Copy code' }).first()).toHaveText(
            'Copied ✓',
          );
        }
        if (route === '/writing')
          expect(bundles.some((b) => /highlight|studio\._id|article-view/.test(b.name))).toBe(
            false,
          );
      }
      await page.close();
    }
  } finally {
    for (const id of records) {
      const response = await api.get(`${origin}/api/studio/writing/${id}`);
      if (response.ok()) {
        const record = await response.json();
        await api.post(`${origin}/api/studio/writing/${id}/delete`, {
          headers,
          data: { revision: record.revision },
        });
      }
    }
  }
});
