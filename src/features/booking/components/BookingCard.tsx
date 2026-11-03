'use client';

import { toast } from 'sonner';
import { CalendarDays, User, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCancelBookingMutation } from '../bookingsApi';
import { isAppApiError, getErrorMessage } from '@/store/baseApi';
import { formatHalalas } from '@/domain/money';
import type { Booking } from '@/domain/types';

interface BookingCardProps {
  booking: Booking;
  refundableMap: Map<string, boolean>;
}

const statusColors: Record<string, string> = {
  held: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
  expired: 'bg-red-100 text-red-700',
};

export function BookingCard({ booking, refundableMap }: BookingCardProps) {
  const [cancelBooking, { isLoading }] = useCancelBookingMutation();
  const isRefundable = refundableMap.get(booking.roomId) ?? true;

  const handleCancel = async () => {
    try {
      await cancelBooking(booking.id).unwrap();
      toast.success('Booking cancelled.');
    } catch (err) {
      if (isAppApiError(err) && err.data.error.code === 'NOT_REFUNDABLE') {
        toast.error('This room is non-refundable.');
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Booking #{booking.id.slice(0, 8)}</span>
              <Badge className={`text-xs ${statusColors[booking.status]}`}>
                {booking.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {booking.checkIn} — {booking.checkOut}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {booking.adults} {booking.adults === 1 ? 'adult' : 'adults'}
              </span>
            </div>
            {booking.guest && (
              <p className="text-sm text-muted-foreground">{booking.guest.fullName} · {booking.guest.email}</p>
            )}
          </div>

          <div className="text-right space-y-2">
            <p className="font-bold">{formatHalalas(booking.quote.total)}</p>
            {booking.status === 'confirmed' && (
              isRefundable ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <Ban className="mr-1 h-3.5 w-3.5" />
                  {isLoading ? 'Cancelling...' : 'Cancel'}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Non-refundable</p>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
