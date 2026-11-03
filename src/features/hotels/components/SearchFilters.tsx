'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { searchParamsToUrl } from '../searchParams';
import type { SearchParams } from '@/domain/schemas';
import { formatHalalas } from '@/domain/money';

interface SearchFiltersProps {
  params: SearchParams;
}

export function SearchFilters({ params }: SearchFiltersProps) {
  const router = useRouter();

  const update = (patch: Partial<SearchParams>) => {
    router.push(searchParamsToUrl({ ...params, ...patch }));
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Sort by</Label>
        <Select value={params.sort ?? 'price'} onValueChange={(v) => update({ sort: v as 'price' | 'rating' })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Stars</Label>
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
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stars</SelectItem>
            {[5, 4, 3, 2, 1].map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s} Star{s > 1 ? 's' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 min-w-[200px]">
        <Label className="text-xs font-medium">
          Max price: {params.maxPrice ? formatHalalas(params.maxPrice) : 'Any'}
        </Label>
        <Slider
          min={0}
          max={500000}
          step={10000}
          value={[params.maxPrice ?? 500000]}
          onValueChange={(val) => {
            const v = Array.isArray(val) ? val[0] : val;
            const next = { ...params };
            if (v >= 500000) {
              delete next.maxPrice;
            } else {
              next.maxPrice = v;
            }
            router.push(searchParamsToUrl(next));
          }}
        />
      </div>
    </div>
  );
}
