'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { certificatesApi } from '@/client-api/certificates.api';
import {
  type CertificateViewData,
  CertificateViewWithExport,
} from '@/components/certificates/certificate-view';

function getVerifyUrl(code: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/verify/${encodeURIComponent(code)}`;
}

export default function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    params.then((p) => setCode(p.code ?? null));
  }, [params]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['certificates', 'verify', 'public', code],
    queryFn: () => {
      const c = code;
      if (!c) throw new Error('code required when enabled');
      return certificatesApi.verify(c);
    },
    enabled: !!code,
  });

  const displayData: CertificateViewData | null = data
    ? {
        studentName: data.studentName,
        language: data.language,
        languageName: data.languageName,
        cefrLevel: data.cefrLevel,
        levelName: data.levelName,
        totalStudyMinutes: data.totalStudyMinutes,
        completedAt: data.completedAt,
        verificationCode: data.verificationCode,
      }
    : null;

  if (!code) {
    return (
      <main className="min-h-screen bg-(--bg) flex items-center justify-center p-6">
        <p className="text-(--text-muted)">Loading…</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-(--bg) flex items-center justify-center p-6">
        <p className="text-(--text-muted)">Verifying certificate…</p>
      </main>
    );
  }

  if (isError || !displayData) {
    return (
      <main className="min-h-screen bg-(--bg) flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-(--text) mb-2">
            Certificate not found
          </h1>
          <p className="text-(--text-muted)">
            This certificate code is invalid or has been removed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--bg) py-8 px-4">
      <div className="flex flex-col items-center">
        <p className="mb-4 text-sm text-(--text-muted)">
          Certificate verification · GloTutor
        </p>
        <CertificateViewWithExport
          data={displayData}
          verifyUrl={getVerifyUrl(displayData.verificationCode)}
          showQr
          exportPdfLabel="Export PDF"
        />
      </div>
    </main>
  );
}
