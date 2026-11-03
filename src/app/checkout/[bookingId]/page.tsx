import { Suspense } from 'react';
import { CheckoutPage } from '@/features/booking/components/CheckoutPage';

export default async function CheckoutRoute({ params }: PageProps<'/checkout/[bookingId]'>) {
  const { bookingId } = await params;
  return (
    <Suspense>
      <CheckoutPage bookingId={bookingId} />
    </Suspense>
  );
}
