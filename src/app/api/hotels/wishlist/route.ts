import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getHotelsByIds } from '@/server/services/hotelService';

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids');
  if (!ids) {
    return NextResponse.json([]);
  }

  const hotelIds = ids.split(',').filter(Boolean).slice(0, 50);
  const hotels = getHotelsByIds(hotelIds);
  return NextResponse.json(hotels);
}
