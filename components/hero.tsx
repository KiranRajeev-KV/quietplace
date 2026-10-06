import { LineField } from './line-field';
export function Hero() {
  return (
    <section className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-eyebrow micro" data-intro="0">
        <span className="little-rule" />
        DEVELOPER & AI ENGINEER
      </div>
      <h1 id="hero-title">
        <span className="title-line">
          <span data-intro="1">Making complex</span>
        </span>
        <span className="title-line title-second">
          <span data-intro="2">
            feel <em>simple.</em>
          </span>
        </span>
      </h1>
      <div className="hero-copy" data-intro="3">
        <p>
          I build thoughtful interfaces
          <br />
          and intelligent systems.
          <br />
          <span>With clarity, care, and a little curiosity.</span>
        </p>
        <a href="#work" className="text-link">
          Explore selected work<span aria-hidden="true">↘</span>
        </a>
      </div>
      <div className="hero-art" data-intro="4">
        <LineField />
        <span className="art-caption micro">
          FIG. 01 — ORDER, WITHIN POSSIBILITY
        </span>
      </div>
      <div className="hero-bottom micro">
        <span>A PRACTICE IN THOUGHTFUL TECHNOLOGY</span>
        <a href="#work" className="scroll-link">
          SCROLL TO EXPLORE<span aria-hidden="true">↓</span>
        </a>
        <span>PORTFOLIO — 2026</span>
      </div>
    </section>
  );
}
