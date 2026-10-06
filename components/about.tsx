import Link from 'next/link';
export function About() {
  return (
    <section
      id="about"
      className="about-section wrap"
      aria-labelledby="about-title"
    >
      <div className="section-index micro" data-reveal>
        02 / A LITTLE ABOUT ME
      </div>
      <div className="about-main" data-reveal>
        <h2 id="about-title">
          An engineer’s mind.
          <br />
          <em>A maker’s sensibility.</em>
        </h2>
        <div className="about-copy">
          <p>
            I’m KR. I’m interested in the space between what technology can do
            and how it feels to use.
          </p>
          <p>
            My practice brings together software engineering, AI, and interface
            design. I like useful systems, honest interfaces, and details that
            quietly make things better.
          </p>
          <Link href="/colophon" className="text-link">
            A note on this portfolio<span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="capabilities" data-reveal>
        <span className="micro">THINGS I THINK ABOUT</span>
        <ul>
          <li>
            <span>01</span>Intelligent systems
            <small>AI · retrieval · agent workflows</small>
          </li>
          <li>
            <span>02</span>Thoughtful interfaces
            <small>Interaction · typography · accessibility</small>
          </li>
          <li>
            <span>03</span>Reliable foundations
            <small>TypeScript · architecture · performance</small>
          </li>
        </ul>
      </div>
      <div className="about-footnote micro">
        <span>CLARITY IS A FORM OF CARE.</span>
        <span>ALWAYS LEARNING. ALWAYS MAKING.</span>
      </div>
    </section>
  );
}
