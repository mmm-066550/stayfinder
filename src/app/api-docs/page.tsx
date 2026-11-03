'use client';

import { useState, useCallback } from 'react';

interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

interface Header {
  name: string;
  description: string;
  default?: string;
}

interface ResponseInfo {
  status: number;
  code: string;
  description: string;
}

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  description?: string;
  params?: Param[];
  headers?: Header[];
  body?: Record<string, unknown>;
  responses: ResponseInfo[];
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/hotels',
    summary: 'Search Hotels',
    description: 'Returns hotels with at least one available room for the stay. Each result includes fromTotal — the cheapest room total for the dates.',
    params: [
      { name: 'city', type: 'enum', required: true, description: 'riyadh | jeddah | dubai', default: 'riyadh' },
      { name: 'checkIn', type: 'date', required: true, description: 'YYYY-MM-DD', default: '2026-12-09' },
      { name: 'checkOut', type: 'date', required: true, description: 'YYYY-MM-DD', default: '2026-12-12' },
      { name: 'adults', type: 'number', required: true, description: '1-4', default: '2' },
      { name: 'maxPrice', type: 'number', required: false, description: 'Max total in halalas' },
      { name: 'stars', type: 'number', required: false, description: '1-5 exact match' },
      { name: 'sort', type: 'enum', required: false, description: 'price | rating' },
    ],
    responses: [
      { status: 200, code: 'OK', description: 'Array of HotelSearchResult with fromTotal' },
      { status: 400, code: 'VALIDATION_ERROR', description: 'Invalid parameters' },
      { status: 500, code: 'INTERNAL_ERROR', description: 'Chaos error' },
    ],
  },
  {
    method: 'GET',
    path: '/api/hotels/{hotelId}',
    summary: 'Hotel Detail',
    description: 'Returns the hotel with all rooms. Each room includes a night-by-night quote and unitsLeft for the given dates.',
    params: [
      { name: 'hotelId', type: 'string', required: true, description: 'e.g. riy-1, jed-2, dub-3', default: 'riy-1' },
      { name: 'checkIn', type: 'date', required: true, description: 'YYYY-MM-DD', default: '2026-12-09' },
      { name: 'checkOut', type: 'date', required: true, description: 'YYYY-MM-DD', default: '2026-12-12' },
      { name: 'adults', type: 'number', required: true, description: '1-4', default: '2' },
    ],
    responses: [
      { status: 200, code: 'OK', description: 'HotelDetail with rooms[], quote, unitsLeft' },
      { status: 404, code: 'NOT_FOUND', description: 'Hotel not found' },
    ],
  },
  {
    method: 'GET',
    path: '/api/bookings',
    summary: 'List Bookings',
    description: 'Returns all bookings with serverTime for countdown sync.',
    responses: [
      { status: 200, code: 'OK', description: '{ bookings[], serverTime }' },
    ],
  },
  {
    method: 'POST',
    path: '/api/bookings',
    summary: 'Create Hold',
    description: 'Reserves one unit. Validates quotedTotal matches server price. Hold expires after HOLD_TTL_SECONDS.',
    body: { hotelId: 'riy-1', roomId: 'riy-1-r1', checkIn: '2026-12-09', checkOut: '2026-12-12', adults: 2, quotedTotal: 342125 },
    responses: [
      { status: 201, code: 'CREATED', description: '{ booking (held), serverTime }' },
      { status: 409, code: 'ROOM_UNAVAILABLE', description: 'No units left' },
      { status: 409, code: 'PRICE_CHANGED', description: 'Includes details.newQuote' },
      { status: 422, code: 'VALIDATION_ERROR', description: 'Invalid body' },
    ],
  },
  {
    method: 'GET',
    path: '/api/bookings/{bookingId}',
    summary: 'Get Booking',
    description: 'Returns a single booking with serverTime for countdown calculation.',
    params: [
      { name: 'bookingId', type: 'uuid', required: true, description: 'Booking ID from hold response' },
    ],
    responses: [
      { status: 200, code: 'OK', description: '{ booking, serverTime }' },
      { status: 404, code: 'NOT_FOUND', description: 'Booking not found' },
    ],
  },
  {
    method: 'POST',
    path: '/api/bookings/{bookingId}/confirm',
    summary: 'Confirm Booking',
    description: 'Confirms a held booking. Idempotent — same Idempotency-Key always returns the same result, safe to retry on 500.',
    params: [
      { name: 'bookingId', type: 'uuid', required: true, description: 'Booking ID' },
    ],
    headers: [
      { name: 'Idempotency-Key', description: 'Unique UUID for deduplication', default: crypto.randomUUID() },
    ],
    body: { fullName: 'Moustapha Mahmoud', email: 'Moustapha@example.com', phone: '+966501234567' },
    responses: [
      { status: 200, code: 'OK', description: '{ booking (confirmed) }' },
      { status: 410, code: 'HOLD_EXPIRED', description: 'Hold timed out' },
      { status: 422, code: 'VALIDATION_ERROR', description: 'Invalid guest or missing key' },
    ],
  },
  {
    method: 'POST',
    path: '/api/bookings/{bookingId}/cancel',
    summary: 'Cancel Booking',
    description: 'Cancels a confirmed booking. Only works for refundable rooms.',
    params: [
      { name: 'bookingId', type: 'uuid', required: true, description: 'Booking ID' },
    ],
    responses: [
      { status: 200, code: 'OK', description: '{ booking (cancelled) }' },
      { status: 409, code: 'NOT_REFUNDABLE', description: 'Non-refundable room' },
    ],
  },
];

