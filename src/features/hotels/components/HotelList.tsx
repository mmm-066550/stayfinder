'use client';

import { useTranslations } from 'next-intl';
import { useSearchHotelsQuery } from '../hotelsApi';
import { HotelCard } from './HotelCard';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/store/baseApi';
import type { SearchParams } from '@/domain/schemas';

interface HotelListProps {
  params: SearchParams;
}

function HotelSkeleton() {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-3">
      <div className="flex flex-col sm:flex-row-reverse gap-3">
        <Skeleton className="h-48 w-full sm:h-auto sm:w-56 rounded-lg shrink-0" />
        <div className="flex flex-1 flex-col justify-between py-1">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-7 w-7 rounded-md shrink-0" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <div className="flex items-end justify-between border-t border-border/50 pt-3 mt-4">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HotelList({ params }: HotelListProps) {
  const t = useTranslations('search');
  const { data, isLoading, isFetching, isError, error, refetch } = useSearchHotelsQuery(params);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <HotelSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={t('noResults')}
        description={t('noResultsDesc')}
      />
    );
  }

  if (isFetching && !isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <HotelSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          checkIn={params.checkIn}
          checkOut={params.checkOut}
          adults={params.adults}
        />
      ))}
    </div>
  );
}
