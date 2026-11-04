'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Star, MapPin, Wifi, Car, UtensilsCrossed, Dumbbell, Waves, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatHalalas } from '@/domain/money';
import { WishlistButton } from '@/features/wishlist/WishlistButton';
import type { HotelSearchResult } from '@/domain/types';

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-3 w-3" />,
  parking: <Car className="h-3 w-3" />,
  restaurant: <UtensilsCrossed className="h-3 w-3" />,
  gym: <Dumbbell className="h-3 w-3" />,
  pool: <Waves className="h-3 w-3" />,
  spa: <Sparkles className="h-3 w-3" />,
};

interface HotelCardProps {
  hotel: HotelSearchResult;
  checkIn: string;
  checkOut: string;
  adults: number;
}

export function HotelCard({ hotel, checkIn, checkOut, adults }: HotelCardProps) {
  const t = useTranslations('search');
  const tHotel = useTranslations('hotel');
  const href = `/hotels/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`;

  const ratingLabel = hotel.rating >= 4.5 ? tHotel('excellent') : hotel.rating >= 4.0 ? tHotel('veryGood') : hotel.rating >= 3.5 ? tHotel('good') : tHotel('pleasant');

  return (
    <Card className="transition-all hover:shadow-lg group border-border/50">
      <CardContent className="p-3">
        <div className="flex flex-col sm:flex-row-reverse gap-3">
          <div className="relative h-48 w-full sm:h-auto sm:w-56 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={hotel.image}
              alt={hotel.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 224px"
            />
            <div className="absolute top-2 end-2">
              <WishlistButton hotelId={hotel.id} className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm" />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between py-1 sm:py-2">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base sm:text-lg leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                    {hotel.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="capitalize">{hotel.city}</span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">{ratingLabel}</span>
                  <span className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold h-7 min-w-7 px-1.5">
                    {hotel.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {hotel.amenities.slice(0, 5).map((a) => (
                  <span key={a} className="flex items-center gap-1 capitalize">
                    {amenityIcons[a] ?? null}
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-border/50 pt-3">
              <div>
                <p className="text-xs text-muted-foreground">{t('totalFrom')}</p>
                <p className="text-xl font-bold">{formatHalalas(hotel.fromTotal)}</p>
              </div>
              <Button nativeButton={false} render={<Link href={href} />} size="lg">
                {t('viewRooms')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
