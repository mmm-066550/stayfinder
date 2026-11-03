'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
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
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">City</Label>
          <Select value={city} onValueChange={(v) => setCity(v as City)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Check-in</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" className="w-full justify-start text-left font-normal" />
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Pick date'}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(d) => {
                  setCheckIn(d ?? undefined);
                  if (d && (!checkOut || checkOut <= d)) {
                    setCheckOut(addDays(d, 1));
                  }
                }}
                disabled={{ before: today }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Check-out</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" className="w-full justify-start text-left font-normal" />
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Pick date'}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(d) => setCheckOut(d ?? undefined)}
                disabled={{ before: checkIn ? addDays(checkIn, 1) : addDays(today, 1) }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Adults</Label>
          <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
            <SelectTrigger className="w-full">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? 'Adult' : 'Adults'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleSearch}
            className="w-full"
            disabled={!city || !checkIn || !checkOut}
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
