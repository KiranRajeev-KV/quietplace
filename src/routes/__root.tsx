import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Link,
  useRouterState,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { NotFound } from '@/components/not-found';
import { RouteEffects } from '@/components/route-effects';
import { Pending } from '@/components/pending';
import { RouteError } from '@/components/route-error';
import { headFor } from '@/lib/metadata';
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: headFor('/404').meta.filter(
      (meta) =>
        'title' in meta || ('name' in meta && ['description', 'robots'].includes(meta.name ?? '')),
    ),
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
  pendingComponent: Pending,
  errorComponent: RouteError,
});
function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const studio = pathname.includes('/studio');
  return (
    <>
      <HeadContent />
      <Link
        to="."
        hash="main"
        resetScroll={false}
        viewTransition={false}
        className="skip-link"
        onClick={() => document.getElementById('main')?.focus({ preventScroll: true })}
      >
        Skip to content
      </Link>
      {!studio && <Header />}
      <div className="route-stage" key={pathname}>
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        {!studio && <Footer />}
      </div>
      <RouteEffects />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {pathname === '/' ? 'Home' : pathname.split('/').filter(Boolean).join(' — ')} page
      </div>
    </>
  );
}
