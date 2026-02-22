'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type AccountManageModalContextValue = {
  isAccountModalOpen: boolean;
  openAccountModal: () => void;
  closeAccountModal: () => void;
  isDeleteModalOpen: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
};

const AccountManageModalContext =
  createContext<AccountManageModalContextValue | null>(null);

export function AccountManageModalProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openAccountModal = useCallback(() => setIsAccountModalOpen(true), []);
  const closeAccountModal = useCallback(() => setIsAccountModalOpen(false), []);
  const openDeleteModal = useCallback(() => setIsDeleteModalOpen(true), []);
  const closeDeleteModal = useCallback(() => setIsDeleteModalOpen(false), []);

  const value = useMemo(
    () => ({
      isAccountModalOpen,
      openAccountModal,
      closeAccountModal,
      isDeleteModalOpen,
      openDeleteModal,
      closeDeleteModal,
    }),
    [
      isAccountModalOpen,
      openAccountModal,
      closeAccountModal,
      isDeleteModalOpen,
      openDeleteModal,
      closeDeleteModal,
    ],
  );

  return (
    <AccountManageModalContext.Provider value={value}>
      {children}
    </AccountManageModalContext.Provider>
  );
}

export function useAccountManageModal(): AccountManageModalContextValue {
  const ctx = useContext(AccountManageModalContext);
  if (!ctx) {
    throw new Error(
      'useAccountManageModal must be used within AccountManageModalProvider',
    );
  }
  return ctx;
}
