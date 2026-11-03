'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { searchParamsToUrl } from '../searchParams';
import type { SearchParams } from '@/domain/schemas';
import { formatHalalas } from '@/domain/money';

interface SearchFiltersProps {
  params: SearchParams;
}

const MAX = 500000;

export function SearchFilters({ params }: SearchFiltersProps) {
  const router = useRouter();
  const t = useTranslations('filters');
  const [localPrice, setLocalPrice] = useState(params.maxPrice ?? MAX);

  useEffect(() => {
    setLocalPrice(params.maxPrice ?? MAX);
  }, [params.maxPrice]);

  const update = (patch: Partial<SearchParams>) => {
    router.push(searchParamsToUrl({ ...params, ...patch }));
  };

  const commitPrice = (val: number | readonly number[]) => {
    const v = Array.isArray(val) ? val[0] : val;
    const next = { ...params };
    if (v >= MAX) {
      delete next.maxPrice;
    } else {
      next.maxPrice = v;
    }
    router.push(searchParamsToUrl(next));
  };

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg bg-card p-4 border border-border/50 shadow-sm">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t('sort')}</Label>
        <Select value={params.sort ?? 'price'} onValueChange={(v) => update({ sort: v as 'price' | 'rating' })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">{t('price')}</SelectItem>
            <SelectItem value="rating">{t('rating')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{t('stars')}</Label>
        <Select
          value={params.stars !== undefined ? String(params.stars) : 'all'}
          onValueChange={(v) => {
            const next = { ...params };
            if (v === 'all') {
              delete next.stars;
            } else {
              next.stars = Number(v) as 1 | 2 | 3 | 4 | 5;
            }
            router.push(searchParamsToUrl(next));
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStars')}</SelectItem>
            {[5, 4, 3, 2, 1].map((s) => (
              <SelectItem key={s} value={String(s)}>
                {t('starCount', { count: s })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 min-w-[200px] flex-1">
        <div className="flex items-baseline justify-between">
          <Label className="text-xs font-medium">{t('maxPrice')}</Label>
          <span className="text-sm font-semibold tabular-nums">
            {localPrice >= MAX ? t('any') : formatHalalas(localPrice)}
          </span>
        </div>
        <Slider
          min={0}
          max={MAX}
          step={5000}
          value={[localPrice]}
          onValueChange={(val) => {
            const v = Array.isArray(val) ? val[0] : val;
            setLocalPrice(v);
          }}
          onValueCommitted={commitPrice}
        />
      </div>
    </div>
  );
}
