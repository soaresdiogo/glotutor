'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '@/client-api/auth.api';

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const AUTH_QUERY_KEY = ['auth', 'session'] as const;

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient();
  const [isChecked, setIsChecked] = useState(false);

  const { data, isPending, isError, isFetched } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authApi.refresh(),
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isFetched) setIsChecked(true);
  }, [isFetched]);

  const logout = useCallback(async () => {
    await authApi.logout();
    queryClient.setQueryData(AUTH_QUERY_KEY, null);
  }, [queryClient]);

  const isAuthenticated = Boolean(data?.accessToken) && !isError;
  const isLoading = !isChecked || isPending;

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated,
      isLoading,
      logout,
    }),
    [isAuthenticated, isLoading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
