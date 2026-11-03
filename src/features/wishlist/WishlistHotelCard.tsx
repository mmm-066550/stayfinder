'use client';

import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WishlistButton } from './WishlistButton';
import type { Hotel } from '@/domain/types';

interface WishlistHotelCardProps {
  hotel: Hotel;
}

export function WishlistHotelCard({ hotel }: WishlistHotelCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <Link href={`/hotels/${hotel.id}`} className="flex flex-col sm:flex-row">
          <div className="h-32 w-full bg-muted sm:h-auto sm:w-40 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <div className="flex flex-1 items-center justify-between gap-3 p-4">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{hotel.name}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="capitalize">{hotel.city}</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {hotel.amenities.slice(0, 3).map((a) => (
                  <Badge key={a} variant="outline" className="text-xs capitalize">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{hotel.rating.toFixed(1)}</Badge>
              <WishlistButton hotelId={hotel.id} />
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
