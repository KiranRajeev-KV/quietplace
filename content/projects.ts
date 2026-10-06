export type Project = {
  slug: 'thread' | 'relay' | 'fieldnotes';
  number: string;
  title: string;
  subtitle: string;
  discipline: string;
  description: string;
  problem: string;
  approach: string;
  outcome: string;
  decisions: { title: string; text: string }[];
};
// Original interface studies built for this portfolio. Not client claims.
export const projects: Project[] = [
  {
    slug: 'thread',
    number: '01',
    title: 'Thread',
    subtitle: 'From scattered knowledge to clear answers.',
    discipline: 'AI / PRODUCT ENGINEERING',
    description:
      'An exploration of a more considered knowledge interface. Ask a question, follow its sources, and keep the context.',
    problem:
      'Search gives us documents. What we often need is a useful answer—and a way to understand where it came from.',
    approach:
      'A focused retrieval interface that makes source attribution part of the answer. The local prototype searches a curated knowledge collection and keeps evidence visible.',
    outcome:
      'A functioning, browser-local retrieval study with topic selection, source excerpts, and honest handling of questions outside the collection. No external AI service or invented model output.',
    decisions: [
      {
        title: 'Evidence before confidence',
        text: 'Every supported answer includes the source passage. Unknown questions get a clear boundary instead of a convincing guess.',
      },
      {
        title: 'Keep the surface quiet',
        text: 'One question, one answer, and a short source list. The content has space to do the work.',
      },
      {
        title: 'A replaceable retrieval layer',
        text: 'The local dataset and matching logic are isolated from the interface so a retrieval API can be connected later.',
      },
    ],
  },
  {
    slug: 'relay',
    number: '02',
    title: 'Relay',
    subtitle: 'Making the invisible work visible.',
    discipline: 'AGENTS / INTERACTION DESIGN',
    description:
      'A small orchestration study. An agent workflow you can follow, inspect, pause, and understand.',
    problem:
      'An agent can do useful work while leaving a person waiting with little understanding of what is happening.',
    approach:
      'Model a workflow as explicit, inspectable states. A local simulation walks through research, synthesis, and review, with pause and restart controls.',
    outcome:
      'A working workflow simulator demonstrating transparent status, sequential transitions, and user control. The simulated process is clearly labeled.',
    decisions: [
      {
        title: 'Explicit state',
        text: 'Pending, active, and complete states have text labels as well as visual treatments. Progress is never communicated by color alone.',
      },
      {
        title: 'Control without clutter',
        text: 'Pause, resume, and restart the sequence with a clear control area.',
      },
      {
        title: 'A visible audit trail',
        text: 'Each completed stage exposes a short result. The output tells a coherent story as the system works.',
      },
    ],
  },
  {
    slug: 'fieldnotes',
    number: '03',
    title: 'Fieldnotes',
    subtitle: 'A little more room to think.',
    discipline: 'WEB / EDITORIAL DESIGN',
    description:
      'A reading space built around rhythm, typography, and the simple pleasure of a well-set page.',
    problem:
      'Reading on the web often means negotiating distractions before reaching the words.',
    approach:
      'An editorial reader with adjustable reading size and a paper or ink appearance. Preferences stay on your device.',
    outcome:
      'A responsive reading prototype with working appearance and type controls. An original short essay provides real content for the composition.',
    decisions: [
      {
        title: 'Typography sets the pace',
        text: 'Newsreader gives passages an easy rhythm, paired with Manrope for the navigation and controls.',
      },
      {
        title: 'Private preferences',
        text: 'Reading settings are stored locally. No account, tracking, or remote data collection.',
      },
      {
        title: 'Content is the interface',
        text: 'A narrow measure, generous leading, and deliberate paragraph breaks carry the design.',
      },
    ],
  },
];
