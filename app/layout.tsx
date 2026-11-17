import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { themeScript } from '@/lib/theme-script';
import './globals.css';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CalorieMeter AI',
    template: '%s · CalorieMeter AI',
  },
  description:
    'Track meals, get AI powered suggestions, and build lasting habits.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-surface font-sans text-base text-text tabular-nums antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
