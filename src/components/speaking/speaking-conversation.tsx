'use client';

import { useEffect, useRef } from 'react';

import { useSpeakingTimer } from '@/hooks/speaking';
import { useTranslate } from '@/locales';

import { SpeakingTimer } from './speaking-timer';

export type MessageCorrection = {
  correction: string;
  explanation: string;
};

export type ConversationMessage = {
  role: 'user' | 'assistant';
  text: string;
  correction?: MessageCorrection;
};

type SpeakingConversationProps = Readonly<{
  durationSeconds: number;
  topicTitle: string;
  onExpire: () => void;
  onEndClick: () => void;
  isConnecting?: boolean;
  messages?: ConversationMessage[];
  isRecording?: boolean;
  isTutorSpeaking?: boolean;
  isProcessing?: boolean;
  greetingComplete?: boolean;
  error?: string | null;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onStartGreeting?: () => void;
  sessionId?: string | null;
}>;

export function SpeakingConversation({
  durationSeconds,
  topicTitle,
  onExpire,
  onEndClick,
  isConnecting,
  messages = [],
  isRecording,
  isTutorSpeaking,
  isProcessing,
  greetingComplete = false,
  error,
  onStartRecording,
  onStopRecording,
  onStartGreeting,
  sessionId,
}: SpeakingConversationProps) {
  const { t } = useTranslate();
  const greetingStartedRef = useRef(false);

  useEffect(() => {
    if (
      sessionId &&
      onStartGreeting &&
      !isConnecting &&
      !greetingStartedRef.current
    ) {
      greetingStartedRef.current = true;
      onStartGreeting();
    }
  }, [sessionId, onStartGreeting, isConnecting]);

  const timer = useSpeakingTimer({
    durationSeconds,
    onExpire,
    enabled: !isConnecting && greetingComplete,
    warningSeconds: 15,
  });

  const avatarState = isConnecting
    ? 'connecting'
    : isProcessing
      ? 'thinking'
      : isTutorSpeaking
        ? 'speaking'
        : isRecording
          ? 'listening'
          : 'idle';

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-(--border) py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              avatarState === 'listening'
                ? 'animate-pulse border-(--accent) bg-(--accent-soft)'
                : avatarState === 'speaking'
                  ? 'border-(--green) bg-(--green-bg)'
                  : avatarState === 'thinking'
                    ? 'border-(--border) bg-(--bg-elevated)'
                    : 'border-(--accent-border) bg-(--accent-soft)'
            }`}
            title={avatarState}
          >
            <span className="text-lg">🎓</span>
          </div>
          <div>
            <p className="font-semibold text-(--text)">{topicTitle}</p>
            <p className="text-xs text-(--text-muted)">
              {isConnecting
                ? t('speaking.connecting')
                : isRecording
                  ? t('speaking.listening')
                  : isTutorSpeaking
                    ? t('speaking.speaking')
                    : isProcessing
                      ? t('speaking.thinking')
                      : t('speaking.realtimeConversation')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SpeakingTimer
            formatted={timer.formatted}
            isWarning={timer.isWarning}
          />
          <button
            type="button"
            onClick={onEndClick}
            className="rounded-lg border border-(--border) px-4 py-2 text-sm text-(--text-muted) transition hover:border-(--red) hover:text-(--red)"
          >
            {t('speaking.endAndReview')}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {isConnecting ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--accent) border-t-transparent" />
            <p className="text-sm text-(--text-muted)">
              {t('speaking.connectingToTutor')}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {messages.length === 0 ? (
                <p className="text-(--text-muted)">
                  {greetingComplete
                    ? t('speaking.tapMicToReply')
                    : t('speaking.tutorGreetsFirst')}
                </p>
              ) : (
                <ul
                  className="flex flex-col gap-4"
                  aria-label={t('speaking.conversationHistory')}
                >
                  {messages.map((turn, i) => (
                    <li
                      key={`${turn.role}-${i}-${turn.text.slice(0, 20)}`}
                      className={`flex flex-col gap-1 ${turn.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-xs font-medium text-(--text-muted)">
                        {turn.role === 'assistant'
                          ? t('speaking.tutorLabel')
                          : t('speaking.youLabel')}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          turn.role === 'user'
                            ? 'bg-(--accent) text-white'
                            : 'bg-(--bg-elevated) border border-(--border)'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {turn.text}
                        </p>
                      </div>
                      {turn.role === 'assistant' && turn.correction && (
                        <section
                          className="max-w-[85%] rounded-xl border border-(--yellow) bg-(--yellow-bg) px-4 py-3"
                          aria-label={t('speaking.correctionLabel')}
                        >
                          <p className="text-xs font-semibold text-(--text-muted)">
                            {t('speaking.correctionLabel')}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-(--text)">
                            {turn.correction.correction}
                          </p>
                          {turn.correction.explanation && (
                            <p className="mt-1 text-xs text-(--text-muted)">
                              {turn.correction.explanation}
                            </p>
                          )}
                        </section>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {error && <p className="mt-4 text-sm text-(--red)">{error}</p>}
            {!isConnecting && onStartRecording && onStopRecording && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  disabled={isProcessing || isTutorSpeaking}
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition disabled:opacity-50 ${
                    isRecording
                      ? 'border-(--red) bg-(--red-bg) text-(--red)'
                      : 'border-(--border) bg-(--bg-elevated) text-(--text-muted) hover:border-(--accent) hover:text-(--accent)'
                  }`}
                  title={
                    isRecording
                      ? t('speaking.stopMicrophone')
                      : t('speaking.startMicrophone')
                  }
                  aria-label={
                    isRecording
                      ? t('speaking.stopMicrophone')
                      : t('speaking.startMicrophone')
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <title>
                      {isRecording
                        ? t('speaking.stopMicrophone')
                        : t('speaking.startMicrophone')}
                    </title>
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
