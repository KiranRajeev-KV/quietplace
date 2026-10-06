import { copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const fontRoots = {
  manrope: dirname(fileURLToPath(import.meta.resolve('@fontsource-variable/manrope/package.json'))),
  newsreader: dirname(fileURLToPath(import.meta.resolve('@fontsource/newsreader/package.json'))),
};
for (const [source, target] of [
  ['manrope/files/manrope-latin-wght-normal.woff2', 'manrope-latin.woff2'],
  ['newsreader/files/newsreader-latin-400-italic.woff2', 'newsreader-italic-latin.woff2'],
  ['newsreader/files/newsreader-latin-400-normal.woff2', 'newsreader-latin.woff2'],
  ['manrope/LICENSE', 'manrope-LICENSE.txt'],
  ['newsreader/LICENSE', 'newsreader-LICENSE.txt'],
])
  await copyFile(
    join(fontRoots[source.split('/')[0]], source.slice(source.indexOf('/') + 1)),
    `public/fonts/${target}`,
  );
