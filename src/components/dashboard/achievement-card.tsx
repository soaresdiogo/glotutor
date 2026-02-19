'use client';

import { useTranslate } from '@/locales';

type AchievementCardProps = Readonly<{
  icon: string;
  titleKey: string;
  descKey: string;
  locked?: boolean;
}>;

export function AchievementCard({
  icon,
  titleKey,
  descKey,
  locked = false,
}: AchievementCardProps) {
  const { t } = useTranslate();

  return (
    <article
      className={`rounded-xl border border-(--border) bg-(--bg-card) p-5 text-center transition hover:-translate-y-1 hover:border-(--border-light) ${
        locked ? 'opacity-50' : ''
      }`}
    >
      <div
        className={`mb-2 text-4xl transition duration-300 ${locked ? 'grayscale' : ''}`}
        aria-hidden
      >
        {icon}
      </div>
      <h3 className="mb-0.5 text-sm font-semibold text-(--text)">
        {t(titleKey)}
      </h3>
      <p className="text-[11px] text-(--text-dim)">{t(descKey)}</p>
    </article>
  );
}
