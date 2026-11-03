import { describe, it, expect } from 'vitest';
import { buildQuote } from './pricing';

describe('buildQuote', () => {
  it('calculates weekday-only stay correctly', () => {
    // Mon 7 Dec 2026 → Tue 8 Dec 2026 (1 night, Monday)
    const quote = buildQuote(40000, '2026-12-07', '2026-12-08');
    expect(quote.nights).toHaveLength(1);
    expect(quote.nights[0].isWeekend).toBe(false);
    expect(quote.nights[0].rate).toBe(40000);
    expect(quote.subtotal).toBe(40000);
    expect(quote.vat).toBe(6000); // 15%
    expect(quote.total).toBe(46000);
  });

  it('applies +25% surcharge on Thursday night', () => {
    // Thu 10 Dec 2026 → Fri 11 Dec 2026 (1 night, Thursday)
    const quote = buildQuote(40000, '2026-12-10', '2026-12-11');
    expect(quote.nights[0].isWeekend).toBe(true);
    expect(quote.nights[0].rate).toBe(50000);
    expect(quote.subtotal).toBe(50000);
  });

  it('applies +25% surcharge on Friday night', () => {
    // Fri 11 Dec 2026 → Sat 12 Dec 2026 (1 night, Friday)
    const quote = buildQuote(40000, '2026-12-11', '2026-12-12');
    expect(quote.nights[0].isWeekend).toBe(true);
    expect(quote.nights[0].rate).toBe(50000);
  });

  it('matches the spec worked example (Wed–Sat, 3 nights)', () => {
    // Wed 9 Dec 2026 → Sat 12 Dec 2026
    // Wed: 40000, Thu: 50000, Fri: 50000
    const quote = buildQuote(40000, '2026-12-09', '2026-12-12');
    expect(quote.nights).toHaveLength(3);
    expect(quote.nights[0]).toEqual({ date: '2026-12-09', rate: 40000, isWeekend: false });
    expect(quote.nights[1]).toEqual({ date: '2026-12-10', rate: 50000, isWeekend: true });
    expect(quote.nights[2]).toEqual({ date: '2026-12-11', rate: 50000, isWeekend: true });
    expect(quote.subtotal).toBe(140000);
    expect(quote.vat).toBe(21000);
    expect(quote.total).toBe(161000);
  });

  it('rounds VAT to the nearest halala', () => {
    // 1 weekday night at 33333 halalas → subtotal 33333 → VAT 33333*0.15=4999.95 → rounds to 5000
    const quote = buildQuote(33333, '2026-12-07', '2026-12-08');
    expect(quote.vat).toBe(5000);
    expect(quote.total).toBe(33333 + 5000);
  });

  it('handles a stay that crosses a month end', () => {
    // Wed 30 Dec 2026 → Sat 2 Jan 2027 (3 nights: Wed, Thu, Fri)
    const quote = buildQuote(20000, '2026-12-30', '2027-01-02');
    expect(quote.nights).toHaveLength(3);
    expect(quote.nights[0]).toEqual({ date: '2026-12-30', rate: 20000, isWeekend: false });
    expect(quote.nights[1]).toEqual({ date: '2026-12-31', rate: 25000, isWeekend: true });
    expect(quote.nights[2]).toEqual({ date: '2027-01-01', rate: 25000, isWeekend: true });
    expect(quote.subtotal).toBe(70000);
  });

  it('handles a full week (7 nights, 2 weekend nights)', () => {
    // Sun 6 Dec 2026 → Sun 13 Dec 2026
    const quote = buildQuote(10000, '2026-12-06', '2026-12-13');
    expect(quote.nights).toHaveLength(7);
    const weekendNights = quote.nights.filter((n) => n.isWeekend);
    expect(weekendNights).toHaveLength(2); // Thu + Fri
    expect(quote.subtotal).toBe(5 * 10000 + 2 * 12500);
  });
});
