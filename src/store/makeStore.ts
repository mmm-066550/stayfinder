import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import { bookingSlice } from '@/features/booking/bookingSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [bookingSlice.reducerPath]: bookingSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
