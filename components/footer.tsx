import Link from 'next/link';
import { profile } from '@/content/profile';
export function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="wrap">
        <div className="contact-eyebrow micro" data-reveal>
          03 / WHAT’S NEXT?
        </div>
        <div className="contact-content" data-reveal>
          <h2>
            Good things begin
            <br />
            with <em>a conversation.</em>
          </h2>
          <div className="contact-action">
            {profile.email ? (
              <a href={`mailto:${profile.email}`} className="contact-link">
                Say hello<span aria-hidden="true">↗</span>
              </a>
            ) : (
              <Link href="/colophon#connect" className="contact-link">
                Let’s connect<span aria-hidden="true">↗</span>
              </Link>
            )}
            <p>
              Thoughtful ideas. Interesting problems.
              <br />
              Something worth making.
            </p>
          </div>
        </div>
        <div className="footer-bottom micro">
          <Link href="/" className="footer-mark" aria-label="KR, home">
            kr
            <span className="ink-dot" />
          </Link>
          <span>
            BUILT WITH INTENTION.
            <br />© {new Date().getFullYear()} KR
          </span>
          <div className="footer-links">
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer">
                GITHUB ↗
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LINKEDIN ↗
              </a>
            )}
            {profile.resume && <a href={profile.resume}>RÉSUMÉ ↗</a>}
            <Link href="/colophon">COLOPHON ↗</Link>
            <a href="#top">BACK TO TOP ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
