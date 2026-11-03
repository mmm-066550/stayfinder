'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { CalendarCheck } from 'lucide-react';
import { useListBookingsQuery } from '../bookingsApi';
import { BookingCard } from './BookingCard';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/store/baseApi';

export function BookingsPage() {
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useListBookingsQuery();

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      toast.success('Your booking has been confirmed!');
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </div>
    );
  }

  const bookings = data?.bookings ?? [];

  const refundableMap = new Map<string, boolean>();

  const sorted = [...bookings].sort((a, b) => {
    const order: Record<string, number> = { held: 0, confirmed: 1, cancelled: 2, expired: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-10 w-10 text-muted-foreground/50" />}
          title="No bookings yet"
          description="Once you make a reservation, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((booking) => (
            <BookingCard key={booking.id} booking={booking} refundableMap={refundableMap} />
          ))}
        </div>
      )}
    </div>
  );
}
