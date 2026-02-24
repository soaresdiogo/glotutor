'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { certificatesApi } from '@/client-api/certificates.api';
import {
  type CertificateViewData,
  CertificateViewWithExport,
} from '@/components/certificates/certificate-view';
import { useTranslate } from '@/locales';
import { useLanguageContext } from '@/providers/language-provider';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function getVerifyUrl(code: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/verify/${encodeURIComponent(code)}`;
}

export default function CertificatesPage() {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  const { activeLanguage, languages } = useLanguageContext();
  const language = activeLanguage ?? languages[0]?.language ?? 'en';

  const [viewingCode, setViewingCode] = useState<string | null>(null);
  const [issuedData, setIssuedData] = useState<CertificateViewData | null>(
    null,
  );

  const { data: eligibility, isLoading } = useQuery({
    queryKey: ['certificates', 'eligibility', language],
    queryFn: () => certificatesApi.getEligibility(language),
    enabled: !!language,
  });

  const { data: verifyData, isLoading: verifyLoading } = useQuery({
    queryKey: ['certificates', 'verify', viewingCode],
    queryFn: () => {
      const code = viewingCode;
      if (!code) throw new Error('viewingCode required when enabled');
      return certificatesApi.verify(code);
    },
    enabled: !!viewingCode && !issuedData,
  });

  const issueMutation = useMutation({
    mutationFn: (cefrLevel: string) =>
      certificatesApi.issue({ language, cefrLevel }),
    onSuccess: (cert) => {
      queryClient.invalidateQueries({
        queryKey: ['certificates', 'eligibility', language],
      });
      setIssuedData({
        studentName: cert.studentName,
        language: cert.language,
        languageName: cert.languageName,
        cefrLevel: cert.cefrLevel,
        levelName: cert.levelName,
        totalStudyMinutes: cert.totalStudyMinutes,
        completedAt: cert.completedAt,
        verificationCode: cert.verificationCode,
      });
      setViewingCode(cert.verificationCode);
    },
  });

  const displayData: CertificateViewData | null = issuedData
    ? issuedData
    : verifyData
      ? {
          studentName: verifyData.studentName,
          language: verifyData.language,
          languageName: verifyData.languageName,
          cefrLevel: verifyData.cefrLevel,
          levelName: verifyData.levelName,
          totalStudyMinutes: verifyData.totalStudyMinutes,
          completedAt: verifyData.completedAt,
          verificationCode: verifyData.verificationCode,
        }
      : null;

  const showCertificate = viewingCode && displayData;

  const handleIssue = (cefrLevel: string) => {
    issueMutation.mutate(cefrLevel);
  };

  const handleViewIssued = (code: string) => {
    setIssuedData(null);
    setViewingCode(code);
  };

  const handleBack = () => {
    setViewingCode(null);
    setIssuedData(null);
  };

  if (showCertificate && displayData) {
    return (
      <main className="mx-auto max-w-4xl flex-1 p-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-block text-sm text-(--accent) hover:underline"
        >
          ← {t('profile.back')} {t('dashboard.certificates.title')}
        </button>
        {verifyLoading && !issuedData ? (
          <p className="text-(--text-muted)">{t('common.loading')}</p>
        ) : (
          <div className="flex justify-center overflow-x-auto bg-(--bg) py-8">
            <CertificateViewWithExport
              data={displayData}
              verifyUrl={getVerifyUrl(displayData.verificationCode)}
              showQr
              exportPdfLabel={t('dashboard.certificates.exportPdf')}
            />
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl flex-1 p-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-(--accent) hover:underline"
      >
        ← {t('dashboard.levelProgress')}
      </Link>
      <h1 className="mb-2 text-2xl font-semibold text-(--text)">
        {t('dashboard.certificates.title')}
      </h1>
      <p className="mb-8 text-(--text-muted)">
        {t('dashboard.certificates.subtitle')}
      </p>

      {isLoading ? (
        <p className="text-(--text-muted)">{t('common.loading')}</p>
      ) : !eligibility ? (
        <p className="text-(--text-muted)">
          {t('dashboard.certificates.noLevelsCompleted')}
        </p>
      ) : (
        <div className="space-y-4">
          {CEFR_LEVELS.map((cefrLevel) => {
            const level = eligibility.levels.find(
              (l) => l.cefrLevel === cefrLevel,
            );
            if (!level) return null;
            const canGenerate =
              level.isLevelCompleted && !level.certificateIssued;
            const hasCertificate =
              level.certificateIssued && level.verificationCode;

            return (
              <div
                key={cefrLevel}
                className="rounded-xl border border-(--border) bg-(--bg-card) p-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <span className="font-semibold text-(--text)">
                    {level.levelName} ({cefrLevel})
                  </span>
                  {!level.isLevelCompleted && (
                    <p className="mt-1 text-sm text-(--text-muted)">
                      {t('dashboard.certificates.completeAllToUnlock')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {hasCertificate ? (
                    <button
                      type="button"
                      onClick={() => {
                        const c = level.verificationCode;
                        if (c) handleViewIssued(c);
                      }}
                      className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      {t('dashboard.certificates.viewOrExport')}
                    </button>
                  ) : canGenerate ? (
                    <button
                      type="button"
                      onClick={() => handleIssue(cefrLevel)}
                      disabled={issueMutation.isPending}
                      className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {issueMutation.isPending
                        ? t('common.loading')
                        : t('dashboard.certificates.generate')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="rounded-xl border border-(--border) bg-(--bg-elevated) px-4 py-2 text-sm font-medium text-(--text-muted) cursor-not-allowed"
                    >
                      {t('dashboard.certificates.generate')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-sm text-(--text-muted)">
        {t('dashboard.certificates.footerHint')}
      </p>
    </main>
  );
}
