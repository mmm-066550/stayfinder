'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Clock,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CalendarDays,
  Users,
  CreditCard,
  Lock,
  CheckCircle2,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetBookingQuery, useConfirmBookingMutation } from '../bookingsApi';
import { useHoldCountdown } from '../useHoldCountdown';
import { useAppSelector } from '@/store/hooks';
import { selectActiveHold } from '../bookingSlice';
import { isAppApiError, getErrorMessage } from '@/store/baseApi';
import { guestSchema, type GuestInput } from '@/domain/schemas';
import { formatHalalas } from '@/domain/money';
import { ErrorState } from '@/shared/ui/ErrorState';
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
  const tBookings = useTranslations('bookings');
  const activeHold = useAppSelector(selectActiveHold);
  const fallbackKey = useStableId();
  const { data, isLoading, isError, error, refetch } = useGetBookingQuery(bookingId, {
    pollingInterval: 30000,
  });

  const [confirmBooking, { isLoading: isConfirming }] = useConfirmBookingMutation();

  const idempotencyKey =
    activeHold?.bookingId === bookingId ? activeHold.idempotencyKey : fallbackKey;

  const booking = data?.booking;
  const serverTime = data?.serverTime ?? new Date().toISOString();

  const {
    formatted,
    isExpired,
    isWarning,
    isLoading: countdownLoading,
  } = useHoldCountdown({
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

  const onSubmit = useCallback(
    async (guest: GuestInput) => {
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
    },
    [bookingId, idempotencyKey, confirmBooking, router, t],
  );

  const nights = booking?.quote.nights.length ?? 0;

  // --- Loading skeleton ---
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-5">
            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="border-t border-border/50 pt-3">
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </div>
    );
  }

  if (!booking) return null;

  // --- Already confirmed ---
  if (booking.status === 'confirmed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold">{t('alreadyConfirmed')}</h1>
        <p className="text-muted-foreground">{t('alreadyConfirmedDesc')}</p>
        <Button size="lg" nativeButton={false} render={<Link href="/bookings" />}>
          {t('viewBookings')}
        </Button>
      </div>
    );
  }

  // --- Expired ---
  if (booking.status === 'expired' || (!countdownLoading && isExpired)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">{t('holdExpired')}</h1>
        <p className="text-muted-foreground">{t('holdExpiredDesc')}</p>
        <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft className="me-1.5 h-4 w-4" />
          {t('backToSearch')}
        </Button>
      </div>
    );
  }

  // --- Active checkout ---
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-5">
      {/* Back + Title */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link
              href={`/hotels/${booking.hotelId}?checkIn=${booking.checkIn}&checkOut=${booking.checkOut}&adults=${booking.adults}`}
            />
          }
          className="mb-2 -ms-2"
        >
          <ArrowLeft className="me-1 h-4 w-4" />
          {t('backToHotel')}
        </Button>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t('subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column — Guest form */}
        <div className="flex-1 space-y-5">
          {/* Guest Details Card */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">{t('guestDetails')}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{t('guestDetailsDesc')}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    {t('fullName')}
                  </Label>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      {...register('fullName')}
                      placeholder="John Doe"
                      className="ps-9"
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-xs text-destructive">{formErrors.fullName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t('email')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="john@example.com"
                      className="ps-9"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-destructive">{formErrors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    {t('phone')}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+966 50 000 0000"
                      className="ps-9"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-destructive">{formErrors.phone.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2"
                  size="lg"
                  disabled={isConfirming || isExpired}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t('confirming')}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="me-2 h-4 w-4" />
                      {t('confirm')}
                    </>
                  )}
                </Button>
              </form>

              {/* Secure note */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>{t('secureNote')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Timer + Summary */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Hold timer card */}
          <Card
            className={`border-border/50 overflow-hidden pb-0 ${isWarning ? 'border-destructive/50' : ''}`}
          >
            <div
              className={`px-4 py-3 flex items-center justify-between ${isWarning ? 'bg-destructive/10 dark:bg-destructive/20' : 'bg-primary/5 dark:bg-primary/10'}`}
            >
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Clock
                  className={`h-4 w-4 ${isWarning ? 'text-destructive animate-pulse' : 'text-primary'}`}
                />
                {t('reservationHeld')}
              </span>
              <Badge
                variant={isWarning ? 'destructive' : 'secondary'}
                className="text-sm font-mono tabular-nums px-2.5"
              >
                {formatted}
              </Badge>
            </div>
          </Card>

          {/* Booking summary card */}
          <Card className="border-border/50 shadow-sm sticky top-4">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{t('priceSummary')}</h3>
              </div>

              {/* Stay info */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {t('stayDates')}
                  </span>
                </div>
                <div className="text-sm font-medium ps-5">
                  {booking.checkIn} — {booking.checkOut}
                  <span className="text-muted-foreground font-normal ms-1.5">
                    ({tBookings('nights', { count: nights })})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {t('guests')}
                  </span>
                  <span className="font-medium">
                    {tHotel('adults', { count: booking.adults })}
                  </span>
                </div>

                {booking.refundable && (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{tHotel('refundable')}</span>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="mt-4 pt-4 border-t border-border/50 space-y-2 text-sm">
                {booking.quote.nights.map((n) => (
                  <div key={n.date} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {n.date}
                      {n.isWeekend && (
                        <Badge
                          variant="secondary"
                          className="ms-1.5 text-[10px] px-1 py-0"
                        >
                          {tHotel('weekend')}
                        </Badge>
                      )}
                    </span>
                    <span className="tabular-nums">{formatHalalas(n.rate)}</span>
                  </div>
                ))}

                <div className="flex justify-between pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">{t('subtotal')}</span>
                  <span className="tabular-nums">{formatHalalas(booking.quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('vat')}</span>
                  <span className="tabular-nums">{formatHalalas(booking.quote.vat)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                <span className="font-semibold">{t('total')}</span>
                <span className="text-xl font-bold text-primary">
                  {formatHalalas(booking.quote.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
