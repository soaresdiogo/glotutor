'use client';

import { useTranslate } from '@/locales';

type Props = {
  used: number;
  limit: number;
  canStartNew: boolean;
};

export function DailyLimitBanner({ used, limit, canStartNew }: Props) {
  const { t } = useTranslate();
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        canStartNew
          ? 'border-(--border) bg-(--bg-elevated) text-(--text-muted)'
          : 'border-(--orange-border) bg-(--orange-bg) text-(--orange)'
      }`}
    >
      {t('nativeLessons.dailyLimit', { used, limit })}
    </div>
  );
}
