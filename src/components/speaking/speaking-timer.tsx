'use client';

type SpeakingTimerProps = Readonly<{
  formatted: string;
  isWarning?: boolean;
}>;

export function SpeakingTimer({ formatted, isWarning }: SpeakingTimerProps) {
  return (
    <div
      className={`rounded-lg border px-3 py-1.5 font-mono text-sm ${
        isWarning
          ? 'border-(--orange) text-(--orange)'
          : 'border-(--border) text-(--text-muted)'
      }`}
    >
      {formatted}
    </div>
  );
}
