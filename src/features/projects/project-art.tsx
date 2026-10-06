import type { Project } from '@/content/projects';
export function ProjectArt({ kind }: { kind: Project['slug'] }) {
  if (kind === 'thread')
    return (
      <div className="project-art thread-art" aria-hidden="true">
        <div className="art-register micro">
          <span>THREAD / KNOWLEDGE, CONNECTED</span>
          <span>01</span>
        </div>
        <div className="thread-window">
          <div className="window-bar">
            <strong>
              thread<span>•</span>
            </strong>
            <span>YOUR KNOWLEDGE, CONNECTED</span>
            <span>↗</span>
          </div>
          <div className="thread-content">
            <span className="tiny-label">A LITTLE CLARITY</span>
            <h3>
              Good questions.
              <br />
              <em>Grounded answers.</em>
            </h3>
            <div className="query-preview">
              What makes a system trustworthy?<span>↵</span>
            </div>
            <div className="source-preview">
              <span className="source-mark">↳</span>
              <span>
                Thoughtful design starts with understanding.
                <small>3 connected sources · A clearer perspective</small>
              </span>
            </div>
          </div>
          <div className="window-footer">
            <span className="status-dot" /> A SPACE FOR YOUR CURIOSITY
            <span>NOT ANOTHER SEARCH BAR.</span>
          </div>
        </div>
        <div className="art-baseline micro">
          <span>LESS SEARCHING. MORE UNDERSTANDING.</span>
          <span>RETRIEVAL / INTERFACE STUDY</span>
        </div>
      </div>
    );
  if (kind === 'relay')
    return (
      <div className="project-art relay-art" aria-hidden="true">
        <div className="art-register micro">
          <span>RELAY / EVERY STEP, IN VIEW</span>
          <span>02</span>
        </div>
        <div className="relay-composition">
          <div className="relay-brand">
            relay<span className="relay-logo">↗</span>
          </div>
          <div className="workflow-line">
            <div className="workflow-node">
              <span className="node-dot complete">✓</span>
              <small>01 / RESEARCH</small>
            </div>
            <div className="workflow-node">
              <span className="node-dot active">✳</span>
              <small>02 / SYNTHESIZE</small>
            </div>
            <div className="workflow-node">
              <span className="node-dot">↗</span>
              <small>03 / REVIEW</small>
            </div>
          </div>
          <div className="relay-note">
            <span className="status-dot" />
            Thinking, in the open.<span>02 — 03</span>
          </div>
        </div>
        <div className="art-baseline micro">
          <span>INTELLIGENCE, WITH INTENTION.</span>
          <span>WORKFLOW STUDY</span>
        </div>
      </div>
    );
  return (
    <div className="project-art fieldnotes-art" aria-hidden="true">
      <div className="art-register micro">
        <span>FIELDNOTES / A SPACE TO READ</span>
        <span>03</span>
      </div>
      <div className="paper-sheet">
        <div className="paper-masthead">
          fieldnotes<span>AN INDEPENDENT JOURNAL</span>
        </div>
        <div className="paper-intro">
          <span className="tiny-label">ON MAKING THINGS</span>
          <h3>
            The quiet
            <br />
            work of <em>care.</em>
          </h3>
          <p>
            Good work is often the accumulation
            <br />
            of small, considered decisions.
          </p>
          <span className="paper-rule" />
          <span className="tiny-label">A NOTE ON ATTENTION · 2 MIN READ</span>
        </div>
        <span className="paper-page">01</span>
      </div>
      <div className="art-baseline micro">
        <span>WORDS, WITH ROOM TO BREATHE.</span>
        <span>EDITORIAL STUDY</span>
      </div>
    </div>
  );
}
