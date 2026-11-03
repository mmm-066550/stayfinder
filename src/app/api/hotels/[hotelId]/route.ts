import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getHotelWithRooms } from '@/server/services/hotelService';
import { withChaos } from '@/server/withChaos';

async function handler(req: NextRequest, ctx: RouteContext<'/api/hotels/[hotelId]'>) {
  const { hotelId } = await ctx.params;
  const url = req.nextUrl;
  const checkIn = url.searchParams.get('checkIn');
  const checkOut = url.searchParams.get('checkOut');
  const adults = Number(url.searchParams.get('adults') ?? 1);

  if (!checkIn || !checkOut) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'checkIn and checkOut are required.' } },
      { status: 400 },
    );
  }

  const hotel = getHotelWithRooms(hotelId, checkIn, checkOut, adults);
  if (!hotel) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Hotel not found.' } },
      { status: 404 },
    );
  }

  return NextResponse.json(hotel);
}

export const GET = withChaos(handler as Parameters<typeof withChaos>[0]);
