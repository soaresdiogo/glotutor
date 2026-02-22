'use client';

import { useEffect, useId, useMemo, useState } from 'react';

export function useTermsOfUse(
  isDialogOpen?: boolean,
  scrollContainerId?: string,
) {
  const partiesId = useId();
  const definitionsId = useId();
  const registrationId = useId();
  const obligationsId = useId();
  const responsibilitiesId = useId();
  const propertyId = useId();
  const privacyId = useId();
  const serviceModificationsId = useId();
  const termsChangesId = useId();
  const generalProvisionsId = useId();
  const jurisdictionId = useId();

  const sections = useMemo(
    () => [
      { name: '1. Das Partes', href: `#${partiesId}`, id: partiesId },
      { name: '2. Definições', href: `#${definitionsId}`, id: definitionsId },
      {
        name: '3. Cadastro e Conta',
        href: `#${registrationId}`,
        id: registrationId,
      },
      {
        name: '4. Obrigações do Usuário',
        href: `#${obligationsId}`,
        id: obligationsId,
      },
      {
        name: '5. Responsabilidades',
        href: `#${responsibilitiesId}`,
        id: responsibilitiesId,
      },
      {
        name: '6. Propriedade Intelectual',
        href: `#${propertyId}`,
        id: propertyId,
      },
      { name: '7. Privacidade e Dados', href: `#${privacyId}`, id: privacyId },
      {
        name: '8. Modificações dos Serviços',
        href: `#${serviceModificationsId}`,
        id: serviceModificationsId,
      },
      {
        name: '9. Alterações dos Termos',
        href: `#${termsChangesId}`,
        id: termsChangesId,
      },
      {
        name: '10. Disposições Gerais',
        href: `#${generalProvisionsId}`,
        id: generalProvisionsId,
      },
      {
        name: '11. Legislação e Foro',
        href: `#${jurisdictionId}`,
        id: jurisdictionId,
      },
    ],
    [
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
    ],
  );

  const [activeSection, setActiveSection] = useState<string>(partiesId);

  useEffect(() => {
    if (isDialogOpen !== undefined && !isDialogOpen) return;

    let observer: IntersectionObserver | null = null;
    let scrollTarget: HTMLElement | Window | null = null;
    let handleScroll: (() => void) | null = null;
    let sectionElements: HTMLElement[] = [];

    const timeoutId = setTimeout(() => {
      const containerId = scrollContainerId ?? 'terms-content-scroll';
      const scrollContainer = document.getElementById(containerId);
      const isInsideDialog = scrollContainer !== null;

      if (!scrollContainer && !globalThis.window) return;

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      };

      observer = new IntersectionObserver(observerCallback, {
        root: isInsideDialog ? scrollContainer : null,
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      });

      sectionElements = sections
        .map((sec) => document.getElementById(sec.id))
        .filter((el): el is HTMLElement => el !== null);

      if (sectionElements.length === 0) return;

      for (const el of sectionElements) observer.observe(el);

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
        for (const element of sectionElements) observer.unobserve(element);
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
  };
}
