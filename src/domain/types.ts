export type Money = number; // integer halalas (1 SAR = 100 halalas)
export type ISODate = string; // 'YYYY-MM-DD'

export type City = 'riyadh' | 'jeddah' | 'dubai';
export type Stars = 1 | 2 | 3 | 4 | 5;
export type BookingStatus = 'held' | 'confirmed' | 'cancelled' | 'expired';

export interface Hotel {
  id: string;
  name: string;
  city: City;
  stars: Stars;
  rating: number;
  image: string;
  amenities: string[];
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  image: string;
  maxGuests: number;
  baseRate: Money;
  refundable: boolean;
  units: number;
}

export interface NightRate {
  date: ISODate;
  rate: Money;
  isWeekend: boolean;
}

export interface Quote {
  nights: NightRate[];
  subtotal: Money;
  vat: Money;
  total: Money;
}

export interface Guest {
  fullName: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  hotelId: string;
  roomId: string;
  adults: number;
  checkIn: ISODate;
  checkOut: ISODate;
  quote: Quote;
  holdExpiresAt: string | null;
  guest?: Guest;
  refundable: boolean;
}

export interface HotelSearchResult extends Hotel {
  fromTotal: Money;
}

export interface RoomWithAvailability extends Room {
  quote: Quote;
  unitsLeft: number;
}

export interface HotelDetail extends Hotel {
  rooms: RoomWithAvailability[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiError;
}
