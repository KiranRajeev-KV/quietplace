import { createRouter, createMemoryHistory } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { transitionTypes } from './lib/motion';
import { createQueryClient } from './features/writing/data/queries';
export function createPortfolioRouter(
  queryClient = createQueryClient(),
  history?: ReturnType<typeof createMemoryHistory>,
) {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history,
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
    if (
      typeof document !== 'undefined' &&
      fromLocation &&
      fromLocation.pathname !== toLocation.pathname
    )
      document.documentElement.dataset.initial = 'false';
  });
  return router;
}
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createPortfolioRouter>;
  }
}
