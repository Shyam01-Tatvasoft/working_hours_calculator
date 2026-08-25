import React from 'react';
import BreakRow from './BreakRow';
import { MealBreakIcon } from './icons/MealBreakIcon';
import { formatDurationLive } from '../utils/timeCalculations';

/**
 * BreakList — manages the list of break entries.
 *
 * Live mode (isHistorical=false):
 *   • Shows "Start Break" / "Stop Break" button — stamps current time automatically.
 *   • Active break shows a live pulsing banner with elapsed duration.
 *   • Completed break rows are shown below (editable for corrections).
 *
 * Historical mode (isHistorical=true):
 *   • Shows "Add Break" button — manual HH:MM entry, unchanged from before.
 *
 * Props:
 *   breaks         {Array}    - full break list
 *   errors         {Object}   - { breakId: errorString }
 *   activeBreak    {object|null} - currently open break (start, no end)
 *   activeBreakSec {number}   - seconds elapsed for the active break
 *   isHistorical   {boolean}  - historical mode flag
 *   hasArrival     {boolean}  - whether arrival time is set
 *   onAdd          {Function} - historical: add empty manual break
 *   onUpdate       {Function} - update break field
 *   onDelete       {Function} - delete break by id
 *   onStartBreak   {Function} - live: stamp start time
 *   onStopBreak    {Function} - live: stamp end time for active break
 */
function BreakList({
  breaks,
  errors,
  activeBreak,
  activeBreakSec,
  isHistorical,
  hasArrival,
  onAdd,
  onUpdate,
  onDelete,
  onStartBreak,
  onStopBreak,
}) {
  const completedBreaks = breaks.filter((b) => b.end); // completed (start + end)
  const hasActiveBreak = Boolean(activeBreak);
  const totalBreaks = breaks.length;

  return (
    <div className="break-list card">
      <div className="card__head">
        <h2 className="card__title">
          <MealBreakIcon size={30} />
          Breaks
        </h2>
        {totalBreaks > 0 && (
          <span className="card__badge">
            {totalBreaks} {totalBreaks === 1 ? 'break' : 'breaks'}
          </span>
        )}
      </div>

      {/* ── Break rows ── */}
      <div className="break-list__body" role="list" aria-label="Break entries">

        {/* Active break banner — only in live mode */}
        {!isHistorical && hasActiveBreak && (
          <div className="active-break-banner" role="status" aria-live="polite">
            <div className="active-break-banner__left">
              <span className="active-break-pulse" aria-hidden="true" />
              <div className="active-break-banner__info">
                <span className="active-break-banner__label">Break in progress</span>
                <span className="active-break-banner__time">
                  Started at <strong>{activeBreak.start}</strong>
                </span>
              </div>
            </div>
            <div className="active-break-banner__right">
              <span className="active-break-banner__duration" aria-label="Break duration">
                {formatDurationLive(activeBreakSec)}
              </span>
              <button
                className="break-ctrl-btn break-ctrl-btn--stop"
                onClick={onStopBreak}
                id="stop-break-btn"
                aria-label="Stop current break and stamp end time"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                </svg>
                Stop Break
              </button>
            </div>
          </div>
        )}

        {/* Completed + open (non-active) break rows */}
        {breaks.length === 0 && !hasActiveBreak ? (
          <div className="break-list__empty">
            <MealBreakIcon size={48} style={{ opacity: 0.5 }} />
            {isHistorical ? (
              <p>No breaks added yet.<br />Click <strong>Add Break</strong> to record a break.</p>
            ) : (
              <p>No breaks yet.<br />Click <strong>Start Break</strong> when you take a break.</p>
            )}
          </div>
        ) : (
          breaks
            // In live mode, hide only the currently-active break (shown in banner).
            // Manually-added empty rows (no start yet) ARE shown here.
            .filter((b) => isHistorical || !activeBreak || b.id !== activeBreak.id)
            .map((b, idx) => (
              <BreakRow
                key={b.id}
                breakObj={b}
                rowNumber={idx + 1}
                onUpdate={onUpdate}
                onDelete={onDelete}
                error={errors[b.id] || null}
                isActive={false}
                isHistorical={isHistorical}
              />
            ))
        )}
      </div>

      {/* ── Footer: Start Break (live) or Add Break (historical) ── */}
      <div className="break-list__footer">
        {isHistorical ? (
          /* Historical mode — manual entry */
          <button
            className="add-btn"
            onClick={onAdd}
            id="add-break-btn"
            aria-label="Add a new break"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Break
          </button>
        ) : (
          /* Live mode — Start Break + Add Manually */
          <div className="break-live-footer">
            <button
              className={`break-ctrl-btn break-ctrl-btn--start${!hasArrival || hasActiveBreak ? ' break-ctrl-btn--disabled' : ''}`}
              onClick={onStartBreak}
              disabled={!hasArrival || hasActiveBreak}
              id="start-break-btn"
              aria-label={
                !hasArrival
                  ? 'Set arrival time first to use break tracking'
                  : hasActiveBreak
                    ? 'A break is already in progress'
                    : 'Start a new break and stamp current time'
              }
              title={
                !hasArrival
                  ? 'Set arrival time first'
                  : hasActiveBreak
                    ? 'Stop the current break first'
                    : 'Start break'
              }
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Start Break
            </button>

            <button
              className="break-manual-btn"
              onClick={onAdd}
              id="add-break-manually-btn"
              aria-label="Add a break manually by entering start and end times"
              title="Add break manually (for missed breaks)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add manually
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BreakList;
