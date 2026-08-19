/**
 * Working Hours Calculator — Core Utilities (v2)
 * Model: Arrival + Breaks → Live Working Time
 * All durations use seconds for live-update precision.
 */

// ── Parsing & Formatting ───────────────────────────────────────────────────

/** Parse "HH:MM" → minutes from midnight, or null if invalid. */
export function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Format total minutes → "Xh Ym" | "Ym" | "0m" */
export function formatDuration(totalMinutes) {
  if (totalMinutes <= 0) return '0m';
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Format total seconds → "Xh Ym Zs" for live display (tabular-nums friendly). */
export function formatDurationLive(totalSeconds) {
  if (totalSeconds <= 0) return '0s';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h === 0 && m === 0) return `${s}s`;
  if (h === 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${h}h ${m}m ${String(s).padStart(2, '0')}s`;
}

/** Format minutes-from-midnight → "HH:MM" string (wraps past midnight). */
export function formatTime(minutes) {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Duration Helpers ───────────────────────────────────────────────────────

/**
 * Duration between two seconds-from-midnight values.
 * Cross-midnight aware: if end < start, wraps around 86400.
 */
export function calcDurationSec(startSec, endSec) {
  if (endSec >= startSec) return endSec - startSec;
  return 86400 - startSec + endSec;
}

// ── Validation ─────────────────────────────────────────────────────────────

/**
 * Validate a break against the full break list.
 * Returns { valid: boolean, error: string | null }.
 * Incomplete breaks (no end) are always valid.
 */
export function validateBreak(breaks, breakObj) {
  const { id, start, end } = breakObj;

  if (!start) return { valid: false, error: 'Start time is required.' };

  const startMin = parseTime(start);
  if (startMin === null) return { valid: false, error: 'Invalid start time.' };

  // Incomplete break — no error
  if (!end) return { valid: true, error: null };

  const endMin = parseTime(end);
  if (endMin === null) return { valid: false, error: 'Invalid end time.' };
  if (endMin === startMin) return { valid: false, error: 'End must differ from start.' };
  if (endMin < startMin) return { valid: false, error: 'End time must be after start time.' };

  // Overlap check against other completed breaks
  const overlaps = breaks.some((b) => {
    if (b.id === id || !b.start || !b.end) return false;
    const bS = parseTime(b.start);
    const bE = parseTime(b.end);
    if (bS === null || bE === null) return false;
    return startMin < bE && endMin > bS;
  });
  if (overlaps) return { valid: false, error: 'This break overlaps with another.' };

  return { valid: true, error: null };
}

// ── Main Calculator ────────────────────────────────────────────────────────

/**
 * Calculate the full working session state.
 *
 * @param {object} p
 * @param {number|null} p.arrivalSec  - arrival time in seconds from midnight
 * @param {number}      p.requiredSec - required working time in seconds
 * @param {Array}       p.breaks      - [{id, start:"HH:MM", end:"HH:MM"|""}]
 * @param {number}      p.nowSec      - current time in seconds from midnight
 *
 * @returns {object} session snapshot
 */
export function calcSession({ arrivalSec, requiredSec, breaks, nowSec }) {
  if (arrivalSec === null) {
    return {
      elapsedSec: 0,
      completedBreakSec: 0,
      activeBreakSec: 0,
      totalBreakSec: 0,
      workingSec: 0,
      remainingSec: requiredSec,
      expectedCompletionMin: null,
      status: 'idle',
      activeBreak: null,
    };
  }

  // Total elapsed since arrival (cross-midnight aware)
  const elapsedSec = calcDurationSec(arrivalSec, nowSec);

  // Sum of all completed breaks (start + end both set, end > start)
  let completedBreakSec = 0;
  for (const b of breaks) {
    if (!b.start || !b.end) continue;
    const s = parseTime(b.start);
    const e = parseTime(b.end);
    if (s === null || e === null || e <= s) continue;
    completedBreakSec += (e - s) * 60;
  }

  // Detect active break: has start, no end, AND break has already started.
  // Uses cross-midnight-aware comparison: break "started" means the elapsed
  // time since arrival to break start is <= elapsed time since arrival to now.
  let activeBreak = null;
  let activeBreakSec = 0;

  for (const b of breaks) {
    if (!b.start || b.end) continue; // skip completed or empty
    const s = parseTime(b.start);
    if (s === null) continue;
    const breakStartSec = s * 60;
    const breakElapsedFromArrival = calcDurationSec(arrivalSec, breakStartSec);
    if (breakElapsedFromArrival <= elapsedSec) {
      // This break has started
      activeBreak = b;
      activeBreakSec = calcDurationSec(breakStartSec, nowSec);
      break; // only one active break at a time
    }
  }

  const totalBreakSec = completedBreakSec + activeBreakSec;
  const workingSec = Math.max(0, elapsedSec - totalBreakSec);
  const remainingSec = Math.max(0, requiredSec - workingSec);

  // Expected completion: arrival + required + all known break time
  const expectedCompletionMin = (arrivalSec + requiredSec + totalBreakSec) / 60;

  // Status
  let status = 'working';
  if (activeBreak) {
    status = 'on-break';
  } else if (workingSec >= requiredSec) {
    status = 'completed';
  }

  return {
    elapsedSec,
    completedBreakSec,
    activeBreakSec,
    totalBreakSec,
    workingSec,
    remainingSec,
    expectedCompletionMin,
    status,
    activeBreak,
  };
}

// ── Clipboard ──────────────────────────────────────────────────────────────

/** Build summary text for clipboard copy. */
export function buildSummaryText({
  arrivalTime,
  requiredHours,
  workingSec,
  remainingSec,
  completedBreakSec,
  status,
  expectedCompletionMin,
}) {
  const statusLabel =
    status === 'on-break' ? 'On Break' :
    status === 'completed' ? 'Completed ✓' :
    status === 'idle' ? 'Not Started' : 'Working';

  return [
    'Working Hours Summary',
    `Arrival: ${arrivalTime || '--:--'}`,
    `Required: ${requiredHours}h`,
    `Worked so far: ${formatDuration(Math.floor(workingSec / 60))}`,
    `Total Break: ${formatDuration(Math.floor(completedBreakSec / 60))}`,
    `Remaining: ${formatDuration(Math.floor(remainingSec / 60))}`,
    `Expected Completion: ${expectedCompletionMin !== null ? formatTime(expectedCompletionMin) : '--:--'}`,
    `Status: ${statusLabel}`,
  ].join('\n');
}
