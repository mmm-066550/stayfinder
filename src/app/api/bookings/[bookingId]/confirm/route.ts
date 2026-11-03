import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { guestSchema } from '@/domain/schemas';
import { confirmBooking } from '@/server/services/bookingService';
import { withChaos } from '@/server/withChaos';

async function handler(req: NextRequest, ctx: RouteContext<'/api/bookings/[bookingId]/confirm'>) {
  const { bookingId } = await ctx.params;
  const idempotencyKey = req.headers.get('Idempotency-Key');

  if (!idempotencyKey) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Idempotency-Key header is required.' } },
      { status: 422 },
    );
  }

  const body = await req.json();
  const parsed = guestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid guest details.', details: { issues: parsed.error.issues } } },
      { status: 422 },
    );
  }

  const result = confirmBooking(bookingId, idempotencyKey, parsed.data);

  if (!result.ok) {
    const status = result.code === 'HOLD_EXPIRED' ? 410 : 422;
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status },
    );
  }

  return NextResponse.json(result.data);
}

export const POST = withChaos(handler as Parameters<typeof withChaos>[0], { isConfirm: true });
