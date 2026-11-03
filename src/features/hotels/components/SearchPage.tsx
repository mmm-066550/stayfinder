'use client';

import { useSearchParams } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { SearchFilters } from './SearchFilters';
import { HotelList } from './HotelList';
import { urlToSearchParams, isSearchReady } from '../searchParams';

export function SearchPage() {
  const searchParams = useSearchParams();
  const params = urlToSearchParams(searchParams);
  const ready = isSearchReady(params);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Find Your Perfect Stay</h1>
        <p className="text-muted-foreground text-sm">Search hotels across Riyadh, Jeddah, and Dubai</p>
      </div>

      <SearchBar initial={params} />

      {ready && (
        <>
          <SearchFilters params={params} />
          <HotelList params={params} />
        </>
      )}

      {!ready && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Where are you going?</p>
          <p className="text-sm mt-1">Select a city and dates to start searching.</p>
        </div>
      )}
    </div>
  );
}
