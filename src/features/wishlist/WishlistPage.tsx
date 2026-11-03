'use client';

import { Heart, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { selectWishlist } from './wishlistSlice';
import { useGetWishlistHotelsQuery } from '@/features/hotels/hotelsApi';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { WishlistHotelCard } from './WishlistHotelCard';

export function WishlistPage() {
  const t = useTranslations('wishlist');
  const hotelIds = useAppSelector(selectWishlist);
  const { data: hotels, isLoading, isError, error, refetch } = useGetWishlistHotelsQuery(hotelIds, {
    skip: hotelIds.length === 0,
  });

  const isEmpty = hotelIds.length === 0;

  if (isLoading) {
    return (
      <div>
        <div className="bg-primary">
          <div className="mx-auto max-w-5xl px-4 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-36 bg-white/10" />
                <Skeleton className="h-4 w-28 bg-white/10" />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-card overflow-hidden">
                <Skeleton className="h-44 w-full" />
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorState message={String(error)} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-primary">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/15">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">{t('title')}</h1>
              <p className="text-primary-foreground/60 text-sm">
                {isEmpty ? t('subtitle') : t('hotels', { count: hotels?.length ?? 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t('empty')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('emptyDesc')}</p>
            </div>
            <Button nativeButton={false} render={<Link href="/" />} className="mt-2">
              <Search className="me-2 h-4 w-4" />
              {t('emptyAction')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hotels?.map((hotel) => (
              <WishlistHotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
