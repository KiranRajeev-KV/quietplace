import Link from 'next/link';
import { LocalTime } from './local-time';
export function Header() {
  return (
    <header className="site-header wrap">
      <Link href="/" className="wordmark" aria-label="KR, home">
        kr
        <span className="ink-dot" />
      </Link>
      <span className="header-edition micro">
        INDEPENDENT PRACTICE
        <br />
        ENGINEERING & DESIGN
      </span>
      <nav aria-label="Main navigation">
        <Link href="/#work" className="nav-link">
          Work<span>01</span>
        </Link>
        <Link href="/#about" className="nav-link">
          About<span>02</span>
        </Link>
        <Link href="/#contact" className="nav-link">
          Contact<span>03</span>
        </Link>
      </nav>
      <LocalTime />
    </header>
  );
}
