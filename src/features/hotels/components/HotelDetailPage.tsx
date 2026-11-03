'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useGetHotelQuery } from '../hotelsApi';
import { RoomCard } from './RoomCard';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getErrorMessage } from '@/store/baseApi';
import { formatHalalas } from '@/domain/money';
import type { Quote } from '@/domain/types';

interface HotelDetailPageProps {
  hotelId: string;
}

export function HotelDetailPage({ hotelId }: HotelDetailPageProps) {
  const searchParams = useSearchParams();
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const adults = Number(searchParams.get('adults') ?? 1);

  const { data: hotel, isLoading, isError, error, refetch } = useGetHotelQuery(
    { hotelId, checkIn, checkOut, adults },
    { skip: !checkIn || !checkOut },
  );

  const [priceChange, setPriceChange] = useState<{ roomId: string; newQuote: Quote } | null>(null);

  const handlePriceChanged = (roomId: string, newQuote: Quote) => {
    setPriceChange({ roomId, newQuote });
  };

  const handleRoomUnavailable = () => {
    refetch();
  };

  if (!checkIn || !checkOut) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <ErrorState message="Missing check-in/check-out dates. Please search again." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-40" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/?city=${hotel.city}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`} />}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to results
      </Button>

      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{hotel.name}</h1>
          <Badge variant="secondary" className="text-base px-2">
            {hotel.rating.toFixed(1)}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="capitalize">{hotel.city}</span>
          </span>
          <span className="flex items-center gap-0.5">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {hotel.amenities.map((a) => (
            <Badge key={a} variant="outline" className="text-xs capitalize">
              {a}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Available Rooms
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {checkIn} to {checkOut} · {adults} {adults === 1 ? 'adult' : 'adults'}
          </span>
        </h2>
        <div className="space-y-3">
          {hotel.rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              hotelId={hotelId}
              checkIn={checkIn}
              checkOut={checkOut}
              adults={adults}
              onPriceChanged={handlePriceChanged}
              onRoomUnavailable={handleRoomUnavailable}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!priceChange} onOpenChange={() => setPriceChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Price has changed</DialogTitle>
            <DialogDescription>
              The price for this room has been updated since you last viewed it.
            </DialogDescription>
          </DialogHeader>
          {priceChange && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>New total</span>
                <span className="font-bold">{formatHalalas(priceChange.newQuote.total)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPriceChange(null)}>
              Go back
            </Button>
            <Button
              onClick={() => {
                setPriceChange(null);
                refetch();
              }}
            >
              Accept & refresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
