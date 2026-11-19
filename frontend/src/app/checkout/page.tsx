"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, Truck } from "lucide-react";
import { FormEvent, useState } from "react";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";
import { useCatalog } from "@/providers/CatalogProvider";
import { useCart } from "@/providers/CartProvider";

type PlacedOrder = {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
};

type CheckoutResponse = { order?: PlacedOrder; error?: string };

export default function CheckoutPage() {
  const products = useCatalog();
  const { user } = useAuth();
  const { items, isReady, clearCart } = useCart();
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const orderItems = items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    return product && variant
      ? [{ product, variant, variantId: item.variantId, quantity: item.quantity }]
      : [];
  });
  const subtotal = orderItems.reduce(
    (sum, item) => sum + (item.product.price + (item.variant.priceDelta ?? 0)) * item.quantity,
    0,
  );
  const delivery = subtotal >= 500000 ? 0 : 2500;
  const total = subtotal + delivery;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (payment !== "cod") {
      setError("Online payments will activate after gateway onboarding. Please select Cash on Delivery.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const checkout = {
      customerName: String(form.get("customerName") || ""),
      customerPhone: String(form.get("customerPhone") || ""),
      customerEmail: String(form.get("customerEmail") || ""),
      addressLine1: String(form.get("addressLine1") || ""),
      province: String(form.get("province") || ""),
      city: String(form.get("city") || ""),
      postalCode: String(form.get("postalCode") || ""),
      notes: String(form.get("notes") || ""),
      paymentMethod: payment,
      items: orderItems.map(({ product, variant, quantity }) => ({
        productId: product.id,
        variantCode: variant.id,
        quantity,
      })),
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkout),
      });
      const payload = (await response.json()) as CheckoutResponse;
      if (!response.ok || !payload.order) throw new Error(payload.error || "Your order could not be placed.");
      setPlacedOrder(payload.order);
      clearCart();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Your order could not be placed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady) {
    return <div className="page-shell min-h-[650px] py-16"><div className="h-96 animate-pulse rounded-3xl bg-black/5" /></div>;
  }

  if (placedOrder) {
    return (
      <div className="page-shell grid min-h-[680px] place-items-center py-16 text-center">
        <div className="max-w-xl rounded-3xl bg-white p-8 sm:p-12">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f4f8ed] text-[#466c42]"><CheckCircle2 size={36} /></span>
          <p className="mt-7 text-xs font-black uppercase tracking-[.22em] text-[#466c42]">Order confirmed</p>
          <h1 className="display mt-3 text-5xl">Thank you.</h1>
          <p className="mt-4 text-sm leading-6 text-black/55">Your order <strong className="text-black">{placedOrder.orderNumber}</strong> has been received. Our team will contact you before dispatch.</p>
          <p className="mt-6 text-xl font-black">{formatPrice(placedOrder.grandTotal)}</p>
          <Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (!orderItems.length) {
    return <div className="page-shell grid min-h-[650px] place-items-center py-16 text-center"><div><h1 className="display text-5xl">Nothing to check out yet.</h1><p className="mt-4 text-sm text-black/50">Add an available product option to your cart before continuing.</p><Link href="/shop" className="mt-7 inline-flex rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white">Browse products</Link></div></div>;
  }

  return (
    <div className="page-shell py-10 sm:py-16">
      <Link href="/cart" className="focus-ring inline-flex items-center gap-2 rounded-sm text-sm font-bold text-black/55 hover:text-black"><ArrowLeft size={16} /> Back to cart</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_390px] lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#466c42]">Secure checkout</p>
          <h1 className="display mt-3 text-5xl sm:text-6xl">Delivery details.</h1>
          <form key={user?.id || "guest"} onSubmit={handleSubmit} className="mt-10 grid gap-8">
            <section className="rounded-2xl bg-white p-6 sm:p-8">
              <h2 className="font-black">Contact information</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold">Full name<input name="customerName" required autoComplete="name" defaultValue={user?.name || ""} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="Your full name" /></label>
                <label className="grid gap-2 text-xs font-bold">Phone number<input name="customerPhone" required type="tel" autoComplete="tel" defaultValue={user?.phone || ""} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="03XX XXXXXXX" /></label>
                <label className="grid gap-2 text-xs font-bold sm:col-span-2">Email address<input name="customerEmail" required type="email" autoComplete="email" defaultValue={user?.email || ""} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="you@example.com" /></label>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 sm:p-8">
              <h2 className="font-black">Delivery address</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold sm:col-span-2">Street address<input name="addressLine1" required autoComplete="street-address" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="House, street and area" /></label>
                <label className="grid gap-2 text-xs font-bold">Province<select name="province" required autoComplete="address-level1" className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" defaultValue=""><option value="" disabled>Select province</option><option>Punjab</option><option>Sindh</option><option>Khyber Pakhtunkhwa</option><option>Balochistan</option><option>Islamabad Capital Territory</option></select></label>
                <label className="grid gap-2 text-xs font-bold">City<input name="city" required autoComplete="address-level2" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="Lahore" /></label>
                <label className="grid gap-2 text-xs font-bold">Postal code<input name="postalCode" autoComplete="postal-code" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="54000" /></label>
                <label className="grid gap-2 text-xs font-bold">Order notes<input name="notes" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal outline-none focus:border-[#466c42]" placeholder="Optional delivery note" /></label>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 sm:p-8">
              <h2 className="font-black">Payment method</h2>
              <div className="mt-5 grid gap-3">
                <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 ${payment === "cod" ? "border-[#466c42] bg-[#f4f8ed]" : "border-black/10"}`}><input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} /><Truck size={20} /><span><span className="block text-sm font-bold">Cash on delivery</span><span className="text-xs text-black/45">Pay when your order arrives</span></span></label>
                <label className="flex cursor-not-allowed items-center gap-4 rounded-xl border border-black/10 p-4 opacity-50"><input type="radio" name="payment" disabled checked={payment === "online"} onChange={() => setPayment("online")} /><CreditCard size={20} /><span><span className="block text-sm font-bold">Online payment</span><span className="text-xs text-black/45">Available after gateway onboarding</span></span></label>
              </div>
            </section>

            {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-800">{error}</div>}
            <button type="submit" disabled={submitting} className="focus-ring flex items-center justify-center gap-2 rounded-full bg-[#182019] px-6 py-4 text-sm font-black text-white hover:bg-[#466c42] disabled:cursor-wait disabled:opacity-60">
              {submitting ? <LoaderCircle className="animate-spin" size={17} /> : <LockKeyhole size={17} />}
              {submitting ? "Placing order…" : "Place secure order"}
            </button>
          </form>
        </div>

        <aside className="rounded-2xl bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-black">Your order</h2>
          <div className="mt-5 grid gap-4 border-b border-black/10 pb-5">
            {orderItems.map(({ product, variant, variantId, quantity }) => {
              const unitPrice = product.price + (variant.priceDelta ?? 0);
              return <div key={`${product.id}:${variantId}`} className="flex justify-between gap-4 text-sm"><span className="text-black/60">{product.name} · {variant.value} <span className="text-black/35">× {quantity}</span></span><span className="shrink-0 font-bold">{formatPrice(unitPrice * quantity)}</span></div>;
            })}
          </div>
          <div className="mt-5 grid gap-3 text-sm"><div className="flex justify-between text-black/55"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between text-black/55"><span>Delivery</span><span>{delivery === 0 ? "Free" : formatPrice(delivery)}</span></div><div className="flex justify-between border-t border-black/10 pt-4 text-base font-black"><span>Total</span><span>{formatPrice(total)}</span></div></div>
          <p className="mt-6 flex items-center gap-2 text-xs text-black/40"><LockKeyhole size={14} /> Prices and stock are verified securely by the server.</p>
        </aside>
      </div>
    </div>
  );
}
