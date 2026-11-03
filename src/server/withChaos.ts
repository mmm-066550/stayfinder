import 'server-only';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildQuote } from '@/domain/pricing';
import { db } from './db/memoryDb';

type RouteHandler = (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;

const env = () => ({
  enabled: process.env.CHAOS_ENABLED !== 'false',
  maxLatency: Number(process.env.CHAOS_MAX_LATENCY_MS ?? 1500),
  errorRate: Number(process.env.CHAOS_ERROR_RATE ?? 0.1),
  priceChangeRate: Number(process.env.CHAOS_PRICE_CHANGE_RATE ?? 0.1),
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withChaos(handler: RouteHandler, opts?: { isConfirm?: boolean; isHold?: boolean }): RouteHandler {
  return async (req, ctx) => {
    const cfg = env();
    if (!cfg.enabled) return handler(req, ctx);

    // Random latency
    if (cfg.maxLatency > 0) {
      await delay(Math.floor(Math.random() * cfg.maxLatency));
    }

    // Random 500 — for confirm, we run the handler FIRST then return 500
    if (Math.random() < cfg.errorRate) {
      if (opts?.isConfirm) {
        await handler(req, ctx);
        return NextResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
        { status: 500 },
      );
    }

    // Price change chaos on hold creation
    if (opts?.isHold && Math.random() < cfg.priceChangeRate) {
      const body = await req.clone().json();
      const room = db.getRoom(body.roomId);
      if (room) {
        const bump = 1 + 0.05 + Math.random() * 0.10; // 5–15% higher
        const chaosRate = Math.round(room.baseRate * bump);
        const newQuote = buildQuote(chaosRate, body.checkIn, body.checkOut);
        return NextResponse.json(
          {
            error: {
              code: 'PRICE_CHANGED',
              message: 'The price changed.',
              details: { newQuote },
            },
          },
          { status: 409 },
        );
      }
    }

    return handler(req, ctx);
  };
}
