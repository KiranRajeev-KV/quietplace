import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, Outlet, useRouter } from '@tanstack/react-router';
import { sessionQuery, writingKeys } from '../data/queries';
import { writingRepository } from '../data/repository';

export function StudioBoundary() {
  const { data: session } = useSuspenseQuery(sessionQuery());
  const client = useQueryClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const login = useMutation({
    mutationFn: writingRepository.signIn,
    onSuccess: async (nextSession) => {
      setPassword('');
      client.setQueryData(writingKeys.session, nextSession);
      await router.invalidate();
    },
  });
  const logout = useMutation({
    mutationFn: writingRepository.signOut,
    onSuccess: async () => {
      client.clear();
      await router.navigate({ to: '/studio' });
      await router.invalidate();
    },
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate(password);
  }
  if (!session.authorized)
    return (
      <section className="studio-entrance wrap">
        <Link to="/" className="studio-wordmark" aria-label="Betweenleaf, home">
          bl
          <span className="ink-dot" />
        </Link>
        <p className="micro">A PRIVATE WRITING DESK</p>
        <h1>
          A little room
          <br />
          <em>to think.</em>
        </h1>
        <p>Enter your Studio passphrase to return to your manuscripts.</p>
        <form className="studio-signin" onSubmit={submit}>
          <label htmlFor="studio-password" className="micro">
            STUDIO PASSPHRASE
          </label>
          <input
            id="studio-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={512}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={login.error ? 'studio-auth-error' : undefined}
          />
          <button className="text-link" disabled={login.isPending} type="submit">
            {login.isPending ? 'Opening the desk…' : 'Open the desk ↗'}
          </button>
          {login.error && (
            <p id="studio-auth-error" role="alert">
              {login.error.message}
            </p>
          )}
        </form>
        <Link to="/writing" className="micro">
          RETURN TO THE OPEN NOTEBOOK
        </Link>
      </section>
    );
  return (
    <>
      <header className="studio-header wrap">
        <Link to="/studio" className="studio-wordmark" aria-label="Writing desk">
          bl
          <span className="ink-dot" />
        </Link>
        <span className="micro">THE PRIVATE NOTEBOOK</span>
        <nav aria-label="Studio navigation">
          <Link to="/writing">Public writing ↗</Link>
          <button type="button" onClick={() => logout.mutate()} disabled={logout.isPending}>
            Sign out
          </button>
        </nav>
      </header>
      {logout.error && (
        <p className="wrap" role="alert">
          {logout.error.message}
        </p>
      )}
      <Outlet />
    </>
  );
}
