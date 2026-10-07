// Capture the real local interface. Private specimens are removed afterwards.
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { signIn } from '../tests/auth-helper.ts';

const origin = 'http://localhost:3000';
const output = 'docs/images';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  baseURL: origin,
  viewport: { width: 1440, height: 1050 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
let specimen;

async function capture(name) {
  await page.locator('html[data-ready=true]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const image = await page.screenshot({ animations: 'disabled' });
  await sharp(image).webp({ quality: 94, effort: 6 }).toFile(`${output}/${name}.webp`);
}

async function removeSpecimen() {
  if (!specimen?.id) return;
  const current = await context.request.get(`/api/studio/writing/${specimen.id}`);
  if (!current.ok()) throw new Error('Cannot load screenshot specimen for cleanup.');
  const { revision } = await current.json();
  const deleted = await context.request.post(`/api/studio/writing/${specimen.id}/delete`, {
    headers: { 'X-Writing-Request': '1' },
    data: { revision },
  });
  if (!deleted.ok()) throw new Error('Cannot remove screenshot specimen.');
  console.log('Removed the private screenshot specimen. Nothing was published.');
}

try {
  await mkdir(output, { recursive: true });
  await page.goto('/');
  await capture('home');
  await signIn(context.request);
  await page.goto('/studio');
  await page.getByText('Private typesetting specimens', { exact: true }).click();
  const created = page.waitForResponse(
    (response) =>
      response.url() === `${origin}/api/studio/writing` && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'A technical typesetting study' }).click();
  specimen = await (await created).json();
  await page.waitForURL(`**/studio/${specimen.id}`);
  // Deleted addresses stay reserved; repeated captures need a unique slug.
  await page.getByText('Page details', { exact: true }).click();
  await page.getByLabel('Slug', { exact: true }).fill(`readme-${specimen.id}`);
  await expect(page.locator('.desk-save-state')).toHaveText('Saved', { timeout: 15_000 });
  await page.getByText('Page details', { exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Specimen — A dependable desk');
  await expect(page.locator('.desk-save-state')).toHaveText('Saved', { timeout: 15_000 });
  await page
    .getByLabel('Subtitle', { exact: true })
    .fill('Private development writing for exploring the editor and reading typography.');
  await page.getByText('PRIVATE DEVELOPMENT SPECIMEN / PUBLISHING DISABLED').click();
  await expect(page.locator('.desk-save-state')).toHaveText('Saved', { timeout: 15_000 });
  await capture('studio');
  await page.getByRole('button', { name: 'Preview ↗', exact: true }).click();
  await page.waitForURL(`**/studio/${specimen.id}/preview`);
  await page.locator('.publication-body').waitFor();
  await capture('reading');
  await page.setViewportSize({ width: 1440, height: 1280 });
  await page
    .getByRole('heading', { name: 'A conditional update', exact: true })
    .evaluate((heading) => {
      window.scrollTo({
        top: window.scrollY + heading.getBoundingClientRect().top - 96,
        behavior: 'instant',
      });
    });
  await capture('technical-writing');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await capture('mobile');
  console.log('Captured homepage, private Studio, article preview, code, and mobile homepage.');
} finally {
  try {
    await removeSpecimen();
  } finally {
    await browser.close();
  }
}
