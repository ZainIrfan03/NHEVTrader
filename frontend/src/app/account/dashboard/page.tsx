"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ChevronDown, Heart, LoaderCircle, LogOut, MapPin, Package, Pencil, Plus, UserRound, X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";

type OrderMedia = {
  alt?: string | null;
  cloudinaryURL?: string | null;
  url?: string | null;
};

type OrderProduct = {
  id: string;
  title: string;
  slug: string;
  images?: Array<{ image: string | OrderMedia; alt?: string | null }> | null;
};

type AccountOrder = {
  id: string;
  orderNumber: string;
  items?: Array<{
    id?: string | null;
    product: string | OrderProduct;
    productName: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }> | null;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: "cod" | "online";
  paymentStatus: string;
  orderStatus: string;
  shippingAddress?: {
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    province: string;
    postalCode?: string | null;
  } | null;
  createdAt: string;
};

const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const backendOrigin = new URL(apiURL).origin;

function getOrderItemImage(product: string | OrderProduct) {
  if (typeof product === "string") return "/images/hero-ev.png";
  const media = product.images?.[0]?.image;
  if (!media || typeof media === "string") return "/images/hero-ev.png";
  const source = media.cloudinaryURL || media.url;
  if (!source) return "/images/hero-ev.png";
  return source.startsWith("http://") || source.startsWith("https://")
    ? source
    : new URL(source, backendOrigin).toString();
}

function getOrderStatusStyle(status: string) {
  if (status === "cancelled") return "bg-red-50 text-red-700";
  if (status === "delivered") return "bg-emerald-50 text-emerald-700";
  if (status === "shipped" || status === "processing") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
}

