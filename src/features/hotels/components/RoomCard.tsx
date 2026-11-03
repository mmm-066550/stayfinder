'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatHalalas } from '@/domain/money';
import { useCreateHoldMutation } from '@/features/booking/bookingsApi';
import { setActiveHold } from '@/features/booking/bookingSlice';
import { useAppDispatch } from '@/store/hooks';
import { isAppApiError } from '@/store/baseApi';
import type { RoomWithAvailability } from '@/domain/types';
import type { Quote } from '@/domain/types';
import { v4 as uuid } from 'uuid';

interface RoomCardProps {
  room: RoomWithAvailability;
  hotelId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  onPriceChanged: (roomId: string, newQuote: Quote) => void;
  onRoomUnavailable: () => void;
}

function NightBreakdown({ quote }: { quote: Quote }) {
  return (
    <div className="mt-2 space-y-1 text-sm">
      {quote.nights.map((n) => (
        <div key={n.date} className="flex justify-between">
          <span>
            {n.date}
            {n.isWeekend && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0">
                Weekend
              </Badge>
            )}
          </span>
          <span className="font-medium">{formatHalalas(n.rate)}</span>
        </div>
      ))}
      <div className="border-t pt-1 flex justify-between">
        <span>Subtotal</span>
        <span>{formatHalalas(quote.subtotal)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>VAT 15%</span>
        <span>{formatHalalas(quote.vat)}</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>Total</span>
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
          onPriceChanged(room.id, newQuote);
          return;
        }
        if (err.data.error.code === 'ROOM_UNAVAILABLE') {
          onRoomUnavailable();
          toast.error('This room is no longer available.');
          return;
        }
      }
      toast.error('Failed to reserve. Please try again.');
    }
  };

  return (
    <Card className={tooSmall ? 'opacity-60' : undefined}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{room.name}</h4>
              {room.refundable && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  Refundable
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Up to {room.maxGuests}
              </span>
              <span>
                {room.unitsLeft} {room.unitsLeft === 1 ? 'unit' : 'units'} left
              </span>
            </div>
            {tooSmall && (
              <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Too small for {adults} adults
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-lg font-bold">{formatHalalas(room.quote.total)}</p>
            <p className="text-xs text-muted-foreground">total incl. VAT</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
            Night-by-night breakdown
          </Button>
          <Button onClick={handleReserve} disabled={disabled} size="sm">
            {isLoading ? 'Reserving...' : soldOut ? 'Sold Out' : 'Reserve'}
          </Button>
        </div>

        {expanded && <NightBreakdown quote={room.quote} />}
      </CardContent>
    </Card>
  );
}
