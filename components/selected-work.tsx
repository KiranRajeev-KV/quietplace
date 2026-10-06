import Link from 'next/link';
import { projects } from '@/content/projects';
import { ProjectArt } from './project-art';
export function SelectedWork() {
  return (
    <section
      id="work"
      className="selected-work wrap"
      aria-labelledby="work-title"
    >
      <div className="section-header" data-reveal>
        <span className="section-index micro">01 / SELECTED WORK</span>
        <h2 id="work-title">
          A few things,
          <br />
          <em>considered.</em>
        </h2>
        <p>
          Small explorations at the intersection
          <br />
          of engineering, intelligence, and design.
        </p>
        <span className="section-count micro">2026 — 3 STUDIES</span>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <article
            key={project.slug}
            className={`project project-${project.slug}`}
            data-reveal
          >
            <Link href={`/work/${project.slug}`} className="project-link">
              <div className="project-image">
                <ProjectArt kind={project.slug} />
                <span className="view-project">
                  Explore study <span aria-hidden="true">↗</span>
                </span>
              </div>
              <div className="project-meta">
                <div className="project-heading">
                  <span className="micro project-number">{project.number}</span>
                  <h3>{project.title}</h3>
                  <span className="project-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <p>{project.subtitle}</p>
                <div className="project-category micro">
                  <span>{project.discipline}</span>
                  <span>INDEPENDENT CONCEPT / 2026</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
