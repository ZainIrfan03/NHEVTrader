import Link from "next/link";
import { ArrowRight, BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Hero } from "@/components/home/Hero";
import { getCatalogProducts } from "@/lib/catalog";

const promises = [
  { icon: BadgeCheck, title: "Carefully selected", text: "Practical products chosen for local EV ownership." },
  { icon: ShieldCheck, title: "Secure checkout", text: "Protected checkout with COD and online payment options." },
  { icon: Truck, title: "Nationwide delivery", text: "Clear fulfilment updates from order to doorstep." },
  { icon: Headphones, title: "Human guidance", text: "Helpful answers before and after your purchase." },
];

export default async function HomePage() {
  const products = await getCatalogProducts();

  return (
    <>
      <Hero />
      <section className="page-shell py-20"><div className="mb-9 flex items-end justify-between gap-6"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#466c42]">Start your journey</p><h2 className="display mt-3 text-4xl sm:text-5xl">Everything EV, in one place.</h2></div><Link href="/shop" className="hidden items-center gap-2 border-b border-black/30 pb-1 text-sm font-bold sm:flex">Shop all <ArrowRight size={16} /></Link></div><CategoryGrid /></section>
      <section className="bg-white py-20"><div className="page-shell"><div className="mb-9 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#466c42]">Curated for the road</p><h2 className="display mt-3 text-4xl sm:text-5xl">Featured picks.</h2></div><Link href="/shop" className="text-sm font-bold">View collection →</Link></div><div className="grid gap-x-5 gap-y-10 md:grid-cols-3">{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}</div></div></section>
      <section className="page-shell py-20"><div className="grid divide-y divide-black/10 border-y border-black/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">{promises.map(({ icon: Icon, title, text }) => <div className="px-5 py-8 first:pl-0" key={title}><Icon className="text-[#466c42]" size={24} /><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-black/55">{text}</p></div>)}</div></section>
      <section className="page-shell pb-20"><div className="overflow-hidden rounded-3xl bg-[#243c2c] px-6 py-14 text-center text-white sm:px-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#c9ef6d]">Not sure where to start?</p><h2 className="display mx-auto mt-4 max-w-2xl text-4xl sm:text-5xl">Let’s make your move to electric feel simple.</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/65">Tell us about your driving and parking setup. We’ll help you shortlist the vehicle and charger that fit.</p><a href="mailto:hello@nhevtrader.com" className="mt-7 inline-flex rounded-full bg-[#c9ef6d] px-6 py-3.5 text-sm font-black text-[#182019]">Talk to an EV advisor</a></div></section>
    </>
  );
}
