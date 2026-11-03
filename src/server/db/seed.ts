import 'server-only';
import type { Hotel, Room } from '@/domain/types';

export const hotels: Hotel[] = [
  // --- Riyadh (4 hotels) ---
  {
    id: 'riy-1',
    name: 'Al Faisaliah Grand',
    city: 'riyadh',
    stars: 5,
    rating: 4.8,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'parking'],
  },
  {
    id: 'riy-2',
    name: 'Riyadh Palace Inn',
    city: 'riyadh',
    stars: 4,
    rating: 4.3,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'gym', 'restaurant', 'parking'],
  },
  {
    id: 'riy-3',
    name: 'Desert Rose Hotel',
    city: 'riyadh',
    stars: 3,
    rating: 3.9,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'parking', 'restaurant'],
  },
  {
    id: 'riy-4',
    name: 'Najd Suites',
    city: 'riyadh',
    stars: 2,
    rating: 3.5,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'parking'],
  },

  // --- Jeddah (4 hotels) ---
  {
    id: 'jed-1',
    name: 'Red Sea Resort',
    city: 'jeddah',
    stars: 5,
    rating: 4.7,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'beach', 'parking'],
  },
  {
    id: 'jed-2',
    name: 'Corniche View Hotel',
    city: 'jeddah',
    stars: 4,
    rating: 4.2,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'pool', 'restaurant', 'parking'],
  },
  {
    id: 'jed-3',
    name: 'Jeddah Business Lodge',
    city: 'jeddah',
    stars: 3,
    rating: 3.8,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'gym', 'parking'],
  },
  {
    id: 'jed-4',
    name: 'Balad Heritage Inn',
    city: 'jeddah',
    stars: 2,
    rating: 3.6,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'restaurant'],
  },

  // --- Dubai (4 hotels) ---
  {
    id: 'dub-1',
    name: 'Marina Bay Tower',
    city: 'dubai',
    stars: 5,
    rating: 4.9,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'beach', 'valet'],
  },
  {
    id: 'dub-2',
    name: 'Downtown Dubai Hotel',
    city: 'dubai',
    stars: 4,
    rating: 4.4,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking'],
  },
  {
    id: 'dub-3',
    name: 'Creek Side Lodge',
    city: 'dubai',
    stars: 3,
    rating: 4.0,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi', 'restaurant', 'parking'],
  },
  {
    id: 'dub-4',
    name: 'Deira Budget Stay',
    city: 'dubai',
    stars: 1,
    rating: 3.2,
    image: '/placeholder-hotel.svg',
    amenities: ['wifi'],
  },
];

