"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, LockKeyhole, Truck } from "lucide-react";
import { FormEvent, useState } from "react";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/providers/CartProvider";

export default function CheckoutPage() {
  const { items, isReady } = useCart();
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [reviewed, setReviewed] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const orderItems = items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    return product ? [{ product, variant, variantId: item.variantId, quantity: item.quantity }] : [];
  });
  const subtotal = orderItems.reduce((total, item) => total + (item.product.price + (item.variant?.priceDelta ?? 0)) * item.quantity, 0);
  const delivery = subtotal >= 500000 ? 0 : 2500;
  const discount = couponApplied ? Math.min(Math.round(subtotal * 0.05), 10000) : 0;
  const total = subtotal + delivery - discount;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewed(true);
  };

  if (!isReady) return <div className="page-shell min-h-[650px] py-16"><div className="h-96 animate-pulse rounded-3xl bg-black/5" /></div>;

  if (!orderItems.length) {
    return <div className="page-shell grid min-h-[650px] place-items-center py-16 text-center"><div><h1 className="display text-5xl">Nothing to check out yet.</h1><p className="mt-4 text-sm text-black/50">Add a product to your cart before continuing.</p><Link href="/shop" className="mt-7 inline-flex rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white">Browse products</Link></div></div>;
  }

  return (
    <div className="page-shell py-10 sm:py-16">
      <Link href="/cart" className="focus-ring inline-flex items-center gap-2 rounded-sm text-sm font-bold text-black/55 hover:text-black"><ArrowLeft size={16} /> Back to cart</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_390px] lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#466c42]">Secure checkout</p>
          <h1 className="display mt-3 text-5xl sm:text-6xl">Delivery details.</h1>
          <form onSubmit={handleSubmit} className="mt-10 grid gap-8">
            <section className="rounded-2xl bg-white p-6 sm:p-8">
              <h2 className="font-black">Contact information</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold">Full name<input required autoComplete="name" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="Your full name" /></label>
                <label className="grid gap-2 text-xs font-bold">Phone number<input required type="tel" autoComplete="tel" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="03XX XXXXXXX" /></label>
                <label className="grid gap-2 text-xs font-bold sm:col-span-2">Email address<input required type="email" autoComplete="email" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="you@example.com" /></label>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 sm:p-8">
              <h2 className="font-black">Delivery address</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold sm:col-span-2">Street address<input required autoComplete="street-address" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="House, street and area" /></label>
                <label className="grid gap-2 text-xs font-bold">Province<select required autoComplete="address-level1" className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" defaultValue=""><option value="" disabled>Select province</option><option>Punjab</option><option>Sindh</option><option>Khyber Pakhtunkhwa</option><option>Balochistan</option><option>Islamabad Capital Territory</option></select></label>
                <label className="grid gap-2 text-xs font-bold">City<input required autoComplete="address-level2" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="Lahore" /></label>
                <label className="grid gap-2 text-xs font-bold">Postal code<input required autoComplete="postal-code" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="54000" /></label>
                <label className="grid gap-2 text-xs font-bold">Order notes<input className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="Optional delivery note" /></label>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 sm:p-8">
              <h2 className="font-black">Payment method</h2>
              <div className="mt-5 grid gap-3">
                <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 ${payment === "cod" ? "border-[#466c42] bg-[#f4f8ed]" : "border-black/10"}`}><input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} /><Truck size={20} /><span><span className="block text-sm font-bold">Cash on delivery</span><span className="text-xs text-black/45">Pay when your order arrives</span></span></label>
                <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 ${payment === "online" ? "border-[#466c42] bg-[#f4f8ed]" : "border-black/10"}`}><input type="radio" name="payment" checked={payment === "online"} onChange={() => setPayment("online")} /><CreditCard size={20} /><span><span className="block text-sm font-bold">Online payment</span><span className="text-xs text-black/45">Gateway connection follows in the backend phase</span></span></label>
              </div>
            </section>

            {reviewed && <div role="status" className="flex gap-3 rounded-2xl border border-[#466c42]/25 bg-[#f4f8ed] p-5 text-sm leading-6"><CheckCircle2 className="mt-0.5 shrink-0 text-[#466c42]" size={20} /><p><strong>Frontend validation complete.</strong> Order submission and payment processing will activate when the secure backend is connected.</p></div>}
            <button type="submit" className="focus-ring flex items-center justify-center gap-2 rounded-full bg-[#182019] px-6 py-4 text-sm font-black text-white hover:bg-[#466c42]"><LockKeyhole size={17} /> Review secure order</button>
          </form>
        </div>

        <aside className="rounded-2xl bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-black">Your order</h2>
          <div className="mt-5 grid gap-4 border-b border-black/10 pb-5">
            {orderItems.map(({ product, variant, variantId, quantity }) => { const unitPrice = product.price + (variant?.priceDelta ?? 0); return <div key={`${product.id}:${variantId ?? "default"}`} className="flex justify-between gap-4 text-sm"><span className="text-black/60">{product.name}{variant ? ` · ${variant.value}` : ""} <span className="text-black/35">× {quantity}</span></span><span className="shrink-0 font-bold">{formatPrice(unitPrice * quantity)}</span></div>; })}
          </div>
          <div className="mt-5 flex rounded-full border border-black/15 p-1"><input value={coupon} onChange={(event) => { setCoupon(event.target.value); setCouponApplied(false); }} aria-label="Coupon code" placeholder="Coupon code" className="min-w-0 flex-1 bg-transparent px-3 text-xs outline-none" /><button type="button" onClick={() => setCouponApplied(coupon.trim().toUpperCase() === "EVSTART")} className="rounded-full bg-[#182019] px-4 py-2 text-xs font-bold text-white">Apply</button></div>{coupon && !couponApplied && coupon.trim().toUpperCase() !== "EVSTART" && <p className="mt-2 text-xs text-red-700">Try demo code EVSTART.</p>}{couponApplied && <p className="mt-2 text-xs font-bold text-[#466c42]">EVSTART applied: 5% off, up to PKR 10,000.</p>}
          <div className="mt-5 grid gap-3 text-sm"><div className="flex justify-between text-black/55"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between text-black/55"><span>Delivery</span><span>{delivery === 0 ? "Free" : formatPrice(delivery)}</span></div>{discount > 0 && <div className="flex justify-between text-[#466c42]"><span>Discount</span><span>−{formatPrice(discount)}</span></div>}<div className="flex justify-between border-t border-black/10 pt-4 text-base font-black"><span>Total</span><span>{formatPrice(total)}</span></div></div>
          <p className="mt-6 flex items-center gap-2 text-xs text-black/40"><LockKeyhole size={14} /> Your checkout details will be processed securely.</p>
        </aside>
      </div>
    </div>
  );
}
