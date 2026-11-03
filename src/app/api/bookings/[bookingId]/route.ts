import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBooking } from '@/server/services/bookingService';
import { withChaos } from '@/server/withChaos';

async function handler(_req: NextRequest, ctx: RouteContext<'/api/bookings/[bookingId]'>) {
  const { bookingId } = await ctx.params;
  const result = getBooking(bookingId);

  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: 404 },
    );
  }

  return NextResponse.json(result.data);
}

export const GET = withChaos(handler as Parameters<typeof withChaos>[0]);
