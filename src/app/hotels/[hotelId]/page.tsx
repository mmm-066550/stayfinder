import { Suspense } from 'react';
import { HotelDetailPage } from '@/features/hotels/components/HotelDetailPage';

export default async function HotelPage({ params }: PageProps<'/hotels/[hotelId]'>) {
  const { hotelId } = await params;
  return (
    <Suspense>
      <HotelDetailPage hotelId={hotelId} />
    </Suspense>
  );
}
