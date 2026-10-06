import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { transitionTypes } from './lib/motion';
export function createPortfolioRouter() {
  const router = createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    trailingSlash: 'never',
    defaultPreload: 'intent',
    defaultPreloadDelay: 90,
    scrollRestoration: true,
    scrollRestorationBehavior: 'auto',
    defaultViewTransition: { types: transitionTypes },
    defaultPendingMs: 180,
    defaultPendingMinMs: 180,
  });
  router.subscribe('onBeforeNavigate', ({ fromLocation, toLocation }) => {
    if (fromLocation && fromLocation.pathname !== toLocation.pathname)
      document.documentElement.dataset.initial = 'false';
  });
  return router;
}
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createPortfolioRouter>;
  }
}
