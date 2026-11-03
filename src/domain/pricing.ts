import type { Money, ISODate, Quote, NightRate } from './types';
import { nightDates, isWeekendNight } from './dates';

const WEEKEND_MULTIPLIER = 1.25;
const VAT_RATE = 0.15;

export function buildQuote(baseRate: Money, checkIn: ISODate, checkOut: ISODate): Quote {
  const nights: NightRate[] = nightDates(checkIn, checkOut).map((date) => {
    const weekend = isWeekendNight(date);
    const rate = weekend ? Math.round(baseRate * WEEKEND_MULTIPLIER) : baseRate;
    return { date, rate, isWeekend: weekend };
  });

  const subtotal = nights.reduce((sum, n) => sum + n.rate, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  return { nights, subtotal, vat, total };
}
