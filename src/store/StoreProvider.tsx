'use client';

import { useEffect, useMemo } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './makeStore';
import { hydrateWishlist } from '@/features/wishlist/wishlistSlice';

function WishlistHydrator({ store }: { store: ReturnType<typeof makeStore> }) {
  useEffect(() => {
    store.dispatch(hydrateWishlist());
  }, [store]);
  return null;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => makeStore(), []);
  return (
    <Provider store={store}>
      <WishlistHydrator store={store} />
      {children}
    </Provider>
  );
}
