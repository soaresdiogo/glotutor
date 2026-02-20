'use client';

import { useEffect, useRef } from 'react';

import { useSpeakingTimer } from '@/hooks/speaking';
import type { TranslationParams } from '@/locales';
import { useTranslate } from '@/locales';

import { SpeakingTimer } from './speaking-timer';

type TFunction = (key: string, params?: TranslationParams) => string;

export type MessageCorrection = {
  correction: string;
  explanation: string;
};

export type ConversationMessage = {
  role: 'user' | 'assistant';
  text: string;
  correction?: MessageCorrection;
};

type AvatarState =
  | 'connecting'
  | 'thinking'
  | 'speaking'
  | 'listening'
  | 'idle';

function getAvatarState(
  isConnecting: boolean,
  isProcessing: boolean,
  isTutorSpeaking: boolean,
  isRecording: boolean,
): AvatarState {
  if (isConnecting) return 'connecting';
  if (isProcessing) return 'thinking';
  if (isTutorSpeaking) return 'speaking';
  if (isRecording) return 'listening';
  return 'idle';
}

function getAvatarClassName(state: AvatarState): string {
  const base = 'flex h-10 w-10 items-center justify-center rounded-xl border ';
  const byState: Record<AvatarState, string> = {
    listening: 'animate-pulse border-(--accent) bg-(--accent-soft)',
    speaking: 'border-(--green) bg-(--green-bg)',
    thinking: 'border-(--border) bg-(--bg-elevated)',
    connecting: 'border-(--accent-border) bg-(--accent-soft)',
    idle: 'border-(--accent-border) bg-(--accent-soft)',
  };
  return base + byState[state];
}

function getStatusLabel(state: AvatarState, t: TFunction): string {
  const labels: Record<AvatarState, string> = {
    connecting: t('speaking.connecting'),
    listening: t('speaking.listening'),
    speaking: t('speaking.speaking'),
    thinking: t('speaking.thinking'),
    idle: t('speaking.realtimeConversation'),
  };
  return labels[state];
}

type SpeakingConversationHeaderProps = Readonly<{
  topicTitle: string;
  avatarState: AvatarState;
  timer: { formatted: string; isWarning: boolean };
  onEndClick: () => void;
  t: TFunction;
}>;

function SpeakingConversationHeader({
  topicTitle,
  avatarState,
  timer,
  onEndClick,
  t,
}: SpeakingConversationHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-(--border) py-4">
      <div className="flex items-center gap-3">
        <div className={getAvatarClassName(avatarState)} title={avatarState}>
          <span className="text-lg">🎓</span>
        </div>
        <div>
          <p className="font-semibold text-(--text)">{topicTitle}</p>
          <p className="text-xs text-(--text-muted)">
            {getStatusLabel(avatarState, t)}
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
  );
}

function ConnectingView({ t }: Readonly<{ t: TFunction }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--accent) border-t-transparent" />
      <p className="text-sm text-(--text-muted)">
        {t('speaking.connectingToTutor')}
      </p>
    </div>
  );
}

type ConversationMessageListProps = Readonly<{
  messages: ConversationMessage[];
  greetingComplete: boolean;
  t: TFunction;
}>;

function ConversationMessageList({
  messages,
  greetingComplete,
  t,
}: ConversationMessageListProps) {
  if (messages.length === 0) {
    return (
      <p className="text-(--text-muted)">
        {greetingComplete
          ? t('speaking.tapMicToReply')
          : t('speaking.tutorGreetsFirst')}
      </p>
    );
  }
  return (
    <ul
      className="flex flex-col gap-4"
      aria-label={t('speaking.conversationHistory')}
    >
      {messages.map((turn, i) => (
        <ConversationTurn
          key={`${turn.role}-${i}-${turn.text.slice(0, 20)}`}
          turn={turn}
          t={t}
        />
      ))}
    </ul>
  );
}

type ConversationTurnProps = Readonly<{
  turn: ConversationMessage;
  t: TFunction;
}>;

function ConversationTurn({ turn, t }: ConversationTurnProps) {
  const isUser = turn.role === 'user';
  return (
    <li
      className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
    >
      <span className="text-xs font-medium text-(--text-muted)">
        {isUser ? t('speaking.youLabel') : t('speaking.tutorLabel')}
      </span>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-(--accent) text-white'
            : 'bg-(--bg-elevated) border border-(--border)'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{turn.text}</p>
      </div>
      {!isUser && turn.correction && (
        <CorrectionBlock correction={turn.correction} t={t} />
      )}
    </li>
  );
}

type CorrectionBlockProps = Readonly<{
  correction: MessageCorrection;
  t: TFunction;
}>;

function CorrectionBlock({ correction, t }: CorrectionBlockProps) {
  return (
    <section
      className="max-w-[85%] rounded-xl border border-(--yellow) bg-(--yellow-bg) px-4 py-3"
      aria-label={t('speaking.correctionLabel')}
    >
      <p className="text-xs font-semibold text-(--text-muted)">
        {t('speaking.correctionLabel')}
      </p>
      <p className="mt-1 text-sm font-semibold text-(--text)">
        {correction.correction}
      </p>
      {correction.explanation && (
        <p className="mt-1 text-xs text-(--text-muted)">
          {correction.explanation}
        </p>
      )}
    </section>
  );
}

type MicButtonProps = Readonly<{
  isRecording: boolean;
  isProcessing: boolean;
  isTutorSpeaking: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  t: TFunction;
}>;

function MicButton({
  isRecording,
  isProcessing,
  isTutorSpeaking,
  onStartRecording,
  onStopRecording,
  t,
}: MicButtonProps) {
  const label = isRecording
    ? t('speaking.stopMicrophone')
    : t('speaking.startMicrophone');
  return (
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
        title={label}
        aria-label={label}
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
          <title>{label}</title>
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </button>
    </div>
  );
}

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

  const avatarState = getAvatarState(
    Boolean(isConnecting),
    Boolean(isProcessing),
    Boolean(isTutorSpeaking),
    Boolean(isRecording),
  );

  const showMic =
    !isConnecting && onStartRecording != null && onStopRecording != null;

  return (
    <div className="flex h-full flex-col">
      <SpeakingConversationHeader
        topicTitle={topicTitle}
        avatarState={avatarState}
        timer={timer}
        onEndClick={onEndClick}
        t={t}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {isConnecting ? (
          <ConnectingView t={t} />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <ConversationMessageList
                messages={messages}
                greetingComplete={greetingComplete}
                t={t}
              />
            </div>
            {error != null && (
              <p className="mt-4 text-sm text-(--red)">{error}</p>
            )}
            {showMic && onStartRecording != null && onStopRecording != null && (
              <MicButton
                isRecording={Boolean(isRecording)}
                isProcessing={Boolean(isProcessing)}
                isTutorSpeaking={Boolean(isTutorSpeaking)}
                onStartRecording={onStartRecording}
                onStopRecording={onStopRecording}
                t={t}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
