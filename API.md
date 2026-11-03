# StayFinder — Fake API Reference

> Base URL: `http://localhost:3000/api`
> Start the server: `npm run dev`
> All money values are in **halalas** (1 SAR = 100 halalas). Data resets on server restart.

---

## Chaos Mode

Controlled via `.env.local` (copy from `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `CHAOS_ENABLED` | `true` | Master switch |
| `CHAOS_MAX_LATENCY_MS` | `1500` | Random delay 0–N ms per request |
| `CHAOS_ERROR_RATE` | `0.1` | Chance of random 500 error |
| `CHAOS_PRICE_CHANGE_RATE` | `0.1` | Chance hold gets 409 PRICE_CHANGED |
| `HOLD_TTL_SECONDS` | `300` | How long a hold lasts (seconds) |

**High chaos test settings** (what reviewers will use):
```
CHAOS_MAX_LATENCY_MS=3000
CHAOS_ERROR_RATE=0.3
CHAOS_PRICE_CHANGE_RATE=0.5
HOLD_TTL_SECONDS=60
```

To disable chaos for easier testing: `CHAOS_ENABLED=false`

---

## Error Shape

All errors return the same shape:
```json
{
  "error": {
    "code": "PRICE_CHANGED",
    "message": "The price changed.",
    "details": { "newQuote": { ... } }
  }
}
```

---

## Endpoints

### 1. Search Hotels

```
GET /api/hotels?city=riyadh&checkIn=2026-12-09&checkOut=2026-12-12&adults=2
```

**Query params:**
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `city` | yes | `riyadh` \| `jeddah` \| `dubai` | City to search |
| `checkIn` | yes | `YYYY-MM-DD` | Check-in date |
| `checkOut` | yes | `YYYY-MM-DD` | Check-out date |
| `adults` | yes | `1-4` | Number of guests |
| `maxPrice` | no | integer (halalas) | Max total price filter |
| `stars` | no | `1-5` | Exact star rating filter |
| `sort` | no | `price` \| `rating` | Sort order (default: `price`) |

**200 Response:** Array of hotels with `fromTotal` (cheapest available room total for the stay).

**Test it:**
```powershell
Invoke-RestMethod 'http://localhost:3000/api/hotels?city=riyadh&checkIn=2026-12-09&checkOut=2026-12-12&adults=2'
```
```bash
curl "http://localhost:3000/api/hotels?city=riyadh&checkIn=2026-12-09&checkOut=2026-12-12&adults=2"
```

---

### 2. Hotel Detail

```
GET /api/hotels/:hotelId?checkIn=2026-12-09&checkOut=2026-12-12&adults=2
```

**200 Response:** Hotel object with `rooms[]`, each room includes `quote` (night-by-night breakdown) and `unitsLeft`.

**Test it:**
```powershell
Invoke-RestMethod 'http://localhost:3000/api/hotels/riy-1?checkIn=2026-12-09&checkOut=2026-12-12&adults=2'
```

**Available hotel IDs:**
| City | IDs |
|------|-----|
| Riyadh | `riy-1`, `riy-2`, `riy-3`, `riy-4` |
| Jeddah | `jed-1`, `jed-2`, `jed-3`, `jed-4` |
| Dubai | `dub-1`, `dub-2`, `dub-3`, `dub-4` |

---

### 3. Create Hold (Reserve)

```
POST /api/bookings
Content-Type: application/json

{
  "hotelId": "riy-1",
  "roomId": "riy-1-r1",
  "checkIn": "2026-12-09",
  "checkOut": "2026-12-12",
  "adults": 2,
  "quotedTotal": 342125
}
```

**201 Response:**
```json
{
  "booking": { "id": "...", "status": "held", "holdExpiresAt": "...", "quote": { ... } },
  "serverTime": "2026-..."
}
```

**Error responses:**
- `409 ROOM_UNAVAILABLE` — no units left
- `409 PRICE_CHANGED` — price differs from `quotedTotal`, includes `details.newQuote`
- `422 VALIDATION_ERROR` — invalid body

**Test it:**
```powershell
$body = '{"hotelId":"riy-1","roomId":"riy-1-r1","checkIn":"2026-12-09","checkOut":"2026-12-12","adults":2,"quotedTotal":342125}'
Invoke-RestMethod -Uri 'http://localhost:3000/api/bookings' -Method POST -Body $body -ContentType 'application/json'
```

---

### 4. Get Booking

```
GET /api/bookings/:bookingId
```

**200 Response:** `{ booking, serverTime }` — use `serverTime` to compute countdown offset.

---

### 5. List All Bookings

```
GET /api/bookings
```

**200 Response:** `{ bookings: [...], serverTime }`

---

### 6. Confirm Booking

```
POST /api/bookings/:bookingId/confirm
Content-Type: application/json
Idempotency-Key: <unique-uuid>

{
  "fullName": "Test User",
  "email": "test@example.com",
  "phone": "+966501234567"
}
```

**200 Response:** `{ booking }` with `status: "confirmed"` and `guest` details.

**Idempotency:** Same `Idempotency-Key` always returns the same result (safe to retry on 500).

**Error responses:**
- `410 HOLD_EXPIRED` — hold timed out
- `422 VALIDATION_ERROR` — invalid guest details or missing Idempotency-Key

**Test it:**
```powershell
$body = '{"fullName":"Test User","email":"test@example.com","phone":"+966501234567"}'
$headers = @{'Idempotency-Key'='my-unique-key-123'}
Invoke-RestMethod -Uri 'http://localhost:3000/api/bookings/BOOKING_ID/confirm' -Method POST -Body $body -ContentType 'application/json' -Headers $headers
```

---

### 7. Cancel Booking

```
POST /api/bookings/:bookingId/cancel
```

**200 Response:** `{ booking }` with `status: "cancelled"`.

**Error responses:**
- `409 NOT_REFUNDABLE` — room is non-refundable

**Test it:**
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/bookings/BOOKING_ID/cancel' -Method POST
```

---

## Full Booking Flow Test

```powershell
# 1. Search for hotels in Riyadh
Invoke-RestMethod 'http://localhost:3000/api/hotels?city=riyadh&checkIn=2026-12-09&checkOut=2026-12-12&adults=2'

# 2. Get hotel detail with room quotes
Invoke-RestMethod 'http://localhost:3000/api/hotels/riy-1?checkIn=2026-12-09&checkOut=2026-12-12&adults=2'

# 3. Create a hold (use the quotedTotal from step 2)
$hold = Invoke-RestMethod -Uri 'http://localhost:3000/api/bookings' -Method POST -ContentType 'application/json' -Body '{"hotelId":"riy-1","roomId":"riy-1-r1","checkIn":"2026-12-09","checkOut":"2026-12-12","adults":2,"quotedTotal":342125}'
$bookingId = $hold.booking.id
Write-Output "Booking ID: $bookingId"

# 4. Confirm the hold
$headers = @{'Idempotency-Key'=[guid]::NewGuid().ToString()}
Invoke-RestMethod -Uri "http://localhost:3000/api/bookings/$bookingId/confirm" -Method POST -ContentType 'application/json' -Body '{"fullName":"Ahmed","email":"ahmed@test.com","phone":"+966501234567"}' -Headers $headers

# 5. List all bookings
Invoke-RestMethod 'http://localhost:3000/api/bookings'

# 6. Cancel (only works for refundable rooms — riy-1-r1 is refundable)
Invoke-RestMethod -Uri "http://localhost:3000/api/bookings/$bookingId/cancel" -Method POST
```

---

## Seed Data Summary

**12 hotels**, 28 rooms total:

| Hotel | City | Stars | Rooms | Base rates (SAR) |
|-------|------|-------|-------|------------------|
| Al Faisaliah Grand | Riyadh | 5 | Deluxe King (2g, ref), Family Suite (4g, ref), Standard Twin (2g) | 850, 1200, 600 |
| Riyadh Palace Inn | Riyadh | 4 | Superior (2g, ref), Triple (3g) | 450, 550 |
| Desert Rose Hotel | Riyadh | 3 | Standard (2g, ref), Family (4g) | 280, 400 |
| Najd Suites | Riyadh | 2 | Economy Single (1g), Economy Double (2g, ref) | 150, 220 |
| Red Sea Resort | Jeddah | 5 | Ocean View (2g, ref), Beach Villa (4g, ref), Garden (2g) | 950, 1500, 650 |
| Corniche View | Jeddah | 4 | Sea View (2g, ref), Family Suite (4g) | 480, 700 |
| Business Lodge | Jeddah | 3 | Business Single (1g, ref), Business Double (2g) | 300, 380 |
| Balad Heritage Inn | Jeddah | 2 | Heritage (2g, ref), Heritage Family (3g) | 200, 320 |
| Marina Bay Tower | Dubai | 5 | Panoramic (2g, ref), Presidential (4g, ref), Marina (2g) | 1100, 2000, 750 |
| Downtown Dubai | Dubai | 4 | Burj View (2g, ref), Club Suite (3g, ref), Standard (2g) | 550, 800, 420 |
| Creek Side Lodge | Dubai | 3 | Creek View (2g, ref), Family (4g) | 350, 500 |
| Deira Budget Stay | Dubai | 1 | Basic Single (1g), Basic Double (2g) | 120, 180 |

*g = maxGuests, ref = refundable, units = 1–3 per room*
