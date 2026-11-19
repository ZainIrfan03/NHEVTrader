"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CartItem } from "@/types/commerce";

const STORAGE_KEY = "nh-ev-trader-cart-v1";

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isStoredCart(parsed)) setItems(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      hasLoaded.current = true;
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    isReady,
    addItem: (productId, variantId, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.productId === productId && item.variantId === variantId);
        if (!existing) return [...current, { productId, variantId, quantity }];
        return current.map((item) => item.productId === productId && item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item);
      });
    },
    updateQuantity: (productId, variantId, quantity) => {
      if (quantity <= 0) {
        setItems((current) => current.filter((item) => !(item.productId === productId && item.variantId === variantId)));
        return;
      }
      setItems((current) => current.map((item) => item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item));
    },
    removeItem: (productId, variantId) => setItems((current) => current.filter((item) => !(item.productId === productId && item.variantId === variantId))),
    clearCart: () => setItems([]),
  }), [isReady, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
