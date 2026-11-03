import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiErrorResponse } from '@/domain/types';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Hotels', 'Hotel', 'Bookings', 'Booking'],
  endpoints: () => ({}),
});

export type AppApiError = {
  status: number;
  data: ApiErrorResponse;
};

export function isAppApiError(error: unknown): error is AppApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'data' in error &&
    typeof (error as AppApiError).data?.error?.code === 'string'
  );
}

export function getErrorMessage(error: unknown): string {
  if (isAppApiError(error)) {
    return error.data.error.message;
  }
  if (typeof error === 'object' && error !== null && 'error' in error) {
    return String((error as { error: string }).error);
  }
  return 'Something went wrong. Please try again.';
}
