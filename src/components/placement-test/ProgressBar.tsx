'use client';

type ProgressBarProps = {
  current: number;
  total: number;
  className?: string;
};

export function ProgressBar({
  current,
  total,
  className = '',
}: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-(--border) ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Question ${current} of ${total}`}
    >
      <div
        className="h-full rounded-full bg-(--accent) transition-all duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
