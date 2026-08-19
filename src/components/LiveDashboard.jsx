import React from 'react';
import { formatDurationLive, formatDuration, formatTime } from '../utils/timeCalculations';
import { MealBreakIcon } from './icons/MealBreakIcon';

const STATUS_CONFIG = {
  idle: { label: 'Not Started', cls: 'status--idle', icon: '○' },
  working: { label: 'Working', cls: 'status--working', icon: '▶' },
  'on-break': { label: 'On Break', cls: 'status--break', icon: '⏸' },
  completed: { label: 'Completed', cls: 'status--done', icon: '✓' },
};

/**
 * LiveDashboard — hero panel showing all live-updating stats.
 * Props: session (from calcSession), arrivalSec (number|null)
 */
function LiveDashboard({ session }) {
  const {
    workingSec,
    remainingSec,
    totalBreakSec,
    completedBreakSec,
    expectedCompletionMin,
    status,
  } = session;

  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const hasArrival = status !== 'idle';

  return (
    <div className="live-dashboard card" role="region" aria-label="Live working hours dashboard">
      {/* Header row */}
      <div className="live-dashboard__header">
        <h2 className="live-dashboard__title">Live Status</h2>
        <span className={`status-badge ${sc.cls}`} role="status" aria-live="polite">
          <span className="status-badge__icon" aria-hidden="true">{sc.icon}</span>
          {sc.label}
        </span>
      </div>

      {/* Empty state */}
      {!hasArrival ? (
        <div className="live-dashboard__empty">
          <span className="live-dashboard__empty-icon" aria-hidden="true">⏰</span>
          <p>Enter your <strong>arrival time</strong> below to start tracking</p>
        </div>
      ) : (
        <div className="live-stats">
          {/* Primary — large working time */}
          <div className="live-stat live-stat--primary" aria-label="Current working time">
            <span className="live-stat__label">Current Working Time</span>
            <span
              className="live-stat__value live-stat__value--large"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatDurationLive(workingSec)}
            </span>
          </div>

          {/* Secondary row — 3 mini-cards */}
          <div className="live-stats__secondary">
            <div className="live-mini-card">
              <span className="live-mini-card__icon" aria-hidden="true">⏳</span>
              <span className="live-mini-card__value" aria-live="polite" aria-atomic="true">
                {remainingSec <= 0 ? 'Done!' : formatDurationLive(remainingSec)}
              </span>
              <span className="live-mini-card__label">Remaining</span>
            </div>

            <div className="live-mini-card live-mini-card--accent">
              <span className="live-mini-card__icon" aria-hidden="true">🏁</span>
              <span className="live-mini-card__value">
                {expectedCompletionMin !== null ? formatTime(expectedCompletionMin) : '—'}
              </span>
              <span className="live-mini-card__label">Expected End</span>
            </div>

            <div className="live-mini-card">
              <span className="live-mini-card__icon" aria-hidden="true">
                <MealBreakIcon size={40} />
              </span>
              <span className="live-mini-card__value">
                {totalBreakSec > 0 ? formatDuration(Math.floor(totalBreakSec / 60)) : '0m'}
              </span>
              <span className="live-mini-card__label">Total Break</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveDashboard;
