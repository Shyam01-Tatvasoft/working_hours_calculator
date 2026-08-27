/**
 * useTrackerSession — Personal work-time tracker state machine.
 *
 * Data model:
 *   session  { date, workStart, workEnd, breaks[], requiredHours }
 *   history  session[]   — archived past sessions, sorted newest-first
 *
 * All timestamps are ISO strings (e.g. "2026-08-25T04:00:00.000Z").
 * localStorage keys:   whc-tracker-v1
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getLocalDateStr,
  hmToIsoForDate,
  validateBreakIso,
} from '../utils/timeCalculations';

const STORAGE_KEY = 'whc-tracker-v1';

// ── Helpers ────────────────────────────────────────────────────────────────

let _bc = Date.now();
function newBreakId() { return `b-${++_bc}`; }

function createFreshSession(date, requiredHours = 8.5) {
  return { date, workStart: null, workEnd: null, breaks: [], requiredHours };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useTrackerSession() {
  // ── Initialise (lazy) ────────────────────────────────────────────────────
  const [session, setSession] = useState(() => {
    const saved = load();
    const today = getLocalDateStr();

    if (saved?.today?.date === today) {
      // Restore today's session exactly as stored
      return saved.today;
    }

    // Previous day's session — return fresh (auto-archive handled below)
    return createFreshSession(today, saved?.today?.requiredHours ?? 8.5);
  });

  const [history, setHistory] = useState(() => {
    const saved = load();
    const today = getLocalDateStr();
    let hist = Array.isArray(saved?.history) ? saved.history : [];

    // Auto-archive a previous day's session that had work started
    if (
      saved?.today?.date &&
      saved.today.date !== today &&
      saved.today.workStart
    ) {
      hist = [saved.today, ...hist.filter(h => h.date !== saved.today.date)];
    }

    return hist;
  });

  const [errors, setErrors] = useState({});

  // ── Persist ──────────────────────────────────────────────────────────────
  useEffect(() => {
    save({ today: session, history });
  }, [session, history]);

  // ── Validate breaks ──────────────────────────────────────────────────────
  useEffect(() => {
    const errs = {};
    session.breaks.forEach(b => {
      const err = validateBreakIso(session.breaks, b);
      if (err) errs[b.id] = err;
    });
    setErrors(errs);
  }, [session.breaks]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeBreak = session.breaks.find(b => b.start && !b.end) ?? null;

  const status =
    !session.workStart ? 'idle' :
    session.workEnd    ? 'completed' :
    activeBreak        ? 'on-break' :
                         'working';

  // ── Primary actions ──────────────────────────────────────────────────────

  const startWork = useCallback(() => {
    setSession(s => ({ ...s, workStart: new Date().toISOString() }));
  }, []);

  const startBreak = useCallback(() => {
    const id = newBreakId();
    setSession(s => ({
      ...s,
      breaks: [...s.breaks, { id, start: new Date().toISOString(), end: null }],
    }));
  }, []);

  const resumeWork = useCallback(() => {
    const now = new Date().toISOString();
    setSession(s => ({
      ...s,
      breaks: s.breaks.map(b => (!b.end ? { ...b, end: now } : b)),
    }));
  }, []);

  const endWork = useCallback(() => {
    const now = new Date().toISOString();
    setSession(s => {
      // Close any open break before ending
      const closed = s.breaks.map(b => (!b.end ? { ...b, end: now } : b));
      return { ...s, breaks: closed, workEnd: now };
    });
  }, []);

  /**
   * Archive today's completed session to history and start a fresh session.
   * Called from "Start New Day" button (completed state).
   */
  const startNewDay = useCallback(() => {
    const today = getLocalDateStr();
    setSession(s => {
      if (s.workStart) {
        setHistory(h => [s, ...h.filter(d => d.date !== s.date)]);
      }
      return createFreshSession(today, s.requiredHours);
    });
  }, []);

  /**
   * Reset today without archiving (wipe current session).
   */
  const resetDay = useCallback(() => {
    setSession(s => createFreshSession(getLocalDateStr(), s.requiredHours));
  }, []);

  // ── Required hours ───────────────────────────────────────────────────────

  const setRequiredHours = useCallback((n) => {
    const val = parseFloat(n);
    if (isNaN(val)) return;
    setSession(s => ({ ...s, requiredHours: Math.max(0.5, Math.min(24, val)) }));
  }, []);

  // ── Edit: today's session ────────────────────────────────────────────────

  const editWorkStart = useCallback((hmStr) => {
    setSession(s => ({
      ...s,
      workStart: hmStr ? hmToIsoForDate(s.date, hmStr, null) : null,
    }));
  }, []);

  const editWorkEnd = useCallback((hmStr) => {
    setSession(s => ({
      ...s,
      workEnd: hmStr ? hmToIsoForDate(s.date, hmStr, s.workStart) : null,
    }));
  }, []);

  const addBreakManual = useCallback(() => {
    const id = newBreakId();
    setSession(s => ({
      ...s,
      breaks: [...s.breaks, { id, start: null, end: null }],
    }));
  }, []);

  const updateBreak = useCallback((id, field, hmStr) => {
    setSession(s => {
      const b = s.breaks.find(b => b.id === id);
      if (!b) return s;
      // Use workStart as cross-midnight ref for break starts,
      // break.start as ref for break ends.
      const ref = field === 'end' ? b.start : s.workStart;
      const iso = hmStr ? hmToIsoForDate(s.date, hmStr, ref) : null;
      return {
        ...s,
        breaks: s.breaks.map(b => b.id === id ? { ...b, [field]: iso } : b),
      };
    });
  }, []);

  const deleteBreak = useCallback((id) => {
    setSession(s => ({ ...s, breaks: s.breaks.filter(b => b.id !== id) }));
  }, []);

  // ── Edit: history sessions ───────────────────────────────────────────────

  const editHistoryWorkStart = useCallback((date, hmStr) => {
    setHistory(h => h.map(s => {
      if (s.date !== date) return s;
      return { ...s, workStart: hmStr ? hmToIsoForDate(s.date, hmStr, null) : null };
    }));
  }, []);

  const editHistoryWorkEnd = useCallback((date, hmStr) => {
    setHistory(h => h.map(s => {
      if (s.date !== date) return s;
      return { ...s, workEnd: hmStr ? hmToIsoForDate(s.date, hmStr, s.workStart) : null };
    }));
  }, []);

  const updateHistoryBreak = useCallback((date, id, field, hmStr) => {
    setHistory(h => h.map(s => {
      if (s.date !== date) return s;
      const b = s.breaks.find(b => b.id === id);
      if (!b) return s;
      const ref = field === 'end' ? b.start : s.workStart;
      const iso = hmStr ? hmToIsoForDate(s.date, hmStr, ref) : null;
      return {
        ...s,
        breaks: s.breaks.map(b => b.id === id ? { ...b, [field]: iso } : b),
      };
    }));
  }, []);

  const addHistoryBreak = useCallback((date) => {
    const id = newBreakId();
    setHistory(h => h.map(s =>
      s.date === date
        ? { ...s, breaks: [...s.breaks, { id, start: null, end: null }] }
        : s
    ));
  }, []);

  const deleteHistoryBreak = useCallback((date, id) => {
    setHistory(h => h.map(s =>
      s.date === date
        ? { ...s, breaks: s.breaks.filter(b => b.id !== id) }
        : s
    ));
  }, []);

  const setHistoryRequiredHours = useCallback((date, n) => {
    const val = parseFloat(n);
    if (isNaN(val)) return;
    setHistory(h => h.map(s =>
      s.date === date
        ? { ...s, requiredHours: Math.max(0.5, Math.min(24, val)) }
        : s
    ));
  }, []);

  const deleteHistoryEntry = useCallback((date) => {
    setHistory(h => h.filter(s => s.date !== date));
  }, []);

  return {
    // State
    session,
    history,
    status,
    activeBreak,
    errors,

    // Primary actions
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
  };
}
