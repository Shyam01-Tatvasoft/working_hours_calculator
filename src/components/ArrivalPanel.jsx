import React from 'react';

/**
 * ArrivalPanel — arrival time + required working hours configuration.
 */
function ArrivalPanel({ arrivalTime, onArrivalChange, requiredHours, onRequiredHoursChange }) {
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
      </div>

      <div className="arrival-panel__body">
        {/* Arrival Time */}
        <div className="field-group">
          <label className="field-label" htmlFor="arrival-time-input">
            Arrival Time
          </label>
          <input
            id="arrival-time-input"
            type="time"
            className="field-input"
            value={arrivalTime}
            onChange={(e) => onArrivalChange(e.target.value)}
            aria-label="Enter your arrival time"
          />
          {!arrivalTime && (
            <span className="field-hint">Set when you arrived at work</span>
          )}
        </div>

        {/* Required Working Hours */}
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
