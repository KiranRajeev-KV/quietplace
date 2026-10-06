import { createRootRoute, HeadContent, Outlet, Link, useRouterState } from '@tanstack/react-router';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { NotFound } from '@/components/not-found';
import { RouteEffects } from '@/components/route-effects';
import { Pending } from '@/components/pending';
import { RouteError } from '@/components/route-error';
import { headFor } from '@/lib/metadata';
export const Route = createRootRoute({
  head: () => ({ meta: headFor('/404').meta }),
  component: RootLayout,
  notFoundComponent: NotFound,
  pendingComponent: Pending,
  errorComponent: RouteError,
});
function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
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
      <Header />
      <div className="route-stage" key={pathname}>
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <Footer />
      </div>
      <RouteEffects />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {pathname === '/' ? 'Home' : pathname.split('/').filter(Boolean).join(' — ')} page
      </div>
    </>
  );
}
