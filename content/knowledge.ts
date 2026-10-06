export const knowledge = [
  {
    id: 'trust',
    title: 'Trust is something a system earns',
    tags: [
      'trust',
      'trustworthy',
      'reliable',
      'confidence',
      'honest',
      'evidence',
    ],
    answer:
      'A trustworthy system makes its limits visible. It shows the evidence behind an answer, gives people control, and handles uncertainty without disguising it.',
    excerpt:
      'Trust grows when a system is understandable, consistent, and honest about what it does not know.',
  },
  {
    id: 'clarity',
    title: 'Clarity is a form of care',
    tags: [
      'clarity',
      'simple',
      'simplicity',
      'minimal',
      'design',
      'interface',
      'quiet',
    ],
    answer:
      'Clarity comes from deciding what matters, then giving it room. Fewer competing elements, precise language, and a visible hierarchy make an interface easier to understand.',
    excerpt:
      'A clear interface respects the attention of the person using it. Every element should earn the space it occupies.',
  },
  {
    id: 'agents',
    title: 'Thinking in the open',
    tags: [
      'agent',
      'agents',
      'workflow',
      'progress',
      'control',
      'ai',
      'intelligence',
    ],
    answer:
      'Make agent workflows inspectable: show the current step, explain completed work, and let people pause or redirect the process. Useful intelligence should remain understandable.',
    excerpt:
      'The value of a workflow is not just its output, but the ability to follow its decisions and intervene.',
  },
  {
    id: 'performance',
    title: 'Speed is part of the experience',
    tags: ['performance', 'fast', 'speed', 'animation', 'motion', 'loading'],
    answer:
      'Start with meaningful content and a small dependency graph. Animate transforms and opacity, stop idle work, and respect reduced motion. A responsive interface should feel immediate.',
    excerpt:
      'Performance is a design decision: load what matters, avoid work that nobody sees, and keep interactions responsive.',
  },
];
export function retrieve(query: string) {
  const words: string[] = query.toLowerCase().match(/[a-z]+/g) ?? [];
  return knowledge
    .map((item) => ({
      ...item,
      score: item.tags.filter((tag) => words.includes(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
}
