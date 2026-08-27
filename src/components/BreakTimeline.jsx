import React from 'react';
import { formatTimeFromIso, formatDurationMs } from '../utils/timeCalculations';

function BreakTimeline({ breaks, activeBreak, activeBreakMs }) {
  if (breaks.length === 0) return null;

  return (
    <div className="break-timeline-card card">
      <div className="card__head">
        <h3 className="card__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Today's Breaks
        </h3>
        <span className="card__badge">
          {breaks.length} {breaks.length === 1 ? 'break' : 'breaks'}
        </span>
      </div>

      <div className="break-timeline-body">
        <div className="timeline">
          {breaks.map((b, idx) => {
            const isActive = activeBreak?.id === b.id;
            const startStr = formatTimeFromIso(b.start);
            const endStr = b.end ? formatTimeFromIso(b.end) : null;
            
            // Check cross-midnight break for badge display
            let isMidnight = false;
            if (b.start && b.end) {
              const s = new Date(b.start);
              const e = new Date(b.end);
              isMidnight = s.getDate() !== e.getDate();
            }

            let duration = 0;
            if (isActive) {
              duration = activeBreakMs;
            } else if (b.start && b.end) {
              duration = new Date(b.end).getTime() - new Date(b.start).getTime();
            }

            return (
              <div 
                key={b.id} 
                className={`timeline-item ${isActive ? 'timeline-item--active' : ''}`}
              >
                <div className="timeline-item__badge" aria-hidden="true" />
                <div className="timeline-item__content">
                  <div className="timeline-item__info">
                    <span className="timeline-item__label">Break {idx + 1}</span>
                    <span className="timeline-item__times font-tabular">
                      {startStr} &rarr; {isActive ? (
                        <span className="timeline-item__active-text">Running...</span>
                      ) : (
                        <>
                          {endStr}
                          {isMidnight && (
                            <span className="break-midnight-badge" title="This break ends the next day">+1d</span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                  <span className="timeline-item__duration font-tabular">
                    {formatDurationMs(duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BreakTimeline;
