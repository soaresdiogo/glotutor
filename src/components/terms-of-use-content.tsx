'use client';

import Link from 'next/link';
import { useId } from 'react';
import { useTermsOfUse } from '@/app/(public)/terms-of-use/use-terms-of-use';
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

type TermsOfUseContentProps = {
  isInsideModal?: boolean;
  scrollContainerId?: string;
  /** When provided, "Privacy Policy" in the blockquote opens this callback (e.g. open privacy modal) instead of linking to the page. */
  onOpenPrivacy?: () => void;
};

export function TermsOfUseContent({
  isInsideModal = false,
  scrollContainerId: scrollContainerIdProp,
  onOpenPrivacy,
}: TermsOfUseContentProps) {
  const { t } = useTranslate();
  const fallbackScrollId = useId();
  const scrollContainerId = scrollContainerIdProp ?? fallbackScrollId;
  const {
    sections,
    activeSection,
    partiesId,
    definitionsId,
    registrationId,
    obligationsId,
    responsibilitiesId,
    propertyId,
    privacyId,
    serviceModificationsId,
    termsChangesId,
    generalProvisionsId,
    jurisdictionId,
  } = useTermsOfUse(isInsideModal ? true : undefined, scrollContainerId);

  const sectionsWithNames = sections.map((s, i) => ({
    ...s,
    name: t(`terms.index${i + 1}`),
  }));

  const privacyLink = onOpenPrivacy ? (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onOpenPrivacy();
      }}
      className="font-semibold text-(--accent) hover:underline"
    >
      {t('terms.privacyPolicyLinkText')}
    </button>
  ) : (
    <Link
      href="/privacy-policy"
      className="font-semibold text-(--accent) hover:underline"
    >
      {t('terms.privacyPolicyLinkText')}
    </Link>
  );

  const content = (
    <>
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-(--text) mb-4">
          {t('terms.pageTitle')}
        </h1>
        <div className="space-y-1 text-(--text-muted)">
          <p>
            <strong>{t('terms.lastUpdateLabel')}</strong>{' '}
            <strong>{t('terms.lastUpdate')}</strong>
          </p>
          <p>
            <strong>{t('terms.siteOfficial')}</strong>{' '}
            <a
              href={t('terms.siteUrl')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--accent) hover:underline"
            >
              {t('terms.siteUrl')}
            </a>
          </p>
          <p>
            <strong>{t('terms.contactLabel')}</strong>{' '}
            <a
              href={`mailto:${t('terms.contactEmail')}`}
              className="text-(--accent) hover:underline"
            >
              {t('terms.contactEmail')}
            </a>
          </p>
        </div>
      </header>

      <blockquote className="border-l-4 border-(--accent) bg-(--accent-soft) p-6 rounded-r-lg mb-10">
        <p className="font-semibold text-(--text) leading-relaxed">
          {t('terms.consentBlockIntro')}
          {privacyLink}
          {t('terms.consentBlockOutro')}
        </p>
      </blockquote>

      <LegalSection id={partiesId} title={t('terms.section1Title')}>
        <SectionBody content={t('terms.section1Body')} />
      </LegalSection>
      <LegalSection id={definitionsId} title={t('terms.section2Title')}>
        <SectionBody content={t('terms.section2Body')} />
      </LegalSection>
      <LegalSection id={registrationId} title={t('terms.section3Title')}>
        <SectionBody content={t('terms.section3Body')} />
      </LegalSection>
      <LegalSection id={obligationsId} title={t('terms.section4Title')}>
        <SectionBody content={t('terms.section4Body')} />
      </LegalSection>
      <LegalSection id={responsibilitiesId} title={t('terms.section5Title')}>
        <SectionBody content={t('terms.section5Body')} />
      </LegalSection>
      <LegalSection id={propertyId} title={t('terms.section6Title')}>
        <SectionBody content={t('terms.section6Body')} />
      </LegalSection>
      <LegalSection id={privacyId} title={t('terms.section7Title')}>
        <SectionBody content={t('terms.section7Body')} />
      </LegalSection>
      <LegalSection
        id={serviceModificationsId}
        title={t('terms.section8Title')}
      >
        <SectionBody content={t('terms.section8Body')} />
      </LegalSection>
      <LegalSection id={termsChangesId} title={t('terms.section9Title')}>
        <SectionBody content={t('terms.section9Body')} />
      </LegalSection>
      <LegalSection id={generalProvisionsId} title={t('terms.section10Title')}>
        <SectionBody content={t('terms.section10Body')} />
      </LegalSection>
      <LegalSection id={jurisdictionId} title={t('terms.section11Title')}>
        <SectionBody content={t('terms.section11Body')} />
      </LegalSection>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row md:gap-12">
      <aside
        className="hidden md:block w-full md:w-64 mb-10 md:mb-0 shrink-0 print:hidden"
        aria-label={t('terms.indexAria')}
      >
        <nav className="md:sticky md:top-24">
          <h3 className="text-lg font-semibold text-(--text) mb-3">
            {t('terms.indexTitle')}
          </h3>
          <ol className="space-y-1">
            {sectionsWithNames.map((section) => (
              <li key={section.id}>
                <a
                  href={section.href}
                  className={
                    activeSection === section.id
                      ? 'block px-3 py-1.5 rounded-md border-l-2 text-(--accent) bg-(--accent-soft) font-semibold border-(--accent)'
                      : 'block px-3 py-1.5 rounded-md border-l-2 border-transparent text-(--text-muted) hover:text-(--accent) hover:bg-(--bg-elevated)'
                  }
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
