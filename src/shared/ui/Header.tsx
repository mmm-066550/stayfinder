'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Building2, CalendarCheck, Heart } from 'lucide-react';
import { LanguageToggle } from '@/i18n/LanguageToggle';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

export function Header() {
  const t = useTranslations('header');

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Building2 className="h-5 w-5" />
          {t('brand')}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <LanguageToggle />
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">{t('wishlist')}</span>
          </Link>
          <Link
            href="/bookings"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground transition-colors"
          >
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{t('myBookings')}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
