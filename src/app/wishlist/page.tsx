import { Suspense } from 'react';
import { WishlistPage } from '@/features/wishlist/WishlistPage';

export default function WishlistRoute() {
  return (
    <Suspense>
      <WishlistPage />
    </Suspense>
  );
}
