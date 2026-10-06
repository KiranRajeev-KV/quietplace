import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { sessionQuery } from '../data/queries';
export function StudioBoundary() {
  const { data: session } = useSuspenseQuery(sessionQuery()),
    path = useRouterState({ select: (s) => s.location.href });
  if (!session.authorized)
    return (
      <section className="studio-entrance wrap">
        <Link to="/" className="studio-wordmark" aria-label="KR, home">
          kr
          <span className="ink-dot" />
        </Link>
        <p className="micro">A PRIVATE WRITING DESK</p>
        <h1>
          A little room
          <br />
          <em>to think.</em>
        </h1>
        <p>
          {session.authenticated
            ? 'This notebook belongs to another author.'
            : 'Sign in to return to your manuscripts.'}
        </p>
        <a
          className="text-link"
          href={`${import.meta.env.BASE_URL}signin-with-chatgpt?return_to=${encodeURIComponent(path)}`}
        >
          {session.authenticated ? 'Switch ChatGPT account ↗' : 'Continue with ChatGPT ↗'}
        </a>
        <Link to="/writing" className="micro">
          RETURN TO THE OPEN NOTEBOOK
        </Link>
      </section>
    );
  return (
    <>
      <header className="studio-header wrap">
        <Link to="/studio" className="studio-wordmark" aria-label="Writing desk">
          kr
          <span className="ink-dot" />
        </Link>
        <span className="micro">THE PRIVATE NOTEBOOK</span>
        <nav aria-label="Studio navigation">
          <Link to="/writing">Public writing ↗</Link>
          <a
            href={`${import.meta.env.BASE_URL}signout-with-chatgpt?return_to=${encodeURIComponent(`${import.meta.env.BASE_URL}writing`)}`}
          >
            Sign out
          </a>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
