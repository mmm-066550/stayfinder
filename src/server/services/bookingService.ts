import 'server-only';
import { v4 as uuid } from 'uuid';
import type { Booking, Guest, ISODate, Money, Quote } from '@/domain/types';
import { buildQuote } from '@/domain/pricing';
import { db } from '../db/memoryDb';

const HOLD_TTL = () => Number(process.env.HOLD_TTL_SECONDS ?? 300);

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; details?: Record<string, unknown> };

export function createHold(
  hotelId: string,
  roomId: string,
  checkIn: ISODate,
  checkOut: ISODate,
  adults: number,
  quotedTotal: Money,
): ServiceResult<{ booking: Booking; serverTime: string }> {
  const room = db.getRoom(roomId);
  if (!room || room.hotelId !== hotelId) {
    return { ok: false, code: 'NOT_FOUND', message: 'Room not found.' };
  }

  if (adults > room.maxGuests) {
    return { ok: false, code: 'VALIDATION_ERROR', message: `Room fits ${room.maxGuests} guests max.` };
  }

  const unitsLeft = db.getUnitsLeft(roomId, checkIn, checkOut);
  if (unitsLeft <= 0) {
    return { ok: false, code: 'ROOM_UNAVAILABLE', message: 'No units left for these dates.' };
  }

  const currentQuote = buildQuote(room.baseRate, checkIn, checkOut);
  if (currentQuote.total !== quotedTotal) {
    return {
      ok: false,
      code: 'PRICE_CHANGED',
      message: 'The price changed.',
      details: { newQuote: currentQuote },
    };
  }

  const now = new Date();
  const holdExpiresAt = new Date(now.getTime() + HOLD_TTL() * 1000).toISOString();

  const booking: Booking = {
    id: uuid(),
    status: 'held',
    hotelId,
    roomId,
    adults,
    checkIn,
    checkOut,
    quote: currentQuote,
    holdExpiresAt,
  };

  db.createBooking(booking);

  return { ok: true, data: { booking, serverTime: now.toISOString() } };
}

export function confirmBooking(
  bookingId: string,
  idempotencyKey: string,
  guest: Guest,
): ServiceResult<{ booking: Booking }> {
  const existingBookingId = db.getIdempotentBooking(idempotencyKey);
  if (existingBookingId) {
    const existing = db.getBooking(existingBookingId);
    if (existing && existing.status === 'confirmed') {
      return { ok: true, data: { booking: existing } };
    }
  }

  const booking = db.getBooking(bookingId);
  if (!booking) {
    return { ok: false, code: 'NOT_FOUND', message: 'Booking not found.' };
  }

  if (booking.status === 'confirmed') {
    return { ok: true, data: { booking } };
  }

  if (booking.status === 'expired') {
    return { ok: false, code: 'HOLD_EXPIRED', message: 'The hold has expired.' };
  }

  if (booking.status !== 'held') {
    return { ok: false, code: 'VALIDATION_ERROR', message: `Cannot confirm a ${booking.status} booking.` };
  }

  if (booking.holdExpiresAt && new Date(booking.holdExpiresAt).getTime() <= Date.now()) {
    db.updateBooking(bookingId, { status: 'expired', holdExpiresAt: null });
    return { ok: false, code: 'HOLD_EXPIRED', message: 'The hold has expired.' };
  }

  const updated = db.updateBooking(bookingId, {
    status: 'confirmed',
    holdExpiresAt: null,
    guest,
  });

  db.setIdempotencyKey(idempotencyKey, bookingId);

  return { ok: true, data: { booking: updated! } };
}

export function cancelBooking(bookingId: string): ServiceResult<{ booking: Booking }> {
  const booking = db.getBooking(bookingId);
  if (!booking) {
    return { ok: false, code: 'NOT_FOUND', message: 'Booking not found.' };
  }

  if (booking.status !== 'confirmed') {
    return { ok: false, code: 'VALIDATION_ERROR', message: `Cannot cancel a ${booking.status} booking.` };
  }

  const room = db.getRoom(booking.roomId);
  if (room && !room.refundable) {
    return { ok: false, code: 'NOT_REFUNDABLE', message: 'This room is non-refundable.' };
  }

  const updated = db.updateBooking(bookingId, { status: 'cancelled' });
  return { ok: true, data: { booking: updated! } };
}

export function getBooking(bookingId: string): ServiceResult<{ booking: Booking; serverTime: string }> {
  const booking = db.getBooking(bookingId);
  if (!booking) {
    return { ok: false, code: 'NOT_FOUND', message: 'Booking not found.' };
  }
  return { ok: true, data: { booking, serverTime: new Date().toISOString() } };
}

export function getAllBookings(): { bookings: Booking[]; serverTime: string } {
  return { bookings: db.getAllBookings(), serverTime: new Date().toISOString() };
}
