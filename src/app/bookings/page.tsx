import { Suspense } from 'react';
import { BookingsPage } from '@/features/booking/components/BookingsPage';

export default function BookingsRoute() {
  return (
    <Suspense>
      <BookingsPage />
    </Suspense>
  );
}
