import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { createPortfolioRouter } from './router';
import './styles/index.css';
// Static documents supply crawler metadata; Router owns it after startup.
document.querySelectorAll('[data-static-head]').forEach((tag) => tag.remove());
document.documentElement.dataset.nativeTransitions = String('startViewTransition' in document);
const router = createPortfolioRouter();
const element = document.getElementById('root');
if (!element) throw new Error('Portfolio root is missing.');
createRoot(element).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
