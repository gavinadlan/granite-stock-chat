const GROUP_GAP_MS = 5 * 60 * 1000;

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "2 hours ago"; null when the timestamp is missing or invalid. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const seconds = (then - now.getTime()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.trunc(seconds / size), unit);
  }
  return 'just now';
}

/** Chat shows one timestamp per burst of messages instead of one per message. */
export function startsTimeGroup(previous: Date | undefined, current: Date): boolean {
  return !previous || current.getTime() - previous.getTime() >= GROUP_GAP_MS;
}

const wibTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const wibDateTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Jakarta',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const wibDate = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', month: 'short', day: 'numeric', year: 'numeric' });

const valid = (iso: string) => !Number.isNaN(new Date(iso).getTime());

/** "11:19 WIB" (Jakarta time); null when invalid. */
export function formatWibTime(iso: string): string | null {
  return valid(iso) ? `${wibTime.format(new Date(iso))} WIB` : null;
}

/** "Nov 26, 2026, 11:19 WIB"; null when invalid. */
export function formatWibDateTime(iso: string): string | null {
  return valid(iso) ? `${wibDateTime.format(new Date(iso))} WIB` : null;
}

/** "Nov 26, 2026" (Jakarta date) for daily data, where the bar's open time means nothing to the reader; null when invalid. */
export function formatWibDate(iso: string): string | null {
  return valid(iso) ? wibDate.format(new Date(iso)) : null;
}

/** Most recent valid ISO timestamp, or null. */
export function latestIso(isos: (string | null | undefined)[]): string | null {
  let best: string | null = null;
  for (const iso of isos) {
    if (iso && valid(iso) && (!best || new Date(iso) > new Date(best))) best = iso;
  }
  return best;
}
