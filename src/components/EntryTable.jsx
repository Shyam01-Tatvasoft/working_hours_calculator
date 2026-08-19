import React from 'react';
import EntryRow from './EntryRow';

/**
 * EntryTable - The main table listing all time entries.
 * Props: entries, onAdd, onUpdate, onDelete
 */
function EntryTable({ entries, onAdd, onUpdate, onDelete }) {
  return (
    <section className="entry-table" aria-label="Time entries">
      {/* Table header */}
      <div className="entry-table__header" role="row">
        <span className="entry-table__col entry-table__col--num">#</span>
        <span className="entry-table__col entry-table__col--time">Time</span>
        <span className="entry-table__col entry-table__col--dir">Direction</span>
        <span className="entry-table__col entry-table__col--action">Action</span>
      </div>

      {/* Rows */}
      <div className="entry-table__body" role="rowgroup">
        {entries.length === 0 ? (
          <div className="entry-table__empty" role="row">
            <div className="empty-state">
              <span className="empty-state__icon" aria-hidden="true">🕐</span>
              <p className="empty-state__msg">No entries yet. Add your first check-in time below.</p>
            </div>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              rowNumber={idx + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* Add row button */}
      <div className="entry-table__footer">
        <button
          className="add-btn"
          onClick={onAdd}
          aria-label="Add a new time entry"
          id="add-entry-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Entry
        </button>
      </div>
    </section>
  );
}

export default EntryTable;
