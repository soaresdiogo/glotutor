'use client';

import { useQuery } from '@tanstack/react-query';

import { type ReadingTextListItem, readingApi } from '@/client-api/reading.api';
import { useTranslate } from '@/locales';

import { TextCard } from './text-card';

export function TextList() {
  const { t } = useTranslate();

  const { data, isPending, isError } = useQuery({
    queryKey: ['reading', 'texts'],
    queryFn: async () => {
      const res = await readingApi.listTexts();
      return res.texts;
    },
  });

  if (isPending) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-(--text-muted)">{t('reading.loadingTexts')}</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <p className="text-(--text-muted)">{t('reading.errorLoadingTexts')}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <p className="text-(--text-muted)">{t('reading.noTextsForLevel')}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((text: ReadingTextListItem) => (
        <li key={text.id}>
          <TextCard text={text} />
        </li>
      ))}
    </ul>
  );
}
