import { test, expect } from '@playwright/test';
const routes = [
  { path: '/', heading: 'Making complex feel simple.' },
  { path: '/projects', heading: 'A few things, considered.' },
  { path: '/about', heading: 'An engineer’s mind. A maker’s sensibility.' },
  { path: '/projects/thread', heading: 'Thread' },
  { path: '/projects/relay', heading: 'Relay' },
  { path: '/projects/fieldnotes', heading: 'Fieldnotes' },
  { path: '/colophon', heading: 'Built with intention.' },
];
for (const route of routes) {
  test(`direct load and refresh: ${route.path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.dataset.blankTitle = String(!document.title.trim());
        const observer = new MutationObserver(() => {
          if (!document.title.trim()) document.documentElement.dataset.blankTitle = 'true';
        });
        observer.observe(document.head, { childList: true, subtree: true, characterData: true });
      });
    });
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    await expect
      .poll(async () => (await page.locator('main h1').innerText()).replace(/\s+/g, ''))
      .toBe(route.heading.replace(/\s+/g, ''));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-blank-title', 'false');
    expect(errors).toEqual([]);
  });
}
test('internal navigation stays in one document and browser history restores scroll', async ({
  page,
}) => {
  await page.goto('/projects');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const navigationStart = await page.evaluate(() => performance.timeOrigin);
  await page.locator('.project-relay').scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  await page.locator('.project-relay .project-link').click();
  await expect(page).toHaveURL(/\/projects\/relay$/);
  await expect(page.locator('main h1')).toHaveText('Relay');
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(navigationStart);
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before - 80);
  await page.goForward();
  await expect(page).toHaveURL(/\/projects\/relay$/);
  await expect(page.locator('main h1')).toHaveText('Relay');
  await page.getByRole('link', { name: 'All studies' }).click();
  await expect(page).toHaveURL(/\/projects#relay$/);
  await expect(page.locator('#relay')).toBeInViewport();
});
test('navigation, project switching, hash links, and legacy URLs work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Work 01', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.locator('.project-thread .project-link').click();
  await expect(page).toHaveURL(/\/projects\/thread$/);
  await page.locator('.next-project').click();
  await expect(page).toHaveURL(/\/projects\/relay$/);
  await page.getByRole('link', { name: 'BACK TO TOP' }).click();
  await expect(page).toHaveURL(/\/projects\/relay#top$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(50);
  await page.getByRole('link', { name: 'About 03', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await page.getByRole('link', { name: 'Contact 04', exact: true }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport();
  await page.goto('/work/thread');
  await expect(page).toHaveURL(/\/projects\/thread$/);
  await page.goto('/work');
  await expect(page).toHaveURL(/\/projects$/);
});
test('native transitions run, finish, and disappear under reduced motion', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => {
    const original = document.startViewTransition.bind(document);
    let count = 0;
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: (...args: Parameters<typeof document.startViewTransition>) => {
        count++;
        document.documentElement.dataset.transitionCount = String(count);
        return original(...args);
      },
    });
  });
  await page.locator('.project-thread .project-link').click();
  await expect(page).toHaveURL(/\/projects\/thread$/);
  await expect(page.locator('html')).toHaveAttribute('data-transition-count', '1');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((animation) => animation.playState === 'running').length,
      ),
    )
    .toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('link', { name: 'About 03' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('html')).toHaveAttribute('data-transition-count', '1');
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
});
test('background navigation and skipped native snapshots preserve navigation without errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () =>
        document.documentElement.dataset.testBackground === 'true' ? 'hidden' : 'visible',
    });
    const native = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
      const transition = native(...args);
      document.documentElement.dataset.testTransitionCount = String(
        Number(document.documentElement.dataset.testTransitionCount ?? 0) + 1,
      );
      // A tab can become hidden after the Router's visibility check. Exercise
      // the resulting native rejection rather than a fake successful promise.
      if (document.documentElement.dataset.testSkipSnapshot === 'true') transition.skipTransition();
      return transition;
    };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => {
    document.documentElement.dataset.testTransitionCount = '0';
    document.documentElement.dataset.testBackground = 'true';
  });
  await page.getByRole('link', { name: 'Work 01', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('main h1')).toContainText('A few things,');
  await expect(page.locator('html')).toHaveAttribute('data-test-transition-count', '0');
  await page.evaluate(() => {
    document.documentElement.dataset.testBackground = 'false';
    document.documentElement.dataset.testSkipSnapshot = 'true';
  });
  await page.getByRole('link', { name: 'About 03', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('main h1')).toContainText('An engineer’s mind.');
  await expect(page.locator('html')).toHaveAttribute('data-test-transition-count', '1');
  expect(errors).toEqual([]);
});
test('every internal href resolves and raw route documents have correct social metadata', async ({
  page,
  request,
}) => {
  for (const route of routes) {
    const response = await request.get(route.path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toMatch(/<meta[^>]+property="og:image"/);
    expect(html).toMatch(/<link[^>]+rel="canonical"/);
    await page.goto(route.path);
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    const links = await page
      .locator('a')
      .evaluateAll((elements) =>
        elements
          .map((element) => element.getAttribute('href'))
          .filter((href): href is string => !!href && href.startsWith('/')),
      );
    for (const href of new Set(links))
      expect((await request.get(href.split('#')[0] || '/')).status()).toBe(200);
    expect(await page.locator('title').count()).toBe(1);
    expect(await page.locator('link[rel="canonical"]').count()).toBe(1);
  }
});
