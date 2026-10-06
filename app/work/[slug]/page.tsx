import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/content/projects';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProjectArt } from '@/components/project-art';
import { ThreadDemo } from '@/components/demos/thread-demo';
import { RelayDemo } from '@/components/demos/relay-demo';
import { FieldnotesDemo } from '@/components/demos/fieldnotes-demo';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: `${project.title} — KR`,
      description: project.description,
      images: [{ url: `/projects/${slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — KR`,
      description: project.description,
      images: [`/projects/${slug}.png`],
    },
  };
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <>
      <Header />
      <main id="main" className="case-study wrap">
        <div className="case-top">
          <Link href="/#work" className="text-link">
            ← All studies
          </Link>
          <span className="micro">
            {project.number} / INDEPENDENT CONCEPT / 2026
          </span>
        </div>
        <div className="case-hero">
          <span className="micro case-discipline" data-intro="0">
            {project.discipline}
          </span>
          <h1 data-intro="1">
            {project.title}
            <span className="ink-dot" />
          </h1>
          <p data-intro="2">{project.subtitle}</p>
          <div className="case-art" data-intro="3">
            <ProjectArt kind={project.slug} />
          </div>
        </div>
        <section
          className="case-overview"
          aria-labelledby="overview-title"
          data-reveal
        >
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
        <section
          className="demo-section"
          aria-labelledby="demo-title"
          data-reveal
        >
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
            <ThreadDemo />
          ) : slug === 'relay' ? (
            <RelayDemo />
          ) : (
            <FieldnotesDemo />
          )}
        </section>
        <section
          className="case-decisions"
          aria-labelledby="decisions-title"
          data-reveal
        >
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
        <Link href={`/work/${next.slug}`} className="next-project">
          <span className="micro">NEXT STUDY / {next.number}</span>
          <span>
            {next.title}
            <em aria-hidden="true">↗</em>
          </span>
        </Link>
      </main>
      <Footer />
    </>
  );
}
