'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type AddLanguageModalContextValue = {
  isOpen: boolean;
  openAddLanguageModal: () => void;
  closeAddLanguageModal: () => void;
};

const AddLanguageModalContext =
  createContext<AddLanguageModalContextValue | null>(null);

export function AddLanguageModalProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false);

  const openAddLanguageModal = useCallback(() => setIsOpen(true), []);
  const closeAddLanguageModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      isOpen,
      openAddLanguageModal,
      closeAddLanguageModal,
    }),
    [isOpen, openAddLanguageModal, closeAddLanguageModal],
  );

  return (
    <AddLanguageModalContext.Provider value={value}>
      {children}
    </AddLanguageModalContext.Provider>
  );
}

export function useAddLanguageModal(): AddLanguageModalContextValue {
  const ctx = useContext(AddLanguageModalContext);
  if (!ctx) {
    throw new Error(
      'useAddLanguageModal must be used within AddLanguageModalProvider',
    );
  }
  return ctx;
}