export const rooms: Room[] = [
  // --- riy-1: Al Faisaliah Grand (3 rooms) ---
  { id: 'riy-1-r1', hotelId: 'riy-1', name: 'Deluxe King', maxGuests: 2, baseRate: 85000, refundable: true, units: 2 },
  { id: 'riy-1-r2', hotelId: 'riy-1', name: 'Family Suite', maxGuests: 4, baseRate: 120000, refundable: true, units: 1 },
  { id: 'riy-1-r3', hotelId: 'riy-1', name: 'Standard Twin', maxGuests: 2, baseRate: 60000, refundable: false, units: 3 },

  // --- riy-2: Riyadh Palace Inn (2 rooms) ---
  { id: 'riy-2-r1', hotelId: 'riy-2', name: 'Superior Room', maxGuests: 2, baseRate: 45000, refundable: true, units: 2 },
  { id: 'riy-2-r2', hotelId: 'riy-2', name: 'Triple Room', maxGuests: 3, baseRate: 55000, refundable: false, units: 2 },

  // --- riy-3: Desert Rose Hotel (2 rooms) ---
  { id: 'riy-3-r1', hotelId: 'riy-3', name: 'Standard Room', maxGuests: 2, baseRate: 28000, refundable: true, units: 3 },
  { id: 'riy-3-r2', hotelId: 'riy-3', name: 'Family Room', maxGuests: 4, baseRate: 40000, refundable: false, units: 1 },

  // --- riy-4: Najd Suites (2 rooms) ---
  { id: 'riy-4-r1', hotelId: 'riy-4', name: 'Economy Single', maxGuests: 1, baseRate: 15000, refundable: false, units: 3 },
  { id: 'riy-4-r2', hotelId: 'riy-4', name: 'Economy Double', maxGuests: 2, baseRate: 22000, refundable: true, units: 2 },

  // --- jed-1: Red Sea Resort (3 rooms) ---
  { id: 'jed-1-r1', hotelId: 'jed-1', name: 'Ocean View Suite', maxGuests: 2, baseRate: 95000, refundable: true, units: 1 },
  { id: 'jed-1-r2', hotelId: 'jed-1', name: 'Beach Villa', maxGuests: 4, baseRate: 150000, refundable: true, units: 1 },
  { id: 'jed-1-r3', hotelId: 'jed-1', name: 'Garden Room', maxGuests: 2, baseRate: 65000, refundable: false, units: 2 },

  // --- jed-2: Corniche View Hotel (2 rooms) ---
  { id: 'jed-2-r1', hotelId: 'jed-2', name: 'Sea View Room', maxGuests: 2, baseRate: 48000, refundable: true, units: 2 },
  { id: 'jed-2-r2', hotelId: 'jed-2', name: 'Family Suite', maxGuests: 4, baseRate: 70000, refundable: false, units: 1 },

  // --- jed-3: Jeddah Business Lodge (2 rooms) ---
  { id: 'jed-3-r1', hotelId: 'jed-3', name: 'Business Single', maxGuests: 1, baseRate: 30000, refundable: true, units: 2 },
  { id: 'jed-3-r2', hotelId: 'jed-3', name: 'Business Double', maxGuests: 2, baseRate: 38000, refundable: false, units: 3 },

  // --- jed-4: Balad Heritage Inn (2 rooms) ---
  { id: 'jed-4-r1', hotelId: 'jed-4', name: 'Heritage Room', maxGuests: 2, baseRate: 20000, refundable: true, units: 2 },
  { id: 'jed-4-r2', hotelId: 'jed-4', name: 'Heritage Family', maxGuests: 3, baseRate: 32000, refundable: false, units: 1 },

  // --- dub-1: Marina Bay Tower (3 rooms) ---
  { id: 'dub-1-r1', hotelId: 'dub-1', name: 'Panoramic Suite', maxGuests: 2, baseRate: 110000, refundable: true, units: 1 },
  { id: 'dub-1-r2', hotelId: 'dub-1', name: 'Presidential Suite', maxGuests: 4, baseRate: 200000, refundable: true, units: 1 },
  { id: 'dub-1-r3', hotelId: 'dub-1', name: 'Marina Room', maxGuests: 2, baseRate: 75000, refundable: false, units: 2 },

  // --- dub-2: Downtown Dubai Hotel (3 rooms) ---
  { id: 'dub-2-r1', hotelId: 'dub-2', name: 'Burj View Room', maxGuests: 2, baseRate: 55000, refundable: true, units: 2 },
  { id: 'dub-2-r2', hotelId: 'dub-2', name: 'Club Suite', maxGuests: 3, baseRate: 80000, refundable: true, units: 1 },
  { id: 'dub-2-r3', hotelId: 'dub-2', name: 'Standard Room', maxGuests: 2, baseRate: 42000, refundable: false, units: 3 },

  // --- dub-3: Creek Side Lodge (2 rooms) ---
  { id: 'dub-3-r1', hotelId: 'dub-3', name: 'Creek View Room', maxGuests: 2, baseRate: 35000, refundable: true, units: 2 },
  { id: 'dub-3-r2', hotelId: 'dub-3', name: 'Family Room', maxGuests: 4, baseRate: 50000, refundable: false, units: 1 },

  // --- dub-4: Deira Budget Stay (2 rooms) ---
  { id: 'dub-4-r1', hotelId: 'dub-4', name: 'Basic Single', maxGuests: 1, baseRate: 12000, refundable: false, units: 3 },
  { id: 'dub-4-r2', hotelId: 'dub-4', name: 'Basic Double', maxGuests: 2, baseRate: 18000, refundable: false, units: 2 },
];
