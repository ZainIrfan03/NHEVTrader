"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/providers/WishlistProvider";

export function WishlistButton({ productId }: { productId: string }) {
  const { has, toggle } = useWishlist();
  const saved = has(productId);
  return <button type="button" onClick={() => toggle(productId)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={saved} className={`focus-ring grid h-10 w-10 place-items-center rounded-full shadow-sm backdrop-blur ${saved ? "bg-[#182019] text-[#c9ef6d]" : "bg-white/85 text-[#182019] hover:bg-white"}`}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>;
}
