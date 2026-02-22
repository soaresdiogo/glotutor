'use client';

import { TermsOfUseContent } from '@/components/terms-of-use-content';

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-(--bg)">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <TermsOfUseContent />
      </div>

      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          main {
            max-width: 100%;
            padding: 20px;
          }
          section {
            page-break-inside: avoid;
          }
          h1,
          h2,
          h3,
          h4 {
            page-break-after: avoid;
          }
          a {
            color: inherit;
            text-decoration: underline;
          }
        }
      `}</style>
    </main>
  );
}
