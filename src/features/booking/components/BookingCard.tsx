'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CalendarDays, User, Ban, CheckCircle2, Clock, XCircle, AlertTriangle, Copy, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCancelBookingMutation } from '../bookingsApi';
import { isAppApiError } from '@/store/baseApi';
import { formatHalalas } from '@/domain/money';
import type { Booking } from '@/domain/types';

interface BookingCardProps {
  booking: Booking;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; strip: string; icon: React.ReactNode }> = {
  held: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', strip: 'bg-amber-400', icon: <Clock className="h-3.5 w-3.5" /> },
  confirmed: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', strip: 'bg-green-500', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  cancelled: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', strip: 'bg-muted-foreground/30', icon: <XCircle className="h-3.5 w-3.5" /> },
  expired: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', strip: 'bg-red-400', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

function getNightCount(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn + 'T00:00:00');
  const d2 = new Date(checkOut + 'T00:00:00');
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
}

export function BookingCard({ booking }: BookingCardProps) {
  const t = useTranslations('bookings');
  const tHotel = useTranslations('hotel');
  const [cancelBooking, { isLoading }] = useCancelBookingMutation();
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[booking.status] ?? statusConfig.expired;
  const nights = getNightCount(booking.checkIn, booking.checkOut);

  const handleCancel = async () => {
    try {
      await cancelBooking(booking.id).unwrap();
      toast.success(t('cancelSuccess'));
    } catch (err) {
      if (isAppApiError(err) && err.data.error.code === 'NOT_REFUNDABLE') {
        toast.error(t('nonRefundable'));
      } else {
        toast.error(t('cancelFail'));
      }
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.id);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-border/50">
      <CardContent className="p-0">
        <div className="flex">
          <div className={`w-1.5 shrink-0 ${status.strip}`} />
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge className={`text-xs gap-1.5 px-2.5 py-1 ${status.bg} ${status.text} border ${status.border}`}>
                    {status.icon}
                    {t(`status.${booking.status}`)}
                  </Badge>
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors group"
                    title={t('bookingId')}
                  >
                    #{booking.id.slice(0, 8)}
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {booking.checkIn} — {booking.checkOut}
                  </span>
                  <span className="text-muted-foreground">
                    {t('nights', { count: nights })}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    {tHotel('adults', { count: booking.adults })}
                  </span>
                </div>

                {booking.guest && (
                  <p className="text-sm text-muted-foreground">{booking.guest.fullName} · {booking.guest.email}</p>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                <div className="text-end">
                  <p className="text-2xl font-bold tracking-tight">{formatHalalas(booking.quote.total)}</p>
                  {!booking.refundable && booking.status !== 'cancelled' && (
                    <p className="text-xs text-muted-foreground mt-0.5">{t('nonRefundable')}</p>
                  )}
                </div>
                {booking.status === 'confirmed' && booking.refundable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Ban className="me-1.5 h-3.5 w-3.5" />
                    {isLoading ? t('cancelling') : t('cancel')}
                  </Button>
                )}
              </div>
            </div>

            {/* Expand/Collapse button */}
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-muted-foreground -ms-2"
              >
                {expanded ? (
                  <ChevronUp className="me-1 h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="me-1 h-3.5 w-3.5" />
                )}
                {expanded ? t('lessDetails') : t('moreDetails')}
              </Button>
              {booking.refundable && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {tHotel('refundable')}
                </span>
              )}
            </div>

            {/* Expandable details */}
            {expanded && (
              <div className="mt-3 space-y-2 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                {booking.quote.nights.map((n) => (
                  <div key={n.date} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {n.date}
                      {n.isWeekend && (
                        <Badge variant="secondary" className="ms-1.5 text-[10px] px-1 py-0">
                          {tHotel('weekend')}
                        </Badge>
                      )}
                    </span>
                    <span className="tabular-nums">{formatHalalas(n.rate)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/50 space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{tHotel('subtotal')}</span>
                    <span className="tabular-nums">{formatHalalas(booking.quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{tHotel('vat')}</span>
                    <span className="tabular-nums">{formatHalalas(booking.quote.vat)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>{tHotel('total')}</span>
                    <span className="tabular-nums">{formatHalalas(booking.quote.total)}</span>
                  </div>
                </div>
                {booking.guest && (
                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <p className="text-muted-foreground">{t('guestName')}: <span className="text-foreground">{booking.guest.fullName}</span></p>
                    <p className="text-muted-foreground">{t('guestEmail')}: <span className="text-foreground">{booking.guest.email}</span></p>
                    {booking.guest.phone && (
                      <p className="text-muted-foreground">{t('guestPhone')}: <span className="text-foreground">{booking.guest.phone}</span></p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
