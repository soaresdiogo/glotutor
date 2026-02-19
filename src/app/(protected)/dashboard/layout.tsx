'use client';

import { useId, useState } from 'react';
import { Sidebar, TopBar } from '@/components/dashboard';
import { InactivityNudgeBanner } from '@/components/inactivity-nudge/InactivityNudgeBanner';
import { AddLanguageModal } from '@/components/onboarding/AddLanguageModal';
import { AddLanguageModalProvider } from '@/components/onboarding/AddLanguageModalProvider';
import { useOnboardingGate } from '@/hooks/onboarding';
import { LanguageProvider } from '@/providers/language-provider';

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const mainContentId = useId();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading, hasLanguages } = useOnboardingGate();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg)">
        <p className="text-(--text-muted)">Loading…</p>
      </div>
    );
  }

  // No languages: fullscreen onboarding overlay — no sidebar, no escape
  if (!hasLanguages) {
    return (
      <LanguageProvider>
        <div
          className="fixed inset-0 z-50 flex min-h-screen flex-col bg-(--bg)"
          role="dialog"
          aria-modal="true"
          aria-label="Get started — choose your language"
        >
          {children}
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <AddLanguageModalProvider>
        <div className="flex min-h-screen">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div
            id={mainContentId}
            className="flex min-h-screen flex-1 flex-col transition-[margin] duration-300 md:ml-[280px]"
          >
            <TopBar onMenuClick={() => setSidebarOpen((v) => !v)} />
            <div className="mb-4 px-4 pt-4 md:px-6 md:pt-6">
              <InactivityNudgeBanner />
            </div>
            {children}
          </div>
        </div>
        <AddLanguageModal />
      </AddLanguageModalProvider>
    </LanguageProvider>
  );
}
