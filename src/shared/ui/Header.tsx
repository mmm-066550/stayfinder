'use client';

import Link from 'next/link';
import { Building2, CalendarCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          StayFinder
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/bookings"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarCheck className="h-4 w-4" />
            My Bookings
          </Link>
        </nav>
      </div>
    </header>
  );
}
