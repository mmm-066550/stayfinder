import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import { bookingSlice } from '@/features/booking/bookingSlice';
import { wishlistSlice } from '@/features/wishlist/wishlistSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [bookingSlice.reducerPath]: bookingSlice.reducer,
      [wishlistSlice.reducerPath]: wishlistSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
