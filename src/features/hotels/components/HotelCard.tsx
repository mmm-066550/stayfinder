'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatHalalas } from '@/domain/money';
import { WishlistButton } from '@/features/wishlist/WishlistButton';
import type { HotelSearchResult } from '@/domain/types';

interface HotelCardProps {
  hotel: HotelSearchResult;
  checkIn: string;
  checkOut: string;
  adults: number;
}

export function HotelCard({ hotel, checkIn, checkOut, adults }: HotelCardProps) {
  const t = useTranslations('search');
  const href = `/hotels/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="h-48 w-full bg-muted sm:h-auto sm:w-48 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg leading-tight">{hotel.name}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <WishlistButton hotelId={hotel.id} />
                  <Badge variant="secondary">
                    {hotel.rating.toFixed(1)}
                  </Badge>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="capitalize">{hotel.city}</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hotel.amenities.slice(0, 4).map((a) => (
                  <Badge key={a} variant="outline" className="text-xs capitalize">
                    {a}
                  </Badge>
                ))}
                {hotel.amenities.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{hotel.amenities.length - 4}
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('totalFrom')}</p>
                <p className="text-lg font-bold">{formatHalalas(hotel.fromTotal)}</p>
              </div>
              <Button nativeButton={false} render={<Link href={href} />}>{t('viewRooms')}</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
