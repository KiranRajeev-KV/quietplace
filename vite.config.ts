import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { defineConfig, loadEnv } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env.VITE_BASE_PATH || '/';
  if (!base.startsWith('/') || !base.endsWith('/'))
    throw new Error('VITE_BASE_PATH must start and end with a slash.');
  return {
    base,
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      cloudflare({
        viteEnvironment: { name: 'server' },
        config: (config) => ({ vars: { ...config.vars, BASE_PATH: base } }),
        persistState: { path: '.wrangler/state' },
      }),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
      dedupe: ['react', 'react-dom'],
    },
    server: { host: '0.0.0.0', port: 3000, strictPort: true },
    preview: { host: '0.0.0.0', port: 4173, strictPort: true },
    build: { target: 'es2022', cssCodeSplit: true, sourcemap: false },
  };
});
