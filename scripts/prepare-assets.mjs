import { copyFile } from 'node:fs/promises';
for (const [source, target] of [
  ['manrope/files/manrope-latin-wght-normal.woff2', 'manrope-latin.woff2'],
  [
    'newsreader/files/newsreader-latin-400-italic.woff2',
    'newsreader-italic-latin.woff2',
  ],
  [
    'newsreader/files/newsreader-latin-400-normal.woff2',
    'newsreader-latin.woff2',
  ],
  ['manrope/LICENSE', 'manrope-LICENSE.txt'],
  ['newsreader/LICENSE', 'newsreader-LICENSE.txt'],
])
  await copyFile(
    `node_modules/${source.startsWith('manrope/') ? '@fontsource-variable' : '@fontsource'}/${source}`,
    `public/fonts/${target}`,
  );
