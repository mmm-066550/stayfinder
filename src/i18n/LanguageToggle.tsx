'use client';

import { useLocale } from './LocaleProvider';

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const targetLocale = locale === 'en' ? 'ar' : 'en';
  const flagCode = locale === 'en' ? 'sa' : 'gb';
  const label = locale === 'en' ? 'العربية' : 'English';

  return (
    <button
      onClick={() => setLocale(targetLocale)}
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground transition-colors"
      aria-label={`Switch to ${label}`}
    >
      <img
        src={`https://flagcdn.com/20x15/${flagCode}.png`}
        srcSet={`https://flagcdn.com/40x30/${flagCode}.png 2x`}
        width="20"
        height="15"
        alt={label}
        className="rounded-sm"
      />
      <span className="hidden sm:inline text-xs font-medium">{label}</span>
    </button>
  );
}
