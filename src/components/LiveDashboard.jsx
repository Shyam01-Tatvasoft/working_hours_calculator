import React from 'react';
import { formatDurationLive, formatDuration, formatTime } from '../utils/timeCalculations';
import { MealBreakIcon } from './icons/MealBreakIcon';

const STATUS_CONFIG = {
  idle:       { label: 'Not Started',      cls: 'status--idle',       icon: '○' },
  working:    { label: 'Working',           cls: 'status--working',    icon: '▶' },
  'on-break': { label: 'On Break',          cls: 'status--break',      icon: '⏸' },
  completed:  { label: 'Completed',         cls: 'status--done',       icon: '✓' },
  historical: { label: 'Historical Record', cls: 'status--historical', icon: '📋' },
};

/**
 * LiveDashboard — hero panel.
 *
 * Live mode:      live-updating working time, remaining time, expected end
 * Historical mode: static day summary — total worked, break, elapsed
 *
 * Props:
 *   session      {object} — from calcSession()
 *   endTime      {string} — "HH:MM" departure time (historical mode)
 *   requiredSec  {number} — required working seconds (for overtime calc)
 */
function LiveDashboard({ session, endTime, requiredSec }) {
  const {
    workingSec,
    remainingSec,
    totalBreakSec,
    completedBreakSec,
    elapsedSec,
    expectedCompletionMin,
    expectedCompletionNextDay,
    status,
    isHistorical,
  } = session;

  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const hasArrival = status !== 'idle';

  // Historical: how far over or short the required target is
  const overtimeSec  = isHistorical ? Math.max(0, workingSec - requiredSec) : 0;
  const undertimeSec = isHistorical ? Math.max(0, requiredSec - workingSec) : 0;

  return (
    <div
      className={`live-dashboard card${isHistorical ? ' live-dashboard--historical' : ''}`}
      role="region"
      aria-label={isHistorical ? 'Historical working hours summary' : 'Live working hours dashboard'}
    >
      {/* Header row */}
      <div className="live-dashboard__header">
        <h2 className="live-dashboard__title">
          {isHistorical ? 'Day Summary' : 'Live Status'}
        </h2>
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
          {/* Primary — working time (large hero number) */}
          <div className="live-stat live-stat--primary" aria-label={isHistorical ? 'Total working time' : 'Current working time'}>
            <span className="live-stat__label">
              {isHistorical ? 'Total Working Time' : 'Current Working Time'}
            </span>
            <span
              className="live-stat__value live-stat__value--large"
              aria-live={isHistorical ? undefined : 'polite'}
              aria-atomic="true"
            >
              {isHistorical
                ? formatDuration(Math.floor(workingSec / 60))
                : formatDurationLive(workingSec)}
            </span>

            {/* Historical: show over/under the required target */}
            {isHistorical && overtimeSec > 0 && (
              <span className="hist-delta hist-delta--over">
                ✓ {formatDuration(Math.floor(overtimeSec / 60))} over target
              </span>
            )}
            {isHistorical && undertimeSec > 0 && (
              <span className="hist-delta hist-delta--short">
                ⚠ {formatDuration(Math.floor(undertimeSec / 60))} short of target
              </span>
            )}
          </div>

          {/* Secondary row — 3 mini-cards */}
          <div className="live-stats__secondary">

            {/* Card 1 */}
            {isHistorical ? (
              /* Historical: End Time */
              <div className="live-mini-card">
                <span className="live-mini-card__icon" aria-hidden="true">🏁</span>
                <span className="live-mini-card__value">{endTime || '—'}</span>
                <span className="live-mini-card__label">End Time</span>
              </div>
            ) : (
              /* Live: Remaining */
              <div className="live-mini-card">
                <span className="live-mini-card__icon" aria-hidden="true">⏳</span>
                <span className="live-mini-card__value" aria-live="polite" aria-atomic="true">
                  {remainingSec <= 0 ? 'Done!' : formatDurationLive(remainingSec)}
                </span>
                <span className="live-mini-card__label">Remaining</span>
              </div>
            )}

            {/* Card 2 */}
            {isHistorical ? (
              /* Historical: Total Break */
              <div className="live-mini-card live-mini-card--accent">
                <span className="live-mini-card__icon" aria-hidden="true">
                  <MealBreakIcon size={40} />
                </span>
                <span className="live-mini-card__value">
                  {completedBreakSec > 0 ? formatDuration(Math.floor(completedBreakSec / 60)) : '0m'}
                </span>
                <span className="live-mini-card__label">Total Break</span>
              </div>
            ) : (
              /* Live: Expected End with +1d badge */
              <div className="live-mini-card live-mini-card--accent">
                <span className="live-mini-card__icon" aria-hidden="true">🏁</span>
                <span className="live-mini-card__value">
                  {expectedCompletionMin !== null ? (
                    <>
                      {formatTime(expectedCompletionMin)}
                      {expectedCompletionNextDay && (
                        <span
                          className="expected-end-nextday"
                          title="Expected completion is the next calendar day"
                          aria-label="next day"
                        >
                          +1d
                        </span>
                      )}
                    </>
                  ) : '—'}
                </span>
                <span className="live-mini-card__label">Expected End</span>
              </div>
            )}

            {/* Card 3 */}
            {isHistorical ? (
              /* Historical: Total Elapsed (arrival → end) */
              <div className="live-mini-card">
                <span className="live-mini-card__icon" aria-hidden="true">⏱️</span>
                <span className="live-mini-card__value">
                  {formatDuration(Math.floor(elapsedSec / 60))}
                </span>
                <span className="live-mini-card__label">Total Elapsed</span>
              </div>
            ) : (
              /* Live: Total Break */
              <div className="live-mini-card">
                <span className="live-mini-card__icon" aria-hidden="true">
                  <MealBreakIcon size={40} />
                </span>
                <span className="live-mini-card__value">
                  {totalBreakSec > 0 ? formatDuration(Math.floor(totalBreakSec / 60)) : '0m'}
                </span>
                <span className="live-mini-card__label">Total Break</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveDashboard;
