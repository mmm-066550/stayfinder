import 'server-only';
import type { Hotel, Room, Booking, ISODate } from '@/domain/types';
import { hotels as seedHotels, rooms as seedRooms } from './seed';

const hotels: Map<string, Hotel> = new Map();
const rooms: Map<string, Room> = new Map();
const roomsByHotel: Map<string, Room[]> = new Map();
const bookings: Map<string, Booking> = new Map();
const idempotencyKeys: Map<string, string> = new Map(); // key → bookingId

function init() {
  hotels.clear();
  rooms.clear();
  roomsByHotel.clear();
  bookings.clear();
  idempotencyKeys.clear();

  for (const h of seedHotels) {
    hotels.set(h.id, { ...h });
  }
  for (const r of seedRooms) {
    rooms.set(r.id, { ...r });
    const list = roomsByHotel.get(r.hotelId) ?? [];
    list.push({ ...r });
    roomsByHotel.set(r.hotelId, list);
  }
}

init();

function expireStaleHolds() {
  const now = Date.now();
  for (const [, b] of bookings) {
    if (b.status === 'held' && b.holdExpiresAt && new Date(b.holdExpiresAt).getTime() <= now) {
      b.status = 'expired';
      b.holdExpiresAt = null;
    }
  }
}

function unitsHeldOrConfirmed(roomId: string, checkIn: ISODate, checkOut: ISODate): number {
  expireStaleHolds();
  let count = 0;
  for (const [, b] of bookings) {
    if (
      b.roomId === roomId &&
      (b.status === 'held' || b.status === 'confirmed') &&
      b.checkIn < checkOut &&
      b.checkOut > checkIn
    ) {
      count++;
    }
  }
  return count;
}

export const db = {
  getAllHotels(): Hotel[] {
    return Array.from(hotels.values());
  },

  getHotel(id: string): Hotel | undefined {
    return hotels.get(id);
  },

  getRoomsForHotel(hotelId: string): Room[] {
    return roomsByHotel.get(hotelId) ?? [];
  },

  getRoom(id: string): Room | undefined {
    return rooms.get(id);
  },

  getUnitsLeft(roomId: string, checkIn: ISODate, checkOut: ISODate): number {
    const room = rooms.get(roomId);
    if (!room) return 0;
    return Math.max(0, room.units - unitsHeldOrConfirmed(roomId, checkIn, checkOut));
  },

  createBooking(booking: Booking): void {
    bookings.set(booking.id, booking);
  },

  getBooking(id: string): Booking | undefined {
    expireStaleHolds();
    return bookings.get(id);
  },

  getAllBookings(): Booking[] {
    expireStaleHolds();
    return Array.from(bookings.values());
  },

  updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const existing = bookings.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    bookings.set(id, updated);
    return updated;
  },

  getIdempotentBooking(key: string): string | undefined {
    return idempotencyKeys.get(key);
  },

  setIdempotencyKey(key: string, bookingId: string): void {
    idempotencyKeys.set(key, bookingId);
  },

  expireStaleHolds,
};
