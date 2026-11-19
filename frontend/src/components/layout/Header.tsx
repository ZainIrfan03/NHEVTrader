"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { Logo } from "./Logo";

const nav = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=Vehicles", label: "Vehicles" },
  { href: "/shop?category=Chargers", label: "Chargers" },
  { href: "/shop?category=Accessories", label: "Accessories" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { productIds } = useWishlist();
  return (
    <>
      <div className="bg-[#182019] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white">
        Nationwide delivery · Cash on delivery available
      </div>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f3ed]/95 backdrop-blur">
        <div className="page-shell flex h-[72px] items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {nav.map((item) => <Link key={item.href} href={item.href} className="focus-ring rounded-sm text-sm font-semibold hover:text-[#466c42]">{item.label}</Link>)}
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/shop" aria-label="Search products" className="focus-ring rounded-full p-2.5 hover:bg-black/5"><Search size={20} /></Link>
            <Link href={user ? "/account/dashboard" : "/account"} aria-label={user ? `${user.name}'s account` : "Sign in or create an account"} className={`focus-ring hidden rounded-full p-2.5 hover:bg-black/5 sm:block ${user ? "bg-[#c9ef6d]" : ""}`}><User size={20} /></Link>
            <Link href="/wishlist" aria-label={`Wishlist, ${productIds.length} items`} className="focus-ring relative hidden rounded-full p-2.5 hover:bg-black/5 sm:block"><Heart size={20} />{productIds.length > 0 && <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#c9ef6d] px-1 text-[10px] font-black">{productIds.length}</span>}</Link>
            <Link href="/cart" aria-label={`Shopping cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`} className="focus-ring relative rounded-full p-2.5 hover:bg-black/5"><ShoppingBag size={20} />{itemCount > 0 && <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#c9ef6d] px-1 text-[10px] font-black">{itemCount > 99 ? "99+" : itemCount}</span>}</Link>
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu" className="focus-ring rounded-full p-2.5 lg:hidden">{open ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </div>
        {open && <nav className="border-t border-black/10 bg-[#f5f3ed] px-4 py-4 lg:hidden" aria-label="Mobile navigation">{nav.map((item) => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className="block border-b border-black/10 py-3 text-base font-semibold">{item.label}</Link>)}</nav>}
      </header>
    </>
  );
}
