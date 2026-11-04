# StayFinder

> **Live Demo:** [stayfinder-matn.netlify.app](https://stayfinder-matn.netlify.app/)

A Booking.com-style hotel booking app built as a frontend engineering assignment. Search hotels across Riyadh, Jeddah, and Dubai, view room details with night-by-night pricing, hold and confirm reservations with a countdown timer, and manage bookings — all with a fake API that simulates real-world chaos (latency, errors, price changes).

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| State | Redux Toolkit + RTK Query |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Validation | Zod v4 (shared schemas: forms + API) |
| Forms | react-hook-form + `@hookform/resolvers` |
| Date picker | react-day-picker (shadcn Calendar) |
| i18n | next-intl (English + Arabic RTL) |
| Tests | Vitest + Testing Library |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.example` to `.env.local` (already done by default):

```env
CHAOS_ENABLED=true          # Enable chaos layer
CHAOS_MAX_LATENCY_MS=1500   # Max artificial latency (ms)
CHAOS_ERROR_RATE=0.1        # Probability of random 500 errors
CHAOS_PRICE_CHANGE_RATE=0.1 # Probability of price change on hold
HOLD_TTL_SECONDS=300        # Hold expiry time (seconds)
```

**High-chaos testing:**
```env
CHAOS_MAX_LATENCY_MS=3000
CHAOS_ERROR_RATE=0.3
CHAOS_PRICE_CHANGE_RATE=0.5
HOLD_TTL_SECONDS=60
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest (13 tests) |
| `npm run test:watch` | Vitest in watch mode |

## Features

| Feature | Status | Details |
|---------|--------|---------|
| Hotel Search | ✅ | City, dates, adults → URL params. Filter by stars, max price. Sort by price/rating. |
| Hotel Detail | ✅ | Room cards with night-by-night breakdown, weekend surcharge indicators. |
| Hold & Checkout | ✅ | 5-min countdown timer (server time offset), guest form with Zod validation, idempotent confirm. |
| My Bookings | ✅ | Status badges, optimistic cancel with rollback on failure. |
| Wishlist (B1) | ✅ | Heart toggle on cards, Redux slice persisted to localStorage, dedicated `/wishlist` page. |
| Countdown Test (B3) | ✅ | 6 tests with fake timers — loading, ticking, warning, expiry, server offset. |
| Arabic RTL (B4) | ✅ | next-intl with en/ar JSON messages, language toggle, `dir="rtl"` on `<html>`. |
| Deployed Demo (B5) | ✅ | Live at [stayfinder-matn.netlify.app](https://stayfinder-matn.netlify.app/) |
| Error Boundaries | ✅ | Per-route `error.tsx` with retry, `loading.tsx` skeletons. |
| Chaos Resilience | ✅ | Random latency, 500 errors, price changes, hold expiry — all handled gracefully. |

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | SearchPage | City picker, date calendars, adults selector, filters, hotel cards |
| `/hotels/[hotelId]` | HotelDetailPage | Hotel info, room list, reserve button, price-change dialog |
| `/checkout/[bookingId]` | CheckoutPage | Hold countdown, guest form, idempotent confirmation |
| `/bookings` | BookingsPage | Booking list sorted by status, optimistic cancel |
| `/wishlist` | WishlistPage | Saved hotels from localStorage-persisted Redux slice |
| `/api-docs` | ApiDocsPage | Interactive API documentation |

## State Decisions

| State | Location | Rationale |
|-------|----------|-----------|
| Search criteria & filters | URL `searchParams` | Shareable, survives refresh, Back/Forward navigation |
| Hotels & rooms | RTK Query cache | Server data with auto-refetch, deduplication, loading/error states |
| Active hold | RTK Query cache + `bookingSlice` | Server data in cache, UI metadata (idempotency key) in slice |
| Countdown seconds | Component state (`useHoldCountdown`) | Ticks every second — too frequent for Redux |
| Guest form | react-hook-form | Local to form, no external consumers |
| Wishlist | Redux slice + localStorage | Persisted across sessions, hydration-safe |
| Locale | React context + localStorage | Drives `dir`/`lang` on `<html>`, persists preference |

## Architecture

```
src/
├── app/                    # Next.js routes + loading/error boundaries
├── domain/                 # Pure TS: types, pricing, dates, schemas, money
├── server/                 # Fake backend: seed data, services, chaos layer
├── store/                  # Redux: baseApi, makeStore, StoreProvider, hooks
├── features/
│   ├── hotels/             # hotelsApi, searchParams, SearchPage, HotelCard, etc.
│   ├── booking/            # bookingsApi, bookingSlice, useHoldCountdown, CheckoutPage, etc.
│   └── wishlist/           # wishlistSlice, WishlistButton, WishlistPage
├── i18n/                   # LocaleProvider, LanguageToggle, config
├── shared/ui/              # ErrorState, EmptyState, LoadingSpinner, Header
└── components/ui/          # shadcn/ui primitives
```

### Key Design Choices

- **Money as integer halalas** (1 SAR = 100 halalas) — no floating-point rounding errors. Formatted only for display via `formatHalalas()`.
- **Gulf weekend** — Thursday + Friday nights get +25% surcharge. VAT is 15% of subtotal, `Math.round()` to nearest halala.
- **Server time offset** — Countdown timer computes `offset = Date.now() - serverTime` once, then ticks locally. Survives refresh via re-fetch.
- **Idempotent confirmation** — UUID idempotency key generated on checkout mount, stored in Redux slice, sent as header. Server deduplicates. On 500: retry with same key.
- **Optimistic cancel** — `onQueryStarted` patches the booking list instantly, `patchResult.undo()` on failure.
- **Chaos layer** — `withChaos()` wrapper on API routes adds random latency, random 500s (after real processing for confirm), and price changes on hold creation.

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels?city=...&checkIn=...&checkOut=...&adults=...` | Search hotels |
| GET | `/api/hotels/[hotelId]?checkIn=...&checkOut=...&adults=...` | Hotel detail + rooms |
| GET | `/api/hotels/wishlist?ids=...` | Hotels by IDs (for wishlist) |
| POST | `/api/bookings` | Create hold |
| GET | `/api/bookings` | List all bookings |
| GET | `/api/bookings/[bookingId]` | Get booking detail |
| POST | `/api/bookings/[bookingId]/confirm` | Confirm booking (idempotent) |
| POST | `/api/bookings/[bookingId]/cancel` | Cancel booking |

## AI Usage

This project was built with assistance from Claude (Anthropic). Claude helped with:
- Architecture planning and code structure
- Component implementation across all 4 pages
- Redux store design with RTK Query
- Chaos layer and API route handlers
- Bug fixes (countdown timer, React 19 compatibility, shadcn/ui v4 migration)
- i18n setup with Arabic translations
- Test writing for the countdown hook
