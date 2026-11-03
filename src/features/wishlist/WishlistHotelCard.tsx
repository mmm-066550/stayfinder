'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WishlistButton } from './WishlistButton';
import type { Hotel } from '@/domain/types';

interface WishlistHotelCardProps {
  hotel: Hotel;
}

export function WishlistHotelCard({ hotel }: WishlistHotelCardProps) {
  const t = useTranslations('hotel');
  const tWishlist = useTranslations('wishlist');
  const ratingLabel = hotel.rating >= 4.5 ? t('excellent') : hotel.rating >= 4.0 ? t('veryGood') : hotel.rating >= 3.5 ? t('good') : t('pleasant');

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg border-border/50">
      <CardContent className="p-0">
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={hotel.image}
            alt={hotel.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 end-3">
            <WishlistButton hotelId={hotel.id} className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm" />
          </div>
          <div className="absolute bottom-3 start-3 flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold h-7 min-w-7 px-1.5">
              {hotel.rating.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-white drop-shadow">{ratingLabel}</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors">
              {hotel.name}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="capitalize">{hotel.city}</span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 4).map((a) => (
              <span key={a} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground capitalize">
                {a}
              </span>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            nativeButton={false}
            render={<Link href={`/hotels/${hotel.id}`} />}
          >
            {tWishlist('viewHotel')}
            <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
