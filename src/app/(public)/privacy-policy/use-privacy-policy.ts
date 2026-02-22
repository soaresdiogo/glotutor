'use client';

import { useEffect, useId, useMemo, useState } from 'react';

export function usePrivacyPolicy(
  isDialogOpen?: boolean,
  scrollContainerId?: string,
) {
  const definitionsId = useId();
  const dataCollectionId = useId();
  const legalBasisId = useId();
  const dataSharingId = useId();
  const internationalTransferId = useId();
  const retentionId = useId();
  const rightsId = useId();
  const securityId = useId();
  const dpoId = useId();
  const changesId = useId();

  const sections = useMemo(
    () => [
      {
        name: '1. Definições Importantes',
        href: `#${definitionsId}`,
        id: definitionsId,
      },
      {
        name: '2. Quais Dados Coletamos',
        href: `#${dataCollectionId}`,
        id: dataCollectionId,
      },
      { name: '3. Base Legal', href: `#${legalBasisId}`, id: legalBasisId },
      {
        name: '4. Compartilhamento de Dados',
        href: `#${dataSharingId}`,
        id: dataSharingId,
      },
      {
        name: '5. Transferência Internacional',
        href: `#${internationalTransferId}`,
        id: internationalTransferId,
      },
      {
        name: '6. Retenção e Armazenamento',
        href: `#${retentionId}`,
        id: retentionId,
      },
      { name: '7. Seus Direitos', href: `#${rightsId}`, id: rightsId },
      {
        name: '8. Segurança dos Dados',
        href: `#${securityId}`,
        id: securityId,
      },
      { name: '9. Canal de Comunicação (DPO)', href: `#${dpoId}`, id: dpoId },
      {
        name: '10. Alterações da Política',
        href: `#${changesId}`,
        id: changesId,
      },
    ],
    [
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
    ],
  );

  const [activeSection, setActiveSection] = useState<string>(definitionsId);

  useEffect(() => {
    if (isDialogOpen !== undefined && !isDialogOpen) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let scrollTarget: HTMLElement | Window | null = null;
    let handleScroll: (() => void) | null = null;
    let sectionElements: HTMLElement[] = [];

    const timeoutId = setTimeout(() => {
      const containerId = scrollContainerId ?? 'privacy-content-scroll';
      const scrollContainer = document.getElementById(containerId);
      const isInsideDialog = scrollContainer !== null;

      if (!scrollContainer && !globalThis.window) {
        return;
      }

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      };

      const observerOptions: IntersectionObserverInit = {
        root: isInsideDialog ? scrollContainer : null,
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      };

      observer = new IntersectionObserver(observerCallback, observerOptions);

      sectionElements = sections
        .map((sec) => document.getElementById(sec.id))
        .filter((el): el is HTMLElement => el !== null);

      if (sectionElements.length === 0) {
        return;
      }

      for (const el of sectionElements) {
        observer.observe(el);
      }

      handleScroll = () => {
        const container = isInsideDialog
          ? scrollContainer
          : document.documentElement;
        if (!container) return;

        const scrollPosition = isInsideDialog
          ? (container as HTMLElement).scrollTop +
            (container as HTMLElement).clientHeight
          : window.innerHeight + window.scrollY;
        const documentHeight = isInsideDialog
          ? (container as HTMLElement).scrollHeight
          : document.documentElement.scrollHeight;

        if (scrollPosition >= documentHeight - 50) {
          setActiveSection(sections[sections.length - 1].id);
        }
      };

      scrollTarget = isInsideDialog
        ? scrollContainer
        : (globalThis.window ?? null);

      if (scrollTarget && handleScroll) {
        scrollTarget.addEventListener('scroll', handleScroll, {
          passive: true,
        });
        handleScroll();
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observer) {
        for (const element of sectionElements) {
          observer.unobserve(element);
        }
        observer.disconnect();
      }
      if (scrollTarget && handleScroll) {
        scrollTarget.removeEventListener('scroll', handleScroll);
      }
    };
  }, [sections, isDialogOpen, scrollContainerId]);

  return {
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
  };
}
