'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type UseSpeakingTimerParams = {
  durationSeconds: number;
  onExpire: () => void;
  enabled: boolean;
  /** Called once when remaining time drops to warningSeconds or below. */
  onWarning?: () => void;
  warningSeconds?: number;
};

export function useSpeakingTimer({
  durationSeconds,
  onExpire,
  enabled,
  onWarning,
  warningSeconds = 15,
}: UseSpeakingTimerParams) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const onExpireRef = useRef(onExpire);
  const onWarningRef = useRef(onWarning);
  const warningFiredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  onExpireRef.current = onExpire;
  onWarningRef.current = onWarning;

  useEffect(() => {
    if (!enabled || isPaused) return;
    setRemainingSeconds((prev) => (prev <= 0 ? durationSeconds : prev));
    warningFiredRef.current = false;
  }, [enabled, isPaused, durationSeconds]);

  useEffect(() => {
    if (!enabled || isPaused || remainingSeconds <= 0) return;
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => onExpireRef.current(), 0);
          return 0;
        }
        const next = prev - 1;
        if (next <= warningSeconds && !warningFiredRef.current) {
          warningFiredRef.current = true;
          onWarningRef.current?.();
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, isPaused, remainingSeconds, warningSeconds]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const reset = useCallback(
    (seconds?: number) => setRemainingSeconds(seconds ?? durationSeconds),
    [durationSeconds],
  );

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    remainingSeconds,
    formatted,
    isPaused,
    pause,
    resume,
    reset,
    isWarning: remainingSeconds > 0 && remainingSeconds <= 60,
  };
}
