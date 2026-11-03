import type { Metadata } from 'next';
import { Urbanist, Cairo } from 'next/font/google';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import StoreProvider from '@/store/StoreProvider';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ThemeProvider } from '@/shared/ui/ThemeProvider';
import { Header } from '@/shared/ui/Header';
import './globals.css';

const urbanist = Urbanist({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff2',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'StayFinder',
  description: 'Hotel booking app — find your perfect stay',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${urbanist.variable} ${cairo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <StoreProvider>
            <LocaleProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Toaster richColors position="top-right" />
            </LocaleProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
