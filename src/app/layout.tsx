import { Theme } from '@radix-ui/themes';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { TenantUnavailable } from '@/components/tenant-unavailable';
import { makeGetTenantByDomainUseCase } from '@/features/tenants/application/factories/get-tenant-by-domain.factory';
import { LocaleProvider } from '@/locales';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import {
  getLocaleFromAcceptLanguage,
  translateApiMessage,
} from '@/shared/lib/translate-api-message';
import './globals.css';

const SITE_URL = 'https://glotutor.com';
const OG_IMAGE = `${SITE_URL}/icon/colour.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GloTutor - Your 24/7 private tutor.',
    template: '%s | GloTutor',
  },
  description:
    'Learn languages with advanced AI. Pronunciation feedback, real conversation practice with a native-level AI tutor, and authentic content. Start your 7-day free trial.',
  keywords: [
    'learn languages',
    'online language course',
    'AI for languages',
    'English pronunciation',
    'conversation practice',
    'language fluency',
    'learn like natives',
    'GloTutor',
    'pronunciation practice',
    'language learning platform',
    'English with AI',
  ],
  authors: [{ name: 'glotutor.com', url: SITE_URL }],
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'GloTutor - Your 24/7 private tutor.',
    description:
      'Learn languages with advanced AI. Pronunciation feedback, real conversation practice with a native-level AI tutor. Start your 7-day free trial.',
    images: [
      {
        url: OG_IMAGE,
        alt: 'GloTutor – Your 24/7 private tutor',
        width: 512,
        height: 512,
      },
    ],
    locale: 'en_US',
    siteName: 'glotutor.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GloTutor - Your 24/7 private tutor.',
    description:
      'Learn languages with advanced AI. Pronunciation feedback, real conversation practice. Start your 7-day free trial.',
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/favicon/site.webmanifest',
};

function getDomainFromHeaders(host: string | null): string {
  if (!host) return 'localhost';
  return host.split(':')[0].toLowerCase().trim() || 'localhost';
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get('host');
  const domain = getDomainFromHeaders(host);
  const getTenantByDomain = makeGetTenantByDomainUseCase();
  const tenant = await getTenantByDomain.execute(domain);

  if (!tenant) {
    const acceptLanguage = headersList.get('accept-language');
    const locale = getLocaleFromAcceptLanguage(acceptLanguage);
    const title = translateApiMessage(locale, 'tenant.unavailable.title');
    const description = translateApiMessage(
      locale,
      'tenant.unavailable.description',
    );
    return (
      <html lang={locale}>
        <body className="min-h-screen bg-(--bg) text-(--text) antialiased">
          <TenantUnavailable title={title} description={description} />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Great+Vibes&display=swap"
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
