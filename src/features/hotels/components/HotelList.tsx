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
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="h-48 w-full sm:h-40 sm:w-48" />
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-14" />
          </div>
          <div className="flex justify-between items-end">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-28" />
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

  return (
    <div className="space-y-4">
      {isFetching && !isLoading && (
        <div className="text-sm text-muted-foreground text-center py-1">{t('updating')}</div>
      )}
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
