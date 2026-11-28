import { describe, expect, it } from 'vitest';
import { exchangeOf, isMarketOpen } from '../src/lib/market-hours';

const at = (iso: string) => new Date(iso);

describe('isMarketOpen US (America/New_York)', () => {
  it.each([
    // Winter (EST, UTC-5): 09:30 local = 14:30Z.
    ['2026-01-15T14:29:00Z', false], // 09:29 before the open
    ['2026-01-15T14:30:00Z', true], // 09:30 open
    ['2026-01-15T20:59:00Z', true], // 15:59
    ['2026-01-15T21:00:00Z', false], // 16:00 close
    // Summer (EDT, UTC-4): 09:30 local = 13:30Z.
    ['2026-07-15T13:30:00Z', true],
    ['2026-07-15T14:29:00Z', true], // would be 09:29 in EST: DST must be applied
    ['2026-07-15T20:00:00Z', false], // 16:00 EDT
    // DST starts Sun 2026-03-08; Monday opens at 13:30Z.
    ['2026-03-09T13:30:00Z', true],
    ['2026-03-06T14:29:00Z', false], // Friday before, still EST
    // Weekend.
    ['2026-01-17T15:00:00Z', false], // Saturday
    ['2026-01-18T15:00:00Z', false], // Sunday
  ])('%s -> %s', (iso, open) => expect(isMarketOpen('US', at(iso))).toBe(open));
});

describe('isMarketOpen IDX (Asia/Jakarta, UTC+7)', () => {
  it.each([
    ['2026-11-26T01:59:00Z', false], // Thu 08:59
    ['2026-11-26T02:00:00Z', true], // Thu 09:00
    ['2026-11-26T05:00:00Z', false], // Thu 12:00 lunch break
    ['2026-11-26T06:30:00Z', true], // Thu 13:30 second session
    ['2026-11-26T09:00:00Z', false], // Thu 16:00 close
    ['2026-11-27T04:30:00Z', false], // Fri 11:30 longer Friday break
    ['2026-11-27T06:59:00Z', false], // Fri 13:59
    ['2026-11-27T07:00:00Z', true], // Fri 14:00
    ['2026-11-28T03:00:00Z', false], // Saturday
    ['2026-11-29T20:00:00Z', false], // Mon 03:00 local, Sunday in UTC
  ])('%s -> %s', (iso, open) => expect(isMarketOpen('IDX', at(iso))).toBe(open));
});

describe('exchangeOf', () => {
  it.each([
    ['AAPL', 'NMS', 'US'], ['IBM', 'NYQ', 'US'], ['^GSPC', 'SNP', 'US'],
    ['BBCA.JK', 'JKT', 'IDX'], ['^JKSE', 'JKT', 'IDX'], ['BBCA.JK', null, 'IDX'],
    ['EURUSD=X', 'CCY', null], ['7203.T', 'JPX', null], ['X', null, null],
  ])('%s on %s -> %s', (symbol, code, ex) => expect(exchangeOf(symbol, code)).toBe(ex));
});
