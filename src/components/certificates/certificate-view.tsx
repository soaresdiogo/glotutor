'use client';

import Image from 'next/image';
import QRCode from 'qrcode';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { getCertificateCopy } from '@/features/certificates/application/constants/certificate-copy';

export type CertificateViewData = {
  studentName: string;
  language: string;
  languageName: string;
  cefrLevel: string;
  levelName: string;
  totalStudyMinutes: number;
  completedAt: string;
  verificationCode: string;
};

type CertificateViewProps = {
  data: CertificateViewData;
  verifyUrl: string;
  /** Director/signer name. Default: Diogo Schmidt Soares */
  directorName?: string;
  /** For PDF: hide QR or verification link in print */
  showQr?: boolean;
};

function formatHours(minutes: number, hoursWord: string): string {
  const h = Math.round(minutes / 60);
  return `${h} ${hoursWord}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const CertificateView = forwardRef<
  HTMLDivElement | null,
  CertificateViewProps
>(function CertificateView(
  { data, verifyUrl, directorName = 'Diogo Schmidt Soares', showQr = true },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
    ref,
    () => rootRef.current,
  );
  const copyForLang = getCertificateCopy(data.language);
  const courseName = copyForLang.courseNameTemplate
    .replace('{language}', data.languageName)
    .replace('{level}', data.cefrLevel)
    .replace('{levelName}', data.levelName);
  const hoursText = formatHours(data.totalStudyMinutes, copyForLang.hours);
  const dateText = formatDate(data.completedAt);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!showQr || !qrRef.current) return;
    QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [verifyUrl, showQr]);

  return (
    <div
      ref={rootRef}
      data-certificate-export
      className="certificate-paper bg-white shadow-2xl overflow-hidden text-slate-800"
      style={{ width: 900, maxWidth: '100%' }}
    >
      <div className="h-2 w-full bg-linear-to-r from-indigo-600 via-indigo-400 to-amber-500" />
      <div className="px-12 py-10 md:px-16 md:py-12">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo/default.svg"
              alt="GloTutor"
              width={140}
              height={24}
              className="h-8 w-auto max-w-[160px] object-contain object-left"
              unoptimized
            />
          </div>
          <div className="text-right">
            <span
              className="inline-block px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded border-l-4 border-indigo-600 bg-indigo-50 text-indigo-600"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {copyForLang.completionLabel}
            </span>
            <div
              className="mt-2 text-[9px] font-mono text-slate-500 tracking-wider"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ID: {data.verificationCode}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div
            className="text-[11px] font-sans uppercase tracking-widest text-slate-500 mb-1"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {copyForLang.certifiesThat}
          </div>
          <div
            className="font-serif text-3xl italic text-slate-900 border-b-2 border-indigo-600/30 pb-1"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {data.studentName}
          </div>
        </div>

        <p
          className="text-sm text-slate-600 leading-relaxed max-w-[560px] mb-6"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {copyForLang.completedSuccessfully}{' '}
          <strong className="text-slate-900">{courseName}</strong>{' '}
          {copyForLang.skillsDescription}
        </p>

        <div className="h-px bg-slate-200 mb-6" />

        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="flex gap-8 flex-wrap">
            <div className="border-l-4 border-indigo-100 pl-4 py-2">
              <div
                className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-0.5"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {copyForLang.workloadLabel}
              </div>
              <div
                className="text-[15px] font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {hoursText}
              </div>
            </div>
            <div className="border-l-4 border-indigo-100 pl-4 py-2">
              <div
                className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-0.5"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {copyForLang.completionDateLabel}
              </div>
              <div
                className="text-[15px] font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {dateText}
              </div>
            </div>
            <div className="border-l-4 border-indigo-100 pl-4 py-2">
              <div
                className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-0.5"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {copyForLang.modalityLabel}
              </div>
              <div
                className="text-[15px] font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {copyForLang.modalityValue}
              </div>
            </div>
          </div>
          <div className="rounded border border-indigo-200 bg-indigo-50 px-4 py-2 text-center min-w-[80px]">
            <div
              className="font-serif text-2xl text-indigo-600 leading-none"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {data.cefrLevel}
            </div>
            <div
              className="text-[9px] text-indigo-600 mt-0.5 tracking-wide"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {data.levelName}
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-200 my-6" />

        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="flex flex-col">
            <div
              className="text-xl text-slate-800 mb-0.5 tracking-tight"
              style={{
                fontFamily: 'var(--font-signature), cursive',
                transform: 'rotate(-2deg)',
              }}
            >
              {directorName}
            </div>
            <svg
              className="w-36 h-3 text-slate-700"
              viewBox="0 0 140 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <title>Signature line</title>
              <path
                d="M2 8 Q35 2 70 7 T138 6"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div
              className="text-xs text-slate-500 mt-1.5"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {copyForLang.directorRole}
            </div>
          </div>
          {showQr && (
            <div className="flex flex-col items-center">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt=""
                  width={56}
                  height={56}
                  unoptimized
                  className="border border-slate-200 rounded p-1 bg-white"
                />
              ) : (
                <canvas ref={qrRef} width={56} height={56} className="hidden" />
              )}
              <div
                className="mt-1.5 text-[8px] font-mono text-slate-500 text-center"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                glotutor.com/verify
              </div>
            </div>
          )}
          <div className="flex flex-col items-end">
            <div className="w-40 h-px bg-slate-800 mb-1.5" />
            <div
              className="text-sm font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              GloTutor · glotutor.com
            </div>
            <div
              className="text-xs text-slate-500"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {copyForLang.platformRole}
            </div>
          </div>
        </div>
      </div>

      <div
        className="border-t border-slate-200 bg-slate-50 px-12 py-3 flex items-center justify-between flex-wrap gap-2"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <div
          className="text-[9px] font-mono text-slate-500 max-w-[560px]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {copyForLang.footerDisclaimer}
        </div>
        <div
          className="text-[9px] font-mono text-slate-500 tracking-wider"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {data.verificationCode}
        </div>
      </div>
    </div>
  );
});

type CertificateViewWithExportProps = CertificateViewProps & {
  exportPdfLabel?: string;
};

export function CertificateViewWithExport({
  exportPdfLabel = 'Export PDF',
  ...props
}: CertificateViewWithExportProps) {
  const [exporting, setExporting] = useState(false);
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ]);
      const el = certificateRef.current;
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgH = pdfW * ratio;
      const x = 0;
      const y = (pdfH - imgH) / 2;
      pdf.addImage(imgData, 'PNG', x, y, pdfW, imgH);
      pdf.save(`certificate-${props.data.verificationCode}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <CertificateView ref={certificateRef} {...props} />
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exporting}
          className="rounded-xl bg-(--accent) px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {exporting ? '…' : exportPdfLabel}
        </button>
      </div>
    </div>
  );
}
