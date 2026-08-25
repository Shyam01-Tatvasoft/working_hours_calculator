import React, { useState, useCallback } from 'react';
import { useTrackerSession } from './hooks/useTrackerSession';
import { useTheme } from './hooks/useTheme';
import { useTimerMs } from './hooks/useTimer';
import { calcTrackerSession } from './utils/timeCalculations';

import ActionButton from './components/ActionButton';
import LiveStats from './components/LiveStats';
import SettingsRow from './components/SettingsRow';
import BreakTimeline from './components/BreakTimeline';
import EditPanel from './components/EditPanel';
import HistoryView from './components/HistoryView';

function App() {
  const {
    session,
    history,
    status,
    activeBreak,
    errors,

    // Primary state actions
    startWork,
    startBreak,
    resumeWork,
    endWork,
    startNewDay,
    resetDay,

    // Config
    setRequiredHours,

    // Edit — today
    editWorkStart,
    editWorkEnd,
    addBreakManual,
    updateBreak,
    deleteBreak,

    // Edit — history
    editHistoryWorkStart,
    editHistoryWorkEnd,
    updateHistoryBreak,
    addHistoryBreak,
    deleteHistoryBreak,
    setHistoryRequiredHours,
    deleteHistoryEntry,
  } = useTrackerSession();

  const { theme, toggleTheme } = useTheme();
  
  // Timer returns Date.now() every second, driving live ticking updates
  const nowMs = useTimerMs();

  // Active calculations snapshot
  const stats = calcTrackerSession({ session, nowMs });

  const [showHistory, setShowHistory] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetDay = useCallback(() => {
    resetDay();
    setShowResetConfirm(false);
  }, [resetDay]);

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
            <h1 className="app__title">Time Tracker</h1>
            <p className="app__subtitle">Start Work · Start Break · Resume Work · End Work</p>
          </div>

          <div className="header-actions">
            {/* History Toggle Button */}
            <button
              className="header-btn"
              onClick={() => setShowHistory(true)}
              aria-label="View history"
              title="Work History"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              <span>History</span>
            </button>

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
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="app__main" id="main-content">
          
          {/* Tracking Stats Panel */}
          <LiveStats session={session} stats={stats} />

          {/* Primary State-Machine Button */}
          <ActionButton
            status={status}
            onStartWork={startWork}
            onStartBreak={startBreak}
            onResumeWork={resumeWork}
            onEndWork={endWork}
            onStartNewDay={startNewDay}
          />

          {/* Inline configuration for required hours */}
          <SettingsRow
            requiredHours={session.requiredHours}
            onChange={setRequiredHours}
          />

          {/* Timeline of breaks */}
          <BreakTimeline
            breaks={session.breaks}
            activeBreak={stats.activeBreak}
            activeBreakMs={stats.activeBreakMs}
          />

          {/* Collapsible edit records panel */}
          {status !== 'idle' && (
            <EditPanel
              session={session}
              errors={errors}
              onEditWorkStart={editWorkStart}
              onEditWorkEnd={editWorkEnd}
              onAddBreak={addBreakManual}
              onUpdateBreak={updateBreak}
              onDeleteBreak={deleteBreak}
            />
          )}

          {/* Reset Action */}
          {status !== 'idle' && (
            <div className="reset-bar">
              <button 
                className="reset-day-btn" 
                onClick={() => setShowResetConfirm(true)}
                aria-label="Wipe all data logged for today"
              >
                Reset Day
              </button>
            </div>
          )}
        </main>

        {/* ── Confirm dialog ── */}
        {showResetConfirm && (
          <div
            className="confirm-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="confirm-box">
              <p id="confirm-title" className="confirm-box__msg">
                Reset all data recorded for today? This cannot be undone.
              </p>
              <div className="confirm-box__actions">
                <button
                  className="action-btn action-btn--clear"
                  onClick={handleResetDay}
                  autoFocus
                >
                  Yes, Reset
                </button>
                <button
                  className="action-btn action-btn--reset"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── History Dialog ── */}
        {showHistory && (
          <HistoryView
            history={history}
            onClose={() => setShowHistory(false)}
            onEditWorkStart={editHistoryWorkStart}
            onEditWorkEnd={editHistoryWorkEnd}
            onUpdateBreak={updateHistoryBreak}
            onAddBreak={addHistoryBreak}
            onDeleteBreak={deleteHistoryBreak}
            onSetRequiredHours={setHistoryRequiredHours}
            onDeleteEntry={deleteHistoryEntry}
          />
        )}

        <footer className="app__footer">
          <p>Automatic saving · Timestamps logged in ISO · Live timer precision · Cross-midnight protected</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
