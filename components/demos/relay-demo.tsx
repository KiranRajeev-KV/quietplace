'use client';
import { useEffect, useState } from 'react';
const stages = [
  {
    title: 'Research',
    description: 'Collecting the relevant notes.',
    result:
      'Found four notes on trust, clarity, agent workflows, and performance.',
  },
  {
    title: 'Synthesize',
    description: 'Finding the connecting thread.',
    result:
      'The notes share a principle: useful technology respects a person’s attention and control.',
  },
  {
    title: 'Review',
    description: 'Checking the work against the question.',
    result:
      'Review complete. Evidence stays visible, limits are explicit, and the person can intervene.',
  },
];
export function RelayDemo() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || step >= stages.length) return;
    const timer = setTimeout(() => {
      setStep((s) => s + 1);
    }, 2000);
    return () => clearTimeout(timer);
  }, [running, step]);
  const complete = step === stages.length;
  const restart = () => {
    setStep(0);
    setRunning(false);
  };
  return (
    <div className="live-relay">
      <div className="live-brand">
        relay<span className="micro">LOCAL WORKFLOW SIMULATION</span>
      </div>
      <h3>
        Thinking, <em>in the open.</em>
      </h3>
      <p className="relay-brief">Brief: what makes thoughtful technology?</p>
      <ol className="live-stages">
        {stages.map((stage, i) => (
          <li
            key={stage.title}
            className={
              i < step
                ? 'is-complete'
                : i === step && running
                  ? 'is-active'
                  : ''
            }
          >
            <span className="live-node" aria-hidden="true">
              {i < step ? '✓' : `0${i + 1}`}
            </span>
            <div>
              <h4>
                {stage.title}
                <span>
                  {i < step
                    ? 'Complete'
                    : i === step && running
                      ? 'Working'
                      : 'Pending'}
                </span>
              </h4>
              <p>{i < step ? stage.result : stage.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="relay-controls">
        <button
          className="solid-button"
          type="button"
          onClick={() => (complete ? restart() : setRunning(!running))}
        >
          {complete
            ? 'Start again'
            : running
              ? 'Pause workflow'
              : step
                ? 'Resume workflow'
                : 'Run workflow'}
          <span aria-hidden="true">{running && !complete ? 'Ⅱ' : '↗'}</span>
        </button>
        {(step > 0 || running) && !complete && (
          <button className="quiet-button" type="button" onClick={restart}>
            Reset
          </button>
        )}
        <span className="micro" role="status" aria-live="polite">
          {complete
            ? 'ALL THREE STAGES COMPLETE'
            : running
              ? `STAGE ${step + 1} OF 3`
              : step
                ? 'WORKFLOW PAUSED'
                : 'READY WHEN YOU ARE'}
        </span>
      </div>
    </div>
  );
}
