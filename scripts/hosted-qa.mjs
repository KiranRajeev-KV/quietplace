// Private-site QA reuses the owner's existing access token in memory only.
import { spawn } from 'node:child_process';
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
console.log('Ready for hosted QA JSON on stdin (input is hidden).');
const input = await new Promise((resolve) => {
  let data = '';
  process.stdin.on('data', (chunk) => {
    data += chunk;
    if (!data.includes('\n')) return;
    process.stdin.pause();
    resolve(JSON.parse(data.trim()));
  });
});
const { url, token } = input;
if (!url || !token) throw new Error('Provide the existing Site URL and owner access token.');
const args = [
  'exec',
  'playwright',
  'test',
  ...(input.files ?? ['tests/portfolio.spec.ts', 'tests/routing.spec.ts', 'tests/hosted.spec.ts']),
  '--reporter=list',
];
const child = spawn('pnpm', args, {
  env: { ...process.env, TEST_URL: url, SITES_TEST_AUTH: token },
  stdio: ['ignore', 'pipe', 'pipe'],
});
for (const stream of [child.stdout, child.stderr])
  stream.on('data', (data) =>
    process.stdout.write(data.toString().replaceAll(token, '[redacted]')),
  );
const code = await new Promise((resolve) => child.on('close', resolve));
process.exit(code ?? 1);
