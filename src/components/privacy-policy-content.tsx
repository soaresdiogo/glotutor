'use client';

import { useId } from 'react';
import { usePrivacyPolicy } from '@/app/(public)/privacy-policy/use-privacy-policy';
import { useTranslate } from '@/locales';

function LegalSection({
  id,
  title,
  children,
}: {
  readonly id: string;
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-2xl font-semibold text-(--text) mb-4">{title}</h2>
      <div className="space-y-5 text-(--text-muted) leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function SectionBody({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  return (
    <>
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </>
  );
}

type PrivacyPolicyContentProps = {
  /** When true, scroll observer uses the provided scroll container (for modal). */
  isInsideModal?: boolean;
  /** ID of the scrollable container (required when isInsideModal). */
  scrollContainerId?: string;
};

export function PrivacyPolicyContent({
  isInsideModal = false,
  scrollContainerId: scrollContainerIdProp,
}: PrivacyPolicyContentProps) {
  const { t } = useTranslate();
  const fallbackScrollId = useId();
  const scrollContainerId = scrollContainerIdProp ?? fallbackScrollId;
  const {
    sections,
    activeSection,
    definitionsId,
    dataCollectionId,
    legalBasisId,
    dataSharingId,
    internationalTransferId,
    retentionId,
    rightsId,
    securityId,
    dpoId,
    changesId,
  } = usePrivacyPolicy(isInsideModal ? true : undefined, scrollContainerId);

  const sectionsWithNames = sections.map((s, i) => ({
    ...s,
    name: t(`privacy.index${i + 1}`),
  }));

  const content = (
    <>
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-(--text) mb-4">
          {t('privacy.pageTitle')}
        </h1>
        <div className="space-y-1 text-(--text-muted)">
          <p>
            <strong>{t('privacy.lastUpdateLabel')}</strong>{' '}
            <strong>{t('privacy.lastUpdate')}</strong>
          </p>
          <p>
            <strong>{t('privacy.siteOfficial')}</strong>{' '}
            <a
              href={t('privacy.siteUrl')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--accent) hover:underline"
            >
              {t('privacy.siteUrl')}
            </a>
          </p>
          <p>
            <strong>{t('privacy.dpoContact')}</strong>{' '}
            <a
              href={`mailto:${t('privacy.dpoEmail')}`}
              className="text-(--accent) hover:underline"
            >
              {t('privacy.dpoEmail')}
            </a>
            <span className="text-(--text-muted)"> {t('privacy.dpoNote')}</span>
          </p>
        </div>
      </header>

      <div className="space-y-5 text-(--text-muted) leading-relaxed mb-10">
        <SectionBody content={t('privacy.intro')} />
      </div>

      <blockquote className="border-l-4 border-(--accent) bg-(--accent-soft) p-6 rounded-r-lg mb-10">
        <p className="font-semibold text-(--text) leading-relaxed">
          {t('privacy.consentBlock')}
        </p>
      </blockquote>

      <LegalSection id={definitionsId} title={t('privacy.section1Title')}>
        <SectionBody content={t('privacy.section1Body')} />
      </LegalSection>

      <LegalSection id={dataCollectionId} title={t('privacy.section2Title')}>
        <SectionBody content={t('privacy.section2Body')} />
      </LegalSection>

      <LegalSection id={legalBasisId} title={t('privacy.section3Title')}>
        <SectionBody content={t('privacy.section3Body')} />
      </LegalSection>

      <LegalSection id={dataSharingId} title={t('privacy.section4Title')}>
        <SectionBody content={t('privacy.section4Body')} />
      </LegalSection>

      <LegalSection
        id={internationalTransferId}
        title={t('privacy.section5Title')}
      >
        <SectionBody content={t('privacy.section5Body')} />
      </LegalSection>

      <LegalSection id={retentionId} title={t('privacy.section6Title')}>
        <SectionBody content={t('privacy.section6Body')} />
      </LegalSection>

      <LegalSection id={rightsId} title={t('privacy.section7Title')}>
        <SectionBody content={t('privacy.section7Body')} />
      </LegalSection>

      <LegalSection id={securityId} title={t('privacy.section8Title')}>
        <SectionBody content={t('privacy.section8Body')} />
      </LegalSection>

      <LegalSection id={dpoId} title={t('privacy.section9Title')}>
        <SectionBody content={t('privacy.section9Body')} />
      </LegalSection>

      <LegalSection id={changesId} title={t('privacy.section10Title')}>
        <SectionBody content={t('privacy.section10Body')} />
      </LegalSection>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row md:gap-12">
      {/* Sidebar only on desktop */}
      <aside
        className="hidden md:block w-full md:w-64 mb-10 md:mb-0 shrink-0 print:hidden"
        aria-label={t('privacy.indexAria')}
      >
        <nav className="md:sticky md:top-24">
          <h3 className="text-lg font-semibold text-(--text) mb-3">
            {t('privacy.indexTitle')}
          </h3>
          <ol className="space-y-1">
            {sectionsWithNames.map((section) => (
              <li key={section.id}>
                <a
                  href={section.href}
                  className={`
                    block px-3 py-1.5 rounded-md transition-all duration-150 border-l-2
                    ${
                      activeSection === section.id
                        ? 'text-(--accent) bg-(--accent-soft) font-semibold border-(--accent)'
                        : 'text-(--text-muted) hover:text-(--accent) hover:bg-(--bg-elevated) border-transparent'
                    }
                  `}
                  aria-current={
                    activeSection === section.id ? 'location' : undefined
                  }
                >
                  {section.name}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <div
        className="flex-1 md:max-w-3xl min-w-0"
        id={isInsideModal ? undefined : scrollContainerId}
      >
        {content}
      </div>
    </div>
  );
}
