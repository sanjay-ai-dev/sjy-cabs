import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast-provider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'DailyCab — Intercity Ertiga Express',
  description:
    'Door-to-door Intercity Ertiga Shuttle Network for Indore, Dhar, Ujjain, and Dewas',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets the browser chrome match the app theme on mobile.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#07080d' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `data-theme` is stamped by THEME_INIT_SCRIPT before first paint, so the
    // server value here is only a fallback. suppressHydrationWarning keeps
    // React from complaining that the script changed the attribute.
    <html
      lang="en"
      data-theme="light"
      className={plusJakarta.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Runs synchronously before paint — this is what prevents a flash of
            the wrong theme for users whose saved preference is dark. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      {/* No colour utilities here: body colours come from globals.css tokens.
          The previous `bg-slate-50 text-slate-900` beat those rules on
          specificity and pinned the whole app to a light background. */}
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