type SavedAddress = {
  id?: string | null;
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  province: string;
  postalCode?: string | null;
  isDefault?: boolean | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, signOut, refresh } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<{ address: SavedAddress; index: number } | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);

  const toggleOrder = (orderId: string) => {
    setExpandedOrderIds((current) => current.includes(orderId)
      ? current.filter((id) => id !== orderId)
      : [...current, orderId]);
  };

  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    fetch("/api/account/orders", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { docs?: AccountOrder[] }) => setOrders(payload.docs || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  const cancelOrder = async (order: AccountOrder) => {
    if (!window.confirm(`Cancel order ${order.orderNumber}? Reserved stock will be released.`)) return;
    setCancellingOrderId(order.id);
    setOrderMessage(null);
    try {
      const response = await fetch("/api/account/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setOrderMessage({ type: "error", text: payload.error || "Order could not be cancelled." });
        return;
      }
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, orderStatus: "cancelled" } : item));
      setOrderMessage({ type: "success", text: `${order.orderNumber} has been cancelled.` });
    } catch {
      setOrderMessage({ type: "error", text: "Order service is unavailable. Please try again." });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressSaving(true);
    setAddressMessage(null);
    const form = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(form.entries());
    const response = await fetch("/api/account/address", {
      method: editingAddress ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingAddress ? {
        ...formValues,
        addressId: editingAddress.address.id,
        addressIndex: editingAddress.index,
      } : formValues),
    });
    const payload = (await response.json()) as { error?: string };
    setAddressSaving(false);
    if (!response.ok) {
      setAddressMessage(payload.error || "Address could not be saved.");
      return;
    }
    await refresh();
    setAddressMessage(editingAddress ? "Address updated." : "Address saved.");
    setShowAddressForm(false);
    setEditingAddress(null);
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
        {orderMessage && <p role="status" className={`mt-5 rounded-xl px-4 py-3 text-sm font-bold ${orderMessage.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{orderMessage.text}</p>}
        {ordersLoading ? <LoaderCircle className="mt-8 animate-spin text-[#466c42]" /> : orders.length ? <div className="mt-6 grid gap-5">{orders.map((order) => {
          const canCancel = ["pending", "confirmed"].includes(order.orderStatus) && order.paymentStatus !== "paid";
          const isExpanded = expandedOrderIds.includes(order.id);
          const detailsId = `order-details-${order.id}`;
          return <article key={order.id} className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${isExpanded ? "border-[#466c42]/35 shadow-[0_18px_45px_rgba(24,32,25,.08)]" : "border-black/10 hover:-translate-y-0.5 hover:border-[#466c42]/35 hover:shadow-[0_14px_35px_rgba(24,32,25,.09)]"}`}>
            <button type="button" onClick={() => toggleOrder(order.id)} aria-expanded={isExpanded} aria-controls={detailsId} className="focus-ring group flex w-full flex-wrap items-center justify-between gap-4 bg-[#f7f6f1] px-5 py-4 text-left transition-colors hover:bg-[#eef2e9] sm:px-6">
              <div><p className="text-xs font-bold uppercase tracking-[.12em] text-black/40">Order number</p><p className="mt-1 font-black">{order.orderNumber}</p></div>
              <div className="ml-auto text-right"><p className="text-xs text-black/45">Placed {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</p><p className="mt-1 font-black">{formatPrice(order.grandTotal)}</p></div>
              <div className="flex min-w-[110px] items-center justify-end gap-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${getOrderStatusStyle(order.orderStatus)}`}>{order.orderStatus}</span><ChevronDown size={20} className={`shrink-0 text-[#466c42] transition-transform duration-300 group-hover:scale-110 ${isExpanded ? "rotate-180" : ""}`} /></div>
            </button>
            {isExpanded && <div id={detailsId} className="animate-in fade-in slide-in-from-top-2 p-5 duration-300 sm:p-6">
              <div className="grid gap-4">{(order.items || []).map((item, itemIndex) => {
                const product = typeof item.product === "string" ? null : item.product;
                const content = <><div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#edf0e8]"><Image src={getOrderItemImage(item.product)} alt={product?.images?.[0]?.alt || item.productName} fill sizes="96px" className="object-cover" /></div><div className="min-w-0 flex-1"><h3 className="font-black text-[#182019]">{item.productName}</h3><p className="mt-1 text-sm text-black/50">{item.variantLabel}</p><p className="mt-1 text-sm text-black/50">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p></div><p className="font-black">{formatPrice(item.lineTotal)}</p></>;
                return product?.slug ? <Link key={item.id || `${item.productName}-${itemIndex}`} href={`/product/${product.slug}`} className="flex items-center gap-4 rounded-xl border border-black/8 p-3 transition hover:bg-[#faf9f5]">{content}</Link> : <div key={item.id || `${item.productName}-${itemIndex}`} className="flex items-center gap-4 rounded-xl border border-black/8 p-3">{content}</div>;
              })}</div>
              <div className="mt-5 grid gap-5 border-t border-black/10 pt-5 md:grid-cols-[1fr_280px]">
                <div className="text-sm leading-6 text-black/55"><p><strong className="text-black">Payment:</strong> {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online payment"} · <span className="capitalize">{order.paymentStatus}</span></p>{order.shippingAddress && <p className="mt-1"><strong className="text-black">Deliver to:</strong> {order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}, {order.shippingAddress.city}, {order.shippingAddress.province}{order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ""}</p>}</div>
                <div className="grid gap-2 text-sm"><div className="flex justify-between gap-4 text-black/55"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div><div className="flex justify-between gap-4 text-black/55"><span>Delivery</span><span>{order.deliveryFee ? formatPrice(order.deliveryFee) : "Free"}</span></div><div className="flex justify-between gap-4 border-t border-black/10 pt-2 text-base font-black"><span>Total</span><span>{formatPrice(order.grandTotal)}</span></div></div>
              </div>
              {canCancel && <div className="mt-5 flex justify-end border-t border-black/10 pt-5"><button type="button" onClick={() => cancelOrder(order)} disabled={cancellingOrderId === order.id} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-xs font-black text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60">{cancellingOrderId === order.id ? <LoaderCircle size={15} className="animate-spin" /> : <X size={15} />} {cancellingOrderId === order.id ? "Cancelling…" : "Cancel order"}</button></div>}
            </div>}
          </article>;
        })}</div> : <p className="mt-6 text-sm text-black/45">No orders yet. <Link href="/shop" className="font-bold text-black underline">Explore the shop</Link>.</p>}
      </section>

      <section className="mt-10 rounded-3xl bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#466c42]">Delivery details</p><h2 className="display mt-2 text-3xl">Saved addresses.</h2></div><button type="button" onClick={() => { setEditingAddress(null); setShowAddressForm(true); setAddressMessage(null); }} className="inline-flex items-center gap-2 rounded-full bg-[#182019] px-4 py-2.5 text-xs font-bold text-white"><Plus size={15} /> Add address</button></div>
        {user.addresses?.length ? <div className="mt-6 grid gap-4 md:grid-cols-2">{user.addresses.map((address, index) => <article key={address.id || `${address.addressLine1}-${index}`} className="rounded-2xl border border-black/10 p-5"><div className="flex items-start justify-between gap-4"><p className="text-xs font-black uppercase tracking-[.16em] text-[#466c42]">{address.label || "Address"}{address.isDefault ? " · Default" : ""}</p><button type="button" onClick={() => { setEditingAddress({ address, index }); setShowAddressForm(true); setAddressMessage(null); window.setTimeout(() => document.getElementById("address-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0); }} className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-xs font-bold hover:bg-[#f5f3ed]" aria-label={`Edit ${address.label || "address"}`}><Pencil size={13} /> Edit</button></div><p className="mt-3 font-bold">{address.recipientName}</p><p className="mt-1 text-sm leading-6 text-black/50">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />{address.city}, {address.province} {address.postalCode || ""}<br />{address.phone}</p></article>)}</div> : <p className="mt-6 text-sm text-black/45">No address saved yet.</p>}
        {showAddressForm && <form id="address-form" key={editingAddress?.address.id || `address-${editingAddress?.index ?? "new"}`} onSubmit={saveAddress} className="mt-7 grid gap-4 rounded-2xl bg-[#f5f3ed] p-5 sm:grid-cols-2"><div className="flex items-center justify-between sm:col-span-2"><h3 className="font-black">{editingAddress ? "Edit address" : "Add address"}</h3><button type="button" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="rounded-full p-2 hover:bg-black/5" aria-label="Close address form"><X size={17} /></button></div><label className="grid gap-2 text-xs font-bold">Label<input name="label" defaultValue={editingAddress?.address.label || "Home"} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Recipient name<input name="recipientName" required defaultValue={editingAddress?.address.recipientName || user.name} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Phone<input name="phone" required defaultValue={editingAddress?.address.phone || user.phone} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Street address<input name="addressLine1" required defaultValue={editingAddress?.address.addressLine1 || ""} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Address line 2<input name="addressLine2" defaultValue={editingAddress?.address.addressLine2 || ""} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">City<input name="city" required defaultValue={editingAddress?.address.city || ""} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Province<input name="province" required defaultValue={editingAddress?.address.province || ""} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold">Postal code<input name="postalCode" defaultValue={editingAddress?.address.postalCode || ""} className="rounded-xl border border-black/15 px-4 py-3 text-sm font-normal" /></label><div className="flex items-end"><button disabled={addressSaving} className="w-full rounded-full bg-[#182019] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{addressSaving ? "Saving…" : editingAddress ? "Update address" : "Save address"}</button></div></form>}
        {addressMessage && <p role="status" className="mt-4 text-sm font-bold text-[#466c42]">{addressMessage}</p>}
      </section>
    </div>
  );
}

