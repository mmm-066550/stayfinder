'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Users, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatHalalas } from '@/domain/money';
import { useCreateHoldMutation } from '@/features/booking/bookingsApi';
import { setActiveHold } from '@/features/booking/bookingSlice';
import { useAppDispatch } from '@/store/hooks';
import { isAppApiError } from '@/store/baseApi';
import type { RoomWithAvailability, Quote } from '@/domain/types';
import { v4 as uuid } from 'uuid';

interface RoomCardProps {
  room: RoomWithAvailability;
  hotelId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  onPriceChanged: (roomId: string, oldTotal: number, newQuote: Quote) => void;
  onRoomUnavailable: () => void;
}

function NightBreakdown({ quote }: { quote: Quote }) {
  const t = useTranslations('hotel');
  return (
    <div className="mt-3 space-y-1.5 text-sm border-t border-border/50 pt-3">
      {quote.nights.map((n) => (
        <div key={n.date} className="flex justify-between">
          <span>
            {n.date}
            {n.isWeekend && (
              <Badge variant="secondary" className="ms-1.5 text-[10px] px-1 py-0">
                {t('weekend')}
              </Badge>
            )}
          </span>
          <span className="font-medium">{formatHalalas(n.rate)}</span>
        </div>
      ))}
      <div className="border-t border-border/50 pt-1.5 flex justify-between">
        <span>{t('subtotal')}</span>
        <span>{formatHalalas(quote.subtotal)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>{t('vat')}</span>
        <span>{formatHalalas(quote.vat)}</span>
      </div>
      <div className="flex justify-between font-bold text-base">
        <span>{t('total')}</span>
        <span>{formatHalalas(quote.total)}</span>
      </div>
    </div>
  );
}

export function RoomCard({
  room,
  hotelId,
  checkIn,
  checkOut,
  adults,
  onPriceChanged,
  onRoomUnavailable,
}: RoomCardProps) {
  const t = useTranslations('hotel');
  const [expanded, setExpanded] = useState(false);
  const [createHold, { isLoading }] = useCreateHoldMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const tooSmall = adults > room.maxGuests;
  const soldOut = room.unitsLeft <= 0;
  const disabled = tooSmall || soldOut || isLoading;

  const handleReserve = async () => {
    try {
      const result = await createHold({
        hotelId,
        roomId: room.id,
        checkIn,
        checkOut,
        adults,
        quotedTotal: room.quote.total,
      }).unwrap();

      dispatch(
        setActiveHold({
          bookingId: result.booking.id,
          hotelId,
          roomId: room.id,
          holdExpiresAt: result.booking.holdExpiresAt!,
          serverTime: result.serverTime,
          quote: result.booking.quote,
          idempotencyKey: uuid(),
        }),
      );

      router.push(`/checkout/${result.booking.id}`);
    } catch (err) {
      if (isAppApiError(err)) {
        if (err.data.error.code === 'PRICE_CHANGED') {
          const newQuote = err.data.error.details?.newQuote as Quote;
          onPriceChanged(room.id, room.quote.total, newQuote);
          return;
        }
        if (err.data.error.code === 'ROOM_UNAVAILABLE') {
          onRoomUnavailable();
          toast.error(t('roomUnavailable'));
          return;
        }
      }
      toast.error(t('reserveFailed'));
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md border-border/50 ${tooSmall ? 'opacity-60' : ''}`}>
      <CardContent className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative h-40 w-full sm:h-auto sm:w-44 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={room.image}
              alt={room.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 176px"
            />
          </div>

          <div className="flex-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base">{room.name}</h4>
                  {room.refundable && (
                    <Badge className="text-[11px] gap-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                      <ShieldCheck className="h-3 w-3" />
                      {t('refundable')}
                    </Badge>
                  )}
                  {room.unitsLeft <= 3 && room.unitsLeft > 0 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {t('unitsLeft', { count: room.unitsLeft })}
                    </Badge>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {t('upToGuests', { count: room.maxGuests })}
                  </span>
                  {room.unitsLeft > 3 && (
                    <span>{t('unitsLeft', { count: room.unitsLeft })}</span>
                  )}
                </div>
                {tooSmall && (
                  <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {t('tooSmall', { count: adults })}
                  </p>
                )}
              </div>

              <div className="text-end shrink-0">
                <p className="text-xl font-bold">{formatHalalas(room.quote.total)}</p>
                <p className="text-xs text-muted-foreground">{t('totalInclVat')}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-muted-foreground"
              >
                {expanded ? <ChevronUp className="me-1 h-3 w-3" /> : <ChevronDown className="me-1 h-3 w-3" />}
                {t('nightBreakdown')}
              </Button>
              <Button onClick={handleReserve} disabled={disabled} size="lg">
                {isLoading ? '...' : soldOut ? t('soldOut') : t('reserve')}
              </Button>
            </div>

            {expanded && <NightBreakdown quote={room.quote} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
