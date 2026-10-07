// Generate application icons and the social preview using the actual site fonts.
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { siteName, siteDescription } from '../src/content/site.ts';

const icon = await readFile('public/favicon.svg');
for (const [file, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
])
  await sharp(icon, { density: 768 }).resize(size, size).png().toFile(`public/${file}`);

const fonts = Object.fromEntries(
  await Promise.all(
    ['manrope-latin', 'newsreader-italic-latin'].map(async (name) => [
      name,
      (await readFile(`public/fonts/${name}.woff2`)).toString('base64'),
    ]),
  ),
);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"/>
    <style>
      @font-face { font-family: Manrope; src: url(data:font/woff2;base64,${fonts['manrope-latin']}) }
      @font-face { font-family: Newsreader; font-style: italic; src: url(data:font/woff2;base64,${fonts['newsreader-italic-latin']}) }
      * { box-sizing: border-box }
      body { margin: 0; padding: 52px 64px; background: #f4f2eb; color: #292c27; font-family: Manrope, sans-serif }
      header, footer { display: flex; align-items: center; justify-content: space-between }
      .mark { font-size: 36px; font-weight: 650; letter-spacing: -3px }
      .mark span { display: inline-block; width: 5px; height: 5px; margin-left: 5px; background: #a65339 }
      .label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase }
      main { padding-top: 75px }
      h1 { margin: 0; font-size: 112px; line-height: 1.1; font-weight: 450; letter-spacing: -7px }
      p { margin: 24px 0 0 188px; font-family: Newsreader, serif; font-style: italic; font-size: 54px; line-height: 1.15; letter-spacing: -1px }
      footer { position: absolute; left: 64px; right: 64px; bottom: 48px; padding-top: 20px; border-top: 1px solid #d4d3c8 }
    </style></head><body>
    <header><div class="mark">qp<span></span></div><div class="label">An independent experiment</div></header>
    <main aria-label="${siteDescription}"><h1>${siteName}</h1><p>An experiment in<br/>editorial minimalism.</p></main>
    <footer class="label"><span>Built with T3 Code</span><span>Work · Writing · Studio</span></footer>
    </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await sharp(await page.screenshot())
    .png({ palette: true })
    .toFile('public/og.png');
  console.log('Generated quietplace icons and 1200 × 630 social preview.');
} finally {
  await browser.close();
}
