import { describe, expect, it } from 'vitest';
import { formatRelativeTime, formatWibDate, formatWibDateTime, formatWibTime, latestIso, startsTimeGroup } from './time';

const now = new Date('2026-11-25T12:00:00Z');

describe('formatRelativeTime', () => {
  it.each([
    ['2026-11-25T11:59:30Z', 'just now'],
    ['2026-11-25T11:45:00Z', '15 minutes ago'],
    ['2026-11-25T10:01:00Z', '1 hour ago'],
    ['2026-11-24T11:00:00Z', 'yesterday'],
    ['2026-10-01T12:00:00Z', 'last month'],
    ['2024-11-25T12:00:00Z', '2 years ago'],
  ])('%s -> %s', (iso, text) => {
    expect(formatRelativeTime(iso, now)).toBe(text);
  });

  it('returns null instead of inventing a time', () => {
    expect(formatRelativeTime('', now)).toBeNull();
    expect(formatRelativeTime('not a date', now)).toBeNull();
  });
});

describe('startsTimeGroup', () => {
  it('starts a group for the first message and after a 5 minute gap', () => {
    expect(startsTimeGroup(undefined, now)).toBe(true);
    expect(startsTimeGroup(new Date('2026-11-25T11:56:00Z'), now)).toBe(false);
    expect(startsTimeGroup(new Date('2026-11-25T11:55:00Z'), now)).toBe(true);
  });
});

describe('WIB time', () => {
  it('formats in Jakarta time', () => {
    expect(formatWibTime('2026-11-26T04:19:00Z')).toBe('11:19 WIB');
    expect(formatWibDateTime('2026-11-26T04:19:00Z')).toBe('Nov 26, 2026, 11:19 WIB');
    expect(formatWibTime('nope')).toBeNull();
    // 20:00 UTC is already the next day in Jakarta.
    expect(formatWibDate('2026-11-26T20:00:00Z')).toBe('Nov 27, 2026');
    expect(formatWibDate('nope')).toBeNull();
  });
  it('picks the latest valid timestamp', () => {
    expect(latestIso(['2026-11-26T02:00:00Z', null, 'bad', '2026-11-26T04:59:59Z'])).toBe('2026-11-26T04:59:59Z');
    expect(latestIso([undefined])).toBeNull();
  });
});
