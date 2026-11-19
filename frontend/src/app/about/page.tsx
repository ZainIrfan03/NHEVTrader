import type { Metadata } from "next";
import Link from "next/link";
import { BatteryCharging, BadgeCheck, HeartHandshake } from "lucide-react";
import { PageIntro } from "@/components/content/PageIntro";

export const metadata: Metadata = { title: "About us", description: "Learn how NH EV Trader makes electric mobility practical for drivers across Pakistan." };

export default function AboutPage() {
  const values = [{ icon: BadgeCheck, title: "Curated, not crowded", text: "We focus on useful EV products with clear specifications and ownership value." }, { icon: BatteryCharging, title: "Built around real life", text: "From home charging to motorway range, recommendations start with how you actually drive." }, { icon: HeartHandshake, title: "Support beyond checkout", text: "Helpful guidance continues after delivery, without jargon or pressure." }];
  return <div className="page-shell py-16 sm:py-24"><PageIntro eyebrow="About NH EV Trader" title="Electric mobility, made practical." description="We’re building a simpler way to discover, compare and own electric mobility products in Pakistan—with clear information and human guidance at every step." /><section className="mt-16 grid gap-5 md:grid-cols-3">{values.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl bg-white p-7"><Icon size={25} className="text-[#466c42]" /><h2 className="display mt-12 text-3xl">{title}</h2><p className="mt-3 text-sm leading-6 text-black/55">{text}</p></article>)}</section><section className="mt-20 grid gap-10 border-y border-black/10 py-16 md:grid-cols-2 md:items-center"><h2 className="display text-4xl sm:text-5xl">A more confident move to electric.</h2><div><p className="text-sm leading-7 text-black/60">Our storefront brings vehicles, charging hardware and road essentials together in one considered collection. As the platform grows, Payload CMS will keep product information, inventory and guidance accurate from one source.</p><Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#182019] px-6 py-3.5 text-sm font-black text-white">Explore the range</Link></div></section></div>;
}
