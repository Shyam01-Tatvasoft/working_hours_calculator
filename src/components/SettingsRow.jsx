import React from 'react';

function SettingsRow({ requiredHours, onChange }) {
  const presets = [6, 7, 7.5, 8, 8.5, 9];

  return (
    <div className="settings-row card">
      <div className="settings-row__content">
        <label className="settings-row__label" htmlFor="settings-required-hours">
          Required Shift
        </label>
        
        <div className="settings-row__controls">
          <div className="required-input-row">
            <input
              id="settings-required-hours"
              type="number"
              className="field-input required-hours-field"
              value={requiredHours}
              min="0.5"
              max="24"
              step="0.5"
              onChange={(e) => onChange(e.target.value)}
              aria-label="Required daily hours"
            />
            <span className="required-input-suffix">hours</span>
          </div>

          <div className="hours-presets">
            {presets.map((h) => (
              <button
                key={h}
                className={`preset-btn ${requiredHours === h ? 'preset-btn--active' : ''}`}
                onClick={() => onChange(h)}
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

export default SettingsRow;
