'use client';

import { useCallback, useRef, useState } from 'react';

import { speakingApi } from '@/client-api/speaking.api';

export type MessageCorrection = {
  correction: string;
  explanation: string;
};

export type ConversationMessage = {
  role: 'user' | 'assistant';
  text: string;
  /** Shown below assistant message when present (audio still plays full tutorText). */
  correction?: MessageCorrection;
};

export type UseSpeakingConversationParams = {
  sessionId: string | null;
  enabled: boolean;
  onSessionExpired?: () => void;
};

export function useSpeakingConversation({
  sessionId,
  enabled: _enabled,
  onSessionExpired,
}: UseSpeakingConversationParams) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [greetingComplete, setGreetingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const sendAudioRef = useRef<(blob: Blob) => void>(() => {});

  const startGreeting = useCallback(async () => {
    if (!sessionId) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await speakingApi.sendMessageStart(sessionId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.tutorText },
      ]);
      if (res.tutorAudio) {
        const audio = new Audio(`data:audio/mp3;base64,${res.tutorAudio}`);
        setIsTutorSpeaking(true);
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            setIsTutorSpeaking(false);
            resolve();
          };
          audio.onerror = () => {
            setIsTutorSpeaking(false);
            reject(audio.error);
          };
          audio.play().catch(reject);
        });
      }
      if (res.isSessionExpired) {
        setIsSessionExpired(true);
        onSessionExpired?.();
      } else {
        setGreetingComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start');
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, onSessionExpired]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        for (const t of stream.getTracks()) t.stop();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          sendAudioRef.current(blob);
        }
      };
      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microphone access denied');
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const stopTutorAudio = useCallback(() => {
    // Will be implemented with ref to current Audio
    setIsTutorSpeaking(false);
  }, []);

  const sendAudio = useCallback(
    async (audioBlob: Blob) => {
      if (!sessionId) return;
      setIsProcessing(true);
      setError(null);
      try {
        const res = await speakingApi.sendMessage(sessionId, audioBlob);
        setMessages((prev) => [
          ...prev,
          ...(res.studentText
            ? [{ role: 'user' as const, text: res.studentText }]
            : []),
          {
            role: 'assistant' as const,
            text: res.tutorText,
            ...(res.correction ? { correction: res.correction } : {}),
          },
        ]);
        if (res.tutorAudio) {
          const audio = new Audio(`data:audio/mp3;base64,${res.tutorAudio}`);
          setIsTutorSpeaking(true);
          await new Promise<void>((resolve, reject) => {
            audio.onended = () => {
              setIsTutorSpeaking(false);
              resolve();
            };
            audio.onerror = () => {
              setIsTutorSpeaking(false);
              resolve();
            };
            audio.play().catch(reject);
          });
        }
        if (res.isSessionExpired) {
          setIsSessionExpired(true);
          onSessionExpired?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send');
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId, onSessionExpired],
  );

  sendAudioRef.current = sendAudio;

  return {
    messages,
    isRecording,
    isProcessing,
    isTutorSpeaking,
    isSessionExpired,
    greetingComplete,
    error,
    startGreeting,
    startRecording,
    stopRecording,
    stopTutorAudio,
    sendAudio,
  };
}
