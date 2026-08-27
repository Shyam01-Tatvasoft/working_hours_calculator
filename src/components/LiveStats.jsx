import React from 'react';
import { formatDurationMs, formatTimeFromIso } from '../utils/timeCalculations';

const STATUS_CONFIG = {
  idle:       { label: 'Not Started',      cls: 'status--idle',       icon: '○' },
  working:    { label: 'Working',          cls: 'status--working',    icon: '▶' },
  'on-break': { label: 'On Break',         cls: 'status--break',      icon: '⏸' },
  completed:  { label: 'Completed',        cls: 'status--done',       icon: '✓' },
};

function LiveStats({ session, stats }) {
  const {
    status,
    workingMs,
    remainingMs,
    totalBreakMs,
    expectedEndMs,
    hoursCompleted,
    isCompleted,
  } = stats;

  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const isStarted = status !== 'idle';

  // Detect if expected completion is next day
  let isNextDay = false;
  if (expectedEndMs && session.workStart) {
    const start = new Date(session.workStart);
    const expected = new Date(expectedEndMs);
    isNextDay = start.getDate() !== expected.getDate() || 
                start.getMonth() !== expected.getMonth() || 
                start.getFullYear() !== expected.getFullYear();
  }

  return (
    <div className={`live-dashboard card ${hoursCompleted && !isCompleted ? 'live-dashboard--hours-completed' : ''}`} role="region" aria-label="Live tracking dashboard">
      {/* Header with current status */}
      <div className="live-dashboard__header">
        <h2 className="live-dashboard__title">Today's Tracker</h2>
        <span className={`status-badge ${sc.cls}`} role="status" aria-live="polite">
          <span className="status-badge__icon" aria-hidden="true">{sc.icon}</span>
          {sc.label}
        </span>
      </div>

      {!isStarted ? (
        <div className="live-dashboard__empty">
          <span className="live-dashboard__empty-icon" aria-hidden="true">⏰</span>
          <p>Click <strong>Start Work</strong> to begin tracking your day.</p>
        </div>
      ) : (
        <div className="live-stats">
          {/* Working hours completed notification */}
          {hoursCompleted && !isCompleted && (
            <div className="hours-completed-banner" role="status" aria-live="polite">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Working Hours Completed! Keep going until you end your shift.
            </div>
          )}

          {/* Large Hero Value: Working Time */}
          <div className="live-stat live-stat--primary" aria-label="Total working time logged">
            <span className="live-stat__label">Working Time</span>
            <span className="live-stat__value live-stat__value--large font-tabular">
              {formatDurationMs(workingMs)}
            </span>
          </div>

          {/* Secondary stats row */}
          <div className="live-stats__secondary">
            {/* Card 1: Remaining Time */}
            <div className="live-mini-card">
              <span className="live-mini-card__icon" aria-hidden="true">⏳</span>
              <span className="live-mini-card__value font-tabular">
                {isCompleted ? 'Done!' : remainingMs <= 0 ? '0s' : formatDurationMs(remainingMs)}
              </span>
              <span className="live-mini-card__label">Remaining</span>
            </div>

            {/* Card 2: Expected End */}
            <div className="live-mini-card live-mini-card--accent">
              <span className="live-mini-card__icon" aria-hidden="true">🏁</span>
              <span className="live-mini-card__value font-tabular">
                {expectedEndMs ? (
                  <>
                    {formatTimeFromIso(new Date(expectedEndMs).toISOString())}
                    {isNextDay && (
                      <span className="expected-end-nextday" title="Expected completion is next calendar day" aria-label="next day">
                        +1d
                      </span>
                    )}
                  </>
                ) : (
                  formatTimeFromIso(session.workEnd) || '—'
                )}
              </span>
              <span className="live-mini-card__label">
                {isCompleted ? 'Finished At' : 'Expected End'}
              </span>
            </div>

            {/* Card 3: Total Break */}
            <div className="live-mini-card">
              <span className="live-mini-card__icon" aria-hidden="true">⏸</span>
              <span className="live-mini-card__value font-tabular">
                {formatDurationMs(totalBreakMs)}
              </span>
              <span className="live-mini-card__label">Total Break</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveStats;
