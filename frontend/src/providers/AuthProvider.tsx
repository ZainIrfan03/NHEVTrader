"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CustomerUser } from "@/lib/auth-proxy";

type AuthResult = { ok: boolean; error?: string };
type AuthContextValue = {
  user: CustomerUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  register: (details: { name: string; phone: string; email: string; password: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const payload = (await response.json()) as { user?: CustomerUser | null };
      setUser(payload.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const authenticate = useCallback(async (path: string, details: object): Promise<AuthResult> => {
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const payload = (await response.json()) as { user?: CustomerUser; error?: string };
      if (!response.ok || !payload.user) return { ok: false, error: payload.error || "Authentication failed." };
      setUser(payload.user);
      return { ok: true };
    } catch {
      return { ok: false, error: "Authentication service is unavailable." };
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    signIn: (email, password) => authenticate("/api/auth/login", { email, password }),
    register: (details) => authenticate("/api/auth/register", details),
    signOut: async () => {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
      setUser(null);
    },
    refresh,
  }), [authenticate, isLoading, refresh, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

