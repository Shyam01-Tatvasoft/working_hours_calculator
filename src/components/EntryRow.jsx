import React from 'react';

/**
 * EntryRow - A single time-entry row in the table.
 * Props: entry, rowNumber, onUpdate, onDelete, isLast
 */
function EntryRow({ entry, rowNumber, onUpdate, onDelete }) {
  const handleTimeChange = (e) => {
    onUpdate(entry.id, 'time', e.target.value);
  };

  const handleDirectionChange = (dir) => {
    onUpdate(entry.id, 'direction', dir);
  };

  return (
    <div className="entry-row" role="row">
      {/* Row number */}
      <span className="entry-row__num" aria-label={`Row ${rowNumber}`}>
        {rowNumber}
      </span>

      {/* Time input */}
      <div className="entry-row__time-wrap">
        <input
          id={`time-${entry.id}`}
          type="time"
          className="entry-row__time"
          value={entry.time}
          onChange={handleTimeChange}
          aria-label={`Time for entry ${rowNumber}`}
        />
      </div>

      {/* Direction toggle */}
      <div className="entry-row__dir-group" role="group" aria-label={`Direction for entry ${rowNumber}`}>
        <button
          className={`dir-btn dir-btn--in ${entry.direction === 'In' ? 'dir-btn--active' : ''}`}
          onClick={() => handleDirectionChange('In')}
          aria-pressed={entry.direction === 'In'}
          title="Check In"
        >
          <span className="dir-btn__dot" />
          In
        </button>
        <button
          className={`dir-btn dir-btn--out ${entry.direction === 'Out' ? 'dir-btn--active' : ''}`}
          onClick={() => handleDirectionChange('Out')}
          aria-pressed={entry.direction === 'Out'}
          title="Check Out"
        >
          <span className="dir-btn__dot" />
          Out
        </button>
      </div>

      {/* Delete button */}
      <button
        className="entry-row__delete"
        onClick={() => onDelete(entry.id)}
        aria-label={`Delete entry ${rowNumber}`}
        title="Delete row"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  );
}

export default EntryRow;
