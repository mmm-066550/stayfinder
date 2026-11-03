import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cancelBooking } from '@/server/services/bookingService';
import { withChaos } from '@/server/withChaos';

async function handler(_req: NextRequest, ctx: RouteContext<'/api/bookings/[bookingId]/cancel'>) {
  const { bookingId } = await ctx.params;
  const result = cancelBooking(bookingId);

  if (!result.ok) {
    const status = result.code === 'NOT_REFUNDABLE' ? 409 : 400;
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status },
    );
  }

  return NextResponse.json(result.data);
}

export const POST = withChaos(handler as Parameters<typeof withChaos>[0]);
