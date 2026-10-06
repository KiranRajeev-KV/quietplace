// Export the actual HTML/CSS compositions as each study's social image.
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 1100 },
    reducedMotion: 'reduce',
  });
  await mkdir('public/projects', { recursive: true });
  for (const slug of ['thread', 'relay', 'fieldnotes']) {
    await page.goto(
      `${process.env.TEST_URL ?? 'http://localhost:3000'}/work/${slug}`,
    );
    await page.evaluate(() => document.fonts.ready);
    const buffer = await page.locator('.case-art .project-art').screenshot();
    await sharp(buffer)
      .resize(1200, 630, {
        fit: 'contain',
        background: {
          thread: '#dfe3d9',
          relay: '#2f352e',
          fieldnotes: '#e2dbce',
        }[slug],
      })
      .png({ palette: true, quality: 90 })
      .toFile(`public/projects/${slug}.png`);
  }
} finally {
  await browser.close();
}
