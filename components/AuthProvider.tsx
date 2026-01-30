'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearTokens, getTokens, setTokens, type AuthTokens } from '@/lib/auth-storage';

export type AuthUser = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
};

type AuthCtx = {
  tokens: AuthTokens | null;
  user: AuthUser | null;
  isAuthed: boolean;
  setAuth: (params: { tokens: AuthTokens; user?: AuthUser | null }) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokensState] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const t = getTokens();
    setTokensState(t);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      tokens,
      user,
      isAuthed: Boolean(tokens?.accessToken),
      setAuth: ({ tokens: next, user: nextUser }) => {
        setTokens(next);
        setTokensState(next);
        if (nextUser !== undefined) setUser(nextUser);
      },
      logout: () => {
        clearTokens();
        setTokensState(null);
        setUser(null);
      }
    }),
    [tokens, user]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
