"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types/commerce";
import { useAuth } from "@/providers/AuthProvider";

const STORAGE_PREFIX = "nh-ev-trader-cart-v2";
const LEGACY_STORAGE_KEY = "nh-ev-trader-cart-v1";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  isReady: boolean;
  addItem: (productId: string, variantId?: string, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isStoredCart(value: unknown): value is CartItem[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<CartItem>;
    return typeof candidate.productId === "string" && Number.isInteger(candidate.quantity) && Number(candidate.quantity) > 0;
  });
}

function mergeCarts(accountItems: CartItem[], guestItems: CartItem[]) {
  return guestItems.reduce<CartItem[]>((merged, guestItem) => {
    const existing = merged.find((item) =>
      item.productId === guestItem.productId && item.variantId === guestItem.variantId);
    if (!existing) return [...merged, guestItem];
    return merged.map((item) => item === existing
      ? { ...item, quantity: item.quantity + guestItem.quantity }
      : item);
  }, accountItems);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const storageKey = authLoading ? null : `${STORAGE_PREFIX}:${user?.id || "guest"}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) return;

    let saved: CartItem[] = [];
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isStoredCart(parsed)) saved = parsed;
      }

      const legacyStored = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (user && saved.length === 0 && legacyStored) {
        const legacy: unknown = JSON.parse(legacyStored);
        if (isStoredCart(legacy)) saved = legacy;
      }

      if (user) {
        const guestKey = `${STORAGE_PREFIX}:guest`;
        const guestStored = window.localStorage.getItem(guestKey);
        if (guestStored) {
          const guest: unknown = JSON.parse(guestStored);
          if (isStoredCart(guest)) saved = mergeCarts(saved, guest);
          window.localStorage.removeItem(guestKey);
        }
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }

    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    setItems(saved);
    setActiveKey(storageKey);
  }, [storageKey, user]);

  useEffect(() => {
    if (!storageKey || activeKey !== storageKey) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [activeKey, items, storageKey]);

  const visibleItems = activeKey === storageKey ? items : [];
  const isReady = !authLoading && Boolean(storageKey) && activeKey === storageKey;

  const value = useMemo<CartContextValue>(() => ({
    items: visibleItems,
    itemCount: visibleItems.reduce((total, item) => total + item.quantity, 0),
    isReady,
    addItem: (productId, variantId, quantity = 1) => {
      if (!isReady) return;
      setItems((current) => {
        const existing = current.find((item) => item.productId === productId && item.variantId === variantId);
        if (!existing) return [...current, { productId, variantId, quantity }];
        return current.map((item) => item.productId === productId && item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item);
      });
    },
    updateQuantity: (productId, variantId, quantity) => {
      if (!isReady) return;
      if (quantity <= 0) {
        setItems((current) => current.filter((item) => !(item.productId === productId && item.variantId === variantId)));
        return;
      }
      setItems((current) => current.map((item) => item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item));
    },
    removeItem: (productId, variantId) => {
      if (!isReady) return;
      setItems((current) => current.filter((item) => !(item.productId === productId && item.variantId === variantId)));
    },
    clearCart: () => {
      if (isReady) setItems([]);
    },
  }), [isReady, visibleItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