const SEED_DATA = [
  { city: 'Riyadh', hotels: [
    { id: 'riy-1', name: 'Al Faisaliah Grand', stars: 5, rating: 4.8, rooms: [
      { name: 'Deluxe King', rate: 850, guests: 2, ref: true, units: 2 },
      { name: 'Family Suite', rate: 1200, guests: 4, ref: true, units: 1 },
      { name: 'Standard Twin', rate: 600, guests: 2, ref: false, units: 3 },
    ]},
    { id: 'riy-2', name: 'Riyadh Palace Inn', stars: 4, rating: 4.3, rooms: [
      { name: 'Superior Room', rate: 450, guests: 2, ref: true, units: 2 },
      { name: 'Triple Room', rate: 550, guests: 3, ref: false, units: 2 },
    ]},
    { id: 'riy-3', name: 'Desert Rose Hotel', stars: 3, rating: 3.9, rooms: [
      { name: 'Standard Room', rate: 280, guests: 2, ref: true, units: 3 },
      { name: 'Family Room', rate: 400, guests: 4, ref: false, units: 1 },
    ]},
    { id: 'riy-4', name: 'Najd Suites', stars: 2, rating: 3.5, rooms: [
      { name: 'Economy Single', rate: 150, guests: 1, ref: false, units: 3 },
      { name: 'Economy Double', rate: 220, guests: 2, ref: true, units: 2 },
    ]},
  ]},
  { city: 'Jeddah', hotels: [
    { id: 'jed-1', name: 'Red Sea Resort', stars: 5, rating: 4.7, rooms: [
      { name: 'Ocean View Suite', rate: 950, guests: 2, ref: true, units: 1 },
      { name: 'Beach Villa', rate: 1500, guests: 4, ref: true, units: 1 },
      { name: 'Garden Room', rate: 650, guests: 2, ref: false, units: 2 },
    ]},
    { id: 'jed-2', name: 'Corniche View Hotel', stars: 4, rating: 4.2, rooms: [
      { name: 'Sea View Room', rate: 480, guests: 2, ref: true, units: 2 },
      { name: 'Family Suite', rate: 700, guests: 4, ref: false, units: 1 },
    ]},
    { id: 'jed-3', name: 'Jeddah Business Lodge', stars: 3, rating: 3.8, rooms: [
      { name: 'Business Single', rate: 300, guests: 1, ref: true, units: 2 },
      { name: 'Business Double', rate: 380, guests: 2, ref: false, units: 3 },
    ]},
    { id: 'jed-4', name: 'Balad Heritage Inn', stars: 2, rating: 3.6, rooms: [
      { name: 'Heritage Room', rate: 200, guests: 2, ref: true, units: 2 },
      { name: 'Heritage Family', rate: 320, guests: 3, ref: false, units: 1 },
    ]},
  ]},
  { city: 'Dubai', hotels: [
    { id: 'dub-1', name: 'Marina Bay Tower', stars: 5, rating: 4.9, rooms: [
      { name: 'Panoramic Suite', rate: 1100, guests: 2, ref: true, units: 1 },
      { name: 'Presidential Suite', rate: 2000, guests: 4, ref: true, units: 1 },
      { name: 'Marina Room', rate: 750, guests: 2, ref: false, units: 2 },
    ]},
    { id: 'dub-2', name: 'Downtown Dubai Hotel', stars: 4, rating: 4.4, rooms: [
      { name: 'Burj View Room', rate: 550, guests: 2, ref: true, units: 2 },
      { name: 'Club Suite', rate: 800, guests: 3, ref: true, units: 1 },
      { name: 'Standard Room', rate: 420, guests: 2, ref: false, units: 3 },
    ]},
    { id: 'dub-3', name: 'Creek Side Lodge', stars: 3, rating: 4.0, rooms: [
      { name: 'Creek View Room', rate: 350, guests: 2, ref: true, units: 2 },
      { name: 'Family Room', rate: 500, guests: 4, ref: false, units: 1 },
    ]},
    { id: 'dub-4', name: 'Deira Budget Stay', stars: 1, rating: 3.2, rooms: [
      { name: 'Basic Single', rate: 120, guests: 1, ref: false, units: 3 },
      { name: 'Basic Double', rate: 180, guests: 2, ref: false, units: 2 },
    ]},
  ]},
];

function MethodBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    GET: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    POST: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider ring-1 ring-inset ${styles[method]}`}>
      {method}
    </span>
  );
}

function StatusDot({ status }: { status: number }) {
  const color = status < 300 ? 'bg-emerald-500' : status < 500 ? 'bg-amber-500' : 'bg-red-500';
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
}

function EndpointCard({ endpoint, index }: { endpoint: Endpoint; index: number }) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState<{ status: number; statusText: string; time: number; body: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    endpoint.params?.forEach((p) => { if (p.default) defaults[p.name] = p.default; });
    return defaults;
  });
  const [bodyText, setBodyText] = useState(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : '');
  const [headerValues, setHeaderValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    endpoint.headers?.forEach((h) => { if (h.default) defaults[h.name] = h.default; });
    return defaults;
  });

  const buildUrl = useCallback(() => {
    let url = endpoint.path;
    const queryParams: string[] = [];
    endpoint.params?.forEach((p) => {
      const val = paramValues[p.name] ?? '';
      if (!val) return;
      if (url.includes(`{${p.name}}`)) {
        url = url.replace(`{${p.name}}`, encodeURIComponent(val));
      } else {
        queryParams.push(`${p.name}=${encodeURIComponent(val)}`);
      }
    });
    if (queryParams.length > 0) url += '?' + queryParams.join('&');
    return url;
  }, [endpoint, paramValues]);

  const tryIt = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const url = buildUrl();
      const init: RequestInit = { method: endpoint.method };
      const headers: Record<string, string> = {};
      if (endpoint.body && bodyText) {
        headers['Content-Type'] = 'application/json';
        init.body = bodyText;
      }
      endpoint.headers?.forEach((h) => {
        if (headerValues[h.name]) headers[h.name] = headerValues[h.name];
      });
      if (Object.keys(headers).length > 0) init.headers = headers;

      const start = performance.now();
      const res = await fetch(url, init);
      const time = Math.round(performance.now() - start);
      const data = await res.json();
      setResponse({ status: res.status, statusText: res.statusText, time, body: JSON.stringify(data, null, 2) });
    } catch (e) {
      setResponse({ status: 0, statusText: 'Error', time: 0, body: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border border-border/60 bg-card transition-all ${open ? 'shadow-lg shadow-black/[.04]' : 'hover:shadow-md hover:shadow-black/[.03]'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left group"
      >
        <span className="text-muted-foreground/40 font-mono text-xs tabular-nums w-5">{index + 1}</span>
        <MethodBadge method={endpoint.method} />
        <code className="text-[13px] font-mono text-foreground/80 flex-1 tracking-tight">{endpoint.path}</code>
        <span className="text-[13px] text-muted-foreground hidden md:block">{endpoint.summary}</span>
        <svg className={`w-4 h-4 text-muted-foreground/50 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
      </button>

      {open && (
        <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-5">
          {endpoint.description && (
            <p className="text-[13px] text-muted-foreground leading-relaxed">{endpoint.description}</p>
          )}

          {endpoint.params && endpoint.params.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Parameters</h4>
              <div className="space-y-2">
                {endpoint.params.map((p) => (
                  <div key={p.name} className="grid grid-cols-[140px_1fr_1fr] gap-2 items-center">
                    <div className="flex items-center gap-1.5">
                      <code className="text-[12px] font-mono font-medium">{p.name}</code>
                      {p.required && <span className="text-[9px] font-bold text-red-500 uppercase">req</span>}
                    </div>
                    <input
                      type="text"
                      placeholder={p.description}
                      value={paramValues[p.name] ?? ''}
                      onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                      className="px-3 py-1.5 border border-border rounded-lg text-[13px] font-mono bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                    />
                    <span className="text-[11px] text-muted-foreground hidden md:block">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.headers && endpoint.headers.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Headers</h4>
              <div className="space-y-2">
                {endpoint.headers.map((h) => (
                  <div key={h.name} className="grid grid-cols-[180px_1fr] gap-2 items-center">
                    <code className="text-[12px] font-mono font-medium">{h.name}</code>
                    <input
                      type="text"
                      value={headerValues[h.name] ?? ''}
                      onChange={(e) => setHeaderValues({ ...headerValues, [h.name]: e.target.value })}
                      className="px-3 py-1.5 border border-border rounded-lg text-[13px] font-mono bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.body && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Request Body</h4>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={Math.min(Object.keys(endpoint.body).length + 2, 10)}
                className="w-full px-4 py-3 border border-border rounded-lg text-[13px] font-mono bg-background leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow resize-y"
                spellCheck={false}
              />
            </div>
          )}

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Responses</h4>
            <div className="rounded-lg border border-border overflow-hidden">
              {endpoint.responses.map((r, i) => (
                <div key={r.code} className={`flex items-center gap-3 px-4 py-2.5 text-[13px] ${i > 0 ? 'border-t border-border/50' : ''}`}>
                  <StatusDot status={r.status} />
                  <span className="font-mono font-semibold w-10 text-foreground/70">{r.status}</span>
                  <code className="text-[11px] px-1.5 py-0.5 bg-muted rounded font-medium">{r.code}</code>
                  <span className="text-muted-foreground flex-1">{r.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={tryIt}
              disabled={loading}
              className="px-5 py-2 bg-foreground text-background rounded-lg text-[13px] font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Sending...
                </span>
              ) : 'Send Request'}
            </button>
            <code className="text-[11px] text-muted-foreground/60 font-mono truncate">{endpoint.method} {buildUrl()}</code>
          </div>

          {response && (
            <div className="rounded-lg overflow-hidden border border-border">
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-b border-border">
                <StatusDot status={response.status} />
                <span className="font-mono text-[13px] font-semibold">{response.status}</span>
                <span className="text-[13px] text-muted-foreground">{response.statusText}</span>
                <span className="ml-auto text-[11px] text-muted-foreground/60 font-mono">{response.time}ms</span>
              </div>
              <pre className="p-4 text-[12px] font-mono leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto bg-[#0d1117] text-[#e6edf3]">
                {response.body}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return <span className="text-amber-500 tracking-tighter">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'data' | 'rules'>('endpoints');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background text-sm font-bold">SF</span>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">StayFinder API</h1>
              <p className="text-[11px] text-muted-foreground">Interactive Documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-muted font-mono">localhost:3000</span>
            <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 font-medium">Chaos Mode</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <nav className="flex gap-1 mb-8 p-1 bg-muted/50 rounded-xl w-fit">
          {[
            { key: 'endpoints' as const, label: 'Endpoints' },
            { key: 'data' as const, label: 'Seed Data' },
            { key: 'rules' as const, label: 'Business Rules' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === key
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div className="space-y-3">
            <div className="mb-6">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                All money values are <strong className="text-foreground">integers in halalas</strong> (1 SAR = 100 halalas).
                Data resets on server restart. Chaos mode adds random latency, 500 errors, and price fluctuations.
              </p>
            </div>
            {ENDPOINTS.map((ep, i) => (
              <EndpointCard key={i} endpoint={ep} index={i} />
            ))}

            <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border/40">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Error Shape</h4>
              <pre className="text-[12px] font-mono text-muted-foreground">
{`{ "error": { "code": "PRICE_CHANGED", "message": "...", "details": { ... } } }`}
              </pre>
            </div>
          </div>
        )}

        {/* Seed Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-8">
            <p className="text-[13px] text-muted-foreground">
              12 hotels across 3 cities. Each room has 1-3 units so rooms actually sell out.
              Rates shown are base rate per night in SAR — Thu/Fri nights cost +25%.
            </p>
            {SEED_DATA.map((cityData) => (
              <div key={cityData.city}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-foreground" />
                  {cityData.city}
                </h3>
                <div className="grid gap-3">
                  {cityData.hotels.map((hotel) => (
                    <div key={hotel.id} className="rounded-xl border border-border/60 bg-card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-[11px] font-mono px-1.5 py-0.5 bg-muted rounded">{hotel.id}</code>
                            <h4 className="font-semibold text-[15px]">{hotel.name}</h4>
                          </div>
                          <div className="flex items-center gap-3 text-[12px]">
                            <Stars count={hotel.stars} />
                            <span className="text-muted-foreground">{hotel.rating} rating</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/40 overflow-hidden">
                        <table className="w-full text-[13px]">
                          <thead>
                            <tr className="bg-muted/40 text-[11px] uppercase tracking-widest text-muted-foreground">
                              <th className="text-left px-3 py-2 font-semibold">Room</th>
                              <th className="text-right px-3 py-2 font-semibold">Rate/Night</th>
                              <th className="text-center px-3 py-2 font-semibold">Guests</th>
                              <th className="text-center px-3 py-2 font-semibold">Units</th>
                              <th className="text-center px-3 py-2 font-semibold">Refund</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hotel.rooms.map((room) => (
                              <tr key={room.name} className="border-t border-border/30">
                                <td className="px-3 py-2 font-medium">{room.name}</td>
                                <td className="px-3 py-2 text-right font-mono">SAR {room.rate}</td>
                                <td className="px-3 py-2 text-center">{room.guests}</td>
                                <td className="px-3 py-2 text-center font-mono">{room.units}</td>
                                <td className="px-3 py-2 text-center">
                                  {room.ref ? (
                                    <span className="text-emerald-600 text-[11px] font-medium">Yes</span>
                                  ) : (
                                    <span className="text-muted-foreground/50 text-[11px]">No</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Business Rules Tab */}
        {activeTab === 'rules' && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h4 className="font-semibold text-[15px] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-[12px]">$</span>
                Pricing
              </h4>
              <ul className="text-[13px] text-muted-foreground space-y-2">
                <li className="flex gap-2"><span className="text-foreground/30">1.</span> All amounts in integer <strong className="text-foreground">halalas</strong> (1 SAR = 100)</li>
                <li className="flex gap-2"><span className="text-foreground/30">2.</span> Each night costs baseRate; <strong className="text-foreground">Thu &amp; Fri +25%</strong></li>
                <li className="flex gap-2"><span className="text-foreground/30">3.</span> <strong className="text-foreground">VAT 15%</strong> of subtotal, rounded to nearest halala</li>
                <li className="flex gap-2"><span className="text-foreground/30">4.</span> Total = subtotal + VAT</li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-muted/40 text-[12px] font-mono">
                <div className="text-muted-foreground mb-1">Example: SAR 400/night, Wed-Sat (3 nights)</div>
                <div>Wed: 400 + Thu: 500 + Fri: 500 = <strong>1,400</strong></div>
                <div>VAT 15%: <strong>210</strong> | Total: <strong>SAR 1,610</strong></div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h4 className="font-semibold text-[15px] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[12px] font-bold">H</span>
                Hold &amp; Booking
              </h4>
              <ul className="text-[13px] text-muted-foreground space-y-2">
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> Reserve creates a <strong className="text-foreground">hold</strong> for HOLD_TTL_SECONDS (default 300)</li>
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> Hold sends <code className="text-[11px] bg-muted px-1 rounded">quotedTotal</code> — server checks price match</li>
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> Confirm is <strong className="text-foreground">idempotent</strong> via Idempotency-Key header</li>
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> Cancel only for <strong className="text-foreground">refundable</strong> confirmed bookings</li>
              </ul>
              <div className="mt-4 flex items-center gap-2 text-[12px] font-mono text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700">held</span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">confirmed</span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700">cancelled</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[12px] font-mono text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700">held</span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">expired</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h4 className="font-semibold text-[15px] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-[12px] font-bold">!</span>
                Chaos Mode
              </h4>
              <ul className="text-[13px] text-muted-foreground space-y-2">
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> <strong className="text-foreground">Random latency</strong>: 0 to CHAOS_MAX_LATENCY_MS</li>
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> <strong className="text-foreground">Random 500</strong>: CHAOS_ERROR_RATE chance</li>
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> On confirm: 500 sent <em>after</em> booking is confirmed</li>
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> <strong className="text-foreground">Price changes</strong>: hold may get 409 with 5-15% higher price</li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-muted/40 text-[12px] font-mono">
                <div className="text-muted-foreground mb-1">Review settings:</div>
                <div>CHAOS_MAX_LATENCY_MS=<strong>3000</strong></div>
                <div>CHAOS_ERROR_RATE=<strong>0.3</strong></div>
                <div>CHAOS_PRICE_CHANGE_RATE=<strong>0.5</strong></div>
                <div>HOLD_TTL_SECONDS=<strong>60</strong></div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h4 className="font-semibold text-[15px] mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center text-[12px] font-bold">E</span>
                Validation &amp; Dates
              </h4>
              <ul className="text-[13px] text-muted-foreground space-y-2">
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> Dates are <code className="text-[11px] bg-muted px-1 rounded">YYYY-MM-DD</code> strings, no timezone</li>
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> Nights = calendar days between check-in and check-out</li>
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> Min 1, max 14 nights. Check-in can&apos;t be in the past</li>
                <li className="flex gap-2"><span className="text-foreground/30">&bull;</span> 1-4 adults. Room reserved only if adults &le; maxGuests</li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-muted/40 text-[12px] font-mono">
                <div className="text-muted-foreground mb-1">Error shape:</div>
                <div>{`{ "error": { "code": "...",`}</div>
                <div>{`    "message": "...",`}</div>
                <div>{`    "details": { ... } } }`}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
