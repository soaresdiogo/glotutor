'use client';

import { TextList } from '@/components/reading';
import { useTranslate } from '@/locales';

export default function ReadingListPage() {
  const { t } = useTranslate();

  return (
    <main className="p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight text-(--text)">
          {t('dashboard.reading')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
          {t('dashboard.readingDesc')}
        </p>
      </header>
      <TextList />
    </main>
  );
}
