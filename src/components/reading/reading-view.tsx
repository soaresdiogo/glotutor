'use client';

import type { ReadingTextDetail } from '@/client-api/reading.api';
import { useTranslate } from '@/locales';

import { GrammarAnalysis } from './grammar-analysis';
import { ReadingComprehension } from './reading-comprehension';
import { ReadingControls } from './reading-controls';
import { ReadingFeedback } from './reading-feedback';
import { ReadingResultSkeleton } from './reading-result-skeleton';
import { ReadingStats } from './reading-stats';
import { ReadingTextDisplay } from './reading-text-display';
import { useReadingView } from './use.reading-view';
import { WordTooltip } from './word-tooltip';

type ReadingViewProps = Readonly<{
  text: ReadingTextDetail;
}>;

export function ReadingView({ text }: ReadingViewProps) {
  const { t } = useTranslate();
  const {
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
  } = useReadingView(text);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-(--accent-border) bg-(--accent-soft) px-3 py-0.5 text-[11px] font-semibold uppercase text-(--accent)">
          {text.level}
          {text.cefrLevel ? ` · ${text.cefrLevel}` : ''}
        </span>
        <span className="rounded-full border border-(--border) bg-(--bg-elevated) px-3 py-0.5 text-[11px] font-medium text-(--text-muted)">
          {text.category}
        </span>
      </div>

      <ReadingControls
        isRecording={isRecording}
        isEvaluating={isEvaluating}
        hasEvaluated={hasEvaluated}
        elapsedSeconds={elapsedSeconds}
        onStart={startRecording}
        onStop={stopRecording}
        onReset={reset}
      />

      {evaluationStage === 'processing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--bg-card) p-8 shadow-2xl">
            <div className="mb-6">
              <div className="h-3 w-full overflow-hidden rounded-full bg-(--border)">
                <div
                  className="h-3 rounded-full bg-linear-to-r from-(--accent) to-indigo-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-sm font-medium text-(--text-muted)">
                {progress}%
              </p>
            </div>
            <div className="text-center">
              {progress < 30 && (
                <div className="space-y-2">
                  <div className="text-4xl">🎤</div>
                  <p className="text-lg font-semibold text-(--text)">
                    {t('reading.processingAudio')}
                  </p>
                  <p className="text-sm text-(--text-muted)">
                    {t('reading.analyzingPatterns')}
                  </p>
                </div>
              )}
              {progress >= 30 && progress < 85 && (
                <div className="space-y-2">
                  <div className="text-4xl">🧠</div>
                  <p className="text-lg font-semibold text-(--text)">
                    {t('reading.evaluatingPronunciation')}
                  </p>
                  <p className="text-sm text-(--text-muted)">
                    {t('reading.comparingWithNative')}
                  </p>
                </div>
              )}
              {progress >= 85 && (
                <div className="space-y-2">
                  <div className="text-4xl">✨</div>
                  <p className="text-lg font-semibold text-(--text)">
                    {t('reading.almostDone')}
                  </p>
                  <p className="text-sm text-(--text-muted)">
                    {t('reading.preparingResults')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {evaluationStage === 'results-ready' && feedback == null && (
        <div className="mb-6 rounded-lg border border-(--accent-border) bg-(--accent-soft) p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎉</div>
            <div className="flex-1">
              <p className="font-semibold text-(--text)">
                {t('reading.resultsReady')}
              </p>
              <p className="text-sm text-(--text-muted)">
                {t('reading.detailedAnalysisLoading')}
              </p>
            </div>
            <div className="animate-spin text-(--accent)">⏳</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-5 text-[12px] text-(--text-muted)">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-(--green-bg) border border-(--green-border)" />
          {t('reading.legendGreat')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-(--yellow-bg) border border-(--yellow-border)" />
          {t('reading.legendAlmost')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-(--red-bg) border border-(--red-border)" />
          {t('reading.legendPractice')}
        </span>
      </div>

      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-6 sm:p-8">
        <ReadingTextDisplay
          content={text.content}
          wordScores={wordScores}
          vocabulary={vocabulary}
          onWordClick={handleWordClick}
        />
      </div>

      {isEvaluating && <ReadingResultSkeleton />}

      {!isEvaluating && metrics && (
        <ReadingStats
          wpm={metrics.wpm}
          greenCount={metrics.greenCount}
          yellowCount={metrics.yellowCount}
          redCount={metrics.redCount}
          missedCount={metrics.missedCount}
        />
      )}

      {!isEvaluating && feedback && metrics && (
        <div className="animate-fade-in">
          <ReadingFeedback
            data={feedback}
            wpm={metrics.wpm}
            onPlayWord={playPronunciation}
          />
        </div>
      )}

      {!isEvaluating && grammarItems.length > 0 && (
        <div className="animate-fade-in">
          <GrammarAnalysis items={grammarItems} />
        </div>
      )}

      {!isEvaluating && (text.comprehension?.length ?? 0) > 0 && (
        <div className="animate-fade-in">
          <ReadingComprehension
            questions={text.comprehension ?? []}
            sessionId={lastSessionId ?? undefined}
            savedAnswers={lastComprehensionAnswers ?? undefined}
          />
        </div>
      )}

      {tooltip != null && currentScore && (
        <WordTooltip
          key={tooltip.index}
          score={currentScore}
          phoneticIpa={phoneticIpa}
          definition={definition}
          onPlay={playPronunciation}
          onClose={closeTooltip}
          anchorRect={tooltip.rect}
        />
      )}
    </div>
  );
}
