import { Link } from '@tanstack/react-router';
export function RouteError() {
  return (
    <div className="not-found wrap">
      <span className="micro">A MOMENT TO REGROUP</span>
      <h1>
        A small interruption.
        <br />
        <em>Try again.</em>
      </h1>
      <p>The page could not load. Refresh to get the latest version.</p>
      <div className="flex flex-wrap gap-8">
        <button className="text-link" type="button" onClick={() => window.location.reload()}>
          Refresh this page
        </button>
        <Link to="/" className="text-link">
          Return home
        </Link>
      </div>
    </div>
  );
}
