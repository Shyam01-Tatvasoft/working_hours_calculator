import React from 'react';
import { useWorkingHours } from './hooks/useWorkingHours';
import { useTheme } from './hooks/useTheme';
import EntryTable from './components/EntryTable';
import SummaryPanel from './components/SummaryPanel';

function App() {
  const {
    entries,
    totals,
    addEntry,
    deleteEntry,
    updateEntry,
    clearAll,
    resetToDefault,
  } = useWorkingHours();

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app" id="app-root">
      {/* Background decoration */}
      <div className="app__bg-blob app__bg-blob--1" aria-hidden="true" />
      <div className="app__bg-blob app__bg-blob--2" aria-hidden="true" />

      <div className="app__container">
        {/* Header */}
        <header className="app__header">
          <div className="app__logo" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="app__title-group">
            <h1 className="app__title">Working Hours Calculator</h1>
            <p className="app__subtitle">Calculate your total office working hours</p>
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
                  /* Moon icon */
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  /* Sun icon */
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

        {/* Main content */}
        <main className="app__main" id="main-content">
          {/* Summary panel */}
          <SummaryPanel
            totals={totals}
            entries={entries}
            onClear={clearAll}
            onReset={resetToDefault}
          />

          {/* Entry table */}
          <div className="card">
            <div className="card__head">
              <h2 className="card__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                Time Entries
              </h2>
              <span className="card__badge">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            <EntryTable
              entries={entries}
              onAdd={addEntry}
              onUpdate={updateEntry}
              onDelete={deleteEntry}
            />
          </div>
        </main>

        <footer className="app__footer">
          <p>Entries are auto-saved to your browser • Cross-midnight sessions supported</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
