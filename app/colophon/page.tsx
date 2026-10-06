import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { profile } from '@/content/profile';
export const metadata: Metadata = {
  title: 'Colophon',
  alternates: { canonical: '/colophon' },
  description:
    'A note on the ideas, materials, and independent studies behind this portfolio.',
};
export default function Colophon() {
  return (
    <>
      <Header />
      <main id="main" className="colophon wrap">
        <span className="micro section-index" data-intro="0">
          A NOTE ON THIS PORTFOLIO
        </span>
        <h1 data-intro="1">
          Built with
          <br />
          <em>intention.</em>
        </h1>
        <div className="colophon-content">
          <section>
            <h2>A quiet practice</h2>
            <p>
              This is a small space for work at the intersection of software
              engineering, AI, and design. Its composition takes cues from
              editorial design: generous margins, a clear rhythm, and details
              that invite a closer look.
            </p>
          </section>
          <section>
            <h2>The work shown here</h2>
            <p>
              Thread, Relay, and Fieldnotes are independent interface studies,
              made for this portfolio. Their case studies include working local
              prototypes. They are explorations of ideas, rather than accounts
              of client engagements.
            </p>
          </section>
          <section>
            <h2>The materials</h2>
            <p>
              Manrope by Mikhail Sharanda and Newsreader by Production Type.
              Both are self-hosted and licensed under the SIL Open Font License.
              The line field is drawn in Canvas; project compositions are made
              in HTML and CSS.
            </p>
            <p>
              Motion is deliberately light. The page keeps native scrolling, a
              familiar cursor, and a quiet appearance. Reduced-motion
              preferences are respected throughout.
            </p>
          </section>
          <section id="connect">
            <h2>A conversation</h2>
            {profile.email ? (
              <p>
                <a className="text-link" href={`mailto:${profile.email}`}>
                  {profile.email}
                  <span aria-hidden="true">↗</span>
                </a>
              </p>
            ) : (
              <p>
                Direct contact details aren’t public on this site yet. In the
                meantime, the studies offer a little insight into the work and
                the thinking behind it.
              </p>
            )}
            <Link href="/#work" className="text-link">
              Explore the studies<span aria-hidden="true">↗</span>
            </Link>
          </section>
          <div className="colophon-end micro">
            LESS, BUT CONSIDERED.<span>KR — 2026</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
