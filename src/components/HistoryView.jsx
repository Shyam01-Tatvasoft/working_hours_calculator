import React, { useState } from 'react';
import TimeInput from './TimeInput';
import { 
  formatDateLabel, 
  formatTimeFromIso, 
  formatDurationMsShort, 
  calcTrackerSession,
  validateBreakIso
} from '../utils/timeCalculations';

function HistoryView({
  history,
  onClose,
  onEditWorkStart,
  onEditWorkEnd,
  onUpdateBreak,
  onAddBreak,
  onDeleteBreak,
  onSetRequiredHours,
  onDeleteEntry,
}) {
  const [expandedDate, setExpandedDate] = useState(null);

  const toggleExpand = (dateStr) => {
    setExpandedDate(expandedDate === dateStr ? null : dateStr);
  };

  return (
    <div className="history-overlay" role="dialog" aria-modal="true" aria-labelledby="history-title">
      <div className="history-modal card">
        <div className="history-modal__head card__head">
          <h2 id="history-title" className="card__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            Work History
          </h2>
          <button 
            className="history-modal__close-btn" 
            onClick={onClose} 
            aria-label="Close Work History"
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="history-modal__body">
          {history.length === 0 ? (
            <div className="history-empty">
              <p>No historical records saved yet.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((s) => {
                const stats = calcTrackerSession({ session: s, nowMs: Date.now() });
                const isExpanded = expandedDate === s.date;
                const startVal = formatTimeFromIso(s.workStart);
                const endVal = formatTimeFromIso(s.workEnd);

                // Run inline validation for breaks in this history entry
                const breakErrors = {};
                s.breaks.forEach((b) => {
                  const err = validateBreakIso(s.breaks, b);
                  if (err) breakErrors[b.id] = err;
                });

                return (
                  <div key={s.date} className={`history-item ${isExpanded ? 'history-item--expanded' : ''}`}>
                    <div 
                      className="history-item__header" 
                      onClick={() => toggleExpand(s.date)}
                      role="button"
                      aria-expanded={isExpanded}
                    >
                      <div className="history-item__title-group">
                        <span className="history-item__date">{formatDateLabel(s.date)}</span>
                        <div className="history-item__meta font-tabular">
                          <span className="history-item__meta-item">
                            Worked: <strong>{formatDurationMsShort(stats.workingMs)}</strong>
                          </span>
                          <span className="history-item__meta-item">
                            Break: <strong>{formatDurationMsShort(stats.totalBreakMs)}</strong>
                          </span>
                        </div>
                      </div>
                      
                      <div className="history-item__header-right">
                        <span className={`status-badge status-badge--small ${stats.hoursCompleted ? 'status--done' : 'status--idle'}`}>
                          {stats.hoursCompleted ? 'Completed' : 'Partial'}
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="history-expand-icon"
                          aria-hidden="true"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="history-item__content">
                        {/* Summary Details */}
                        <div className="history-summary-grid">
                          <div>Start: <strong>{startVal || '—'}</strong></div>
                          <div>End: <strong>{endVal || '—'}</strong></div>
                          <div>Required: <strong>{s.requiredHours}h</strong></div>
                        </div>

                        {/* Inline Editors */}
                        <div className="history-edit-box">
                          <h4 className="history-section-title">Edit Session Details</h4>
                          
                          <div className="edit-grid">
                            <div className="field-group">
                              <label className="field-label">Start Time</label>
                              <TimeInput
                                id={`hist-start-${s.date}`}
                                value={startVal}
                                onChange={(val) => onEditWorkStart(s.date, val)}
                                placeholder="HH:MM"
                                className="field-input"
                              />
                            </div>
                            <div className="field-group">
                              <label className="field-label">End Time</label>
                              <TimeInput
                                id={`hist-end-${s.date}`}
                                value={endVal}
                                onChange={(val) => onEditWorkEnd(s.date, val)}
                                placeholder="HH:MM"
                                className="field-input"
                              />
                            </div>
                          </div>

                          {/* Required Hours */}
                          <div className="field-group required-hours-edit">
                            <label className="field-label">Required Hours</label>
                            <input
                              type="number"
                              className="field-input"
                              value={s.requiredHours}
                              min="0.5"
                              max="24"
                              step="0.5"
                              onChange={(e) => onSetRequiredHours(s.date, e.target.value)}
                            />
                          </div>

                          {/* Historical Breaks list */}
                          <div className="edit-breaks-section">
                            <h5 className="edit-breaks-title">Breaks</h5>
                            
                            {s.breaks.length === 0 ? (
                              <p className="edit-breaks-empty">No breaks recorded.</p>
                            ) : (
                              <div className="edit-breaks-list">
                                {s.breaks.map((b, bIdx) => {
                                  const bStart = formatTimeFromIso(b.start);
                                  const bEnd = formatTimeFromIso(b.end);
                                  const error = breakErrors[b.id];
                                  
                                  // Cross midnight detector
                                  let isMidnight = false;
                                  if (b.start && b.end) {
                                    const st = new Date(b.start);
                                    const en = new Date(b.end);
                                    isMidnight = st.getDate() !== en.getDate();
                                  }

                                  return (
                                    <div key={b.id} className={`edit-break-row ${error ? 'edit-break-row--error' : ''}`}>
                                      <div className="edit-break-row__inputs">
                                        <span className="edit-break-row__num">{bIdx + 1}</span>
                                        <TimeInput
                                          id={`hist-break-start-${b.id}`}
                                          value={bStart}
                                          onChange={(val) => onUpdateBreak(s.date, b.id, 'start', val)}
                                          placeholder="HH:MM"
                                          className="break-time-input"
                                        />
                                        <span className="break-arrow" aria-hidden="true">&rarr;</span>
                                        <TimeInput
                                          id={`hist-break-end-${b.id}`}
                                          value={bEnd}
                                          onChange={(val) => onUpdateBreak(s.date, b.id, 'end', val)}
                                          placeholder="HH:MM"
                                          className="break-time-input"
                                        />
                                        {isMidnight && (
                                          <span className="break-midnight-badge" title="Ends next calendar day">+1d</span>
                                        )}
                                      </div>
                                      <button
                                        className="break-item__delete"
                                        onClick={() => onDeleteBreak(s.date, b.id)}
                                        aria-label="Delete break"
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
                              onClick={() => onAddBreak(s.date)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              Add Break Manually
                            </button>
                          </div>

                          {/* Delete Day Action */}
                          <div className="history-danger-zone">
                            <button
                              className="history-delete-btn"
                              onClick={() => {
                                if (window.confirm(`Delete record for ${s.date}? This cannot be undone.`)) {
                                  onDeleteEntry(s.date);
                                }
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              </svg>
                              Delete Day Record
                            </button>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryView;
