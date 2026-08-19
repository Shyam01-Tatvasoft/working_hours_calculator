import { useState, useEffect, useCallback } from 'react';
import { parseTime, validateBreak } from '../utils/timeCalculations';

const STORAGE_KEY = 'whc-session-v2';

let _idCounter = 1;
const newId = () => `break-${_idCounter++}`;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Bump id counter past any stored break ids
    if (Array.isArray(parsed.breaks)) {
      parsed.breaks.forEach((b) => {
        const n = parseInt(b.id?.replace('break-', '') || '0', 10);
        if (n >= _idCounter) _idCounter = n + 1;
      });
    }
    return parsed;
  } catch {
    return null;
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function useWorkingSession() {
  // Initialize directly from localStorage (lazy initializer — runs once, immune to StrictMode)
  const [arrivalTime, setArrivalTimeRaw] = useState(() => {
    const s = load();
    return s?.arrivalTime || '';
  });
  const [requiredHours, setRequiredHoursRaw] = useState(() => {
    const s = load();
    return typeof s?.requiredHours === 'number' ? s.requiredHours : 8;
  });
  const [breaks, setBreaks] = useState(() => {
    const s = load();
    if (Array.isArray(s?.breaks)) {
      s.breaks.forEach((b) => {
        const n = parseInt(b.id?.replace('break-', '') || '0', 10);
        if (n >= _idCounter) _idCounter = n + 1;
      });
      return s.breaks;
    }
    return [];
  });

  // Errors are derived reactively from the break list
  const [errors, setErrors] = useState({});

  // Persist on every state change
  useEffect(() => {
    save({ arrivalTime, requiredHours, breaks });
  }, [arrivalTime, requiredHours, breaks]);

  // Re-validate breaks whenever the list changes
  useEffect(() => {
    const newErrors = {};
    breaks.forEach((b) => {
      // Only validate if at least start is filled
      if (!b.start) return;
      const result = validateBreak(breaks, b);
      if (!result.valid) newErrors[b.id] = result.error;
    });
    setErrors(newErrors);
  }, [breaks]);

  // ── Setters ──────────────────────────────────────────────────────────────

  const setArrivalTime = useCallback((t) => setArrivalTimeRaw(t), []);

  const setRequiredHours = useCallback((val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return;
    setRequiredHoursRaw(Math.max(0.5, Math.min(24, n)));
  }, []);

  // ── Break CRUD ────────────────────────────────────────────────────────────

  const addBreak = useCallback(() => {
    setBreaks((prev) => [...prev, { id: newId(), start: '', end: '' }]);
  }, []);

  const updateBreak = useCallback((id, field, value) => {
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  }, []);

  const deleteBreak = useCallback((id) => {
    setBreaks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setArrivalTimeRaw('');
    setRequiredHoursRaw(8);
    setBreaks([]);
    setErrors({});
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const arrivalMin = parseTime(arrivalTime);
  const arrivalSec = arrivalMin !== null ? arrivalMin * 60 : null;
  const requiredSec = Math.round(requiredHours * 3600);

  return {
    arrivalTime,
    setArrivalTime,
    requiredHours,
    setRequiredHours,
    breaks,
    errors,
    addBreak,
    updateBreak,
    deleteBreak,
    clearAll,
    arrivalSec,
    requiredSec,
  };
}
