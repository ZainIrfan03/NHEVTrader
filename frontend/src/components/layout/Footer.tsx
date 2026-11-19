import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteSettingsContent } from "@/types/content";
import { Logo } from "./Logo";

const shopLinks = [{ href: "/shop", label: "Shop all" }, { href: "/shop?category=Vehicles", label: "Electric vehicles" }, { href: "/shop?category=Chargers", label: "Home charging" }, { href: "/shop?category=Accessories", label: "Accessories" }];
const companyLinks = [{ href: "/about", label: "About us" }, { href: "/contact", label: "Contact" }, { href: "/faq", label: "FAQs" }, { href: "/account", label: "Your account" }];

export function Footer({ settings }: { settings?: SiteSettingsContent | null }) {
  const email = settings?.supportEmail || "hello@nhevtrader.com";
  return <footer className="bg-[#182019] text-white"><div className="page-shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]"><div><Logo /><p className="mt-5 max-w-sm text-sm leading-6 text-white/60">Electric mobility, made practical. Curated vehicles, charging equipment and dependable support for drivers across Pakistan.</p></div><FooterLinks title="Shop" links={shopLinks} /><FooterLinks title="Company" links={companyLinks} /><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#c9ef6d]">Need advice?</p><a href={`mailto:${email}`} className="mt-4 inline-flex items-center gap-2 border-b border-white/30 pb-1 text-sm">{email} <ArrowUpRight size={15} /></a>{settings?.supportPhone && <p className="mt-3 text-sm text-white/60">{settings.supportPhone}</p>}<p className="mt-3 text-sm text-white/50">Mon–Sat · 10:00–18:00</p></div></div><div className="page-shell flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-white/40 md:flex-row md:items-center md:justify-between"><span>© 2026 {settings?.storeName || "NH EV Trader"}</span><div className="flex flex-wrap gap-4"><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link><Link href="/policies/returns">Returns</Link></div></div></footer>;
}

function FooterLinks({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#c9ef6d]">{title}</p><div className="mt-4 grid gap-3 text-sm text-white/70">{links.map((link) => <Link key={link.href} href={link.href} className="hover:text-white">{link.label}</Link>)}</div></div>;
}
