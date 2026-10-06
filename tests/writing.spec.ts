import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { newManuscript, toManuscript, type Writing } from '../src/features/writing/domain/model';
import { sampleManuscript } from '../src/features/writing/studio/samples';
const headers = { 'X-Writing-Request': '1' };
let cleanup: string[] = [];
test.beforeEach(async ({ page }) => {
  await signIn(page.request);
});
async function signIn(api: APIRequestContext) {
  await api.get('/signin-with-chatgpt?return_to=/studio');
  expect((await api.get('/api/session')).status()).toBe(200);
  expect((await (await api.get('/api/session')).json()).authorized).toBe(true);
}
async function create(
  api: APIRequestContext,
  sample = false,
  kind: 'note' | 'weeknote' | 'essay' | 'technical' = 'note',
) {
  const manuscript = sample ? sampleManuscript(kind) : newManuscript(crypto.randomUUID());
  if (!sample) {
    manuscript.title = 'QA — A temporary publication';
    manuscript.slug = `qa-${crypto.randomUUID()}`;
    manuscript.content = [
      {
        type: 'p',
        children: [
          {
            text: 'Development verification only. This temporary test page is removed after the checks.',
          },
        ],
      },
    ];
  }
  const response = await api.post('/api/studio/writing', { headers, data: { manuscript, sample } });
  expect(response.status()).toBe(201);
  const piece = (await response.json()) as Writing;
  cleanup.push(piece.id);
  return piece;
}
async function saved(page: Page) {
  await expect(page.locator('.desk-save-state')).toHaveText('Saved', { timeout: 15_000 });
}
test.afterEach(async ({ request }) => {
  for (const id of cleanup) {
    const response = await request.get(`/api/studio/writing/${id}`);
    if (response.ok()) {
      const piece = (await response.json()) as Writing;
      await request.post(`/api/studio/writing/${id}/delete`, {
        headers,
        data: { revision: piece.revision },
      });
    }
  }
  cleanup = [];
});

