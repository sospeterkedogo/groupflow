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
import GlobalAnnouncement from '@/components/GlobalAnnouncement';
import { ConnectivityProvider } from '@/context/ConnectivityContext';
import ToasterModeManager from '@/components/ToasterModeManager';
import type { Viewport } from 'next';

export const metadata: Metadata = {
  title: 'GroupFlow - Team Projects Made Simple',
  description: 'The easiest way for students to work together on group projects.',
  icons: {
    icon: '/favicon.png',
    apple: '/pwa-icon-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GroupFlow',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zooming for accessibility
  userScalable: true,
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
        <ConnectivityProvider>
          <ToasterModeManager />
          <NotificationProvider>
            <PWARegistry />
            {children}
            <CookieBanner />
            <SessionGuard />
            <GlobalAnnouncement />
            <Analytics />
            <SpeedInsights />
          </NotificationProvider>
        </ConnectivityProvider>

        {/* PREMIUM SVG FILTERS */}
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
          <defs>
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="elite-shimmer" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feColorMatrix type="saturate" values="1.5" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
