import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/makeStore';
import type { Quote } from '@/domain/types';

interface ActiveHold {
  bookingId: string;
  hotelId: string;
  roomId: string;
  holdExpiresAt: string;
  serverTime: string;
  quote: Quote;
  idempotencyKey: string;
}

interface BookingState {
  activeHold: ActiveHold | null;
}

const initialState: BookingState = {
  activeHold: null,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setActiveHold(state, action: PayloadAction<ActiveHold>) {
      state.activeHold = action.payload;
    },
    clearActiveHold(state) {
      state.activeHold = null;
    },
  },
});

export const { setActiveHold, clearActiveHold } = bookingSlice.actions;

const selectBookingState = (state: RootState) => state.booking;

export const selectActiveHold = createSelector(
  selectBookingState,
  (booking) => booking.activeHold,
);
