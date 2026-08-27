import React, { useState } from 'react';
import TimeInput from './TimeInput';
import { formatTimeFromIso } from '../utils/timeCalculations';

function EditPanel({
  session,
  errors,
  onEditWorkStart,
  onEditWorkEnd,
  onAddBreak,
  onUpdateBreak,
  onDeleteBreak,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const startVal = formatTimeFromIso(session.workStart);
  const endVal = formatTimeFromIso(session.workEnd);

  return (
    <div className={`edit-panel card ${isOpen ? 'edit-panel--open' : ''}`}>
      <button
        className="edit-panel__toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="edit-panel-content"
      >
        <span>Edit Today's Records</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="edit-panel__toggle-icon"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div id="edit-panel-content" className="edit-panel__content">
          {/* Work Hours Row */}
          <div className="edit-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="edit-work-start">
                Work Start Time
              </label>
              <TimeInput
                id="edit-work-start"
                value={startVal}
                onChange={onEditWorkStart}
                ariaLabel="Edit today's work start time"
                placeholder="HH:MM"
                className="field-input"
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="edit-work-end">
                Work End Time
              </label>
              <TimeInput
                id="edit-work-end"
                value={endVal}
                onChange={onEditWorkEnd}
                ariaLabel="Edit today's work end time"
                placeholder="HH:MM"
                className="field-input"
              />
            </div>
          </div>

          {/* Break List Setup */}
          <div className="edit-breaks-section">
            <h4 className="edit-breaks-title">Manage Breaks</h4>

            {session.breaks.length === 0 ? (
              <p className="edit-breaks-empty">No breaks recorded for today.</p>
            ) : (
              <div className="edit-breaks-list">
                {session.breaks.map((b, idx) => {
                  const bStart = formatTimeFromIso(b.start);
                  const bEnd = formatTimeFromIso(b.end);
                  const error = errors[b.id];

                  // Detect cross-midnight break for badge display
                  let isMidnight = false;
                  if (b.start && b.end) {
                    const s = new Date(b.start);
                    const e = new Date(b.end);
                    isMidnight = s.getDate() !== e.getDate();
                  }

                  return (
                    <div key={b.id} className={`edit-break-row ${error ? 'edit-break-row--error' : ''}`}>
                      <div className="edit-break-row__inputs">
                        <span className="edit-break-row__num">{idx + 1}</span>
                        
                        <TimeInput
                          id={`break-start-edit-${b.id}`}
                          value={bStart}
                          onChange={(val) => onUpdateBreak(b.id, 'start', val)}
                          ariaLabel={`Edit break ${idx + 1} start time`}
                          placeholder="HH:MM"
                          className="break-time-input"
                        />

                        <span className="break-arrow" aria-hidden="true">&rarr;</span>

                        <TimeInput
                          id={`break-end-edit-${b.id}`}
                          value={bEnd}
                          onChange={(val) => onUpdateBreak(b.id, 'end', val)}
                          ariaLabel={`Edit break ${idx + 1} end time`}
                          placeholder="HH:MM"
                          className="break-time-input"
                        />

                        {isMidnight && (
                          <span className="break-midnight-badge" title="Ends next calendar day">+1d</span>
                        )}
                      </div>

                      <button
                        className="break-item__delete"
                        onClick={() => onDeleteBreak(b.id)}
                        aria-label={`Delete break ${idx + 1}`}
                        title="Remove break"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>

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
                })}
              </div>
            )}

            <button
              className="add-manual-btn"
              onClick={onAddBreak}
              id="add-manual-break-btn"
              aria-label="Add a new empty break manually"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Break Manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditPanel;
