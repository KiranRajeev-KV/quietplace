import { Link } from '@tanstack/react-router';
export function NotFound() {
  return (
    <>
      <div className="not-found wrap">
        <span className="micro">404 / A LITTLE OFF THE PATH</span>
        <h1>
          Nothing here.
          <br />
          <em>Room to return.</em>
        </h1>
        <p>This page may have moved, or never quite existed.</p>
        <Link to="/" className="text-link">
          Back to familiar ground<span aria-hidden="true">↗</span>
        </Link>
      </div>
    </>
  );
}
