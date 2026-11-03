import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { searchParamsSchema } from '@/domain/schemas';
import { searchHotels } from '@/server/services/hotelService';
import { withChaos } from '@/server/withChaos';
import type { Stars } from '@/domain/types';

async function handler(req: NextRequest) {
  const url = req.nextUrl;
  const raw = {
    city: url.searchParams.get('city'),
    checkIn: url.searchParams.get('checkIn'),
    checkOut: url.searchParams.get('checkOut'),
    adults: url.searchParams.get('adults'),
    maxPrice: url.searchParams.get('maxPrice') || undefined,
    stars: url.searchParams.get('stars') || undefined,
    sort: url.searchParams.get('sort') || undefined,
  };

  const parsed = searchParamsSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid search parameters.', details: { issues: parsed.error.issues } } },
      { status: 400 },
    );
  }

  const results = searchHotels({
    ...parsed.data,
    stars: parsed.data.stars as Stars | undefined,
  });

  return NextResponse.json(results);
}

export const GET = withChaos(handler as Parameters<typeof withChaos>[0]);
