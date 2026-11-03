import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/makeStore';

const STORAGE_KEY = 'stayfinder:wishlist';

function loadFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

interface WishlistState {
  hotelIds: string[];
}

const initialState: WishlistState = { hotelIds: [] };

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    hydrate(state) {
      state.hotelIds = loadFromStorage();
    },
    toggle(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.hotelIds.indexOf(id);
      if (idx >= 0) {
        state.hotelIds.splice(idx, 1);
      } else {
        state.hotelIds.push(id);
      }
      saveToStorage(state.hotelIds);
    },
  },
});

export const { hydrate: hydrateWishlist, toggle: toggleWishlist } = wishlistSlice.actions;

export const selectWishlist = (state: RootState) => state.wishlist.hotelIds;
export const selectIsWishlisted = (state: RootState, hotelId: string) =>
  state.wishlist.hotelIds.includes(hotelId);
