'use client';
import { useSyncExternalStore } from 'react';
type Preferences = { ink: boolean; large: boolean };
const key = 'kr-fieldnotes-preferences';
let memory = ''; // Keep controls usable even when browser storage is blocked.
const defaults: Preferences = { ink: false, large: false };
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener('reading-preferences', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('reading-preferences', callback);
  };
};
function snapshot() {
  try {
    return localStorage.getItem(key) ?? memory;
  } catch {
    return memory;
  }
}
function parse(value: string): Preferences {
  try {
    const p = JSON.parse(value);
    return { ink: p.ink === true, large: p.large === true };
  } catch {
    return defaults;
  }
}
export function FieldnotesDemo() {
  const stored = useSyncExternalStore(subscribe, snapshot, () => '');
  const preferences = parse(stored);
  function update(next: Preferences) {
    memory = JSON.stringify(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* Reader remains usable if storage is blocked. */
    }
    window.dispatchEvent(new Event('reading-preferences'));
  }
  return (
    <div
      className={`live-reader ${preferences.ink ? 'reader-ink' : ''} ${preferences.large ? 'reader-large' : ''}`}
    >
      <div className="reader-toolbar">
        <span className="reader-wordmark">fieldnotes</span>
        <div role="group" aria-label="Reading preferences">
          <button
            type="button"
            aria-pressed={preferences.large}
            onClick={() =>
              update({ ...preferences, large: !preferences.large })
            }
            aria-label="Larger reading text"
          >
            Aa
          </button>
          <button
            type="button"
            aria-pressed={preferences.ink}
            onClick={() => update({ ...preferences, ink: !preferences.ink })}
          >
            {preferences.ink ? 'Paper' : 'Ink'}
          </button>
        </div>
      </div>
      <article className="reader-article">
        <span className="micro">ON MAKING THINGS / AN ORIGINAL NOTE</span>
        <h3>
          The quiet work
          <br />
          of <em>care.</em>
        </h3>
        <p className="reader-lede">
          Good work is often the accumulation of small, considered decisions.
        </p>
        <div className="reader-body">
          <p>
            A margin widened. A sentence shortened. A button placed where a hand
            expects to find it. These are small things, easy to miss in
            isolation. Together, they change how something feels.
          </p>
          <p>
            We tend to notice the spectacular part of making: the new idea, the
            clever system, the surprising interaction. But much of the work
            happens after the idea has arrived. It happens in the patient act of
            noticing what is slightly wrong, and taking the time to make it
            right.
          </p>
          <p>
            Care is a kind of attention. It asks who will use this, what they
            need, and what we can remove to make the experience clearer.
            Sometimes the most useful thing we can build is a little more room.
          </p>
          <p>
            That room gives a person space to read, to think, to decide. It
            turns a piece of technology into something that feels less like a
            demand and more like an invitation.
          </p>
          <p>
            There is no shortcut to that feeling. Just the quiet work of care.
          </p>
        </div>
        <div className="reader-end micro">
          KR / FIELDNOTES<span>END OF NOTE — 01</span>
        </div>
      </article>
    </div>
  );
}
