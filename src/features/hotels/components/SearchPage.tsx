'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { SearchFilters } from './SearchFilters';
import { HotelList } from './HotelList';
import { urlToSearchParams, isSearchReady } from '../searchParams';

export function SearchPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('search');
  const params = urlToSearchParams(searchParams);
  const ready = isSearchReady(params);

  return (
    <div>
      <div className="bg-primary pb-20 pt-8">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-2">
            {t('title')}
          </h1>
          <p className="text-primary-foreground/70 text-sm sm:text-base">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-14">
        <SearchBar initial={params} />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {ready && (
          <>
            <SearchFilters params={params} />
            <HotelList params={params} />
          </>
        )}

        {!ready && (
          <div className="text-center py-20 text-muted-foreground">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">{t('whereGoing')}</p>
            <p className="text-sm mt-1">{t('whereGoingDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
