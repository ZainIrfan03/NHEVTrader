"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Heart, LoaderCircle, LogOut, MapPin, Package, Plus, UserRound } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";

type AccountOrder = {
  id: string;
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, signOut, refresh } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    fetch("/api/account/orders", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { docs?: AccountOrder[] }) => setOrders(payload.docs || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressSaving(true);
    setAddressMessage(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/account/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const payload = (await response.json()) as { error?: string };
    setAddressSaving(false);
    if (!response.ok) {
      setAddressMessage(payload.error || "Address could not be saved.");
      return;
    }
    await refresh();
    setAddressMessage("Address saved.");
    setShowAddressForm(false);
    event.currentTarget.reset();
  };

  if (isLoading) return <div className="page-shell grid min-h-[650px] place-items-center"><LoaderCircle className="animate-spin text-[#466c42]" size={30} /></div>;
  if (!user) return <div className="page-shell grid min-h-[650px] place-items-center py-16 text-center"><div><h1 className="display text-5xl">Sign in to your account.</h1><p className="mt-4 text-sm text-black/50">Your orders and saved addresses are protected.</p><Link href="/account" className="mt-7 inline-flex rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white">Sign in or register</Link></div></div>;

  return (
    <div className="page-shell py-14 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-full bg-[#c9ef6d]"><UserRound size={23} /></span><div><p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">Customer account</p><h1 className="display text-4xl">Welcome, {user.name}.</h1><p className="mt-1 text-sm text-black/45">{user.email} · {user.phone}</p></div></div>
        <button type="button" onClick={async () => { await signOut(); router.push("/account"); }} className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2.5 text-xs font-bold hover:bg-white"><LogOut size={15} /> Sign out</button>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <section className="rounded-2xl bg-white p-6"><Package size={22} className="text-[#466c42]" /><h2 className="mt-10 font-black">Orders</h2><p className="mt-2 text-sm text-black/45">{orders.length ? `${orders.length} ${orders.length === 1 ? "order" : "orders"}` : "No orders yet"}</p></section>
        <section className="rounded-2xl bg-white p-6"><MapPin size={22} className="text-[#466c42]" /><h2 className="mt-10 font-black">Addresses</h2><p className="mt-2 text-sm text-black/45">{user.addresses?.length ? `${user.addresses.length} saved` : "No saved address"}</p></section>
        <Link href="/wishlist" className="focus-ring rounded-2xl bg-white p-6 hover:-translate-y-1"><Heart size={22} className="text-[#466c42]" /><h2 className="mt-10 font-black">Saved items</h2><p className="mt-2 text-sm text-black/45">Open your wishlist</p></Link>
      </div>

      <section className="mt-10 rounded-3xl bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#466c42]">Order history</p><h2 className="display mt-2 text-3xl">Your orders.</h2></div></div>
        {ordersLoading ? <LoaderCircle className="mt-8 animate-spin text-[#466c42]" /> : orders.length ? <div className="mt-6 divide-y divide-black/10">{orders.map((order) => <div key={order.id} className="grid gap-2 py-4 text-sm sm:grid-cols-4 sm:items-center"><strong>{order.orderNumber}</strong><span className="text-black/50">{new Date(order.createdAt).toLocaleDateString("en-PK")}</span><span className="capitalize text-black/50">{order.orderStatus}</span><span className="font-bold sm:text-right">{formatPrice(order.grandTotal)}</span></div>)}</div> : <p className="mt-6 text-sm text-black/45">No orders yet. <Link href="/shop" className="font-bold text-black underline">Explore the shop</Link>.</p>}
      </section>

      <section className="mt-10 rounded-3xl bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#466c42]">Delivery details</p><h2 className="display mt-2 text-3xl">Saved addresses.</h2></div><button type="button" onClick={() => setShowAddressForm((value) => !value)} className="inline-flex items-center gap-2 rounded-full bg-[#182019] px-4 py-2.5 text-xs font-bold text-white"><Plus size={15} /> Add address</button></div>
        {user.addresses?.length ? <div className="mt-6 grid gap-4 md:grid-cols-2">{user.addresses.map((address, index) => <article key={address.id || `${address.addressLine1}-${index}`} className="rounded-2xl border border-black/10 p-5"><p className="text-xs font-black uppercase tracking-[.16em] text-[#466c42]">{address.label || "Address"}{address.isDefault ? " · Default" : ""}</p><p className="mt-3 font-bold">{address.recipientName}</p><p className="mt-1 text-sm leading-6 text-black/50">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />{address.city}, {address.province} {address.postalCode || ""}<br />{address.phone}</p></article>)}</div> : <p className="mt-6 text-sm text-black/45">No address saved yet.</p>}
        {showAddressForm && <form onSubmit={saveAddress} className="mt-7 grid gap-4 rounded-2xl bg-[#f5f3ed] p-5 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold">Label<input name="label" defaultValue="Home" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Recipient name<input name="recipientName" required defaultValue={user.name} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Phone<input name="phone" required defaultValue={user.phone} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Street address<input name="addressLine1" required className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">City<input name="city" required className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Province<input name="province" required className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Postal code<input name="postalCode" className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><div className="flex items-end"><button disabled={addressSaving} className="w-full rounded-full bg-[#182019] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{addressSaving ? "Saving…" : "Save address"}</button></div></form>}
        {addressMessage && <p role="status" className="mt-4 text-sm font-bold text-[#466c42]">{addressMessage}</p>}
      </section>
    </div>
  );
}

