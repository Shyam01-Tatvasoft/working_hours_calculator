/**
 * Working Hours Calculator — Core Utilities (v3)
 * Model: Arrival + optional EndTime + Breaks → Live or Historical Working Time
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

/** Format total seconds → "Xh Ym Zs" for live display. */
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
 * Returns true when a break end time is on the next calendar day.
 * A break is cross-midnight when endMin < startMin (e.g. 23:55 → 00:35).
 */
export function isCrossMidnight(startMin, endMin) {
  return endMin < startMin;
}

/**
 * Normalise a break's end to an absolute-minute value > startMin.
 * For same-day breaks returns endMin unchanged.
 * For cross-midnight breaks adds 1440 (one day) so arithmetic stays linear.
 */
function normaliseBreakEnd(startMin, endMin) {
  return endMin < startMin ? endMin + 1440 : endMin;
}

/**
 * Check whether two possibly-cross-midnight break ranges overlap.
 * All times are expressed in minutes from midnight.
 */
function breaksOverlap(aS, aE, bS, bE) {
  const aEnd = normaliseBreakEnd(aS, aE);
  const bEnd = normaliseBreakEnd(bS, bE);
  const check = (bs, be) => aS < be && aEnd > bs;
  return check(bS, bEnd) || check(bS - 1440, bEnd - 1440) || check(bS + 1440, bEnd + 1440);
}

/**
 * Validate a break against the full break list.
 * Returns { valid: boolean, error: string | null }.
 * Incomplete breaks (no end) are always considered valid.
 * Cross-midnight breaks (end < start, e.g. 23:55 → 00:35) ARE supported.
 */
export function validateBreak(breaks, breakObj) {
  const { id, start, end } = breakObj;

  if (!start) return { valid: false, error: 'Start time is required.' };

  const startMin = parseTime(start);
  if (startMin === null) return { valid: false, error: 'Invalid start time.' };

  // Incomplete break — no error yet
  if (!end) return { valid: true, error: null };

  const endMin = parseTime(end);
  if (endMin === null) return { valid: false, error: 'Invalid end time.' };
  if (endMin === startMin) return { valid: false, error: 'End must differ from start.' };
  // ✅ endMin < startMin is allowed — treated as a cross-midnight break

  // Overlap check against other completed breaks
  const overlaps = breaks.some((b) => {
    if (b.id === id || !b.start || !b.end) return false;
    const bS = parseTime(b.start);
    const bE = parseTime(b.end);
    if (bS === null || bE === null) return false;
    return breaksOverlap(startMin, endMin, bS, bE);
  });
  if (overlaps) return { valid: false, error: 'This break overlaps with another.' };

  return { valid: true, error: null };
}

// ── Break Duration Helper ──────────────────────────────────────────────────

/**
 * Sum completed break durations in seconds.
 * Supports cross-midnight breaks (end < start → end + 1440 min).
 */
function sumCompletedBreaksSec(breaks) {
  let total = 0;
  for (const b of breaks) {
    if (!b.start || !b.end) continue;
    const s = parseTime(b.start);
    const e = parseTime(b.end);
    if (s === null || e === null || e === s) continue;
    const durationMin = e < s ? (e + 1440 - s) : (e - s);
    total += durationMin * 60;
  }
  return total;
}

// ── Main Calculator ────────────────────────────────────────────────────────

/**
 * Calculate the full working session state.
 *
 * @param {object} p
 * @param {number|null} p.arrivalSec   - arrival time in seconds from midnight (null = not set)
 * @param {number}      p.requiredSec  - required working time in seconds
 * @param {Array}       p.breaks       - [{id, start:"HH:MM", end:"HH:MM"|""}]
 * @param {number}      p.nowSec       - current time in seconds from midnight (live mode)
 * @param {number|null} [p.endSec]     - departure time in seconds (historical mode when set)
 *
 * @returns {object} session snapshot with:
 *   elapsedSec, completedBreakSec, activeBreakSec, totalBreakSec,
 *   workingSec, remainingSec, expectedCompletionMin,
 *   expectedCompletionNextDay {boolean},
 *   status, activeBreak, isHistorical {boolean}
 */
