'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type ComprehensionAnswerEntry,
  type ReadingTextDetail,
  readingApi,
  type WordScorePayload,
} from '@/client-api/reading.api';
import { compressAudioForEvaluation } from '@/shared/lib/audio/compress-audio-client';
import { normalizeWord } from '@/shared/lib/reading/normalize-word';

export type EvaluationStage =
  | 'idle'
  | 'processing'
  | 'results-ready'
  | 'complete';

export type ReadingMetrics = {
  wpm: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  missedCount: number;
};

export type TooltipState = {
  index: number;
  rect: DOMRect;
} | null;

export function useReadingView(text: ReadingTextDetail) {
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStage, setEvaluationStage] =
    useState<EvaluationStage>('idle');
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [wordScores, setWordScores] = useState<WordScorePayload[] | null>(null);
  const [metrics, setMetrics] = useState<ReadingMetrics | null>(null);
  const [feedback, setFeedback] = useState<Awaited<
    ReturnType<typeof readingApi.getFeedback>
  > | null>(null);
  const [grammarItems, setGrammarItems] = useState<
    Awaited<ReturnType<typeof readingApi.getGrammarAnalysis>>['items']
  >([]);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [fetchedWordDetails, setFetchedWordDetails] = useState<{
    phoneticIpa: string | null;
    definition: string | null;
  } | null>(null);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [lastComprehensionAnswers, setLastComprehensionAnswers] =
    useState<Record<string, ComprehensionAnswerEntry> | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const fetchingWordRef = useRef<string | null>(null);

  const hasEvaluated = wordScores != null && wordScores.length > 0;

  useEffect(() => {
    let cancelled = false;
    readingApi.getLastSession(text.id).then(({ session }) => {
      if (cancelled || !session) return;
      setWordScores(session.wordScores);
      setMetrics(session.metrics);
      setFeedback(session.feedback ?? null);
      setGrammarItems(session.grammarItems ?? []);
      setLastSessionId(session.sessionId ?? null);
      setLastComprehensionAnswers(session.comprehensionAnswers ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [text.id]);

  const startTimer = useCallback(() => {
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const playPronunciation = useCallback(
    async (word: string) => {
      try {
        const { audioUrl } = await readingApi.getPronunciation(
          word,
          text.languageCode,
        );
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          await audio.play();
        } else if (
          globalThis.window !== undefined &&
          'speechSynthesis' in globalThis.window
        ) {
          globalThis.window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(word);
          u.lang = text.languageCode;
          u.rate = 0.85;
          globalThis.window.speechSynthesis.speak(u);
        }
      } catch {
        if (
          globalThis.window !== undefined &&
          'speechSynthesis' in globalThis.window
        ) {
          globalThis.window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(word);
          u.lang = text.languageCode;
          u.rate = 0.85;
          globalThis.window.speechSynthesis.speak(u);
        }
      }
    },
    [text.languageCode],
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000 },
      });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000,
      });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      };
      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error('Microphone access failed:', err);
    }
  }, [startTimer]);

  const runEvaluationAfterStop = useCallback(
    async (blob: Blob) => {
      const compressedBlob = await compressAudioForEvaluation(blob);
      const formData = new FormData();
      formData.append(
        'audio',
        compressedBlob,
        compressedBlob.type.includes('wav') ? 'audio.wav' : 'audio.webm',
      );
      formData.append('textId', text.id);

      const prevProgress = progressIntervalRef.current;
      if (prevProgress) clearInterval(prevProgress);
      progressIntervalRef.current = setInterval(() => {
        setProgress((p) => Math.min(p + 3, 85));
      }, 400);

      try {
        const result = await readingApi.evaluate(formData);

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(90);

        setWordScores(result.wordScores);
        setMetrics(result.metrics);
        setEvaluationStage('results-ready');
        setProgress(100);
        if (result.sessionId) {
          setLastSessionId(result.sessionId);
        }

        (async function loadFeedbackInBackground() {
          try {
            const [feedbackRes, grammarRes] = await Promise.all([
              readingApi.getFeedback({
                wordScores: result.wordScores,
                wpm: result.metrics.wpm,
                level: text.level,
                greenCount: result.metrics.greenCount,
                yellowCount: result.metrics.yellowCount,
                redCount: result.metrics.redCount,
                missedCount: result.metrics.missedCount,
              }),
              readingApi.getGrammarAnalysis({ textId: text.id }),
            ]);
            setFeedback(feedbackRes);
            setGrammarItems(grammarRes.items);
            if (result.sessionId) {
              await readingApi.saveSessionFeedback(result.sessionId, {
                feedback: feedbackRes,
                grammarItems: grammarRes.items,
              });
            }
            setEvaluationStage('complete');
          } catch (e) {
            console.error('Background feedback failed:', e);
            setEvaluationStage('complete');
          }
        })();
      } catch (e) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        console.error('Evaluate failed:', e);
        setEvaluationStage('idle');
      } finally {
        setIsEvaluating(false);
      }
    },
    [text.id, text.level],
  );

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    recorder.stop();
    setIsRecording(false);
    stopTimer();
    setIsEvaluating(true);
    setEvaluationStage('processing');
    setProgress(0);

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      void runEvaluationAfterStop(blob);
    };
  }, [stopTimer, runEvaluationAfterStop]);

  const reset = useCallback(() => {
    setWordScores(null);
    setMetrics(null);
    setFeedback(null);
    setGrammarItems([]);
    setTooltip(null);
    setFetchedWordDetails(null);
    setElapsedSeconds(0);
    setEvaluationStage('idle');
    setProgress(0);
  }, []);

  const handleWordClick = useCallback((index: number, rect: DOMRect) => {
    setFetchedWordDetails(null);
    setTooltip({ index, rect });
  }, []);

  const vocabulary = text.vocabulary ?? [];
  const currentScore = tooltip != null ? wordScores?.[tooltip.index] : null;
  const vocabularyEntry =
    currentScore && vocabulary.length > 0
      ? vocabulary.find((v) => normalizeWord(v.word) === currentScore.expected)
      : null;
  const fromVocabulary = {
    phoneticIpa: vocabularyEntry?.phoneticIpa ?? null,
    definition: vocabularyEntry?.definition ?? null,
  };
  const needsFetch =
    currentScore &&
    (fromVocabulary.phoneticIpa == null || fromVocabulary.definition == null);

  useEffect(() => {
    if (!needsFetch || !currentScore) return;
    const word = currentScore.expected;
    fetchingWordRef.current = word;
    let cancelled = false;
    readingApi
      .getWordDetails(word, text.languageCode)
      .then((res) => {
        if (cancelled) return;
        if (fetchingWordRef.current !== word) return;
        setFetchedWordDetails({
          phoneticIpa: res.phoneticIpa,
          definition: res.definition,
        });
      })
      .catch(() => {
        if (!cancelled && fetchingWordRef.current === word) {
          setFetchedWordDetails({ phoneticIpa: null, definition: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [needsFetch, currentScore, text.languageCode]);

  const closeTooltip = useCallback(() => {
    fetchingWordRef.current = null;
    setTooltip(null);
    setFetchedWordDetails(null);
  }, []);

  const phoneticIpa =
    fromVocabulary.phoneticIpa ?? fetchedWordDetails?.phoneticIpa ?? null;
  const definition =
    fromVocabulary.definition ?? fetchedWordDetails?.definition ?? null;

  return {
    text,
    isRecording,
    isEvaluating,
    evaluationStage,
    progress,
    elapsedSeconds,
    wordScores,
    metrics,
    feedback,
    grammarItems,
    tooltip,
    currentScore,
    hasEvaluated,
    vocabulary,
    phoneticIpa,
    definition,
    lastSessionId,
    lastComprehensionAnswers,
    startRecording,
    stopRecording,
    reset,
    handleWordClick,
    closeTooltip,
    playPronunciation,
  };
}
