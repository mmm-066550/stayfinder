'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { useTranslations } from 'next-intl';
import { CalendarIcon, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchParamsToUrl } from '../searchParams';
import type { SearchParams } from '@/domain/schemas';
import type { City } from '@/domain/types';

interface SearchBarProps {
  initial?: Partial<SearchParams>;
}

const cities: { value: City; label: string }[] = [
  { value: 'riyadh', label: 'Riyadh' },
  { value: 'jeddah', label: 'Jeddah' },
  { value: 'dubai', label: 'Dubai' },
];

export function SearchBar({ initial }: SearchBarProps) {
  const router = useRouter();
  const t = useTranslations('search');
  const [city, setCity] = useState<City | ''>(initial?.city ?? '');
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    initial?.checkIn ? new Date(initial.checkIn + 'T00:00:00') : undefined,
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    initial?.checkOut ? new Date(initial.checkOut + 'T00:00:00') : undefined,
  );
  const [adults, setAdults] = useState(initial?.adults ?? 2);

  const handleSearch = () => {
    if (!city || !checkIn || !checkOut) return;
    const params: Partial<SearchParams> = {
      city,
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd'),
      adults,
    };
    router.push(searchParamsToUrl(params));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <div className="p-3 sm:p-4 lg:border-e border-border/40">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t('city')}</Label>
          <Select value={city} onValueChange={(v) => setCity(v as City)}>
            <SelectTrigger className="w-full border-0 shadow-none px-0 h-8 text-sm font-medium focus:ring-0">
              <SelectValue placeholder={t('selectCity')} />
            </SelectTrigger>
            <SelectContent sideOffset={12} alignItemWithTrigger={false} className="rounded-lg shadow-xl border border-border/60">
              {cities.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 sm:p-4 border-t sm:border-t-0 lg:border-e border-border/40">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t('checkIn')}</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="ghost" className="w-full justify-start text-start font-medium px-0 h-8 hover:bg-transparent" />
              }
            >
              <CalendarIcon className="me-2 h-4 w-4 text-muted-foreground" />
              {checkIn ? format(checkIn, 'MMM d, yyyy') : <span className="text-muted-foreground">{t('pickDate')}</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-lg shadow-xl border border-border/60" align="start" sideOffset={12}>
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(d) => {
                  setCheckIn(d ?? undefined);
                  if (d && (!checkOut || checkOut <= d)) {
                    setCheckOut(addDays(d, 1));
                  }
                  if (d && checkOut && checkOut > addDays(d, 14)) {
                    setCheckOut(addDays(d, 14));
                  }
                }}
                disabled={{ before: today }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="p-3 sm:p-4 border-t lg:border-t-0 lg:border-e border-border/40">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t('checkOut')}</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="ghost" className="w-full justify-start text-start font-medium px-0 h-8 hover:bg-transparent" />
              }
            >
              <CalendarIcon className="me-2 h-4 w-4 text-muted-foreground" />
              {checkOut ? format(checkOut, 'MMM d, yyyy') : <span className="text-muted-foreground">{t('pickDate')}</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-lg shadow-xl border border-border/60" align="start" sideOffset={12}>
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(d) => setCheckOut(d ?? undefined)}
                disabled={{
                  before: checkIn ? addDays(checkIn, 1) : addDays(today, 1),
                  after: checkIn ? addDays(checkIn, 14) : addDays(today, 14),
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="p-3 sm:p-4 border-t lg:border-t-0 lg:border-e border-border/40">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t('guests')}</Label>
          <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
            <SelectTrigger className="w-full border-0 shadow-none px-0 h-8 text-sm font-medium focus:ring-0">
              <Users className="me-2 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent sideOffset={12} alignItemWithTrigger={false} className="rounded-lg shadow-xl border border-border/60">
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {t('adultsCount', { count: n })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 sm:p-4 border-t lg:border-t-0 flex items-center">
          <Button
            onClick={handleSearch}
            className="w-full lg:w-auto lg:px-8 h-11 rounded-lg text-sm font-semibold"
            disabled={!city || !checkIn || !checkOut}
            size="lg"
          >
            <Search className="me-2 h-4 w-4" />
            {t('search')}
          </Button>
        </div>
      </div>
    </div>
  );
}
