import React, { useState, useCallback } from 'react';
import { buildSummaryText, formatDuration } from '../utils/timeCalculations';
import SummaryCard from './SummaryCard';

/**
 * SummaryPanel - Shows calculated totals and action buttons.
 * Props: totals, entries, onClear, onReset
 */
function SummaryPanel({ totals, entries, onClear }) {
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = buildSummaryText({
      totalWork: totals.totalWork,
      totalBreak: totals.totalBreak,
      sessions: totals.sessions,
      entries,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [totals, entries]);

  const handleClearClick = () => setShowClearConfirm(true);
  const handleClearConfirm = () => {
    onClear();
    setShowClearConfirm(false);
  };
  const handleClearCancel = () => setShowClearConfirm(false);

  return (
    <section className="summary-panel" aria-label="Working hours summary">
      {/* Summary cards */}
      <div className="summary-cards">
        <SummaryCard
          icon="⏱️"
          label="Total Working Hours"
          value={formatDuration(totals.totalWork)}
          highlight
        />
        <SummaryCard
          icon="☕"
          label="Total Break"
          value={formatDuration(totals.totalBreak)}
        />
        <SummaryCard
          icon="✅"
          label="Completed Sessions"
          value={totals.sessions}
        />
        <SummaryCard
          icon="📋"
          label="Total Entries"
          value={entries.length}
        />
      </div>

      {/* Warnings */}
      {totals.warnings.length > 0 && (
        <div className="warnings-box" role="alert" aria-live="polite">
          <span className="warnings-box__icon" aria-hidden="true">⚠️</span>
          <ul className="warnings-box__list">
            {totals.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="summary-actions">
        <button
          className="action-btn action-btn--copy"
          onClick={handleCopy}
          aria-label="Copy summary to clipboard"
          disabled={entries.length === 0}
        >
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy Summary
            </>
          )}
        </button>



        <button
          className="action-btn action-btn--clear"
          onClick={handleClearClick}
          aria-label="Clear all entries"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
          Clear All
        </button>
      </div>

      {/* Confirm dialog */}
      {showClearConfirm && (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="confirm-box">
            <p id="confirm-title" className="confirm-box__msg">
              Are you sure you want to clear all entries? This cannot be undone.
            </p>
            <div className="confirm-box__actions">
              <button className="action-btn action-btn--clear" onClick={handleClearConfirm} autoFocus>
                Yes, Clear All
              </button>
              <button className="action-btn action-btn--reset" onClick={handleClearCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SummaryPanel;
