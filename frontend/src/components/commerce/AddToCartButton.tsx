"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";

export function AddToCartButton({ productId, variantId, disabled = false }: { productId: string; variantId?: string; disabled?: boolean }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  return <button disabled={disabled || isLoading} onClick={() => {
    if (!user) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.push(`/account?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    addItem(productId, variantId);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }} className="focus-ring flex w-full items-center justify-center gap-2 rounded-full bg-[#182019] px-6 py-4 text-sm font-black text-white hover:bg-[#466c42] disabled:cursor-not-allowed disabled:bg-black/20">{added ? <><Check size={18} /> Added to cart</> : <><ShoppingBag size={18} /> {disabled ? "Currently unavailable" : isLoading ? "Checking account…" : user ? "Add to cart" : "Sign in to add to cart"}</>}</button>;
}
