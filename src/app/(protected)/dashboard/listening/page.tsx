'use client';

import { PodcastList } from '@/components/listening';
import { useTranslate } from '@/locales';

export default function ListeningListPage() {
  const { t } = useTranslate();

  return (
    <main className="p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight text-(--text)">
          {t('listening.menuTitle')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
          {t('dashboard.listeningDesc')}
        </p>
      </header>
      <PodcastList />
    </main>
  );
}
