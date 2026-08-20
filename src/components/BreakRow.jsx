import React from 'react';
import { isCrossMidnight, parseTime } from '../utils/timeCalculations';

/**
 * BreakRow — a single break entry: start, end, delete.
 * Props: breakObj, rowNumber, onUpdate, onDelete, error, isActive
 */
function BreakRow({ breakObj, rowNumber, onUpdate, onDelete, error, isActive }) {
  const isComplete = breakObj.start && breakObj.end;

  // Detect cross-midnight break (e.g. 23:55 → 00:35)
  const startMin = parseTime(breakObj.start);
  const endMin   = parseTime(breakObj.end);
  const isMidnightBreak = isComplete && startMin !== null && endMin !== null && isCrossMidnight(startMin, endMin);

  // Visual indicator for break state
  const dotClass = isActive
    ? 'break-dot break-dot--active'
    : isComplete
    ? 'break-dot break-dot--done'
    : 'break-dot break-dot--pending';

  return (
    <div className={`break-item ${error ? 'break-item--error' : ''}`} role="row">
      {/* Row header */}
      <div className="break-item__header">
        <span className="break-item__num" aria-label={`Break ${rowNumber}`}>
          {rowNumber}
        </span>

        {/* Times */}
        <div className="break-item__times">
          <input
            id={`break-start-${breakObj.id}`}
            type="time"
            className="break-time-input"
            value={breakObj.start}
            onChange={(e) => onUpdate(breakObj.id, 'start', e.target.value)}
            aria-label={`Break ${rowNumber} start time`}
            placeholder="Start"
          />

          <span className="break-arrow" aria-hidden="true">→</span>

          <input
            id={`break-end-${breakObj.id}`}
            type="time"
            className="break-time-input break-time-input--end"
            value={breakObj.end}
            onChange={(e) => onUpdate(breakObj.id, 'end', e.target.value)}
            aria-label={`Break ${rowNumber} end time (optional, can be next day)`}
            placeholder="End"
          />

          {/* Cross-midnight indicator */}
          {isMidnightBreak && (
            <span
              className="break-midnight-badge"
              title="This break ends the next day (past midnight)"
              aria-label="Ends next day"
            >
              +1d
            </span>
          )}

          <span className={dotClass} title={isActive ? 'Active break' : isComplete ? 'Completed' : 'Ongoing'} aria-hidden="true" />
        </div>

        {/* Delete */}
        <button
          className="break-item__delete"
          onClick={() => onDelete(breakObj.id)}
          aria-label={`Delete break ${rowNumber}`}
          title="Remove break"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {/* Validation error */}
      {error && (
        <div className="break-item__error-msg" role="alert">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

export default BreakRow;
