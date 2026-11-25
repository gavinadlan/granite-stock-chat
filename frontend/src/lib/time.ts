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
