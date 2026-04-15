import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GroupFlow - Automating Accountability',
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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
