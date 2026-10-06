import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { createPortfolioRouter } from './router';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './features/writing/data/queries';
import './styles/index.css';
// Keep the static title during lazy route loading; hand over only after React
// has committed its head tags, without a blank title or duplicate canonicals.
const staticHeadObserver = new MutationObserver(() => {
  if (!document.head.querySelector('title:not([data-static-head])')) return;
  document.querySelectorAll('[data-static-head]').forEach((tag) => tag.remove());
  staticHeadObserver.disconnect();
});
staticHeadObserver.observe(document.head, { childList: true, subtree: true });
document.documentElement.dataset.nativeTransitions = String('startViewTransition' in document);
const queryClient = createQueryClient();
const bootstrap = document.getElementById('writing-bootstrap');
if (bootstrap?.textContent) {
  try {
    const data = JSON.parse(bootstrap.textContent) as { key: string[]; data: unknown }[];
    for (const entry of data) queryClient.setQueryData(entry.key, entry.data);
  } catch {
    /* Remote queries recover an unavailable bootstrap. */
  }
  bootstrap.remove();
}
const router = createPortfolioRouter(queryClient);
const element = document.getElementById('root');
if (!element) throw new Error('Portfolio root is missing.');
await router.load();
createRoot(element).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
