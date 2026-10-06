import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
});
async function settle(page: import('@playwright/test').Page) {
  await expect
    .poll(() =>
      page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length),
    )
    .toBe(0);
}
const sizes = [
  { name: 'large desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow mobile', width: 320, height: 640 },
];
for (const size of sizes) {
  test(`home composition and accessibility: ${size.name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Making complexfeel simple.');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    const title = page.locator('.title-line').first();
    expect(
      await title.evaluate((e) => e.clientHeight < parseFloat(getComputedStyle(e).fontSize) * 1.5),
    ).toBeTruthy();
    expect(await title.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBeTruthy();
    await page.getByRole('link', { name: 'Explore selected work' }).click();
    await expect(page.locator('#work')).toBeInViewport();
    await page.getByRole('link', { name: 'BACK TO TOP' }).click();
    await settle(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
}

test('keyboard navigation has a working skip link and visible focus', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeInViewport();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Explore selected work' })).toBeFocused();
  expect(await page.locator(':focus').evaluate((e) => getComputedStyle(e).outlineStyle)).toBe(
    'solid',
  );
});

test('reduced motion keeps all content visible and native scrolling immediate', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    'auto',
  );
  expect(
    await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running').length,
    ),
  ).toBe(0);
  await page.getByRole('link', { name: 'Explore selected work' }).click();
  await expect(page.locator('#work')).toBeInViewport();
});

test('Thread retrieves sources and handles unsupported questions honestly', async ({ page }) => {
  await page.goto('/projects/thread');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'What makes a system trustworthy?' }).click();
  await expect(page.getByRole('status')).toContainText(
    'A trustworthy system makes its limits visible.',
  );
  await page.getByText('Trust is something a system earns').click();
  await expect(page.locator('blockquote')).toBeVisible();
  await page
    .getByLabel('Ask the knowledge collection a question')
    .fill('What is the weather on Mars?');
  await page.getByRole('button', { name: 'Search knowledge collection' }).click();
  await expect(page.getByRole('status')).toContainText('doesn’t have enough information');
});

test('Relay supports pause, resume, completion, and reset', async ({ page }) => {
  await page.goto('/projects/relay');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.clock.install();
  await page.getByRole('button', { name: 'Run workflow' }).click();
  await page.clock.runFor(2100);
  await expect(page.locator('.is-complete')).toHaveCount(1);
  await page.getByRole('button', { name: 'Pause workflow' }).click();
  await page.clock.runFor(5000);
  await expect(page.locator('.is-complete')).toHaveCount(1);
  await page.getByRole('button', { name: 'Resume workflow' }).click();
  await page.clock.runFor(2100);
  await page.clock.runFor(2100);
  await expect(page.getByRole('status')).toHaveText('ALL THREE STAGES COMPLETE');
  await page.getByRole('button', { name: 'Start again' }).click();
  await expect(page.locator('.is-complete')).toHaveCount(0);
});

test('Fieldnotes reading preferences work and persist', async ({ page }) => {
  await page.goto('/projects/fieldnotes');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Larger reading text' }).click();
  await expect(page.getByRole('button', { name: 'Larger reading text' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Ink', exact: true }).click();
  await expect(page.locator('.live-reader')).toHaveClass(/reader-ink/);
  await page.reload();
  await expect(page.locator('.live-reader')).toHaveClass(/reader-ink/);
  await settle(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});

for (const path of [
  '/projects/thread',
  '/projects/relay',
  '/projects/fieldnotes',
  '/colophon',
  '/projects',
  '/about',
]) {
  test(`detail route at narrow width: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('main h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    await settle(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
}

test('internal destinations, assets, metadata, and deliberate 404 are valid', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const hrefs = await page
    .locator('a[href]')
    .evaluateAll((links) => [
      ...new Set(links.map((e) => e.getAttribute('href')!).filter((h) => h.startsWith('/'))),
    ]);
  for (const href of hrefs)
    expect((await request.get(href.split('#')[0] || '/')).status()).toBe(200);
  for (const path of [
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/og.png',
    '/robots.txt',
    '/sitemap.xml',
    '/projects/thread.png',
    '/projects/relay.png',
    '/projects/fieldnotes.png',
  ])
    expect((await request.get(path)).status()).toBe(200);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og.png$/);
  expect(errors).toEqual([]);
  const response = await page.goto('/a-page-that-does-not-exist');
  expect([200, 404]).toContain(response?.status());
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Nothing here.');
});
