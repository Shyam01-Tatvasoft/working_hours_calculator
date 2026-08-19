import { useState, useEffect, useCallback } from 'react';
import { calculateTotals, suggestNextDirection } from '../utils/timeCalculations';

const STORAGE_KEY = 'working-hours-entries';

let _idCounter = 1;
const newId = () => `entry-${_idCounter++}`;

const DEFAULT_ENTRY = () => ({ id: newId(), time: '', direction: 'In' });

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function useWorkingHours() {
  const [entries, setEntries] = useState(() => {
    const stored = loadFromStorage();
    if (stored) {
      // bump id counter past stored entries
      stored.forEach((e) => {
        const n = parseInt(e.id?.replace('entry-', '') || '0', 10);
        if (n >= _idCounter) _idCounter = n + 1;
      });
      return stored;
    }
    return [DEFAULT_ENTRY()];
  });

  // Persist on every change
  useEffect(() => {
    saveToStorage(entries);
  }, [entries]);

  // Calculated totals
  const totals = calculateTotals(entries);

  const addEntry = useCallback(() => {
    setEntries((prev) => {
      const dir = suggestNextDirection(prev);
      return [...prev, { id: newId(), time: '', direction: dir }];
    });
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      return next.length === 0 ? [DEFAULT_ENTRY()] : next;
    });
  }, []);

  const updateEntry = useCallback((id, field, value) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }, []);

  const clearAll = useCallback(() => {
    setEntries([DEFAULT_ENTRY()]);
  }, []);

  const resetToDefault = useCallback(() => {
    // Sample demo data
    const demo = [
      { id: newId(), time: '09:44', direction: 'In' },
      { id: newId(), time: '10:07', direction: 'Out' },
      { id: newId(), time: '10:21', direction: 'In' },
      { id: newId(), time: '12:32', direction: 'Out' },
      { id: newId(), time: '12:58', direction: 'In' },
      { id: newId(), time: '18:34', direction: 'Out' },
    ];
    setEntries(demo);
  }, []);

  return {
    entries,
    totals,
    addEntry,
    deleteEntry,
    updateEntry,
    clearAll,
    resetToDefault,
  };
}
