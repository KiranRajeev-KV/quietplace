import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { createPortfolioRouter } from './router';
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
const router = createPortfolioRouter();
const element = document.getElementById('root');
if (!element) throw new Error('Portfolio root is missing.');
createRoot(element).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
