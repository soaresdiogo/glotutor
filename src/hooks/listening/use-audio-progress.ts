'use client';

import { type RefObject, useEffect, useRef } from 'react';

export type UseAudioProgressOptions = {
  /** Set true when the audio element is in the DOM (e.g. !!podcast) so the effect attaches. */
  isAudioReady?: boolean;
  /** Called once when a milestone is crossed (e.g. 80). Page can setState here to enable UI. */
  onMilestone?: (pct: number) => void;
};

/**
 * Fire-and-forget audio progress tracking. ZERO useState — only useRef and useEffect.
 * timeupdate handler ONLY writes to a ref; API calls ONLY on: milestone crossed, pause, ended, unmount.
 * Returns nothing — does not cause parent re-renders.
 */
export function useAudioProgress(
  audioRef: RefObject<HTMLAudioElement | null>,
  podcastId: string,
  options?: UseAudioProgressOptions,
) {
  const { isAudioReady = true, onMilestone } = options ?? {};
  const currentPctRef = useRef(0);
  const sentMilestonesRef = useRef(new Set<number>());
  const onMilestoneRef = useRef(onMilestone);
  onMilestoneRef.current = onMilestone;

  useEffect(() => {
    if (isAudioReady) {
      const audio = audioRef.current;
      if (audio) {
        const MILESTONES = [25, 50, 75, 80, 100];

        const flush = (pct?: number) => {
          const value = Math.min(
            100,
            Math.max(0, Math.round(pct ?? currentPctRef.current)),
          );
          if (value <= 0) return;
          const origin =
            typeof globalThis.window !== 'undefined'
              ? globalThis.window.location.origin
              : '';
          fetch(`${origin}/api/listening/podcasts/${podcastId}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listenedPercentage: value }),
            credentials: 'include',
            keepalive: true,
          }).catch(() => {});
        };

        const onTimeUpdate = () => {
          if (!audio.duration) return;
          const pct = (audio.currentTime / audio.duration) * 100;
          currentPctRef.current = pct;
          for (const m of MILESTONES) {
            if (pct >= m && !sentMilestonesRef.current.has(m)) {
              sentMilestonesRef.current.add(m);
              flush(m);
              onMilestoneRef.current?.(m);
              break;
            }
          }
        };

        const onPause = () => flush();
        const onEnded = () => flush(100);
        const onBeforeUnload = () => flush();

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        globalThis.window.addEventListener('beforeunload', onBeforeUnload);

        return () => {
          flush();
          audio.removeEventListener('timeupdate', onTimeUpdate);
          audio.removeEventListener('pause', onPause);
          audio.removeEventListener('ended', onEnded);
          globalThis.window.removeEventListener('beforeunload', onBeforeUnload);
        };
      }
    }
  }, [audioRef, podcastId, isAudioReady]);
}
