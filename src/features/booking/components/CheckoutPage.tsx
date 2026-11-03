'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Clock, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useGetBookingQuery, useConfirmBookingMutation } from '../bookingsApi';
import { useHoldCountdown } from '../useHoldCountdown';
import { useAppSelector } from '@/store/hooks';
import { selectActiveHold } from '../bookingSlice';
import { isAppApiError, getErrorMessage } from '@/store/baseApi';
import { guestSchema, type GuestInput } from '@/domain/schemas';
import { formatHalalas } from '@/domain/money';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface CheckoutPageProps {
  bookingId: string;
}

function useStableId(): string {
  const [id] = useState(() => crypto.randomUUID());
  return id;
}

export function CheckoutPage({ bookingId }: CheckoutPageProps) {
  const router = useRouter();
  const t = useTranslations('checkout');
  const tHotel = useTranslations('hotel');
  const activeHold = useAppSelector(selectActiveHold);
  const fallbackKey = useStableId();
  const { data, isLoading, isError, error, refetch } = useGetBookingQuery(bookingId, {
    pollingInterval: 30000,
  });

  const [confirmBooking, { isLoading: isConfirming }] = useConfirmBookingMutation();

  const idempotencyKey = activeHold?.bookingId === bookingId
    ? activeHold.idempotencyKey
    : fallbackKey;

  const booking = data?.booking;
  const serverTime = data?.serverTime ?? new Date().toISOString();

  const { formatted, isExpired, isWarning, isLoading: countdownLoading } = useHoldCountdown({
    holdExpiresAt: booking?.holdExpiresAt ?? null,
    serverTime,
  });

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<GuestInput>({
    resolver: zodResolver(guestSchema),
  });

  const onSubmit = useCallback(async (guest: GuestInput) => {
    try {
      await confirmBooking({
        bookingId,
        idempotencyKey,
        guest,
      }).unwrap();
      toast.success(t('confirmed'));
      router.push('/bookings?confirmed=true');
    } catch (err) {
      if (isAppApiError(err)) {
        if (err.data.error.code === 'HOLD_EXPIRED') {
          toast.error(t('expired'));
          return;
        }
      }
      toast.error(getErrorMessage(err));
    }
  }, [bookingId, idempotencyKey, confirmBooking, router, t]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </div>
    );
  }

  if (!booking) return null;

  if (booking.status === 'confirmed') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">{t('alreadyConfirmed')}</h1>
        <p className="text-muted-foreground">{t('alreadyConfirmedDesc')}</p>
        <Button nativeButton={false} render={<Link href="/bookings" />}>{t('viewBookings')}</Button>
      </div>
    );
  }

  if (booking.status === 'expired' || (!countdownLoading && isExpired)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">{t('holdExpired')}</h1>
        <p className="text-muted-foreground">{t('holdExpiredDesc')}</p>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t('backToSearch')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href={`/hotels/${booking.hotelId}?checkIn=${booking.checkIn}&checkOut=${booking.checkOut}&adults=${booking.adults}`} />}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        {t('backToHotel')}
      </Button>

      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('holdTimer')}</CardTitle>
            <Badge
              variant={isWarning ? 'destructive' : 'secondary'}
              className="flex items-center gap-1 text-sm"
            >
              <Clock className="h-3.5 w-3.5" />
              {formatted}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>{booking.checkIn} — {booking.checkOut}</span>
            <span>{tHotel('adults', { count: booking.adults })}</span>
          </div>
          <div className="mt-2 flex justify-between font-medium text-foreground">
            <span>{tHotel('total')}</span>
            <span>{formatHalalas(booking.quote.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('guestDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input id="fullName" {...register('fullName')} placeholder="John Doe" />
              {formErrors.fullName && (
                <p className="text-xs text-destructive">{formErrors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
              {formErrors.email && (
                <p className="text-xs text-destructive">{formErrors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input id="phone" {...register('phone')} placeholder="+966 50 000 0000" />
              {formErrors.phone && (
                <p className="text-xs text-destructive">{formErrors.phone.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isConfirming || isExpired}>
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('confirming')}
                </>
              ) : (
                t('confirm')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
