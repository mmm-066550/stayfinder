import type { ISODate } from './types';

export function parseDate(date: ISODate): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: Date): ISODate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isWeekendNight(date: ISODate): boolean {
  const day = parseDate(date).getDay();
  return day === 4 || day === 5; // Thursday or Friday (Gulf weekend)
}

export function nightDates(checkIn: ISODate, checkOut: ISODate): ISODate[] {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  const dates: ISODate[] = [];
  const current = new Date(start);
  while (current < end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function nightCount(checkIn: ISODate, checkOut: ISODate): number {
  return nightDates(checkIn, checkOut).length;
}

export function todayISO(): ISODate {
  return formatDate(new Date());
}

export function validateStayDates(checkIn: ISODate, checkOut: ISODate): string | null {
  if (checkIn < todayISO()) return 'Check-in cannot be in the past';
  if (checkOut <= checkIn) return 'Check-out must be after check-in';
  const nights = nightCount(checkIn, checkOut);
  if (nights < 1) return 'Stay must be at least 1 night';
  if (nights > 14) return 'Stay cannot exceed 14 nights';
  return null;
}
