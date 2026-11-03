import { Suspense } from 'react';
import { SearchPage } from '@/features/hotels/components/SearchPage';

export default function Home() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
