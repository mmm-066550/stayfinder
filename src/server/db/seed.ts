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
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'parking'],
  },
  {
    id: 'riy-2',
    name: 'Riyadh Palace Inn',
    city: 'riyadh',
    stars: 4,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop',
    amenities: ['wifi', 'gym', 'restaurant', 'parking'],
  },
  {
    id: 'riy-3',
    name: 'Desert Rose Hotel',
    city: 'riyadh',
    stars: 3,
    rating: 3.9,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
    amenities: ['wifi', 'parking', 'restaurant'],
  },
  {
    id: 'riy-4',
    name: 'Najd Suites',
    city: 'riyadh',
    stars: 2,
    rating: 3.5,
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&h=400&fit=crop',
    amenities: ['wifi', 'parking'],
  },

  // --- Jeddah (4 hotels) ---
  {
    id: 'jed-1',
    name: 'Red Sea Resort',
    city: 'jeddah',
    stars: 5,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'beach', 'parking'],
  },
  {
    id: 'jed-2',
    name: 'Corniche View Hotel',
    city: 'jeddah',
    stars: 4,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop',
    amenities: ['wifi', 'pool', 'restaurant', 'parking'],
  },
  {
    id: 'jed-3',
    name: 'Jeddah Business Lodge',
    city: 'jeddah',
    stars: 3,
    rating: 3.8,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop',
    amenities: ['wifi', 'gym', 'parking'],
  },
  {
    id: 'jed-4',
    name: 'Balad Heritage Inn',
    city: 'jeddah',
    stars: 2,
    rating: 3.6,
    image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&h=400&fit=crop',
    amenities: ['wifi', 'restaurant'],
  },

  // --- Dubai (4 hotels) ---
  {
    id: 'dub-1',
    name: 'Marina Bay Tower',
    city: 'dubai',
    stars: 5,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'beach', 'valet'],
  },
  {
    id: 'dub-2',
    name: 'Downtown Dubai Hotel',
    city: 'dubai',
    stars: 4,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop',
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking'],
  },
  {
    id: 'dub-3',
    name: 'Creek Side Lodge',
    city: 'dubai',
    stars: 3,
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop',
    amenities: ['wifi', 'restaurant', 'parking'],
  },
  {
    id: 'dub-4',
    name: 'Deira Budget Stay',
    city: 'dubai',
    stars: 1,
    rating: 3.2,
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop',
    amenities: ['wifi'],
  },
];

