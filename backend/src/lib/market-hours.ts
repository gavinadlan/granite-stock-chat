// Regular trading sessions as data, evaluated in the exchange's own zone (handles US DST).
// TODO: holidays are not listed yet, so a holiday counts as open (shorter cache TTL, never wrong data).

export type Exchange = 'US' | 'IDX';

/** [start, end) in minutes after local midnight. */
type Session = [number, number];
const hm = (h: number, m = 0) => h * 60 + m;

interface Market {
  timeZone: string;
  /** Sessions per weekday, 0 = Sunday. Missing day = closed. */
  sessions: Partial<Record<number, Session[]>>;
}

const US_DAY: Session[] = [[hm(9, 30), hm(16)]];
// TODO(S1-04): verify IDX hours on idx.co.id; these are the regular sessions incl. pre-closing.
const IDX_MON_THU: Session[] = [[hm(9), hm(12)], [hm(13, 30), hm(16)]];
const IDX_FRI: Session[] = [[hm(9), hm(11, 30)], [hm(14), hm(16)]];

export const MARKETS: Record<Exchange, Market> = {
  US: { timeZone: 'America/New_York', sessions: { 1: US_DAY, 2: US_DAY, 3: US_DAY, 4: US_DAY, 5: US_DAY } },
  IDX: { timeZone: 'Asia/Jakarta', sessions: { 1: IDX_MON_THU, 2: IDX_MON_THU, 3: IDX_MON_THU, 4: IDX_MON_THU, 5: IDX_FRI } },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const formatters = new Map<string, Intl.DateTimeFormat>();

function localTime(timeZone: string, now: Date): { day: number; minutes: number } {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    formatters.set(timeZone, f);
  }
  const parts = Object.fromEntries(f.formatToParts(now).map((p) => [p.type, p.value]));
  return { day: WEEKDAYS.indexOf(parts.weekday), minutes: hm(Number(parts.hour), Number(parts.minute)) };
}

export function isMarketOpen(exchange: Exchange, now: Date = new Date()): boolean {
  const market = MARKETS[exchange];
  const { day, minutes } = localTime(market.timeZone, now);
  return (market.sessions[day] ?? []).some(([start, end]) => minutes >= start && minutes < end);
}

// Yahoo exchange codes for US listings and indices.
const US_CODES = new Set(['NMS', 'NGM', 'NCM', 'NYQ', 'ASE', 'PCX', 'BTS', 'NIM', 'SNP', 'DJI']);

/** Exchange of a quote from its symbol and Yahoo exchange code; null for markets we have no hours for. */
export function exchangeOf(symbol: string, code: string | null | undefined): Exchange | null {
  if (symbol.endsWith('.JK') || code === 'JKT') return 'IDX';
  return code && US_CODES.has(code) ? 'US' : null;
}
