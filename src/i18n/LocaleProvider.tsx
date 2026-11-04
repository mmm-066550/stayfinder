'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { type Locale, defaultLocale } from './config';

const STORAGE_KEY = 'stayfinder:locale';

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: defaultLocale, setLocale: () => {} });

export function useLocale() {
  return useContext(LocaleContext);
}

function loadMessages(locale: Locale) {
  if (locale === 'ar') return import('../../messages/ar.json').then((m) => m.default);
  return import('../../messages/en.json').then((m) => m.default);
}

function getSavedLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar') return 'ar';
  } catch {}
  return defaultLocale;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const saved = getSavedLocale();
    loadMessages(saved).then((msgs) => {
      setLocaleState(saved);
      setMessages(msgs);
      setInitialized(true);
    });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
    loadMessages(l).then(setMessages);
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    if (!initialized) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale, initialized]);

  if (!messages) return null;

  return (
    <LocaleContext value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext>
  );
}
