import React from 'react';

/**
 * ActionButton — The single hero action button that drives the state machine.
 *
 * Status → Primary button:
 *   idle      → Start Work  (blue / primary)
 *   working   → Start Break (orange)
 *   on-break  → Resume Work (green)
 *   completed → Start New Day (muted)
 *
 * Secondary (working / on-break): End Work
 */
function ActionButton({
  status,
  onStartWork,
  onStartBreak,
  onResumeWork,
  onEndWork,
  onStartNewDay,
}) {
  return (
    <div className="action-hero">
      {/* ── Primary action ── */}
      {status === 'idle' && (
        <button
          className="action-hero__btn action-hero__btn--start-work"
          onClick={onStartWork}
          id="start-work-btn"
          aria-label="Start work and begin tracking time"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
          Start Work
        </button>
      )}

      {status === 'working' && (
        <button
          className="action-hero__btn action-hero__btn--start-break"
          onClick={onStartBreak}
          id="start-break-btn"
          aria-label="Start a break and pause the working timer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          Start Break
        </button>
      )}

      {status === 'on-break' && (
        <button
          className="action-hero__btn action-hero__btn--resume"
          onClick={onResumeWork}
          id="resume-work-btn"
          aria-label="Resume work and end the current break"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
          Resume Work
        </button>
      )}

      {status === 'completed' && (
        <button
          className="action-hero__btn action-hero__btn--new-day"
          onClick={onStartNewDay}
          id="new-day-btn"
          aria-label="Archive today's session and start a new day"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Start New Day
        </button>
      )}

      {/* ── Secondary: End Work (working / on-break) ── */}
      {(status === 'working' || status === 'on-break') && (
        <div className="action-hero__secondary">
          <button
            className="action-hero__end-btn"
            onClick={onEndWork}
            id="end-work-btn"
            aria-label="End work for today and finalize the session"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" />
            </svg>
            End Work
          </button>
        </div>
      )}
    </div>
  );
}

export default ActionButton;