export function calcSession({ arrivalSec, requiredSec, breaks, nowSec, endSec = null }) {
  const isHistorical = endSec !== null;

  if (arrivalSec === null) {
    return {
      elapsedSec: 0,
      completedBreakSec: 0,
      activeBreakSec: 0,
      totalBreakSec: 0,
      workingSec: 0,
      remainingSec: requiredSec,
      expectedCompletionMin: null,
      expectedCompletionNextDay: false,
      status: 'idle',
      activeBreak: null,
      isHistorical,
    };
  }

  // Reference point: endSec (historical) or nowSec (live)
  const refSec = isHistorical ? endSec : nowSec;

  // Total elapsed since arrival (cross-midnight aware)
  const elapsedSec = calcDurationSec(arrivalSec, refSec);

  // Sum all completed breaks
  const completedBreakSec = sumCompletedBreaksSec(breaks);

  // Detect active break (only in live mode)
  let activeBreak = null;
  let activeBreakSec = 0;

  if (!isHistorical) {
    for (const b of breaks) {
      if (!b.start || b.end) continue; // skip completed or empty
      const s = parseTime(b.start);
      if (s === null) continue;
      const breakStartSec = s * 60;
      const breakElapsedFromArrival = calcDurationSec(arrivalSec, breakStartSec);
      if (breakElapsedFromArrival <= elapsedSec) {
        activeBreak = b;
        activeBreakSec = calcDurationSec(breakStartSec, refSec);
        break; // only one active break at a time
      }
    }
  }

  const totalBreakSec = completedBreakSec + activeBreakSec;
  const workingSec = Math.max(0, elapsedSec - totalBreakSec);
  const remainingSec = Math.max(0, requiredSec - workingSec);

  // Expected completion: arrival + required + all known break time
  // (only meaningful in live mode — in historical mode we know the actual end)
  let expectedCompletionMin = null;
  let expectedCompletionNextDay = false;

  if (!isHistorical) {
    // Use only completed breaks for expected completion (active break end is unknown)
    const knownBreakSec = completedBreakSec;
    expectedCompletionMin = (arrivalSec + requiredSec + knownBreakSec) / 60;
    // >= 1440 means the expected end is tomorrow (next calendar day from arrival)
    expectedCompletionNextDay = expectedCompletionMin >= 1440;
  }

  // Status
  let status;
  if (isHistorical) {
    status = 'historical';
  } else if (activeBreak) {
    status = 'on-break';
  } else if (workingSec >= requiredSec) {
    status = 'completed';
  } else {
    status = 'working';
  }

  return {
    elapsedSec,
    completedBreakSec,
    activeBreakSec,
    totalBreakSec,
    workingSec,
    remainingSec,
    expectedCompletionMin,
    expectedCompletionNextDay,
    status,
    activeBreak,
    isHistorical,
  };
}

// ── Clipboard ──────────────────────────────────────────────────────────────

/** Build summary text for clipboard copy. */
export function buildSummaryText({
  arrivalTime,
  endTime,
  requiredHours,
  workingSec,
  remainingSec,
  completedBreakSec,
  status,
  expectedCompletionMin,
  expectedCompletionNextDay,
  isHistorical,
}) {
  const statusLabel =
    status === 'on-break'   ? 'On Break' :
    status === 'completed'  ? 'Completed ✓' :
    status === 'historical' ? 'Historical Record' :
    status === 'idle'       ? 'Not Started' : 'Working';

  const expectedEnd = expectedCompletionMin !== null
    ? formatTime(expectedCompletionMin) + (expectedCompletionNextDay ? ' (+next day)' : '')
    : endTime || '--:--';

  const lines = [
    'Working Hours Summary',
    `Arrival:   ${arrivalTime || '--:--'}`,
  ];

  if (isHistorical && endTime) {
    lines.push(`End Time:  ${endTime}`);
  }

  lines.push(
    `Required:  ${requiredHours}h`,
    `Worked:    ${formatDuration(Math.floor(workingSec / 60))}`,
    `Break:     ${formatDuration(Math.floor(completedBreakSec / 60))}`,
  );

  if (!isHistorical) {
    lines.push(
      `Remaining: ${formatDuration(Math.floor(remainingSec / 60))}`,
      `Expected End: ${expectedEnd}`,
    );
  }

  lines.push(`Status:    ${statusLabel}`);

  return lines.join('\n');
}
