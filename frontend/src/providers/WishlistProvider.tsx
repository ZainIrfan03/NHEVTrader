"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "nh-ev-trader-wishlist-v1";
type WishlistContextValue = { productIds: string[]; isReady: boolean; toggle: (productId: string) => void; has: (productId: string) => boolean };
const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const loaded = useRef(false);
  useEffect(() => { try { const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"); if (Array.isArray(value) && value.every((item) => typeof item === "string")) setProductIds(value); } catch { window.localStorage.removeItem(STORAGE_KEY); } finally { loaded.current = true; setIsReady(true); } }, []);
  useEffect(() => { if (loaded.current) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds)); }, [productIds]);
  const value = useMemo<WishlistContextValue>(() => ({ productIds, isReady, toggle: (productId) => setProductIds((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]), has: (productId) => productIds.includes(productId) }), [isReady, productIds]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error("useWishlist must be used within WishlistProvider"); return context; }
