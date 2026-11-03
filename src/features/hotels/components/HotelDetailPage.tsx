'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Star, MapPin, ArrowLeft, Wifi, Car, UtensilsCrossed, Dumbbell, Waves, Sparkles, CalendarDays, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useGetHotelQuery } from '../hotelsApi';
import { RoomCard } from './RoomCard';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getErrorMessage } from '@/store/baseApi';
import { formatHalalas } from '@/domain/money';
import { WishlistButton } from '@/features/wishlist/WishlistButton';
import type { Quote } from '@/domain/types';

interface HotelDetailPageProps {
  hotelId: string;
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  restaurant: <UtensilsCrossed className="h-4 w-4" />,
  gym: <Dumbbell className="h-4 w-4" />,
  pool: <Waves className="h-4 w-4" />,
  spa: <Sparkles className="h-4 w-4" />,
};

export function HotelDetailPage({ hotelId }: HotelDetailPageProps) {
  const searchParams = useSearchParams();
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const adults = Number(searchParams.get('adults') ?? 1);

  const { data: hotel, isLoading, isError, error, refetch } = useGetHotelQuery(
    { hotelId, checkIn, checkOut, adults },
    { skip: !checkIn || !checkOut },
  );

  const t = useTranslations('hotel');
  const tSearch = useTranslations('search');
  const tCommon = useTranslations('common');
  const [priceChange, setPriceChange] = useState<{ roomId: string; oldTotal: number; newQuote: Quote } | null>(null);

  const handlePriceChanged = (roomId: string, oldTotal: number, newQuote: Quote) => {
    setPriceChange({ roomId, oldTotal, newQuote });
  };

  const handleRoomUnavailable = () => {
    refetch();
  };

  if (!checkIn || !checkOut) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <ErrorState message={t('missingDates')} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-64 sm:h-80 w-full" />
        <div className="mx-auto max-w-5xl px-4 -mt-20">
          <div className="rounded-xl bg-card p-5 shadow-lg border border-border/50 space-y-4">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 space-y-4">
          <Skeleton className="h-6 w-48" />
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-card overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <Skeleton className="h-40 w-full sm:w-44 shrink-0" />
                <div className="flex-1 p-4 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <div className="flex justify-between items-end pt-3 border-t border-border/50">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </div>
    );
  }

  if (!hotel) return null;

  const ratingLabel = hotel.rating >= 4.5 ? t('excellent') : hotel.rating >= 4.0 ? t('veryGood') : hotel.rating >= 3.5 ? t('good') : t('pleasant');
  const cheapest = hotel.rooms.reduce((min, r) => r.quote.total < min ? r.quote.total : min, Infinity);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      {/* Hero image */}
      <div className="relative overflow-hidden h-64 sm:h-80 w-full">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1024px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-4 start-4">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={`/?city=${hotel.city}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`} />}
            className="text-white/90 bg-black/20 backdrop-blur-sm hover:bg-black/40 hover:text-white"
          >
            <ArrowLeft className="me-1 h-4 w-4" />
            {t('backToResults')}
          </Button>
        </div>
        <div className="absolute top-4 end-4">
          <WishlistButton hotelId={hotelId} size="lg" className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40" />
        </div>
      </div>

      {/* Hotel info card overlapping the hero */}
      <div className="mx-auto max-w-5xl px-4 -mt-20 relative z-10">
        <Card className="shadow-lg border-border/50">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{hotel.name}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="capitalize">{hotel.city}</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-end">
                  <span className="text-xs text-muted-foreground block">{ratingLabel}</span>
                </div>
                <span className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold h-10 min-w-10 px-3">
                  {hotel.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4 flex flex-wrap gap-2">
              {hotel.amenities.map((a) => (
                <span key={a} className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm text-secondary-foreground capitalize">
                  {amenityIcons[a] ?? null}
                  {a}
                </span>
              ))}
            </div>

            {/* Stay summary strip */}
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-muted/50 px-4 py-3 text-sm">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-primary" />
                {checkIn} — {checkOut}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                {t('adults', { count: adults })}
              </span>
              {cheapest < Infinity && (
                <span className="ms-auto font-semibold">
                  {tSearch('totalFrom')} <span className="text-lg font-bold text-primary">{formatHalalas(cheapest)}</span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room cards */}
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-lg font-semibold mb-4">{t('availableRooms')}</h2>
        <div className="space-y-4">
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

      {/* Price change dialog */}
      <Dialog open={!!priceChange} onOpenChange={() => setPriceChange(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tCommon('priceChanged')}</DialogTitle>
            <DialogDescription>
              {tCommon('priceChangedDesc')}
            </DialogDescription>
          </DialogHeader>
          {priceChange && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{tCommon('oldTotal')}</span>
                <span className="line-through text-muted-foreground">{formatHalalas(priceChange.oldTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{tCommon('newTotal')}</span>
                <span className="font-bold">{formatHalalas(priceChange.newQuote.total)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPriceChange(null)}>
              {tCommon('goBack')}
            </Button>
            <Button
              onClick={() => {
                setPriceChange(null);
                refetch();
              }}
            >
              {tCommon('acceptRefresh')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
