'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { readingApi } from '@/client-api/reading.api';
import { ReadingView } from '@/components/reading';
import { useTranslate } from '@/locales';

export default function ReadingPracticePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { t } = useTranslate();

  const {
    data: text,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['reading', 'text', id],
    queryFn: () => readingApi.getText(id),
    enabled: !!id,
  });

  if (isPending || !id) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      </main>
    );
  }

  if (isError || !text) {
    return (
      <main className="p-6 md:p-8">
        <p className="text-(--text-muted)">{t('reading.textNotFound')}</p>
        <Link
          href="/dashboard/reading"
          className="mt-4 text-(--accent) hover:underline"
        >
          {t('reading.backToList')}
        </Link>
      </main>
    );
  }

  const wordCount = text.wordCount ?? 0;
  const estMin = text.estimatedMinutes ?? Math.ceil(wordCount / 120);

  return (
    <main className="mx-auto max-w-3xl p-6 pb-20 md:p-8">
      <Link
        href="/dashboard/reading"
        className="mb-6 inline-block text-[14px] text-(--text-muted) hover:text-(--text)"
      >
        ← {t('reading.backToReading')}
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight text-(--text)">
          {text.title}
        </h1>
        <p className="mt-2 text-[14px] text-(--text-dim)">
          {t('reading.wordsMinRead', { count: wordCount, min: estMin })}
        </p>
      </header>
      <ReadingView text={text} />
    </main>
  );
}
