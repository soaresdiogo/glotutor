'use client';

import { useSpeakingTopics } from '@/hooks/speaking';
import { useTranslate } from '@/locales';
import { useLanguageContext } from '@/providers/language-provider';

import { SpeakingTopicCard } from './speaking-topic-card';

export function SpeakingTopicList() {
  const { t } = useTranslate();
  const { activeLanguage, languages } = useLanguageContext();
  const level =
    languages.find((l) => l.language === activeLanguage)?.currentLevel ?? 'A1';
  const { data, isPending, isError } = useSpeakingTopics({
    language: activeLanguage,
    level,
  });

  if (isPending) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <p className="text-(--text-muted)">
          {t('speaking.failedToLoadTopics')}
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-8 text-center">
        <p className="text-(--text-muted)">{t('speaking.noTopicsForLevel')}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {data.map((topic) => (
        <li key={topic.id}>
          <SpeakingTopicCard topic={topic} />
        </li>
      ))}
    </ul>
  );
}
