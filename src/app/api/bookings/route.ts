import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { holdRequestSchema } from '@/domain/schemas';
import { createHold, getAllBookings } from '@/server/services/bookingService';
import { withChaos } from '@/server/withChaos';

async function handleGet() {
  const result = getAllBookings();
  return NextResponse.json(result);
}

async function handlePost(req: NextRequest) {
  const body = await req.json();
  const parsed = holdRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid request body.', details: { issues: parsed.error.issues } } },
      { status: 422 },
    );
  }

  const { hotelId, roomId, checkIn, checkOut, adults, quotedTotal } = parsed.data;
  const result = createHold(hotelId, roomId, checkIn, checkOut, adults, quotedTotal);

  if (!result.ok) {
    const status = result.code === 'ROOM_UNAVAILABLE' || result.code === 'PRICE_CHANGED' ? 409 : 400;
    return NextResponse.json(
      { error: { code: result.code, message: result.message, details: result.details } },
      { status },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}

export const GET = withChaos(handleGet as Parameters<typeof withChaos>[0]);
export const POST = withChaos(handlePost as Parameters<typeof withChaos>[0], { isHold: true });
