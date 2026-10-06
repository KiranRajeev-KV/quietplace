import Link from 'next/link';
import { Header } from '@/components/header';
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="not-found wrap">
        <span className="micro">404 / A LITTLE OFF THE PATH</span>
        <h1>
          Nothing here.
          <br />
          <em>Room to return.</em>
        </h1>
        <p>This page may have moved, or never quite existed.</p>
        <Link href="/" className="text-link">
          Back to familiar ground<span aria-hidden="true">↗</span>
        </Link>
      </main>
    </>
  );
}
