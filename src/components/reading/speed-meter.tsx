'use client';

import { useTranslate } from '@/locales';

type SpeedMeterProps = Readonly<{
  wpm: number;
}>;

const MAX_WPM = 250;

function getSpeedColor(wpm: number): string {
  if (wpm < 100) return 'var(--yellow)';
  if (wpm < 180) return 'var(--green)';
  return 'var(--accent)';
}

export function SpeedMeter({ wpm }: SpeedMeterProps) {
  const { t } = useTranslate();
  const percentage = Math.min((wpm / MAX_WPM) * 100, 100);
  const color = getSpeedColor(wpm);

  return (
    <div className="mt-5 border-t border-(--border) pt-5">
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
        {t('reading.readingSpeed')}
      </h4>
      <div className="relative h-2 overflow-visible rounded-full bg-(--bg-elevated)">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
        <div
          className="absolute top-[-6px] h-5 w-1 rounded-sm shadow-md transition-all duration-500"
          style={{
            left: `calc(${percentage}% - 2px)`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-(--text-dim)">
        <span>60</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
        <span>250+</span>
      </div>
      <p className="mt-2 font-mono text-sm font-semibold text-(--text)">
        {wpm} {t('reading.wpmLabel')}
      </p>
    </div>
  );
}
