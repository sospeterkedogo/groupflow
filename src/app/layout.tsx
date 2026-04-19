import type { Metadata } from 'next';
import './globals.css';
import './prestige.css';
import { NotificationProvider } from '../components/NotificationProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'GroupFlow2026 - Automating Accountability',
  description: 'A Data-Driven Collaboration Platform for Mitigating Social Loafing',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Wrap all children in NotificationProvider for global access */}
        <NotificationProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </NotificationProvider>
      </body>
    </html>
  );
}
