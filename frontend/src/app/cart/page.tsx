"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/providers/CartProvider";
import type { Product, ProductVariant } from "@/types/commerce";

type DisplayItem = { product: Product; variant?: ProductVariant; variantId?: string; quantity: number };

export default function CartPage() {
  const { items, isReady, updateQuantity, removeItem, clearCart } = useCart();
  const displayItems = items.reduce<DisplayItem[]>((result, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (product) result.push({ product, variant: product.variants.find((variant) => variant.id === item.variantId), variantId: item.variantId, quantity: item.quantity });
    return result;
  }, []);
  const subtotal = displayItems.reduce((total, item) => total + (item.product.price + (item.variant?.priceDelta ?? 0)) * item.quantity, 0);

  if (!isReady) {
    return <div className="page-shell min-h-[620px] py-14 sm:py-20"><div className="h-16 w-64 animate-pulse rounded-xl bg-black/5" /><div className="mt-10 h-56 animate-pulse rounded-2xl bg-black/5" /></div>;
  }

  if (!displayItems.length) {
    return (
      <div className="page-shell grid min-h-[650px] place-items-center py-16 text-center">
        <div>
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white"><ShoppingBag size={30} className="text-[#466c42]" /></span>
          <h1 className="display mt-7 text-5xl sm:text-6xl">Your cart is empty.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/50">Explore our vehicles, chargers and EV essentials to begin building your electric setup.</p>
          <Link href="/shop" className="focus-ring mt-8 inline-flex items-center gap-3 rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white hover:bg-[#466c42]">Explore the range <ArrowRight size={17} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-14 sm:py-20">
      <div className="flex items-end justify-between gap-6">
        <div><h1 className="display text-5xl sm:text-7xl">Your cart.</h1><p className="mt-3 text-sm text-black/50">{displayItems.length} {displayItems.length === 1 ? "product" : "products"}, {items.reduce((sum, item) => sum + item.quantity, 0)} total items.</p></div>
        <button type="button" onClick={clearCart} className="focus-ring rounded-sm text-xs font-bold text-black/45 underline underline-offset-4 hover:text-red-700">Clear cart</button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="border-t border-black/10">
          {displayItems.map(({ product, variant, variantId, quantity }) => {
            const unitPrice = product.price + (variant?.priceDelta ?? 0);
            return (
            <article key={`${product.id}:${variantId ?? "default"}`} className="grid grid-cols-[110px_1fr] gap-5 border-b border-black/10 py-6 sm:grid-cols-[150px_1fr_auto]">
              <Link href={`/product/${product.slug}`} className="focus-ring relative aspect-square overflow-hidden rounded-xl bg-white">
                <Image src={product.image} alt="" fill sizes="150px" className="object-cover" style={{ objectPosition: product.imagePosition }} />
              </Link>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-black/40">{product.category}</p>
                <Link href={`/product/${product.slug}`} className="focus-ring mt-1 inline-block rounded-sm font-bold hover:text-[#466c42]">{product.name}</Link>
                {variant && <p className="mt-1 text-xs text-black/45">{variant.label}: {variant.value}</p>}
                <p className="mt-2 text-sm font-bold sm:hidden">{formatPrice(unitPrice * quantity)}</p>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-black/15 bg-white">
                    <button type="button" onClick={() => updateQuantity(product.id, variantId, quantity - 1)} aria-label={`Decrease ${product.name} quantity`} className="focus-ring rounded-full p-2 hover:bg-black/5"><Minus size={14} /></button>
                    <span className="w-8 text-center text-xs font-bold" aria-live="polite">{quantity}</span>
                    <button type="button" onClick={() => updateQuantity(product.id, variantId, quantity + 1)} aria-label={`Increase ${product.name} quantity`} className="focus-ring rounded-full p-2 hover:bg-black/5"><Plus size={14} /></button>
                  </div>
                  <button type="button" onClick={() => removeItem(product.id, variantId)} className="focus-ring rounded-full p-2 text-black/35 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${product.name}`}><Trash2 size={17} /></button>
                </div>
              </div>
              <div className="hidden text-right sm:block"><p className="font-bold">{formatPrice(unitPrice * quantity)}</p><p className="mt-1 text-xs text-black/35">{formatPrice(unitPrice)} each</p></div>
            </article>
          );})}
        </div>

        <aside className="rounded-2xl bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-black">Order summary</h2>
          <div className="mt-6 grid gap-3 border-b border-black/10 pb-5 text-sm">
            <div className="flex justify-between text-black/55"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-black/55"><span>Delivery</span><span>Calculated at checkout</span></div>
          </div>
          <div className="flex justify-between py-5 font-black"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
          <Link href="/checkout" className="focus-ring flex w-full items-center justify-center gap-2 rounded-full bg-[#182019] px-5 py-4 text-sm font-black text-white hover:bg-[#466c42]">Proceed to checkout <ArrowRight size={16} /></Link>
          <p className="mt-4 text-center text-xs text-black/40">COD and online payment available</p>
        </aside>
      </div>

      <Link href="/shop" className="focus-ring mt-8 inline-block rounded-sm text-sm font-bold underline underline-offset-4">← Continue shopping</Link>
    </div>
  );
}