export const rooms: Room[] = [
  // --- riy-1: Al Faisaliah Grand (3 rooms) ---
  { id: 'riy-1-r1', hotelId: 'riy-1', name: 'Deluxe King', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 85000, refundable: true, units: 2 },
  { id: 'riy-1-r2', hotelId: 'riy-1', name: 'Family Suite', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop', maxGuests: 4, baseRate: 120000, refundable: true, units: 1 },
  { id: 'riy-1-r3', hotelId: 'riy-1', name: 'Standard Twin', image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 60000, refundable: false, units: 3 },

  // --- riy-2: Riyadh Palace Inn (2 rooms) ---
  { id: 'riy-2-r1', hotelId: 'riy-2', name: 'Superior Room', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 45000, refundable: true, units: 2 },
  { id: 'riy-2-r2', hotelId: 'riy-2', name: 'Triple Room', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop', maxGuests: 3, baseRate: 55000, refundable: false, units: 2 },

  // --- riy-3: Desert Rose Hotel (2 rooms) ---
  { id: 'riy-3-r1', hotelId: 'riy-3', name: 'Standard Room', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 28000, refundable: true, units: 3 },
  { id: 'riy-3-r2', hotelId: 'riy-3', name: 'Family Room', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop', maxGuests: 4, baseRate: 40000, refundable: false, units: 1 },

  // --- riy-4: Najd Suites (2 rooms) ---
  { id: 'riy-4-r1', hotelId: 'riy-4', name: 'Economy Single', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop', maxGuests: 1, baseRate: 15000, refundable: false, units: 3 },
  { id: 'riy-4-r2', hotelId: 'riy-4', name: 'Economy Double', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 22000, refundable: true, units: 2 },

  // --- jed-1: Red Sea Resort (3 rooms) ---
  { id: 'jed-1-r1', hotelId: 'jed-1', name: 'Ocean View Suite', image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 95000, refundable: true, units: 1 },
  { id: 'jed-1-r2', hotelId: 'jed-1', name: 'Beach Villa', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop', maxGuests: 4, baseRate: 150000, refundable: true, units: 1 },
  { id: 'jed-1-r3', hotelId: 'jed-1', name: 'Garden Room', image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 65000, refundable: false, units: 2 },

  // --- jed-2: Corniche View Hotel (2 rooms) ---
  { id: 'jed-2-r1', hotelId: 'jed-2', name: 'Sea View Room', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 48000, refundable: true, units: 2 },
  { id: 'jed-2-r2', hotelId: 'jed-2', name: 'Family Suite', image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&h=300&fit=crop', maxGuests: 4, baseRate: 70000, refundable: false, units: 1 },

  // --- jed-3: Jeddah Business Lodge (2 rooms) ---
  { id: 'jed-3-r1', hotelId: 'jed-3', name: 'Business Single', image: 'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=400&h=300&fit=crop', maxGuests: 1, baseRate: 30000, refundable: true, units: 2 },
  { id: 'jed-3-r2', hotelId: 'jed-3', name: 'Business Double', image: 'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 38000, refundable: false, units: 3 },

  // --- jed-4: Balad Heritage Inn (2 rooms) ---
  { id: 'jed-4-r1', hotelId: 'jed-4', name: 'Heritage Room', image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 20000, refundable: true, units: 2 },
  { id: 'jed-4-r2', hotelId: 'jed-4', name: 'Heritage Family', image: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=300&fit=crop', maxGuests: 3, baseRate: 32000, refundable: false, units: 1 },

  // --- dub-1: Marina Bay Tower (3 rooms) ---
  { id: 'dub-1-r1', hotelId: 'dub-1', name: 'Panoramic Suite', image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 110000, refundable: true, units: 1 },
  { id: 'dub-1-r2', hotelId: 'dub-1', name: 'Presidential Suite', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop', maxGuests: 4, baseRate: 200000, refundable: true, units: 1 },
  { id: 'dub-1-r3', hotelId: 'dub-1', name: 'Marina Room', image: 'https://images.unsplash.com/photo-1552902875-9ac1f9fe0d0f?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 75000, refundable: false, units: 2 },

  // --- dub-2: Downtown Dubai Hotel (3 rooms) ---
  { id: 'dub-2-r1', hotelId: 'dub-2', name: 'Burj View Room', image: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 55000, refundable: true, units: 2 },
  { id: 'dub-2-r2', hotelId: 'dub-2', name: 'Club Suite', image: 'https://images.unsplash.com/photo-1605346434674-a440ca4dc4c0?w=400&h=300&fit=crop', maxGuests: 3, baseRate: 80000, refundable: true, units: 1 },
  { id: 'dub-2-r3', hotelId: 'dub-2', name: 'Standard Room', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 42000, refundable: false, units: 3 },

  // --- dub-3: Creek Side Lodge (2 rooms) ---
  { id: 'dub-3-r1', hotelId: 'dub-3', name: 'Creek View Room', image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 35000, refundable: true, units: 2 },
  { id: 'dub-3-r2', hotelId: 'dub-3', name: 'Family Room', image: 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=400&h=300&fit=crop', maxGuests: 4, baseRate: 50000, refundable: false, units: 1 },

  // --- dub-4: Deira Budget Stay (2 rooms) ---
  { id: 'dub-4-r1', hotelId: 'dub-4', name: 'Basic Single', image: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=400&h=300&fit=crop', maxGuests: 1, baseRate: 12000, refundable: false, units: 3 },
  { id: 'dub-4-r2', hotelId: 'dub-4', name: 'Basic Double', image: 'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=400&h=300&fit=crop', maxGuests: 2, baseRate: 18000, refundable: false, units: 2 },
];
