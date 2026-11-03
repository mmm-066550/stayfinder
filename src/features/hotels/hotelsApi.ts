import { baseApi } from '@/store/baseApi';
import type { Hotel, HotelSearchResult, HotelDetail } from '@/domain/types';
import type { SearchParams } from '@/domain/schemas';

export const hotelsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchHotels: build.query<HotelSearchResult[], SearchParams>({
      query: (params) => {
        const sp = new URLSearchParams();
        sp.set('city', params.city);
        sp.set('checkIn', params.checkIn);
        sp.set('checkOut', params.checkOut);
        sp.set('adults', String(params.adults));
        if (params.maxPrice !== undefined) sp.set('maxPrice', String(params.maxPrice));
        if (params.stars !== undefined) sp.set('stars', String(params.stars));
        if (params.sort) sp.set('sort', params.sort);
        return `/hotels?${sp.toString()}`;
      },
      providesTags: ['Hotels'],
    }),

    getHotel: build.query<
      HotelDetail,
      { hotelId: string; checkIn: string; checkOut: string; adults: number }
    >({
      query: ({ hotelId, checkIn, checkOut, adults }) =>
        `/hotels/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`,
      providesTags: (_result, _err, arg) => [{ type: 'Hotel', id: arg.hotelId }],
    }),

    getWishlistHotels: build.query<Hotel[], string[]>({
      query: (ids) => `/hotels/wishlist?ids=${ids.join(',')}`,
      providesTags: ['Hotels'],
    }),
  }),
});

export const { useSearchHotelsQuery, useGetHotelQuery, useGetWishlistHotelsQuery } = hotelsApi;
