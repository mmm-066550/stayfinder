'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/store/hooks';
import { selectWishlist } from './wishlistSlice';
import { useGetWishlistHotelsQuery } from '@/features/hotels/hotelsApi';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { WishlistHotelCard } from './WishlistHotelCard';

export function WishlistPage() {
  const t = useTranslations('wishlist');
  const hotelIds = useAppSelector(selectWishlist);
  const { data: hotels, isLoading, isError, error, refetch } = useGetWishlistHotelsQuery(hotelIds, {
    skip: hotelIds.length === 0,
  });

  if (hotelIds.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        <EmptyState
          icon={<Heart className="h-10 w-10 text-muted-foreground/40" />}
          title={t('empty')}
          description={t('emptyDesc')}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        <ErrorState message={String(error)} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        {t('title')}
        <span className="text-base font-normal text-muted-foreground ms-2">
          {t('hotels', { count: hotels?.length ?? 0 })}
        </span>
      </h1>
      <div className="space-y-4">
        {hotels?.map((hotel) => (
          <WishlistHotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}
