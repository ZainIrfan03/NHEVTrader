"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

const STORAGE_PREFIX = "nh-ev-trader-wishlist-v2";
const LEGACY_STORAGE_KEY = "nh-ev-trader-wishlist-v1";

type WishlistContextValue = {
  productIds: string[];
  isReady: boolean;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readWishlist(key: string) {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value;
  } catch {
    window.localStorage.removeItem(key);
  }
  return [];
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const storageKey = authLoading ? null : `${STORAGE_PREFIX}:${user?.id || "guest"}`;
  const [productIds, setProductIds] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) return;

    let saved = readWishlist(storageKey);
    const legacy = readWishlist(LEGACY_STORAGE_KEY);

    // The old key was shared by every session. Assign it only when an
    // authenticated owner is present; otherwise discard the ambiguous data.
    if (user && saved.length === 0 && legacy.length > 0) saved = legacy;
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);

    setProductIds(saved);
    setActiveKey(storageKey);
  }, [storageKey, user]);

  useEffect(() => {
    if (!storageKey || activeKey !== storageKey) return;
    window.localStorage.setItem(storageKey, JSON.stringify(productIds));
  }, [activeKey, productIds, storageKey]);

  const visibleProductIds = activeKey === storageKey ? productIds : [];
  const isReady = !authLoading && Boolean(storageKey) && activeKey === storageKey;
  const value = useMemo<WishlistContextValue>(() => ({
    productIds: visibleProductIds,
    isReady,
    toggle: (productId) => {
      if (!isReady) return;
      setProductIds((current) => current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]);
    },
    has: (productId) => visibleProductIds.includes(productId),
  }), [isReady, visibleProductIds]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
