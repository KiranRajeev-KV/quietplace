import type { Value } from 'platejs';
import { newManuscript, type Manuscript } from '../domain/model';
const p = (text: string) => ({ type: 'p', children: [{ text }] });
const h = (text: string, level = 2) => ({ type: `h${level}`, children: [{ text }] });
const code = (text: string, lang: string, filename: string) => ({
  type: 'code_block',
  lang,
  filename,
  children: text.split('\n').map((line) => ({ type: 'code_line', children: [{ text: line }] })),
});
const sections = [
  [
    'The boundary is the design',
    'A save button is a promise. It tells the writer that an idea has moved from a fragile browser tab to a place they can return to. Most of the work behind that promise is invisible: a transaction, a revision number, an acknowledgement. The visible part should be small enough to leave room for the sentence being written.',
    'We can begin by making the boundary explicit. The browser owns the current editing session. The repository owns the durable manuscript. A published edition is a deliberate snapshot of that manuscript. These are different responsibilities, even when a single person moves between them. Keeping those responsibilities clear makes the interface calmer, because fewer actions have surprising consequences.',
  ],
  [
    'A revision, rather than a timestamp',
    'Timestamps describe when something happened; revisions describe which state was accepted. Two tabs can produce updates within the same clock interval. A device can have an incorrect clock. Neither problem matters if the server accepts a write only when its expected revision matches the current revision. The successful update increments that revision inside the same transaction.',
    'This is a modest form of optimistic concurrency. It does not attempt to merge two different manuscripts automatically. For a single author, the honest response to a conflict is often to preserve both versions and ask which one should become authoritative. A small export action is more useful here than an elaborate collaboration system that nobody needs.',
  ],
  [
    'Saving without interrupting',
    'A debounce gives the network a little breathing room. Wait for a pause in typing, then send the document. A maximum waiting interval makes sure that a long uninterrupted session still reaches the server. There should be only one save in flight for a manuscript. If the writer continues typing, the next request should carry the newest local document after the previous request is acknowledged.',
    'The status belongs at the edge of attention. “Saving” should be visible without demanding attention; “Saved” should settle into the paper. A failure is different. It needs a plain sentence, a retry action, and a way to recover the writing. Avoid technical language that makes the author decode the transport layer while holding a half-finished thought.',
  ],
  [
    'A recovery copy is a safety net',
    'Browser storage can help during a connection failure, but it should never masquerade as the publishing database. Store a small recovery copy locally, tagged with the revision it was based on. On return, compare that revision with the saved manuscript. If they match, recovering the local changes is straightforward. If they differ, preserve the copy and make the conflict explicit.',
    'There is no perfect browser exit event. A mobile operating system may stop a tab without asking it to close. The practical approach is to save during the session, checkpoint on meaningful changes, attempt a flush when visibility changes, and warn on navigation only while unsaved writing remains. The warning is the last layer of protection, not the primary save mechanism.',
  ],
  [
    'Publishing as an edition',
    'The public page should not change merely because its author corrected a sentence in a private tab. Publishing is an editorial act. Create an immutable public snapshot from a successfully saved manuscript, and expose only that snapshot to the public repository. Later edits remain private until the author publishes a new edition. The public address remains stable throughout.',
    'Images need the same boundary. An uploaded image may belong to an unpublished draft. Its storage key should not be a public URL that anyone can fetch indefinitely. A media route can check whether the image belongs to a live edition before serving it. Unpublishing a piece should revoke access to its images as well as its words.',
  ],
  [
    'What the reader actually sees',
    'The reader should experience the result rather than the machinery. A comfortable line length, a good rhythm between paragraphs, and clear code examples matter more than a collection of reading widgets. A short note can begin with a title and end with a small mark. A long technical article earns a contents margin because it gives the reader a useful way back into the argument.',
    'The same principle applies to movement. A title can travel from the archive into the article, preserving its identity through the transition. Once the reader arrives, the page should become still. Animation that repeatedly announces itself competes with the text. The most useful motion is often the motion that makes its point once and then disappears.',
  ],
  [
    'The simplest dependable system',
    'Dependability is an accumulation of ordinary decisions. Validate documents at the boundary. Keep credentials on the server. Use prepared queries. Limit uploads before reading them into memory. Give every meaningful action a recoverable error state. Test the version of the site that readers and writers will actually use, including direct URLs and refreshes.',
    'These choices are not glamorous, but they create room for an interface with character. When the underlying system is understandable, the surface does not need to explain it all. The writer can stay with the thought. The reader can stay with the page. The software has done its work when neither person needs to think about the save mechanism.',
  ],
] as const;
export const sampleLabels = {
  note: 'A very short note',
  weeknote: 'A week at the desk',
  essay: 'An essay on attention',
  technical: 'A technical typesetting study',
} as const;
export function sampleManuscript(type: keyof typeof sampleLabels): Manuscript {
  const m = newManuscript(crypto.randomUUID());
  m.title = `Specimen — ${sampleLabels[type]}`;
  m.kind = type;
  m.subtitle = 'Private development specimen. These words are not a publication by KR.';
  m.description = 'A private typesetting and editing specimen. Publishing is disabled.';
  if (type === 'note')
    m.content = [
      p('A useful tool leaves room for the thing it helps us do.'),
      p(
        'Today’s small experiment: remove one control, and see whether the work becomes easier to find.',
      ),
    ];
  if (type === 'weeknote')
    m.content = [
      h('This week'),
      p(
        'The desk has been a place for small, steady adjustments: a narrower reading measure, a clearer save state, and a title that carries its identity from one page to the next.',
      ),
      { ...p('Made the archive quieter.'), indent: 1, listStyleType: 'disc' },
      { ...p('Tested the editor on a narrow screen.'), indent: 1, listStyleType: 'disc' },
      { ...p('Kept the first publication deliberately empty.'), indent: 1, listStyleType: 'disc' },
      h('Next week'),
      p('A little less interface. A little more attention to the writing itself.'),
    ];
  if (type === 'essay')
    m.content = [
      h('A place to pay attention'),
      ...sections.flatMap(([title, a, b]) => [h(title), p(a), p(b)]),
      {
        type: 'blockquote',
        children: [{ text: 'Care is often visible in the things a page gives room to.' }],
      },
      p(
        'This is a development specimen, written to test paragraph rhythm and long-form reading. It is intentionally kept inside the private notebook.',
      ),
    ];
  if (type === 'technical') {
    const body: Value = [];
    sections.forEach(([title, a, b], i) => {
      body.push(h(title), p(a), p(b));
      if (i === 0)
        body.push({
          type: 'blockquote',
          children: [{ text: 'The interface can be quiet because the data boundary is clear.' }],
        });
      if (i === 1)
        body.push(
          h('A conditional update', 3),
          code(
            'UPDATE writing\nSET manuscript = ?, revision = revision + 1\nWHERE id = ? AND revision = ?;',
            'sql',
            'save.sql',
          ),
        );
      if (i === 2)
        body.push(
          code(
            'async function saveLatest() {\n  const result = await repository.save({\n    expectedRevision: revision,\n    document: currentDocument,\n  });\n  revision = result.revision;\n}',
            'typescript',
            'manuscript.ts',
          ),
        );
      if (i === 3)
        body.push(
          code(
            'def reading_minutes(words: int) -> int:\n    return max(1, (words + 219) // 220)',
            'python',
            'reading.py',
          ),
        );
    });
    body.push(
      h('A few useful boundaries'),
      {
        ...p('Validate the document before persistence.'),
        indent: 1,
        listStyleType: 'decimal',
        listStart: 1,
      },
      { ...p('Publish only a saved revision.'), indent: 1, listStyleType: 'decimal', listStart: 2 },
      {
        ...p('Keep the public renderer and editor on one schema.'),
        indent: 1,
        listStyleType: 'decimal',
        listStart: 3,
      },
      {
        type: 'p',
        children: [
          { text: 'The canonical value is ' },
          { text: 'Plate JSON', code: true },
          { text: '. The ' },
          {
            type: 'a',
            url: 'https://platejs.org/docs',
            children: [{ text: 'Plate documentation' }],
          },
          { text: ' describes the maintained rendering and editing APIs.' },
        ],
      },
      { type: 'hr', children: [{ text: '' }] },
      p(
        'End of the private development specimen. Add an image with alt text and a caption to test the media workflow. This document cannot be published.',
      ),
    );
    m.content = body;
  }
  return m;
}
