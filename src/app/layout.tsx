import type { Metadata } from 'next';
import './globals.css';
import './prestige.css';
import { NotificationProvider } from '../components/NotificationProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PWARegistry from '../components/PWARegistry';
import CookieBanner from '../components/CookieBanner';
import SessionGuard from '@/components/SessionGuard';
import PromoBanner from '@/components/PromoBanner';
import type { Viewport } from 'next';

export const metadata: Metadata = {
  title: 'GroupFlow Elite Exchange',
  description: 'Protocol-Driven Academic Collaboration Platform',
  icons: {
    icon: '/favicon.png',
    apple: '/pwa-icon-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Elite Exchange',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PromoBanner />
        {/* Wrap all children in NotificationProvider for global access */}
        <NotificationProvider>
          <PWARegistry />
          {children}
          <CookieBanner />
          <SessionGuard />
          <Analytics />
          <SpeedInsights />
        </NotificationProvider>
      </body>
    </html>
  );
}
