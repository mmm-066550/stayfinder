'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CalendarCheck, Luggage, Search } from 'lucide-react';
import Link from 'next/link';
import { useListBookingsQuery } from '../bookingsApi';
import { BookingCard } from './BookingCard';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/store/baseApi';

type Tab = 'all' | 'active' | 'past';

export function BookingsPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('bookings');
  const { data, isLoading, isError, error, refetch } = useListBookingsQuery();
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      toast.success(t('bookingSuccess'));
    }
  }, [searchParams, t]);

  const bookings = useMemo(() => data?.bookings ?? [], [data]);

  const sorted = useMemo(() =>
    [...bookings].sort((a, b) => {
      const order: Record<string, number> = { held: 0, confirmed: 1, cancelled: 2, expired: 3 };
      return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    }),
    [bookings],
  );

  const filtered = useMemo(() => {
    if (tab === 'active') return sorted.filter((b) => b.status === 'held' || b.status === 'confirmed');
    if (tab === 'past') return sorted.filter((b) => b.status === 'cancelled' || b.status === 'expired');
    return sorted;
  }, [sorted, tab]);

  const activeCount = bookings.filter((b) => b.status === 'held' || b.status === 'confirmed').length;
  const pastCount = bookings.filter((b) => b.status === 'cancelled' || b.status === 'expired').length;

  if (isLoading) {
    return (
      <div>
        <div className="bg-primary">
          <div className="mx-auto max-w-3xl px-4 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-40 bg-white/10" />
                <Skeleton className="h-4 w-28 bg-white/10" />
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-3xl px-4 pb-4">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-20 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-16 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-card overflow-hidden">
              <div className="flex">
                <Skeleton className="w-1.5 shrink-0" />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-52" />
                    </div>
                    <Skeleton className="h-8 w-28 shrink-0" />
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
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: t('all'), count: bookings.length },
    { key: 'active', label: t('active'), count: activeCount },
    { key: 'past', label: t('past'), count: pastCount },
  ];

  return (
    <div>
      <div className="bg-primary">
        <div className="mx-auto max-w-3xl px-4 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/15">
              <Luggage className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">{t('title')}</h1>
              <p className="text-primary-foreground/60 text-sm">{t('subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-4">
          <div className="flex gap-2">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === key
                    ? 'bg-white text-primary shadow-sm'
                    : 'bg-white/10 text-primary-foreground/80 hover:bg-white/20'
                }`}
              >
                {label}
                <span className={`text-xs font-semibold ${tab === key ? 'text-primary/60' : 'text-primary-foreground/50'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted">
              <CalendarCheck className="h-8 w-8 text-muted-foreground/50" />
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
          filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </div>
    </div>
  );
}
