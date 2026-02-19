import { Theme } from '@radix-ui/themes';
import type { Metadata } from 'next';
import { LocaleProvider } from '@/locales';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Glotutor',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-(--bg) text-(--text) antialiased">
        <Theme appearance="dark" accentColor="indigo" radius="medium">
          <QueryProvider>
            <AuthProvider>
              <LocaleProvider>{children}</LocaleProvider>
            </AuthProvider>
          </QueryProvider>
        </Theme>
      </body>
    </html>
  );
}
