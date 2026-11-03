import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import StoreProvider from '@/store/StoreProvider';
import { Header } from '@/shared/ui/Header';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff2',
  variable: '--font-sans',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster richColors position="top-right" />
        </StoreProvider>
      </body>
    </html>
  );
}
