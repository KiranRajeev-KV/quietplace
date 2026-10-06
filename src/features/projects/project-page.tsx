import { lazy, Suspense } from 'react';
import { Link } from '@tanstack/react-router';
import { projects, type Project } from '@/content/projects';
import { ProjectArt } from './project-art';
import { DemoPending } from './demo-pending';
const ThreadDemo = lazy(() =>
  import('@/features/demos/thread-demo').then((m) => ({ default: m.ThreadDemo })),
);
const RelayDemo = lazy(() =>
  import('@/features/demos/relay-demo').then((m) => ({ default: m.RelayDemo })),
);
const FieldnotesDemo = lazy(() =>
  import('@/features/demos/fieldnotes-demo').then((m) => ({ default: m.FieldnotesDemo })),
);
export function ProjectPage({ project }: { project: Project }) {
  const slug = project.slug;
  const next = projects[(projects.indexOf(project) + 1) % projects.length] ?? project;
  return (
    <>
      <div className="case-study wrap">
        <div className="case-top">
          <Link to="/projects" hash={project.slug} className="text-link">
            ← All studies
          </Link>
          <span className="micro">{project.number} / INDEPENDENT CONCEPT / 2026</span>
        </div>
        <div className="case-hero">
          <span className="micro case-discipline" data-intro="0">
            {project.discipline}
          </span>
          <h1 data-intro="1" style={{ viewTransitionName: `title-${project.slug}` }}>
            {project.title}
            <span className="ink-dot" />
          </h1>
          <p data-intro="2">{project.subtitle}</p>
          <div
            className="case-art"
            data-intro="3"
            style={{ viewTransitionName: `art-${project.slug}` }}
          >
            <ProjectArt kind={project.slug} />
          </div>
        </div>
        <section className="case-overview" aria-labelledby="overview-title" data-reveal>
          <span className="section-index micro">01 / THE IDEA</span>
          <div>
            <h2 id="overview-title">{project.description}</h2>
            <div className="case-columns">
              <div>
                <h3>The question</h3>
                <p>{project.problem}</p>
              </div>
              <div>
                <h3>The approach</h3>
                <p>{project.approach}</p>
              </div>
            </div>
          </div>
        </section>
        <section className="demo-section" aria-labelledby="demo-title" data-reveal>
          <div className="demo-header">
            <span className="section-index micro">02 / IN PRACTICE</span>
            <div>
              <h2 id="demo-title">
                A small, working <em>exploration.</em>
              </h2>
              <p>
                {slug === 'relay'
                  ? 'A local workflow simulation. No external agent is running.'
                  : slug === 'thread'
                    ? 'A local knowledge collection. No question leaves your browser.'
                    : 'A reader you can make your own. Your settings stay on this device.'}
              </p>
            </div>
          </div>
          {slug === 'thread' ? (
            <Suspense fallback={<DemoPending />}>
              <ThreadDemo />
            </Suspense>
          ) : slug === 'relay' ? (
            <Suspense fallback={<DemoPending />}>
              <RelayDemo />
            </Suspense>
          ) : (
            <Suspense fallback={<DemoPending />}>
              <FieldnotesDemo />
            </Suspense>
          )}
        </section>
        <section className="case-decisions" aria-labelledby="decisions-title" data-reveal>
          <span className="section-index micro">03 / THE DETAILS</span>
          <div>
            <h2 id="decisions-title">
              Decisions that <em>matter.</em>
            </h2>
            {project.decisions.map((decision, i) => (
              <div className="decision" key={decision.title}>
                <span className="micro">0{i + 1}</span>
                <div>
                  <h3>{decision.title}</h3>
                  <p>{decision.text}</p>
                </div>
              </div>
            ))}
            <div className="outcome">
              <h3>What it demonstrates</h3>
              <p>{project.outcome}</p>
            </div>
          </div>
        </section>
        <Link to="/projects/$slug" params={{ slug: next.slug }} className="next-project">
          <span className="micro">NEXT STUDY / {next.number}</span>
          <span>
            <span style={{ viewTransitionName: `title-${next.slug}` }}>{next.title}</span>
            <em aria-hidden="true">↗</em>
          </span>
        </Link>
      </div>
    </>
  );
}
