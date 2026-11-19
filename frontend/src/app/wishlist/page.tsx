"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { products } from "@/data/products";
import { useWishlist } from "@/providers/WishlistProvider";

export default function WishlistPage() {
  const { productIds, isReady } = useWishlist();
  const saved = products.filter((product) => productIds.includes(product.id));
  if (!isReady) return <div className="page-shell min-h-[620px] py-16"><div className="h-72 animate-pulse rounded-3xl bg-black/5" /></div>;
  if (!saved.length) return <div className="page-shell grid min-h-[650px] place-items-center py-16 text-center"><div><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white"><Heart size={30} className="text-[#466c42]" /></span><h1 className="display mt-7 text-5xl sm:text-6xl">Your wishlist is empty.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/50">Tap the heart on any product to save it here for later.</p><Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white">Discover products</Link></div></div>;
  return <div className="page-shell py-14 sm:py-20"><p className="text-xs font-black uppercase tracking-[.22em] text-[#466c42]">Saved for later</p><h1 className="display mt-3 text-5xl sm:text-7xl">Your wishlist.</h1><p className="mt-4 text-sm text-black/50">{saved.length} saved {saved.length === 1 ? "product" : "products"}.</p><div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{saved.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>;
}
