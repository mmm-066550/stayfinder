import { baseApi } from '@/store/baseApi';
import type { Booking, Guest } from '@/domain/types';

interface HoldRequest {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  quotedTotal: number;
}

interface HoldResponse {
  booking: Booking;
  serverTime: string;
}

interface BookingResponse {
  booking: Booking;
  serverTime: string;
}

interface BookingsListResponse {
  bookings: Booking[];
  serverTime: string;
}

interface ConfirmRequest {
  bookingId: string;
  idempotencyKey: string;
  guest: Guest;
}

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createHold: build.mutation<HoldResponse, HoldRequest>({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Hotels', 'Bookings'],
    }),

    getBooking: build.query<BookingResponse, string>({
      query: (bookingId) => `/bookings/${bookingId}`,
      providesTags: (_result, _err, id) => [{ type: 'Booking', id }],
    }),

    listBookings: build.query<BookingsListResponse, void>({
      query: () => '/bookings',
      providesTags: (result) =>
        result
          ? [
              ...result.bookings.map((b) => ({ type: 'Booking' as const, id: b.id })),
              'Bookings',
            ]
          : ['Bookings'],
    }),

    confirmBooking: build.mutation<{ booking: Booking }, ConfirmRequest>({
      query: ({ bookingId, idempotencyKey, guest }) => ({
        url: `/bookings/${bookingId}/confirm`,
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: guest,
      }),
      invalidatesTags: (_result, _err, { bookingId }) => [
        { type: 'Booking', id: bookingId },
        'Bookings',
      ],
    }),

    cancelBooking: build.mutation<{ booking: Booking }, string>({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}/cancel`,
        method: 'POST',
      }),
      async onQueryStarted(bookingId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          bookingsApi.util.updateQueryData('listBookings', undefined, (draft) => {
            const booking = draft.bookings.find((b) => b.id === bookingId);
            if (booking) {
              booking.status = 'cancelled';
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _err, bookingId) => [
        { type: 'Booking', id: bookingId },
        'Bookings',
      ],
    }),
  }),
});

export const {
  useCreateHoldMutation,
  useGetBookingQuery,
  useListBookingsQuery,
  useConfirmBookingMutation,
  useCancelBookingMutation,
} = bookingsApi;
