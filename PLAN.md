# StayFinder — Implementation Plan & Progress

> Booking.com-style hotel booking app | Next.js 16 + Redux Toolkit + TypeScript
> Priority: **correctness under failure > sound state decisions > clear structure > visual polish**

---

## Tech Stack
| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| State | Redux Toolkit + RTK Query |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Validation | Zod (shared schemas: forms + API) |
| Forms | react-hook-form + @hookform/resolvers |
| Date picker | react-day-picker (shadcn/ui Calendar) |
| Tests | Vitest + Testing Library |
| Dates | date-fns |
| i18n | next-intl (B4 Arabic RTL) |

---

## Progress Tracker

### Phase 1: Project Scaffold & Domain Layer

- [x] **Commit 1 — Project setup**
  - Next.js 16 + TypeScript strict + Tailwind + shadcn/ui
  - All deps installed (RTK, Zod, date-fns, vitest, uuid, react-hook-form)
  - 16 shadcn/ui components (button, card, input, skeleton, badge, dialog, select, calendar, popover, label, separator, tabs, toast, sonner, dropdown-menu, sheet, slider)
  - `.env.example` with chaos config defaults
  - Folder structure: `src/domain`, `src/server`, `src/store`, `src/features`, `src/shared/ui`

- [x] **Commit 2 — Domain layer (pure TS, shared by client + server)**
  - `domain/types.ts` — Hotel, Room, Quote, Booking, Money, ISODate
  - `domain/dates.ts` — `nights()`, `isWeekendNight()` (Thu/Fri = Gulf weekend)
  - `domain/pricing.ts` — `buildQuote(baseRate, checkIn, checkOut)` — halalas, weekend +25%, VAT 15%
  - `domain/pricing.test.ts` — 7 tests (weekday, Thu, Fri, spec example, VAT rounding, cross-month, full week)
  - `domain/schemas.ts` — Zod v4 schemas: SearchParams, HoldRequest, GuestDetails
  - `domain/money.ts` — `formatHalalas(amount)` → "SAR 400.00"

### Phase 2: Server Layer (Fake Backend) — PRIORITY

- [x] **Commit 3 — Seed data & in-memory DB**
  - `server/db/seed.ts` — 12 hotels × 3 cities (Riyadh 4, Jeddah 4, Dubai 4), 2-3 rooms each, 1-3 units
  - `server/db/memoryDb.ts` — Hotels/rooms/bookings maps, unit availability tracking, hold expiry, idempotency keys

- [x] **Commit 4 — Services layer**
  - `server/services/hotelService.ts` — searchHotels (filter/sort/availability), getHotelWithRooms (quote + unitsLeft)
  - `server/services/bookingService.ts` — createHold (price check), confirmBooking (idempotent), cancelBooking (refundable check), auto-expire

- [x] **Commit 5 — Chaos layer + Route Handlers**
  - `server/withChaos.ts` — Random delay, random 500 (confirm runs first then 500), price change on hold
  - 6 route handlers: GET hotels, GET hotel/:id, GET/POST bookings, GET booking/:id, POST confirm, POST cancel

### Phase 3: Redux Store & RTK Query

- [ ] **Commit 6 — Store wiring + API layer**
  - `store/` — baseApi, makeStore, StoreProvider, typed hooks
  - `features/hotels/hotelsApi.ts` — searchHotels, getHotel (cache tags)
  - `features/booking/bookingsApi.ts` — hold, confirm, cancel, list (optimistic cancel)
  - `features/booking/bookingSlice.ts` — active hold state, idempotency key
  - `features/hotels/searchParams.ts` — URL ↔ SearchParams sync

### Phase 4: UI — All 4 Pages

- [ ] **Commit 7 — Search page + Hotel detail page**
  - SearchBar (city, dates, adults → URL), SearchFilters (price, stars, sort)
  - HotelCard, HotelList (skeletons, empty, error+retry, race condition handling)
  - RoomCard (night breakdown, weekend marks, reserve), PriceBreakdown
  - Error modals: ROOM_UNAVAILABLE toast, PRICE_CHANGED accept/decline

- [ ] **Commit 8 — Checkout + My Bookings**
  - useHoldCountdown hook (server time offset, survives refresh)
  - HoldTimer (mm:ss, warning <60s, locks on expire)
  - GuestForm (react-hook-form + Zod, idempotency key, retry on 500)
  - BookingCard (status badge, optimistic cancel + rollback)

### Phase 5: Bonuses & Polish

- [ ] **Commit 9 — All bonuses (B1-B5)**
  - B1: Wishlist — Redux slice persisted to localStorage, heart toggle
  - B2: SSR Results — server-side search, hydrate on client
  - B3: Countdown test — HoldTimer component test with fake timers
  - B4: Arabic RTL — next-intl, en/ar locales, language toggle, `dir="rtl"`
  - B5: Vercel deploy

- [ ] **Commit 10 — Final polish + README**
  - Shared UI: ErrorState, LoadingSpinner, EmptyState
  - Layout: StoreProvider, nav header, responsive container
  - Loading/error boundaries per route
  - README: setup, feature table, state decisions, design notes

---

## Key Architecture Decisions

### Race Conditions (M1)
RTK Query deduplication + abort on new request. Search keyed by full params.

### Idempotent Confirm (M4)
UUID idempotency key generated on checkout mount, stored in slice, sent as header. Server deduplicates. On 500: retry same key.

### Hold Countdown (M4)
Derived from `holdExpiresAt` + `serverTime` offset. Ticks in component state. Survives refresh via re-fetch.

### Optimistic Cancel (M5)
RTK Query `onQueryStarted` → optimistic update → `patchResult.undo()` on failure.

### Money
All amounts in integer halalas (1 SAR = 100). Formatted only for display.

### Gulf Weekend
Thursday + Friday nights = base rate × 1.25.

### VAT
15% of subtotal, `Math.round()` to nearest halala.

---

## State Location Table

| State | Where | Why |
|-------|-------|-----|
| Search criteria, filters, sort | URL searchParams | Shareable, survives refresh, Back/Forward |
| Hotels and rooms | RTK Query cache | Server data, auto-refetch, loading/error built-in |
| Active hold | RTK Query cache + bookingSlice | Server data in cache, UI state in slice |
| Countdown seconds | Component state (hook) | Ticks every second — too frequent for Redux |
| Guest form fields | react-hook-form | Local to form, no external consumers |
| Wishlist | Redux slice + localStorage | Persisted across sessions, hydration-safe |

---

## Verification Checklist
- [ ] `npm install && npm run dev` works
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] High chaos manual test (latency 3000, error 0.3, price change 0.5, hold TTL 60s)
- [ ] Responsive at 360px width
