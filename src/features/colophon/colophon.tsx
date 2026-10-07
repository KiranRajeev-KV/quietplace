import { Link } from '@tanstack/react-router';
import { profile } from '@/content/profile';
export function Colophon() {
  return (
    <>
      <div className="colophon wrap">
        <span className="micro section-index" data-intro="0">
          A NOTE ON QUIETPLACE
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
              quietplace began as an experiment in editorial minimalism and building with{' '}
              <a href="https://github.com/pingdotgg/t3code" target="_blank" rel="noreferrer">
                T3 Code
              </a>
              . A working space for example work and writing became a way to explore generous
              margins, a clear rhythm, and details that invite a closer look.
            </p>
          </section>
          <section>
            <h2>The work shown here</h2>
            <p>
              Thread, Relay, and Fieldnotes are independent interface studies, made for this
              experiment. Their case studies include working local prototypes. They are explorations
              of ideas, rather than accounts of client engagements.
            </p>
          </section>
          <section>
            <h2>The materials</h2>
            <p>
              Manrope by Mikhail Sharanda and Newsreader by Production Type. Both are self-hosted
              and licensed under the SIL Open Font License. The line field is drawn in Canvas;
              project compositions are made in HTML and CSS.
            </p>
            <p>
              Motion is deliberately light. The page keeps native scrolling, a familiar cursor, and
              a quiet appearance. Reduced-motion preferences are respected throughout.
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
                Direct contact details aren’t public on this site yet. In the meantime, the studies
                offer a little insight into the work and the thinking behind it.
              </p>
            )}
            <Link to="/projects" className="text-link">
              Explore the studies<span aria-hidden="true">↗</span>
            </Link>
          </section>
          <div className="colophon-end micro">
            LESS, BUT CONSIDERED.<span>QUIETPLACE — 2026</span>
          </div>
        </div>
      </div>
    </>
  );
}
