import { Link } from '@tanstack/react-router';
import { projects } from '@/content/projects';
import { ProjectArt } from './project-art';
export function SelectedWork({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? 'h1' : 'h2';
  const ProjectHeading = standalone ? 'h2' : 'h3';
  return (
    <section id="work" className="selected-work wrap" aria-labelledby="work-title">
      <div className="section-header" data-reveal>
        <span className="section-index micro">01 / SELECTED WORK</span>
        <Heading id="work-title">
          A few things,
          <br />
          <em>considered.</em>
        </Heading>
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
            id={project.slug}
            className={`project project-${project.slug}`}
            data-reveal
          >
            <Link to="/projects/$slug" params={{ slug: project.slug }} className="project-link">
              <div className="project-image" style={{ viewTransitionName: `art-${project.slug}` }}>
                <ProjectArt kind={project.slug} />
                <span className="view-project">
                  Explore study <span aria-hidden="true">↗</span>
                </span>
              </div>
              <div className="project-meta">
                <div className="project-heading">
                  <span className="micro project-number">{project.number}</span>
                  <ProjectHeading style={{ viewTransitionName: `title-${project.slug}` }}>
                    {project.title}
                  </ProjectHeading>
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
