'use client';

import Link from 'next/link';
import {
  type CertificateViewData,
  CertificateViewWithExport,
} from '@/components/certificates/certificate-view';
import { useTranslate } from '@/locales';

/** Sample data for certificate preview – no level completion required. */
const PREVIEW_DATA: CertificateViewData = {
  studentName: 'Maria da Silva Santos',
  language: 'pt',
  languageName: 'Portuguese',
  cefrLevel: 'B2',
  levelName: 'Intermediário Superior',
  totalStudyMinutes: 720,
  completedAt: new Date().toISOString(),
  verificationCode: 'GLT-2025-PREVIEW',
};

function getVerifyUrl(code: string): string {
  if (typeof globalThis.window === 'undefined') return '';
  return `${globalThis.window.location.origin}/verify/${encodeURIComponent(code)}`;
}

export default function CertificatePreviewPage() {
  const { t } = useTranslate();

  return (
    <main className="mx-auto max-w-4xl flex-1 p-6">
      <Link
        href="/dashboard/certificates"
        className="mb-6 inline-block text-sm text-(--accent) hover:underline"
      >
        ← {t('profile.back')} {t('dashboard.certificates.title')}
      </Link>
      <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-(--text)">
        <strong>{t('dashboard.certificates.previewBannerTitle')}</strong>{' '}
        {t('dashboard.certificates.previewBannerDescription')}
      </div>
      <div className="flex justify-center overflow-x-auto bg-(--bg) py-8">
        <CertificateViewWithExport
          data={PREVIEW_DATA}
          verifyUrl={getVerifyUrl(PREVIEW_DATA.verificationCode)}
          showQr
          exportPdfLabel={t('dashboard.certificates.exportPdf')}
        />
      </div>
    </main>
  );
}
