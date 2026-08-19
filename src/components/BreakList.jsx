import React from 'react';
import BreakRow from './BreakRow';
import { MealBreakIcon } from './icons/MealBreakIcon';

/**
 * BreakList — manages the list of break entries.
 * Props: breaks, errors, activeBreak, onAdd, onUpdate, onDelete
 */
function BreakList({ breaks, errors, activeBreak, onAdd, onUpdate, onDelete }) {
  return (
    <div className="break-list card">
      <div className="card__head">
        <h2 className="card__title">
          <MealBreakIcon size={30} />
          Breaks
        </h2>
        {breaks.length > 0 && (
          <span className="card__badge">
            {breaks.length} {breaks.length === 1 ? 'break' : 'breaks'}
          </span>
        )}
      </div>

      {/* Break rows */}
      <div className="break-list__body" role="list" aria-label="Break entries">
        {breaks.length === 0 ? (
          <div className="break-list__empty">
            <MealBreakIcon size={48} style={{ opacity: 0.5 }} />
            <p>No breaks added yet.<br />Click <strong>Add Break</strong> to record a break.</p>
          </div>
        ) : (
          breaks.map((b, idx) => (
            <BreakRow
              key={b.id}
              breakObj={b}
              rowNumber={idx + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              error={errors[b.id] || null}
              isActive={activeBreak?.id === b.id}
            />
          ))
        )}
      </div>

      {/* Add break button */}
      <div className="break-list__footer">
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
      </div>
    </div>
  );
}

export default BreakList;
