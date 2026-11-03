import type { SearchParams } from '@/domain/schemas';

export function searchParamsToUrl(params: Partial<SearchParams>): string {
  const sp = new URLSearchParams();
  if (params.city) sp.set('city', params.city);
  if (params.checkIn) sp.set('checkIn', params.checkIn);
  if (params.checkOut) sp.set('checkOut', params.checkOut);
  if (params.adults) sp.set('adults', String(params.adults));
  if (params.maxPrice !== undefined) sp.set('maxPrice', String(params.maxPrice));
  if (params.stars !== undefined) sp.set('stars', String(params.stars));
  if (params.sort) sp.set('sort', params.sort);
  return `/?${sp.toString()}`;
}

export function urlToSearchParams(sp: URLSearchParams): Partial<SearchParams> {
  const result: Partial<SearchParams> = {};
  const city = sp.get('city');
  if (city === 'riyadh' || city === 'jeddah' || city === 'dubai') result.city = city;
  if (sp.get('checkIn')) result.checkIn = sp.get('checkIn')!;
  if (sp.get('checkOut')) result.checkOut = sp.get('checkOut')!;
  const adults = sp.get('adults');
  if (adults) result.adults = Number(adults);
  const maxPrice = sp.get('maxPrice');
  if (maxPrice) result.maxPrice = Number(maxPrice);
  const stars = sp.get('stars');
  if (stars) result.stars = Number(stars) as 1 | 2 | 3 | 4 | 5;
  const sort = sp.get('sort');
  if (sort === 'price' || sort === 'rating') result.sort = sort;
  return result;
}

export function isSearchReady(params: Partial<SearchParams>): params is SearchParams {
  return Boolean(params.city && params.checkIn && params.checkOut && params.adults);
}
