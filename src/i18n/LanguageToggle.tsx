'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from './LocaleProvider';

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
      className="gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <Languages className="h-4 w-4" />
      {locale === 'en' ? 'العربية' : 'English'}
    </Button>
  );
}
