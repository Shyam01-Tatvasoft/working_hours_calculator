import React from 'react';
import TimeInput from './TimeInput';

/**
 * ArrivalPanel — arrival time, optional end time, and required working hours.
 *
 * Two modes:
 *  • Live mode    — only arrival set; timer runs in real-time
 *  • Historical   — arrival + end time set; calculates a past day's hours
 */
function ArrivalPanel({
  arrivalTime, onArrivalChange,
  endTime,     onEndTimeChange,
  requiredHours, onRequiredHoursChange,
}) {
  const isHistorical = Boolean(endTime);

  return (
    <div className="arrival-panel card">
      <div className="card__head">
        <h2 className="card__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Session Setup
        </h2>
        {isHistorical && (
          <span className="mode-badge mode-badge--historical" title="Calculating a past day's hours">
            Historical
          </span>
        )}
      </div>

      <div className="arrival-panel__body">

        {/* ── Arrival Time ── */}
        <div className="field-group">
          <label className="field-label" htmlFor="arrival-time-input">
            Arrival Time
          </label>
          <TimeInput
            id="arrival-time-input"
            value={arrivalTime}
            onChange={onArrivalChange}
            ariaLabel="Enter your arrival time in 24-hour format"
            placeholder="HH:MM"
            className="field-input"
          />
          <span className="field-hint field-hint--format">
            24h format — e.g. 09:00, 14:30, 22:30
          </span>
        </div>

        {/* ── End Time (optional — enables historical mode) ── */}
        <div className="field-group">
          <label className="field-label" htmlFor="end-time-input">
            End Time
            <span className="field-label__optional"> (optional)</span>
          </label>
          <TimeInput
            id="end-time-input"
            value={endTime}
            onChange={onEndTimeChange}
            ariaLabel="Enter your departure / end time in 24-hour format (optional)"
            placeholder="HH:MM"
            className={`field-input${isHistorical ? ' field-input--active' : ''}`}
          />
          <span className="field-hint">
            {isHistorical
              ? '📋 Historical mode — showing totals for a completed day'
              : 'Set to calculate a past day\'s total working hours'}
          </span>
        </div>

        {/* ── Required Working Hours ── */}
        <div className="field-group">
          <label className="field-label" htmlFor="required-hours-input">
            Required Working Hours
          </label>
          <div className="required-input-row">
            <input
              id="required-hours-input"
              type="number"
              className="field-input required-hours-field"
              value={requiredHours}
              min="0.5"
              max="24"
              step="0.5"
              onChange={(e) => onRequiredHoursChange(e.target.value)}
              aria-label="Required working hours per day"
            />
            <span className="required-input-suffix">hours</span>
          </div>

          {/* Quick presets */}
          <div className="hours-presets">
            {[6, 7, 7.5, 8, 8.5, 9].map((h) => (
              <button
                key={h}
                className={`preset-btn ${requiredHours === h ? 'preset-btn--active' : ''}`}
                onClick={() => onRequiredHoursChange(h)}
                aria-label={`Set required hours to ${h}`}
                aria-pressed={requiredHours === h}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArrivalPanel;
