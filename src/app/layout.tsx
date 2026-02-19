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

export const metadata: Metadata = {
  title: 'Glotutor',
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
