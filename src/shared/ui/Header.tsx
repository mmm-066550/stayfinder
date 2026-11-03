'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Building2, CalendarCheck, Heart } from 'lucide-react';
import { LanguageToggle } from '@/i18n/LanguageToggle';

export function Header() {
  const t = useTranslations('header');

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          {t('brand')}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <LanguageToggle />
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">{t('wishlist')}</span>
          </Link>
          <Link
            href="/bookings"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{t('myBookings')}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
