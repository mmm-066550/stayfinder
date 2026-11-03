import 'server-only';
import type { City, Stars, ISODate, HotelSearchResult, HotelDetail, Money } from '@/domain/types';
import { buildQuote } from '@/domain/pricing';
import { db } from '../db/memoryDb';

interface SearchFilters {
  city: City;
  checkIn: ISODate;
  checkOut: ISODate;
  adults: number;
  maxPrice?: Money;
  stars?: Stars;
  sort?: 'price' | 'rating';
}

export function searchHotels(filters: SearchFilters): HotelSearchResult[] {
  const allHotels = db.getAllHotels();

  const results: HotelSearchResult[] = [];

  for (const hotel of allHotels) {
    if (hotel.city !== filters.city) continue;
    if (filters.stars !== undefined && hotel.stars !== filters.stars) continue;

    const rooms = db.getRoomsForHotel(hotel.id);
    let cheapestTotal: Money | null = null;

    for (const room of rooms) {
      if (room.maxGuests < filters.adults) continue;
      const unitsLeft = db.getUnitsLeft(room.id, filters.checkIn, filters.checkOut);
      if (unitsLeft <= 0) continue;

      const quote = buildQuote(room.baseRate, filters.checkIn, filters.checkOut);
      if (cheapestTotal === null || quote.total < cheapestTotal) {
        cheapestTotal = quote.total;
      }
    }

    if (cheapestTotal === null) continue;
    if (filters.maxPrice !== undefined && cheapestTotal > filters.maxPrice) continue;

    results.push({ ...hotel, fromTotal: cheapestTotal });
  }

  const sortBy = filters.sort ?? 'price';
  if (sortBy === 'price') {
    results.sort((a, b) => a.fromTotal - b.fromTotal);
  } else {
    results.sort((a, b) => b.rating - a.rating);
  }

  return results;
}

export function getHotelWithRooms(
  hotelId: string,
  checkIn: ISODate,
  checkOut: ISODate,
  _adults: number,
): HotelDetail | null {
  const hotel = db.getHotel(hotelId);
  if (!hotel) return null;

  const rooms = db.getRoomsForHotel(hotelId).map((room) => ({
    ...room,
    quote: buildQuote(room.baseRate, checkIn, checkOut),
    unitsLeft: db.getUnitsLeft(room.id, checkIn, checkOut),
  }));

  return { ...hotel, rooms };
}