test('Studio data rejects anonymous access and forged identity headers', async ({ request }) => {
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
  const source = await (await request.get('/studio')).text();
  expect(source).not.toContain('Specimen —');
});
test('owner sign-in works and cross-origin mutations are rejected', async ({ request }) => {
  await signIn(request);
  expect(
    (
      await request.post('/api/studio/writing', {
        headers: { Origin: 'https://another.example', ...headers },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect((await request.post('/api/studio/writing', { data: {} })).status()).toBe(403);
});
test('drafts, specimens, revisions, permanent slugs, and published editions have separate boundaries', async ({
  request,
}) => {
  await signIn(request);
  let piece = await create(request);
  expect((await request.get(`/api/writing/${piece.slug}`)).status()).toBe(404);
  expect((await request.get(`/writing/${piece.slug}`)).status()).toBe(404);
  const specimen = await create(request, true);
  expect(
    (
      await request.post(`/api/studio/writing/${specimen.id}/publish`, {
        headers,
        data: { revision: specimen.revision },
      })
    ).status(),
  ).toBe(422);
  let response = await request.post(`/api/studio/writing/${piece.id}/publish`, {
    headers,
    data: { revision: piece.revision },
  });
  expect(response.status()).toBe(200);
  piece = (await response.json()) as Writing;
  const live = await (await request.get(`/api/writing/${piece.slug}`)).json();
  expect(live.title).toBe(piece.title);
  response = await request.put(`/api/studio/writing/${piece.id}`, {
    headers,
    data: {
      revision: piece.revision,
      manuscript: { ...toManuscript(piece), title: 'A private revision' },
    },
  });
  expect(response.status()).toBe(200);
  piece = (await response.json()) as Writing;
  expect((await (await request.get(`/api/writing/${piece.slug}`)).json()).title).toBe(live.title);
  expect(
    (
      await request.put(`/api/studio/writing/${piece.id}`, {
        headers,
        data: { revision: piece.revision - 1, manuscript: toManuscript(piece) },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.put(`/api/studio/writing/${piece.id}`, {
        headers,
        data: {
          revision: piece.revision,
          manuscript: { ...toManuscript(piece), slug: 'a-new-address' },
        },
      })
    ).status(),
  ).toBe(409);
  response = await request.post(`/api/studio/writing/${piece.id}/publish`, {
    headers,
    data: { revision: piece.revision },
  });
  piece = (await response.json()) as Writing;
  expect((await (await request.get(`/api/writing/${piece.slug}`)).json()).title).toBe(
    'A private revision',
  );
  for (const action of ['unpublish', 'archive', 'restore'] as const) {
    response = await request.post(`/api/studio/writing/${piece.id}/${action}`, {
      headers,
      data: { revision: piece.revision },
    });
    expect(response.status()).toBe(200);
    piece = (await response.json()) as Writing;
    expect((await request.get(`/api/writing/${piece.slug}`)).status()).toBe(404);
  }
});
test('the schema rejects unsafe links, unknown blocks, oversized documents and foreign media', async ({
  request,
}) => {
  await signIn(request);
  const piece = await create(request),
    m = toManuscript(piece);
  for (const content of [
    [
      {
        type: 'p',
        children: [{ type: 'a', url: 'javascript:alert(1)', children: [{ text: 'bad' }] }],
      },
    ],
    [{ type: 'script', children: [{ text: 'bad' }] }],
    [{ type: 'p', children: [{ text: 'x'.repeat(100001) }] }],
  ])
    expect(
      (
        await request.put(`/api/studio/writing/${piece.id}`, {
          headers,
          data: { revision: piece.revision, manuscript: { ...m, content } },
        })
      ).status(),
    ).toBe(422);
  expect(
    (
      await request.put(`/api/studio/writing/${piece.id}`, {
        headers,
        data: {
          revision: piece.revision,
          manuscript: {
            ...m,
            content: [
              {
                type: 'img',
                mediaId: crypto.randomUUID(),
                width: 100,
                height: 100,
                alt: 'Foreign image',
                children: [{ text: '' }],
              },
            ],
          },
        },
      })
    ).status(),
  ).toBe(422);
});
test('public documents, metadata, RSS and sitemap contain only committed publications', async ({
  request,
}) => {
  await signIn(request);
  const piece = await create(request);
  await request.post(`/api/studio/writing/${piece.id}/publish`, {
    headers,
    data: { revision: piece.revision },
  });
  const response = await request.get(`/writing/${piece.slug}`),
    html = await response.text();
  expect(response.status()).toBe(200);
  expect(html).toContain('<article');
  expect(html).toContain('Development verification only.');
  expect(html.match(/application\/ld\+json/g)).toHaveLength(1);
  expect(html).toContain('og:type" content="article');
  expect(html).not.toContain('PRIVATE DEVELOPMENT SPECIMEN');
  const feed = await request.get('/writing/feed.xml');
  expect(feed.headers()['content-type']).toContain('application/rss+xml');
  expect(await feed.text()).toContain(piece.slug);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain(piece.slug);
  expect(sitemap).not.toContain('/studio');
  const draft = await create(request, true);
  expect(await (await request.get('/writing/feed.xml')).text()).not.toContain(draft.title);
});
test('create, type, autosave, reload, preview, publish, edit, unpublish, archive, restore and delete', async ({
  page,
  request,
}) => {
  await signIn(request);
  await page.goto('/studio/new');
  await page.getByRole('button', { name: 'Open a fresh page ↗' }).click();
  await expect(page.getByLabel('Title', { exact: true })).toBeVisible();
  const id = new URL(page.url()).pathname.split('/').at(-1)!;
  cleanup.push(id);
  await page.getByText('Page details', { exact: true }).click();
  await page.getByLabel('Slug', { exact: true }).fill(`qa-${id}`);
  await page.getByText('Page details', { exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('QA — The quiet publishing instrument');
  await page
    .getByRole('textbox', { name: 'Manuscript body' })
    .pressSequentially(
      'This is a development verification page. It will be removed after the checks.',
    );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue(
    'QA — The quiet publishing instrument',
  );
  await expect(page.getByRole('textbox', { name: 'Manuscript body' })).toContainText(
    'development verification',
  );
  await page.getByRole('button', { name: 'Preview ↗' }).click();
  await expect(page.locator('.publication h1')).toHaveText('QA — The quiet publishing instrument');
  await page.getByRole('link', { name: '← Return to writing', exact: true }).click();
  await saved(page);
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.locator('.desk-page-end')).toContainText('PUBLISHED');
  await page.getByRole('link', { name: 'Read published edition ↗' }).click();
  await expect(page.locator('.publication h1')).toBeVisible();
  await page.reload();
  await expect(page.locator('.publication h1')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.goBack();
  await saved(page);
  await page.getByLabel('Title', { exact: true }).fill('QA — Revised privately');
  await saved(page);
  const piece = (await (await request.get(`/api/studio/writing/${id}`)).json()) as Writing;
  expect((await (await request.get(`/api/writing/${piece.slug}`)).json()).title).toBe(
    'QA — The quiet publishing instrument',
  );
  await page.getByRole('button', { name: 'Publish changes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Publish changes' })).toBeEnabled();
  await page.getByRole('button', { name: 'Unpublish', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Unpublish', exact: true }).click();
  await expect(page.locator('.desk-page-end')).toContainText('DRAFT');
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await page.getByRole('button', { name: 'Move to archive' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Thoughts,');
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await page.getByRole('link', { name: /QA — Revised privately/ }).click();
  await page.getByRole('button', { name: 'Restore manuscript ↗' }).click();
  await expect(page.locator('.desk-page-end')).toContainText('DRAFT');
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Thoughts,');
  expect((await request.get(`/api/studio/writing/${id}`)).status()).toBe(404);
});
test('Plate input rules, shortcuts, paste, undo/redo, code and lists use structured content', async ({
  page,
  request,
  context,
}) => {
  await signIn(request);
  const piece = await create(request);
  const empty = await request.put(`/api/studio/writing/${piece.id}`, {
    headers,
    data: {
      revision: piece.revision,
      manuscript: { ...toManuscript(piece), content: [{ type: 'p', children: [{ text: '' }] }] },
    },
  });
  expect(empty.status()).toBe(200);
  await page.goto(`/studio/${piece.id}`);
  await saved(page);
  const body = page.getByRole('textbox', { name: 'Manuscript body' });
  await body.click();
  await body.pressSequentially('## A section ');
  await expect(body.locator('h2')).toHaveText('A section');
  await page.keyboard.press('Enter');
  await body.pressSequentially('**care** and `code`');
  await expect(body.locator('strong')).toHaveText('care');
  await expect(body.locator('code')).toHaveText('code');
  await page.keyboard.press('Enter');
  await body.pressSequentially('- a list item');
  await expect(body.locator('li')).toContainText('a list item');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await body.pressSequentially('undo me');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(body).toContainText('undo me');
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.press('Enter');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate(() =>
    navigator.clipboard.writeText('### Pasted heading\n\nA **bold** paragraph.'),
  );
  await page.keyboard.press('ControlOrMeta+V');
  await expect(body.locator('h3')).toContainText('Pasted heading');
  await saved(page);
  const stored = (await (await request.get(`/api/studio/writing/${piece.id}`)).json()) as Writing;
  expect(stored.content.some((n) => n.type === 'h2')).toBe(true);
  expect(JSON.stringify(stored.content)).toContain('"bold":true');
  expect(JSON.stringify(stored.content)).toContain('listStyleType');
});
test('image upload, alt text, captions and media access follow publication status', async ({
  page,
  request,
  playwright,
}) => {
  await signIn(request);
  let piece = await create(request);
  await page.goto(`/studio/${piece.id}`);
  await page.getByText('Insert ＋', { exact: true }).click();
  await page.getByRole('button', { name: 'Insert image' }).click();
  await page.getByLabel('Choose image').setInputFiles('public/projects/fieldnotes.png');
  await page
    .getByLabel('Alt text', { exact: true })
    .fill('An editorial interface study with carefully spaced typography.');
  await page.getByRole('button', { name: 'Place image ↗' }).click();
  await expect(page.locator('.editor-image img')).toBeVisible({ timeout: 20_000 });
  await page
    .getByLabel('Image caption')
    .fill('An original portfolio study, used for development verification.');
  await saved(page);
  piece = (await (await request.get(`/api/studio/writing/${piece.id}`)).json()) as Writing;
  const image = piece.content.find((n) => n.type === 'img')!;
  expect(image.width).toBeLessThanOrEqual(2400);
  expect(JSON.stringify(image.caption)).toContain('original portfolio');
  const anonymous = await playwright.request.newContext({ baseURL: 'http://localhost:4173' });
  try {
    expect((await anonymous.get(`/media/${String(image.mediaId)}`)).status()).toBe(404);
    const live = await request.post(`/api/studio/writing/${piece.id}/publish`, {
      headers,
      data: { revision: piece.revision },
    });
    expect(live.status()).toBe(200);
    piece = (await live.json()) as Writing;
    expect((await anonymous.get(`/media/${String(image.mediaId)}`)).status()).toBe(200);
    await page.goto(`/writing/${piece.slug}`);
    await expect(page.locator('.manuscript-image figcaption')).toContainText('original portfolio');
    await request.post(`/api/studio/writing/${piece.id}/unpublish`, {
      headers,
      data: { revision: piece.revision },
    });
    expect((await anonymous.get(`/media/${String(image.mediaId)}`)).status()).toBe(404);
  } finally {
    await anonymous.dispose();
  }
});
test('autosave survives network failure, blocks navigation and recovers after reload', async ({
  page,
  request,
}) => {
  await signIn(request);
  const piece = await create(request);
  await page.goto(`/studio/${piece.id}`);
  await saved(page);
  await page.route('**/api/studio/writing/*', (route) =>
    route.request().method() === 'PUT' ? route.abort('internetdisconnected') : route.continue(),
  );
  await page
    .getByLabel('Title', { exact: true })
    .fill('QA — Preserved through a connection failure');
  await expect(page.locator('.desk-save-state')).toHaveText('Saved on this device');
  await page.getByRole('link', { name: '← Notebook', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep writing', exact: true }).click();
  page.on('dialog', (dialog) => void dialog.accept());
  await page.reload();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue(
    'QA — Preserved through a connection failure',
  );
  await expect(page.locator('.desk-recovered')).toBeVisible();
  await page.unroute('**/api/studio/writing/*');
  await saved(page);
  expect((await (await request.get(`/api/studio/writing/${piece.id}`)).json()).title).toBe(
    'QA — Preserved through a connection failure',
  );
});
test('two revisions cannot silently overwrite each other', async ({ page, request }) => {
  await signIn(request);
  const piece = await create(request);
  await page.goto(`/studio/${piece.id}`);
  await saved(page);
  await request.put(`/api/studio/writing/${piece.id}`, {
    headers,
    data: {
      revision: piece.revision,
      manuscript: { ...toManuscript(piece), title: 'QA — A different saved revision' },
    },
  });
  await page.getByLabel('Title', { exact: true }).fill('QA — Local changes stay safe');
  await expect(page.locator('.desk-save-state')).toHaveText('Revision conflict');
  expect((await (await request.get(`/api/studio/writing/${piece.id}`)).json()).title).toBe(
    'QA — A different saved revision',
  );
  await page.getByRole('button', { name: 'Replace saved version with this copy' }).click();
  await saved(page);
  expect((await (await request.get(`/api/studio/writing/${piece.id}`)).json()).title).toBe(
    'QA — Local changes stay safe',
  );
});
for (const size of [
  { name: 'large desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow mobile', width: 320, height: 640 },
]) {
  test(`reading, Studio, code, keyboard and reduced motion: ${size.name}`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize(size);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await signIn(request);
    const piece = await create(request, true, 'technical');
    await page.goto(`/studio/${piece.id}`);
    await saved(page);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.locator('.editor-code')).toHaveCount(3);
    await page.getByRole('button', { name: 'Preview ↗' }).click();
    await expect(page.locator('.publication h1')).toContainText('Specimen');
    await expect(page.locator('.publication-contents')).toBeVisible();
    await expect(page.locator('.hljs-keyword').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
    await page
      .getByRole('link', { name: 'A revision, rather than a timestamp', exact: true })
      .click();
    await expect(page.locator('#section-a-revision-rather-than-a-timestamp')).toBeInViewport();
    await page.getByRole('button', { name: 'Copy code' }).first().focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    expect(await page.locator(':focus').evaluate((e) => getComputedStyle(e).outlineStyle)).toBe(
      'solid',
    );
    await page.getByRole('link', { name: '← Return to writing', exact: true }).click();
    await saved(page);
    await page.reload();
    await saved(page);
    await page.goBack();
    expect(errors).toEqual([]);
  });
}
test('short notes remain simple and editor dialogs keep keyboard focus', async ({
  page,
  request,
}) => {
  await signIn(request);
  const piece = await create(request, true, 'note');
  await page.goto(`/studio/${piece.id}`);
  await saved(page);
  await page.getByRole('button', { name: 'Preview ↗' }).click();
  await expect(page.locator('.publication-contents')).toHaveCount(0);
  await page.getByRole('link', { name: '← Return to writing', exact: true }).click();
  await page.getByText('Insert ＋', { exact: true }).click();
  await page.getByRole('button', { name: 'Insert image' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
});
test('uploads reject raw or excessive media instead of storing it blindly', async ({ request }) => {
  await signIn(request);
  const piece = await create(request);
  const png = await readFile('public/projects/fieldnotes.png');
  expect(
    (
      await request.post(`/api/studio/writing/${piece.id}/media`, {
        headers,
        multipart: { alt: 'Image', file: { name: 'raw.png', mimeType: 'image/png', buffer: png } },
      })
    ).status(),
  ).toBe(422);
});

test('keyboard formatting, deliberate internal links and fenced code use Plate instruments', async ({
  page,
  request,
}) => {
  await signIn(request);
  const piece = await create(request);
  const response = await request.put(`/api/studio/writing/${piece.id}`, {
    headers,
    data: {
      revision: piece.revision,
      manuscript: { ...toManuscript(piece), content: [{ type: 'p', children: [{ text: '' }] }] },
    },
  });
  expect(response.status()).toBe(200);
  await page.goto(`/studio/${piece.id}`);
  await saved(page);
  const body = page.getByRole('textbox', { name: 'Manuscript body' });
  await body.pressSequentially('A connection');
  await page.keyboard.press('Shift+Home');
  await expect(page.getByRole('toolbar', { name: 'Text formatting' })).toBeVisible();
  await page.keyboard.press('ControlOrMeta+b');
  await expect(body.locator('strong')).toHaveText('A connection');
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.getByRole('dialog', { name: 'A connection' })).toBeVisible();
  await page.getByLabel('LINK ADDRESS').fill('/writing');
  await page.getByRole('button', { name: 'Connect ↗' }).click();
  await expect(body.locator('a[href="/writing"]')).toHaveText('A connection');
  await saved(page);
  await body.press('ControlOrMeta+End');
  await expect(page.getByRole('toolbar', { name: 'Text formatting' })).toHaveCount(0);
  await page.keyboard.press('Enter');
  await expect(body.locator('p')).toHaveCount(2);
  await expect(body.locator('p').last()).toHaveText('');
  await body.locator('p').last().click();
  await body.pressSequentially('```');
  await expect(body.locator('.editor-code')).toHaveCount(1);
  await page.getByLabel('Code language').selectOption('typescript');
  await page.getByLabel('Code filename').fill('connection.ts');
  await body.locator('.editor-code-line').click();
  await page.keyboard.type('const connection = true;');
  await saved(page);
  await page.getByRole('button', { name: 'Preview ↗' }).click();
  await expect(page.locator('.manuscript-code figcaption')).toContainText('connection.ts');
  await expect(page.locator('.manuscript-code .hljs-keyword')).toContainText(['const']);
  await page.getByRole('link', { name: 'A connection', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Thinking,');
});
test('Studio, preview and publication transitions capture one coherent route shell', async ({
  page,
  request,
}) => {
  await signIn(request);
  const piece = await create(request);
  await page.addInitScript(() => {
    const audits: { ready: string; before: string[]; after: string[] }[] = [];
    (window as typeof window & { transitionAudits: typeof audits }).transitionAudits = audits;
    const native = document.startViewTransition.bind(document);
    const names = () =>
      Array.from(document.querySelectorAll('*'))
        // React can retain a hidden Suspense tree. Native snapshots only
        // include elements that participate in the rendered layout.
        .filter((element) => element.getClientRects().length > 0)
        .map((element) => getComputedStyle(element).viewTransitionName)
        .filter((name) => name && name !== 'none');
    document.startViewTransition = (options) => {
      const audit = { ready: 'pending', before: names(), after: [] as string[] };
      audits.push(audit);
      const transition = native(options);
      void transition.ready.then(
        () => {
          audit.ready = 'ready';
          // Capture completes after the framework's update callback resolves.
          // Inspect the presented frame, rather than an intermediate commit.
          audit.after = names();
        },
        (error: Error) => {
          audit.ready = error.message;
        },
      );
      return transition;
    };
  });
  await page.goto(`/studio/${piece.id}`);
  await saved(page);
  await page.getByRole('button', { name: 'Preview ↗', exact: true }).click();
  await expect(page.locator('.publication h1')).toHaveText(piece.title);
  await page.getByRole('button', { name: 'Publish this edition ↗', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/writing/${piece.slug}$`));
  await expect(page.locator('.site-header')).toBeVisible();
  await page.getByRole('link', { name: '← All writing', exact: true }).click();
  await expect(page.locator('.writing-intro')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.publication h1')).toHaveText(piece.title);
  await page.goBack();
  await expect(page.getByText('PRIVATE PREVIEW', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: '← Return to writing', exact: true }).click();
  await saved(page);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const audits = (window as typeof window & { transitionAudits: { ready: string }[] })
          .transitionAudits;
        return audits.length >= 6 && audits.every((audit) => audit.ready !== 'pending');
      }),
    )
    .toBe(true);
  const audits = await page.evaluate(
    () =>
      (
        window as typeof window & {
          transitionAudits: { ready: string; before: string[]; after: string[] }[];
        }
      ).transitionAudits,
  );
  expect(audits).toEqual(audits.map((audit) => ({ ...audit, ready: 'ready' })));
  for (const audit of audits) {
    expect(new Set(audit.before).size).toBe(audit.before.length);
    expect(new Set(audit.after).size).toBe(audit.after.length);
  }
});
