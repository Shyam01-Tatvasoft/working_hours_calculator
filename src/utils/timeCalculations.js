/**
 * Working Hours Calculator - Core Calculation Logic
 * All time is handled as minutes-from-midnight (0–1439).
 * Cross-midnight is supported: Out < In is treated as next-day Out.
 */

/**
 * Parse "HH:MM" string → minutes from midnight, or null if invalid.
 */
export function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Format minutes → "Xh Ym" or "Ym" or "0m".
 */
export function formatDuration(totalMinutes) {
  if (totalMinutes <= 0) return '0m';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format minutes → "Xh Ym" long form for display.
 */
export function formatDurationLong(totalMinutes) {
  if (totalMinutes <= 0) return '0 minutes';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const parts = [];
  if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} minute${m !== 1 ? 's' : ''}`);
  return parts.join(' ');
}

/**
 * Calculate duration between two minutes-from-midnight values.
 * Supports cross-midnight (outMin < inMin → add 1440).
 */
export function calcDuration(inMin, outMin) {
  if (outMin >= inMin) return outMin - inMin;
  return 1440 - inMin + outMin; // cross-midnight
}

/**
 * Main calculation engine.
 * @param {Array<{id, time, direction}>} entries - ordered list of time entries
 * @returns {{ totalWork, totalBreak, sessions, validPairs, warnings }}
 */
export function calculateTotals(entries) {
  const result = {
    totalWork: 0,
    totalBreak: 0,
    sessions: 0,
    validPairs: [],
    warnings: [],
  };

  // Filter entries that have a valid time
  const valid = entries
    .map((e, idx) => ({ ...e, idx, minutes: parseTime(e.time) }))
    .filter((e) => e.minutes !== null);

  if (valid.length === 0) return result;

  // Walk through valid entries and extract In→Out pairs
  let i = 0;
  let lastOutMin = null; // track for break calculation

  while (i < valid.length) {
    const cur = valid[i];

    if (cur.direction === 'In') {
      // Look ahead for matching Out
      if (i + 1 < valid.length && valid[i + 1].direction === 'Out') {
        const next = valid[i + 1];
        const work = calcDuration(cur.minutes, next.minutes);

        // Calculate break since last session
        if (lastOutMin !== null) {
          const brk = calcDuration(lastOutMin, cur.minutes);
          result.totalBreak += brk;
        }

        result.totalWork += work;
        result.sessions += 1;
        lastOutMin = next.minutes;

        result.validPairs.push({
          in: { entry: cur, time: cur.time },
          out: { entry: next, time: next.time },
          work,
        });

        i += 2;
      } else {
        // Incomplete session — skip
        result.warnings.push(`Entry at row ${cur.idx + 1} (${cur.time} In) has no matching Out.`);
        i += 1;
      }
    } else {
      // Out without preceding In
      result.warnings.push(`Entry at row ${cur.idx + 1} (${cur.time} Out) has no matching In.`);
      i += 1;
    }
  }

  return result;
}

/**
 * Get the suggested direction for a new row based on existing entries.
 */
export function suggestNextDirection(entries) {
  if (entries.length === 0) return 'In';
  // find last entry with a direction
  const last = [...entries].reverse().find((e) => e.direction);
  if (!last) return 'In';
  return last.direction === 'In' ? 'Out' : 'In';
}

/**
 * Generate a copy-to-clipboard summary string.
 */
export function buildSummaryText({ totalWork, totalBreak, sessions, entries }) {
  return [
    'Working Hours Summary',
    `Total Working Hours: ${formatDuration(totalWork)}`,
    `Total Break: ${formatDuration(totalBreak)}`,
    `Completed Sessions: ${sessions}`,
    `Entries: ${entries.length}`,
  ].join('\n');
}
