import { useState, type FormEvent } from 'react';
import { retrieve } from '@/content/knowledge';
export function ThreadDemo() {
  const [query, setQuery] = useState('');
  const [asked, setAsked] = useState('');
  const [result, setResult] = useState<ReturnType<typeof retrieve> | null>(null);
  const search = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setQuery(q);
    setAsked(q);
    setResult(retrieve(q));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    search(query);
  };
  return (
    <div className="live-thread">
      <div className="live-brand">
        thread<span className="micro">KNOWLEDGE, CONNECTED</span>
      </div>
      <h3>
        Good questions.
        <br />
        <em>Grounded answers.</em>
      </h3>
      <form onSubmit={submit} className="thread-form">
        <label htmlFor="thread-question" className="sr-only">
          Ask the knowledge collection a question
        </label>
        <input
          id="thread-question"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What makes a system trustworthy?"
          maxLength={250}
          required
        />
        <button type="submit" aria-label="Search knowledge collection">
          ↗
        </button>
      </form>
      <div className="suggested-questions">
        <span className="micro">TRY A QUESTION</span>
        {[
          'What makes a system trustworthy?',
          'Why does clarity matter?',
          'How should agents show progress?',
        ].map((q) => (
          <button type="button" key={q} onClick={() => search(q)}>
            {q}
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <div className="thread-results" role="status" aria-live="polite" aria-atomic="true">
        {result !== null && (
          <>
            <span className="micro">
              {result.length ? 'FROM THE COLLECTION' : 'A CLEAR BOUNDARY'}
            </span>
            <h4>{asked}</h4>
            {result.length ? (
              <>
                <p>{result[0]?.answer}</p>
                <div className="retrieval-sources">
                  {result.map((item) => (
                    <details key={item.id}>
                      <summary>
                        {item.title}
                        <span>Read source</span>
                      </summary>
                      <blockquote>{item.excerpt}</blockquote>
                    </details>
                  ))}
                </div>
              </>
            ) : (
              <p>
                This collection doesn’t have enough information to answer that question. Try asking
                about trust, clarity, agent workflows, or performance.
              </p>
            )}
          </>
        )}
      </div>
      <div className="demo-foot micro">
        LOCAL RETRIEVAL STUDY<span>4 NOTES · ZERO EXTERNAL REQUESTS</span>
      </div>
    </div>
  );
}
