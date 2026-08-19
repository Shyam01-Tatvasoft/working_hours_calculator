import React from 'react';

/**
 * SummaryCard - Displays a single summary metric.
 * Props: icon, label, value, highlight (bool)
 */
export function SummaryCard({ icon, label, value, highlight = false }) {
  return (
    <div className={`summary-card ${highlight ? 'summary-card--highlight' : ''}`}>
      <div className="summary-card__icon" aria-hidden="true">{icon}</div>
      <div className="summary-card__body">
        <span className="summary-card__value">{value}</span>
        <span className="summary-card__label">{label}</span>
      </div>
    </div>
  );
}

export default SummaryCard;
