import React, { useState, useCallback } from 'react';
import { useWorkingSession } from './hooks/useWorkingSession';
import { useTheme } from './hooks/useTheme';
import { useTimer } from './hooks/useTimer';
import { calcSession, buildSummaryText } from './utils/timeCalculations';
import LiveDashboard from './components/LiveDashboard';
import ArrivalPanel from './components/ArrivalPanel';
import BreakList from './components/BreakList';

function App() {
  const {
    arrivalTime, setArrivalTime,
    endTime,     setEndTime,
    requiredHours, setRequiredHours,
    breaks, errors,
    addBreak, updateBreak, deleteBreak,
    clearAll,
    arrivalSec, endSec, requiredSec,
  } = useWorkingSession();

  const { theme, toggleTheme } = useTheme();
  const nowSec = useTimer();

  // Calculate full session state every render (driven by 1s timer in live mode)
  const session = calcSession({ arrivalSec, requiredSec, breaks, nowSec, endSec });

  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = buildSummaryText({
      arrivalTime,
      endTime,
      requiredHours,
      workingSec: session.workingSec,
      remainingSec: session.remainingSec,
      completedBreakSec: session.completedBreakSec,
      status: session.status,
      expectedCompletionMin: session.expectedCompletionMin,
      expectedCompletionNextDay: session.expectedCompletionNextDay,
      isHistorical: session.isHistorical,
    });
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [arrivalTime, requiredHours, session]);

  return (
    <div className="app" id="app-root">
      {/* Ambient background blobs */}
      <div className="app__bg-blob app__bg-blob--1" aria-hidden="true" />
      <div className="app__bg-blob app__bg-blob--2" aria-hidden="true" />

      <div className="app__container">
        {/* ── Header ── */}
        <header className="app__header">
          <div className="app__logo" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <div className="app__title-group">
            <h1 className="app__title">Working Hours Calculator</h1>
            <p className="app__subtitle">Arrival · Breaks · Live tracking · Historical day review</p>
          </div>

          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            id="theme-toggle-btn"
          >
            <span className="theme-toggle__track">
              <span className="theme-toggle__thumb">
                {theme === 'dark' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </span>
            </span>
          </button>
        </header>

        {/* ── Main content ── */}
        <main className="app__main" id="main-content">
          {/* Live hero panel */}
          <LiveDashboard session={session} endTime={endTime} requiredSec={requiredSec} />

          {/* Config grid: arrival + breaks */}
          <div className="config-grid">
            <ArrivalPanel
              arrivalTime={arrivalTime}
              onArrivalChange={setArrivalTime}
              endTime={endTime}
              onEndTimeChange={setEndTime}
              requiredHours={requiredHours}
              onRequiredHoursChange={setRequiredHours}
            />

            <BreakList
              breaks={breaks}
              errors={errors}
              activeBreak={session.activeBreak}
              onAdd={addBreak}
              onUpdate={updateBreak}
              onDelete={deleteBreak}
            />
          </div>

          {/* Actions bar */}
          <div className="actions-bar">
            <button
              className="action-btn action-btn--copy"
              onClick={handleCopy}
              disabled={!arrivalTime}
              aria-label="Copy summary to clipboard"
            >
              {copied ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Summary
                </>
              )}
            </button>

            <button
              className="action-btn action-btn--clear"
              onClick={() => setShowClearConfirm(true)}
              aria-label="Clear all data"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Clear All
            </button>
          </div>
        </main>

        {/* ── Confirm dialog ── */}
        {showClearConfirm && (
          <div
            className="confirm-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="confirm-box">
              <p id="confirm-title" className="confirm-box__msg">
                Clear all data? Arrival, required hours and all breaks will be reset.
              </p>
              <div className="confirm-box__actions">
                <button
                  className="action-btn action-btn--clear"
                  onClick={() => { clearAll(); setShowClearConfirm(false); }}
                  autoFocus
                >
                  Yes, Clear All
                </button>
                <button
                  className="action-btn action-btn--reset"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="app__footer">
          <p>Data auto-saved · Live timer every second · Cross-midnight supported · Set End Time for historical review</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
